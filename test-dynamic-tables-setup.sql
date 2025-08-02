-- Test setup for dynamic tables functionality
-- Run this in your Supabase SQL editor before testing

-- 1. First, create the SQL functions for dynamic table management
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error executing SQL: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- 2. Function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  );
END;
$$;

-- 3. Function to get all contest tables
CREATE OR REPLACE FUNCTION get_contest_tables()
RETURNS TABLE(table_name TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    NOW() as created_at
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND (
    t.table_name LIKE 'weekly_contest_%' 
    OR t.table_name LIKE 'biweekly_contest_%'
  )
  ORDER BY t.table_name;
END;
$$;

-- 4. Update contests table to include table_name column
ALTER TABLE contests 
ADD COLUMN IF NOT EXISTS table_name TEXT;

-- 5. Create index on table_name
CREATE INDEX IF NOT EXISTS idx_contests_table_name ON contests(table_name);

-- 6. Test by creating a sample contest table
SELECT execute_sql('
CREATE TABLE IF NOT EXISTS weekly_contest_414 (
  id SERIAL PRIMARY KEY,
  leetcode_id TEXT NOT NULL,
  display_name TEXT,
  rank INTEGER,
  score INTEGER,
  finish_time INTEGER,
  problems_solved INTEGER DEFAULT 0,
  participated BOOLEAN DEFAULT FALSE,
  original_leetcode_id TEXT,
  matched_variation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(leetcode_id)
);

CREATE INDEX IF NOT EXISTS idx_weekly_contest_414_leetcode_id ON weekly_contest_414(leetcode_id);
CREATE INDEX IF NOT EXISTS idx_weekly_contest_414_participated ON weekly_contest_414(participated);
');

-- 7. Insert sample data for testing
INSERT INTO weekly_contest_414 (leetcode_id, display_name, rank, score, participated, original_leetcode_id) VALUES
('SYLESH_', 'Sylesh', 1250, 18, true, 'SYLESH_'),
('prabanjanm', 'Prabhanjan', NULL, NULL, false, 'prabanjanm'),
('test_user1', 'Test User 1', 890, 21, true, 'test_user1'),
('test_user2', 'Test User 2', NULL, NULL, false, 'test_user2')
ON CONFLICT (leetcode_id) DO NOTHING;

-- 8. Insert sample contest record
INSERT INTO contests (contest_id, title, contest_type, start_time, end_time, table_name, data_fetched, total_participants) VALUES
('414', 'Weekly Contest 414', 'weekly', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '1.5 hours', 'weekly_contest_414', true, 16925)
ON CONFLICT (contest_id) DO UPDATE SET 
table_name = EXCLUDED.table_name,
data_fetched = EXCLUDED.data_fetched;

-- 9. Verification queries
SELECT 'Contests with table names:' as info;
SELECT contest_id, title, table_name, data_fetched FROM contests WHERE table_name IS NOT NULL;

SELECT 'Sample contest table data:' as info;
SELECT leetcode_id, display_name, rank, score, participated FROM weekly_contest_414 LIMIT 5;

SELECT 'Contest tables list:' as info;
SELECT * FROM get_contest_tables();
