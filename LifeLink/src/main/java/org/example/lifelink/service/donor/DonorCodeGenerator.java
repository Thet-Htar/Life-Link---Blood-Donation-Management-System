package org.example.lifelink.service.donor;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dao.donor.DonorDao;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
@RequiredArgsConstructor
public class DonorCodeGenerator {

    private static final int MIN_CODE = 100_000;
    private static final int MAX_CODE = 999_999;
    private static final int MAX_ATTEMPTS = 20;

    private final SecureRandom secureRandom = new SecureRandom();
    private final DonorDao donorDao;

    public String generateUniqueCode() {

        for (
                int attempt = 0;
                attempt < MAX_ATTEMPTS;
                attempt++
        ) {
            int generatedNumber = secureRandom.nextInt(MAX_CODE - MIN_CODE + 1) + MIN_CODE;

            String donorCode = String.valueOf(generatedNumber);

            if (!donorDao.existsByDonorCode(donorCode))
                return donorCode;
        }
        throw new IllegalStateException(
                "Unable to generate a unique donor code"
        );
    }
}