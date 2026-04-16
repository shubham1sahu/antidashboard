CREATE TABLE IF NOT EXISTS restaurant_tables (
    id BIGSERIAL PRIMARY KEY,
    table_number VARCHAR(50) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    location VARCHAR(100) NOT NULL,
    floor_number INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_restaurant_tables_capacity CHECK (capacity > 0),
    CONSTRAINT chk_restaurant_tables_status CHECK (status IN ('AVAILABLE', 'RESERVED', 'OCCUPIED'))
);

CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    table_id BIGINT NOT NULL,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    guest_count INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    special_requests VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_reservations_table FOREIGN KEY (table_id) REFERENCES restaurant_tables (id),
    CONSTRAINT chk_reservations_guest_count CHECK (guest_count > 0),
    CONSTRAINT chk_reservations_time_window CHECK (start_time < end_time),
    CONSTRAINT chk_reservations_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'))
);

CREATE INDEX IF NOT EXISTS idx_reservations_table_id ON reservations (table_id);
CREATE INDEX IF NOT EXISTS idx_reservations_reservation_date ON reservations (reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_table_date ON reservations (table_id, reservation_date);
