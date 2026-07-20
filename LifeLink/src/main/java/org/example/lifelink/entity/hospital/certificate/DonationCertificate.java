package org.example.lifelink.entity.hospital.certificate;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.donor.booking.PrivateDonationBooking;
import org.example.lifelink.entity.hospital.Hospital;
import org.example.lifelink.entity.hospital.event.DonationEventRegistration;
import org.example.lifelink.entity.hospital.event.DonationEvents;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_certificates",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_certificate_number",
                        columnNames = "certificate_number"
                ),
                @UniqueConstraint(
                        name = "uk_certificate_verification_code",
                        columnNames = "verification_code"
                ),
                @UniqueConstraint(
                        name = "uk_certificate_registration",
                        columnNames = "registration_id"
                )
        },
        indexes = {
                @Index(
                        name = "idx_certificate_donor",
                        columnList = "donor_id"
                ),
                @Index(
                        name = "idx_certificate_hospital",
                        columnList = "hospital_id"
                ),
                @Index(
                        name = "idx_certificate_event",
                        columnList = "donation_event_id"
                ),
                @Index(
                        name = "idx_certificate_status",
                        columnList = "status"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class DonationCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "certificate_number",
            nullable = false,
            unique = true,
            length = 50
    )
    private String certificateNumber;

    @Column(name = "verification_code",
            nullable = false,
            unique = true,
            length = 100
    )
    private String verificationCode;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 30)
    private CertificateStatus status = CertificateStatus.ACTIVE;

    @OneToOne(fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(name = "registration_id",
            nullable = false,
            unique = true)
    private DonationEventRegistration registration;

    @ManyToOne(fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(name = "donor_id",
            nullable = false)
    private Donor donor;

    @ManyToOne(fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(name = "hospital_id",
            nullable = false)
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(name = "donation_event_id",
            nullable = false)
    private DonationEvents donationEvent;

    @Column(name = "donor_name",
            nullable = false,
            length = 200)
    private String donorName;

    @Column(name = "donor_code",
            nullable = false,
            length = 50)
    private String donorCode;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "blood_type",
            nullable = false,
            length = 30
    )
    private BloodType bloodType;

    @Column(name = "hospital_name",
            nullable = false,
            length = 200)
    private String hospitalName;

    @Column(name = "event_title",
            nullable = false,
            length = 250)
    private String eventTitle;

    @Column(name = "donation_date",
            nullable = false)
    private LocalDate donationDate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "private_booking_id",
            unique = true)
    private PrivateDonationBooking privateDonationBooking;

    @Column(name = "issued_at",
            nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "revoke_reason",
            length = 500)
    private String revokeReason;

    @Column(name = "created_at",
            nullable = false,
            updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at",
            nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    public void prePersist() {
        LocalDateTime now =
                LocalDateTime.now();

        if (status == null) {
            status =
                    CertificateStatus.ACTIVE;
        }

        if (issuedAt == null) {
            issuedAt = now;
        }

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void revoke(
            String reason
    ) {
        if (status == CertificateStatus.REVOKED) {
            throw new IllegalStateException(
                    "Certificate has already been revoked"
            );
        }

        status = CertificateStatus.REVOKED;

        revokedAt = LocalDateTime.now();

        revokeReason = reason == null
                ? null
                : reason.trim();
    }
}