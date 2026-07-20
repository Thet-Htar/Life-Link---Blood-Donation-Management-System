package org.example.lifelink.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.example.lifelink.dao.RefreshTokenDao;
import org.example.lifelink.dao.UserDao;
import org.example.lifelink.dao.VerificationDao;
import org.example.lifelink.dto.auth.AuthResponse;
import org.example.lifelink.dto.auth.LoginRequest;
import org.example.lifelink.dto.donor.event.DonorRegisterRequest;
import org.example.lifelink.dto.hospital.profile.HospitalProfileResponse;
import org.example.lifelink.dto.hospital.profile.HospitalProfileUpdateRequest;
import org.example.lifelink.dto.hospital.profile.HospitalRegisterRequest;
import org.example.lifelink.dto.hospital.profile.HospitalRegisterResponse;
import org.example.lifelink.entity.RefreshToken;
import org.example.lifelink.entity.Role;
import org.example.lifelink.entity.User;
import org.example.lifelink.entity.VerificationStatus;
import org.example.lifelink.exception.AccountNotApprovedException;
import org.example.lifelink.exception.UnauthorizedException;
import org.example.lifelink.service.auth.JwtService;
import org.example.lifelink.service.donor.DonorService;
import org.example.lifelink.service.hospital.HospitalService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;

@RestController
@AllArgsConstructor
@RequestMapping("/lifelink")
@CrossOrigin("http://localhost:5173")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDao userDao;
    private final RefreshTokenDao refreshTokenDao;
    private final DonorService donorService;
    private final HospitalService hospitalService;

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userDao.findByEmail(request.email()).orElseThrow(() -> new BadCredentialsException("Email or password is incorrect."));

        if (user.isAccountLocked()) {
            throw new LockedException("User account is locked.");
        }

        if (user.getRole() == Role.HOSPITAL) {
            if (user.getVerification() == null) {
                throw new AccountNotApprovedException(VerificationStatus.UNDER_REVIEW,
                        "Hospital verification record was not found.");
            }

            VerificationStatus verificationStatus = user.getVerification().getStatus();
            if (verificationStatus != VerificationStatus.APPROVED) {
                throw new AccountNotApprovedException(verificationStatus,
                        "Hospital account is not approved.");
            }
        }

        refreshTokenDao.findByUserEmailAndRevokedFalse(user.getEmail())
                .ifPresent(existingToken -> {
                    existingToken.setRevoked(true);
                    refreshTokenDao.save(existingToken);
        });

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        RefreshToken tokenEntity = new RefreshToken();

        tokenEntity.setToken(refreshToken);
        tokenEntity.setUser(user);
        tokenEntity.setRevoked(false);

        tokenEntity.setExpiryDate(LocalDateTime.now().plusDays(30));

        refreshTokenDao.save(tokenEntity);

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Duration.ofDays(30))
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(
                new AuthResponse(
                        accessToken,
                        refreshToken,
                        user.getRole()
                ));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token missing in cookies");
        }

        RefreshToken token = refreshTokenDao.findByToken(refreshToken).orElseThrow(() ->
                new UnauthorizedException("Invalid refresh token"));

        if (token.isRevoked() || token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token expired or revoked");
        }

        User user = token.getUser();
        String newAccessToken = jwtService.generateAccessToken(user);

        AuthResponse response = new AuthResponse(newAccessToken, refreshToken, user.getRole());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/register/donor")
    public ResponseEntity<String> registerDonor(
            @Valid @RequestBody DonorRegisterRequest request) {
        donorService.registerDonor(request);

        return ResponseEntity.status(HttpStatus.CREATED).
                body("Donor registered successfully");
    }

    @PostMapping("/auth/register/hospital")
    public ResponseEntity<HospitalRegisterResponse> registerHospital(
            @RequestBody @Valid HospitalRegisterRequest request) {
        HospitalRegisterResponse response = hospitalService.registerHospital(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/hospital/profile")
    public ResponseEntity<HospitalProfileResponse> getHospitalProfile(
            Authentication authentication) {
        HospitalProfileResponse response = hospitalService.getProfile(authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/hospital/profile")
    public ResponseEntity<HospitalProfileResponse> updateHospitalProfile(
            Authentication authentication,
            @Valid @RequestBody HospitalProfileUpdateRequest request) {
        HospitalProfileResponse response = hospitalService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(response);
    }
}
