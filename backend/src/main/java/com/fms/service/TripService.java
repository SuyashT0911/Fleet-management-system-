package com.fms.service;

import com.fms.exception.ResourceNotFoundException;
import com.fms.model.Trip;
import com.fms.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    public List<Trip> getAll() {
        return tripRepository.findAll();
    }

    public Trip getById(Integer id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
    }

    public Trip create(Trip trip) {
        return tripRepository.save(trip);
    }

    public Trip update(Integer id, Trip details) {
        Trip trip = getById(id);
        trip.setVehicle(details.getVehicle());
        trip.setDriver(details.getDriver());
        trip.setRoute(details.getRoute());
        trip.setStartTime(details.getStartTime());
        trip.setEndTime(details.getEndTime());
        trip.setDistanceTravelled(details.getDistanceTravelled());
        trip.setTripStatus(details.getTripStatus());
        trip.setProfit(details.getProfit());
        return tripRepository.save(trip);
    }

    public void delete(Integer id) {
        Trip trip = getById(id);
        tripRepository.delete(trip);
    }
}
