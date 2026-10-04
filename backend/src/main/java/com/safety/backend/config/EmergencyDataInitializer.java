package com.safety.backend.config;

import com.safety.backend.model.EmergencyContact;
import com.safety.backend.repository.EmergencyContactRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EmergencyDataInitializer implements CommandLineRunner {
    private final EmergencyContactRepository repository;
    public EmergencyDataInitializer(EmergencyContactRepository repository) { this.repository = repository; }
    @Override public void run(String... args) {
        if (repository.count() > 0) return;
        repository.saveAll(List.of(
            new EmergencyContact("South Delhi", "Control Room", "Okhla 220kV Main Dispatch Control Room", "1800-11-9090", "+91-11-26910022", "Phase 3 Industrial Area, Okhla, New Delhi"),
            new EmergencyContact("South Delhi", "Ambulance", "Emergency Ambulance", "102", "", "South Delhi"),
            new EmergencyContact("South Delhi", "Fire Station", "Fire Emergency", "101", "", "South Delhi"),
            new EmergencyContact("West Delhi", "Control Room", "Janakpuri Grid Control Room", "1800-11-9091", "+91-11-25501144", "Janakpuri, New Delhi"),
            new EmergencyContact("Central Delhi", "Control Room", "Minto Road Grid Control Room", "1800-11-9092", "+91-11-23238877", "Minto Road, New Delhi"),
            new EmergencyContact("East Delhi", "Control Room", "Mayur Vihar Grid Dispatch", "1800-11-9093", "+91-11-22719900", "Mayur Vihar, New Delhi"),
            new EmergencyContact("North Delhi", "Control Room", "Model Town Control Room", "1800-11-9094", "+91-11-27415533", "Model Town, New Delhi")
        ));
    }
}
