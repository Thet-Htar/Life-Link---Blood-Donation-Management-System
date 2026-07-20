package org.example.lifelink.dto.auth;

public record LoginRequest(

        String email,
        String password
) {
}
