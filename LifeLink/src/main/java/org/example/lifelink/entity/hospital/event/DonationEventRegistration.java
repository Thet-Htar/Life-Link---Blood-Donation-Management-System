package org.example.lifelink.entity.hospital.event;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.lifelink.entity.IdClass;
import org.example.lifelink.entity.donor.Donor;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "donation_event_registrations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_event_donor_registration",
                        columnNames = {"donation_event_id", "donor_id"}
                )
        },
        indexes = {
                @Index(name = "idx_registration_event", columnList = "donation_event_id"),
                @Index(name = "idx_registration_donor", columnList = "donor_id"),
                @Index(name = "idx_registration_status", columnList = "status")
        }
)
public class DonationEventRegistration extends IdClass {

    @ManyToOne(fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(name = "donation_event_id", nullable = false)
    private DonationEvents donationEvent;

    @ManyToOne(fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(name = "donor_id", nullable = false)
    private Donor donor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false,
            length = 20)
    private DonationEventRegistrationStatus status;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Version
    private Long version;

    @Column(name = "no_show_at")
    private LocalDateTime noShowAt;

    @Column(name = "deferred_at")
    private LocalDateTime deferredAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "deferral_reason",
            length = 50)
    private DonationDeferralReason deferralReason;

    @Column(name = "outcome_note",
            length = 500)
    private String outcomeNote;

    @PrePersist
    private void beforeInsert() {
        if (status == null) {
            status = DonationEventRegistrationStatus.REGISTERED;
        }
        if (registeredAt == null) {
            registeredAt = LocalDateTime.now();
        }
    }

    public void completeDonation() {
        ensureRegistered();
        status = DonationEventRegistrationStatus.COMPLETED;
        completedAt = LocalDateTime.now();
        cancelledAt = null;
        noShowAt = null;
        deferredAt = null;
        deferralReason = null;
        outcomeNote = null;
    }

    public void markNoShow() {
        ensureRegistered();
        status = DonationEventRegistrationStatus.NO_SHOW;
        noShowAt = LocalDateTime.now();
        completedAt = null;
        cancelledAt = null;
        deferredAt = null;
        deferralReason = null;
        outcomeNote = null;
    }

    public void deferDonation(DonationDeferralReason reason, String note) {
        ensureRegistered();
        if (reason == null) {
            throw new IllegalArgumentException("Deferral reason is required");
        }

        status = DonationEventRegistrationStatus.DEFERRED;
        deferredAt = LocalDateTime.now();
        deferralReason = reason;
        outcomeNote = (note == null || note.isBlank()) ? null : note.trim();
        completedAt = null;
        cancelledAt = null;
        noShowAt = null;
    }

    private void ensureRegistered() {
        if (status != DonationEventRegistrationStatus.REGISTERED) {
            throw new IllegalStateException("Only registered donors can receive an event outcome");
        }
    }

    public void reactivateRegistration() {
        if (status != DonationEventRegistrationStatus.CANCELLED) {
            throw new IllegalStateException("Only cancelled registrations can be reactivated");
        }
        status = DonationEventRegistrationStatus.REGISTERED;
        registeredAt = LocalDateTime.now();
        cancelledAt = null;
        completedAt = null;


    }

    public void cancelRegistration() {
        if (status != DonationEventRegistrationStatus.REGISTERED) {
            throw new IllegalStateException("Only active registrations can be cancelled");
        }
        status = DonationEventRegistrationStatus.CANCELLED;
        cancelledAt = LocalDateTime.now();
        completedAt = null;
    }
}