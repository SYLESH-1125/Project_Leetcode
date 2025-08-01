-- Simplified fix for user_contest_results table
-- Run this in your Supabase SQL editor

-- Step 1: Add the missing columns
ALTER TABLE user_contest_results 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS participated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_leetcode_id TEXT;

-- Step 2: Update existing records to set participated = true where they have scores
UPDATE user_contest_results 
SET participated = true 
WHERE score IS NOT NULL;

-- Step 3: Update existing records to set participated = false where they don't have scores  
UPDATE user_contest_results 
SET participated = false 
WHERE score IS NULL;

-- Step 4: Keep contest_id as TEXT to match contests table
-- No conversion needed since contests.contest_id is TEXT

-- Step 5: Add foreign key constraint (both columns are TEXT)
ALTER TABLE user_contest_results 
ADD CONSTRAINT fk_user_contest_results_contest_id 
FOREIGN KEY (contest_id) REFERENCES contests(contest_id);

-- Step 6: Add unique constraint to prevent duplicate entries
ALTER TABLE user_contest_results 
ADD CONSTRAINT unique_contest_user_result 
UNIQUE(contest_id, leetcode_id);

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_results_contest_id ON user_contest_results(contest_id);
CREATE INDEX IF NOT EXISTS idx_user_results_leetcode_id ON user_contest_results(leetcode_id);
CREATE INDEX IF NOT EXISTS idx_user_results_participated ON user_contest_results(participated);

-- Verification: Check the final structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_contest_results' 
ORDER BY ordinal_position;
