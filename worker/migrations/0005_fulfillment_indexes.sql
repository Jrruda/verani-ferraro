CREATE UNIQUE INDEX IF NOT EXISTS idx_product_sources_unique_active_source
  ON product_sources(product_id, supplier_id, supplier_sku, supplier_variant_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fulfillments_order_supplier
  ON fulfillments(order_id, supplier_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fulfillment_items_unique_source
  ON fulfillment_items(fulfillment_id, order_item_id, product_source_id);
