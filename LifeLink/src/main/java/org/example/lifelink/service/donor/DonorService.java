package org.example.lifelink.service.donor;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.lifelink.dao.UserDao;
import org.example.lifelink.dao.VerificationDao;
import org.example.lifelink.dao.donor.DonorDao;
import org.example.lifelink.dto.AddressResponse;
import org.example.lifelink.dto.donor.event.DonorEligibilityResult;
import org.example.lifelink.dto.donor.event.DonorRegisterRequest;
import org.example.lifelink.dto.donor.profile.DonorProfileResponse;
import org.example.lifelink.dto.donor.profile.DonorProfileUpdateRequest;
import org.example.lifelink.entity.*;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.hospital.event.DonationHistoryType;
import org.example.lifelink.exception.EmailAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DonorService {
    private static final int MINIMUM_AGE = 18;
    private static final int MAXIMUM_AGE = 55;
    // 120 pounds ≈ 54.43 kilograms
    private static final BigDecimal MINIMUM_WEIGHT_KG = new BigDecimal("54.50");
    private static final int DONATION_WAITING_MONTHS = 4;
    private final DonorDao donorDao;
    private final UserDao userDao;
    private final VerificationDao verificationDao;
    private final PasswordEncoder passwordEncoder;
    private final DonorCodeGenerator donorCodeGenerator;

    private static Address getAddress(DonorProfileUpdateRequest request, User user) {
        Address address = user.getAddress();

        if (address == null) {
            address = new Address();
        }

        address.setCity(request.address().city().trim());
        address.setTownship(request.address().township().trim());
        address.setStreet(
                request.address().street() == null ||
                        request.address().street().isBlank()
                        ? null
                        : request.address()
                          .street()
                          .trim()
        );
        return address;
    }

    @Transactional
    public Donor registerDonor(DonorRegisterRequest request) {

        String email = request.email().trim();

        if (userDao.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException("An account with this email already exists");
        }

        if (userDao.existsByPhone(request.phone().trim())) {
            throw new IllegalArgumentException("An account with this phone number already exists");
        }

        validateDonationHistory(request);
        Address address = createAddress(request);

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPhone(request.phone().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.DONOR);
        user.setEnabled(true);
        user.setAccountLocked(false);
        user.setAddress(address);

        Donor donor = new Donor();
        donor.setDonorCode(donorCodeGenerator.generateUniqueCode());
        donor.setBloodType(request.bloodType());
        donor.setDateOfBirth(request.dateOfBirth());
        donor.setWeightKg(request.weightKg());
        donor.setGender(request.gender());
        donor.setDonationHistoryType(request.donationHistoryType());
        donor.setLastDonationDate(resolveLastDonationDate(request));
        donor.setDonationCount(0);
        donor.setUser(user);

        DonorEligibilityResult eligibility = calculateEligibility(donor);
        donor.setEligible(eligibility.eligible());
        user.setDonor(donor);

        Verification verification = new Verification();
        verification.setUser(user);
        verification.setStatus(VerificationStatus.APPROVED);
        verification.setVerifiedAt(LocalDateTime.now());
        user.setVerification(verification);

        return userDao.save(user).getDonor();
    }

    private void validateDonationHistory(DonorRegisterRequest request) {
        switch (request.donationHistoryType()) {

            case NEVER_DONATED -> {
                if (request.lastDonationDate() != null) {
                    throw new IllegalArgumentException("Last donation date must be empty for a donor who has never donated");
                }
            }

            case EXACT_DATE -> {
                if (request.lastDonationDate() == null) {
                    throw new IllegalArgumentException("Last donation date is required");
                }
            }
            case OVER_FOUR_MONTHS_NO_DATE -> {
                if (request.lastDonationDate() != null) {
                    throw new IllegalArgumentException("Last donation date must be empty when the exact date is unknown");
                }
            }
        }
    }

    private LocalDate resolveLastDonationDate(DonorRegisterRequest request) {
        if (request.donationHistoryType()
                == DonationHistoryType.EXACT_DATE) {
            return request.lastDonationDate();
        }
        return null;
    }

    private Address createAddress(DonorRegisterRequest request) {

        Address address = new Address();
        address.setCity(request.address().city().trim());
        address.setTownship(request.address().township().trim());

        if (request.address().street() != null && !request.address().street().isBlank()) {
            address.setStreet(request.address().street().trim());
        }
        return address;
    }

    public DonorProfileResponse getDonorProfile(String email) {

        String normalizeEmail = email.trim();
        Donor donor = donorDao
                .findByUserEmail(normalizeEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Donor profile not found"));

        User user = donor.getUser();
        Address userAddress = user.getAddress();

        AddressResponse addressResponse = userAddress == null
                ? null
                : new AddressResponse(
                userAddress.getCity(),
                userAddress.getTownship(),
                userAddress.getStreet()
        );

        return new DonorProfileResponse(
                donor.getId(),
                donor.getDonorCode(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                addressResponse,
                donor.getBloodType(),
                donor.getDateOfBirth(),
                donor.getWeightKg(),
                donor.getGender(),
                donor.getDonationHistoryType(),
                donor.getLastDonationDate(),
                donor.isEligible(),
                donor.getDonationCount()
        );
    }

    @Transactional
    public Donor updateDonorProfile(
            String email,
            DonorProfileUpdateRequest request) {

        Donor donor = donorDao
                .findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Donor not found"));

        User user = donor.getUser();
        //System.out.println("Updated user ::::" + request);
        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone().trim());

        Address address = getAddress(request, user);
        user.setAddress(address);

        donor.setWeightKg(request.weightKg());
        DonorEligibilityResult eligibility = calculateEligibility(donor);
        donor.setEligible(eligibility.eligible());
        userDao.save(user);

        return donorDao.save(donor);
    }

    public DonorEligibilityResult calculateEligibility(Donor donor) {

        LocalDate today = LocalDate.now();
        List<String> reasons = new ArrayList<>();
        LocalDate nextEligibleDate = null;

        if (donor.getDateOfBirth() == null) {
            reasons.add("Date of birth is missing");
        } else {
            int age = Period.between(
                    donor.getDateOfBirth(),
                    today
            ).getYears();

            if (age < MINIMUM_AGE) {
                reasons.add("Donor must be at least " + MINIMUM_AGE + " years old");
            }

            if (age > MAXIMUM_AGE) {
                reasons.add("Donor must not be older than " + MAXIMUM_AGE + " years");
            }
        }

        if (donor.getWeightKg() == null) {
            reasons.add("Weight is missing");
        } else if (
                donor.getWeightKg().compareTo(MINIMUM_WEIGHT_KG) < 0
        ) {
            reasons.add(
                    "Minimum required weight is " + MINIMUM_WEIGHT_KG + " kg");
        }

        if (donor.getDonationHistoryType() == null) {
            reasons.add("Donation history is missing");
        } else {
            switch (donor.getDonationHistoryType()) {

                case NEVER_DONATED -> {
                    nextEligibleDate = today;
                }

                case OVER_FOUR_MONTHS_NO_DATE -> {
                    nextEligibleDate = today;
                }

                case EXACT_DATE -> {
                    if (donor.getLastDonationDate() == null) {
                        reasons.add("Last donation date is required");
                    } else if (
                            donor.getLastDonationDate().isAfter(today)
                    ) {
                        reasons.add("Last donation date cannot be in the future");
                    } else {
                        nextEligibleDate = donor.getLastDonationDate()
                                .plusMonths(DONATION_WAITING_MONTHS);

                        if (nextEligibleDate.isAfter(today)) {
                            reasons.add("Donor must wait until " + nextEligibleDate);
                        }
                    }
                }
            }
        }

        boolean eligible = reasons.isEmpty();

        return new DonorEligibilityResult(
                eligible,
                nextEligibleDate,
                reasons
        );
    }
}
