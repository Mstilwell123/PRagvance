-- Reference schema for durable gift orders. NOT APPLIED. Not provisioned.
-- Current implementation stores the same record in KV at gift-order:{checkout_session_id}
-- using the existing Upstash Redis / Vercel KV store (see src/lib/checkout/gift-orders.server.ts).
CREATE TABLE IF NOT EXISTS gift_orders (
  checkout_session_id TEXT PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'headstart', 'builder')),
  path TEXT NOT NULL CHECK (path IN ('gift', 'direct')),
  status TEXT NOT NULL CHECK (status IN ('paid', 'failed')),
  recipient_name TEXT,
  recipient_email TEXT,
  message TEXT,
  delivery_date TEXT,
  buyer_email TEXT,
  amount_total INTEGER,
  currency TEXT,
  stripe_event_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS gift_orders_recipient_email_idx ON gift_orders (recipient_email);
