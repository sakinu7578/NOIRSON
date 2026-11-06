package com.noirson.service;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.regex.Pattern;

import com.noirson.entity.Member;
import com.noirson.repository.MemberRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        String trimmedUsername = validateUsername(username);
        String trimmedEmail = email == null ? "" : email.trim();

        if (trimmedEmail.length() > 254 || !EMAIL_PATTERN.matcher(trimmedEmail).matches()) {
            throw new IllegalArgumentException("Email 格式不正確或超過 254 字元");
        }
        validatePassword(password);

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

    // 僅驗證帳密；不建立登入狀態，也不回傳密碼雜湊。
    public Optional<Member> login(String email, String password) {
        String trimmedEmail = email == null ? "" : email.trim();
        if (trimmedEmail.length() > 254 || !EMAIL_PATTERN.matcher(trimmedEmail).matches()) {
            throw new IllegalArgumentException("Email 格式不正確");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("密碼不可為空白");
        }

        return memberRepository.findByEmail(trimmedEmail)
                .filter(member -> passwordEncoder.matches(password, member.getPasswordHash()));
    }

    public Optional<Member> findById(Long id) {
        return memberRepository.findById(id);
    }

    @Transactional
    public Member updateUsername(Long memberId, String username) {
        String trimmedUsername = validateUsername(username);
        Member member = memberRepository.findById(memberId).orElseThrow(MemberNotFoundException::new);
        member.setUsername(trimmedUsername);
        return memberRepository.saveAndFlush(member);
    }

    // 交易提交後 Controller 才會使 Session 失效。
    @Transactional
    public void changePassword(Long memberId, String currentPassword, String newPassword, String confirmPassword) {
        if (currentPassword == null || currentPassword.isEmpty()) {
            throw new IllegalArgumentException("請輸入目前密碼");
        }
        if (newPassword == null || confirmPassword == null || !newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("新密碼與確認密碼不一致");
        }
        Member member = memberRepository.findById(memberId).orElseThrow(InvalidCurrentPasswordException::new);
        if (!passwordEncoder.matches(currentPassword, member.getPasswordHash())) {
            throw new InvalidCurrentPasswordException();
        }
        validatePassword(newPassword);
        if (passwordEncoder.matches(newPassword, member.getPasswordHash())) {
            throw new SamePasswordException();
        }
        member.setPasswordHash(passwordEncoder.encode(newPassword));
        memberRepository.saveAndFlush(member);
    }

    private void validatePassword(String password) {
        // BCrypt 最多處理 72 UTF-8 bytes；密碼保留原樣，不去除空白。
        if (password == null || password.length() < 8 || password.length() > 20 || password.isBlank()
                || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("密碼須為 8～20 字元且不得超過 72 UTF-8 bytes");
        }
    }

    private String validateUsername(String username) {
        String trimmedUsername = username == null ? "" : username.trim();
        if (trimmedUsername.length() < 2 || trimmedUsername.length() > 20) {
            throw new IllegalArgumentException("使用者名稱須為 2～20 字元");
        }
        return trimmedUsername;
    }

    public static class MemberNotFoundException extends RuntimeException {
    }

    public static class SamePasswordException extends RuntimeException {
    }

    public static class InvalidCurrentPasswordException extends RuntimeException {
    }

    public static class DuplicateEmailException extends RuntimeException {
        public DuplicateEmailException() {
            super("Email 已被註冊");
        }
    }
}
