package com.noirson.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.noirson.entity.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // 一頁內同時取得作者和 Mix，避免逐則額外查詢。
    @Query("select c from Comment c join fetch c.member join fetch c.mix "
            + "where c.mix.id = :mixId order by c.createdAt desc, c.id desc")
    List<Comment> findByMixLatest(@Param("mixId") Long mixId, Pageable limit);

    @Query("select c from Comment c join fetch c.member join fetch c.mix "
            + "where c.member.id = :memberId order by c.createdAt desc, c.id desc")
    List<Comment> findByMemberLatest(@Param("memberId") Long memberId, Pageable limit);

    @Query("select c from Comment c join fetch c.member join fetch c.mix where c.id = :id")
    Optional<Comment> findDetailsById(@Param("id") Long id);

    @Query("select max(c.createdAt) from Comment c where c.member.id = :memberId")
    LocalDateTime findLatestCreatedAt(@Param("memberId") Long memberId);

    @Query(value = "select current_timestamp(6)", nativeQuery = true)
    LocalDateTime databaseNow();

    long countByMix_Id(Long mixId);

    long countByMember_Id(Long memberId);
}
