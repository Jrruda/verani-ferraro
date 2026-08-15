INSERT INTO products (id, slug, name, category, price_cents, active, eligible_for_executive_set, track_inventory, stock_quantity)
VALUES
  ('watch-01','milano','Milano','watch',14900,1,1,0,NULL),
  ('watch-02','verona','Verona','watch',14900,1,1,0,NULL),
  ('watch-03','modena','Modena','watch',14900,1,1,0,NULL),
  ('watch-04','venezia','Venezia','watch',14900,1,1,0,NULL),
  ('sunglasses-01','portofino','Portofino','sunglasses',12900,1,1,0,NULL),
  ('sunglasses-02','como','Como','sunglasses',12900,1,1,0,NULL),
  ('sunglasses-03','bologna','Bologna','sunglasses',12900,1,1,0,NULL),
  ('sunglasses-04','genova','Genova','sunglasses',12900,1,1,0,NULL),
  ('sunglasses-05','bellagio','Bellagio','sunglasses',12900,1,1,0,NULL),
  ('sunglasses-06','capri','Capri','sunglasses',12900,1,1,0,NULL),
  ('optical-01','lucca','Lucca','optical-frame',11900,1,1,0,NULL),
  ('optical-02','torino','Torino','optical-frame',11900,1,1,0,NULL),
  ('optical-03','roma','Roma','optical-frame',11900,1,1,0,NULL),
  ('optical-04','firenze','Firenze','optical-frame',11900,1,1,0,NULL),
  ('optical-05','siena','Siena','optical-frame',11900,1,1,0,NULL),
  ('gift-leather-case-01','case-para-oculos-01','Case de óculos','gift',0,1,0,0,NULL)
ON CONFLICT(id) DO UPDATE SET
  slug=excluded.slug,
  name=excluded.name,
  category=excluded.category,
  price_cents=excluded.price_cents,
  active=excluded.active,
  eligible_for_executive_set=excluded.eligible_for_executive_set;

INSERT INTO offers (id, name, price_cents, currency, active, included_gift_product_id)
VALUES ('executive-set','The Executive Set',19700,'BRL',1,'gift-leather-case-01')
ON CONFLICT(id) DO UPDATE SET
  name=excluded.name,
  price_cents=excluded.price_cents,
  currency=excluded.currency,
  active=excluded.active,
  included_gift_product_id=excluded.included_gift_product_id;
