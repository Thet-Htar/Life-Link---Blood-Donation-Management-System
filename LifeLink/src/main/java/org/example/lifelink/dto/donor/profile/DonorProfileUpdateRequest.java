package org.example.lifelink.dto.donor.profile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.example.lifelink.dto.AddressRequest;

import java.math.BigDecimal;

public record DonorProfileUpdateRequest(

        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Phone number is required")
        @Pattern(
                regexp = "^09\\d{7,9}$",
                message = "Invalid Myanmar phone number"
        )
        String phone,

        @NotNull(message = "Weight is required")
        @DecimalMin(
                value = "1.0",
                message = "Weight must be greater than zero"
        )
        BigDecimal weightKg,

        @Valid
        @NotNull(message = "Address is required")
        AddressRequest address

) {
}