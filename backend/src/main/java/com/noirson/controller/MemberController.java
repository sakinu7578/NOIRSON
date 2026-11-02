package com.noirson.controller;

import com.noirson.dto.RegisterRequest;
import com.noirson.dto.RegisterResponse;
import com.noirson.entity.Member;
import com.noirson.service.MemberService;
import com.noirson.service.MemberService.DuplicateEmailException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
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
}
