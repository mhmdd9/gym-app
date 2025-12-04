-- =====================================================
-- V2: Club Module Tables
-- =====================================================

-- Clubs table (Gyms)
CREATE TABLE clubs (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15),
    email VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN NOT NULL DEFAULT true,
    opening_time TIME,
    closing_time TIME,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trainers table
CREATE TABLE trainers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    club_id BIGINT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15),
    specialization VARCHAR(255),
    bio TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Activity Definitions (Class Templates)
CREATE TABLE activity_definitions (
    id BIGSERIAL PRIMARY KEY,
    club_id BIGINT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 60,
    default_capacity INT NOT NULL DEFAULT 20,
    intensity_level VARCHAR(20), -- BEGINNER, INTERMEDIATE, ADVANCED
    category VARCHAR(100), -- Yoga, HIIT, Pilates, etc.
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Class Sessions (Scheduled Instances)
CREATE TABLE class_sessions (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES activity_definitions(id) ON DELETE CASCADE,
    trainer_id BIGINT REFERENCES trainers(id),
    club_id BIGINT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INT NOT NULL,
    booked_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, CANCELLED, COMPLETED
    notes TEXT,
    version BIGINT NOT NULL DEFAULT 0, -- Optimistic locking
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Club Staff (link users to clubs with specific roles)
CREATE TABLE club_staff (
    id BIGSERIAL PRIMARY KEY,
    club_id BIGINT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- MANAGER, RECEPTIONIST, TRAINER
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, user_id)
);

-- Indexes
CREATE INDEX idx_clubs_owner ON clubs(owner_id);
CREATE INDEX idx_clubs_city ON clubs(city);
CREATE INDEX idx_trainers_club ON trainers(club_id);
CREATE INDEX idx_activity_definitions_club ON activity_definitions(club_id);
CREATE INDEX idx_class_sessions_club_date ON class_sessions(club_id, session_date);
CREATE INDEX idx_class_sessions_activity ON class_sessions(activity_id);
CREATE INDEX idx_class_sessions_trainer ON class_sessions(trainer_id);
CREATE INDEX idx_club_staff_club ON club_staff(club_id);
CREATE INDEX idx_club_staff_user ON club_staff(user_id);

