package org.example.lifelink.controller.hospital;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.lifelink.dto.hospital.certificate.DonationCertificateResponse;
import org.example.lifelink.dto.hospital.certificate.RevokeCertificateRequest;
import org.example.lifelink.service.hospital.DonationCertificateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/lifelink/hospital/certificates")
@RequiredArgsConstructor
public class HospitalCertificateController {

    private final DonationCertificateService certificateService;

    @GetMapping
    public ResponseEntity<List<DonationCertificateResponse>> getHospitalCertificates(
            Authentication authentication) {

        validateAuthentication(authentication);
        List<DonationCertificateResponse> certificates = certificateService
                .getHospitalCertificates(authentication.getName());
        return ResponseEntity.ok(certificates);
    }

    @PostMapping("/{certificateId}/revoke")
    public ResponseEntity<DonationCertificateResponse> revokeCertificate(
            Authentication authentication,
            @PathVariable Long certificateId,
            @Valid @RequestBody RevokeCertificateRequest request
    ) {
        validateAuthentication(authentication);

        DonationCertificateResponse response = certificateService
                .revokeCertificate(
                authentication.getName(),
                certificateId,
                request.reason()
        );

        return ResponseEntity.ok(response);
    }

    private void validateAuthentication(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Missing authentication credentials");
        }
    }
}