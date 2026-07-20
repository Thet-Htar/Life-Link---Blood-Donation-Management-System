package org.example.lifelink.dto.donor.booking;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreatePrivateDonationBookingRequest(

        @NotNull(message = "Hospital is required")
        Long hospitalId,

        @NotNull(message = "Booking date is required")
        @FutureOrPresent(message = "Booking date cannot be in the past")
        LocalDate bookingDate,

        @NotNull(message = "Start time is required")
        LocalTime startTime,

        @NotNull(message = "End time is required")
        LocalTime endTime,

        @AssertTrue(
                message = "Eligibility declaration must be accepted"
        )
        boolean eligibilityDeclarationAccepted,

        @Size(max = 500)
        String donorNote
) {
}