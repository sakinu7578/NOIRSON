package com.noirson.controller;

import java.util.List;
import java.util.Optional;

import com.noirson.entity.Member;
import com.noirson.service.MemberService;
import com.noirson.service.PlayHistoryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/play-history")
public class PlayHistoryController {
    private final PlayHistoryService playHistoryService;
    private final MemberService memberService;

    public PlayHistoryController(PlayHistoryService playHistoryService, MemberService memberService) {
        this.playHistoryService = playHistoryService;
        this.memberService = memberService;
    }

    // 與 Favorites 相同：不建立訪客 Session，並確認 Session 指向的會員仍存在。
    private Optional<Member> currentMember(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        Object memberId = session == null ? null : session.getAttribute("memberId");
        if (!(memberId instanceof Long id)) return Optional.empty();
        return memberService.findById(id);
    }

    @GetMapping
    public ResponseEntity<List<String>> list(HttpServletRequest request) {
        Optional<Member> member = currentMember(request);
        if (member.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(playHistoryService.listRecentMixCodes(member.get().getId()));
    }

    @PostMapping("/{code}")
    public ResponseEntity<Void> record(@PathVariable String code, HttpServletRequest request) {
        Optional<Member> member = currentMember(request);
        if (member.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!playHistoryService.recordPlay(member.get().getId(), code)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}
