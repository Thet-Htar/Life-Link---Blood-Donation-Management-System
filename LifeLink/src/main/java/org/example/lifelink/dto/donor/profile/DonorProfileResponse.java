package org.example.lifelink.dto.donor.profile;

import org.example.lifelink.dto.AddressResponse;
import org.example.lifelink.entity.*;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.hospital.event.DonationHistoryType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DonorProfileResponse(
        Long donorId,
        String donorCode,
        String fullName,
        String email,
        String phone,
        AddressResponse address,
        BloodType bloodType,
        LocalDate dateOfBirth,
        BigDecimal weightKg,
        Gender gender,
        DonationHistoryType donationHistoryType,
        LocalDate lastDonationDate,
        boolean eligible,
        int donationCount
) {

    public static DonorProfileResponse fromEntity(Donor donor) {
        var user = donor.getUser();
        Address address = user.getAddress();

        AddressResponse addressResponse =
                address == null ? null : new AddressResponse(
                        address.getCity(), address.getTownship(), address.getStreet());

        return new DonorProfileResponse(
                donor.getId(),
                donor.getDonorCode(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                addressResponse,
                donor.getBloodType(),
                donor.getDateOfBirth(),
                donor.getWeightKg(),
                donor.getGender(),
                donor.getDonationHistoryType(),
                donor.getLastDonationDate(),
                donor.isEligible(),
                donor.getDonationCount()
        );
    }
}