package com.safety.backend.config;

import com.safety.backend.model.AdminUser;
import com.safety.backend.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;

    @Value("${app.admin.default-username:admin}")
    private String defaultUsername;

    @Value("${app.admin.default-password:admin123}")
    private String defaultPassword;

    @Value("${app.admin.pin:8888}")
    private String defaultPin;

    public DataInitializer(AdminUserRepository adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }

    @Override
    public void run(String... args) {
        adminUserRepository.findByUsername(defaultUsername).orElseGet(() ->
            adminUserRepository.save(new AdminUser(
                defaultUsername,
                defaultPassword,
                defaultPin,
                "ADMIN"
            ))
        );
    }
}
