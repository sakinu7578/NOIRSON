package com.noirson.service;

import java.time.Clock;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class LoginRateLimiter {
    private static final long WINDOW_MILLIS = 5 * 60 * 1000;
    private static final long LEASE_MILLIS = 30 * 1000;
    private static final int PAIR_LIMIT = 5;
    private static final int IP_LIMIT = 30;
    private static final int MAX_KEYS = 10_000;
    private static final long CAPACITY_RETRY_SECONDS = 300;

    private final Clock clock;
    private final int maxKeys;
    private final Map<PairKey, Bucket> pairs = new HashMap<>();
    private final Map<String, Bucket> ips = new HashMap<>();
    private int requestsSinceCleanup;
    private long nextReservationId;
    private long overflowUntil;

    public LoginRateLimiter() {
        this(Clock.systemUTC(), MAX_KEYS);
    }

    LoginRateLimiter(Clock clock, int maxKeys) {
        this.clock = clock;
        this.maxKeys = maxKeys;
    }

    // 只在短暫的記憶體鎖內預留名額；資料庫查詢與 BCrypt 均在鎖外執行。
    public synchronized Attempt reserve(String email, String remoteAddress) {
        long now = clock.millis();
        if (++requestsSinceCleanup >= 100) {
            cleanup(now);
            requestsSinceCleanup = 0;
        }
        if (now < overflowUntil) {
            return new Attempt(null, retrySeconds(overflowUntil - now));
        }
        PairKey pairKey = new PairKey(email.trim().toLowerCase(Locale.ROOT), remoteAddress);
        Bucket pair = pairs.get(pairKey);
        Bucket ip = ips.get(remoteAddress);
        if (pair != null) pair.expire(now);
        if (ip != null) ip.expire(now);

        long pairRetry = pair == null ? 0 : pair.retryAfter(now, PAIR_LIMIT);
        long ipRetry = ip == null ? 0 : ip.retryAfter(now, IP_LIMIT);
        if (pairRetry > 0 || ipRetry > 0) {
            return new Attempt(null, Math.max(pairRetry, ipRetry));
        }
        // 容量已滿時先清掉過期鍵；仍無空間就明確拒絕，避免記憶體無限成長。
        if ((pair == null && pairs.size() >= maxKeys) || (ip == null && ips.size() >= maxKeys)) {
            cleanup(now);
            pair = pairs.get(pairKey);
            ip = ips.get(remoteAddress);
            if ((pair == null && pairs.size() >= maxKeys) || (ip == null && ips.size() >= maxKeys)) {
                return new Attempt(null, CAPACITY_RETRY_SECONDS);
            }
        }
        if (pair == null) {
            pair = new Bucket();
            pairs.put(pairKey, pair);
        }
        if (ip == null) {
            ip = new Bucket();
            ips.put(remoteAddress, ip);
        }
        Reservation reservation = new Reservation(++nextReservationId, pairKey, remoteAddress, pair, ip, now);
        pair.pending.add(reservation);
        ip.pending.add(reservation);
        return new Attempt(reservation, 0);
    }

    public synchronized void complete(Attempt attempt, boolean success) {
        finish(attempt, success);
    }

    public synchronized void cancel(Attempt attempt) {
        finish(attempt, null);
    }

    private void finish(Attempt attempt, Boolean success) {
        Reservation reservation = attempt.reservation;
        if (reservation == null || reservation.finished) return;
        reservation.finished = true;
        long now = clock.millis();
        // 租約到期後可能已被清理；只處理仍屬於目前 key 的桶，避免舊請求動到其他預留。
        Bucket pair = pairs.get(reservation.pairKey);
        Bucket ip = ips.get(reservation.remoteAddress);
        if (pair == reservation.pair) pair.release(reservation, now);
        if (ip == reservation.ip) ip.release(reservation, now);
        if (Boolean.TRUE.equals(success)) {
            if (pair != null) pair.failures.clear();
        } else if (Boolean.FALSE.equals(success)) {
            pair = bucketForFailure(pairs, reservation.pairKey, now);
            ip = bucketForFailure(ips, reservation.remoteAddress, now);
            if (pair != null) pair.addFailure(new Failure(reservation.id, now));
            if (ip != null) ip.addFailure(new Failure(reservation.id, now));
            // 容量已滿又無法記錄遲到失敗時，暫時全面拒絕新登入，不能漏計後直接放行。
            if (pair == null || ip == null) overflowUntil = Math.max(overflowUntil, now + WINDOW_MILLIS);
        }
        if (pair != null && pair.empty()) pairs.remove(reservation.pairKey, pair);
        if (ip != null && ip.empty()) ips.remove(reservation.remoteAddress, ip);
    }

    private <K> Bucket bucketForFailure(Map<K, Bucket> buckets, K key, long now) {
        Bucket bucket = buckets.get(key);
        if (bucket != null) return bucket;
        if (buckets.size() >= maxKeys) cleanup(now);
        if (buckets.size() >= maxKeys) return null;
        bucket = new Bucket();
        buckets.put(key, bucket);
        return bucket;
    }

    private static long retrySeconds(long remainingMillis) {
        return Math.max(1, (remainingMillis + 999) / 1000);
    }

    private void cleanup(long now) {
        removeExpired(pairs, now);
        removeExpired(ips, now);
    }

    private static <K> void removeExpired(Map<K, Bucket> buckets, long now) {
        Iterator<Bucket> iterator = buckets.values().iterator();
        while (iterator.hasNext()) {
            Bucket bucket = iterator.next();
            bucket.expire(now);
            if (bucket.empty()) iterator.remove();
        }
    }

    public static final class Attempt {
        private final Reservation reservation;
        private final long retryAfterSeconds;

        private Attempt(Reservation reservation, long retryAfterSeconds) {
            this.reservation = reservation;
            this.retryAfterSeconds = retryAfterSeconds;
        }

        public boolean allowed() {
            return reservation != null;
        }

        public long retryAfterSeconds() {
            return retryAfterSeconds;
        }
    }

    private record PairKey(String email, String remoteAddress) {}
    private static final class Reservation {
        private final long id;
        private final PairKey pairKey;
        private final String remoteAddress;
        private final Bucket pair;
        private final Bucket ip;
        private final long startedAt;
        private final long expiresAt;
        private boolean finished;

        private Reservation(long id, PairKey pairKey, String remoteAddress, Bucket pair, Bucket ip, long startedAt) {
            this.id = id;
            this.pairKey = pairKey;
            this.remoteAddress = remoteAddress;
            this.pair = pair;
            this.ip = ip;
            this.startedAt = startedAt;
            this.expiresAt = startedAt + LEASE_MILLIS;
        }
    }

    private record Failure(long reservationId, long at) {}

    private static final class Bucket {
        private final ArrayList<Failure> failures = new ArrayList<>();
        private final ArrayDeque<Reservation> pending = new ArrayDeque<>();

        private void expire(long now) {
            failures.removeIf(failure -> now - failure.at >= WINDOW_MILLIS);
            Iterator<Reservation> iterator = pending.iterator();
            while (iterator.hasNext()) {
                Reservation reservation = iterator.next();
                if (now >= reservation.expiresAt) {
                    iterator.remove();
                    // 逾時先視為失敗；遲到的完成結果會用 reservationId 修正此筆紀錄。
                    if (now - reservation.startedAt < WINDOW_MILLIS) {
                        addFailure(new Failure(reservation.id, reservation.startedAt));
                    }
                }
            }
        }

        private void release(Reservation reservation, long now) {
            expire(now);
            pending.remove(reservation);
            failures.removeIf(failure -> failure.reservationId == reservation.id);
        }

        private void addFailure(Failure failure) {
            failures.add(failure);
            // 遲到的請求可能同時完成；只需保留最新的 IP_LIMIT 筆，避免單一桶無限成長。
            if (failures.size() > IP_LIMIT) {
                int oldest = 0;
                for (int i = 1; i < failures.size(); i++) {
                    if (failures.get(i).at < failures.get(oldest).at) oldest = i;
                }
                failures.remove(oldest);
            }
        }

        private long retryAfter(long now, int limit) {
            if (failures.size() + pending.size() < limit) return 0;
            ArrayList<Long> timestamps = new ArrayList<>(failures.size() + pending.size());
            for (Failure failure : failures) timestamps.add(failure.at);
            for (Reservation reservation : pending) timestamps.add(reservation.startedAt);
            timestamps.sort(Long::compareTo);
            return retrySeconds(WINDOW_MILLIS - (now - timestamps.get(timestamps.size() - limit)));
        }

        private boolean empty() {
            return failures.isEmpty() && pending.isEmpty();
        }
    }
}
