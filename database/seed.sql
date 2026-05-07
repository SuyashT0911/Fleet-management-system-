-- =============================================
-- FleetPro - Seed Data
-- =============================================

USE fleetpro;

-- Roles
INSERT INTO roles (role_name) VALUES ('ROLE_ADMIN'), ('ROLE_DRIVER'), ('ROLE_CUSTOMER');

-- Vehicle Types
INSERT INTO vehicle_types (type_name) VALUES ('Truck'), ('Van'), ('Bus'), ('Car'), ('Motorcycle');

-- Users (passwords should be bcrypt-hashed in production)
INSERT INTO users (name, email, password, role_id, status) VALUES
('Admin User', 'admin@fleetpro.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1, 'active'),
('John Driver', 'john@fleetpro.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 2, 'active'),
('Jane Customer', 'jane@fleetpro.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 3, 'active');

-- Vehicles
INSERT INTO vehicles (registration_number, vehicle_type_id, model, year, capacity, status, health_score, total_distance) VALUES
('MH-12-AB-1234', 1, 'Tata Ace', 2022, 1500, 'available', 92.50, 45200.00),
('MH-12-CD-5678', 2, 'Mahindra Bolero', 2021, 800, 'in_service', 87.30, 62100.00),
('MH-12-EF-9012', 3, 'Ashok Leyland', 2023, 45, 'available', 95.00, 18500.00),
('MH-12-GH-3456', 1, 'Eicher Pro', 2020, 2000, 'maintenance', 65.80, 98000.00),
('MH-12-IJ-7890', 4, 'Toyota Innova', 2023, 7, 'available', 98.00, 12000.00);

-- Drivers
INSERT INTO drivers (user_id, name, license_number, contact_number, experience_years, rating, status) VALUES
(2, 'John Driver', 'DL-MH-2020-001234', '9876543210', 5, 4.5, 'active');

-- Routes
INSERT INTO routes (route_name, start_location, end_location, distance, estimated_time) VALUES
('Pune-Mumbai', 'Pune', 'Mumbai', 150.00, '03:00:00'),
('Pune-Nashik', 'Pune', 'Nashik', 210.00, '04:30:00'),
('Mumbai-Goa', 'Mumbai', 'Goa', 580.00, '10:00:00');

-- Trips
INSERT INTO trips (vehicle_id, driver_id, route_id, start_time, end_time, distance_travelled, trip_status, profit) VALUES
(1, 1, 1, '2026-04-10 06:00:00', '2026-04-10 09:30:00', 150.00, 'completed', 5500.00),
(2, 1, 2, '2026-04-12 05:00:00', NULL, 0.00, 'ongoing', NULL);

-- Maintenance
INSERT INTO maintenance (vehicle_id, type, date, cost, next_due_date, status) VALUES
(4, 'Engine Overhaul', '2026-04-01', 25000.00, '2026-07-01', 'scheduled'),
(1, 'Oil Change', '2026-03-15', 3500.00, '2026-06-15', 'completed');

-- Fuel Logs
INSERT INTO fuel_logs (vehicle_id, quantity, cost, mileage, date) VALUES
(1, 50.00, 5250.00, 8.5, '2026-04-10'),
(2, 40.00, 4200.00, 10.2, '2026-04-12');

-- Payments
INSERT INTO payments (trip_id, amount, status, method, payment_date) VALUES
(1, 8500.00, 'paid', 'online', '2026-04-10');

-- Customers
INSERT INTO customers (name, contact, email, address) VALUES
('Acme Logistics', '9988776655', 'acme@example.com', 'Pune, Maharashtra'),
('QuickShip Co.', '8877665544', 'quick@example.com', 'Mumbai, Maharashtra');
