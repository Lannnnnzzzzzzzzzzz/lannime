/*
  # Admin System

  ## 1. New Tables
  
  ### `admin_users`
  - `id` (uuid, primary key) - references user_profiles
  - `role` (text) - 'super_admin', 'moderator'
  - `permissions` (jsonb) - custom permissions
  - `created_at` (timestamptz)
  
  ### `user_reports`
  - `id` (uuid, primary key)
  - `reporter_id` (uuid) - references user_profiles
  - `report_type` (text) - 'broken_video', 'broken_link', 'inappropriate_content', 'other'
  - `anime_id` (text)
  - `episode_id` (text)
  - `description` (text)
  - `status` (text) - 'pending', 'in_progress', 'resolved', 'rejected'
  - `admin_notes` (text)
  - `resolved_by` (uuid) - references admin_users
  - `resolved_at` (timestamptz)
  - `created_at` (timestamptz)
  
  ### `admin_logs`
  - `id` (uuid, primary key)
  - `admin_id` (uuid) - references admin_users
  - `action` (text) - action performed
  - `target_type` (text) - 'user', 'report', 'content'
  - `target_id` (uuid) - target identifier
  - `details` (jsonb) - additional details
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Only admins can access admin tables
  - Users can submit reports
  - Users can view their own reports
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'moderator',
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create user_reports table
CREATE TABLE IF NOT EXISTS user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  anime_id text,
  episode_id text,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  resolved_by uuid REFERENCES admin_users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON user_reports FOR SELECT
  TO authenticated
  USING (
    auth.uid() = reporter_id OR
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reports"
  ON user_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update reports"
  ON user_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text,
  target_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
  ON admin_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert logs"
  ON admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    ) AND auth.uid() = admin_id
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON user_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);