package org.example.lifelink.service.common;

import org.example.lifelink.dto.donor.booking.PrivateDonationBookingResponse;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.hospital.Hospital;
import org.example.lifelink.entity.User;
import org.example.lifelink.entity.donor.booking.PrivateDonationBooking;
import org.springframework.stereotype.Component;

@Component
public class PrivateDonationBookingHelper {

    public PrivateDonationBookingResponse bookingResponse(PrivateDonationBooking booking) {

        Donor donor = booking.getDonor();
        User user = donor == null ? null : donor.getUser();
        Hospital hospital = booking.getHospital();

        return new PrivateDonationBookingResponse(
                booking.getId(),
                donor == null ? null : donor.getId(),
                donor == null ? "" : donor.getDonorCode(),
                user == null ? "" : user.getFullName(),
                user == null ? "" : user.getEmail(),
                donor == null ? null : donor.getBloodType(),
                hospital == null ? null : hospital.getId(),
                hospital == null ? "" : hospital.getHospitalName(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus(),
                booking.getDonorNote(),
                booking.getHospitalNote(),
                booking.isEligibilityDeclarationAccepted(),
                booking.getEligibilityDeclarationAcceptedAt(),
                booking.getConfirmedAt(),
                booking.getConfirmedBy(),
                booking.getCompletedAt(),
                booking.getCompletedBy(),
                booking.getNoShowAt(),
                booking.getNoShowMarkedBy(),
                booking.getDeferredAt(),
                booking.getDeferredBy(),
                booking.getDeferralReason(),
                booking.getOutcomeNote(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}