package org.example.lifelink.dto.hospital.inventory;


import org.example.lifelink.entity.BloodType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PrivateBookingInventorySourceResponse(
        Long bookingId,
        Long donorId,
        String donorName,
        String donorCode,
        BloodType bloodType,
        LocalDate bookingDate,
        LocalDateTime completedAt
) {
}