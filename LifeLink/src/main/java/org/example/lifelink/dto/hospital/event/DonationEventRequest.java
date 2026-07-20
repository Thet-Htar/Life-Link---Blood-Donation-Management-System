package org.example.lifelink.dto.hospital.event;

import org.example.lifelink.dto.AddressRequest;
import org.example.lifelink.entity.BloodType;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

public record DonationEventRequest(

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
        AddressRequest address
) {
}