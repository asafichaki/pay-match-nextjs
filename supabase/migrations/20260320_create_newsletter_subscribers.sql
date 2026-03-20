-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  source text DEFAULT 'homepage',
  status text DEFAULT 'active',
  monthly_volume text
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the newsletter form)
CREATE POLICY "Allow anonymous inserts"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users full access (for admin dashboard)
CREATE POLICY "Allow authenticated full access"
  ON public.newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers (email);
