ALTER TABLE orders ADD COLUMN shipping_zip_code TEXT;
ALTER TABLE orders ADD COLUMN shipping_street TEXT;
ALTER TABLE orders ADD COLUMN shipping_number TEXT;
ALTER TABLE orders ADD COLUMN shipping_complement TEXT;
ALTER TABLE orders ADD COLUMN shipping_neighborhood TEXT;
ALTER TABLE orders ADD COLUMN shipping_city TEXT;
ALTER TABLE orders ADD COLUMN shipping_state TEXT;
ALTER TABLE orders ADD COLUMN shipping_country TEXT NOT NULL DEFAULT 'BR';
