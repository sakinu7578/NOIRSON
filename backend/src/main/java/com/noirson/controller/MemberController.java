package com.noirson.controller;

import com.noirson.dto.RegisterRequest;
import com.noirson.dto.RegisterResponse;
import com.noirson.dto.LoginRequest;
import com.noirson.dto.LoginResponse;
import com.noirson.dto.ChangePasswordRequest;
import com.noirson.dto.UpdateUsernameRequest;
import com.noirson.entity.Member;
import com.noirson.service.MemberService;
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

    public MemberController(MemberService memberService, SessionMemberService sessionMembers) {
        this.memberService = memberService;
        this.sessionMembers = sessionMembers;
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
        try {
            return memberService.login(request.email(), request.password())
                    .<ResponseEntity<?>>map(member -> {
                        // 已有 Session 時輪替 ID，避免沿用登入前的 Session ID。
                        HttpSession session = httpRequest.getSession(false);
                        if (session == null) {
                            session = httpRequest.getSession(true);
                        } else {
                            httpRequest.changeSessionId();
                        }
                        sessionMembers.startSession(session, member);
                        return ResponseEntity.ok(
                                new LoginResponse(member.getId(), member.getUsername(), member.getEmail(), member.getRole()));
                    })
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body("Email 或密碼錯誤"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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
