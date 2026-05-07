package com.fms.controller;

import com.fms.model.FuelLog;
import com.fms.repository.FuelLogRepository;
import com.fms.service.NotificationService;
import com.fms.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel")
public class FuelController {

    @Autowired
    private FuelLogRepository fuelLogRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<FuelLog>> getAll() {
        return ResponseEntity.ok(fuelLogRepository.findAll());
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<FuelLog>> getByTrip(@PathVariable Integer tripId) {
        return ResponseEntity.ok(fuelLogRepository.findByTripTripId(tripId));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<FuelLog>> getByDriver(@PathVariable Integer driverId) {
        return ResponseEntity.ok(fuelLogRepository.findByDriverDriverId(driverId));
    }

    @PostMapping
    public ResponseEntity<FuelLog> create(@RequestBody FuelLog fuelLog) {
        FuelLog saved = fuelLogRepository.save(fuelLog);
        FuelLog fullLog = fuelLogRepository.findById(saved.getFuelId()).orElse(saved);
        String vehicleNum = fullLog.getVehicle() != null && fullLog.getVehicle().getRegistrationNumber() != null ? fullLog.getVehicle().getRegistrationNumber() : "Unknown Vehicle";
        notificationService.create(
            "Fuel Log Added",
            "₹" + fullLog.getCost() + " fuel entry for " + vehicleNum +
            (fullLog.getTrip() != null ? " (Trip #" + fullLog.getTrip().getTripId() + ")" : ""),
            "info", "fuel", saved.getFuelId()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuelLog> update(@PathVariable Integer id, @RequestBody FuelLog details) {
        FuelLog log = fuelLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel log not found: " + id));
        if (details.getVehicle() != null) log.setVehicle(details.getVehicle());
        if (details.getTrip() != null) log.setTrip(details.getTrip());
        if (details.getDriver() != null) log.setDriver(details.getDriver());
        if (details.getQuantity() != null) log.setQuantity(details.getQuantity());
        if (details.getCost() != null) log.setCost(details.getCost());
        if (details.getMileage() != null) log.setMileage(details.getMileage());
        if (details.getDate() != null) log.setDate(details.getDate());
        FuelLog saved = fuelLogRepository.save(log);
        notificationService.create(
            "Fuel Log Updated",
            "Fuel log #" + id + " updated",
            "info", "fuel", id
        );
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        FuelLog log = fuelLogRepository.findById(id).orElse(null);
        if (log != null) {
            String vehicleNum = log.getVehicle() != null ? log.getVehicle().getRegistrationNumber() : "N/A";
            notificationService.createForRole(
                "ROLE_ADMIN",
                "Fuel Log Deleted",
                "Fuel log #" + id + " (₹" + log.getCost() + ") for vehicle " + vehicleNum + " has been deleted",
                "danger", "fuel", id
            );
            fuelLogRepository.deleteById(id);
        }
        return ResponseEntity.noContent().build();
    }
}
