package org.example.lifelink.service.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LifeLinkMailService {

    private final JavaMailSender mailSender;

    @Value("${lifelink.mail.from}")
    private String senderEmail;

    public void sendSimpleEmail(
            String recipient,
            String subject,
            String body
    ) {
        if (recipient == null ||
                recipient.isBlank()) {
            throw new IllegalArgumentException("Mail recipient must not be empty.");
        }

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(recipient.trim());
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }

    public void sendHospitalApprovalEmail(
            String recipient,
            String hospitalName) {

        String subject = "LifeLink Hospital Registration Approved";

        String body = """
                Dear %s,
                
                Your hospital registration has been approved by the LifeLink administrator.
                
                You may now sign in to the LifeLink Hospital Portal using your registered email address and password.
                
                Thank you,
                LifeLink Team
                """.formatted(hospitalName);

        sendSimpleEmail(
                recipient,
                subject,
                body
        );
    }
}