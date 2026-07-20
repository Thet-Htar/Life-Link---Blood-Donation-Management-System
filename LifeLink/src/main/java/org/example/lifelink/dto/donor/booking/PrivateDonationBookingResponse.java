package org.example.lifelink.dto.donor.booking;

import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.donor.booking.PrivateDonationBookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record PrivateDonationBookingResponse(

        Long bookingId,

        Long donorId,
        String donorCode,
        String donorName,
        String donorEmail,
        BloodType bloodType,

        Long hospitalId,
        String hospitalName,

        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,

        PrivateDonationBookingStatus status,

        String donorNote,
        String hospitalNote,

        boolean eligibilityDeclarationAccepted,
        LocalDateTime eligibilityDeclarationAcceptedAt,

        LocalDateTime confirmedAt,
        String confirmedBy,

        LocalDateTime completedAt,
        String completedBy,

        LocalDateTime noShowAt,
        String noShowMarkedBy,

        LocalDateTime deferredAt,
        String deferredBy,
        String deferralReason,

        String outcomeNote,

        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}