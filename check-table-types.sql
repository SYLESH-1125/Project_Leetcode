-- Check current table structures
-- Run this first to see what types both tables are using

-- Check contests table structure
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contests' 
AND column_name = 'contest_id';

-- Check user_contest_results table structure  
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_contest_results' 
AND column_name = 'contest_id';

-- Check if foreign key constraint already exists
SELECT 
  constraint_name, 
  table_name, 
  column_name, 
  foreign_table_name, 
  foreign_column_name
FROM information_schema.key_column_usage k
JOIN information_schema.referential_constraints r 
  ON k.constraint_name = r.constraint_name
WHERE k.table_name = 'user_contest_results'
AND k.column_name = 'contest_id';
