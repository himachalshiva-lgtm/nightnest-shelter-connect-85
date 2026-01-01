-- Create shelters table for admin management
CREATE TABLE public.shelters (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    address text NOT NULL,
    city text NOT NULL DEFAULT 'Delhi',
    total_beds integer NOT NULL DEFAULT 0,
    coordinates_lat double precision,
    coordinates_lng double precision,
    phone text,
    check_in_time text DEFAULT '6:00 PM',
    check_out_time text DEFAULT '6:00 AM',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on shelters
ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;

-- Shelters are viewable by all authenticated users
CREATE POLICY "Authenticated users can view shelters" 
ON public.shelters 
FOR SELECT 
TO authenticated
USING (true);

-- Only admins can modify shelters
CREATE POLICY "Admins can insert shelters" 
ON public.shelters 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update shelters" 
ON public.shelters 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add shelter assignment to profiles (reference shelter by id)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS shelter_id uuid REFERENCES public.shelters(id);

-- Create NGO table
CREATE TABLE public.ngos (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    contact_email text,
    contact_phone text,
    service_types text[] NOT NULL DEFAULT '{}',
    coverage_area text,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on NGOs
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view NGOs
CREATE POLICY "Authenticated users can view ngos" 
ON public.ngos 
FOR SELECT 
TO authenticated
USING (true);

-- Only admins can modify NGOs
CREATE POLICY "Admins can insert ngos" 
ON public.ngos 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ngos" 
ON public.ngos 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ngos" 
ON public.ngos 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create NGO stock inventory table
CREATE TABLE public.ngo_stock (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ngo_id uuid REFERENCES public.ngos(id) ON DELETE CASCADE NOT NULL,
    item_type text NOT NULL,
    quantity integer NOT NULL DEFAULT 0,
    last_updated timestamp with time zone NOT NULL DEFAULT now(),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on NGO stock
ALTER TABLE public.ngo_stock ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view stock
CREATE POLICY "Authenticated users can view ngo_stock" 
ON public.ngo_stock 
FOR SELECT 
TO authenticated
USING (true);

-- Only admins can modify stock
CREATE POLICY "Admins can insert ngo_stock" 
ON public.ngo_stock 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ngo_stock" 
ON public.ngo_stock 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create shelter-NGO assignments table
CREATE TABLE public.shelter_ngo_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    shelter_id uuid REFERENCES public.shelters(id) ON DELETE CASCADE NOT NULL,
    ngo_id uuid REFERENCES public.ngos(id) ON DELETE CASCADE NOT NULL,
    assigned_date date NOT NULL DEFAULT CURRENT_DATE,
    services_assigned text[] NOT NULL DEFAULT '{}',
    notes text,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on assignments
ALTER TABLE public.shelter_ngo_assignments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view assignments
CREATE POLICY "Authenticated users can view shelter_ngo_assignments" 
ON public.shelter_ngo_assignments 
FOR SELECT 
TO authenticated
USING (true);

-- Only admins can modify assignments
CREATE POLICY "Admins can insert shelter_ngo_assignments" 
ON public.shelter_ngo_assignments 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete shelter_ngo_assignments" 
ON public.shelter_ngo_assignments 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create stock received logs table
CREATE TABLE public.stock_received_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    shelter_id uuid REFERENCES public.shelters(id) ON DELETE CASCADE NOT NULL,
    ngo_id uuid REFERENCES public.ngos(id) ON DELETE CASCADE NOT NULL,
    item_type text NOT NULL,
    quantity integer NOT NULL,
    received_date date NOT NULL DEFAULT CURRENT_DATE,
    notes text,
    logged_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on stock logs
ALTER TABLE public.stock_received_logs ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view stock logs
CREATE POLICY "Authenticated users can view stock_received_logs" 
ON public.stock_received_logs 
FOR SELECT 
TO authenticated
USING (true);

-- Only admins can add stock logs
CREATE POLICY "Admins can insert stock_received_logs" 
ON public.stock_received_logs 
FOR INSERT 
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_shelters_updated_at
BEFORE UPDATE ON public.shelters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ngos_updated_at
BEFORE UPDATE ON public.ngos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ngo_stock_updated_at
BEFORE UPDATE ON public.ngo_stock
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed NGO data
INSERT INTO public.ngos (name, contact_email, contact_phone, service_types, coverage_area, description) VALUES
('Aashray Adhikar Abhiyan (AAA)', 'contact@aaa.org', '+91-11-23456789', ARRAY['shelter', 'food', 'health'], 'Delhi NCR', 'Provides shelter support, food distribution, and health outreach services'),
('Goonj', 'info@goonj.org', '+91-11-26972351', ARRAY['clothing', 'blankets', 'humanitarian'], 'Pan India', 'Clothing, blankets, and humanitarian material support across India'),
('Seal Ashram', 'help@sealashram.org', '+91-11-27654321', ARRAY['rescue', 'food', 'clothing', 'shelter'], 'Delhi', 'Rescue operations, food, clothing, and shelter for homeless'),
('Nishita Foundation', 'care@nishita.org', '+91-11-28765432', ARRAY['food', 'clothing', 'care'], 'Delhi NCR', 'Food distribution, clothing, and care services for homeless individuals'),
('Apna Shelter India Foundation', 'support@apnashelter.org', '+91-11-29876543', ARRAY['hygiene', 'nutrition', 'shelter'], 'Delhi', 'Hygiene kits, nutrition support, and shelter assistance');

-- Insert seed shelter data
INSERT INTO public.shelters (name, address, city, total_beds, coordinates_lat, coordinates_lng, phone) VALUES
('Sarai Kale Khan Night Shelter', 'Sarai Kale Khan, Near ISBT', 'Delhi', 150, 28.5921, 77.2540, '+91-11-23456001'),
('Yamuna Pushta Shelter', 'Yamuna Pushta, Near ITO', 'Delhi', 120, 28.6328, 77.2478, '+91-11-23456002'),
('AIIMS Night Shelter', 'Near AIIMS Metro Station', 'Delhi', 100, 28.5689, 77.2100, '+91-11-23456003'),
('Nizamuddin Railway Station Shelter', 'Hazrat Nizamuddin, Near Station', 'Delhi', 80, 28.5900, 77.2514, '+91-11-23456004'),
('Kashmere Gate Night Shelter', 'Kashmere Gate, Near ISBT', 'Delhi', 200, 28.6669, 77.2280, '+91-11-23456005');

-- Insert initial stock for NGOs
INSERT INTO public.ngo_stock (ngo_id, item_type, quantity)
SELECT id, 'blankets', 500 FROM public.ngos WHERE name = 'Goonj'
UNION ALL
SELECT id, 'clothing', 1000 FROM public.ngos WHERE name = 'Goonj'
UNION ALL
SELECT id, 'food_kits', 200 FROM public.ngos WHERE name = 'Aashray Adhikar Abhiyan (AAA)'
UNION ALL
SELECT id, 'hygiene_kits', 300 FROM public.ngos WHERE name = 'Apna Shelter India Foundation'
UNION ALL
SELECT id, 'bedding', 150 FROM public.ngos WHERE name = 'Seal Ashram';