package com.fms.controller;

import com.fms.model.Maintenance;
import com.fms.repository.MaintenanceRepository;
import com.fms.service.NotificationService;
import com.fms.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Maintenance>> getAll() {
        return ResponseEntity.ok(maintenanceRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getById(@PathVariable Integer id) {
        Maintenance m = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found: " + id));
        return ResponseEntity.ok(m);
    }

    @PostMapping
    public ResponseEntity<Maintenance> create(@RequestBody Maintenance maintenance) {
        Maintenance saved = maintenanceRepository.save(maintenance);
        String vehicleNum = saved.getVehicle() != null ? saved.getVehicle().getRegistrationNumber() : "N/A";
        notificationService.create(
            "Maintenance Scheduled",
            saved.getType() + " for vehicle " + vehicleNum + " on " + saved.getDate(),
            "warning", "maintenance", saved.getMaintenanceId()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Maintenance> update(@PathVariable Integer id, @RequestBody Maintenance details) {
        Maintenance m = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance not found: " + id));
        if (details.getType() != null) m.setType(details.getType());
        if (details.getDate() != null) m.setDate(details.getDate());
        if (details.getCost() != null) m.setCost(details.getCost());
        if (details.getNextDueDate() != null) m.setNextDueDate(details.getNextDueDate());
        if (details.getStatus() != null) m.setStatus(details.getStatus());
        if (details.getDescription() != null) m.setDescription(details.getDescription());
        if (details.getWorkshop() != null) m.setWorkshop(details.getWorkshop());
        if (details.getVehicle() != null) m.setVehicle(details.getVehicle());
        Maintenance saved = maintenanceRepository.save(m);
        String vehicleNum = saved.getVehicle() != null ? saved.getVehicle().getRegistrationNumber() : "N/A";
        notificationService.create(
            "Maintenance Updated",
            "Maintenance #" + id + " for " + vehicleNum + " → " + saved.getStatus(),
            "in_progress".equals(saved.getStatus()) ? "info" : 
            "completed".equals(saved.getStatus()) ? "success" : "warning",
            "maintenance", id
        );
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        Maintenance m = maintenanceRepository.findById(id).orElse(null);
        if (m != null) {
            String vehicleNum = m.getVehicle() != null ? m.getVehicle().getRegistrationNumber() : "N/A";
            notificationService.createForRole(
                "ROLE_ADMIN",
                "Maintenance Record Deleted",
                "Maintenance record #" + id + " (" + m.getType() + ") for vehicle " + vehicleNum + " has been deleted",
                "danger", "maintenance", id
            );
            maintenanceRepository.deleteById(id);
        }
        return ResponseEntity.noContent().build();
    }
}
