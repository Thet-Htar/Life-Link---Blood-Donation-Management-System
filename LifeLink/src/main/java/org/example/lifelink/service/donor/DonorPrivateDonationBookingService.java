package org.example.lifelink.service.donor;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dao.donor.DonorDao;
import org.example.lifelink.dao.donor.PrivateDonationBookingDao;
import org.example.lifelink.dao.hospital.HospitalDao;
import org.example.lifelink.dto.donor.booking.CreatePrivateDonationBookingRequest;
import org.example.lifelink.dto.donor.booking.PrivateDonationBookingResponse;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.donor.booking.PrivateDonationBooking;
import org.example.lifelink.entity.donor.booking.PrivateDonationBookingStatus;
import org.example.lifelink.entity.hospital.Hospital;
import org.example.lifelink.service.common.PrivateDonationBookingHelper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DonorPrivateDonationBookingService {

    private static final List<PrivateDonationBookingStatus> ACTIVE_BOOKING_STATUSES = List.of(
            PrivateDonationBookingStatus.PENDING,
            PrivateDonationBookingStatus.CONFIRMED
    );

    private final PrivateDonationBookingDao bookingDao;
    private final DonorDao donorDao;
    private final HospitalDao hospitalDao;
    private final PrivateDonationBookingHelper bookingHelper;

    @Transactional
    public PrivateDonationBookingResponse createBooking(
            String authenticatedEmail,
            CreatePrivateDonationBookingRequest request
    ) {

        Donor donor = findAuthenticatedDonor(authenticatedEmail);
        validateDonorEligibility(donor);
        validateBookingTime(request);

        Hospital hospital = hospitalDao
                .findById(request.hospitalId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Hospital was not found")
                );

        boolean hasActiveBooking = bookingDao
                .existsByDonor_IdAndStatusIn(
                        donor.getId(),
                        ACTIVE_BOOKING_STATUSES);

        if (hasActiveBooking) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You already have an active private donation booking");
        }

        boolean slotUnavailable = bookingDao
                .existsByHospital_IdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(
                        hospital.getId(),
                        request.bookingDate(),
                        request.endTime(),
                        request.startTime(),
                        ACTIVE_BOOKING_STATUSES);

        if (slotUnavailable) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The selected appointment time is not available");
        }

        PrivateDonationBooking booking;

        try {
            booking = PrivateDonationBooking.create(
                    donor,
                    hospital,
                    request.bookingDate(),
                    request.startTime(),
                    request.endTime(),
                    request.donorNote()
            );

        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage());
        }

        PrivateDonationBooking saved = bookingDao.save(booking);
        return bookingHelper.bookingResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PrivateDonationBookingResponse> getMyBookings(
            String authenticatedEmail
    ) {
        findAuthenticatedDonor(authenticatedEmail);

        return bookingDao
                .findAllByDonor_User_EmailIgnoreCaseOrderByCreatedAtDesc(
                        authenticatedEmail)
                .stream()
                .map(bookingHelper::bookingResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PrivateDonationBookingResponse getMyBooking(
            String authenticatedEmail,
            Long bookingId) {
        PrivateDonationBooking booking =
                findOwnedBooking(
                        authenticatedEmail,
                        bookingId);

        return bookingHelper.bookingResponse(booking);
    }

    private Donor findAuthenticatedDonor(
            String authenticatedEmail) {
        return donorDao
                .findByUser_EmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Donor profile was not found"
                        )
                );
    }

    private PrivateDonationBooking findOwnedBooking(
            String authenticatedEmail,
            Long bookingId) {
        return bookingDao
                .findByIdAndDonor_User_EmailIgnoreCase(
                        bookingId,
                        authenticatedEmail)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Private donation booking was not found"
                        )
                );
    }

    private void validateDonorEligibility(Donor donor) {
        if (!donor.isEligible()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You are currently not eligible to book a donation");
        }

        if (donor.getBloodType() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Your blood type has not been recorded");
        }
    }

    private void validateBookingTime(
            CreatePrivateDonationBookingRequest request
    ) {
        if (!request.eligibilityDeclarationAccepted()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Eligibility declaration must be accepted");
        }

        if (request.bookingDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking date is required");
        }

        if (request.bookingDate().isBefore(
                LocalDate.now()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking date cannot be in the past");
        }

        if (request.startTime() == null ||
                request.endTime() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking start and end times are required");
        }

        if (!request.endTime().isAfter(request.startTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End time must be after start time");
        }

        LocalDateTime appointmentStart = LocalDateTime.of(
                request.bookingDate(),
                request.startTime());

        if (!appointmentStart.isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Appointment time must be in the future");
        }
    }
}