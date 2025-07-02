-- Add tag and physical_dimensions columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tag TEXT,
ADD COLUMN IF NOT EXISTS physical_dimensions JSONB;

-- Create index on tag for better query performance
CREATE INDEX IF NOT EXISTS idx_products_tag ON products(tag);

-- Update existing products to have tags generated from names
UPDATE products 
SET tag = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE tag IS NULL; 