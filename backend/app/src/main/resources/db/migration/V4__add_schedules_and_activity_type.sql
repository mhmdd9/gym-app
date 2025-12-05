-- Add activity_type column to activity_definitions
ALTER TABLE activity_definitions
ADD COLUMN activity_type VARCHAR(20) NOT NULL DEFAULT 'CLASS';

-- Create schedules table
CREATE TABLE schedules (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES activity_definitions(id),
    club_id BIGINT NOT NULL REFERENCES clubs(id),
    trainer_id BIGINT REFERENCES trainers(id),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE,
    capacity INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create schedule_days table for days of week (ElementCollection)
CREATE TABLE schedule_days (
    schedule_id BIGINT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    PRIMARY KEY (schedule_id, day_of_week)
);

-- Create indexes
CREATE INDEX idx_schedules_club ON schedules(club_id);
CREATE INDEX idx_schedules_activity ON schedules(activity_id);
CREATE INDEX idx_schedules_valid_from ON schedules(valid_from);
CREATE INDEX idx_schedules_active ON schedules(is_active);
