-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create species_catalog table
CREATE TABLE public.species_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  element TEXT NOT NULL,
  image_url TEXT,
  base_stats JSONB DEFAULT '{
    "health": 100,
    "attack": 10,
    "defense": 10,
    "speed": 10
  }'::jsonb,
  rarity TEXT DEFAULT 'common',
  unlock_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on species_catalog
ALTER TABLE public.species_catalog ENABLE ROW LEVEL SECURITY;

-- RLS policy: Everyone can view active species
CREATE POLICY "Anyone can view active species"
ON public.species_catalog
FOR SELECT
USING (is_active = true);

-- RLS policy: Only admins can manage species
CREATE POLICY "Admins can manage species"
ON public.species_catalog
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Insert existing species data
INSERT INTO public.species_catalog (id, name, display_name, description, element, rarity) VALUES
('fluff', 'fluff', 'Cats', 'A fluffy, loving companion', 'light', 'common'),
('spark', 'spark', 'Dragons', 'Magical and full of energy', 'fire', 'rare'),
('aqua', 'aqua', 'Sea Critters', 'Calm and peaceful water friend', 'water', 'common'),
('terra', 'terra', 'Mammals', 'Strong and dependable', 'earth', 'common'),
('cloud', 'cloud', 'Bird', 'Light and dreamy', 'air', 'common');

-- Create trigger for updated_at
CREATE TRIGGER update_species_catalog_updated_at
BEFORE UPDATE ON public.species_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();