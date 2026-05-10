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
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Trip> update(@PathVariable Integer id, @RequestBody Trip trip) {
        Trip updated = tripService.update(id, trip);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        tripService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
