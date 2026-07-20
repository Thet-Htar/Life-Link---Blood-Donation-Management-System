package org.example.lifelink.dto.hospital.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReserveBloodUnitRequest(

        @NotBlank(
                message = "Reservation target is required"
        )
        @Size(
                max = 150,
                message = "Reservation target must not exceed 150 characters"
        )
        String reservedFor,

        @Size(
                max = 500,
                message = "Reservation note must not exceed 500 characters"
        )
        String reservationNote
) {
}