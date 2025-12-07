-- Database Migration: Add fuel_type column to enquiries table
-- Run this script in your backend database to fix the "fuel_type does not exist" error
-- Date: December 3, 2025

-- 1. Check if fuel_type column already exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'enquiries' 
AND column_name = 'fuel_type';

-- 2. Add fuel_type column to enquiries table (if it doesn't exist)
-- This column is optional (nullable) to maintain backward compatibility
ALTER TABLE enquiries 
ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50);

-- 3. Add comment to document the column
COMMENT ON COLUMN enquiries.fuel_type IS 'Fuel type of the vehicle (Petrol, Diesel, EV, CNG, Petrol GDI)';

-- 4. Optional: Add index if you plan to filter/search by fuel type
CREATE INDEX IF NOT EXISTS idx_enquiries_fuel_type ON enquiries(fuel_type);

-- 5. Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'enquiries' 
AND column_name = 'fuel_type';

-- Migration complete!
-- The backend should now be able to query the fuel_type column without errors.

