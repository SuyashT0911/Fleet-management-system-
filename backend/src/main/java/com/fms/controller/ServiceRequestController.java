package com.fms.controller;

import com.fms.model.ServiceRequest;
import com.fms.model.Maintenance;
import com.fms.repository.MaintenanceRepository;
import com.fms.service.ServiceRequestService;
import com.fms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
public class ServiceRequestController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    @GetMapping
    public ResponseEntity<List<ServiceRequest>> getAll() {
        return ResponseEntity.ok(serviceRequestService.getAll());
    }

    @PostMapping
    public ResponseEntity<ServiceRequest> create(@RequestBody ServiceRequest request) {
        ServiceRequest saved = serviceRequestService.create(request);
        String vehicleNum = saved.getVehicle() != null ? saved.getVehicle().getRegistrationNumber() : "N/A";
        
        // Notify admin about new request
        notificationService.createForRole(
            "ROLE_ADMIN",
            "New Service Request",
            "A new maintenance request has been submitted for vehicle " + vehicleNum,
            "warning", "maintenance", saved.getRequestId()
        );
        
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ServiceRequest> updateStatus(@PathVariable Integer id, @RequestBody String status) {
        // Handle status passed as plain string or JSON
        String cleanStatus = status.replace("\"", "").trim();
        ServiceRequest updated = serviceRequestService.updateStatus(id, cleanStatus);
        
        notificationService.create(
            "Service Request " + (cleanStatus.equalsIgnoreCase("approved") ? "Approved" : "Rejected"),
            "Your service request for vehicle " + (updated.getVehicle() != null ? updated.getVehicle().getRegistrationNumber() : "fleet") + " has been " + cleanStatus,
            cleanStatus.equalsIgnoreCase("approved") ? "success" : "danger",
            "maintenance", id
        );
        
        // If approved, create a Maintenance record
        if (cleanStatus.equalsIgnoreCase("approved")) {
            Maintenance m = new Maintenance();
            m.setVehicle(updated.getVehicle());
            m.setType("Repairs");
            m.setDate(updated.getRequestDate()); // or current date
            m.setStatus("scheduled");
            m.setDescription("Created from Service Request #" + id + ": " + updated.getDescription());
            maintenanceRepository.save(m);
        }
        
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        serviceRequestService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
