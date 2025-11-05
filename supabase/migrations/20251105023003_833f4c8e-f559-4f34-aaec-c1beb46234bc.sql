-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  pet_points INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('fluff', 'spark', 'aqua', 'terra', 'cloud')),
  color TEXT NOT NULL DEFAULT 'blue',
  hunger INTEGER DEFAULT 50 CHECK (hunger >= 0 AND hunger <= 100),
  happiness INTEGER DEFAULT 50 CHECK (happiness >= 0 AND happiness <= 100),
  health INTEGER DEFAULT 100 CHECK (health >= 0 AND health <= 100),
  energy INTEGER DEFAULT 100 CHECK (energy >= 0 AND energy <= 100),
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  last_fed_at TIMESTAMPTZ DEFAULT NOW(),
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  last_groomed_at TIMESTAMPTZ DEFAULT NOW(),
  last_rested_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shop_items table
CREATE TABLE public.shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('food', 'toy', 'accessory', 'decoration')),
  price INTEGER NOT NULL,
  image_url TEXT,
  effect_type TEXT CHECK (effect_type IN ('hunger', 'happiness', 'health', 'energy')),
  effect_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  equipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Pets policies
CREATE POLICY "Users can view their own pets"
  ON public.pets FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own pets"
  ON public.pets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own pets"
  ON public.pets FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own pets"
  ON public.pets FOR DELETE
  USING (auth.uid() = owner_id);

-- Shop items policies (everyone can view)
CREATE POLICY "Anyone can view shop items"
  ON public.shop_items FOR SELECT
  TO authenticated
  USING (true);

-- Inventory policies
CREATE POLICY "Users can view their own inventory"
  ON public.inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory items"
  ON public.inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory"
  ON public.inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items"
  ON public.inventory FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert starter shop items
INSERT INTO public.shop_items (name, description, category, price, effect_type, effect_value) VALUES
  ('Apple', 'A crisp, juicy apple that restores hunger', 'food', 10, 'hunger', -20),
  ('Pizza Slice', 'Delicious cheesy pizza slice', 'food', 25, 'hunger', -40),
  ('Gourmet Feast', 'A luxurious meal fit for a champion pet', 'food', 50, 'hunger', -60),
  ('Ball', 'A bouncy ball for playtime fun', 'toy', 15, 'happiness', 15),
  ('Teddy Bear', 'A soft cuddly friend', 'toy', 30, 'happiness', 25),
  ('Super Toy', 'The ultimate entertainment device', 'toy', 60, 'happiness', 40),
  ('Vitamins', 'Healthy supplements', 'food', 20, 'health', 15),
  ('Medicine', 'Strong healing medicine', 'food', 40, 'health', 30),
  ('Energy Drink', 'Restores energy quickly', 'food', 15, 'energy', 25),
  ('Crown', 'A royal golden crown', 'accessory', 100, NULL, NULL),
  ('Bow Tie', 'A fancy bow tie accessory', 'accessory', 35, NULL, NULL),
  ('Sunglasses', 'Cool shades for your pet', 'accessory', 45, NULL, NULL);