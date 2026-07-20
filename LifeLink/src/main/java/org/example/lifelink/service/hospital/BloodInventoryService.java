package org.example.lifelink.service.hospital;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dao.donor.DonationEventRegistrationDao;
import org.example.lifelink.dao.donor.PrivateDonationBookingDao;
import org.example.lifelink.dao.hospital.BloodInventoryUnitDao;
import org.example.lifelink.dao.hospital.HospitalDao;
import org.example.lifelink.dto.hospital.inventory.*;
import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.donor.booking.PrivateDonationBooking;
import org.example.lifelink.entity.donor.booking.PrivateDonationBookingStatus;
import org.example.lifelink.entity.hospital.Hospital;
import org.example.lifelink.entity.hospital.event.DonationEventRegistration;
import org.example.lifelink.entity.hospital.event.DonationEventRegistrationStatus;
import org.example.lifelink.entity.hospital.event.DonationEvents;
import org.example.lifelink.entity.hospital.inventory.BloodInventoryUnit;
import org.example.lifelink.entity.hospital.inventory.BloodUnitSource;
import org.example.lifelink.entity.hospital.inventory.BloodUnitStatus;
import org.example.lifelink.service.common.FindAuthenticatedHospitals;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BloodInventoryService {

    private static final int EXPIRING_SOON_DAYS = 7;
    private final BloodInventoryUnitDao bloodInventoryUnitDao;
    private final DonationEventRegistrationDao registrationDao;
    private final PrivateDonationBookingDao privateDonationBookingDao;
    private final FindAuthenticatedHospitals findHospital;

    @Transactional
    public BloodInventoryUnitResponse createInventoryUnit(
            String authenticatedEmail,
            CreateBloodUnitRequest request) {

        Hospital hospital = findHospital.findAuthenticatedHospital(authenticatedEmail);

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Blood inventory request is required");
        }

        if (request.source() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Blood unit source is required");
        }

        String normalizedUnitCode = normalizeUnitCode(request.unitCode());

        boolean duplicateUnitCode = bloodInventoryUnitDao
                .existsByHospital_IdAndUnitCodeIgnoreCase(
                        hospital.getId(),
                        normalizedUnitCode);

        if (duplicateUnitCode) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A blood unit with this code already exists for this hospital");
        }

        try {
            BloodInventoryUnit unit =
                    switch (request.source()) {

                        case MANUAL_ENTRY -> createManualUnit(
                                hospital,
                                normalizedUnitCode,
                                request);

                        case DONATION_EVENT -> createDonationEventUnit(
                                hospital,
                                normalizedUnitCode,
                                request);

                        case PRIVATE_BOOKING -> createPrivateBookingUnit(
                                hospital,
                                normalizedUnitCode,
                                request);
                    };

            BloodInventoryUnit saved = bloodInventoryUnitDao.save(unit);

            return ResponseBloodInventoryUnits(saved);

        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage(),
                    exception
            );

        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage(),
                    exception
            );

        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This inventory unit or donation source has already been recorded",
                    exception
            );
        }
    }

    private BloodInventoryUnit createManualUnit(
            Hospital hospital,
            String normalizedUnitCode,
            CreateBloodUnitRequest request) {

        if (request.bloodType() == null
                || request.collectionDate() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Blood type and collection date are required for manual entry"
            );
        }

        if (request.eventRegistrationId() != null
                || request.privateBookingId() != null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Manual entry cannot contain an event registration or private booking reference"
            );
        }

        return BloodInventoryUnit.createManual(
                hospital,
                normalizedUnitCode,
                request.bloodType(),
                request.volumeMl(),
                request.collectionDate(),
                request.expiryDate(),
                request.storageLocation(),
                request.notes()
        );
    }

    private BloodInventoryUnit createDonationEventUnit(
            Hospital hospital,
            String normalizedUnitCode,
            CreateBloodUnitRequest request) {

        if (request.eventRegistrationId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Event registration is required for a donation-event unit");
        }

        if (request.privateBookingId() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Donation-event inventory cannot contain a private booking reference");
        }

        DonationEventRegistration registration =
                registrationDao
                        .findOwnedRegistrationForInventory(
                                request.eventRegistrationId(),
                                hospital.getId())
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Completed donation registration was not found"));

        if (registration.getStatus()
                != DonationEventRegistrationStatus.COMPLETED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only completed donation registrations can create inventory units");
        }

        if (bloodInventoryUnitDao
                .existsByEventRegistration_Id(
                        registration.getId()
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A blood inventory unit already exists for this donation");
        }

        DonationEvents event =
                registration.getDonationEvent();

        if (event == null
                || event.getHospital() == null
                || !Objects.equals(
                event.getHospital().getId(),
                hospital.getId()
        )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This donation does not belong to your hospital");
        }

        Donor donor =
                registration.getDonor();

        if (donor == null
                || donor.getBloodType() == null) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Donor profile or blood type is missing");
        }

        LocalDate collectionDate =
                registration.getCompletedAt() != null
                        ? registration
                          .getCompletedAt()
                          .toLocalDate()
                        : event.getEventDate();

        if (collectionDate == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The donation collection date could not be determined"
            );
        }

        return BloodInventoryUnit
                .createFromDonationEvent(
                        hospital,
                        registration,
                        normalizedUnitCode,
                        donor.getBloodType(),
                        request.volumeMl(),
                        collectionDate,
                        request.expiryDate(),
                        request.storageLocation(),
                        request.notes()
                );
    }

    private BloodInventoryUnit createPrivateBookingUnit(
            Hospital hospital,
            String normalizedUnitCode,
            CreateBloodUnitRequest request) {

        if (request.privateBookingId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Private donation booking is required"
            );
        }

        if (request.eventRegistrationId() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Private-booking inventory cannot contain an event registration reference"
            );
        }

        PrivateDonationBooking booking =
                privateDonationBookingDao
                        .findByIdAndHospital_Id(
                                request.privateBookingId(),
                                hospital.getId()
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Private donation booking was not found"
                                )
                        );

        if (booking.getStatus()
                != PrivateDonationBookingStatus.COMPLETED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only completed private donation bookings can create inventory units"
            );
        }

        if (booking.getCompletedAt() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The private booking completion date is missing"
            );
        }

        if (bloodInventoryUnitDao
                .existsByPrivateDonationBooking_Id(booking.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A blood inventory unit already exists for this private donation booking"
            );
        }

        Donor donor = booking.getDonor();

        if (donor == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The private booking donor profile is missing");
        }

        if (donor.getBloodType() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The private booking donor blood type is missing");
        }

        if (booking.getHospital() == null
                || !Objects.equals(
                booking.getHospital().getId(),
                hospital.getId()
        )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This private donation booking does not belong to your hospital");
        }

        return BloodInventoryUnit
                .createFromPrivateBooking(
                        hospital,
                        booking,
                        normalizedUnitCode,
                        request.volumeMl(),
                        request.expiryDate(),
                        request.storageLocation(),
                        request.notes()
                );
    }


    @Transactional(readOnly = true)
    public List<BloodInventoryUnitResponse> getHospitalInventory(String authenticatedEmail) {

        Hospital hospital = findHospital.findAuthenticatedHospital(authenticatedEmail);

        return bloodInventoryUnitDao
                .findAllByHospital_IdOrderByCreatedAtDesc(
                        hospital.getId())
                .stream()
                .map(this::ResponseBloodInventoryUnits)
                .toList();
    }

    @Transactional
    public BloodInventoryUnitResponse getInventoryUnit(
            String authenticatedEmail,
            Long unitId) {

        Hospital hospital = findHospital.findAuthenticatedHospital(authenticatedEmail);

        BloodInventoryUnit unit =
                findOwnedUnit(
                        unitId,
                        hospital.getId());

        if ((unit.getStatus()
                == BloodUnitStatus.AVAILABLE
                || unit.getStatus()
                == BloodUnitStatus.RESERVED)
                && unit.isExpired()) {

            unit.markExpired();
            unit = bloodInventoryUnitDao.save(unit);
        }

        return ResponseBloodInventoryUnits(unit);
    }

    @Transactional
    public BloodInventoryUnitResponse updateUnit(
            String authenticatedEmail,
            Long unitId,
            UpdateBloodUnitRequest request) {

        Hospital hospital = findHospital.findAuthenticatedHospital(authenticatedEmail);

        BloodInventoryUnit unit =
                findOwnedUnit(
                        unitId,
                        hospital.getId());

        if (unit.getSource()
                != BloodUnitSource.MANUAL_ENTRY) {

            boolean bloodTypeChanged =
                    request.bloodType()
                            != unit.getBloodType();

            boolean collectionDateChanged =
                    !Objects.equals(
                            request.collectionDate(),
                            unit.getCollectionDate());

            if (bloodTypeChanged
                    || collectionDateChanged) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Blood type and collection date cannot be changed for linked donation units");
            }
        }

        try {
            unit.updateDetails(
                    request.bloodType(),
                    request.volumeMl(),
                    request.collectionDate(),
                    request.expiryDate(),
                    request.storageLocation(),
                    request.notes()
            );

            BloodInventoryUnit saved = bloodInventoryUnitDao.save(unit);
            return ResponseBloodInventoryUnits(saved);

        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage(),
                    exception
            );

        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage(),
                    exception
            );
        }
    }


    @Transactional
    public BloodInventoryUnitResponse reserveUnit(
            String authenticatedEmail,
            Long unitId,
            ReserveBloodUnitRequest request) {

        Hospital hospital = findHospital.findAuthenticatedHospital(authenticatedEmail);

        BloodInventoryUnit unit = findOwnedUnit(
                        unitId,
                        hospital.getId());

        try {
            unit.reserve(
                    request.reservedFor(),
                    request.reservationNote(),
                    authenticatedEmail
            );

            BloodInventoryUnit saved = bloodInventoryUnitDao.save(unit);

            return ResponseBloodInventoryUnits(saved);

        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage(),
                    exception
            );

        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage(),
                    exception
            );
        }
    }

    @Transactional
    public BloodInventoryUnitResponse releaseReservation(
            String authenticatedEmail,
            Long unitId
    ) {
        Hospital hospital = findHospital.findAuthenticatedHospital(authenticatedEmail);

        BloodInventoryUnit unit = findOwnedUnit(
                        unitId,
                        hospital.getId()
                );

        try {
            unit.releaseReservation();

            BloodInventoryUnit saved = bloodInventoryUnitDao.save(unit);

            return ResponseBloodInventoryUnits(saved);

        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage(),
                    exception);
        }
    }

    @Transactional
    public BloodInventoryUnitResponse issueUnit(
            String authenticatedEmail,
            Long unitId,
            IssueBloodUnitRequest request) {

        Hospital hospital = findHospital.findAuthenticatedHospital(authenticatedEmail);

        BloodInventoryUnit unit = findOwnedUnit(
                unitId,
                hospital.getId());

        try {
            unit.issue(
                    request.issuePurpose(),
                    request.issuedDepartment(),
                    request.patientReference(),
                    request.receivedBy(),
                    authenticatedEmail,
                    request.issueNote()
            );

            BloodInventoryUnit saved = bloodInventoryUnitDao.save(unit);
            return ResponseBloodInventoryUnits(saved);

        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage(),
                    exception);

        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage(),
                    exception);
        }
    }

    @Transactional
    public BloodInventoryUnitResponse discardUnit(
            String authenticatedEmail,
            Long unitId,
            DiscardBloodUnitRequest request) {

        Hospital hospital = findHospital.findAuthenticatedHospital(authenticatedEmail);

        BloodInventoryUnit unit = findOwnedUnit(
                unitId,
                hospital.getId());

        try {
            unit.discard(
                    request.discardReason(),
                    request.discardNote(),
                    authenticatedEmail
            );

            BloodInventoryUnit saved = bloodInventoryUnitDao.save(unit);
            return ResponseBloodInventoryUnits(saved);

        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage(),
                    exception
            );

        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage(),
                    exception);
        }
    }

    @Transactional(readOnly = true)
    public BloodInventorySummaryResponse getSummary(
            String authenticatedEmail
    ) {
        Hospital hospital = findHospital.findAuthenticatedHospital(authenticatedEmail);

        Long hospitalId = hospital.getId();
        LocalDate today = LocalDate.now();
        long totalUnits = bloodInventoryUnitDao
                .countByHospital_Id(
                        hospitalId);

        long availableUnits = countByStatus(
                hospitalId,
                BloodUnitStatus.AVAILABLE);

        long reservedUnits = countByStatus(
                hospitalId,
                BloodUnitStatus.RESERVED);

        long issuedUnits = countByStatus(
                hospitalId,
                BloodUnitStatus.ISSUED);

        long expiredUnits = countByStatus(
                hospitalId,
                BloodUnitStatus.EXPIRED);

        long discardedUnits = countByStatus(
                hospitalId,
                BloodUnitStatus.DISCARDED);

        long expiringSoonUnits = bloodInventoryUnitDao
                .countByHospital_IdAndStatusInAndExpiryDateBetween(
                        hospitalId,
                        List.of(
                                BloodUnitStatus.AVAILABLE,
                                BloodUnitStatus.RESERVED),
                        today,
                        today.plusDays(
                                EXPIRING_SOON_DAYS));

        List<BloodTypeInventorySummary> bloodTypes = Arrays.stream(
                        BloodType.values())
                .map(bloodType -> {
                    long available = bloodInventoryUnitDao
                            .countByHospital_IdAndBloodTypeAndStatusAndExpiryDateGreaterThanEqual(
                                    hospitalId,
                                    bloodType,
                                    BloodUnitStatus.AVAILABLE,
                                    today);

                    long reserved = bloodInventoryUnitDao
                            .countByHospital_IdAndBloodTypeAndStatusAndExpiryDateGreaterThanEqual(
                                    hospitalId,
                                    bloodType,
                                    BloodUnitStatus.RESERVED,
                                    today);

                    long totalUsable = available + reserved;

                    return new BloodTypeInventorySummary(
                            bloodType,
                            available,
                            reserved,
                            totalUsable,
                            determineStockLevel(available));
                }).toList();

        return new BloodInventorySummaryResponse(
                totalUnits,
                availableUnits,
                reservedUnits,
                issuedUnits,
                expiredUnits,
                discardedUnits,
                expiringSoonUnits,
                bloodTypes);
    }


    private BloodInventoryUnit findOwnedUnit(
            Long unitId,
            Long hospitalId
    ) {
        if (unitId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Blood inventory unit ID is required"
            );
        }

        return bloodInventoryUnitDao
                .findByIdAndHospital_Id(
                        unitId,
                        hospitalId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Blood inventory unit was not found"
                        )
                );
    }

    private long countByStatus(
            Long hospitalId,
            BloodUnitStatus status) {

        return bloodInventoryUnitDao
                .countByHospital_IdAndStatus(
                        hospitalId,
                        status
                );
    }

    private String determineStockLevel(long availableUnits) {

        if (availableUnits <= 2) {
            return "CRITICAL";
        }

        if (availableUnits <= 5) {
            return "LOW";
        }
        return "HEALTHY";
    }

    private String normalizeUnitCode(String unitCode) {

        if (unitCode == null
                || unitCode.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unit code is required"
            );
        }

        return unitCode
                .trim()
                .toUpperCase(
                        Locale.ROOT
                );
    }


    private BloodInventoryUnitResponse ResponseBloodInventoryUnits(BloodInventoryUnit unit) {

        DonationEventRegistration registration = unit.getEventRegistration();

        DonationEvents event =
                registration == null
                        ? null
                        : registration
                          .getDonationEvent();

        PrivateDonationBooking privateBooking = unit.getPrivateDonationBooking();
        Hospital hospital = unit.getHospital();

        return new BloodInventoryUnitResponse(
                unit.getId(),
                unit.getUnitCode(),
                unit.getBloodType(),
                unit.getVolumeMl(),
                unit.getCollectionDate(),
                unit.getExpiryDate(),
                unit.getStatus(),
                unit.getSource(),
                unit.getStorageLocation(),
                unit.getNotes(),

                registration == null ? null : registration.getId(),
                event == null ? null : event.getId(),
                event == null ? null : event.getEventTitle(),
                privateBooking == null ? null : privateBooking.getId(),

                unit.getReservedFor(),
                unit.getReservationNote(),
                unit.getReservedAt(),
                unit.getReservedBy(),

                unit.getIssuePurpose(),
                unit.getIssuedDepartment(),
                unit.getPatientReference(),
                unit.getReceivedBy(),
                unit.getIssuedAt(),
                unit.getIssuedBy(),
                unit.getIssueNote(),

                unit.getDiscardReason(),
                unit.getDiscardNote(),
                unit.getDiscardedAt(),
                unit.getDiscardedBy(),

                hospital == null ? null : hospital.getId(),
                hospital == null ? null : hospital.getHospitalName(),

                unit.getCreatedAt(),
                unit.getUpdatedAt(),
                unit.getVersion()
        );
    }
}