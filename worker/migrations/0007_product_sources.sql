-- Mapeamento inicial de fornecedores da Verani Ferraro.
-- Os links foram normalizados para a URL canônica do item no AliExpress.
-- Custos representam o custo total informado em 17/08/2026 e devem ser revisados periodicamente.

ALTER TABLE product_sources ADD COLUMN supplier_variant_label TEXT;

INSERT INTO suppliers (id,name,channel,active,notes)
VALUES
  ('ali-1005010633094664','AliExpress item 1005010633094664','dsers',1,'Milano'),
  ('ali-1005006855330074','AliExpress item 1005006855330074','dsers',1,'Verona e Modena'),
  ('ali-1005007876141243','AliExpress item 1005007876141243','dsers',1,'Venezia e Portofino'),
  ('ali-4000718338854','AliExpress item 4000718338854','dsers',1,'Como e Bologna'),
  ('ali-1005005058479636','AliExpress item 1005005058479636','dsers',1,'Genova, Bellagio e Capri'),
  ('ali-1005008644600147','AliExpress item 1005008644600147','dsers',1,'Lucca e Torino'),
  ('ali-1005007076923101','AliExpress item 1005007076923101','dsers',1,'Roma e Firenze'),
  ('ali-1005009896204226','AliExpress item 1005009896204226','dsers',1,'Siena'),
  ('ali-1005006211879727','AliExpress item 1005006211879727','dsers',1,'Case de óculos')
ON CONFLICT(id) DO UPDATE SET
  name=excluded.name,
  channel=excluded.channel,
  active=excluded.active,
  notes=excluded.notes,
  updated_at=datetime('now');

INSERT INTO product_sources
  (id,product_id,supplier_id,supplier_product_id,supplier_variant_id,supplier_variant_label,supplier_sku,supplier_url,cost_cents,currency,priority,active)
VALUES
  ('src-watch-01-ali','watch-01','ali-1005010633094664','1005010633094664',NULL,'black black',NULL,'https://pt.aliexpress.com/item/1005010633094664.html',2136,'BRL',1,1),
  ('src-watch-02-ali','watch-02','ali-1005006855330074','1005006855330074',NULL,'Gold White',NULL,'https://pt.aliexpress.com/item/1005006855330074.html',2882,'BRL',1,1),
  ('src-watch-03-ali','watch-03','ali-1005006855330074','1005006855330074',NULL,'Black black',NULL,'https://pt.aliexpress.com/item/1005006855330074.html',2390,'BRL',1,1),
  ('src-watch-04-ali','watch-04','ali-1005007876141243','1005007876141243',NULL,'Brown',NULL,'https://pt.aliexpress.com/item/1005007876141243.html',1568,'BRL',1,1),

  ('src-sunglasses-01-ali','sunglasses-01','ali-1005007876141243','1005007876141243',NULL,'dou hou tea',NULL,'https://pt.aliexpress.com/item/1005007876141243.html',848,'BRL',1,1),
  ('src-sunglasses-02-ali','sunglasses-02','ali-4000718338854','4000718338854',NULL,'C03 Gold G15',NULL,'https://pt.aliexpress.com/item/4000718338854.html',846,'BRL',1,1),
  ('src-sunglasses-03-ali','sunglasses-03','ali-4000718338854','4000718338854',NULL,'C01 Black BlackGrey',NULL,'https://pt.aliexpress.com/item/4000718338854.html',848,'BRL',1,1),
  ('src-sunglasses-04-ali','sunglasses-04','ali-1005005058479636','1005005058479636',NULL,NULL,NULL,'https://pt.aliexpress.com/item/1005005058479636.html',848,'BRL',1,1),
  ('src-sunglasses-05-ali','sunglasses-05','ali-1005005058479636','1005005058479636',NULL,'Lenses Color: 1',NULL,'https://pt.aliexpress.com/item/1005005058479636.html',988,'BRL',1,1),
  ('src-sunglasses-06-ali','sunglasses-06','ali-1005005058479636','1005005058479636',NULL,'Lenses Color: 5',NULL,'https://pt.aliexpress.com/item/1005005058479636.html',988,'BRL',1,1),

  ('src-optical-01-ali','optical-01','ali-1005008644600147','1005008644600147',NULL,'Cor das lentes: C4 Tortoise CLEAR',NULL,'https://pt.aliexpress.com/item/1005008644600147.html',857,'BRL',1,1),
  ('src-optical-02-ali','optical-02','ali-1005008644600147','1005008644600147',NULL,'Cor das lentes: C3 BLACK CLEAR',NULL,'https://pt.aliexpress.com/item/1005008644600147.html',857,'BRL',1,1),
  ('src-optical-03-ali','optical-03','ali-1005007076923101','1005007076923101',NULL,'C6 Anti blue Light',NULL,'https://pt.aliexpress.com/item/1005007076923101.html',978,'BRL',1,1),
  ('src-optical-04-ali','optical-04','ali-1005007076923101','1005007076923101',NULL,'B5 Anti blue light',NULL,'https://pt.aliexpress.com/item/1005007076923101.html',978,'BRL',1,1),
  ('src-optical-05-ali','optical-05','ali-1005009896204226','1005009896204226',NULL,'Frame Color: baowen',NULL,'https://pt.aliexpress.com/item/1005009896204226.html',848,'BRL',1,1),

  ('src-gift-case-01-ali','gift-leather-case-01','ali-1005006211879727','1005006211879727',NULL,'Color: CINZA',NULL,'https://pt.aliexpress.com/item/1005006211879727.html',2106,'BRL',1,1)
ON CONFLICT(id) DO UPDATE SET
  product_id=excluded.product_id,
  supplier_id=excluded.supplier_id,
  supplier_product_id=excluded.supplier_product_id,
  supplier_variant_id=excluded.supplier_variant_id,
  supplier_variant_label=excluded.supplier_variant_label,
  supplier_sku=excluded.supplier_sku,
  supplier_url=excluded.supplier_url,
  cost_cents=excluded.cost_cents,
  currency=excluded.currency,
  priority=excluded.priority,
  active=excluded.active,
  updated_at=datetime('now');
