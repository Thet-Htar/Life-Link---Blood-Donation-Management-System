package org.example.lifelink.entity.donor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.Gender;
import org.example.lifelink.entity.IdClass;
import org.example.lifelink.entity.User;
import org.example.lifelink.entity.hospital.event.DonationEventRegistration;
import org.example.lifelink.entity.hospital.event.DonationHistoryType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "donors",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_donor_code",
                        columnNames = "donor_code")})
public class Donor extends IdClass {

    @Column(name = "donor_code",
            nullable = false,
            unique = true,
            length = 6,
            updatable = false)
    private String donorCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodType bloodType;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false,
            precision = 5,
            scale = 2)
    private BigDecimal weightKg;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationHistoryType donationHistoryType;

    @Column(name = "last_donation_date")
    private LocalDate lastDonationDate;

    @Column(nullable = false)
    private boolean eligible;

    @Column(name = "donation_count",
            nullable = false)
    private int donationCount = 0;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",
            nullable = false,
            unique = true)
    private User user;

    @OneToMany(mappedBy = "donor", fetch = FetchType.LAZY)
    private List<DonationEventRegistration> eventRegistrations = new ArrayList<>();
}