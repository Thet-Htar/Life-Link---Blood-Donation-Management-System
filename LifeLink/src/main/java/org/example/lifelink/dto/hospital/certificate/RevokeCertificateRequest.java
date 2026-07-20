package org.example.lifelink.dto.hospital.certificate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RevokeCertificateRequest(

        @NotBlank(message = "Revoke reason is required")
        @Size(max = 500, message = "Revoke reason must not exceed 500 characters")
        String reason
) {
}