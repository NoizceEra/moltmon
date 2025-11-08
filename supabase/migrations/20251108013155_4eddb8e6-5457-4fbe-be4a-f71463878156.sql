-- Add new effect types for battle items
ALTER TABLE shop_items DROP CONSTRAINT IF EXISTS shop_items_effect_type_check;
ALTER TABLE shop_items ADD CONSTRAINT shop_items_effect_type_check CHECK (effect_type IN ('hunger', 'happiness', 'health', 'energy', 'heal', 'attack_boost', 'defense_boost', 'speed_boost', 'revive', 'cure'));
