package com.noirson.controller;

import java.io.IOException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class CsrfOriginFilter extends OncePerRequestFilter {
    private final Set<String> allowedOrigins;

    public CsrfOriginFilter(@Value("${noirson.csrf.allowed-origins:}") String origins) {
        allowedOrigins = Arrays.stream(origins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        String method = request.getMethod();
        boolean writes = !method.equals("GET") && !method.equals("HEAD") && !method.equals("OPTIONS");
        if (request.getRequestURI().startsWith("/api/") && writes) {
            String origin = request.getHeader("Origin");
            String fetchSite = request.getHeader("Sec-Fetch-Site");
            // Vite proxy 的 Host 可能是 8080，因此只使用明確設定的瀏覽器來源。
            // 缺少 Origin 一律拒絕；Fetch Metadata 可額外攔截跨站請求。
            if (origin == null || !allowedOrigins.contains(origin)
                    || "cross-site".equalsIgnoreCase(fetchSite)) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN);
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
