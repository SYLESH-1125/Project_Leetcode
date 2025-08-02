-- Check current data to see participated column values
-- Run this in your Supabase SQL editor

-- Check the participated column values in your latest contest
SELECT 
  contest_id,
  leetcode_id,
  score,
  participated,
  CASE 
    WHEN participated IS NULL THEN 'NULL'
    WHEN participated = true THEN 'TRUE' 
    WHEN participated = false THEN 'FALSE'
    ELSE 'UNKNOWN'
  END as participated_status
FROM user_contest_results 
WHERE contest_id = (SELECT MAX(contest_id) FROM user_contest_results)
ORDER BY participated DESC, score DESC
LIMIT 10;
