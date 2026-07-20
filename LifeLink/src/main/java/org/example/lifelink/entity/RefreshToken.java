package org.example.lifelink.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class RefreshToken extends IdClass{

    @Column(unique = true,
            length = 500)
    private String token;

    @ManyToOne
    private User user;

    private LocalDateTime expiryDate;

    private boolean revoked = false;
}
