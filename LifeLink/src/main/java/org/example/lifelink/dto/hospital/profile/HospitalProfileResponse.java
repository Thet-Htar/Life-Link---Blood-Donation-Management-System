package org.example.lifelink.dto.hospital.profile;

import org.example.lifelink.dto.AddressResponse;
import org.example.lifelink.entity.VerificationStatus;

public record HospitalProfileResponse(

        Long id,
        String hospitalName,
        String hospitalLicenseCode,
        String representativeStaffName,
        String email,
        String phone,
        AddressResponse address,
        VerificationStatus verificationStatus,
        boolean enabled
) {
}