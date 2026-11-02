package com.noirson.service;

import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

import com.noirson.entity.Member;
import com.noirson.repository.MemberRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class MemberService {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    // 建構子注入 Repository
    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    // 會員註冊
    public Member register(String username, String email, String password) {
        String trimmedUsername = username == null ? "" : username.trim();
        String trimmedEmail = email == null ? "" : email.trim();

        if (trimmedUsername.length() < 2 || trimmedUsername.length() > 20) {
            throw new IllegalArgumentException("使用者名稱須為 2～20 字元");
        }
        if (trimmedEmail.length() > 254 || !EMAIL_PATTERN.matcher(trimmedEmail).matches()) {
            throw new IllegalArgumentException("Email 格式不正確或超過 254 字元");
        }
        // BCrypt 最多處理 72 UTF-8 bytes；密碼保留原樣，不去除空白。
        if (password == null || password.length() < 8 || password.isBlank()
                || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("密碼須至少 8 字元且不得超過 72 UTF-8 bytes");
        }

        // 1. 檢查 Email 是否已註冊
        if (memberRepository.existsByEmail(trimmedEmail)) {
            throw new DuplicateEmailException();
        }

        // 2. 將密碼轉換為 BCrypt 雜湊值
        String passwordHash = passwordEncoder.encode(password);

        // 3. 建立會員物件
        Member member = new Member(trimmedUsername, trimmedEmail, passwordHash);

        // 4. 儲存到 MySQL
        return memberRepository.save(member);
    }

    public static class DuplicateEmailException extends RuntimeException {
        public DuplicateEmailException() {
            super("Email 已被註冊");
        }
    }
}
