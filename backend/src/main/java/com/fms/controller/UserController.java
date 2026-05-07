package com.fms.controller;

import com.fms.model.Role;
import com.fms.model.User;
import com.fms.repository.RoleRepository;
import com.fms.repository.UserRepository;
import com.fms.service.NotificationService;
import com.fms.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getByEmail(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return ResponseEntity.ok(user);
    }

    @GetMapping("/email/{email}/customer")
    public ResponseEntity<com.fms.model.Customer> getCustomerByEmail(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        com.fms.model.Customer customer = customerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found for email: " + email));
        return ResponseEntity.ok(customer);
    }

    @Autowired
    private com.fms.repository.DriverRepository driverRepository;
    
    @Autowired
    private com.fms.repository.CustomerRepository customerRepository;

    @PutMapping("/{id}/role")
    public ResponseEntity<User> updateRole(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String roleName = body.get("role");
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));

        user.setRole(role);
        userRepository.save(user);
        
        // Clean up or create associated profiles
        if ("ROLE_DRIVER".equals(roleName)) {
            if (!driverRepository.existsByUser(user)) {
                com.fms.model.Driver driver = new com.fms.model.Driver();
                driver.setName(user.getName());
                driver.setContactNumber(user.getPhone() != null ? user.getPhone() : "Not Provided");
                driver.setLicenseNumber("PENDING");
                driver.setUser(user);
                driverRepository.save(driver);
            }
            // Remove customer profile if switching to driver
            customerRepository.findByUser(user).ifPresent(c -> customerRepository.delete(c));
        } else if ("ROLE_CUSTOMER".equals(roleName)) {
            if (!customerRepository.existsByUser(user)) {
                com.fms.model.Customer customer = new com.fms.model.Customer();
                customer.setName(user.getName());
                customer.setEmail(user.getEmail());
                customer.setContact(user.getPhone() != null ? user.getPhone() : "Not Provided");
                customer.setUser(user);
                customerRepository.save(customer);
            }
            // Remove driver profile if switching to customer
            driverRepository.findByUser(user).ifPresent(d -> driverRepository.delete(d));
        } else {
            // If switching to ADMIN or something else, remove both sub-profiles
            driverRepository.findByUser(user).ifPresent(d -> driverRepository.delete(d));
            customerRepository.findByUser(user).ifPresent(c -> customerRepository.delete(c));
        }
        
        notificationService.create(
            "User Role Changed",
            user.getName() + "'s role changed to " + roleName.replace("ROLE_", ""),
            "info", "user", id
        );
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<User> updateProfile(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        if (body.containsKey("name")) user.setName(body.get("name"));
        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        if (body.containsKey("address")) user.setAddress(body.get("address"));
        
        userRepository.save(user);
        
        // Also update associated driver/customer name if applicable
        driverRepository.findByUser(user).ifPresent(driver -> {
            driver.setName(user.getName());
            if (body.containsKey("phone")) driver.setContactNumber(body.get("phone"));
            driverRepository.save(driver);
        });
        customerRepository.findByUser(user).ifPresent(customer -> {
            customer.setName(user.getName());
            if (body.containsKey("phone")) customer.setContact(body.get("phone"));
            if (body.containsKey("address")) customer.setAddress(body.get("address"));
            customerRepository.save(customer);
        });
        
        notificationService.create(
            "Profile Updated",
            user.getName() + " updated their profile",
            "info", "user", id
        );
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<User> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setStatus(body.get("status"));
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            // Delete associated Driver and Customer to avoid foreign key violations
            driverRepository.findByUser(user).ifPresent(driver -> driverRepository.delete(driver));
            customerRepository.findByUser(user).ifPresent(customer -> customerRepository.delete(customer));
            
            notificationService.createForRole(
                "ROLE_ADMIN",
                "User Deleted",
                "User " + user.getName() + " (" + user.getEmail() + ") has been deleted by an administrator",
                "danger", "user", id
            );
            userRepository.deleteById(id);
        }
        return ResponseEntity.noContent().build();
    }
}
