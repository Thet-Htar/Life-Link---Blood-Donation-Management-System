package org.example.lifelink.entity.hospital;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.lifelink.entity.IdClass;
import org.example.lifelink.entity.User;

@Entity
@Table(name = "hospitals")
@Getter
@Setter
@NoArgsConstructor
public class Hospital extends IdClass {

    @Column(name = "hospital_name",
            nullable = false,
            length = 150)
    private String hospitalName;

    @Column(name = "hospital_license_code",
            nullable = false,
            unique = true,
            length = 100)
    private String hospitalLicenseCode;

    @Column(name = "representative_staff_name",
            nullable = false,
            length = 150)
    private String representativeStaffName;

    @OneToOne(fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(name = "user_id",
            nullable = false,
            unique = true)
    private User user;
}