package org.example.lifelink.dto.auth;

import org.example.lifelink.entity.Role;

public record UserResponse(

        Long id,
        String fullName,
        String email,
        String phone,
        Role role
) {

}
