package org.example.lifelink.service.common;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dao.donor.DonorDao;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.hospital.event.DonationHistoryType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DonationCompletionService {

    private final DonorDao donorDao;

    @Transactional
    public Donor recordCompletedDonation(
            Donor donor,
            LocalDate donationDate) {

        if (donor == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Donor profile was not found");
        }

        if (donationDate == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Donation date is required"
            );
        }

        int currentDonationCount = Math.max(donor.getDonationCount(), 0);
        donor.setDonationCount(currentDonationCount + 1);
        donor.setLastDonationDate(donationDate);
        donor.setDonationHistoryType(DonationHistoryType.EXACT_DATE);
        donor.setEligible(false);

        return donorDao.save(donor);
    }
}