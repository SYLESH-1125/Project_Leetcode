// test-dynamic-tables.js - Test script for dynamic table functionality
import { db } from './lib/supabase.js'
import DynamicTableManager from './lib/dynamic-table-manager.js'

async function testDynamicTables() {
  console.log('🧪 Testing Dynamic Table Implementation')
  console.log('=====================================')
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('\n1️⃣ Testing Supabase Connection...')
    const { data, error } = await db.supabase.from('contests').select('*').limit(1)
    if (error) {
      console.error('❌ Supabase connection failed:', error)
      return
    }
    console.log('✅ Supabase connection successful')

    // Test 2: Check if table_name column exists
    console.log('\n2️⃣ Testing contests table structure...')
    try {
      const contests = await db.getContestsWithTables()
      console.log('✅ getContestsWithTables() works, found:', contests.length, 'contests')
      console.log(contests)
    } catch (error) {
      console.error('❌ getContestsWithTables() failed:', error.message)
    }

    // Test 3: Test DynamicTableManager
    console.log('\n3️⃣ Testing DynamicTableManager...')
    const tableManager = new DynamicTableManager()
    
    // Test table name generation
    const tableName = tableManager.generateTableName('Weekly Contest 414')
    console.log('✅ Generated table name:', tableName)
    
    // Test table existence check
    try {
      const exists = await tableManager.tableExists(tableName)
      console.log('✅ Table exists check:', exists)
    } catch (error) {
      console.error('❌ Table exists check failed:', error.message)
    }

    // Test 4: Try to get contest tables
    console.log('\n4️⃣ Testing contest tables list...')
    try {
      const tables = await tableManager.getAllContestTables()
      console.log('✅ Contest tables found:', tables.length)
      console.log(tables)
    } catch (error) {
      console.error('❌ Get contest tables failed:', error.message)
    }

    // Test 5: Test sample data if table exists
    console.log('\n5️⃣ Testing sample contest data...')
    if (await tableManager.tableExists('weekly_contest_414')) {
      try {
        const data = await tableManager.getContestTableData('weekly_contest_414')
        console.log('✅ Sample contest data:', data.length, 'users')
        console.log(data)
      } catch (error) {
        console.error('❌ Get contest data failed:', error.message)
      }
    } else {
      console.log('⚠️ Sample table weekly_contest_414 not found')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testDynamicTables().then(() => {
  console.log('\n🏁 Test completed')
  process.exit(0)
}).catch(error => {
  console.error('💥 Test crashed:', error)
  process.exit(1)
})
