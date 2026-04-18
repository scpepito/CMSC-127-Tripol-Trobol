CREATE DATABASE IF NOT EXISTS tripol_trobol;
USE tripol_trobol;

DROP TABLE IF EXISTS vehicle_violations;

DROP TABLE IF EXISTS vehicle_registrations;

DROP TABLE IF EXISTS vehicles;

DROP TABLE IF EXISTS driver_addresses;

DROP TABLE IF EXISTS drivers;

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

INSERT INTO drivers (
  license_number, first_name, middle_name, last_name,
  date_of_birth, sex, license_type, license_status,
  issuance_date, expiration_date
) VALUES
('D0124678901', 'Aaron Michael', 'Montes', 'Ariedo', '1985-07-18', 'M', 'Professional', 'Valid', '2022-07-18', '2027-07-18'),
('D0198765432', 'Shane', 'Coladilla', 'Pepito', '1990-05-15', 'F', 'Professional', 'Valid', '2021-05-15', '2026-05-15'),
('D0191234567', 'Mark Erwin', 'Palita', 'Pesino', '1992-08-22', 'M', 'Non-Professional', 'Valid', '2020-08-22', '2025-08-22'),
('D0187654321', 'Jimin', NULL, 'Park', '1988-03-10', 'M', 'Professional', 'Expired', '2019-03-10', '2024-03-10'),
('D0181234567', 'Jungkook', NULL, 'Jeon', '1996-11-30', 'F', 'Non-Professional', 'Suspended', '2020-11-30', '2025-11-30');
  
INSERT INTO driver_addresses (
  license_number, street, city, region, province, postal_code
) VALUES
('D0124678901', '9 J.P. Laurel St.', 'City of Davao', 'Region XI (Davao Region)', 'Davao del Sur', '8000'),
('D0198765432', '123 Mabini St.', 'City of Manila', 'National Capital Region (NCR)', 'Metro Manila', '1000'),
('D0191234567', '15 Garcia St.', 'Quezon City', 'National Capital Region (NCR)', 'Metro Manila', '1100'),
('D0187654321', '9 J.P. Laurel St.', 'City of Davao', 'Region XI (Davao Region)', 'Davao del Sur', '8000'),
('D0181234567', '8 Osmena Blvd.', 'Cebu City', 'Region VII (Central Visayas)', 'Cebu', '6000');

INSERT INTO vehicles (
  plate_number, engine_number, chassis_number, owner_license_number,
  vehicle_type, make, model, year, color
) VALUES
('ABC-1234', '4G18-AB123456', 'MH8AB567890123456', 'D0198765432', 'Private Car', 'Toyota', 'Vios', 2020, 'White'),
('XYZ-5678', 'HC150-XY987654', 'JH2RC4460XM123456', 'D0198765432', 'Motorcycle', 'Honda', 'Click 150i', 2022, 'Red'),
('DEF-9876', '1TR-FE-DF246810', 'JTMBR32V6JH123456', 'D0191234567', 'Public Utility Vehicle', 'Toyota', 'Innova', 2019, 'Silver'),
('GHI-2468', 'G4FC-GH135791', 'KMHCU41D9FU123456', 'D0187654321', 'Private Car', 'Hyundai', 'Accent', 2021, 'Blue'),
('JKL-1357', 'CB650R-JK112233', 'MLHRC7485P5123456', 'D0181234567', 'Motorcycle', 'Honda', 'CB650R', 2023, 'Black');
