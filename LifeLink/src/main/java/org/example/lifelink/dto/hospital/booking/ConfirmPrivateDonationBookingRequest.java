package org.example.lifelink.dto.hospital.booking;

import jakarta.validation.constraints.Size;

public record ConfirmPrivateDonationBookingRequest(

        @Size(max = 500)
        String hospitalNote
) {
}
