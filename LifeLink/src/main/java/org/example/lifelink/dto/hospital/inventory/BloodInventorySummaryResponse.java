package org.example.lifelink.dto.hospital.inventory;

import java.util.List;

public record BloodInventorySummaryResponse(

        long totalUnits,

        long availableUnits,

        long reservedUnits,

        long issuedUnits,

        long expiredUnits,

        long discardedUnits,

        long expiringSoonUnits,

        List<BloodTypeInventorySummary> bloodTypes
) {
}