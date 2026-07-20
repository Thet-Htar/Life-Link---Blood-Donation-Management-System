package org.example.lifelink.dto.auth;

import org.example.lifelink.entity.Role;

public record AuthResponse(

        String accessToken,
        String refreshToken,
        Role role) {
}
