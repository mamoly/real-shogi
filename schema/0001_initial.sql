CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  skill_total INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS match_players (
  match_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  seat INTEGER NOT NULL,
  result TEXT,
  PRIMARY KEY (match_id, user_id),
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS pieces (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  piece_type TEXT NOT NULL,
  skill INTEGER NOT NULL,
  is_captured INTEGER NOT NULL DEFAULT 0,
  captured_by_user_id TEXT,
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS piece_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id TEXT NOT NULL,
  piece_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  from_square TEXT,
  to_square TEXT,
  promote_declared INTEGER NOT NULL DEFAULT 0,
  was_successful INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (piece_id) REFERENCES pieces(id),
  FOREIGN KEY (actor_user_id) REFERENCES users(id)
);
