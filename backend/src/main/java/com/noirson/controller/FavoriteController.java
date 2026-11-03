package com.noirson.controller;

import java.util.List;
import java.util.Optional;

import com.noirson.entity.Member;
import com.noirson.service.FavoriteService;
import com.noirson.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {
    private final FavoriteService favoriteService;
    private final MemberService memberService;

    public FavoriteController(FavoriteService favoriteService, MemberService memberService) {
        this.favoriteService = favoriteService;
        this.memberService = memberService;
    }

    // 沿用登入流程的 memberId；每次重新查會員，避免已刪會員沿用 Session。
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
        return ResponseEntity.ok(favoriteService.listMixCodes(member.get().getId()));
    }

    @PostMapping("/{code}")
    public ResponseEntity<Void> add(@PathVariable String code, HttpServletRequest request) {
        Optional<Member> member = currentMember(request);
        if (member.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<Boolean> added = favoriteService.add(member.get(), code);
        if (added.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.status(added.get() ? HttpStatus.CREATED : HttpStatus.OK).build();
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> remove(@PathVariable String code, HttpServletRequest request) {
        Optional<Member> member = currentMember(request);
        if (member.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!favoriteService.remove(member.get().getId(), code)) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}
