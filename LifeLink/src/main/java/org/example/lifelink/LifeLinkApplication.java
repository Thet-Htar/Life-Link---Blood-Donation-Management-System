package org.example.lifelink;

import org.example.lifelink.dao.UserDao;
import org.example.lifelink.entity.Role;
import org.example.lifelink.entity.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableJpaAuditing
public class LifeLinkApplication {

    public static void main(String[] args) {
        SpringApplication.run(LifeLinkApplication.class, args);
    }

    @Bean
    //@Profile("dev")
    CommandLineRunner createDefaultAdmin(
            UserDao userDao,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            String adminEmail =
                    "lifelinkadmintesting@gmail.com";

            if (userDao.existsByEmailIgnoreCase(
                    adminEmail
            )) {
                System.out.println("Default admin account already exists.");
                return;
            }

            User admin = new User();

            admin.setFullName("LifeLink Administrator");
            admin.setEmail(adminEmail);

            admin.setPassword(
                    passwordEncoder.encode(
                            "A1234567u"
                    )
            );

            admin.setRole(Role.ADMIN);
            admin.setPhone("09890087765");
            admin.setEnabled(true);
            admin.setAccountLocked(false);
            User savedAdmin = userDao.save(admin);
        };
    }
}
