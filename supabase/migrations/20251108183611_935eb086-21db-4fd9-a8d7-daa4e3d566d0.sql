-- Fix search_path for existing functions to improve security

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Update check_and_add_skills function
CREATE OR REPLACE FUNCTION public.check_and_add_skills()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Fire element skills (Spark)
  IF NEW.element = 'fire' THEN
    IF NEW.level >= 5 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Ember Strike') THEN
      NEW.skills = NEW.skills || '[{"name": "Ember Strike", "power": 25, "element": "fire"}]'::jsonb;
    END IF;
    IF NEW.level >= 10 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Flame Burst') THEN
      NEW.skills = NEW.skills || '[{"name": "Flame Burst", "power": 40, "element": "fire"}]'::jsonb;
    END IF;
    IF NEW.level >= 20 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Inferno') THEN
      NEW.skills = NEW.skills || '[{"name": "Inferno", "power": 60, "element": "fire"}]'::jsonb;
    END IF;
  END IF;

  -- Water element skills (Aqua)
  IF NEW.element = 'water' THEN
    IF NEW.level >= 5 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Water Gun') THEN
      NEW.skills = NEW.skills || '[{"name": "Water Gun", "power": 25, "element": "water"}]'::jsonb;
    END IF;
    IF NEW.level >= 10 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Tidal Wave') THEN
      NEW.skills = NEW.skills || '[{"name": "Tidal Wave", "power": 40, "element": "water"}]'::jsonb;
    END IF;
    IF NEW.level >= 20 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Tsunami') THEN
      NEW.skills = NEW.skills || '[{"name": "Tsunami", "power": 60, "element": "water"}]'::jsonb;
    END IF;
  END IF;

  -- Earth element skills (Terra)
  IF NEW.element = 'earth' THEN
    IF NEW.level >= 5 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Rock Throw') THEN
      NEW.skills = NEW.skills || '[{"name": "Rock Throw", "power": 25, "element": "earth"}]'::jsonb;
    END IF;
    IF NEW.level >= 10 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Earthquake') THEN
      NEW.skills = NEW.skills || '[{"name": "Earthquake", "power": 40, "element": "earth"}]'::jsonb;
    END IF;
    IF NEW.level >= 20 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Landslide') THEN
      NEW.skills = NEW.skills || '[{"name": "Landslide", "power": 60, "element": "earth"}]'::jsonb;
    END IF;
  END IF;

  -- Air element skills (Cloud)
  IF NEW.element = 'air' THEN
    IF NEW.level >= 5 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Gust') THEN
      NEW.skills = NEW.skills || '[{"name": "Gust", "power": 25, "element": "air"}]'::jsonb;
    END IF;
    IF NEW.level >= 10 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Whirlwind') THEN
      NEW.skills = NEW.skills || '[{"name": "Whirlwind", "power": 40, "element": "air"}]'::jsonb;
    END IF;
    IF NEW.level >= 20 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Tornado') THEN
      NEW.skills = NEW.skills || '[{"name": "Tornado", "power": 60, "element": "air"}]'::jsonb;
    END IF;
  END IF;

  -- Light element skills (Fluff)
  IF NEW.element = 'light' THEN
    IF NEW.level >= 5 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Light Beam') THEN
      NEW.skills = NEW.skills || '[{"name": "Light Beam", "power": 25, "element": "light"}]'::jsonb;
    END IF;
    IF NEW.level >= 10 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Flash Cannon') THEN
      NEW.skills = NEW.skills || '[{"name": "Flash Cannon", "power": 40, "element": "light"}]'::jsonb;
    END IF;
    IF NEW.level >= 20 AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.skills) WHERE value->>'name' = 'Radiant Burst') THEN
      NEW.skills = NEW.skills || '[{"name": "Radiant Burst", "power": 60, "element": "light"}]'::jsonb;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;