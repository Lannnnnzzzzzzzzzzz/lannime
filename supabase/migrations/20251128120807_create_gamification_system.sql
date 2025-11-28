/*
  # Gamification System - Stats, Achievements, Leaderboards

  ## 1. New Tables
  
  ### `user_stats`
  - `id` (uuid, primary key)
  - `user_id` (uuid, unique) - references user_profiles
  - `total_episodes_watched` (integer)
  - `total_watch_time_minutes` (integer)
  - `total_anime_completed` (integer)
  - `current_streak_days` (integer)
  - `longest_streak_days` (integer)
  - `last_watched_date` (date)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `achievements`
  - `id` (uuid, primary key)
  - `key` (text, unique) - achievement identifier
  - `name` (text) - achievement name
  - `description` (text) - achievement description
  - `icon` (text) - icon/emoji
  - `requirement` (integer) - requirement value
  - `category` (text) - 'watching', 'social', 'collection'
  - `created_at` (timestamptz)
  
  ### `user_achievements`
  - `id` (uuid, primary key)
  - `user_id` (uuid) - references user_profiles
  - `achievement_id` (uuid) - references achievements
  - `unlocked_at` (timestamptz)
  - `progress` (integer) - current progress

  ### `leaderboard_entries`
  - `id` (uuid, primary key)
  - `user_id` (uuid) - references user_profiles
  - `category` (text) - 'episodes', 'watch_time', 'streak', 'achievements'
  - `value` (integer) - leaderboard value
  - `rank` (integer) - current rank
  - `period` (text) - 'weekly', 'monthly', 'all_time'
  - `updated_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Users can view all stats/achievements/leaderboards
  - Only users can update their own stats
*/

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  total_episodes_watched integer DEFAULT 0,
  total_watch_time_minutes integer DEFAULT 0,
  total_anime_completed integer DEFAULT 0,
  current_streak_days integer DEFAULT 0,
  longest_streak_days integer DEFAULT 0,
  last_watched_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  requirement integer NOT NULL,
  category text NOT NULL DEFAULT 'watching',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON user_achievements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create leaderboard_entries table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  value integer NOT NULL DEFAULT 0,
  rank integer,
  period text NOT NULL DEFAULT 'all_time',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, period)
);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own leaderboard entry"
  ON leaderboard_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entry"
  ON leaderboard_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category_period ON leaderboard_entries(category, period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_entries(rank);

-- Create trigger for user_stats updated_at
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default achievements
INSERT INTO achievements (key, name, description, icon, requirement, category)
VALUES
  ('first_watch', 'First Watch', 'Watch your first episode', '🎬', 1, 'watching'),
  ('binge_watcher', 'Binge Watcher', 'Watch 10 episodes in one day', '🍿', 10, 'watching'),
  ('dedicated_fan', 'Dedicated Fan', 'Watch 50 episodes', '⭐', 50, 'watching'),
  ('anime_addict', 'Anime Addict', 'Watch 100 episodes', '🔥', 100, 'watching'),
  ('completionist', 'Completionist', 'Complete 10 anime series', '🏆', 10, 'collection'),
  ('early_bird', 'Early Bird', 'Watch an episode within 1 hour of release', '🌅', 1, 'watching'),
  ('night_owl', 'Night Owl', 'Watch 5 episodes after midnight', '🦉', 5, 'watching'),
  ('week_streak', 'Week Warrior', 'Watch anime for 7 consecutive days', '📅', 7, 'watching'),
  ('month_streak', 'Monthly Master', 'Watch anime for 30 consecutive days', '🗓️', 30, 'watching'),
  ('collector', 'Collector', 'Add 20 anime to watchlist', '📚', 20, 'collection')
ON CONFLICT (key) DO NOTHING;