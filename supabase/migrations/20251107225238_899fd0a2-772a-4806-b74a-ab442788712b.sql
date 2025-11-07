-- Add 'battle' category to shop_items
ALTER TABLE shop_items DROP CONSTRAINT IF EXISTS shop_items_category_check;
ALTER TABLE shop_items ADD CONSTRAINT shop_items_category_check CHECK (category IN ('food', 'toy', 'accessory', 'battle'));
