package org.example.lifelink.dao.hospital;

import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.hospital.inventory.BloodInventoryUnit;
import org.example.lifelink.entity.hospital.inventory.BloodUnitSource;
import org.example.lifelink.entity.hospital.inventory.BloodUnitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BloodInventoryUnitDao extends JpaRepository<BloodInventoryUnit, Long> {

    List<BloodInventoryUnit> findAllByHospital_IdOrderByCreatedAtDesc(Long hospitalId);

    Optional<BloodInventoryUnit> findByIdAndHospital_Id(Long unitId, Long hospitalId);

    boolean existsByHospital_IdAndUnitCodeIgnoreCase(Long hospitalId, String unitCode);

    boolean existsByEventRegistration_Id(Long registrationId);

    boolean existsByPrivateDonationBooking_Id(Long bookingId);

    long countByHospital_Id(Long hospitalId);

    long countByHospital_IdAndStatus(Long hospitalId, BloodUnitStatus status);


    long countByHospital_IdAndBloodTypeAndStatusAndExpiryDateGreaterThanEqual(
            Long hospitalId,
            BloodType bloodType,
            BloodUnitStatus status,
            LocalDate minimumExpiryDate
    );

    long countByHospital_IdAndStatusInAndExpiryDateBetween(
            Long hospitalId,
            Collection<BloodUnitStatus> statuses,
            LocalDate startDate,
            LocalDate endDate
    );

//    List<BloodInventoryUnit> findAllByHospital_IdAndStatusInAndExpiryDateBefore(
//            Long hospitalId,
//            Collection<BloodUnitStatus> statuses,
//            LocalDate date
//    );
//
//
//    List<BloodInventoryUnit> findAllByHospital_IdAndStatusOrderByCreatedAtDesc(
//            Long hospitalId,
//            BloodUnitStatus status
//    );
//
//
//    List<BloodInventoryUnit> findAllByHospital_IdAndBloodTypeOrderByCreatedAtDesc(
//            Long hospitalId,
//            BloodType bloodType
//    );


//    List<BloodInventoryUnit> findAllByHospital_IdAndSourceOrderByCreatedAtDesc(
//            Long hospitalId,
//            BloodUnitSource source
//    );
//
//    List<BloodInventoryUnit> findAllByHospital_IdAndUnitCodeContainingIgnoreCaseOrderByCreatedAtDesc(
//            Long hospitalId,
//            String unitCode
//    );
}