package org.example.lifelink.dto.hospital.profile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.example.lifelink.dto.AddressRequest;

public record HospitalRegisterRequest(

        @NotBlank(message = "Hospital name is required")
        @Size(min = 2, max = 150, message = "Hospital name must contain between 2 and 150 characters")
        String hospitalName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email address is invalid")
        @Size(max = 150, message = "Email must not exceed 150 characters")
        String email,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^09\\d{7,9}$", message = "Phone number must start with 09")
        String phone,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 64, message = "Password must contain between 8 and 64 characters")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Password must contain an uppercase letter, lowercase letter and number"
        )
        String password,

        @NotBlank(message = "Hospital license code is required")
        @Size(min = 3, max = 100, message = "Hospital license code must contain between 3 and 100 characters")
        String hospitalLicenseCode,

        @NotBlank(message = "Hospital representative name is required")
        @Size(min = 2, max = 100, message = "Representative name must contain between 2 and 100 characters")
        String representativeStaffName,

        @Valid
        @NotNull(message = "Hospital address is required")
        AddressRequest address
) {
}