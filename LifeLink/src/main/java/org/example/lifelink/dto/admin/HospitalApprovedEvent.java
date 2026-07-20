package org.example.lifelink.dto.admin;

public record HospitalApprovedEvent(
        Long hospitalId,
        String hospitalName,
        String hospitalEmail
) {
}