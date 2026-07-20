package org.example.lifelink.dto.donor.event;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.example.lifelink.dto.AddressRequest;
import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.hospital.event.DonationHistoryType;
import org.example.lifelink.entity.Gender;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DonorRegisterRequest(

        @NotBlank(message = "Full name is required")
        @Size(
                min = 2,
                max = 150,
                message = "Full name must contain between 2 and 150 characters"
        )
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email format is invalid")
        String email,

        @NotBlank(message = "Phone number is required")
        @Pattern(
                regexp = "^09\\d{7,9}$",
                message = "Phone number must start with 09"
        )
        String phone,

        @NotBlank(message = "Password is required")
        @Size(
                min = 8,
                max = 64,
                message = "Password must contain between 8 and 64 characters"
        )
        String password,

        @NotNull(message = "Blood type is required")
        BloodType bloodType,

        @NotNull(message = "Date of birth is required")
        @Past(message = "Date of birth must be in the past")
        LocalDate dateOfBirth,

        @NotNull(message = "Weight is required")
        @DecimalMin(
                value = "1.00",
                message = "Weight must be greater than zero"
        )
        BigDecimal weightKg,

        @NotNull(message = "Gender is required")
        Gender gender,

        @NotNull(message = "Donation history is required")
        DonationHistoryType donationHistoryType,

        @PastOrPresent(message = "Last donation date cannot be in the future")
        LocalDate lastDonationDate,

        @Valid
        @NotNull(message = "Address is required")
        AddressRequest address
) {
}