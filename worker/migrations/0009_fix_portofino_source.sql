-- Corrige o anúncio do Portofino sem alterar variante ou custo.

UPDATE suppliers
SET notes='Venezia', updated_at=datetime('now')
WHERE id='ali-1005007876141243';

INSERT INTO suppliers (id,name,channel,active,notes)
VALUES (
  'ali-1005012116715596',
  'AliExpress item 1005012116715596',
  'dsers',
  1,
  'Portofino'
)
ON CONFLICT(id) DO UPDATE SET
  name=excluded.name,
  channel=excluded.channel,
  active=excluded.active,
  notes=excluded.notes,
  updated_at=datetime('now');

UPDATE product_sources
SET supplier_id='ali-1005012116715596',
    supplier_product_id='1005012116715596',
    supplier_url='https://pt.aliexpress.com/item/1005012116715596.html',
    supplier_variant_label='dou hou tea',
    cost_cents=848,
    updated_at=datetime('now')
WHERE id='src-sunglasses-01-ali'
  AND product_id='sunglasses-01';
