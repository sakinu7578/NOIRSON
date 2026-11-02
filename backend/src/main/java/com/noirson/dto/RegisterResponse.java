package com.noirson.dto;

// 回傳資料不包含 passwordHash，避免把密碼雜湊傳給瀏覽器。
public record RegisterResponse(
        Long id,
        String username,
        String email
) {
}
