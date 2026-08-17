ALTER TABLE orders ADD COLUMN fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled'
  CHECK (fulfillment_status IN ('unfulfilled','ready','processing','partially_shipped','shipped','delivered','cancelled','failed'));

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('manual','dsers','cj','other')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_sources (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  supplier_id TEXT NOT NULL,
  supplier_product_id TEXT,
  supplier_variant_id TEXT,
  supplier_sku TEXT,
  supplier_url TEXT,
  cost_cents INTEGER CHECK (cost_cents IS NULL OR cost_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'BRL',
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fulfillments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  supplier_id TEXT,
  status TEXT NOT NULL DEFAULT 'ready'
    CHECK (status IN ('ready','processing','ordered','partially_shipped','shipped','delivered','cancelled','failed')),
  provider_order_id TEXT,
  tracking_code TEXT,
  tracking_url TEXT,
  carrier TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS fulfillment_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fulfillment_id TEXT NOT NULL,
  order_item_id INTEGER NOT NULL,
  product_source_id TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (fulfillment_id) REFERENCES fulfillments(id) ON DELETE CASCADE,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (product_source_id) REFERENCES product_sources(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_product_sources_product ON product_sources(product_id, active, priority);
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_sources_unique_active_source ON product_sources(product_id, supplier_id, supplier_sku, supplier_variant_id);
CREATE INDEX IF NOT EXISTS idx_fulfillments_order ON fulfillments(order_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fulfillments_order_supplier ON fulfillments(order_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_items_fulfillment ON fulfillment_items(fulfillment_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fulfillment_items_unique_source ON fulfillment_items(fulfillment_id, order_item_id, product_source_id);
