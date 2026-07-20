package org.example.lifelink.controller.donor;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.lifelink.dto.donor.event.DonorEventRegistrationResponse;
import org.example.lifelink.dto.donor.event.DonorEventResponse;
import org.example.lifelink.dto.donor.profile.DonorProfileResponse;
import org.example.lifelink.dto.donor.profile.DonorProfileUpdateRequest;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.service.donor.DonorEventService;
import org.example.lifelink.service.donor.DonorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lifelink/donor")
@RequiredArgsConstructor
public class DonorEventController {

    private final DonorEventService donorEventService;
    private final DonorService donorService;

    @GetMapping("/profile")
    public DonorProfileResponse getProfile(Authentication authentication) {
        return donorService.getDonorProfile(authentication.getName());
    }

    @PutMapping("/profile")
    public ResponseEntity<DonorProfileResponse> updateProfile(Authentication authentication,
                                                              @Valid @RequestBody DonorProfileUpdateRequest request
    ) {
        Donor updatedDonor = donorService
                .updateDonorProfile(authentication.getName(), request);
        return ResponseEntity.ok(DonorProfileResponse.fromEntity(updatedDonor));
    }

    @GetMapping("/donation-events")
    public ResponseEntity<List<DonorEventResponse>> getRecommendedEvents(Authentication authentication) {
        List<DonorEventResponse> events = donorEventService
                .getRecommendedEvents(authentication.getName());
        return ResponseEntity.ok(events);
    }

    @GetMapping("/donation-events/{eventId}")
    public ResponseEntity<DonorEventResponse> getEventDetail(Authentication authentication, @PathVariable Long eventId) {
        DonorEventResponse event = donorEventService
                .getEventDetail(authentication.getName(), eventId);
        return ResponseEntity.ok(event);
    }

    @PostMapping("/donation-events/{eventId}/register")
    public ResponseEntity<DonorEventRegistrationResponse> registerForEvent(Authentication authentication, @PathVariable Long eventId) {
        DonorEventRegistrationResponse registration = donorEventService
                .registerForEvent(authentication.getName(), eventId);
        return ResponseEntity.status(HttpStatus.CREATED).body(registration);
    }

    @PutMapping("/donation-events/{eventId}/cancel")
    public ResponseEntity<DonorEventRegistrationResponse> cancelRegistration(Authentication authentication,
                                                                             @PathVariable Long eventId
    ) {
        DonorEventRegistrationResponse registration = donorEventService
                .cancelRegistration(authentication.getName(), eventId);
        return ResponseEntity.ok(registration);
    }

    @GetMapping("/registrations")
    public ResponseEntity<List<DonorEventRegistrationResponse>> getMyRegistrations(Authentication authentication) {
        List<DonorEventRegistrationResponse> registrations = donorEventService
                .getMyRegistrations(authentication.getName());
        return ResponseEntity.ok(registrations);
    }

}