package com.noirson.repository;

import java.util.Optional;

import com.noirson.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
// JPA要操作Member個 Entity，告訴JPA這個 Entity 的主鍵型別 => Long
public interface MemberRepository extends JpaRepository<Member, Long> {
    // JPA判斷 Email 是否已存在
    boolean existsByEmail(String email);
    Optional<Member> findByEmail(String email);

}
