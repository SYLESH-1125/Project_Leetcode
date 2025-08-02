// pages/api/test-dynamic-tables.js - Test endpoint for dynamic tables
import { db } from '../../lib/supabase.js'
import DynamicTableManager from '../../lib/dynamic-table-manager.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const results = {
      tests: {},
      success: true,
      errors: []
    }

    try {
      // Test 1: Basic Supabase connection
      results.tests.supabase_connection = '⏳ Testing...'
      try {
        const { data } = await db.supabase.from('contests').select('*').limit(1)
        results.tests.supabase_connection = '✅ Connected'
      } catch (error) {
        results.tests.supabase_connection = `❌ Failed: ${error.message}`
        results.errors.push(`Supabase: ${error.message}`)
      }

      // Test 2: Check table_name column
      results.tests.table_name_column = '⏳ Testing...'
      try {
        await db.getContestsWithTables()
        results.tests.table_name_column = '✅ Column exists'
      } catch (error) {
        results.tests.table_name_column = `❌ Failed: ${error.message}`
        results.errors.push(`Table column: ${error.message}`)
      }

      // Test 3: DynamicTableManager
      results.tests.table_manager = '⏳ Testing...'
      try {
        const tableManager = new DynamicTableManager()
        const tableName = tableManager.generateTableName('Weekly Contest 414')
        results.tests.table_manager = `✅ Works - Generated: ${tableName}`
      } catch (error) {
        results.tests.table_manager = `❌ Failed: ${error.message}`
        results.errors.push(`Table manager: ${error.message}`)
      }

      // Test 4: SQL Functions
      results.tests.sql_functions = '⏳ Testing...'
      try {
        const { data } = await db.supabase.rpc('get_contest_tables')
        results.tests.sql_functions = `✅ Works - Found ${data?.length || 0} tables`
      } catch (error) {
        results.tests.sql_functions = `❌ Failed: ${error.message}`
        results.errors.push(`SQL functions: ${error.message}`)
      }

      // Test 5: Sample data
      results.tests.sample_data = '⏳ Testing...'
      try {
        const { data } = await db.supabase.from('weekly_contest_414').select('*').limit(1)
        results.tests.sample_data = `✅ Sample table exists with ${data?.length || 0} records`
      } catch (error) {
        results.tests.sample_data = `❌ No sample data: ${error.message}`
        results.errors.push(`Sample data: ${error.message}`)
      }

      if (results.errors.length > 0) {
        results.success = false
      }

      res.status(200).json(results)

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        tests: results.tests
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: 'Method not allowed' })
  }
}
