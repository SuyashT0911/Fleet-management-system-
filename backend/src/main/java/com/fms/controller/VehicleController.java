package com.fms.controller;

import com.fms.model.Vehicle;
import com.fms.service.VehicleService;
import com.fms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAll() {
        return ResponseEntity.ok(vehicleService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(vehicleService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Vehicle> create(@RequestBody Vehicle vehicle) {
        Vehicle saved = vehicleService.create(vehicle);
        notificationService.create(
            "New Vehicle Added",
            "Vehicle " + saved.getRegistrationNumber() + " (" + saved.getModel() + ") added to fleet",
            "success", "vehicle", saved.getVehicleId()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable Integer id, @RequestBody Vehicle vehicle) {
        Vehicle updated = vehicleService.update(id, vehicle);
        notificationService.create(
            "Vehicle Updated",
            "Vehicle " + updated.getRegistrationNumber() + " details updated",
            "info", "vehicle", id
        );
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        Vehicle v = vehicleService.getById(id);
        notificationService.createForRole(
            "ROLE_ADMIN",
            "Vehicle Removed",
            "Vehicle " + v.getRegistrationNumber() + " (" + v.getModel() + ") removed from fleet by an administrator",
            "danger", "vehicle", id
        );
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
