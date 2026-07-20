package org.example.lifelink.dto.hospital.inventory;

import org.example.lifelink.entity.BloodType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EventInventorySourceResponse(

        Long registrationId,

        Long eventId,

        String eventTitle,

        Long donorId,

        String donorCode,

        String donorName,

        String donorEmail,

        BloodType bloodType,

        LocalDate eventDate,

        LocalDateTime completedAt
) {
}