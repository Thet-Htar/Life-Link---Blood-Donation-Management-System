package org.example.lifelink.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.lifelink.dto.admin.HospitalApprovedEvent;
import org.example.lifelink.service.mail.LifeLinkMailService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class HospitalApprovalEmailListener {

    private final LifeLinkMailService mailService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleHospitalApproved(HospitalApprovedEvent event) {

        try {
            mailService.sendHospitalApprovalEmail(
                    event.hospitalEmail(),
                    event.hospitalName()
            );

            log.info(
                    "Hospital approval email sent. hospitalId={}, email={}",
                    event.hospitalId(),
                    event.hospitalEmail()
            );

        } catch (Exception exception) {
            log.error(
                    "Failed to send hospital approval email. hospitalId={}",
                    event.hospitalId(),
                    exception
            );
        }
    }
}
