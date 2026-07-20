package org.example.lifelink.entity.donor.booking;

import jakarta.persistence.*;
import lombok.Getter;
import org.example.lifelink.entity.IdClass;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.hospital.Hospital;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Getter
@Table(name = "private_donation_bookings", indexes = {@Index(name = "idx_private_booking_donor", columnList = "donor_id"),
                                                      @Index(name = "idx_private_booking_hospital", columnList = "hospital_id"),
                                                      @Index(name = "idx_private_booking_date_status", columnList = "booking_date,status")})
public class PrivateDonationBooking extends IdClass {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donor_id", nullable = false)
    private Donor donor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PrivateDonationBookingStatus status;

    @Column(name = "donor_note", length = 500)
    private String donorNote;

    @Column(name = "hospital_note", length = 500)
    private String hospitalNote;

    @Column(name = "eligibility_declaration_accepted", nullable = false)
    private boolean eligibilityDeclarationAccepted;

    @Column(name = "eligibility_declaration_accepted_at")
    private LocalDateTime eligibilityDeclarationAcceptedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "confirmed_by", length = 150)
    private String confirmedBy;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "completed_by", length = 150)
    private String completedBy;

    @Column(name = "no_show_at")
    private LocalDateTime noShowAt;

    @Column(name = "no_show_marked_by", length = 150)
    private String noShowMarkedBy;

    @Column(name = "deferred_at")
    private LocalDateTime deferredAt;

    @Column(name = "deferred_by", length = 150)
    private String deferredBy;

    @Column(name = "deferral_reason", length = 500)
    private String deferralReason;

    @Column(name = "outcome_note", length = 500)
    private String outcomeNote;

    public static PrivateDonationBooking create(Donor donor,
                                                Hospital hospital,
                                                LocalDate bookingDate,
                                                LocalTime startTime,
                                                LocalTime endTime,
                                                String donorNote) {
        if (donor == null) {
            throw new IllegalArgumentException("Donor is required");
        }

        if (hospital == null) {
            throw new IllegalArgumentException("Hospital is required");
        }

        if (bookingDate == null) {
            throw new IllegalArgumentException("Booking date is required");
        }

        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Booking start and end times are required");
        }

        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        PrivateDonationBooking booking = new PrivateDonationBooking();

        booking.donor = donor;
        booking.hospital = hospital;
        booking.bookingDate = bookingDate;
        booking.startTime = startTime;
        booking.endTime = endTime;
        booking.status = PrivateDonationBookingStatus.PENDING;
        booking.donorNote = normalize(donorNote);
        booking.eligibilityDeclarationAccepted = true;
        booking.eligibilityDeclarationAcceptedAt = LocalDateTime.now();

        return booking;
    }

    private static String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return value.trim();
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public void confirm(String staffEmail, String hospitalNote) {
        requireStatus(PrivateDonationBookingStatus.PENDING, "Only pending bookings can be confirmed");

        status = PrivateDonationBookingStatus.CONFIRMED;
        confirmedAt = LocalDateTime.now();
        confirmedBy = requireText(staffEmail, "Confirming staff is required");
        this.hospitalNote = normalize(hospitalNote);
    }

    public void completeDonation(String staffEmail, String outcomeNote) {
        requireStatus(PrivateDonationBookingStatus.CONFIRMED, "Only confirmed bookings can be completed");

        status = PrivateDonationBookingStatus.COMPLETED;
        completedAt = LocalDateTime.now();
        completedBy = requireText(staffEmail, "Completing staff is required");
        this.outcomeNote = normalize(outcomeNote);
    }

    public void markNoShow(String staffEmail) {
        requireStatus(PrivateDonationBookingStatus.CONFIRMED, "Only confirmed bookings can be marked as no-show");

        status = PrivateDonationBookingStatus.NO_SHOW;
        noShowAt = LocalDateTime.now();
        noShowMarkedBy = requireText(staffEmail, "Staff email is required");
    }

    public void deferDonation(String staffEmail, String reason, String note) {
        requireStatus(PrivateDonationBookingStatus.CONFIRMED, "Only confirmed bookings can be deferred");

        status = PrivateDonationBookingStatus.DEFERRED;
        deferredAt = LocalDateTime.now();
        deferredBy = requireText(staffEmail, "Staff email is required");
        deferralReason = requireText(reason, "Deferral reason is required");
        outcomeNote = normalize(note);
    }

    private void requireStatus(PrivateDonationBookingStatus expected, String message) {
        if (status != expected) {
            throw new IllegalStateException(message);
        }
    }
}