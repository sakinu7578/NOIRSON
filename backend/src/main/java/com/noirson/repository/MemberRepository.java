package com.noirson.repository;

import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.noirson.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
// JPA要操作Member個 Entity，告訴JPA這個 Entity 的主鍵型別 => Long
public interface MemberRepository extends JpaRepository<Member, Long> {
    @Query(value = "select * from members where id = :id for update", nativeQuery = true)
    Optional<Member> findByIdForCommentPost(@Param("id") Long id);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from Member m where m.id = :id")
    Optional<Member> findByIdForMemberUpdate(@Param("id") Long id);
    // JPA判斷 Email 是否已存在
    boolean existsByEmail(String email);
    Optional<Member> findByEmail(String email);

}
