-- Independent of 00102_scoped_knowledge. Feature remains off unless opted in.
CREATE TABLE notification_settings (
 id TEXT PRIMARY KEY CHECK(id='owner'),
 enabled_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE owner_notifications (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
 goal_id UUID NOT NULL REFERENCES goals(id),
 source_event_id UUID REFERENCES outbox_events(id),
 dedup_key TEXT NOT NULL UNIQUE,
 kind TEXT NOT NULL CHECK(kind IN ('COMPLETED','FAILED','APPROVAL','PROGRESS')),
 severity TEXT NOT NULL CHECK(severity IN ('INFO','WARNING','URGENT')),
 title TEXT NOT NULL,
 body JSONB NOT NULL,
 status TEXT NOT NULL DEFAULT 'UNROUTED' CHECK(status IN ('UNROUTED','PENDING','SENDING','RETRY','ACCEPTED','CONFIRMED','FAILED','UNKNOWN','SUPPRESSED')),
 channel TEXT,
 recipient_ref TEXT,
 attempt INT NOT NULL DEFAULT 0,
 next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 lease_until TIMESTAMPTZ,
 accepted_at TIMESTAMPTZ,
 confirmed_at TIMESTAMPTZ,
 receipt_id TEXT,
 last_error_code TEXT,
 read_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 CHECK(status IN ('UNROUTED','SUPPRESSED') OR (channel IS NOT NULL AND recipient_ref IS NOT NULL))
);
CREATE TABLE notification_event_receipts (
 event_id UUID PRIMARY KEY REFERENCES outbox_events(id),
 notification_id UUID REFERENCES owner_notifications(id),
 disposition TEXT NOT NULL CHECK(disposition IN ('CREATED','SKIPPED')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE notification_delivery_attempts (
 notification_id UUID NOT NULL REFERENCES owner_notifications(id),
 attempt INT NOT NULL,
 outcome TEXT NOT NULL CHECK(outcome IN ('SENDING','RETRY','ACCEPTED','CONFIRMED','FAILED','UNKNOWN')),
 receipt_id TEXT,
 error_code TEXT,
 started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 finished_at TIMESTAMPTZ,
 PRIMARY KEY(notification_id,attempt)
);
CREATE INDEX owner_notifications_pending ON owner_notifications(status,next_attempt_at);
CREATE INDEX owner_notifications_entity ON owner_notifications(legal_entity_id,created_at DESC,id DESC);
ALTER TABLE owner_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_entity_isolation ON owner_notifications
 USING(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),''))
 WITH CHECK(legal_entity_id::text=nullif(current_setting('app.current_legal_entity_id',true),''));
REVOKE ALL ON notification_settings,notification_event_receipts,notification_delivery_attempts FROM PUBLIC;
