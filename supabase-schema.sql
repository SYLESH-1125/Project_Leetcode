-- LeetCode Contest Auto-Fetcher Database Schema
-- Run this in your Supabase SQL editor

-- Table: contests
-- Stores all contest metadata
CREATE TABLE contests (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  contest_type TEXT NOT NULL CHECK (contest_type IN ('weekly', 'biweekly')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_participants INTEGER DEFAULT 0,
  data_fetched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: target_users
-- The 61 users we want to track
CREATE TABLE target_users (
  id SERIAL PRIMARY KEY,
  leetcode_id TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: user_contest_results
-- Individual contest results for target users
CREATE TABLE user_contest_results (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests(contest_id),
  leetcode_id TEXT REFERENCES target_users(leetcode_id),
  display_name TEXT,
  rank INTEGER,
  score INTEGER,
  finish_time INTEGER,
  matched_variation TEXT,
  original_leetcode_id TEXT,
  participated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contest_id, leetcode_id)
);

-- Table: contest_stats
-- Overall statistics for each contest
CREATE TABLE contest_stats (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests(contest_id) UNIQUE,
  max_score INTEGER,
  min_score INTEGER,
  avg_score DECIMAL(5,2),
  total_scored INTEGER,
  target_users_found INTEGER DEFAULT 0,
  target_users_total INTEGER DEFAULT 61,
  success_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_contests_start_time ON contests(start_time);
CREATE INDEX idx_contests_type ON contests(contest_type);
CREATE INDEX idx_user_results_contest ON user_contest_results(contest_id);
CREATE INDEX idx_user_results_user ON user_contest_results(leetcode_id);

-- Insert the 61 target users from your existing users.json
-- (You'll need to run this after setting up the table)

-- Function to update contest stats
CREATE OR REPLACE FUNCTION update_contest_stats(p_contest_id INTEGER)
RETURNS void AS $$
DECLARE
  v_max_score INTEGER;
  v_min_score INTEGER;
  v_avg_score DECIMAL(5,2);
  v_total_scored INTEGER;
  v_found_users INTEGER;
BEGIN
  -- Calculate stats from user_contest_results
  SELECT 
    MAX(score), 
    MIN(score), 
    AVG(score)::DECIMAL(5,2),
    COUNT(*) FILTER (WHERE participated = true),
    COUNT(*) FILTER (WHERE participated = true)
  INTO v_max_score, v_min_score, v_avg_score, v_total_scored, v_found_users
  FROM user_contest_results 
  WHERE contest_id = p_contest_id;

  -- Insert or update contest stats
  INSERT INTO contest_stats (
    contest_id, max_score, min_score, avg_score, 
    total_scored, target_users_found, success_rate
  )
  VALUES (
    p_contest_id, v_max_score, v_min_score, v_avg_score,
    v_total_scored, v_found_users, 
    ROUND((v_found_users::DECIMAL / 61) * 100, 2)
  )
  ON CONFLICT (contest_id) 
  DO UPDATE SET
    max_score = EXCLUDED.max_score,
    min_score = EXCLUDED.min_score,
    avg_score = EXCLUDED.avg_score,
    total_scored = EXCLUDED.total_scored,
    target_users_found = EXCLUDED.target_users_found,
    success_rate = EXCLUDED.success_rate;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stats when contest results change
CREATE OR REPLACE FUNCTION trigger_update_contest_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_contest_stats(NEW.contest_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_contest_stats
  AFTER INSERT OR UPDATE ON user_contest_results
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_contest_stats();

-- Enable Row Level Security (optional but recommended)
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed)
CREATE POLICY "Public read access" ON contests FOR SELECT USING (true);
CREATE POLICY "Public read access" ON target_users FOR SELECT USING (true);
CREATE POLICY "Public read access" ON user_contest_results FOR SELECT USING (true);
CREATE POLICY "Public read access" ON contest_stats FOR SELECT USING (true);
