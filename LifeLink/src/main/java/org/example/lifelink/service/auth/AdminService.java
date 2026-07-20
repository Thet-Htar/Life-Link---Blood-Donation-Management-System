package org.example.lifelink.service.auth;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dao.UserDao;
import org.example.lifelink.dao.VerificationDao;
import org.example.lifelink.dao.donor.DonorDao;
import org.example.lifelink.dao.hospital.HospitalDao;
import org.example.lifelink.dto.admin.AdminDonorResponse;
import org.example.lifelink.dto.admin.AdminHospitalResponse;
import org.example.lifelink.dto.admin.HospitalApprovedEvent;
import org.example.lifelink.entity.User;
import org.example.lifelink.entity.Verification;
import org.example.lifelink.entity.VerificationStatus;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.hospital.Hospital;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final HospitalDao hospitalDao;
    private final UserDao userDao;
    private final VerificationDao verificationDao;
    private final ApplicationEventPublisher eventPublisher;
    private final DonorDao donorDao;

    @Transactional(readOnly = true)
    public Page<AdminHospitalResponse> getHospitals(
            String search,
            VerificationStatus status,
            int page,
            int size) {

        int safePage = Math.max(page, 0);

        int safeSize = Math.min(Math.max(size, 1), 50);

        String normalizedSearch = search == null ? "" : search.trim();

        Pageable pageable = PageRequest.of(safePage, safeSize);

        return hospitalDao.searchForAdmin(
                normalizedSearch,
                status,
                pageable);
    }

    @Transactional
    public VerificationStatus approveHospital(
            String authenticatedAdminEmail,
            Long hospitalId) {

        User admin = userDao.findByEmail(authenticatedAdminEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Administrator account was not found."));

        Hospital hospital = hospitalDao.findById(hospitalId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Hospital was not found."));

        User hospitalUser = hospital.getUser();
        hospitalUser.setEnabled(true);
        userDao.save(hospitalUser);

        Verification verification = verificationDao
                .findByUser_Id(hospitalUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Hospital verification record was not found."));

        if (verification.getStatus() == VerificationStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Hospital registration has already been approved.");
        }

        verification.setStatus(VerificationStatus.APPROVED);

        verification.setVerifiedBy(admin);
        verification.setVerifiedAt(LocalDateTime.now());

        verification.setRemarks("Hospital registration approved by administrator.");

        verificationDao.save(verification);

        eventPublisher.publishEvent(new HospitalApprovedEvent(
                hospital.getId(),
                hospital.getHospitalName(),
                hospitalUser.getEmail()));

        return verification.getStatus();
    }

    @Transactional
    public void lockHospital(Long hospitalId) {

        Hospital hospital = hospitalDao
                .findById(hospitalId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Hospital was not found."));

        User hospitalUser = hospital.getUser();

        if (hospitalUser.isAccountLocked()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Hospital account is already locked.");
        }

        hospitalUser.setAccountLocked(true);
        userDao.save(hospitalUser);
    }

    @Transactional
    public void unlockHospital(Long hospitalId) {
        Hospital hospital = hospitalDao
                .findById(hospitalId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Hospital was not found."));

        User hospitalUser = hospital.getUser();

        if (!hospitalUser.isAccountLocked()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Hospital account is already active.");
        }

        hospitalUser.setAccountLocked(false);
        userDao.save(hospitalUser);
    }

    @Transactional(readOnly = true)
    public Page<AdminDonorResponse> getDonors(
            String search,
            int page,
            int size) {

        String normalizedSearch = search == null ? "" : search.trim();

        int safePage = Math.max(page, 0);

        int safeSize = Math.min(Math.max(size, 1), 50);

        return donorDao.searchForAdmin(normalizedSearch,
                PageRequest.of(safePage, safeSize))
                .map(this::donorsResponse);
    }

    @Transactional
    public void lockDonor(Long donorId) {
        updateDonorLockStatus(
                donorId,
                true
        );
    }

    @Transactional
    public void unlockDonor(Long donorId) {
        updateDonorLockStatus(
                donorId,
                false
        );
    }

    private void updateDonorLockStatus(
            Long donorId,
            boolean shouldLock
    ) {
        Donor donor = donorDao
                .findById(donorId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Donor was not found."));
        User donorUser = donor.getUser();

        if (donorUser.isAccountLocked() == shouldLock) {
            String message = shouldLock
                    ? "Donor account is already locked."
                    : "Donor account is already active.";

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    message
            );
        }

        donorUser.setAccountLocked(shouldLock);
        userDao.save(donorUser);
    }

    private AdminDonorResponse donorsResponse(Donor donor) {

        User user = donor.getUser();
        return new AdminDonorResponse(
                donor.getId(),
                user.getId(),
                donor.getDonorCode(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                donor.getBloodType(),
                user.isAccountLocked(),
                user.getCreatedAt());
    }
}