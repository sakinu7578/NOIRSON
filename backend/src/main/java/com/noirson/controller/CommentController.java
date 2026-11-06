package com.noirson.controller;

import com.noirson.dto.CommentPageResponse;
import com.noirson.dto.CommentRequest;
import com.noirson.dto.CommentResponse;
import com.noirson.service.CommentService;
import com.noirson.service.SessionMemberService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class CommentController {
    private final CommentService comments;
    private final SessionMemberService sessionMembers;

    public CommentController(CommentService comments, SessionMemberService sessionMembers) {
        this.comments = comments;
        this.sessionMembers = sessionMembers;
    }

    private Long memberId(HttpServletRequest request) {
        return sessionMembers.currentMember(request).map(member -> member.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private Long optionalMemberId(HttpServletRequest request) {
        return sessionMembers.currentMember(request).map(member -> member.getId()).orElse(null);
    }

    @GetMapping("/api/mixes/{code}/comments")
    public CommentPageResponse listMix(@PathVariable String code,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        return comments.listMix(code, page, size, optionalMemberId(request));
    }

    @PostMapping("/api/mixes/{code}/comments")
    public ResponseEntity<CommentResponse> create(@PathVariable String code,
            @RequestBody CommentRequest body, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(comments.create(memberId(request), code, body.content()));
    }

    @PatchMapping("/api/comments/{id}")
    public CommentResponse update(@PathVariable Long id, @RequestBody CommentRequest body,
            HttpServletRequest request) {
        return comments.update(memberId(request), id, body.content());
    }

    @DeleteMapping("/api/comments/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        comments.delete(memberId(request), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/members/me/comments")
    public CommentPageResponse listMine(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size, HttpServletRequest request) {
        return comments.listMine(memberId(request), page, size);
    }

    @PutMapping("/api/comments/{id}/like")
    public ResponseEntity<Void> like(@PathVariable Long id, HttpServletRequest request) {
        comments.like(memberId(request), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/comments/{id}/like")
    public ResponseEntity<Void> unlike(@PathVariable Long id, HttpServletRequest request) {
        comments.unlike(memberId(request), id);
        return ResponseEntity.noContent().build();
    }
}
