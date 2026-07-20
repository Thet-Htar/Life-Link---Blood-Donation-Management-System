package org.example.lifelink.dao;

import org.example.lifelink.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenDao extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUserEmail(String email);

    Optional<RefreshToken> findByUserEmailAndRevokedFalse(String email);
}
