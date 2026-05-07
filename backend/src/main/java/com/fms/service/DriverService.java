package com.fms.service;

import com.fms.exception.ResourceNotFoundException;
import com.fms.model.Driver;
import com.fms.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    public List<Driver> getAll() {
        return driverRepository.findAll();
    }

    public Driver getById(Integer id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
    }

    public Driver create(Driver driver) {
        return driverRepository.save(driver);
    }

    public Driver update(Integer id, Driver details) {
        Driver driver = getById(id);
        driver.setName(details.getName());
        driver.setLicenseNumber(details.getLicenseNumber());
        driver.setContactNumber(details.getContactNumber());
        driver.setExperienceYears(details.getExperienceYears());
        driver.setRating(details.getRating());
        driver.setStatus(details.getStatus());
        return driverRepository.save(driver);
    }

    public void delete(Integer id) {
        Driver driver = getById(id);
        driverRepository.delete(driver);
    }
}
