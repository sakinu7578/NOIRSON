package com.noirson.repository;

import java.util.List;

import com.noirson.entity.PlayHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {
    @Query("select h.mix.code from PlayHistory h where h.member.id = :memberId order by h.lastPlayedAt desc, h.id desc")
    List<String> findRecentMixCodes(@Param("memberId") Long memberId, Pageable limit);

    // 唯一鍵處理同一會員與 Mix 的並發首次寫入；資料庫提供 DATETIME(6) 時間。
    @Modifying
    @Query(value = "INSERT INTO play_history (member_id, mix_id, last_played_at) "
            + "VALUES (:memberId, :mixId, CURRENT_TIMESTAMP(6)) "
            + "ON DUPLICATE KEY UPDATE last_played_at = CURRENT_TIMESTAMP(6)", nativeQuery = true)
    int recordPlay(@Param("memberId") Long memberId, @Param("mixId") Long mixId);
}
