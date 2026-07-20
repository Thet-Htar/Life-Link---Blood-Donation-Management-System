package org.example.lifelink.dto.hospital.event;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.lifelink.entity.hospital.event.DonationDeferralReason;

public record DeferDonationRequest(

        @NotNull
        DonationDeferralReason reason,

        @Size(max = 500)
        String note
) {
}