package com.fms.service;

import com.fms.exception.ResourceNotFoundException;
import com.fms.model.Schedule;
import com.fms.model.Trip;
import com.fms.model.VehicleTracking;
import com.fms.model.Route;
import com.fms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private VehicleTrackingRepository vehicleTrackingRepository;

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private FuelLogRepository fuelLogRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private NotificationService notificationService;

    public List<Trip> getAll() {
        return tripRepository.findAllByOrderByTripIdDesc();
    }

    public Trip getById(Integer id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
    }

    @Transactional
    public Trip create(Trip trip) {
        if (trip.getDistance() == null || trip.getDistance().compareTo(BigDecimal.ZERO) == 0) {
            if (trip.getRoute() != null && trip.getRoute().getRouteId() != null) {
                Route r = routeRepository.findById(trip.getRoute().getRouteId()).orElse(null);
                if (r != null) {
                    trip.setDistance(r.getDistance());
                    trip.setDistanceTravelled(r.getDistance());
                }
            }
        }

        Trip savedTrip = tripRepository.save(trip);
        
        String routeName = savedTrip.getRoute() != null ? 
            savedTrip.getRoute().getStartLocation() + " → " + savedTrip.getRoute().getEndLocation() : "Custom Route";
        String customer = savedTrip.getCustomer() != null ? savedTrip.getCustomer().getName() : "Unknown";

        notificationService.create(
            "New Trip Scheduled",
            "Trip #" + savedTrip.getTripId() + " (" + routeName + ") for " + customer,
            "info",
            "trip",
            savedTrip.getTripId()
        );

        Schedule schedule = new Schedule();
        schedule.setTrip(savedTrip);
        schedule.setVehicle(savedTrip.getVehicle());
        schedule.setDriver(savedTrip.getDriver());
        if (savedTrip.getStartTime() != null) {
            schedule.setDate(savedTrip.getStartTime().toLocalDate());
            schedule.setStartTime(savedTrip.getStartTime().toLocalTime());
            schedule.setEndTime(savedTrip.getStartTime().toLocalTime().plusHours(2));
        }
        scheduleRepository.save(schedule);

        return savedTrip;
    }

    @Transactional
    public Trip update(Integer id, Trip tripDetails) {
        Trip savedTrip = getById(id);
        String oldStatus = savedTrip.getTripStatus();
        
        savedTrip.setTripStatus(tripDetails.getTripStatus());
        savedTrip.setDistance(tripDetails.getDistance());
        savedTrip.setDistanceTravelled(tripDetails.getDistanceTravelled());
        savedTrip.setEndTime(tripDetails.getEndTime());
        savedTrip.setProfit(tripDetails.getProfit());
        
        if (tripDetails.getDriver() != null) savedTrip.setDriver(tripDetails.getDriver());
        if (tripDetails.getVehicle() != null) savedTrip.setVehicle(tripDetails.getVehicle());
        if (tripDetails.getRoute() != null) savedTrip.setRoute(tripDetails.getRoute());
        
        Trip updated = tripRepository.save(savedTrip);

        if (tripDetails.getTripStatus() != null && !tripDetails.getTripStatus().equalsIgnoreCase(oldStatus)) {
            if ("ongoing".equalsIgnoreCase(updated.getTripStatus())) {
                notificationService.create(
                    "Trip Started",
                    "Trip #" + updated.getTripId() + " (" + (updated.getRoute() != null ? updated.getRoute().getStartLocation() : "?") + ") has started.",
                    "info",
                    "trip",
                    updated.getTripId()
                );
            } else if ("completed".equalsIgnoreCase(updated.getTripStatus())) {
                notificationService.create(
                    "Trip Completed",
                    "Trip #" + updated.getTripId() + " has been successfully completed.",
                    "success",
                    "trip",
                    updated.getTripId()
                );
            }
        }

        if ("ongoing".equalsIgnoreCase(updated.getTripStatus())) {
            VehicleTracking tracking = new VehicleTracking();
            tracking.setVehicle(updated.getVehicle());
            tracking.setLatitude(new BigDecimal("20.5937"));
            tracking.setLongitude(new BigDecimal("78.9629"));
            vehicleTrackingRepository.save(tracking);
        }

        List<Schedule> schedules = scheduleRepository.findByTrip(updated);
        for (Schedule s : schedules) {
             if (updated.getEndTime() != null) {
                 s.setEndTime(updated.getEndTime().toLocalTime());
             }
             scheduleRepository.save(s);
        }

        return updated;
    }

    @Transactional
    public void delete(Integer id) {
        Trip trip = getById(id);
        
        // 1. Delete Related Records (Cascade manually)
        fuelLogRepository.deleteAll(fuelLogRepository.findByTripTripId(id));
        incidentRepository.deleteAll(incidentRepository.findByTripTripId(id));
        expenseRepository.deleteAll(expenseRepository.findByTripTripId(id));
        paymentRepository.deleteAll(paymentRepository.findByTripTripId(id));
        feedbackRepository.deleteAll(feedbackRepository.findByTripTripId(id));
        vehicleTrackingRepository.deleteAll(vehicleTrackingRepository.findByTrip(trip));
        scheduleRepository.deleteAll(scheduleRepository.findByTrip(trip));
        
        // 2. Finally delete the trip
        tripRepository.delete(trip);
        
        notificationService.create("Trip Deleted", "Trip #" + id + " and all associated data have been removed from the system.", "danger", "trip", id);
    }
}
