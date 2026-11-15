CREATE TABLE IF NOT EXISTS rsvps (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  attending   INTEGER NOT NULL,          -- 1 = έρχεται, 0 = δεν έρχεται
  adults      INTEGER NOT NULL DEFAULT 0,
  children    INTEGER NOT NULL DEFAULT 0,
  message     TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rsvps_updated ON rsvps (updated_at);
