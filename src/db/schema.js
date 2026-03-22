const SCHEMA = `
  CREATE TABLE IF NOT EXISTS volunteers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    skills TEXT,
    availability TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    max_volunteers INTEGER,
    status TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'active', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    volunteer_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    status TEXT DEFAULT 'registered' CHECK(status IN ('registered', 'confirmed', 'attended', 'no_show', 'cancelled')),
    hours_logged REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    UNIQUE(volunteer_id, event_id)
  );
`;

module.exports = { SCHEMA };
