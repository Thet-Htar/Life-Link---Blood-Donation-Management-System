package org.example.lifelink.dto.hospital.event;

import org.example.lifelink.dto.AddressResponse;
import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.hospital.event.DonationEventStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

public record DonationEventResponse(

        Long id,
        String hospitalName,
        String eventTitle,
        Integer targetDonorCount,
        String description,
        LocalDate eventDate,
        LocalTime startTime,
        LocalTime endTime,
        LocalDate registrationDeadline,
        Set<BloodType> requiredBloodTypes,
        String contactPersonName,
        String contactPhone,
        AddressResponse address,

        DonationEventStatus status,

        long registeredDonors,

        boolean editable,

        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime publishedAt
) {
}