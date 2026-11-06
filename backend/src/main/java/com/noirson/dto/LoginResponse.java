package com.noirson.dto;

// 登入成功只回傳公開會員資訊，不包含 passwordHash。
public record LoginResponse(Long id, String username, String email, String role) {
}
