package org.example.lifelink.dao.hospital;


import org.example.lifelink.entity.donor.booking.PrivateDonationBooking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PrivateBookingDao extends JpaRepository<PrivateDonationBooking, Long> {

    @Query("""
            SELECT booking
            FROM PrivateDonationBooking booking
            JOIN booking.donor donor
            JOIN donor.user user
            WHERE booking.hospital.id = :hospitalId
              AND booking.status =
                  org.example.lifelink.entity.donor.booking.PrivateDonationBookingStatus.COMPLETED
              AND NOT EXISTS (
                  SELECT unit.id
                  FROM BloodInventoryUnit unit
                  WHERE unit.privateDonationBooking.id = booking.id
              )
              AND (
                  :search = ''
                  OR LOWER(user.fullName)
                      LIKE LOWER(CONCAT('%', :search, '%'))
                  OR LOWER(donor.donorCode)
                      LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<PrivateDonationBooking>
    findCompletedInventorySources(
            @Param("hospitalId") Long hospitalId,
            @Param("search") String search,
            Pageable pageable
    );
}
