package org.example.lifelink.dto.hospital.inventory;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.hospital.inventory.BloodUnitSource;

import java.time.LocalDate;

public record CreateBloodUnitRequest(

        @NotNull(message = "Blood unit source is required")
        BloodUnitSource source,

        Long eventRegistrationId,

        Long privateBookingId,

        @NotBlank(message = "Unit code is required")
        @Size(
                max = 60,
                message = "Unit code must not exceed 60 characters"
        )
        String unitCode,

        BloodType bloodType,

        @NotNull(message = "Volume is required")
        @Positive(message = "Volume must be greater than zero")
        @Max(
                value = 1000,
                message = "Volume must not exceed 1000 ml"
        )
        Integer volumeMl,

        LocalDate collectionDate,

        @NotNull(message = "Expiry date is required")
        LocalDate expiryDate,

        @NotBlank(message = "Storage location is required")
        @Size(
                max = 150,
                message = "Storage location must not exceed 150 characters"
        )
        String storageLocation,

        @Size(
                max = 500,
                message = "Notes must not exceed 500 characters"
        )
        String notes
) {
}