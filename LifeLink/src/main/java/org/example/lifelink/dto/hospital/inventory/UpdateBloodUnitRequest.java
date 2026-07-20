package org.example.lifelink.dto.hospital.inventory;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import org.example.lifelink.entity.BloodType;

import java.time.LocalDate;

public record UpdateBloodUnitRequest(

        @NotNull(
                message = "Blood type is required"
        )
        BloodType bloodType,

        @NotNull(
                message = "Volume is required"
        )
        @Positive(
                message = "Volume must be greater than zero"
        )
        @Max(
                value = 1000,
                message = "Volume must not exceed 1000 ml"
        )
        Integer volumeMl,

        @NotNull(
                message = "Collection date is required"
        )
        @PastOrPresent(
                message = "Collection date cannot be in the future"
        )
        LocalDate collectionDate,

        @NotNull(
                message = "Expiry date is required"
        )
        @FutureOrPresent(
                message = "Expiry date cannot be in the past"
        )
        LocalDate expiryDate,

        @NotBlank(
                message = "Storage location is required"
        )
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