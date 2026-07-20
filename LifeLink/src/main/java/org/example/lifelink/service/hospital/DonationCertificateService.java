package org.example.lifelink.service.hospital;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dao.donor.DonationCertificateDao;
import org.example.lifelink.dao.donor.DonorDao;
import org.example.lifelink.dao.hospital.HospitalDao;
import org.example.lifelink.dto.hospital.certificate.DonationCertificateResponse;
import org.example.lifelink.entity.User;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.donor.booking.PrivateDonationBooking;
import org.example.lifelink.entity.donor.booking.PrivateDonationBookingStatus;
import org.example.lifelink.entity.hospital.Hospital;
import org.example.lifelink.entity.hospital.certificate.CertificateStatus;
import org.example.lifelink.entity.hospital.certificate.DonationCertificate;
import org.example.lifelink.entity.hospital.event.DonationEventRegistration;
import org.example.lifelink.entity.hospital.event.DonationEventRegistrationStatus;
import org.example.lifelink.entity.hospital.event.DonationEvents;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DonationCertificateService {

    private final DonationCertificateDao certificateDao;
    private final DonorDao donorDao;
    private final HospitalDao hospitalDao;

    @Transactional
    public DonationCertificateResponse createForCompletedRegistration(DonationEventRegistration registration) {

        if (registration == null
                || registration.getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A saved registration is required to create a certificate");
        }

        if (registration.getStatus() != DonationEventRegistrationStatus.COMPLETED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Certificate can only be created for a completed donation");
        }

        DonationCertificate existing = certificateDao
                .findByRegistration_Id(registration.getId())

                .orElse(null);
        if (existing != null) {
            return donationCertificateResponse(existing);
        }

        Donor donor = registration.getDonor();
        DonationEvents event = registration.getDonationEvent();

        if (donor == null)
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Donor profile was not found");

        if (event == null)
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Donation event was not found");

        Hospital hospital = event.getHospital();

        if (hospital == null)
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Hospital was not found");

        User user = donor.getUser();

        if (user == null)
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Donor user account was not found");

        if (donor.getBloodType() == null)
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Donor blood type is required");

        DonationCertificate certificate = new DonationCertificate();
        certificate.setCertificateNumber(generateCertificateNumber());
        certificate.setVerificationCode(UUID.randomUUID().toString());
        certificate.setStatus(CertificateStatus.ACTIVE);
        certificate.setRegistration(registration);

        certificate.setDonor(donor);
        certificate.setHospital(hospital);
        certificate.setDonationEvent(event);

        certificate.setDonorName(resolveDonorName(user));
        certificate.setDonorCode(nullToEmpty(donor.getDonorCode()));
        certificate.setBloodType(donor.getBloodType());
        certificate.setHospitalName(nullToEmpty(hospital.getHospitalName()));
        certificate.setEventTitle(nullToEmpty(event.getEventTitle()));
        certificate.setDonationDate(resolveDonationDate(event));

        DonationCertificate saved = certificateDao.save(certificate);
        return donationCertificateResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DonationCertificateResponse> getHospitalCertificates(String authenticatedEmail) {

        Hospital hospital = findAuthenticatedHospital(authenticatedEmail);

        return certificateDao
                .findAllByHospital_IdOrderByIssuedAtDesc(hospital.getId())
                .stream()
                .map(this::donationCertificateResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DonationCertificateResponse> getDonorCertificates(String authenticatedEmail) {

        Donor donor = findAuthenticatedDonor(authenticatedEmail);

        return certificateDao.findAllByDonor_IdOrderByIssuedAtDesc(donor.getId())
                .stream()
                .map(this::donationCertificateResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DonationCertificateResponse verifyCertificate(String verificationCode) {
        if (verificationCode == null || verificationCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification code is required");
        }

        DonationCertificate certificate = certificateDao.findByVerificationCode(verificationCode.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificate was not found"));

        return donationCertificateResponse(certificate);
    }

    @Transactional
    public DonationCertificateResponse revokeCertificate(
            String authenticatedEmail,
            Long certificateId,
            String reason) {

        Hospital hospital = findAuthenticatedHospital(authenticatedEmail);

        DonationCertificate certificate = certificateDao
                .findByIdAndHospital_Id(
                        certificateId,
                        hospital.getId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Certificate was not found"));

        if (certificate.getStatus() == CertificateStatus.REVOKED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Certificate has already been revoked");
        }

        certificate.revoke(reason);

        return donationCertificateResponse(certificate);
    }

    private Hospital findAuthenticatedHospital(String authenticatedEmail) {
        return hospitalDao.findByUser_EmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital profile was not found"));
    }

    private Donor findAuthenticatedDonor(String authenticatedEmail) {
        return donorDao.findByUser_EmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor profile was not found"));
    }

    private DonationCertificateResponse donationCertificateResponse(DonationCertificate certificate) {
        return new DonationCertificateResponse(
                certificate.getId(),
                certificate.getCertificateNumber(),
                certificate.getVerificationCode(),
                certificate.getStatus(),
                certificate.getRegistration() == null ? null : certificate.getRegistration().getId(),
                certificate.getDonor() == null ? null : certificate.getDonor().getId(),
                certificate.getDonorCode(),
                certificate.getDonorName(),
                certificate.getBloodType(),
                certificate.getHospital() == null ? null : certificate.getHospital().getId(),
                certificate.getHospitalName(),
                certificate.getDonationEvent() == null ? null : certificate.getDonationEvent().getId(),
                certificate.getEventTitle(),
                certificate.getDonationDate(),
                certificate.getIssuedAt(),
                certificate.getRevokedAt(),
                certificate.getRevokeReason()
        );
    }

    private String generateCertificateNumber() {

        String randomPart = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase(Locale.ROOT);

        return "LL-CERT-" + Year.now().getValue() + "-" + randomPart;
    }

    private String resolveDonorName(User user) {

        String fullName = user.getFullName();
        return (fullName == null || fullName.isBlank()) ? "LifeLink Donor" : fullName.trim();
    }

    private LocalDate resolveDonationDate(DonationEvents event) {

        return event.getEventDate() == null ? LocalDate.now() : event.getEventDate();
    }

    private String nullToEmpty(String value) {

        return value == null ? "" : value.trim();
    }

    @Transactional(readOnly = true)
    public DonationCertificateResponse verifyByCertificateNumber(String certificateNumber) {

        if (certificateNumber == null
                || certificateNumber.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Certificate number is required");
        }

        DonationCertificate certificate = certificateDao
                .findByCertificateNumberIgnoreCase(
                        certificateNumber.trim())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Certificate was not found")
                );

        return donationCertificateResponse(certificate);
    }

    @Transactional
    public DonationCertificate createForCompletedPrivateBooking(PrivateDonationBooking booking) {

        if (booking.getStatus()
                != PrivateDonationBookingStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Only completed private bookings can create certificates");
        }

        if (certificateDao
                .existsByPrivateDonationBooking_Id(
                        booking.getId()
                )) {
            throw new IllegalStateException(
                    "A certificate already exists for this private booking");
        }

        Donor donor = booking.getDonor();
        Hospital hospital = booking.getHospital();

        DonationCertificate certificate = new DonationCertificate();

        certificate.setCertificateNumber(generateCertificateNumber());

        certificate.setVerificationCode(UUID.randomUUID().toString());
        certificate.setDonor(donor);
        certificate.setHospital(hospital);

        certificate.setRegistration(null);
        certificate.setDonationEvent(null);
        certificate.setPrivateDonationBooking(booking);

        certificate.setDonorName(donor.getUser().getFullName());
        certificate.setDonorCode(donor.getDonorCode());
        certificate.setBloodType(donor.getBloodType());
        certificate.setHospitalName(hospital.getHospitalName());
        certificate.setEventTitle("Private Donation Booking");
        certificate.setDonationDate(booking.getCompletedAt().toLocalDate());
        certificate.setIssuedAt(LocalDateTime.now());
        certificate.setStatus(CertificateStatus.ACTIVE);

        return certificateDao.save(certificate);
    }
}