package org.example.lifelink.dto.hospital.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeferPrivateDonationBookingRequest(

        @NotBlank(message = "Deferral reason is required")
        @Size(max = 500)
        String reason,

        @Size(max = 500)
        String note
) {
}
