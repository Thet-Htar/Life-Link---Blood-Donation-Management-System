package org.example.lifelink.dto.hospital.booking;

import jakarta.validation.constraints.Size;

public record CompletePrivateDonationBookingRequest(

        @Size(max = 500)
        String outcomeNote
) {
}
