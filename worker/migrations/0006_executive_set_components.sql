-- Representa o Executive Set como uma linha comercial paga + componentes físicos a R$0.
-- Isso permite que o fulfillment saiba exatamente quais produtos precisam ser enviados.

-- Backfill dos relógios de Executive Sets já existentes.
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

-- Backfill dos óculos de Executive Sets já existentes.
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

-- Backfill do brinde físico dos Executive Sets já existentes.
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

-- Para novos pedidos, expande automaticamente o bundle em componentes físicos.
CREATE TRIGGER IF NOT EXISTS trg_executive_set_physical_components
AFTER INSERT ON order_items
WHEN NEW.kind = 'executive-set'
BEGIN
  INSERT INTO order_items
    (order_id,kind,product_id,offer_id,watch_id,glasses_id,name_snapshot,unit_price_cents,quantity,line_total_cents)
  SELECT NEW.order_id,'product',NEW.watch_id,NEW.offer_id,NULL,NULL,p.name,0,NEW.quantity,0
  FROM products p
  WHERE p.id = NEW.watch_id AND NEW.watch_id IS NOT NULL;

  INSERT INTO order_items
    (order_id,kind,product_id,offer_id,watch_id,glasses_id,name_snapshot,unit_price_cents,quantity,line_total_cents)
  SELECT NEW.order_id,'product',NEW.glasses_id,NEW.offer_id,NULL,NULL,p.name,0,NEW.quantity,0
  FROM products p
  WHERE p.id = NEW.glasses_id AND NEW.glasses_id IS NOT NULL;

  INSERT INTO order_items
    (order_id,kind,product_id,offer_id,watch_id,glasses_id,name_snapshot,unit_price_cents,quantity,line_total_cents)
  SELECT NEW.order_id,'gift',o.included_gift_product_id,NEW.offer_id,NULL,NULL,p.name,0,NEW.quantity,0
  FROM offers o
  JOIN products p ON p.id = o.included_gift_product_id
  WHERE o.id = NEW.offer_id AND o.included_gift_product_id IS NOT NULL;
END;
