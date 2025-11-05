-- Update RLS policies to allow viewing other users' profiles and pets for social features

-- Allow all authenticated users to view profiles (for leaderboards and social features)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Anyone can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Allow all authenticated users to view pets (for social profiles)
DROP POLICY IF EXISTS "Users can view their own pets" ON public.pets;

CREATE POLICY "Anyone can view pets" 
ON public.pets 
FOR SELECT 
TO authenticated
USING (true);