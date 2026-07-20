package org.example.lifelink.controller.donor;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.lifelink.dto.donor.booking.CreatePrivateDonationBookingRequest;
import org.example.lifelink.dto.donor.booking.PrivateBookingHospitalResponse;
import org.example.lifelink.dto.donor.booking.PrivateDonationBookingResponse;
import org.example.lifelink.service.donor.DonorPrivateDonationBookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/lifelink/donor/private-bookings")
public class DonorPrivateDonationBookingController {

    private final DonorPrivateDonationBookingService bookingService;

    @PostMapping
    public ResponseEntity<PrivateDonationBookingResponse> createBooking(
            Authentication authentication,
            @Valid @RequestBody CreatePrivateDonationBookingRequest request
    ) {
        PrivateDonationBookingResponse response =
                bookingService.createBooking(
                        authentication.getName(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<PrivateDonationBookingResponse>> getMyBookings(
                                        Authentication authentication
    ) {
        return ResponseEntity.ok(
                bookingService.getMyBookings(
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<PrivateDonationBookingResponse>
    getMyBooking(
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
}