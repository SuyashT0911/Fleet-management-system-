package com.fms.service;

import com.fms.dto.*;
import com.fms.exception.ResourceNotFoundException;
import com.fms.model.Role;
import com.fms.model.Customer;
import com.fms.model.Driver;
import com.fms.model.User;
import com.fms.repository.CustomerRepository;
import com.fms.repository.DriverRepository;
import com.fms.repository.RoleRepository;
import com.fms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Role role = roleRepository.findByRoleName(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        userRepository.save(user);

        if ("ROLE_CUSTOMER".equals(role.getRoleName())) {
            Customer customer = new Customer();
            customer.setName(user.getName());
            customer.setEmail(user.getEmail());
            customer.setContact("Not Provided");
            customer.setUser(user);
            customerRepository.save(customer);
        } else if ("ROLE_DRIVER".equals(role.getRoleName())) {
            Driver driver = new Driver();
            driver.setName(user.getName());
            driver.setContactNumber("Not Provided");
            driver.setLicenseNumber("PENDING");
            driver.setUser(user);
            driverRepository.save(driver);
        }

        // Simplified token (replace with proper JWT later)
        String token = "jwt-token-placeholder-" + user.getUserId();
        return new AuthResponse(token, user.getName(), user.getEmail(), role.getRoleName());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = "jwt-token-placeholder-" + user.getUserId();
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole().getRoleName());
    }
}
