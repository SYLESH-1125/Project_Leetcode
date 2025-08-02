-- SQL functions for dynamic table management
-- Run this in your Supabase SQL editor

-- Function to execute dynamic SQL (for table creation)
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

-- Function to check if a table exists
CREATE OR REPLACE FUNCTION check_table_exists(p_table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = p_table_name
  );
END;
$$;

-- Function to get all contest tables
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

-- Update contests table to include table_name column
ALTER TABLE contests 
ADD COLUMN IF NOT EXISTS table_name TEXT UNIQUE;

-- Create index on table_name
CREATE INDEX IF NOT EXISTS idx_contests_table_name ON contests(table_name);
