package org.example.lifelink.dao.hospital;

import jakarta.persistence.LockModeType;

import org.example.lifelink.entity.hospital.event.DonationEvents;
import org.example.lifelink.entity.hospital.event.DonationEventStatus;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DonationEventDao extends JpaRepository<DonationEvents, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT event
            FROM DonationEvents event
            WHERE event.id = :eventId
            """)
    Optional<DonationEvents> findByIdForRegistration(@Param("eventId") Long eventId);

    @EntityGraph(attributePaths = {"hospital", "requiredBloodTypes"})
    List<DonationEvents> findAllByHospital_User_EmailIgnoreCaseOrderByCreatedAtDesc(String email);

    @EntityGraph(attributePaths = {"hospital", "requiredBloodTypes"})
    Optional<DonationEvents> findByIdAndHospital_User_EmailIgnoreCase(Long eventId, String email);

    @EntityGraph(attributePaths = {"hospital", "requiredBloodTypes"})
    List<DonationEvents> findAllByStatusAndEventDateGreaterThanEqualOrderByEventDateAsc(
            DonationEventStatus status,
            LocalDate currentDate
    );

    @EntityGraph(attributePaths = {"hospital", "requiredBloodTypes"})
    List<DonationEvents>
    findAllByStatusAndEventDateGreaterThanEqualAndRegistrationDeadlineGreaterThanEqualOrderByEventDateAsc(
            DonationEventStatus status,
            LocalDate currentDate,
            LocalDate registrationDate
    );

    @EntityGraph(attributePaths = {"hospital", "hospital.user", "requiredBloodTypes"})
    Optional<DonationEvents> findByIdAndStatus(Long eventId, DonationEventStatus status);
}