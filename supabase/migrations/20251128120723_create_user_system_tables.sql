/*
  # User System - Complete Schema

  ## 1. New Tables
  
  ### `user_profiles`
  - `id` (uuid, primary key) - references auth.users
  - `username` (text, unique) - display name
  - `avatar_url` (text) - profile picture
  - `bio` (text) - user bio
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `watchlist`
  - `id` (uuid, primary key)
  - `user_id` (uuid) - references user_profiles
  - `anime_id` (text) - anime identifier
  - `anime_title` (text) - anime name
  - `anime_poster` (text) - poster image URL
  - `status` (text) - 'plan_to_watch', 'watching', 'completed', 'dropped', 'on_hold'
  - `rating` (integer) - user rating 1-10
  - `notes` (text) - personal notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `watch_history`
  - `id` (uuid, primary key)
  - `user_id` (uuid) - references user_profiles
  - `anime_id` (text) - anime identifier
  - `episode_id` (text) - episode identifier
  - `episode_number` (integer) - episode number
  - `progress` (integer) - watch progress in seconds
  - `duration` (integer) - total episode duration in seconds
  - `completed` (boolean) - episode fully watched
  - `last_watched_at` (timestamptz)
  - `created_at` (timestamptz)
  
  ### `user_preferences`
  - `id` (uuid, primary key)
  - `user_id` (uuid, unique) - references user_profiles
  - `preferred_quality` (text) - '1080p', '720p', '480p', '360p'
  - `preferred_subtitle` (text) - 'sub', 'dub'
  - `autoplay_next` (boolean) - auto play next episode
  - `theater_mode` (boolean) - default theater mode
  - `email_notifications` (boolean) - receive email alerts
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Users can only read/write their own data
  - Authenticated users only
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  anime_id text NOT NULL,
  anime_title text NOT NULL,
  anime_poster text,
  status text NOT NULL DEFAULT 'plan_to_watch',
  rating integer CHECK (rating >= 1 AND rating <= 10),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, anime_id)
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist"
  ON watchlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own watchlist"
  ON watchlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist"
  ON watchlist FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own watchlist"
  ON watchlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  anime_id text NOT NULL,
  episode_id text NOT NULL,
  episode_number integer NOT NULL,
  progress integer DEFAULT 0,
  duration integer DEFAULT 0,
  completed boolean DEFAULT false,
  last_watched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, episode_id)
);

ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watch history"
  ON watch_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own watch history"
  ON watch_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch history"
  ON watch_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own watch history"
  ON watch_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  preferred_quality text DEFAULT '1080p',
  preferred_subtitle text DEFAULT 'sub',
  autoplay_next boolean DEFAULT true,
  theater_mode boolean DEFAULT false,
  email_notifications boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist(status);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_last_watched ON watch_history(last_watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_watchlist_updated_at ON watchlist;
CREATE TRIGGER update_watchlist_updated_at
  BEFORE UPDATE ON watchlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();