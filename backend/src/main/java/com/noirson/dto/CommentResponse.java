package com.noirson.dto;

import java.time.LocalDateTime;

public record CommentResponse(Long id, String mixCode, Long authorId, String authorName,
        String content, LocalDateTime createdAt, LocalDateTime updatedAt) { }
