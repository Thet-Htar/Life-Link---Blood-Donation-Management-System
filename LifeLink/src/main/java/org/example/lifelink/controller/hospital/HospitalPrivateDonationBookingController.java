package org.example.lifelink.controller.hospital;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.lifelink.dto.donor.booking.PrivateBookingHospitalResponse;
import org.example.lifelink.dto.donor.booking.PrivateDonationBookingResponse;
import org.example.lifelink.dto.hospital.booking.CompletePrivateDonationBookingRequest;
import org.example.lifelink.dto.hospital.booking.ConfirmPrivateDonationBookingRequest;
import org.example.lifelink.dto.hospital.booking.DeferPrivateDonationBookingRequest;
import org.example.lifelink.dto.hospital.inventory.PrivateBookingInventorySourceResponse;
import org.example.lifelink.service.hospital.HospitalPrivateDonationBookingService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/lifelink/hospital/private-bookings")
public class HospitalPrivateDonationBookingController {

    private final HospitalPrivateDonationBookingService bookingService;

    @GetMapping("/register")
    public ResponseEntity<List<PrivateDonationBookingResponse>> getMyBookings(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                bookingService.getMyBookings(
                        authentication.getName())
        );
    }

    @GetMapping
    public ResponseEntity<List<PrivateBookingHospitalResponse>> getAvailableHospitals() {
        return ResponseEntity.ok(
                bookingService.getAvailableHospitals()
        );
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<PrivateDonationBookingResponse> getMyBooking(
            Authentication authentication,
            @PathVariable Long bookingId
    ) {
        return ResponseEntity.ok(
                bookingService.getMyBooking(
                        authentication.getName(),
                        bookingId
                )
        );
    }

    @PostMapping("/{bookingId}/confirm")
    public ResponseEntity<PrivateDonationBookingResponse> confirmBooking(
            Authentication authentication,
            @PathVariable Long bookingId,
            @Valid @RequestBody ConfirmPrivateDonationBookingRequest request
    ) {
        return ResponseEntity.ok(
                bookingService.confirmBooking(
                        authentication.getName(),
                        bookingId,
                        request
                )
        );
    }

    @PostMapping("/{bookingId}/complete")
    public ResponseEntity<PrivateDonationBookingResponse> completeDonation(
            Authentication authentication,
            @PathVariable Long bookingId,
            @Valid @RequestBody CompletePrivateDonationBookingRequest request
    ) {
        return ResponseEntity.ok(
                bookingService.completeDonation(
                        authentication.getName(),
                        bookingId,
                        request
                )
        );
    }

    @PostMapping("/{bookingId}/no-show")
    public ResponseEntity<PrivateDonationBookingResponse>
    markNoShow(
            Authentication authentication,
            @PathVariable Long bookingId
    ) {
        return ResponseEntity.ok(
                bookingService.markNoShow(
                        authentication.getName(),
                        bookingId
                )
        );
    }

    @PostMapping("/{bookingId}/defer")
    public ResponseEntity<PrivateDonationBookingResponse> deferDonation(
            Authentication authentication,
            @PathVariable Long bookingId,
            @Valid @RequestBody DeferPrivateDonationBookingRequest request
    ) {
        return ResponseEntity.ok(
                bookingService.deferDonation(
                        authentication.getName(),
                        bookingId,
                        request
                )
        );
    }

    @GetMapping("/inventory-sources")
    public ResponseEntity<Page<PrivateBookingInventorySourceResponse>>
    getInventorySources(
            Authentication authentication,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                bookingService.getInventorySources(
                        authentication.getName(),
                        search,
                        page,
                        size
                )
        );
    }

}