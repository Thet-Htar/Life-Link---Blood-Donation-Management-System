package org.example.lifelink.controller.donor;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dto.hospital.certificate.DonationCertificateResponse;
import org.example.lifelink.service.hospital.DonationCertificateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/lifelink/donor/certificates")
@RequiredArgsConstructor
public class DonorCertificateController {

    private final DonationCertificateService certificateService;


    @GetMapping
    public ResponseEntity<List<DonationCertificateResponse>> getMyCertificates(
            Authentication authentication
    ) {
        validateAuthentication(authentication);
        List<DonationCertificateResponse> certificates = certificateService.getDonorCertificates(authentication.getName());
        return ResponseEntity.ok(certificates);
    }

    private void validateAuthentication(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authentication credentials");
        }
    }
}