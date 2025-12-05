-- Make reservation_id nullable (payments can now be for memberships too)
ALTER TABLE payments ALTER COLUMN reservation_id DROP NOT NULL;

-- Add membership_id column
ALTER TABLE payments ADD COLUMN membership_id BIGINT REFERENCES user_memberships(id);

-- Create index for membership payments
CREATE INDEX idx_payments_membership ON payments(membership_id);
