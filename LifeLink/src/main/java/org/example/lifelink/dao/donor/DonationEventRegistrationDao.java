package org.example.lifelink.dao.donor;

import jakarta.persistence.LockModeType;
import org.example.lifelink.entity.hospital.event.DonationEventRegistration;
import org.example.lifelink.entity.hospital.event.DonationEventRegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface DonationEventRegistrationDao extends JpaRepository<DonationEventRegistration, Long> {

    Optional<DonationEventRegistration> findByDonationEvent_IdAndDonor_Id(Long eventId, Long donorId);

    List<DonationEventRegistration> findAllByDonor_IdOrderByRegisteredAtDesc(Long donorId);

    long countByDonationEvent_IdAndStatusIn(Long eventId, Collection<DonationEventRegistrationStatus> statuses);

    List<DonationEventRegistration> findAllByDonationEvent_IdOrderByRegisteredAtAsc(Long eventId);

    @Query(
            value = """
                    select registration
                    from DonationEventRegistration registration
                    join registration.donationEvent event
                    join registration.donor donor
                    join donor.user user
                    where event.hospital.id = :hospitalId
                      and registration.status = :status
                      and not exists (
                            select inventory.id
                            from BloodInventoryUnit inventory
                            where inventory.eventRegistration.id =
                                  registration.id
                      )
                      and (
                            :search = ''
                            or lower(user.fullName)
                                  like lower(concat('%', :search, '%'))
                            or lower(user.email)
                                  like lower(concat('%', :search, '%'))
                            or lower(donor.donorCode)
                                  like lower(concat('%', :search, '%'))
                      )
                    order by registration.completedAt desc
                    """,

            countQuery = """
                    select count(registration)
                    from DonationEventRegistration registration
                    join registration.donationEvent event
                    join registration.donor donor
                    join donor.user user
                    where event.hospital.id = :hospitalId
                      and registration.status = :status
                      and not exists (
                            select inventory.id
                            from BloodInventoryUnit inventory
                            where inventory.eventRegistration.id =
                                  registration.id
                      )
                      and (
                            :search = ''
                            or lower(user.fullName)
                                  like lower(concat('%', :search, '%'))
                            or lower(user.email)
                                  like lower(concat('%', :search, '%'))
                            or lower(donor.donorCode)
                                  like lower(concat('%', :search, '%'))
                      )
                    """
    )
    Page<DonationEventRegistration>
    findCompletedRegistrationsAvailableForInventory(
            @Param("hospitalId")
            Long hospitalId,

            @Param("status")
            DonationEventRegistrationStatus status,

            @Param("search")
            String search,

            Pageable pageable
    );

    /*
     * Lock the selected registration while
     * creating the inventory row.
     *
     * This reduces simultaneous duplicate
     * creation attempts.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select registration
            from DonationEventRegistration registration
            join registration.donationEvent event
            where registration.id = :registrationId
              and event.hospital.id = :hospitalId
            """)
    Optional<DonationEventRegistration>
    findOwnedRegistrationForInventory(

            @Param("registrationId")
            Long registrationId,

            @Param("hospitalId")
            Long hospitalId
    );
}