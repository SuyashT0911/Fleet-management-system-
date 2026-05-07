package com.fms.controller;

import com.fms.model.Incident;
import com.fms.repository.IncidentRepository;
import com.fms.service.NotificationService;
import com.fms.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Incident>> getAll() {
        return ResponseEntity.ok(incidentRepository.findAll());
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Incident>> getByTrip(@PathVariable Integer tripId) {
        return ResponseEntity.ok(incidentRepository.findByTripTripId(tripId));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Incident>> getByDriver(@PathVariable Integer driverId) {
        return ResponseEntity.ok(incidentRepository.findByDriverDriverId(driverId));
    }

    @PostMapping
    public ResponseEntity<Incident> create(@RequestBody Incident incident) {
        Incident saved = incidentRepository.save(incident);
        Incident fullIncident = incidentRepository.findById(saved.getIncidentId()).orElse(saved);
        String driverName = fullIncident.getDriver() != null && fullIncident.getDriver().getName() != null ? fullIncident.getDriver().getName() : "Unknown Driver";
        String vehicleNum = fullIncident.getVehicle() != null && fullIncident.getVehicle().getRegistrationNumber() != null ? fullIncident.getVehicle().getRegistrationNumber() : "Unknown Vehicle";
        notificationService.create(
            "Incident Reported",
            driverName + " reported: " + fullIncident.getType() + " on " + vehicleNum +
            (fullIncident.getTrip() != null ? " (Trip #" + fullIncident.getTrip().getTripId() + ")" : ""),
            "danger", "incident", saved.getIncidentId()
        );
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Incident> update(@PathVariable Integer id, @RequestBody Incident details) {
        Incident i = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + id));
        i.setDescription(details.getDescription());
        i.setStatus(details.getStatus());
        i.setDate(details.getDate());
        if (details.getType() != null) i.setType(details.getType());
        if (details.getVehicle() != null) i.setVehicle(details.getVehicle());
        if (details.getTrip() != null) i.setTrip(details.getTrip());
        if (details.getDriver() != null) i.setDriver(details.getDriver());
        Incident saved = incidentRepository.save(i);
        notificationService.create(
            "Incident Updated",
            "Incident #" + id + " status: " + saved.getStatus(),
            "warning", "incident", id
        );
        return ResponseEntity.ok(saved);
    }
}
