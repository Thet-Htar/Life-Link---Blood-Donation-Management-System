package org.example.lifelink.dto.auth;

public record ApiErrorResponse(

        String code,
        String message,
        int status
) {
}