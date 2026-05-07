package com.fms.service;

import com.fms.exception.ResourceNotFoundException;
import com.fms.model.Vehicle;
import com.fms.model.VehicleType;
import com.fms.repository.VehicleTypeRepository;
import com.fms.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;

    public List<Vehicle> getAll() {
        return vehicleRepository.findAll();
    }

    public Vehicle getById(Integer id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    private VehicleType resolveVehicleType(Vehicle vehicle) {
        if (vehicle.getVehicleType() != null && vehicle.getVehicleType().getTypeName() != null) {
            String typeName = vehicle.getVehicleType().getTypeName();
            return vehicleTypeRepository.findByTypeName(typeName).orElseGet(() -> {
                VehicleType newType = new VehicleType();
                newType.setTypeName(typeName);
                return vehicleTypeRepository.save(newType);
            });
        }
        return null;
    }

    public Vehicle create(Vehicle vehicle) {
        vehicle.setVehicleType(resolveVehicleType(vehicle));
        return vehicleRepository.save(vehicle);
    }

    public Vehicle update(Integer id, Vehicle vehicleDetails) {
        Vehicle vehicle = getById(id);
        vehicle.setRegistrationNumber(vehicleDetails.getRegistrationNumber());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setYear(vehicleDetails.getYear());
        vehicle.setCapacity(vehicleDetails.getCapacity());
        vehicle.setStatus(vehicleDetails.getStatus());
        vehicle.setHealthScore(vehicleDetails.getHealthScore());
        vehicle.setTotalDistance(vehicleDetails.getTotalDistance());
        
        vehicle.setChassisNumber(vehicleDetails.getChassisNumber());
        vehicle.setInsuranceProvider(vehicleDetails.getInsuranceProvider());
        vehicle.setInsuranceExpiry(vehicleDetails.getInsuranceExpiry());

        vehicle.setVehicleType(resolveVehicleType(vehicleDetails));
        return vehicleRepository.save(vehicle);
    }

    public void delete(Integer id) {
        Vehicle vehicle = getById(id);
        vehicleRepository.delete(vehicle);
    }
}
