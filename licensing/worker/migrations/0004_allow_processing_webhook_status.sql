-- Expand the existing event-status constraint without discarding event history.
CREATE TABLE payment_webhook_events_v2 (
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  received_at TEXT NOT NULL,
  processed_at TEXT,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processing', 'processed', 'failed')),
  PRIMARY KEY (provider, event_id)
);
INSERT INTO payment_webhook_events_v2 (provider, event_id, received_at, processed_at, processing_status)
SELECT provider, event_id, received_at, processed_at, processing_status FROM payment_webhook_events;
DROP TABLE payment_webhook_events;
ALTER TABLE payment_webhook_events_v2 RENAME TO payment_webhook_events;
