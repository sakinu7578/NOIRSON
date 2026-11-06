package com.noirson.dto;

public record ChangePasswordRequest(String currentPassword, String newPassword, String confirmPassword) {
}
