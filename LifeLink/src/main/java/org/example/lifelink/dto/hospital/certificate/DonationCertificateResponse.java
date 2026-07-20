package org.example.lifelink.dto.hospital.certificate;

import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.hospital.certificate.CertificateStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DonationCertificateResponse(

        Long certificateId,
        String certificateNumber,
        String verificationCode,
        CertificateStatus status,
        Long registrationId,
        Long donorId,
        String donorCode,
        String donorName,
        BloodType bloodType,
        Long hospitalId,
        String hospitalName,
        Long eventId,
        String eventTitle,
        LocalDate donationDate,
        LocalDateTime issuedAt,
        LocalDateTime revokedAt,
        String revokeReason
) {
}