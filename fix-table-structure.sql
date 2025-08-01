-- Fix user_contest_results table structure
-- Run this in your Supabase SQL editor to add missing columns

-- First, let's add the missing columns
ALTER TABLE user_contest_results 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS participated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_leetcode_id TEXT;

-- Drop existing foreign key constraint if it exists
ALTER TABLE user_contest_results 
DROP CONSTRAINT IF EXISTS user_contest_results_contest_id_fkey;

-- Method 1: If contests.contest_id is INTEGER, convert user_contest_results.contest_id to INTEGER
DO $$
BEGIN
  -- Check if contests.contest_id is integer type
  IF (SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'contests' AND column_name = 'contest_id') = 'integer' THEN
    
    -- Convert user_contest_results.contest_id from text to integer
    ALTER TABLE user_contest_results 
    ALTER COLUMN contest_id TYPE INTEGER USING contest_id::INTEGER;
    
    -- Add foreign key constraint
    ALTER TABLE user_contest_results 
    ADD CONSTRAINT fk_contest_id 
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id);
    
    RAISE NOTICE 'Converted contest_id to INTEGER and added foreign key';
    
  ELSE
    -- contests.contest_id is text, so keep user_contest_results.contest_id as text
    -- Add foreign key constraint (both are text)
    ALTER TABLE user_contest_results 
    ADD CONSTRAINT fk_contest_id 
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id);
    
    RAISE NOTICE 'Kept contest_id as TEXT and added foreign key';
  END IF;
END $$;

-- Add unique constraint
ALTER TABLE user_contest_results 
ADD CONSTRAINT unique_contest_user 
UNIQUE(contest_id, leetcode_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_results_contest ON user_contest_results(contest_id);
CREATE INDEX IF NOT EXISTS idx_user_results_user ON user_contest_results(leetcode_id);
CREATE INDEX IF NOT EXISTS idx_user_results_participated ON user_contest_results(participated);

-- Update existing records to set participated = true where score is not null
UPDATE user_contest_results 
SET participated = true 
WHERE score IS NOT NULL;

-- Update existing records to set participated = false where score is null
UPDATE user_contest_results 
SET participated = false 
WHERE score IS NULL;
