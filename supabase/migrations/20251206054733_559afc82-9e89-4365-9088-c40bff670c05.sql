-- Create wristbands table to store wristband profiles
CREATE TABLE public.wristbands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wristband_id TEXT NOT NULL UNIQUE,
  last_check_in TIMESTAMP WITH TIME ZONE,
  last_shelter_name TEXT,
  health_notes TEXT[] DEFAULT '{}',
  check_in_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create check_in_history table
CREATE TABLE public.check_in_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wristband_id TEXT NOT NULL,
  shelter_id TEXT NOT NULL,
  shelter_name TEXT NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_out_time TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable Row Level Security (public access for now since no auth)
ALTER TABLE public.wristbands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access (can be restricted later with auth)
CREATE POLICY "Allow public read access to wristbands" 
ON public.wristbands 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to wristbands" 
ON public.wristbands 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to wristbands" 
ON public.wristbands 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public read access to check_in_history" 
ON public.check_in_history 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to check_in_history" 
ON public.check_in_history 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_wristbands_updated_at
BEFORE UPDATE ON public.wristbands
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.wristbands;
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_in_history;