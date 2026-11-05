package com.noirson.dto;

import java.util.List;

public record CommentPageResponse(List<CommentResponse> items, boolean hasMore) { }
