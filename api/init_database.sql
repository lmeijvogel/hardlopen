CREATE TABLE routes (
  name TEXT,
  distance INTEGER
);

CREATE TABLE runs (
  date DATETIME,
  route_id INTEGER,
  comment TEXT,
  excuses TEXT
);
