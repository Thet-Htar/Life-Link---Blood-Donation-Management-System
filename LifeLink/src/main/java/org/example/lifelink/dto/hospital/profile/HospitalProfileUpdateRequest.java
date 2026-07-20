package org.example.lifelink.dto.hospital.profile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.example.lifelink.dto.AddressRequest;

public record HospitalProfileUpdateRequest(

        @NotBlank(message = "Hospital name is required")
        @Size(
                min = 3,
                max = 150,
                message = "Hospital name must contain between 3 and 150 characters"
        )
        String hospitalName,

        @NotBlank(message = "Representative staff name is required")
        @Size(
                min = 2,
                max = 150,
                message = "Representative staff name must contain between 2 and 150 characters"
        )
        String representativeStaffName,

        @NotBlank(message = "Phone number is required")
        @Pattern(
                regexp = "^09\\d{7,9}$",
                message = "Enter a valid Myanmar phone number"
        )
        String phone,

        @Valid
        @NotNull(message = "Address is required")
        AddressRequest address
) {
}