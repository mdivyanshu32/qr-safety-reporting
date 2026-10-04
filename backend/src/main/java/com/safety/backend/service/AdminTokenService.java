package com.safety.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AdminTokenService {
    @Value("${app.admin.token-secret:change-this-in-production}")
    private String tokenSecret;

    public String issueToken(Long userId) {
        return "admin-" + userId + "-" + tokenSecret;
    }

    public boolean isValid(String token) {
        return token != null && token.startsWith("admin-") && token.endsWith("-" + tokenSecret);
    }
}
