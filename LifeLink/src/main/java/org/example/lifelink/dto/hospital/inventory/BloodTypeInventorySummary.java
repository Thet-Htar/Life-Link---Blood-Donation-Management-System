package org.example.lifelink.dto.hospital.inventory;

import org.example.lifelink.entity.BloodType;

public record BloodTypeInventorySummary(

        BloodType bloodType,

        long availableUnits,

        long reservedUnits,

        long totalUsableUnits,

        String stockLevel
) {
}