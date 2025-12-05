-- Create membership_plans table
CREATE TABLE membership_plans (
    id BIGSERIAL PRIMARY KEY,
    club_id BIGINT NOT NULL REFERENCES clubs(id),
    activity_id BIGINT REFERENCES activity_definitions(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    plan_type VARCHAR(20) NOT NULL,
    duration_days INTEGER,
    session_count INTEGER,
    validity_days INTEGER,
    price DECIMAL(12, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_memberships table
CREATE TABLE user_memberships (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    plan_id BIGINT NOT NULL REFERENCES membership_plans(id),
    club_id BIGINT NOT NULL REFERENCES clubs(id),
    start_date DATE NOT NULL,
    end_date DATE,
    remaining_sessions INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    payment_id BIGINT REFERENCES payments(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance table
CREATE TABLE attendance (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    membership_id BIGINT NOT NULL REFERENCES user_memberships(id),
    club_id BIGINT NOT NULL REFERENCES clubs(id),
    session_id BIGINT REFERENCES class_sessions(id),
    check_in_time TIMESTAMP NOT NULL,
    recorded_by_user_id BIGINT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_membership_plans_club ON membership_plans(club_id);
CREATE INDEX idx_membership_plans_activity ON membership_plans(activity_id);
CREATE INDEX idx_membership_plans_active ON membership_plans(is_active);

CREATE INDEX idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_plan ON user_memberships(plan_id);
CREATE INDEX idx_user_memberships_club ON user_memberships(club_id);
CREATE INDEX idx_user_memberships_status ON user_memberships(status);
CREATE INDEX idx_user_memberships_end_date ON user_memberships(end_date);

CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_membership ON attendance(membership_id);
CREATE INDEX idx_attendance_club ON attendance(club_id);
CREATE INDEX idx_attendance_session ON attendance(session_id);
CREATE INDEX idx_attendance_check_in_time ON attendance(check_in_time);
