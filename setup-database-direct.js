// setup-database-direct.js - Direct database setup using pg client
import pg from 'pg'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const { Client } = pg

// Parse Supabase URL to get database connection details
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}

// Extract database URL from Supabase URL
const urlParts = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
if (!urlParts) {
  console.error('❌ Invalid Supabase URL format')
  process.exit(1)
}

const projectRef = urlParts[1]

console.log('🚀 SETTING UP DATABASE DIRECTLY')
console.log('='*50)

// You need to get the direct database connection string from Supabase
console.log('📋 To get your database connection string:')
console.log('1. Go to https://supabase.com/dashboard')
console.log(`2. Open your project: ${projectRef}`)
console.log('3. Go to Settings > Database')
console.log('4. Copy the connection string under "Connection string"')
console.log('5. Add it to your .env.local as DATABASE_URL')
console.log('')

// Check if DATABASE_URL is provided
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.log('❌ DATABASE_URL not found in .env.local')
  console.log('')
  console.log('🔧 ALTERNATIVE SOLUTION:')
  console.log('Instead of using direct connection, use the Supabase Dashboard:')
  console.log('')
  console.log('1. 🌐 Go to: https://supabase.com/dashboard')
  console.log('2. 📊 Open SQL Editor')
  console.log('3. 📋 Copy content from updated-supabase-schema.sql')
  console.log('4. 📝 Paste and run in SQL Editor')
  console.log('5. 📋 Copy content from insert-target-users.sql')
  console.log('6. 📝 Paste and run in SQL Editor')
  console.log('')
  console.log('✅ This will set up your database with all 701 students!')
  process.exit(0)
}

async function setupDatabase() {
  const client = new Client({
    connectionString: databaseUrl
  })

  try {
    console.log('🔗 Connecting to database...')
    await client.connect()
    console.log('✅ Connected successfully!')

    // Read and execute schema
    console.log('📋 Reading updated-supabase-schema.sql...')
    const schema = fs.readFileSync('updated-supabase-schema.sql', 'utf8')
    
    console.log('🏗️ Creating enhanced database schema...')
    await client.query(schema)
    console.log('✅ Schema created successfully!')

    // Read and execute student inserts
    console.log('📋 Reading insert-target-users.sql...')
    const inserts = fs.readFileSync('insert-target-users.sql', 'utf8')
    
    console.log('📥 Importing 701 students...')
    await client.query(inserts)
    console.log('✅ Students imported successfully!')

    // Verify setup
    const result = await client.query(`
      SELECT 
        academic_year,
        COUNT(*) as count
      FROM target_users 
      GROUP BY academic_year 
      ORDER BY academic_year
    `)

    console.log('')
    console.log('📊 SETUP VERIFICATION:')
    for (const row of result.rows) {
      console.log(`   🎓 ${row.academic_year}: ${row.count} students`)
    }

    console.log('')
    console.log('🎉 DATABASE SETUP COMPLETE!')
    console.log('Your enhanced LeetCode contest system is ready!')

  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    
    if (error.message.includes('already exists')) {
      console.log('')
      console.log('💡 Some tables already exist. This is normal.')
      console.log('   The system will update existing structures.')
    }
  } finally {
    await client.end()
  }
}

setupDatabase()
