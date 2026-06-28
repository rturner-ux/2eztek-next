-- Featured Athlete of the Week

CREATE TABLE IF NOT EXISTS featured_athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  athlete_name text NOT NULL,
  tagline text,
  location text,
  gym_type text DEFAULT 'home_gym',  -- 'home_gym' | 'commercial_gym'
  gym_name text,
  content text NOT NULL DEFAULT '',
  equipment_used text,
  workout_style text,
  quote text,
  hero_image_url text,
  instagram_url text,
  facebook_url text,
  tiktok_url text,
  youtube_url text,
  featured_date date DEFAULT CURRENT_DATE,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_featured_athletes_slug ON featured_athletes(slug);
CREATE INDEX IF NOT EXISTS idx_featured_athletes_featured_date ON featured_athletes(featured_date DESC);
CREATE INDEX IF NOT EXISTS idx_featured_athletes_published ON featured_athletes(published);
