-- Debug query to check current contest results data
-- Run this in your Supabase SQL editor to see what's stored

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_contest_results' 
ORDER BY ordinal_position;

-- Check if we have any non-participating users stored
SELECT 
  contest_id,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE score IS NOT NULL) as with_scores,
  COUNT(*) FILTER (WHERE score IS NULL) as without_scores,
  COUNT(*) FILTER (WHERE participated = true) as participated_true,
  COUNT(*) FILTER (WHERE participated = false) as participated_false
FROM user_contest_results 
GROUP BY contest_id
ORDER BY contest_id DESC;

-- Check actual data
SELECT 
  contest_id,
  leetcode_id,
  rank,
  score,
  participated,
  display_name
FROM user_contest_results 
WHERE contest_id = (SELECT MAX(contest_id) FROM user_contest_results)
ORDER BY participated DESC, rank ASC;

-- Check target users count
SELECT COUNT(*) as total_target_users FROM target_users WHERE active = true;
