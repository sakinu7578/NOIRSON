package com.noirson.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;

import com.noirson.entity.Member;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

@Service
public class SessionMemberService {
    private static final String MEMBER_ID = "memberId";
    private static final String PASSWORD_FINGERPRINT = "passwordFingerprint";

    private final MemberService members;

    public SessionMemberService(MemberService members) {
        this.members = members;
    }

    public void startSession(HttpSession session, Member member) {
        session.setAttribute(MEMBER_ID, member.getId());
        session.setAttribute(PASSWORD_FINGERPRINT, fingerprint(member.getPasswordHash()));
    }

    // 密碼變更會更新雜湊；其他瀏覽器的舊 Session 指紋不符，於下次受保護請求時失效。
    // 每次使用會員身分都比對資料庫；舊版 Session 缺少指紋時也必須重新登入。
    public Optional<Member> currentMember(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return Optional.empty();
        Object id = session.getAttribute(MEMBER_ID);
        Object savedFingerprint = session.getAttribute(PASSWORD_FINGERPRINT);
        if (id instanceof Long memberId && savedFingerprint instanceof String saved) {
            Optional<Member> member = members.findById(memberId);
            if (member.isPresent() && saved.equals(fingerprint(member.get().getPasswordHash()))) {
                return member;
            }
        }
        session.invalidate();
        return Optional.empty();
    }

    private static String fingerprint(String passwordHash) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(passwordHash.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
