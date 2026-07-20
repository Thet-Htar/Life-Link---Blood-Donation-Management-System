package org.example.lifelink.entity;

import lombok.Getter;
import lombok.Setter;

import jakarta.persistence.*;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.hospital.Hospital;

@Entity
@Getter
@Setter
@Table(name = "users")
public class User extends IdClass {

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Column(nullable = false, unique = true)
    private String phone;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean enabled;

    private boolean accountLocked;

    @Embedded
    private Address address;

    @OneToOne(mappedBy = "user",
            cascade = CascadeType.ALL)
    private Donor donor;

    @OneToOne(mappedBy = "user",
            cascade = CascadeType.ALL)
    private Hospital hospital;

    @OneToOne(mappedBy = "user",
            cascade = CascadeType.ALL)
    private Verification verification;

}
