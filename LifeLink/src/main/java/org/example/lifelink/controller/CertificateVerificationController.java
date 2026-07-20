package org.example.lifelink.controller;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dto.hospital.certificate.DonationCertificateResponse;
import org.example.lifelink.dto.hospital.event.PublicDonationEventResponse;
import org.example.lifelink.service.hospital.DonationCertificateService;
import org.example.lifelink.service.hospital.DonationEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lifelink/public")
@RequiredArgsConstructor
public class CertificateVerificationController {

    private final DonationCertificateService certificateService;
    private final DonationEventService donationEventService;

    @GetMapping("/certificates/verify/{verificationCode}")
    public ResponseEntity<DonationCertificateResponse> verifyByVerificationCode(
            @PathVariable String verificationCode) {
        return ResponseEntity.ok(certificateService.
                verifyCertificate(verificationCode));
    }

    @GetMapping("/certificates/verify-number/{certificateNumber}")
    public ResponseEntity<DonationCertificateResponse> verifyByCertificateNumber(
            @PathVariable String certificateNumber) {
        return ResponseEntity.ok(certificateService.
                verifyByCertificateNumber(certificateNumber));
    }

    @GetMapping("/events")
    public List<PublicDonationEventResponse> getCurrentEvents(
            @RequestParam(defaultValue = "3")
            int limit) {
        return donationEventService
                .getCurrentEvents(limit);
    }
}