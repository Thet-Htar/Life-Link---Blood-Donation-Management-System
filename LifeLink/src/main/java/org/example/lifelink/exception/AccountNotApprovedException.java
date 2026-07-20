package org.example.lifelink.exception;

import lombok.Getter;
import org.example.lifelink.entity.VerificationStatus;

@Getter
public class AccountNotApprovedException extends RuntimeException {

    private final VerificationStatus verificationStatus;

    public AccountNotApprovedException(
            VerificationStatus verificationStatus,
            String message
    ) {
        super(message);
        this.verificationStatus = verificationStatus;
    }
}