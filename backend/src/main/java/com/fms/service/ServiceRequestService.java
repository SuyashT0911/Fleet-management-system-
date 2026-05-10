package com.fms.service;

import com.fms.exception.ResourceNotFoundException;
import com.fms.model.ServiceRequest;
import com.fms.repository.ServiceRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ServiceRequestService {

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    public List<ServiceRequest> getAll() {
        return serviceRequestRepository.findAll();
    }

    public ServiceRequest getById(Integer id) {
        return serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + id));
    }

    public ServiceRequest create(ServiceRequest request) {
        if (request.getRequestDate() == null) {
            request.setRequestDate(java.time.LocalDate.now());
        }
        if (request.getStatus() == null) {
            request.setStatus("pending");
        }
        return serviceRequestRepository.save(request);
    }

    public ServiceRequest updateStatus(Integer id, String status) {
        ServiceRequest request = getById(id);
        request.setStatus(status);
        return serviceRequestRepository.save(request);
    }

    public void delete(Integer id) {
        ServiceRequest request = getById(id);
        serviceRequestRepository.delete(request);
    }
}
