package org.example.lifelink.dao;

import org.example.lifelink.entity.Verification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationDao extends JpaRepository<Verification, Long> {

    Optional<Verification> findByUser_Id(Long userId);
}
