-- =============================================
-- FleetPro - V2 Full Integration Migration
-- =============================================

USE fleetpro;

-- Add phone and address to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL;

-- Add user_id to feedback for all user types (not just customers)
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_id INT DEFAULT NULL;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS admin_reply TEXT DEFAULT NULL;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
-- Safe: only add FK if not exists
-- ALTER TABLE feedback ADD CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Add trip_id and driver_id to incidents
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS trip_id INT DEFAULT NULL;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS driver_id INT DEFAULT NULL;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Other';
-- ALTER TABLE incidents ADD CONSTRAINT fk_incident_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id);
-- ALTER TABLE incidents ADD CONSTRAINT fk_incident_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id);

-- Add trip_id and driver_id to fuel_logs
ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS trip_id INT DEFAULT NULL;
ALTER TABLE fuel_logs ADD COLUMN IF NOT EXISTS driver_id INT DEFAULT NULL;
-- ALTER TABLE fuel_logs ADD CONSTRAINT fk_fuel_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id);
-- ALTER TABLE fuel_logs ADD CONSTRAINT fk_fuel_driver FOREIGN KEY (driver_id) REFERENCES drivers(driver_id);

-- Add workshop and description to maintenance  
ALTER TABLE maintenance ADD COLUMN IF NOT EXISTS workshop VARCHAR(100) DEFAULT NULL;
ALTER TABLE maintenance ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;

-- Update maintenance status enum to include in_progress
ALTER TABLE maintenance MODIFY COLUMN status ENUM('scheduled','in_progress','completed') DEFAULT 'scheduled';

-- Add customer_id to trips (already in model, ensure column exists)
-- Already handled by JPA but ensure the column exists
ALTER TABLE trips ADD COLUMN IF NOT EXISTS customer_id INT DEFAULT NULL;

-- Create notifications table
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

-- Add user_id to customers table (if not exists, already in model)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id INT DEFAULT NULL;

-- Remove unused activity_logs table (replaced by notifications)
DROP TABLE IF EXISTS activity_logs;
