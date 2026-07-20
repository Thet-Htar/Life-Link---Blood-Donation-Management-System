package org.example.lifelink.dto.hospital.event;

import org.example.lifelink.entity.BloodType;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

public record PublicDonationEventResponse(
        Long id,
        String hospitalName,
        String eventTitle,
        String description,

        LocalDate eventDate,
        LocalTime startTime,
        LocalTime endTime,

        Set<BloodType> requiredBloodTypes,

        String street,
        String township,
        String city,

        Integer targetDonorCount
) {
}