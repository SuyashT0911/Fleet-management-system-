package com.fms.controller;

import com.fms.model.Driver;
import com.fms.service.DriverService;
import com.fms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Driver>> getAll() {
        return ResponseEntity.ok(driverService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Driver> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(driverService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Driver> create(@RequestBody Driver driver) {
        Driver saved = driverService.create(driver);
        notificationService.create(
            "New Driver Added",
            "Driver " + saved.getName() + " (License: " + saved.getLicenseNumber() + ") added",
            "success", "driver", saved.getDriverId()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Driver> update(@PathVariable Integer id, @RequestBody Driver driver) {
        Driver updated = driverService.update(id, driver);
        notificationService.create(
            "Driver Updated",
            "Driver " + updated.getName() + " details updated",
            "info", "driver", id
        );
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        Driver d = driverService.getById(id);
        notificationService.createForRole(
            "ROLE_ADMIN",
            "Driver Removed",
            "Driver " + d.getName() + " (License: " + d.getLicenseNumber() + ") removed from system by an administrator",
            "danger", "driver", id
        );
        driverService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
