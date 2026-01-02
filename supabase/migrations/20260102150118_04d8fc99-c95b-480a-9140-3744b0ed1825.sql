-- Allow public (unauthenticated) users to view shelters for signup
CREATE POLICY "Allow public read access to shelters"
ON public.shelters
FOR SELECT
USING (true);

-- Drop the old authenticated-only policy
DROP POLICY IF EXISTS "Authenticated users can view shelters" ON public.shelters;