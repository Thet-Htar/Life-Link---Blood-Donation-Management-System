package org.example.lifelink.dto.hospital.event;

import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.hospital.event.DonationDeferralReason;
import org.example.lifelink.entity.hospital.event.DonationEventRegistrationStatus;

import java.time.LocalDateTime;

public record RegisteredEventDonorResponse(

        Long registrationId,
        Long donorId,
        String donorCode,
        String fullName,
        String email,
        String phone,
        BloodType bloodType,
        DonationEventRegistrationStatus status,
        LocalDateTime registeredAt,
        LocalDateTime cancelledAt,
        LocalDateTime completedAt,
        LocalDateTime noShowAt,
        LocalDateTime deferredAt,
        DonationDeferralReason deferralReason,
        String outcomeNote
) {
}