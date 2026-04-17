CREATE DATABASE IF NOT EXISTS tripol_trobol;
USE tripol_trobol;

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

INSERT INTO drivers (
  license_number, first_name, middle_name, last_name,
  date_of_birth, sex, license_type, license_status,
  issuance_date, expiration_date
) VALUES
('D0123456789', 'Shane', 'Coladilla', 'Pepito', '1990-05-15', 'F', 'Professional', 'Valid', '2021-05-15', '2026-05-15'),
('D0122345678', 'Mark Erwin', 'Palita', 'Pesino', '1992-08-22', 'M', 'Non-Professional', 'Valid', '2020-08-22', '2025-08-22'),
('D0121234567', 'Jimin', NULL, 'Park', '1988-03-10', 'M', 'Professional', 'Expired', '2019-03-10', '2024-03-10'),
('D0123567890', 'Jungkook', NULL, 'Jeon', '1996-11-30', 'F', 'Non-Professional', 'Suspended', '2020-11-30', '2025-11-30'),
('D0124678901', 'Aaron Michael', 'Montes', 'Ariedo', '1985-07-18', 'M', 'Professional', 'Valid', '2022-07-18', '2027-07-18');
  
INSERT INTO driver_addresses (
  license_number, street, city, region, province, postal_code
) VALUES
('D0123456789', '123 Rizal Avenue', 'City of Manila', 'National Capital Region (NCR)', 'Metro Manila', '1000'),
('D0122345678', '45 Mabini St.', 'Quezon City', 'National Capital Region (NCR)', 'Metro Manila', '1100'),
('D0121234567', '78 Bonifacio Ave.', 'City of Manila', 'National Capital Region (NCR)', 'Metro Manila', '1000'),
('D0123567890', '12 Katipunan Ave.', 'Quezon City', 'National Capital Region (NCR)', 'Metro Manila', '1108'),
('D0124678901', '9 J.P. Laurel St.', 'City of Davao', 'Region XI (Davao Region)', 'Davao del Sur', '8000');
