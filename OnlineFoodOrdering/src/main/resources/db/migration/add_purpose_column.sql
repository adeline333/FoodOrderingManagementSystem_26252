-- Add purpose column to otp_verifications table
ALTER TABLE otp_verifications 
ADD COLUMN IF NOT EXISTS purpose VARCHAR(50) NOT NULL DEFAULT 'EMAIL_VERIFICATION';

-- Update existing records to have EMAIL_VERIFICATION purpose
UPDATE otp_verifications 
SET purpose = 'EMAIL_VERIFICATION' 
WHERE purpose IS NULL OR purpose = '';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_otp_verifications_purpose 
ON otp_verifications(purpose);

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email_purpose_verified 
ON otp_verifications(email, purpose, verified);