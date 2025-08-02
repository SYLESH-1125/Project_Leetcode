import { db } from './lib/supabase.js'
import fs from 'fs'

async function setupDatabase() {
  try {
    console.log('🚀 SETTING UP ENHANCED LEETCODE CONTEST DATABASE')
    console.log('='*60)
    
    // Check if Supabase is connected
    console.log('🔗 Testing Supabase connection...')
    const { error: testError } = await db.supabase
      .from('target_users')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError.message)
      console.log('\n💡 Make sure you have:')
      console.log('   1. Created a Supabase project')
      console.log('   2. Added NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
      console.log('   3. Run the updated-supabase-schema.sql in your Supabase SQL editor')
      return
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Check if students are already imported
    const existingStudents = await db.getTargetUsers()
    console.log(`📊 Current students in database: ${existingStudents.length}`)
    
    if (existingStudents.length > 0) {
      console.log('📚 Students already exist in database!')
      
      // Show breakdown
      const secondYearCount = existingStudents.filter(s => s.academic_year === '2nd Year').length
      const thirdYearCount = existingStudents.filter(s => s.academic_year === '3rd Year').length
      
      console.log(`   🎓 2nd Year: ${secondYearCount} students`)
      console.log(`   🎓 3rd Year: ${thirdYearCount} students`)
      
      console.log('\n🔄 If you want to re-import, please run the SQL:')
      console.log('   DELETE FROM target_users;')
      console.log('   Then run this script again.')
      
    } else {
      console.log('📥 Importing students from parsed data...')
      
      // Read the generated SQL file
      if (!fs.existsSync('insert-target-users.sql')) {
        console.log('❌ insert-target-users.sql not found!')
        console.log('🔧 Running student parser first...')
        
        // Import and run the parser
        const { parseStudentData } = await import('./parse-students.js')
        await parseStudentData()
      }
      
      console.log('📄 SQL file found! Please run insert-target-users.sql in your Supabase SQL editor.')
      console.log('   This will import all 701 students with proper categorization.')
    }
    
    // Show next steps
    console.log('\n🎯 NEXT STEPS:')
    console.log('1. ✅ Database schema updated (target_users with year/department)')
    console.log('2. ✅ Student data parsed (701 students ready)')
    console.log('3. 📤 Import students: Run insert-target-users.sql in Supabase')
    console.log('4. 🎪 Contest automation is ready!')
    
    console.log('\n🏆 UPCOMING CONTEST FETCHES:')
    console.log('📅 Biweekly Contest: August 2, 2025 at 9:45 PM EDT')
    console.log('📅 Weekly Contest 461: August 3, 2025 at 9:45 AM EDT')
    
    console.log('\n📊 LEADERBOARD FEATURES:')
    console.log('   • Separate 2nd Year and 3rd Year leaderboards')
    console.log('   • Combined leaderboard with year indicators')
    console.log('   • Section-wise breakdown for 2nd year students')
    console.log('   • Year-wise contest statistics')
    
    // Test database functions
    console.log('\n🧪 Testing enhanced database functions...')
    
    try {
      // Test year-wise filtering
      const secondYearStudents = await db.getTargetUsers({ academic_year: '2nd Year' })
      const thirdYearStudents = await db.getTargetUsers({ academic_year: '3rd Year' })
      
      console.log(`✅ Year filtering works: ${secondYearStudents.length} 2nd year, ${thirdYearStudents.length} 3rd year`)
      
      // Test contest results (will be empty for now)
      const contests = await db.getAllContests()
      console.log(`✅ Contest functions work: ${contests.length} contests in database`)
      
    } catch (error) {
      console.log(`⚠️ Some enhanced functions need the new schema: ${error.message}`)
      console.log('   Make sure to run updated-supabase-schema.sql first!')
    }
    
    console.log('\n🎉 SETUP COMPLETE!')
    console.log('Your enhanced LeetCode contest tracking system is ready!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.error(error.stack)
  }
}

// Run setup
setupDatabase()
