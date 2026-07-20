package org.example.lifelink.dto.admin;

import org.example.lifelink.entity.BloodType;

import java.time.LocalDateTime;

public record AdminDonorResponse(
        Long donorId,
        Long userId,
        String donorCode,
        String fullName,
        String email,
        String phoneNumber,
        BloodType bloodType,
        boolean accountLocked,
        LocalDateTime registeredAt
) {
}