package org.example.lifelink.dto.hospital.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.example.lifelink.entity.hospital.inventory.BloodIssuePurpose;

public record IssueBloodUnitRequest(

        @NotNull(
                message = "Issue purpose is required"
        )
        BloodIssuePurpose issuePurpose,

        @NotBlank(
                message = "Department is required"
        )
        @Size(
                max = 150,
                message = "Department must not exceed 150 characters"
        )
        String issuedDepartment,

        @Size(
                max = 100,
                message = "Patient reference must not exceed 100 characters"
        )
        String patientReference,

        @NotBlank(
                message = "Received-by person is required"
        )
        @Size(
                max = 150,
                message = "Received-by name must not exceed 150 characters"
        )
        String receivedBy,

        @Size(
                max = 500,
                message = "Issue note must not exceed 500 characters"
        )
        String issueNote
) {
}