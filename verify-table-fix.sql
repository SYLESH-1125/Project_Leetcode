-- Verify the table structure fix
-- Run this after applying the fix

-- Check final table structure
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_contest_results' 
ORDER BY ordinal_position;

-- Check if foreign key constraint was added properly
SELECT 
  constraint_name, 
  table_name, 
  column_name
FROM information_schema.key_column_usage 
WHERE table_name = 'user_contest_results'
AND constraint_name LIKE '%fk%';

-- Test inserting a sample record to verify structure
-- (This is just a test - don't worry if it fails due to missing data)
INSERT INTO user_contest_results (
  contest_id, 
  leetcode_id, 
  display_name, 
  rank, 
  score, 
  finish_time, 
  participated, 
  original_leetcode_id
) VALUES (
  999, 
  'test_user', 
  'Test User', 
  NULL, 
  NULL, 
  NULL, 
  false, 
  'test_user'
) ON CONFLICT DO NOTHING;

-- Clean up test record
DELETE FROM user_contest_results WHERE contest_id = 999;
