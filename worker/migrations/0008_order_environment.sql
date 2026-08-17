ALTER TABLE orders ADD COLUMN environment TEXT NOT NULL DEFAULT 'test'
  CHECK (environment IN ('test','production'));

CREATE INDEX IF NOT EXISTS idx_orders_environment_fulfillment
  ON orders(environment,status,fulfillment_status,created_at);
