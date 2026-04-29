CREATE DATABASE IF NOT EXISTS tripol_trobol;
USE tripol_trobol;

DROP TABLE IF EXISTS vehicle_violations;
DROP TABLE IF EXISTS vehicle_registrations;
DROP TABLE IF EXISTS vehicles;

DROP TABLE IF EXISTS driver_addresses;
DROP TABLE IF EXISTS drivers;

DROP TABLE IF EXISTS violation_fines;
DROP TABLE IF EXISTS violations;
DROP TABLE IF EXISTS violation_locations;

CREATE TABLE drivers (
  -- displayed format: D01-23-456789
  -- stored format (no dashes): D0123456789 (11 chars)
  license_number VARCHAR(11) NOT NULL,
  first_name VARCHAR(64) NOT NULL,
  middle_name VARCHAR(64) NULL,
  last_name VARCHAR(64) NOT NULL,
  sex ENUM('M','F') NOT NULL,
  date_of_birth DATE NOT NULL,
  license_type ENUM('Student Permit','Non-Professional','Professional') NOT NULL,
  license_status ENUM('Valid','Expired','Suspended','Revoked') NOT NULL,
  issuance_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (license_number)
);

CREATE TABLE driver_addresses (
  license_number VARCHAR(11) NOT NULL,
  street VARCHAR(120) NOT NULL,
  city VARCHAR(80) NOT NULL,
  region VARCHAR(120) NOT NULL,
  province VARCHAR(80) NOT NULL,
  postal_code VARCHAR(20) NULL,
  PRIMARY KEY (license_number),
 
  CONSTRAINT fk_driver_addresses_drivers
    FOREIGN KEY (license_number)
    REFERENCES drivers(license_number)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE vehicles (
  plate_number VARCHAR(8) NOT NULL,
  engine_number VARCHAR(15) NOT NULL,
  chassis_number VARCHAR(17) NOT NULL,
  owner_license_number VARCHAR(11) NOT NULL,
  vehicle_type VARCHAR(80) NOT NULL,
  make VARCHAR(30) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year SMALLINT NOT NULL,
  color VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (plate_number),

  CONSTRAINT uk_engine UNIQUE (engine_number),
  CONSTRAINT uk_chassis UNIQUE (chassis_number),

  CONSTRAINT fk_vehicles_drivers
    FOREIGN KEY (owner_license_number)
    REFERENCES drivers(license_number)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE vehicle_registrations (
 	registration_number VARCHAR(10) PRIMARY KEY NOT NULL,
  registration_status ENUM('Active','Expired','Suspended') NOT NULL,
  registration_date DATE NOT NULL,
  vehicle_plate_number VARCHAR(8) NOT NULL,
  expiration_date DATE NOT NULL,
	
  CONSTRAINT fk_registration_vehicle
    FOREIGN KEY (vehicle_plate_number) 
    REFERENCES vehicles(plate_number)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE violations (
  violation_id INT PRIMARY KEY NOT NULL,
  license_number VARCHAR(11),
  plate_number VARCHAR(8),
  violation_type VARCHAR(255),
 	violation_date DATE,
 	apprehending_officer VARCHAR(128),
 	violation_status VARCHAR(20),

	CONSTRAINT violation_violation_type_fk
  FOREIGN KEY (violation_type) REFERENCES violation_fines(violation_type),

	CONSTRAINT violation_license_number_fk
  FOREIGN KEY (license_number) REFERENCES driver(license_number),

	CONSTRAINT violation_plate_number_fk
 	FOREIGN KEY (plate_number) REFERENCES vehicle(plate_number)
);

CREATE TABLE violation_fines (
  violation_type VARCHAR(255) PRIMARY KEY,
  fine_amount DECIMAL(10,2)
);

CREATE TABLE violation_locations(
  violation_id INT NOT NULL,
  street VARCHAR(120) NOT NULL,
  city VARCHAR(80) NOT NULL,
  region VARCHAR(120) NOT NULL,
  province VARCHAR(80) NOT NULL,
  PRIMARY KEY (violation_id),
 
  CONSTRAINT fk_violation_locations_violations
    FOREIGN KEY (violation_id)
    REFERENCES violations(violation_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

