package org.example.lifelink.entity.hospital.inventory;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.hospital.event.DonationEventRegistration;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.hospital.Hospital;
import org.example.lifelink.entity.donor.booking.PrivateDonationBooking;
import org.example.lifelink.entity.donor.booking.PrivateDonationBookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Table(
        name = "blood_inventory_units",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_blood_unit_hospital_code",
                        columnNames = {"hospital_id", "unit_code"}
                ),
                @UniqueConstraint(
                        name = "uk_blood_unit_event_registration",
                        columnNames = {"event_registration_id"}
                ),
                @UniqueConstraint(
                        name = "uk_blood_unit_private_booking",
                        columnNames = {"private_booking_id"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_blood_inventory_hospital",
                        columnList = "hospital_id"
                ),
                @Index(
                        name = "idx_blood_inventory_hospital_status",
                        columnList = "hospital_id,status"
                ),
                @Index(
                        name = "idx_blood_inventory_hospital_blood_type",
                        columnList = "hospital_id,blood_type"
                ),
                @Index(
                        name = "idx_blood_inventory_expiry_date",
                        columnList = "expiry_date"
                ),
                @Index(
                        name = "idx_blood_inventory_source",
                        columnList = "source"
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BloodInventoryUnit {

    private static final int MAX_VOLUME_ML = 1000;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "unit_code",
            nullable = false,
            length = 60
    )
    private String unitCode;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "blood_type",
            nullable = false,
            length = 30
    )
    private BloodType bloodType;

    @Column(
            name = "volume_ml",
            nullable = false
    )
    private Integer volumeMl;

    @Column(
            name = "collection_date",
            nullable = false
    )
    private LocalDate collectionDate;

    @Column(
            name = "expiry_date",
            nullable = false
    )
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private BloodUnitStatus status;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "source",
            nullable = false,
            length = 40
    )
    private BloodUnitSource source;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "event_registration_id",
            unique = true
    )
    private DonationEventRegistration eventRegistration;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "private_booking_id",
            unique = true
    )
    private PrivateDonationBooking privateDonationBooking;

    @Column(
            name = "storage_location",
            nullable = false,
            length = 150
    )
    private String storageLocation;

    @Column(
            name = "notes",
            length = 500
    )
    private String notes;

    @Column(
            name = "reserved_for",
            length = 150
    )
    private String reservedFor;

    @Column(
            name = "reservation_note",
            length = 500
    )
    private String reservationNote;

    @Column(name = "reserved_at")
    private LocalDateTime reservedAt;

    @Column(
            name = "reserved_by",
            length = 150
    )
    private String reservedBy;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "issue_purpose",
            length = 40
    )
    private BloodIssuePurpose issuePurpose;

    @Column(
            name = "issued_department",
            length = 150
    )
    private String issuedDepartment;

    @Column(
            name = "patient_reference",
            length = 100
    )
    private String patientReference;

    @Column(
            name = "received_by",
            length = 150
    )
    private String receivedBy;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(
            name = "issued_by",
            length = 150
    )
    private String issuedBy;

    @Column(
            name = "issue_note",
            length = 500
    )
    private String issueNote;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "discard_reason",
            length = 40
    )
    private BloodDiscardReason discardReason;

    @Column(
            name = "discard_note",
            length = 500
    )
    private String discardNote;

    @Column(name = "discarded_at")
    private LocalDateTime discardedAt;

    @Column(
            name = "discarded_by",
            length = 150
    )
    private String discardedBy;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "hospital_id",
            nullable = false
    )
    private Hospital hospital;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @Version
    private Long version;



    public static BloodInventoryUnit createManual(
            Hospital hospital,
            String unitCode,
            BloodType bloodType,
            Integer volumeMl,
            LocalDate collectionDate,
            LocalDate expiryDate,
            String storageLocation,
            String notes
    ) {
        BloodInventoryUnit unit = createBase(
                hospital,
                unitCode,
                bloodType,
                volumeMl,
                collectionDate,
                expiryDate,
                storageLocation,
                notes
        );
        unit.source = BloodUnitSource.MANUAL_ENTRY;
        unit.validateCoreFields();
        return unit;
    }

    public static BloodInventoryUnit createFromDonationEvent(
            Hospital hospital,
            DonationEventRegistration registration,
            String unitCode,
            BloodType bloodType,
            Integer volumeMl,
            LocalDate collectionDate,
            LocalDate expiryDate,
            String storageLocation,
            String notes
    ) {
        BloodInventoryUnit unit = createBase(
                hospital,
                unitCode,
                bloodType,
                volumeMl,
                collectionDate,
                expiryDate,
                storageLocation,
                notes
        );
        unit.source = BloodUnitSource.DONATION_EVENT;
        unit.eventRegistration = requireValue(
                registration,
                "Completed donation-event registration is required"
        );
        unit.validateCoreFields();
        return unit;
    }

    public static BloodInventoryUnit createFromPrivateBooking(
            Hospital hospital,
            PrivateDonationBooking privateBooking,
            String unitCode,
            Integer volumeMl,
            LocalDate expiryDate,
            String storageLocation,
            String notes
    ) {
        PrivateDonationBooking validatedBooking =
                requireValue(
                        privateBooking,
                        "Completed private donation booking is required"
                );

        if (validatedBooking.getStatus()
                != PrivateDonationBookingStatus.COMPLETED) {

            throw new IllegalArgumentException(
                    "Only completed private donation bookings can create blood inventory units"
            );
        }

        if (validatedBooking.getCompletedAt() == null) {
            throw new IllegalStateException(
                    "Completed private booking does not have a completion date"
            );
        }

        Donor donor = requireValue(
                validatedBooking.getDonor(),
                "Private booking donor is required"
        );

        BloodType donorBloodType = requireValue(
                donor.getBloodType(),
                "Donor blood type is required"
        );

        Hospital bookingHospital = requireValue(
                validatedBooking.getHospital(),
                "Private booking hospital is required"
        );

        if (!sameHospital(hospital, bookingHospital)) {
            throw new IllegalArgumentException(
                    "Private booking does not belong to the selected hospital"
            );
        }

        LocalDate collectionDate =
                validatedBooking
                        .getCompletedAt()
                        .toLocalDate();

        BloodInventoryUnit unit = createBase(
                hospital,
                unitCode,
                donorBloodType,
                volumeMl,
                collectionDate,
                expiryDate,
                storageLocation,
                notes
        );

        unit.source =
                BloodUnitSource.PRIVATE_BOOKING;

        unit.privateDonationBooking =
                validatedBooking;

        unit.validateCoreFields();

        return unit;
    }

    private static BloodInventoryUnit createBase(
            Hospital hospital,
            String unitCode,
            BloodType bloodType,
            Integer volumeMl,
            LocalDate collectionDate,
            LocalDate expiryDate,
            String storageLocation,
            String notes
    ) {
        BloodInventoryUnit unit = new BloodInventoryUnit();
        unit.hospital = requireValue(
                hospital,
                "Hospital is required"
        );
        unit.unitCode = normalizeUnitCode(unitCode);
        unit.bloodType = requireValue(
                bloodType,
                "Blood type is required"
        );
        unit.volumeMl = volumeMl;
        unit.collectionDate = collectionDate;
        unit.expiryDate = expiryDate;
        unit.storageLocation = requireText(
                storageLocation,
                "Storage location is required"
        );
        unit.notes = trimToNull(notes);
        unit.status = BloodUnitStatus.AVAILABLE;
        return unit;
    }

    /*
     * =========================================================
     * UPDATE
     * =========================================================
     */

    public void updateDetails(
            BloodType bloodType,
            Integer volumeMl,
            LocalDate collectionDate,
            LocalDate expiryDate,
            String storageLocation,
            String notes
    ) {
        if (status != BloodUnitStatus.AVAILABLE) {
            throw new IllegalStateException(
                    "Only available blood units can be edited"
            );
        }
        this.bloodType = requireValue(
                bloodType,
                "Blood type is required"
        );
        this.volumeMl = volumeMl;
        this.collectionDate = collectionDate;
        this.expiryDate = expiryDate;
        this.storageLocation = requireText(
                storageLocation,
                "Storage location is required"
        );
        this.notes = trimToNull(notes);
        validateCoreFields();
    }


    public void reserve(
            String reservedFor,
            String reservationNote,
            String reservedBy
    ) {
        if (status != BloodUnitStatus.AVAILABLE) {
            throw new IllegalStateException(
                    "Only available blood units can be reserved"
            );
        }
        if (isExpired()) {
            throw new IllegalStateException(
                    "Expired blood units cannot be reserved"
            );
        }
        this.reservedFor = requireText(
                reservedFor,
                "Reservation target is required"
        );
        this.reservedBy = requireText(
                reservedBy,
                "Reserved-by user is required"
        );
        this.reservationNote = trimToNull(
                reservationNote
        );
        this.reservedAt = LocalDateTime.now();
        this.status = BloodUnitStatus.RESERVED;
    }

    public void releaseReservation() {
        if (status != BloodUnitStatus.RESERVED) {
            throw new IllegalStateException(
                    "Only reserved blood units can be released"
            );
        }
        clearReservation();
        this.status = isExpired()
                ? BloodUnitStatus.EXPIRED
                : BloodUnitStatus.AVAILABLE;
    }

    /*
     * =========================================================
     * ISSUE
     * =========================================================
     */

    public void issue(
            BloodIssuePurpose issuePurpose,
            String issuedDepartment,
            String patientReference,
            String receivedBy,
            String issuedBy,
            String issueNote
    ) {
        if (
                status != BloodUnitStatus.AVAILABLE
                        && status != BloodUnitStatus.RESERVED
        ) {
            throw new IllegalStateException(
                    "Only available or reserved blood units can be issued"
            );
        }
        if (isExpired()) {
            throw new IllegalStateException(
                    "Expired blood units cannot be issued"
            );
        }
        this.issuePurpose = requireValue(
                issuePurpose,
                "Issue purpose is required"
        );
        this.issuedDepartment = requireText(
                issuedDepartment,
                "Department is required"
        );
        this.receivedBy = requireText(
                receivedBy,
                "Received-by person is required"
        );
        this.issuedBy = requireText(
                issuedBy,
                "Issued-by user is required"
        );
        this.patientReference = trimToNull(
                patientReference
        );
        this.issueNote = trimToNull(
                issueNote
        );
        this.issuedAt = LocalDateTime.now();
        this.status = BloodUnitStatus.ISSUED;
    }

    /*
     * =========================================================
     * DISCARD
     * =========================================================
     */

    public void discard(
            BloodDiscardReason discardReason,
            String discardNote,
            String discardedBy
    ) {
        if (status == BloodUnitStatus.ISSUED) {
            throw new IllegalStateException(
                    "Issued blood units cannot be discarded"
            );
        }
        if (status == BloodUnitStatus.DISCARDED) {
            throw new IllegalStateException(
                    "Blood unit has already been discarded"
            );
        }
        this.discardReason = requireValue(
                discardReason,
                "Discard reason is required"
        );
        this.discardedBy = requireText(
                discardedBy,
                "Discarded-by user is required"
        );
        this.discardNote = trimToNull(
                discardNote
        );
        if (
                discardReason == BloodDiscardReason.OTHER
                        && this.discardNote == null
        ) {
            throw new IllegalArgumentException(
                    "Discard note is required when reason is OTHER"
            );
        }
        this.discardedAt = LocalDateTime.now();
        this.status = BloodUnitStatus.DISCARDED;
    }

    /*
     * =========================================================
     * EXPIRY
     * =========================================================
     */

    public void markExpired() {
        if (
                status == BloodUnitStatus.AVAILABLE
                        || status == BloodUnitStatus.RESERVED
        ) {
            this.status = BloodUnitStatus.EXPIRED;
        }
    }

    public boolean isExpired() {
        return expiryDate != null
                && expiryDate.isBefore(LocalDate.now());
    }

    /*
     * =========================================================
     * VALIDATION
     * =========================================================
     */

    private void validateCoreFields() {
        requireValue(
                hospital,
                "Hospital is required"
        );
        requireText(
                unitCode,
                "Unit code is required"
        );
        requireValue(
                bloodType,
                "Blood type is required"
        );
        requireValue(
                status,
                "Blood unit status is required"
        );
        requireValue(
                source,
                "Blood unit source is required"
        );
        requireText(
                storageLocation,
                "Storage location is required"
        );

        if (volumeMl == null || volumeMl <= 0) {
            throw new IllegalArgumentException(
                    "Volume must be greater than zero"
            );
        }
        if (volumeMl > MAX_VOLUME_ML) {
            throw new IllegalArgumentException(
                    "Volume must not exceed "
                            + MAX_VOLUME_ML
                            + " ml"
            );
        }
        if (collectionDate == null) {
            throw new IllegalArgumentException(
                    "Collection date is required"
            );
        }
        if (collectionDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Collection date cannot be in the future"
            );
        }
        if (expiryDate == null) {
            throw new IllegalArgumentException(
                    "Expiry date is required"
            );
        }
        if (!expiryDate.isAfter(collectionDate)) {
            throw new IllegalArgumentException(
                    "Expiry date must be after collection date"
            );
        }
        validateSourceConsistency();
    }

    private void validateSourceConsistency() {
        switch (source) {
            case MANUAL_ENTRY -> validateManualEntrySource();

            case DONATION_EVENT -> validateDonationEventSource();

            case PRIVATE_BOOKING -> validatePrivateBookingSource();
        }
    }

    private void validateManualEntrySource() {
        if (eventRegistration != null
                || privateDonationBooking != null) {

            throw new IllegalStateException(
                    "Manual entry cannot be linked to an event registration or private booking"
            );
        }
    }

    private void validateDonationEventSource() {
        if (eventRegistration == null) {
            throw new IllegalStateException(
                    "Donation-event registration is required"
            );
        }

        if (privateDonationBooking != null) {
            throw new IllegalStateException(
                    "Donation-event unit cannot be linked to a private booking"
            );
        }
    }

    private void validatePrivateBookingSource() {
        if (privateDonationBooking == null) {
            throw new IllegalStateException(
                    "Private donation booking is required"
            );
        }

        if (eventRegistration != null) {
            throw new IllegalStateException(
                    "Private-booking unit cannot be linked to an event registration"
            );
        }

        if (privateDonationBooking.getStatus()
                != PrivateDonationBookingStatus.COMPLETED) {

            throw new IllegalStateException(
                    "Private booking must be completed before inventory creation"
            );
        }

        if (privateDonationBooking.getCompletedAt() == null) {
            throw new IllegalStateException(
                    "Completed private booking must have a completion date"
            );
        }

        Hospital bookingHospital =
                privateDonationBooking.getHospital();

        if (!sameHospital(hospital, bookingHospital)) {
            throw new IllegalStateException(
                    "Private booking and blood unit must belong to the same hospital"
            );
        }

        Donor donor =
                privateDonationBooking.getDonor();

        if (donor == null) {
            throw new IllegalStateException(
                    "Private booking donor is required"
            );
        }

        if (donor.getBloodType() == null) {
            throw new IllegalStateException(
                    "Private booking donor blood type is required"
            );
        }

        if (bloodType != donor.getBloodType()) {
            throw new IllegalStateException(
                    "Blood unit blood type must match the private booking donor blood type"
            );
        }

        LocalDate bookingCollectionDate =
                privateDonationBooking
                        .getCompletedAt()
                        .toLocalDate();

        if (!bookingCollectionDate.equals(
                collectionDate
        )) {
            throw new IllegalStateException(
                    "Collection date must match the private booking completion date"
            );
        }
    }

    private void clearReservation() {
        this.reservedFor = null;
        this.reservationNote = null;
        this.reservedBy = null;
        this.reservedAt = null;
    }

    private static boolean sameHospital(
            Hospital first,
            Hospital second
    ) {
        if (first == second) {
            return true;
        }

        if (first == null || second == null) {
            return false;
        }

        if (first.getId() == null
                || second.getId() == null) {

            return false;
        }

        return first.getId().equals(
                second.getId()
        );
    }

    /*
     * =========================================================
     * JPA CALLBACKS
     * =========================================================
     */

    @PrePersist
    private void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (status == null) {
            status = BloodUnitStatus.AVAILABLE;
        }
        validateCoreFields();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    private void preUpdate() {
        validateCoreFields();
        updatedAt = LocalDateTime.now();
    }

    /*
     * =========================================================
     * HELPER METHODS
     * =========================================================
     */

    private static String normalizeUnitCode(
            String value
    ) {
        return requireText(
                value,
                "Unit code is required"
        ).toUpperCase(Locale.ROOT);
    }

    private static String requireText(
            String value,
            String message
    ) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    message
            );
        }
        return value.trim();
    }

    private static <T> T requireValue(
            T value,
            String message
    ) {
        if (value == null) {
            throw new IllegalArgumentException(
                    message
            );
        }
        return value;
    }

    private static String trimToNull(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}