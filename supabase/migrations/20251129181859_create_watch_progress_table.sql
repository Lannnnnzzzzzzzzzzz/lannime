/*
  # Create Watch Progress System

  1. New Tables
    - `watch_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `anime_id` (text, anime identifier)
      - `data_id` (text, unique anime data ID)
      - `episode_id` (text, episode identifier)
      - `episode_num` (integer, episode number)
      - `progress` (integer, current timestamp in seconds)
      - `duration` (integer, total video duration)
      - `poster` (text, anime poster URL)
      - `title` (text, anime title)
      - `japanese_title` (text, japanese title)
      - `adult_content` (boolean, 18+ flag)
      - `created_at` (timestamptz, first watch)
      - `updated_at` (timestamptz, last watch)

  2. Security
    - Enable RLS on `watch_progress` table
    - Add policy for authenticated users to manage their own watch progress
    - Users can only read/write their own progress data

  3. Indexes
    - Index on user_id and updated_at for fast recent queries
    - Index on user_id and data_id for quick lookups

  4. Notes
    - Progress is stored in seconds for precise resume
    - Updated_at tracks last watch time for sorting
    - Unique constraint on (user_id, data_id) to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS watch_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  anime_id text NOT NULL,
  data_id text NOT NULL,
  episode_id text NOT NULL,
  episode_num integer NOT NULL DEFAULT 1,
  progress integer NOT NULL DEFAULT 0,
  duration integer NOT NULL DEFAULT 0,
  poster text,
  title text NOT NULL,
  japanese_title text,
  adult_content boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, data_id)
);

ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watch progress"
  ON watch_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch progress"
  ON watch_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch progress"
  ON watch_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch progress"
  ON watch_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_watch_progress_user_updated 
  ON watch_progress(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_watch_progress_user_data 
  ON watch_progress(user_id, data_id);
