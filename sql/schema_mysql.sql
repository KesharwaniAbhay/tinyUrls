CREATE TABLE IF NOT EXISTS links (
  code VARCHAR(8) PRIMARY KEY,
  target_url TEXT NOT NULL,
  clicks BIGINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_clicked DATETIME NULL
);

CREATE INDEX IF NOT EXISTS idx_links_created_at ON links (created_at);
