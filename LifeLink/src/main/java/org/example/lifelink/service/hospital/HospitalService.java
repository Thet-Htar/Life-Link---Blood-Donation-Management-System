package org.example.lifelink.service.hospital;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.example.lifelink.dao.donor.DonationEventRegistrationDao;
import org.example.lifelink.dao.hospital.HospitalDao;
import org.example.lifelink.dao.UserDao;
import org.example.lifelink.dao.VerificationDao;
import org.example.lifelink.dto.*;
import org.example.lifelink.dto.hospital.profile.HospitalProfileResponse;
import org.example.lifelink.dto.hospital.profile.HospitalProfileUpdateRequest;
import org.example.lifelink.dto.hospital.profile.HospitalRegisterRequest;
import org.example.lifelink.dto.hospital.profile.HospitalRegisterResponse;
import org.example.lifelink.entity.*;
import org.example.lifelink.entity.hospital.Hospital;
import org.example.lifelink.exception.EmailAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@AllArgsConstructor
public class HospitalService {

    private final HospitalDao hospitalDao;
    private final UserDao userDao;
    private final VerificationDao verificationDao;
    private final PasswordEncoder passwordEncoder;
    private final DonationEventRegistrationDao registrationDao;

    @Transactional
    public HospitalRegisterResponse registerHospital(HospitalRegisterRequest request) {

        String email = request.email().trim();

        if (userDao.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException("An account with this email already exists");
        }

        Address address = createAddress(request);
        User user = createUser(request, email, address);
        Hospital hospital = createHospital(request, email, address, user);

        user.setHospital(hospital);
        User savedUser = userDao.save(user);

        Verification verification = createVerificationForRegisteredHospital(savedUser);
        verificationDao.save(verification);

        return new HospitalRegisterResponse(
                savedUser.getId(),
                email,
                VerificationStatus.UNDER_REVIEW,
                "Hospital registered successfully. Administrator approval is pending."
        );
    }

    private Address createAddress(HospitalRegisterRequest request) {

        Address address = new Address();
        address.setCity(request.address().city().trim());
        address.setTownship(request.address().township().trim());

        if (request.address().street() != null &&
                !request.address().street().isBlank()) {

            address.setStreet(request.address().street().trim());
        }

        return address;
    }

    private User createUser(HospitalRegisterRequest request,
                            String normalizedEmail,
                            Address address) {

        User user = new User();
        user.setFullName(request.hospitalName().trim());
        user.setEmail(normalizedEmail);
        user.setPhone(request.phone().trim());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.HOSPITAL);
        user.setEnabled(false);
        user.setAccountLocked(false);
        user.setAddress(address);
        return user;
    }

    private Hospital createHospital(HospitalRegisterRequest request,
                                    String normalizedEmail,
                                    Address address,
                                    User user) {

        Hospital hospital = new Hospital();
        hospital.setHospitalLicenseCode(request.hospitalLicenseCode().trim());
        hospital.setRepresentativeStaffName(request.representativeStaffName().trim());
        hospital.setHospitalName(request.hospitalName().trim());
        hospital.setUser(user);
        return hospital;
    }

    private Verification createVerificationForRegisteredHospital(User user) {

        Verification verification = new Verification();
        verification.setUser(user);
        verification.setStatus(VerificationStatus.UNDER_REVIEW);
        verification.setVerifiedAt(null);
        return verification;

    }


    @Transactional
    public HospitalProfileResponse getProfile(String authenticatedEmail) {

        Hospital hospital = hospitalDao.findByUser_EmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital not found"));
        return handleProfileViewAndUpdate(hospital);

    }

    @Transactional
    public HospitalProfileResponse updateProfile(
            String authenticatedEmail,
            HospitalProfileUpdateRequest request
    ) {

        Hospital hospital = hospitalDao
                .findByUser_EmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Hospital not found"));

        User user = hospital.getUser();
        hospital.setHospitalName(request.hospitalName());
        hospital.setRepresentativeStaffName(
                request.representativeStaffName());

        user.setPhone(request.phone().trim());
        updateAddress(user, request.address());
        Hospital savedHospital = hospitalDao.save(hospital);
        return handleProfileViewAndUpdate(savedHospital);
    }

    private void updateAddress(User user, AddressRequest request) {

        Address address = user.getAddress();

        if (address == null)
            address = new Address();


        address.setStreet(request.street());
        address.setTownship(request.township());
        address.setCity(request.city());
        user.setAddress(address);
    }

    private HospitalProfileResponse handleProfileViewAndUpdate(Hospital hospital) {

        User user = hospital.getUser();
        Address address = user.getAddress();

        AddressResponse addressResponse = newAddressResponse(address);

        return new HospitalProfileResponse(
                hospital.getId(),
                hospital.getHospitalName(),
                hospital.getHospitalLicenseCode(),
                hospital.getRepresentativeStaffName(),
                user.getEmail(),
                user.getPhone(),
                addressResponse,
                user.getVerification().getStatus(),
                user.isEnabled()
        );
    }

    private AddressResponse newAddressResponse(Address address) {

        return new AddressResponse(
                address.getStreet(),
                address.getTownship(),
                address.getCity()
        );
    }

}
