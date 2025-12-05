-- Remove session-based membership columns

-- Drop session-based columns from membership_plans
ALTER TABLE membership_plans DROP COLUMN IF EXISTS plan_type;
ALTER TABLE membership_plans DROP COLUMN IF EXISTS session_count;
ALTER TABLE membership_plans DROP COLUMN IF EXISTS validity_days;

-- Make duration_days NOT NULL
ALTER TABLE membership_plans ALTER COLUMN duration_days SET NOT NULL;

-- Drop remaining_sessions from user_memberships
ALTER TABLE user_memberships DROP COLUMN IF EXISTS remaining_sessions;
