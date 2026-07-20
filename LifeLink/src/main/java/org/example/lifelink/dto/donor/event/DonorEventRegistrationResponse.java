package org.example.lifelink.dto.donor.event;

import org.example.lifelink.entity.hospital.event.DonationEventRegistrationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record DonorEventRegistrationResponse(

        Long registrationId,
        Long eventId,
        String eventTitle,
        String hospitalName,
        LocalDate eventDate,
        LocalTime startTime,
        LocalTime endTime,
        String street,
        String township,
        String city,
        DonationEventRegistrationStatus status,
        LocalDateTime registeredAt,
        LocalDateTime cancelledAt,
        LocalDateTime completedAt
) {
}