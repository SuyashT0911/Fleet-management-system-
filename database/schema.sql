-- =============================================
-- FleetPro - Fleet Management System
-- Database Schema (MySQL)
-- =============================================

CREATE DATABASE IF NOT EXISTS fleetpro;
USE fleetpro;

-- 1. Roles
CREATE TABLE IF NOT EXISTS roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- 3. Customers
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Vehicle Types (helper table)
CREATE TABLE IF NOT EXISTS vehicle_types (
    vehicle_type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) UNIQUE NOT NULL
);

-- 5. Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type_id INT,
    model VARCHAR(50) NOT NULL,
    year YEAR,
    capacity INT,
    status ENUM('available','in_service','maintenance') DEFAULT 'available',
    health_score DECIMAL(5,2) DEFAULT 100.00,
    total_distance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(vehicle_type_id)
);

-- 6. Vehicle Tracking
CREATE TABLE IF NOT EXISTS vehicle_tracking (
    tracking_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    speed DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

-- 7. Drivers
CREATE TABLE IF NOT EXISTS drivers (
    driver_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(30) UNIQUE NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    experience_years INT DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    status ENUM('active','inactive') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 8. Routes
CREATE TABLE IF NOT EXISTS routes (
    route_id INT PRIMARY KEY AUTO_INCREMENT,
    route_name VARCHAR(100) NOT NULL,
    start_location VARCHAR(100) NOT NULL,
    end_location VARCHAR(100) NOT NULL,
    distance DECIMAL(10,2) NOT NULL,
    estimated_time TIME
);

-- 9. Trips
CREATE TABLE IF NOT EXISTS trips (
    trip_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    driver_id INT,
    route_id INT,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    distance_travelled DECIMAL(10,2),
    trip_status ENUM('scheduled','ongoing','completed') DEFAULT 'scheduled',
    profit DECIMAL(10,2),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
    FOREIGN KEY (route_id) REFERENCES routes(route_id)
);

-- 10. Expenses
CREATE TABLE IF NOT EXISTS expenses (
    expense_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    type ENUM('fuel','maintenance','other') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

-- 11. Maintenance
CREATE TABLE IF NOT EXISTS maintenance (
    maintenance_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    cost DECIMAL(10,2),
    next_due_date DATE,
    status ENUM('scheduled','completed') DEFAULT 'scheduled',
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

-- 12. Fuel Logs
CREATE TABLE IF NOT EXISTS fuel_logs (
    fuel_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    quantity DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    mileage DECIMAL(10,2),
    date DATE NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

-- 13. Insurance
CREATE TABLE IF NOT EXISTS insurance (
    insurance_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    provider VARCHAR(100) NOT NULL,
    policy_number VARCHAR(50) UNIQUE,
    expiry_date DATE NOT NULL,
    coverage DECIMAL(10,2),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

-- 14. Feedback
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT,
    customer_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- 15. Payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    trip_id INT,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','paid') DEFAULT 'pending',
    method ENUM('cash','card','online'),
    payment_date DATE,
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

-- 16. Schedules
CREATE TABLE IF NOT EXISTS schedules (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    driver_id INT,
    trip_id INT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
    FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
);

-- 17. Incidents
CREATE TABLE IF NOT EXISTS incidents (
    incident_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    status ENUM('reported','resolved') DEFAULT 'reported',
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);

-- 18. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT,
    issue_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id)
);

-- 19. Analytics
CREATE TABLE IF NOT EXISTS analytics (
    analytics_id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(50) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL
);

-- 20. Notifications (replaces activity_logs)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    entity_type VARCHAR(50) DEFAULT NULL,
    entity_id INT DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    details TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 21. Service Requests
CREATE TABLE IF NOT EXISTS service_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT,
    request_date DATE NOT NULL,
    description TEXT,
    status ENUM('pending','in_progress','completed') DEFAULT 'pending',
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
);
