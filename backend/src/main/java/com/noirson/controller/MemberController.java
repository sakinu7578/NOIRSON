package com.noirson.controller;

import com.noirson.dto.RegisterRequest;
import com.noirson.dto.RegisterResponse;
import com.noirson.dto.LoginRequest;
import com.noirson.dto.LoginResponse;
import com.noirson.dto.ChangePasswordRequest;
import com.noirson.dto.UpdateUsernameRequest;
import com.noirson.entity.Member;
import com.noirson.service.MemberService;
import com.noirson.service.LoginRateLimiter;
import com.noirson.service.SessionMemberService;
import com.noirson.service.MemberService.DuplicateEmailException;
import com.noirson.service.MemberService.InvalidCurrentPasswordException;
import com.noirson.service.MemberService.MemberNotFoundException;
import com.noirson.service.MemberService.SamePasswordException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class MemberController {
    private final MemberService memberService;
    private final SessionMemberService sessionMembers;
    private final LoginRateLimiter loginRateLimiter;

    public MemberController(MemberService memberService, SessionMemberService sessionMembers,
            LoginRateLimiter loginRateLimiter) {
        this.memberService = memberService;
        this.sessionMembers = sessionMembers;
        this.loginRateLimiter = loginRateLimiter;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        try {
            Member member = memberService.register(
                    request.username(),
                    request.email(),
                    request.password()
            );

            RegisterResponse response = new RegisterResponse(
                    member.getId(),
                    member.getUsername(),
                    member.getEmail()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (DuplicateEmailException e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        LoginRateLimiter.Attempt attempt = null;
        boolean authenticated = false;
        boolean badCredentials = false;
        try {
            String email = memberService.validateLoginInput(request.email(), request.password());
            attempt = loginRateLimiter.reserve(email, httpRequest.getRemoteAddr());
            if (!attempt.allowed()) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .header("Retry-After", Long.toString(attempt.retryAfterSeconds()))
                        .body("登入嘗試過於頻繁，請稍後再試");
            }
            var member = memberService.login(email, request.password());
            if (member.isEmpty()) {
                badCredentials = true;
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email 或密碼錯誤");
            }
            // 已有 Session 時輪替 ID，避免沿用登入前的 Session ID。
            HttpSession session = httpRequest.getSession(false);
            if (session == null) {
                session = httpRequest.getSession(true);
            } else {
                httpRequest.changeSessionId();
            }
            sessionMembers.startSession(session, member.get());
            authenticated = true;
            return ResponseEntity.ok(new LoginResponse(member.get().getId(), member.get().getUsername(),
                    member.get().getEmail(), member.get().getRole()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } finally {
            if (attempt != null && attempt.allowed()) {
                if (authenticated || badCredentials) loginRateLimiter.complete(attempt, authenticated);
                else loginRateLimiter.cancel(attempt);
            }
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        return sessionMembers.currentMember(request)
                .<ResponseEntity<?>>map(member -> ResponseEntity.ok(
                        new LoginResponse(member.getId(), member.getUsername(), member.getEmail(), member.getRole())))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, HttpServletRequest httpRequest) {
        var member = sessionMembers.currentMember(httpRequest);
        if (member.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            memberService.changePassword(member.get().getId(), request.currentPassword(), request.newPassword(), request.confirmPassword());
            httpRequest.getSession(false).invalidate();
            return ResponseEntity.noContent().build();
        } catch (InvalidCurrentPasswordException e) {
            return ResponseEntity.badRequest().body("目前密碼錯誤");
        } catch (SamePasswordException e) {
            return ResponseEntity.badRequest().body("新密碼與舊密碼相同");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateUsername(@RequestBody UpdateUsernameRequest request, HttpServletRequest httpRequest) {
        var member = sessionMembers.currentMember(httpRequest);
        if (member.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            Member updated = memberService.updateUsername(member.get().getId(), request.username());
            return ResponseEntity.ok(new LoginResponse(updated.getId(), updated.getUsername(), updated.getEmail(), updated.getRole()));
        } catch (MemberNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
