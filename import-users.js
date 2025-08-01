import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Please set up your Supabase credentials in .env.local first!')
  console.log('Required variables:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL=your_project_url')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function importUsers() {
  try {
    console.log('🔄 Loading users from users.json...')
    
    // Try to find users.json in current directory or parent directory
    let usersData
    const possiblePaths = [
      './users.json',
      '../users.json',
      '../../users.json'
    ]
    
    for (const userPath of possiblePaths) {
      try {
        if (fs.existsSync(userPath)) {
          console.log(`📁 Found users.json at: ${userPath}`)
          usersData = JSON.parse(fs.readFileSync(userPath, 'utf8'))
          break
        }
      } catch {
        continue
      }
    }
    
    if (!usersData) {
      console.error('❌ Could not find users.json file!')
      console.log('Please make sure users.json exists in one of these locations:')
      possiblePaths.forEach(p => console.log(`  - ${path.resolve(p)}`))
      process.exit(1)
    }
    
    console.log(`📊 Found ${usersData.length} users to import`)
    
    // Transform users data for database
    const usersForDB = usersData.map(user => ({
      leetcode_id: user.leetcode_id,
      display_name: user.display_name,
      created_at: new Date().toISOString()
    }))
    
    // Check if users already exist
    const { data: existingUsers, error: checkError } = await supabase
      .from('target_users')
      .select('leetcode_id')
    
    if (checkError) {
      console.error('❌ Error checking existing users:', checkError.message)
      return
    }
    
    const existingIds = new Set(existingUsers.map(u => u.leetcode_id))
    const newUsers = usersForDB.filter(user => !existingIds.has(user.leetcode_id))
    
    if (newUsers.length === 0) {
      console.log('✅ All users already exist in the database!')
      return
    }
    
    console.log(`🔄 Importing ${newUsers.length} new users...`)
    
    // Insert users in batches
    const batchSize = 100
    for (let i = 0; i < newUsers.length; i += batchSize) {
      const batch = newUsers.slice(i, i + batchSize)
      
      const { error } = await supabase
        .from('target_users')
        .insert(batch)
        .select()
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message)
        return
      }
      
      console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newUsers.length/batchSize)} (${batch.length} users)`)
    }
    
    // Verify import
    const { data: finalCount, error: countError } = await supabase
      .from('target_users')
      .select('leetcode_id', { count: 'exact' })
    
    if (countError) {
      console.error('❌ Error verifying import:', countError.message)
      return
    }
    
    console.log('🎉 Import completed successfully!')
    console.log(`📊 Total users in database: ${finalCount.length}`)
    console.log(`🆕 New users imported: ${newUsers.length}`)
    console.log(`📋 Existing users: ${existingIds.size}`)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the import
console.log('🚀 Starting user import to Supabase...')
importUsers().then(() => {
  console.log('✨ Import process completed!')
}).catch(error => {
  console.error('💥 Import failed:', error.message)
})
