package com.safety.backend.controller;

import com.safety.backend.model.EmergencyContact;
import com.safety.backend.repository.EmergencyContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/emergency")
@CrossOrigin(origins = "*")
public class EmergencyContactController {

    private final EmergencyContactRepository repository;
    private final com.safety.backend.service.AdminTokenService adminTokenService;

    @Autowired
    public EmergencyContactController(EmergencyContactRepository repository, com.safety.backend.service.AdminTokenService adminTokenService) {
        this.repository = repository;
        this.adminTokenService = adminTokenService;
    }

    @GetMapping
    public List<EmergencyContact> getAllContacts(@RequestParam(required = false) String area) {
        if (area != null && !area.isBlank()) {
            return repository.findByArea(area);
        }
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<EmergencyContact> saveContact(@RequestBody EmergencyContact contact, @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!adminTokenService.isValid(token)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(repository.save(contact));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id, @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (!adminTokenService.isValid(token)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

}
