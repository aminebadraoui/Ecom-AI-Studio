-- Add INSERT policy for profiles table to allow trigger function to create profiles
CREATE POLICY "Allow profile creation on signup" ON profiles FOR INSERT WITH CHECK (true); 