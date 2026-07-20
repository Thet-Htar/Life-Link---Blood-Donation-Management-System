package org.example.lifelink.service.hospital;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dao.donor.PrivateDonationBookingDao;
import org.example.lifelink.dao.hospital.HospitalDao;
import org.example.lifelink.dao.hospital.PrivateBookingDao;
import org.example.lifelink.dto.donor.booking.PrivateBookingHospitalResponse;
import org.example.lifelink.dto.donor.booking.PrivateDonationBookingResponse;
import org.example.lifelink.dto.hospital.booking.CompletePrivateDonationBookingRequest;
import org.example.lifelink.dto.hospital.booking.ConfirmPrivateDonationBookingRequest;
import org.example.lifelink.dto.hospital.booking.DeferPrivateDonationBookingRequest;
import org.example.lifelink.dto.hospital.inventory.PrivateBookingInventorySourceResponse;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.donor.booking.PrivateDonationBooking;
import org.example.lifelink.entity.donor.booking.PrivateDonationBookingStatus;
import org.example.lifelink.entity.hospital.Hospital;
import org.example.lifelink.service.common.DonationCompletionService;
import org.example.lifelink.service.common.FindAuthenticatedHospitals;
import org.example.lifelink.service.common.PrivateDonationBookingHelper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalPrivateDonationBookingService {

    private final PrivateDonationBookingDao bookingDao;
    private final HospitalDao hospitalDao;
    private final PrivateDonationBookingHelper bookingMapper;
    private final DonationCompletionService donationCompletionService;
    private final DonationCertificateService donationCertificateService;
    private final PrivateBookingDao privateDonationBookingDao;
    private final FindAuthenticatedHospitals findHospitals;

    @Transactional(readOnly = true)
    public List<PrivateDonationBookingResponse> getMyBookings(String authenticatedEmail) {

        return bookingDao
                .findAllByHospital_User_EmailIgnoreCaseOrderByBookingDateAscStartTimeAsc(
                        authenticatedEmail)
                .stream()
                .map(bookingMapper::bookingResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PrivateDonationBookingResponse getMyBooking(
            String authenticatedEmail,
            Long bookingId) {

        PrivateDonationBooking booking = findOwnedBooking(
                authenticatedEmail,
                bookingId);

        return bookingMapper.bookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<PrivateBookingHospitalResponse> getAvailableHospitals() {

        return hospitalDao
                .findAll()
                .stream()
                .map(hospital ->
                        new PrivateBookingHospitalResponse(
                                hospital.getId(),
                                hospital.getHospitalName()))
                .toList();
    }

    @Transactional
    public PrivateDonationBookingResponse confirmBooking(
            String authenticatedEmail,
            Long bookingId,
            ConfirmPrivateDonationBookingRequest request) {

        PrivateDonationBooking booking = findOwnedBooking(
                authenticatedEmail,
                bookingId);

        ensureAppointmentHasNotEnded(booking);

        runTransition(() ->
                booking.confirm(
                        authenticatedEmail,
                        request.hospitalNote())
        );

        return saveAndResponsePrivateDonationsBookings(booking);
    }

    @Transactional
    public PrivateDonationBookingResponse completeDonation(
            String authenticatedEmail,
            Long bookingId,
            CompletePrivateDonationBookingRequest request) {

        PrivateDonationBooking booking = findOwnedBooking(
                authenticatedEmail,
                bookingId);
        // System.out.println("Booking Status:::" + booking.getStatus());

        if (booking.getStatus()
                != PrivateDonationBookingStatus.CONFIRMED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only confirmed bookings can be completed");
        }

        ensureAppointmentHasStarted(booking);
        Donor donor = booking.getDonor();

        if (donor == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Donor profile was not found");
        }

        runTransition(() ->
                booking.completeDonation(
                        authenticatedEmail,
                        request.outcomeNote()));

        PrivateDonationBooking saved = bookingDao.save(booking);

        donationCompletionService
                .recordCompletedDonation(
                        donor,
                        saved.getCompletedAt()
                                .toLocalDate());

        donationCertificateService.createForCompletedPrivateBooking(saved);

        return bookingMapper.bookingResponse(saved);
    }

    @Transactional
    public PrivateDonationBookingResponse markNoShow(
            String authenticatedEmail,
            Long bookingId) {

        PrivateDonationBooking booking = findOwnedBooking(
                authenticatedEmail,
                bookingId);

        ensureAppointmentHasEnded(booking);

        runTransition(() ->
                booking.markNoShow(
                        authenticatedEmail));

        return saveAndResponsePrivateDonationsBookings(booking);
    }

    @Transactional
    public PrivateDonationBookingResponse deferDonation(
            String authenticatedEmail,
            Long bookingId,
            DeferPrivateDonationBookingRequest request) {

        PrivateDonationBooking booking = findOwnedBooking(
                authenticatedEmail,
                bookingId);

        ensureAppointmentHasStarted(booking);

        runTransition(() ->
                booking.deferDonation(
                        authenticatedEmail,
                        request.reason(),
                        request.note()));

        return saveAndResponsePrivateDonationsBookings(booking);
    }

    private PrivateDonationBooking findOwnedBooking(
            String authenticatedEmail,
            Long bookingId) {

        return bookingDao
                .findByIdAndHospital_User_EmailIgnoreCase(
                        bookingId,
                        authenticatedEmail)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Private donation booking was not found")
                );
    }

    private PrivateDonationBookingResponse saveAndResponsePrivateDonationsBookings(PrivateDonationBooking booking) {

        PrivateDonationBooking saved = bookingDao.save(booking);
        return bookingMapper.bookingResponse(saved);

    }

    private void ensureAppointmentHasStarted(PrivateDonationBooking booking) {

        LocalDateTime appointmentStart = LocalDateTime.of(
                booking.getBookingDate(),
                booking.getStartTime());

        if (LocalDateTime.now()
                .isBefore(appointmentStart)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The appointment has not started yet");
        }
    }

    private void ensureAppointmentHasEnded(PrivateDonationBooking booking) {

        LocalDateTime appointmentEnd = LocalDateTime.of(
                booking.getBookingDate(),
                booking.getEndTime());

        if (LocalDateTime.now()
                .isBefore(appointmentEnd)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The appointment has not ended yet");
        }
    }

    private void ensureAppointmentHasNotEnded(PrivateDonationBooking booking) {

        LocalDateTime appointmentEnd = LocalDateTime.of(
                booking.getBookingDate(),
                booking.getEndTime());

        if (LocalDateTime.now()
                .isAfter(appointmentEnd)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An expired appointment cannot be confirmed");
        }
    }

    private void runTransition(Runnable transition) {

        try {
            transition.run();

        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage());

        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<PrivateBookingInventorySourceResponse> getInventorySources(
            String authenticatedEmail,
            String search,
            int page,
            int size
    ) {

        Hospital hospital = findHospitals.findAuthenticatedHospital(authenticatedEmail);

        if (page < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page must not be negative");
        }

        if (size < 1 || size > 50) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Size must be between 1 and 50");
        }

        String normalizedSearch = search == null ? "" : search.trim();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.DESC,
                        "completedAt"));

        return privateDonationBookingDao
                .findCompletedInventorySources(
                        hospital.getId(),
                        normalizedSearch,
                        pageable
                )
                .map(booking ->
                        new PrivateBookingInventorySourceResponse(
                                booking.getId(),
                                booking.getDonor().getId(),
                                booking.getDonor()
                                        .getUser()
                                        .getFullName(),
                                booking.getDonor()
                                        .getDonorCode(),
                                booking.getDonor()
                                        .getBloodType(),
                                booking.getBookingDate(),
                                booking.getCompletedAt()));
    }
}