-- Add policy to allow users to insert their own role during signup
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also add update policy in case role needs to be changed
CREATE POLICY "Users can update their own role"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);