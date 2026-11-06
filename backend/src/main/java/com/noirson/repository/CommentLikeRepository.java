package com.noirson.repository;

import java.util.List;
import com.noirson.entity.CommentLike;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    @Query("select l.comment.id, count(l.id) from CommentLike l where l.comment.id in :ids group by l.comment.id")
    List<Object[]> countForComments(@Param("ids") List<Long> ids);

    @Query("select l.comment.id from CommentLike l where l.comment.id in :ids and l.member.id = :memberId")
    List<Long> likedCommentIds(@Param("ids") List<Long> ids, @Param("memberId") Long memberId);

    // 唯一鍵使同會員的並發 PUT 只保留一筆。
    @Modifying
    @Query(value = "insert into comment_likes (member_id, comment_id) values (:memberId, :commentId) "
            + "on duplicate key update id = id", nativeQuery = true)
    int add(@Param("memberId") Long memberId, @Param("commentId") Long commentId);

    @Modifying
    @Query(value = "delete from comment_likes where member_id = :memberId and comment_id = :commentId", nativeQuery = true)
    int remove(@Param("memberId") Long memberId, @Param("commentId") Long commentId);
}
