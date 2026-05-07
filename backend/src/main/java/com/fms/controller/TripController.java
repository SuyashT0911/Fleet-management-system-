package com.fms.controller;

import com.fms.model.Trip;
import com.fms.service.TripService;
import com.fms.service.NotificationService;
import com.fms.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    @Autowired
    private TripService tripService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TripRepository tripRepository;

    @GetMapping
    public ResponseEntity<List<Trip>> getAll() {
        return ResponseEntity.ok(tripService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(tripService.getById(id));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Trip>> getByDriver(@PathVariable Integer driverId) {
        return ResponseEntity.ok(tripRepository.findByDriverId(driverId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Trip>> getByCustomer(@PathVariable Integer customerId) {
        return ResponseEntity.ok(tripRepository.findByCustomerId(customerId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Trip>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(tripRepository.findByTripStatus(status));
    }

    @PostMapping
    public ResponseEntity<Trip> create(@RequestBody Trip trip) {
        Trip created = tripService.create(trip);
        Trip fullTrip = tripService.getById(created.getTripId()); // Fetch to get nested data
        String route = fullTrip.getRoute() != null && fullTrip.getRoute().getStartLocation() != null ? 
            fullTrip.getRoute().getStartLocation() + " → " + fullTrip.getRoute().getEndLocation() : "Custom/Unknown Route";
        String driver = fullTrip.getDriver() != null && fullTrip.getDriver().getName() != null ? fullTrip.getDriver().getName() : "Unassigned";
        String customer = fullTrip.getCustomer() != null && fullTrip.getCustomer().getName() != null ? fullTrip.getCustomer().getName() : "Unknown Customer";
        
        notificationService.create(
            "New Trip Booked",
            "Trip #" + created.getTripId() + " (" + route + ") booked by " + customer + ". Driver: " + driver,
            "info", "trip", created.getTripId()
        );

        // Notify Driver specifically
        if (fullTrip.getDriver() != null && fullTrip.getDriver().getUser() != null) {
            notificationService.createForUser(
                fullTrip.getDriver().getUser(),
                "New Trip Assigned",
                "You have been assigned to Trip #" + created.getTripId() + " (" + route + ")",
                "info", "trip", created.getTripId()
            );
        }

        // Notify Customer specifically
        if (fullTrip.getCustomer() != null && fullTrip.getCustomer().getUser() != null) {
            notificationService.createForUser(
                fullTrip.getCustomer().getUser(),
                "Trip Booking Confirmed",
                "Your trip #" + created.getTripId() + " (" + route + ") has been confirmed. Driver: " + driver,
                "success", "trip", created.getTripId()
            );
        }
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trip> update(@PathVariable Integer id, @RequestBody Trip trip) {
        Trip updated = tripService.update(id, trip);
        String route = updated.getRoute() != null ?
            updated.getRoute().getStartLocation() + " → " + updated.getRoute().getEndLocation() : "Unknown Route";
        String statusType = "completed".equals(updated.getTripStatus()) ? "success" : 
                            "ongoing".equals(updated.getTripStatus()) ? "info" : "warning";
        notificationService.create(
            "Trip #" + id + " Updated",
            "Trip " + route + " status changed to " + updated.getTripStatus(),
            statusType, "trip", id
        );

        // Targeted notifications for driver and customer
        if (updated.getDriver() != null && updated.getDriver().getUser() != null) {
            notificationService.createForUser(
                updated.getDriver().getUser(),
                "Trip Status Updated",
                "Trip #" + id + " (" + route + ") is now " + updated.getTripStatus(),
                statusType, "trip", id
            );
        }
        if (updated.getCustomer() != null && updated.getCustomer().getUser() != null) {
            notificationService.createForUser(
                updated.getCustomer().getUser(),
                "Trip Status Updated",
                "Your trip #" + id + " (" + route + ") is now " + updated.getTripStatus(),
                statusType, "trip", id
            );
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        tripService.delete(id);
        notificationService.create("Trip Deleted", "Trip #" + id + " has been deleted", "danger", "trip", id);
        return ResponseEntity.noContent().build();
    }
}
