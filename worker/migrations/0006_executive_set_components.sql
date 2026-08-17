-- Backfill dos componentes físicos de Executive Sets já existentes.
-- Novos pedidos serão expandidos pelo Worker, evitando triggers no D1.

-- Relógio escolhido.
INSERT INTO order_items
  (order_id,kind,product_id,offer_id,watch_id,glasses_id,name_snapshot,unit_price_cents,quantity,line_total_cents)
SELECT
  oi.order_id,
  'product',
  oi.watch_id,
  oi.offer_id,
  NULL,
  NULL,
  p.name,
  0,
  oi.quantity,
  0
FROM order_items oi
JOIN products p ON p.id = oi.watch_id
WHERE oi.kind = 'executive-set'
  AND oi.watch_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM order_items c
    WHERE c.order_id = oi.order_id
      AND c.kind = 'product'
      AND c.product_id = oi.watch_id
      AND c.unit_price_cents = 0
  );

-- Óculos escolhido.
INSERT INTO order_items
  (order_id,kind,product_id,offer_id,watch_id,glasses_id,name_snapshot,unit_price_cents,quantity,line_total_cents)
SELECT
  oi.order_id,
  'product',
  oi.glasses_id,
  oi.offer_id,
  NULL,
  NULL,
  p.name,
  0,
  oi.quantity,
  0
FROM order_items oi
JOIN products p ON p.id = oi.glasses_id
WHERE oi.kind = 'executive-set'
  AND oi.glasses_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM order_items c
    WHERE c.order_id = oi.order_id
      AND c.kind = 'product'
      AND c.product_id = oi.glasses_id
      AND c.unit_price_cents = 0
  );

-- Case/brinde incluído na oferta.
INSERT INTO order_items
  (order_id,kind,product_id,offer_id,watch_id,glasses_id,name_snapshot,unit_price_cents,quantity,line_total_cents)
SELECT
  oi.order_id,
  'gift',
  o.included_gift_product_id,
  oi.offer_id,
  NULL,
  NULL,
  p.name,
  0,
  oi.quantity,
  0
FROM order_items oi
JOIN offers o ON o.id = oi.offer_id
JOIN products p ON p.id = o.included_gift_product_id
WHERE oi.kind = 'executive-set'
  AND o.included_gift_product_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM order_items c
    WHERE c.order_id = oi.order_id
      AND c.kind = 'gift'
      AND c.product_id = o.included_gift_product_id
  );
