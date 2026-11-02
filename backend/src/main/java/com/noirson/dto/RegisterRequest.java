package com.noirson.dto;

// record 是Java提供的簡潔資料類別。Spring接收JSON時，會將對應欄位轉成這個物件。
public record RegisterRequest(
        String username,
        String email,
        String password
) {
}
