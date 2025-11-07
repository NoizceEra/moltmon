-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view messages" 
ON public.messages 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create battles table for combat
CREATE TABLE public.battles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attacker_id UUID NOT NULL,
  attacker_pet_id UUID NOT NULL,
  defender_id UUID,
  defender_pet_id UUID NOT NULL,
  is_ai_battle BOOLEAN NOT NULL DEFAULT false,
  winner_id UUID,
  attacker_damage_dealt INTEGER NOT NULL DEFAULT 0,
  defender_damage_dealt INTEGER NOT NULL DEFAULT 0,
  rewards_petpoints INTEGER NOT NULL DEFAULT 0,
  rewards_experience INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their battles" 
ON public.battles 
FOR SELECT 
USING (auth.uid() = attacker_id OR auth.uid() = defender_id);

CREATE POLICY "Users can create battles" 
ON public.battles 
FOR INSERT 
WITH CHECK (auth.uid() = attacker_id);

CREATE POLICY "Users can update their battles" 
ON public.battles 
FOR UPDATE 
USING (auth.uid() = attacker_id OR auth.uid() = defender_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;