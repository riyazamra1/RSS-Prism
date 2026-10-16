-- Separate atomic claim table prevents concurrent webhook deliveries from fulfilling twice.
CREATE TABLE IF NOT EXISTS payment_webhook_claims (
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  claimed_at TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'received' CHECK (processing_status IN ('received', 'processing', 'processed', 'failed')),
  PRIMARY KEY (provider, event_id)
);
