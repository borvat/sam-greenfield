-- Opt-in only. Existing runtime roles receive no grants here.
CREATE TABLE executive_report_settings (
 legal_entity_id uuid PRIMARY KEY REFERENCES legal_entities(id), enabled boolean NOT NULL DEFAULT false,
 timezone text NOT NULL DEFAULT 'Asia/Damascus', daily_time text NOT NULL DEFAULT '08:00' CHECK(daily_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
 weekly_time text NOT NULL DEFAULT '08:00' CHECK(weekly_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
 weekly_day int NOT NULL DEFAULT 0 CHECK(weekly_day BETWEEN 0 AND 6),
 channel text, recipient_ref text, approved_by text, updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(NOT enabled OR approved_by IS NOT NULL)
);
CREATE TABLE executive_reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), legal_entity_id uuid NOT NULL REFERENCES legal_entities(id),
 report_type text NOT NULL CHECK(report_type IN('DAILY','WEEKLY')), period_key text NOT NULL,
 timezone text NOT NULL, planned_at timestamptz NOT NULL, generated_at timestamptz NOT NULL DEFAULT now(),
 artifact jsonb NOT NULL, artifact_hash text NOT NULL, status text NOT NULL DEFAULT 'BLOCKED'
 CHECK(status IN('BLOCKED','READY','SENDING','RETRY','CONFIRMED','ACCEPTED','UNKNOWN','FAILED')),
 channel text, recipient_ref text, attempt int NOT NULL DEFAULT 0 CHECK(attempt BETWEEN 0 AND 3),
 next_attempt_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz, delivery_token uuid,
 sent_at timestamptz, receipt_id text, last_error_code text,
 UNIQUE(legal_entity_id,report_type,period_key),
 CHECK(status NOT IN('CONFIRMED','ACCEPTED') OR (receipt_id IS NOT NULL AND sent_at IS NOT NULL))
);
CREATE TABLE executive_report_attempts (
 report_id uuid NOT NULL REFERENCES executive_reports(id), attempt int NOT NULL, delivery_token uuid NOT NULL,
 outcome text NOT NULL, receipt_id text, started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
 PRIMARY KEY(report_id,attempt)
);
ALTER TABLE executive_report_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_report_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY executive_settings_current ON executive_report_settings FOR ALL
 USING(legal_entity_id=current_legal_entity_id()) WITH CHECK(legal_entity_id=current_legal_entity_id());
CREATE POLICY executive_reports_current ON executive_reports FOR ALL
 USING(legal_entity_id=current_legal_entity_id()) WITH CHECK(legal_entity_id=current_legal_entity_id());
CREATE POLICY executive_attempts_current ON executive_report_attempts FOR ALL
 USING(EXISTS(SELECT 1 FROM executive_reports r WHERE r.id=report_id))
 WITH CHECK(EXISTS(SELECT 1 FROM executive_reports r WHERE r.id=report_id));
REVOKE ALL ON executive_report_settings,executive_reports,executive_report_attempts FROM PUBLIC;
