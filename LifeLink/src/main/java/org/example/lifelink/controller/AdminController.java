package org.example.lifelink.controller;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dto.admin.AdminDonorResponse;
import org.example.lifelink.dto.admin.AdminHospitalResponse;
import org.example.lifelink.entity.VerificationStatus;
import org.example.lifelink.service.auth.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/lifelink/admin")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/hospitals")
    public ResponseEntity<Page<AdminHospitalResponse>>
    getHospitals(
            @RequestParam(defaultValue = "")
            String search,
            @RequestParam(required = false)
            VerificationStatus status,
            @RequestParam(defaultValue = "0")
            int page,
            @RequestParam(defaultValue = "10")
            int size
    ) {
        return ResponseEntity.ok(
                adminService.getHospitals(
                        search,
                        status,
                        page,
                        size
                )
        );
    }

    @PutMapping("/hospitals/{hospitalId}/approve")
    public ResponseEntity<Map<String, Object>> approveHospital(
            Authentication authentication,
            @PathVariable Long hospitalId
    ) {
        VerificationStatus status =
                adminService.approveHospital(
                        authentication.getName(),
                        hospitalId
                );

        return ResponseEntity.ok(
                Map.of(
                        "status", status,
                        "message",
                        "Hospital registration approved successfully."
                )
        );
    }

    @PutMapping("/hospitals/{hospitalId}/lock")
    public ResponseEntity<Map<String, String>> lockHospital(
            @PathVariable Long hospitalId
    ) {
        adminService.lockHospital(hospitalId);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Hospital account locked successfully."
                )
        );
    }

    @PutMapping("/hospitals/{hospitalId}/unlock")
    public ResponseEntity<Map<String, String>> unlockHospital(
            @PathVariable Long hospitalId
    ) {
        adminService.unlockHospital(hospitalId);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Hospital account unlocked successfully."
                )
        );
    }

    @GetMapping("/donors")
    public ResponseEntity<Page<AdminDonorResponse>>
    getDonors(
            @RequestParam(defaultValue = "")
            String search,
            @RequestParam(defaultValue = "0")
            int page,
            @RequestParam(defaultValue = "10")
            int size
    ) {
        return ResponseEntity.ok(
                adminService.getDonors(
                        search,
                        page,
                        size
                )
        );
    }

    @PutMapping("/donors/{donorId}/lock")
    public ResponseEntity<Map<String, String>>
    lockDonor(
            @PathVariable Long donorId
    ) {
        adminService.lockDonor(donorId);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Donor account locked successfully."
                )
        );
    }

    @PutMapping("/donors/{donorId}/unlock")
    public ResponseEntity<Map<String, String>>
    unlockDonor(
            @PathVariable Long donorId
    ) {
        adminService.unlockDonor(donorId);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Donor account unlocked successfully."
                )
        );
    }
}