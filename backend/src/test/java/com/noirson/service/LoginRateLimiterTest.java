package com.noirson.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicLong;

import org.junit.jupiter.api.Test;

class LoginRateLimiterTest {
    private final MutableClock clock = new MutableClock();
    private final LoginRateLimiter limiter = new LoginRateLimiter(clock, 100);

    @Test
    void sameEmailAndIpBlocksSixthAttemptAndReturnsRetryAfter() {
        for (int i = 0; i < 5; i++) fail(i % 2 == 0 ? "  USER@example.com " : "user@example.com", "127.0.0.1");
        clock.advance(61_000);
        LoginRateLimiter.Attempt blocked = limiter.reserve("user@example.com", "127.0.0.1");
        assertFalse(blocked.allowed());
        assertEquals(239, blocked.retryAfterSeconds());
    }

    @Test
    void differentEmailsShareIpBudget() {
        for (int i = 0; i < 30; i++) fail("user" + i + "@example.com", "127.0.0.1");
        LoginRateLimiter.Attempt blocked = limiter.reserve("another@example.com", "127.0.0.1");
        assertFalse(blocked.allowed());
        assertEquals(300, blocked.retryAfterSeconds());
        assertTrue(limiter.reserve("another@example.com", "127.0.0.2").allowed());
    }

    @Test
    void successClearsOnlyPairFailures() {
        for (int i = 0; i < 5; i++) fail("user@example.com", "127.0.0.1");
        // 另一 IP 的成功登入不會解除原 IP 的封鎖。
        LoginRateLimiter.Attempt success = limiter.reserve("user@example.com", "127.0.0.2");
        limiter.complete(success, true);
        assertFalse(limiter.reserve("user@example.com", "127.0.0.1").allowed());

        clock.advance(300_000);
        for (int i = 0; i < 4; i++) fail("user@example.com", "127.0.0.1");
        success = limiter.reserve("user@example.com", "127.0.0.1");
        limiter.complete(success, true);
        for (int i = 0; i < 5; i++) fail("user@example.com", "127.0.0.1");
        assertFalse(limiter.reserve("user@example.com", "127.0.0.1").allowed());

        // IP 總失敗數仍保留：另外 21 個帳號可失敗，第 22 個被擋。
        for (int i = 0; i < 21; i++) fail("other" + i + "@example.com", "127.0.0.1");
        assertFalse(limiter.reserve("last@example.com", "127.0.0.1").allowed());
    }

    @Test
    void slidingWindowExpiresOldFailures() {
        fail("user@example.com", "127.0.0.1");
        clock.advance(150_000);
        for (int i = 0; i < 4; i++) fail("user@example.com", "127.0.0.1");
        assertFalse(limiter.reserve("user@example.com", "127.0.0.1").allowed());
        clock.advance(150_000);
        LoginRateLimiter.Attempt allowed = limiter.reserve("user@example.com", "127.0.0.1");
        assertTrue(allowed.allowed());
        limiter.complete(allowed, false);
        assertFalse(limiter.reserve("user@example.com", "127.0.0.1").allowed());
    }

    @Test
    void concurrentRequestsReserveOnlyFiveSlots() throws Exception {
        int count = 20;
        CountDownLatch start = new CountDownLatch(1);
        try (ExecutorService executor = Executors.newFixedThreadPool(count)) {
            List<Future<LoginRateLimiter.Attempt>> futures = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                futures.add(executor.submit(() -> {
                    start.await();
                    return limiter.reserve("user@example.com", "127.0.0.1");
                }));
            }
            start.countDown();
            int admitted = 0;
            for (Future<LoginRateLimiter.Attempt> future : futures) {
                LoginRateLimiter.Attempt attempt = future.get();
                if (attempt.allowed()) {
                    admitted++;
                    limiter.complete(attempt, false);
                } else {
                    assertEquals(300, attempt.retryAfterSeconds());
                }
            }
            assertEquals(5, admitted);
        }
    }

    @Test
    void capacityRejectsNewKeysThenReusesExpiredEntries() {
        LoginRateLimiter small = new LoginRateLimiter(clock, 2);
        fail(small, "one@example.com", "127.0.0.1");
        fail(small, "two@example.com", "127.0.0.1");
        LoginRateLimiter.Attempt blocked = small.reserve("three@example.com", "127.0.0.1");
        assertFalse(blocked.allowed());
        assertEquals(300, blocked.retryAfterSeconds());
        LoginRateLimiter.Attempt existing = small.reserve("one@example.com", "127.0.0.1");
        assertTrue(existing.allowed());
        small.complete(existing, true);
        clock.advance(300_000);
        assertTrue(small.reserve("three@example.com", "127.0.0.1").allowed());
    }

    @Test
    void expiredPendingKeepsFailureBudgetUntilSlidingWindowEnds() {
        for (int i = 0; i < 5; i++) assertTrue(limiter.reserve("slow@example.com", "127.0.0.1").allowed());
        clock.advance(30_000);
        LoginRateLimiter.Attempt blocked = limiter.reserve("slow@example.com", "127.0.0.1");
        assertFalse(blocked.allowed());
        assertEquals(270, blocked.retryAfterSeconds());
        clock.advance(269_000);
        assertEquals(1, limiter.reserve("slow@example.com", "127.0.0.1").retryAfterSeconds());
        clock.advance(1_000);
        assertTrue(limiter.reserve("slow@example.com", "127.0.0.1").allowed());
    }

    @Test
    void lateFailureIsCountedOnceWithoutReleasingAnotherReservation() {
        LoginRateLimiter.Attempt old = limiter.reserve("slow@example.com", "127.0.0.1");
        LoginRateLimiter.Attempt other = limiter.reserve("slow@example.com", "127.0.0.1");
        clock.advance(300_000);
        LoginRateLimiter.Attempt current = limiter.reserve("slow@example.com", "127.0.0.1");
        assertTrue(current.allowed());
        limiter.complete(old, false);
        limiter.complete(old, false);
        limiter.complete(current, false);
        limiter.complete(other, false);
        fail("slow@example.com", "127.0.0.1");
        fail("slow@example.com", "127.0.0.1");
        assertFalse(limiter.reserve("slow@example.com", "127.0.0.1").allowed());
    }

    @Test
    void lateSuccessRemovesOnlyItsIpProvisionalFailure() {
        LoginRateLimiter.Attempt success = limiter.reserve("a@example.com", "127.0.0.1");
        LoginRateLimiter.Attempt failed = limiter.reserve("b@example.com", "127.0.0.1");
        clock.advance(30_000);
        limiter.complete(success, true);
        limiter.complete(failed, false);
        for (int i = 0; i < 29; i++) fail("other" + i + "@example.com", "127.0.0.1");
        assertFalse(limiter.reserve("last@example.com", "127.0.0.1").allowed());
        assertTrue(limiter.reserve("a@example.com", "127.0.0.2").allowed());
    }

    @Test
    void manySlowRequestsCannotReuseQuotaAtLeaseExpiry() {
        for (int i = 0; i < 30; i++) {
            assertTrue(limiter.reserve("slow" + i + "@example.com", "127.0.0.1").allowed());
        }
        clock.advance(30_000);
        LoginRateLimiter.Attempt blocked = limiter.reserve("new@example.com", "127.0.0.1");
        assertFalse(blocked.allowed());
        assertEquals(270, blocked.retryAfterSeconds());
        clock.advance(270_000);
        for (int i = 0; i < 30; i++) {
            assertTrue(limiter.reserve("later" + i + "@example.com", "127.0.0.1").allowed());
        }
        assertFalse(limiter.reserve("extra@example.com", "127.0.0.1").allowed());
    }

    @Test
    void cleanupRemovesExpiredPendingAndLateCompletionCannotAffectNewKey() {
        LoginRateLimiter small = new LoginRateLimiter(clock, 1);
        LoginRateLimiter.Attempt old = small.reserve("old@example.com", "127.0.0.1");
        clock.advance(300_000);
        LoginRateLimiter.Attempt current = small.reserve("new@example.com", "127.0.0.1");
        assertTrue(current.allowed());
        small.complete(old, false);
        assertFalse(small.reserve("new@example.com", "127.0.0.1").allowed());
        small.cancel(current);
        assertFalse(small.reserve("another@example.com", "127.0.0.1").allowed());
        clock.advance(300_000);
        assertTrue(small.reserve("another@example.com", "127.0.0.1").allowed());
    }

    @Test
    void concurrentLateCompletionsKeepExactlyFiveFailures() throws Exception {
        List<LoginRateLimiter.Attempt> attempts = new ArrayList<>();
        for (int i = 0; i < 5; i++) attempts.add(limiter.reserve("slow@example.com", "127.0.0.1"));
        clock.advance(30_000);
        CountDownLatch start = new CountDownLatch(1);
        try (ExecutorService executor = Executors.newFixedThreadPool(6)) {
            List<Future<?>> futures = new ArrayList<>();
            for (LoginRateLimiter.Attempt attempt : attempts) {
                futures.add(executor.submit(() -> {
                    start.await();
                    limiter.complete(attempt, false);
                    return null;
                }));
            }
            futures.add(executor.submit(() -> {
                start.await();
                assertFalse(limiter.reserve("slow@example.com", "127.0.0.1").allowed());
                return null;
            }));
            start.countDown();
            for (Future<?> future : futures) future.get();
        }
        assertFalse(limiter.reserve("slow@example.com", "127.0.0.1").allowed());
        assertEquals(300, limiter.reserve("slow@example.com", "127.0.0.1").retryAfterSeconds());
    }

    private void fail(String email, String ip) {
        fail(limiter, email, ip);
    }

    private static void fail(LoginRateLimiter target, String email, String ip) {
        LoginRateLimiter.Attempt attempt = target.reserve(email, ip);
        assertTrue(attempt.allowed());
        target.complete(attempt, false);
    }

    private static final class MutableClock extends Clock {
        private final AtomicLong millis = new AtomicLong();

        void advance(long amount) {
            millis.addAndGet(amount);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return Instant.ofEpochMilli(millis.get());
        }

        @Override
        public long millis() {
            return millis.get();
        }
    }
}
