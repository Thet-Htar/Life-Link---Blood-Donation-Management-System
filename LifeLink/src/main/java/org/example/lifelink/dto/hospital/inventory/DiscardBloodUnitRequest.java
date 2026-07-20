package org.example.lifelink.dto.hospital.inventory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.example.lifelink.entity.hospital.inventory.BloodDiscardReason;

public record DiscardBloodUnitRequest(

        @NotNull(
                message = "Discard reason is required"
        )
        BloodDiscardReason discardReason,

        @Size(
                max = 500,
                message = "Discard note must not exceed 500 characters"
        )
        String discardNote
) {
}