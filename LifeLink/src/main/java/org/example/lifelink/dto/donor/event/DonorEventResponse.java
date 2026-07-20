package org.example.lifelink.dto.donor.event;

import org.example.lifelink.entity.BloodType;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

public record DonorEventResponse(

        Long id,
        String eventTitle,
        String description,
        String hospitalName,
        LocalDate eventDate,
        LocalTime startTime,
        LocalTime endTime,
        LocalDate registrationDeadline,
        Set<BloodType> requiredBloodTypes,
        String contactPersonName,
        String contactPhone,
        String street,
        String township,
        String city,
        Integer targetDonorCount,
        long registeredDonorCount,
        long remainingSlots,
        boolean registrationFull,
        boolean alreadyRegistered,
        DonorEventMatchType matchType
) {
}
