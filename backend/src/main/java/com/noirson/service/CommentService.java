package com.noirson.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashMap;
import java.util.HashSet;
import java.util.regex.Pattern;

import com.noirson.dto.CommentPageResponse;
import com.noirson.dto.CommentResponse;
import com.noirson.entity.Comment;
import com.noirson.entity.Member;
import com.noirson.entity.Mix;
import com.noirson.repository.CommentRepository;
import com.noirson.repository.CommentLikeRepository;
import com.noirson.repository.MemberRepository;
import com.noirson.repository.MixRepository;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CommentService {
    private static final Pattern URL = Pattern.compile(
            "(?i)(?:https?://|www\\.|\\b[\\p{L}0-9](?:[\\p{L}0-9-]{0,61}[\\p{L}0-9])?"
            + "(?:\\.[\\p{L}0-9](?:[\\p{L}0-9-]{0,61}[\\p{L}0-9])?)*"
            + "\\.[\\p{L}]{2,24}\\b)");
    private static final Pattern HTML_TAG = Pattern.compile("<\\s*/?\\s*[A-Za-z][^>]*>");

    private final CommentRepository comments;
    private final CommentLikeRepository likes;
    private final MemberRepository members;
    private final MixRepository mixes;
    private final EntityManager entityManager;

    public CommentService(CommentRepository comments, CommentLikeRepository likes, MemberRepository members,
            MixRepository mixes, EntityManager entityManager) {
        this.comments = comments;
        this.likes = likes;
        this.members = members;
        this.mixes = mixes;
        this.entityManager = entityManager;
    }

    private static String validContent(String content) {
        if (content == null || content.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "評論不可為空白");
        String cleaned = content.trim();
        if (cleaned.codePointCount(0, cleaned.length()) > 500)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "評論不可超過 500 字");
        if (URL.matcher(cleaned).find() || HTML_TAG.matcher(cleaned).find())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "評論不可包含網址或 HTML");
        return cleaned;
    }

    private static CommentResponse response(Comment comment, long likeCount, boolean likedByMe) {
        return new CommentResponse(comment.getId(), comment.getMix().getCode(),
                comment.getMember().getId(), comment.getMember().getUsername(),
                comment.getContent(), comment.getCreatedAt(), comment.getUpdatedAt(), likeCount, likedByMe);
    }

    private CommentPageResponse page(List<Comment> found, long offset, long total, Long memberId) {
        if (found.isEmpty()) return new CommentPageResponse(List.of(), false);
        List<Long> ids = found.stream().map(Comment::getId).toList();
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : likes.countForComments(ids)) {
            counts.put((Long) row[0], (Long) row[1]);
        }
        Set<Long> liked = memberId == null ? Set.of() : new HashSet<>(likes.likedCommentIds(ids, memberId));
        List<CommentResponse> items = found.stream()
                .map(comment -> response(comment, counts.getOrDefault(comment.getId(), 0L), liked.contains(comment.getId())))
                .toList();
        return new CommentPageResponse(items, offset + found.size() < total);
    }

    private static PageRequest pageRequest(int page, int size) {
        if (page < 0 || size < 1 || size > 20 || (long) page * size > Integer.MAX_VALUE - 20)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "分頁參數錯誤");
        return PageRequest.of(page, size);
    }

    @Transactional(readOnly = true)
    public CommentPageResponse listMix(String code, int page, int size, Long memberId) {
        PageRequest limit = pageRequest(page, size);
        Mix mix = mixes.findByCode(code).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Long viewerId = memberId != null && members.existsById(memberId) ? memberId : null;
        return page(comments.findByMixLatest(mix.getId(), limit), limit.getOffset(),
                comments.countByMix_Id(mix.getId()), viewerId);
    }

    @Transactional(readOnly = true)
    public CommentPageResponse listMine(Long memberId, int page, int size) {
        if (!members.existsById(memberId)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        PageRequest limit = pageRequest(page, size);
        return page(comments.findByMemberLatest(memberId, limit), limit.getOffset(),
                comments.countByMember_Id(memberId), memberId);
    }

    @Transactional
    public CommentResponse create(Long memberId, String code, String content) {
        String checked = validContent(content);
        // 鎖定會員列，讓同一會員的並發發表依序檢查 30 秒冷卻。
        Member member = members.findByIdForCommentPost(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Mix mix = mixes.findByCode(code).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        LocalDateTime now = comments.databaseNow();
        LocalDateTime latest = comments.findLatestCreatedAt(memberId);
        if (latest != null && now.isBefore(latest.plusSeconds(30)))
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "請在 30 秒後再發表評論");
        Comment saved = comments.saveAndFlush(new Comment(member, mix, checked));
        entityManager.refresh(saved); // 取得資料庫寫入的建立及更新時間。
        return response(saved, 0, false);
    }

    @Transactional
    public CommentResponse update(Long memberId, Long id, String content) {
        String checked = validContent(content);
        Member member = members.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Comment comment = comments.findDetailsById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!comment.getMember().getId().equals(member.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        comment.setContent(checked);
        comment.setUpdatedAt(comments.databaseNow());
        comments.flush();
        return response(comment, likes.countForComments(List.of(id)).stream()
                .mapToLong(row -> (Long) row[1]).findFirst().orElse(0),
                !likes.likedCommentIds(List.of(id), memberId).isEmpty());
    }

    @Transactional
    public void delete(Long memberId, Long id) {
        Member member = members.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        Comment comment = comments.findDetailsById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        // 刪除權限以重新查詢的資料庫角色為準；未知角色不視為 ADMIN。
        if (!comment.getMember().getId().equals(member.getId()) && !"ADMIN".equals(member.getRole()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        comments.delete(comment);
    }

    @Transactional
    public void like(Long memberId, Long id) {
        if (!members.existsById(memberId)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        if (!comments.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        likes.add(memberId, id);
    }

    @Transactional
    public void unlike(Long memberId, Long id) {
        if (!members.existsById(memberId)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        if (!comments.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        likes.remove(memberId, id);
    }
}
