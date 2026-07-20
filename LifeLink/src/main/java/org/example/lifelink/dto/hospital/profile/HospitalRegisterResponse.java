package org.example.lifelink.dto.hospital.profile;

import org.example.lifelink.entity.VerificationStatus;

public record HospitalRegisterResponse(

        Long id,
        String email,
        VerificationStatus verificationStatus,
        String message
) {
}
