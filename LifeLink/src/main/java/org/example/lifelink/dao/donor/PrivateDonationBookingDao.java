package org.example.lifelink.dao.donor;

import io.lettuce.core.dynamic.annotation.Param;
import org.example.lifelink.entity.donor.booking.PrivateDonationBooking;
import org.example.lifelink.entity.donor.booking.PrivateDonationBookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrivateDonationBookingDao extends JpaRepository<PrivateDonationBooking, Long> {

    List<PrivateDonationBooking> findAllByDonor_User_EmailIgnoreCaseOrderByCreatedAtDesc(String donorEmail);

    Optional<PrivateDonationBooking> findByIdAndDonor_User_EmailIgnoreCase(Long bookingId, String donorEmail);

    List<PrivateDonationBooking> findAllByHospital_User_EmailIgnoreCaseOrderByBookingDateAscStartTimeAsc(String hospitalEmail);

    Optional<PrivateDonationBooking> findByIdAndHospital_User_EmailIgnoreCase(Long bookingId, String hospitalEmail);

    boolean existsByDonor_IdAndStatusIn(Long donorId, Collection<PrivateDonationBookingStatus> statuses);

    boolean existsByHospital_IdAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(Long hospitalId,
                                                                                                  LocalDate bookingDate,
                                                                                                  LocalTime requestedEndTime,
                                                                                                  LocalTime requestedStartTime,
                                                                                                  Collection<PrivateDonationBookingStatus> statuses);
    Optional<PrivateDonationBooking> findByIdAndHospital_Id(Long bookingId, Long id);
}