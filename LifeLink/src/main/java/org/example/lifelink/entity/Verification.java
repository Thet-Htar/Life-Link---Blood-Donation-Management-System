package org.example.lifelink.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "verifications")
public class Verification extends IdClass{

    @Enumerated(EnumType.STRING)
    private VerificationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="verified_by")
    private User verifiedBy;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user")
    private User user;

    private LocalDateTime verifiedAt;

    @Column(length=1000)
    private String remarks;

}
