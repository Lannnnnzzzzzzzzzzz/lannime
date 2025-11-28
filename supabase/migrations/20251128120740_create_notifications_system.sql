/*
  # Notifications System

  ## 1. New Tables
  
  ### `notifications`
  - `id` (uuid, primary key)
  - `user_id` (uuid) - references user_profiles
  - `type` (text) - 'new_episode', 'achievement', 'system'
  - `title` (text) - notification title
  - `message` (text) - notification message
  - `anime_id` (text) - related anime (optional)
  - `episode_number` (integer) - related episode (optional)
  - `read` (boolean) - read status
  - `created_at` (timestamptz)
  
  ### `anime_subscriptions`
  - `id` (uuid, primary key)
  - `user_id` (uuid) - references user_profiles
  - `anime_id` (text) - anime identifier
  - `anime_title` (text) - anime name
  - `notify_email` (boolean) - send email notifications
  - `notify_app` (boolean) - send in-app notifications
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Users can only access their own notifications and subscriptions
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  message text NOT NULL,
  anime_id text,
  episode_number integer,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create anime_subscriptions table
CREATE TABLE IF NOT EXISTS anime_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  anime_id text NOT NULL,
  anime_title text NOT NULL,
  notify_email boolean DEFAULT true,
  notify_app boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, anime_id)
);

ALTER TABLE anime_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON anime_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON anime_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON anime_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON anime_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anime_subscriptions_user_id ON anime_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_anime_subscriptions_anime_id ON anime_subscriptions(anime_id);