-- =====================================================
-- V3: Booking Module Tables
-- =====================================================

-- Reservations table
CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    session_id BIGINT NOT NULL REFERENCES class_sessions(id),
    club_id BIGINT NOT NULL REFERENCES clubs(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_PAYMENT',
    -- Status: PENDING_PAYMENT, PAID, CANCELLED, NO_SHOW, COMPLETED
    booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    checked_in_at TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0, -- Optimistic locking
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, session_id) -- Prevent duplicate bookings
);

-- Payments table (On-site payment records)
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    club_id BIGINT NOT NULL REFERENCES clubs(id),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'IRR', -- Iranian Rial
    method VARCHAR(30) NOT NULL, -- CASH, CARD, POS, BANK_TRANSFER
    reference_number VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, REFUNDED, FAILED
    paid_at TIMESTAMP,
    recorded_by BIGINT REFERENCES users(id), -- Staff who recorded the payment
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Entry Log (Check-in records)
CREATE TABLE entry_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    club_id BIGINT NOT NULL REFERENCES clubs(id),
    reservation_id BIGINT REFERENCES reservations(id),
    entry_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP,
    entry_type VARCHAR(30) NOT NULL DEFAULT 'CLASS', -- CLASS, GENERAL, GUEST
    recorded_by BIGINT REFERENCES users(id),
    notes TEXT
);

-- Waitlist table (for full classes)
CREATE TABLE waitlist (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    session_id BIGINT NOT NULL REFERENCES class_sessions(id),
    position INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING', -- WAITING, NOTIFIED, CONVERTED, EXPIRED
    notified_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, session_id)
);

-- Indexes
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_session ON reservations(session_id);
CREATE INDEX idx_reservations_club ON reservations(club_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_payments_reservation ON payments(reservation_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_club ON payments(club_id);
CREATE INDEX idx_entry_logs_user ON entry_logs(user_id);
CREATE INDEX idx_entry_logs_club ON entry_logs(club_id);
CREATE INDEX idx_waitlist_session ON waitlist(session_id);
CREATE INDEX idx_waitlist_user ON waitlist(user_id);

