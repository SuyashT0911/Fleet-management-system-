package com.fms.config;

import com.fms.model.Role;
import com.fms.model.User;
import com.fms.repository.RoleRepository;
import com.fms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles if they don't exist
        for (String roleName : Arrays.asList("ROLE_ADMIN", "ROLE_DRIVER", "ROLE_CUSTOMER")) {
            if (!roleRepository.findByRoleName(roleName).isPresent()) {
                Role role = new Role();
                role.setRoleName(roleName);
                roleRepository.save(role);
            }
        }

        // Initialize admin user if no admin exists, or force update the password
        Role adminRole = roleRepository.findByRoleName("ROLE_ADMIN").get();
        java.util.Optional<User> existingAdmin = userRepository.findByEmail("admin2@fleetpro.com");
        
        if (existingAdmin.isPresent()) {
            User admin = existingAdmin.get();
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(adminRole); // ensure role is correct
            userRepository.save(admin);
            System.out.println("Default admin user updated: admin2@fleetpro.com / admin123");
        } else {
            User admin = new User();
            admin.setName("System Administrator");
            admin.setEmail("admin2@fleetpro.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(adminRole);
            userRepository.save(admin);
            System.out.println("Default admin user created: admin2@fleetpro.com / admin123");
        }

        // Also force update John Driver's password so we know exactly what it is
        java.util.Optional<User> john = userRepository.findByEmail("john@fleetpro.com");
        if (john.isPresent()) {
            User driver = john.get();
            driver.setPassword(passwordEncoder.encode("driver123"));
            userRepository.save(driver);
            System.out.println("John Driver user updated: john@fleetpro.com / driver123");
        }
    }
}
