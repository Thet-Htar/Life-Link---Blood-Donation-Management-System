package org.example.lifelink.dao.donor;

import org.example.lifelink.entity.hospital.certificate.CertificateStatus;
import org.example.lifelink.entity.hospital.certificate.DonationCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DonationCertificateDao extends JpaRepository<DonationCertificate, Long> {

    Optional<DonationCertificate> findByRegistration_Id(Long registrationId);

    Optional<DonationCertificate> findByCertificateNumberIgnoreCase(String certificateNumber);

    Optional<DonationCertificate> findByVerificationCode(String verificationCode);

    Optional<DonationCertificate> findByIdAndHospital_Id(Long certificateId, Long hospitalId);

    List<DonationCertificate> findAllByHospital_IdOrderByIssuedAtDesc(Long hospitalId);

    List<DonationCertificate> findAllByDonor_IdOrderByIssuedAtDesc(Long donorId);

    boolean existsByPrivateDonationBooking_Id(Long bookingId);
}