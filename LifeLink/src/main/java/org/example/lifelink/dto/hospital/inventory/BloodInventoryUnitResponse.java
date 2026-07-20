package org.example.lifelink.dto.hospital.inventory;

import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.hospital.inventory.BloodDiscardReason;
import org.example.lifelink.entity.hospital.inventory.BloodIssuePurpose;
import org.example.lifelink.entity.hospital.inventory.BloodUnitSource;
import org.example.lifelink.entity.hospital.inventory.BloodUnitStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record BloodInventoryUnitResponse(

        Long id,

        String unitCode,

        BloodType bloodType,

        Integer volumeMl,

        LocalDate collectionDate,

        LocalDate expiryDate,

        BloodUnitStatus status,

        BloodUnitSource source,

        String storageLocation,

        String notes,

        /*
         * DONATION_EVENT source information
         */
        Long eventRegistrationId,

        Long donationEventId,

        String donationEventTitle,

        /*
         * PRIVATE_BOOKING source information
         */
        Long privateBookingId,

        /*
         * Reservation information
         */
        String reservedFor,

        String reservationNote,

        LocalDateTime reservedAt,

        String reservedBy,

        /*
         * Issue information
         */
        BloodIssuePurpose issuePurpose,

        String issuedDepartment,

        String patientReference,

        String receivedBy,

        LocalDateTime issuedAt,

        String issuedBy,

        String issueNote,

        /*
         * Discard information
         */
        BloodDiscardReason discardReason,

        String discardNote,

        LocalDateTime discardedAt,

        String discardedBy,

        /*
         * Hospital information
         */
        Long hospitalId,

        String hospitalName,

        LocalDateTime createdAt,

        LocalDateTime updatedAt,

        Long version
) {
}