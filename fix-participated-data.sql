-- Fix existing data in user_contest_results table
-- Run this to update the participated column for existing records

-- Update participated = true for users who have scores (they participated)
UPDATE user_contest_results 
SET participated = true 
WHERE score IS NOT NULL AND score > 0;

-- Update participated = false for users who don't have scores (they didn't participate)  
UPDATE user_contest_results 
SET participated = false 
WHERE score IS NULL OR score = 0;

-- Check the updated data
SELECT 
  contest_id,
  leetcode_id,
  score,
  participated,
  CASE 
    WHEN participated = true THEN 'Participated' 
    WHEN participated = false THEN 'Did Not Participate'
    ELSE 'Unknown'
  END as status
FROM user_contest_results 
WHERE contest_id = (SELECT MAX(contest_id) FROM user_contest_results)
ORDER BY participated DESC, score DESC;
