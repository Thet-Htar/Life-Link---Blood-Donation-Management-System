package org.example.lifelink.dto.admin;

import org.example.lifelink.entity.VerificationStatus;

import java.time.LocalDateTime;

public record AdminHospitalResponse(

        Long hospitalId,

        Long userId,

        String hospitalName,

        String hospitalLicenseCode,

        String representativeStaffName,

        String email,

        VerificationStatus verificationStatus,

        boolean accountLocked,


        LocalDateTime registeredAt,

        LocalDateTime verifiedAt,

        String remarks

) {
}