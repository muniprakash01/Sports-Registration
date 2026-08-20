CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    phone VARCHAR(10) NOT NULL,

    age INTEGER NOT NULL
        CHECK (age >= 5 AND age <= 100),

    sport VARCHAR(50) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_registrations_sport
ON registrations(sport);


CREATE INDEX IF NOT EXISTS idx_registrations_created_at
ON registrations(created_at DESC);
