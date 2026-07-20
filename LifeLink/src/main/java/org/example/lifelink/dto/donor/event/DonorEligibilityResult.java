package org.example.lifelink.dto.donor.event;

import java.time.LocalDate;
import java.util.List;

public record DonorEligibilityResult(
        boolean eligible,
        LocalDate nextEligibleDate,
        List<String> reasons
) {
}