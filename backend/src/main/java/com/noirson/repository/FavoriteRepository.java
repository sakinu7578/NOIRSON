package com.noirson.repository;

import java.util.List;
import java.util.Optional;

import com.noirson.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    // 一次取得 Mix code，避免逐筆載入關聯 Mix。
    @Query("select f.mix.code from Favorite f where f.member.id = :memberId order by f.createdAt desc, f.id desc")
    List<String> findMixCodesByMemberId(@Param("memberId") Long memberId);

    Optional<Favorite> findByMember_IdAndMix_Id(Long memberId, Long mixId);

    boolean existsByMember_IdAndMix_Id(Long memberId, Long mixId);
}
