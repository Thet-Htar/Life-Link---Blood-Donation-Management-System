package org.example.lifelink.dto.hospital.event;
import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.hospital.event.DonationEventRegistrationStatus;

import java.time.LocalDateTime;

public record RegisteredDonorResponse(

        Long registrationId,
        Long donorId,
        String donorCode,
        String fullName,
        String email,
        String phone,
        BloodType bloodType,
        String township,
        String city,
        DonationEventRegistrationStatus status,
        LocalDateTime registeredAt,
        LocalDateTime completedAt

) {
}
