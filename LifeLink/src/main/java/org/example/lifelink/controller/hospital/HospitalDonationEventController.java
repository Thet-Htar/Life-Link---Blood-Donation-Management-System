package org.example.lifelink.controller.hospital;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.lifelink.dto.hospital.event.DeferDonationRequest;
import org.example.lifelink.dto.hospital.event.DonationEventRequest;
import org.example.lifelink.dto.hospital.event.DonationEventResponse;
import org.example.lifelink.dto.hospital.event.RegisteredEventDonorResponse;
import org.example.lifelink.dto.hospital.inventory.EventInventorySourceResponse;
import org.example.lifelink.service.hospital.DonationEventService;
import org.example.lifelink.service.hospital.HospitalPrivateDonationBookingService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lifelink/hospital/donation-events")
@RequiredArgsConstructor
public class HospitalDonationEventController {

    private final DonationEventService donationEventService;
    private final HospitalPrivateDonationBookingService hospitalPrivateDonationBookingService;

    @PostMapping("/drafts")
    public ResponseEntity<DonationEventResponse> createDraft(
            Authentication authentication,
            @RequestBody DonationEventRequest request
    ) {
        DonationEventResponse response = donationEventService
                .createDraft(
                        authentication.getName(),
                        request
                );
        return ResponseEntity.status(
                        HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{eventId}/draft")
    public ResponseEntity<DonationEventResponse> updateDraft(
            Authentication authentication,
            @PathVariable Long eventId,
            @RequestBody DonationEventRequest request
    ) {
        DonationEventResponse response = donationEventService
                .updateDraft(
                        authentication.getName(),
                        eventId,
                        request
                );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/publish")
    public ResponseEntity<DonationEventResponse> createAndPublish(
            Authentication authentication,
            @RequestBody DonationEventRequest request
    ) {
        DonationEventResponse response = donationEventService
                .createAndPublish(
                        authentication.getName(),
                        request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{eventId}/publish")
    public ResponseEntity<DonationEventResponse> publishDraft(
            Authentication authentication,
            @PathVariable Long eventId,
            @RequestBody DonationEventRequest request
    ) {
        DonationEventResponse response = donationEventService
                .publishDraft(
                        authentication.getName(),
                        eventId,
                        request
                );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<DonationEventResponse> updatePublishedEvent(
            Authentication authentication,
            @PathVariable Long eventId,
            @Valid @RequestBody DonationEventRequest request
    ) {
        DonationEventResponse response =
                donationEventService.updatePublishedEvent(
                        authentication.getName(),
                        eventId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DonationEventResponse>> getMyEvents(Authentication authentication) {
        return ResponseEntity.ok(donationEventService
                .getMyEvents(
                        authentication.getName())
        );
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<DonationEventResponse> getMyEvent(Authentication authentication, @PathVariable Long eventId) {
        return ResponseEntity.ok(donationEventService
                .getMyEvent(
                        authentication.getName(),
                        eventId)
        );
    }

    @GetMapping("/{eventId}/registrations")
    public ResponseEntity<List<RegisteredEventDonorResponse>> getRegisteredDonors(
            Authentication authentication,
            @PathVariable Long eventId
    ) {
        List<RegisteredEventDonorResponse> donors = donationEventService
                .getRegisteredDonors(
                        authentication.getName(),
                        eventId
                );

        return ResponseEntity.ok(donors);
    }

    @PostMapping("/{eventId}/registrations/{registrationId}/complete")
    public ResponseEntity<RegisteredEventDonorResponse>
    completeDonation(
            Authentication authentication,
            @PathVariable Long eventId,
            @PathVariable Long registrationId
    ) {
        RegisteredEventDonorResponse response = donationEventService
                .completeDonation(
                        authentication.getName(),
                        eventId,
                        registrationId
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{eventId}/registrations/{registrationId}/no-show")
    public ResponseEntity<RegisteredEventDonorResponse> markNoShow(
            Authentication authentication,
            @PathVariable Long eventId,
            @PathVariable Long registrationId
    ) {
        RegisteredEventDonorResponse response = donationEventService
                .markNoShow(
                        authentication.getName(),
                        eventId,
                        registrationId
                );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{eventId}/registrations/{registrationId}/defer")
    public ResponseEntity<RegisteredEventDonorResponse> deferDonation(
            Authentication authentication,
            @PathVariable Long eventId,
            @PathVariable Long registrationId,
            @Valid @RequestBody DeferDonationRequest request
    ) {
        RegisteredEventDonorResponse response = donationEventService
                .deferDonation(
                        authentication.getName(),
                        eventId,
                        registrationId,
                        request
                );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/inventory-source-registrations")
    public ResponseEntity<Page<EventInventorySourceResponse>>
    getInventorySources(
            Authentication authentication,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                donationEventService.getInventorySourceRegistrations(
                        authentication.getName(),
                        search,
                        page,
                        size
                )
        );

    }
}
