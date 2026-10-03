-- First-party traffic statistics; no raw IP, query string or full referrer is retained.
CREATE TABLE traffic_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL CHECK (kind IN ('page', 'api')),
  path text NOT NULL,
  visitor text,
  referrer text NOT NULL DEFAULT '',
  device text NOT NULL DEFAULT '',
  status integer NOT NULL DEFAULT 200,
  ms integer NOT NULL DEFAULT 0
);
CREATE INDEX traffic_events_time ON traffic_events (created_at);
