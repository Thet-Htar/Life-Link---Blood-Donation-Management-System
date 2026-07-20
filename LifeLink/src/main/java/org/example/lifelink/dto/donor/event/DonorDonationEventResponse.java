package org.example.lifelink.dto.donor.event;

public record DonorDonationEventResponse(
        Long id,
        String eventTitle,
        String hospitalName,
        Integer targetDonorCount,
        long registeredDonors,
        long remainingSlots,
        boolean registrationFull,
        boolean alreadyRegistered
) {
}
