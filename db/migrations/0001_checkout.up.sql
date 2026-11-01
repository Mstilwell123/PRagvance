-- Reference schema for when entitlements move from KV to Postgres. Not applied anywhere yet.
CREATE TABLE IF NOT EXISTS processed_stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS entitlements (
  checkout_session_id TEXT PRIMARY KEY,
  product_key TEXT NOT NULL CHECK (product_key IN ('shadow_lab_group','shadow_lab_monthly','consulting_1hr')),
  customer_email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled')),
  stripe_event_id TEXT NOT NULL REFERENCES processed_stripe_events(event_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS entitlements_email_idx ON entitlements (customer_email);
