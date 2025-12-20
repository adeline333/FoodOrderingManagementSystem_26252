-- Clear existing location data and reset sequence
-- Run this in pgAdmin before seeding new data

-- First, update any foreign key references to NULL
UPDATE users SET location_id = NULL WHERE location_id IS NOT NULL;
UPDATE restaurants SET location_id = NULL WHERE location_id IS NOT NULL;

-- Delete all location data (children first due to foreign key constraints)
DELETE FROM locations WHERE type = 'VILLAGE';
DELETE FROM locations WHERE type = 'CELL';
DELETE FROM locations WHERE type = 'SECTOR';
DELETE FROM locations WHERE type = 'DISTRICT';
DELETE FROM locations WHERE type = 'PROVINCE';

-- Reset the auto-increment sequence
ALTER SEQUENCE locations_id_seq RESTART WITH 1;

-- Verify the table is empty
SELECT COUNT(*) FROM locations;