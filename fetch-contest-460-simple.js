// fetch-contest-460-simple.js - Simple approach to fetch Contest 460 details for all students
import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from './lib/supabase.js'

async function fetchContest460Simple() {
  try {
    console.log('🚀 SIMPLE CONTEST 460 SETUP FOR ALL 701 STUDENTS')
    console.log('=' .repeat(60))
    
    // Step 1: Get all students
    console.log('📋 Loading all students...')
    const allStudents = await db.getUsers()
    console.log(`✅ Loaded ${allStudents.length} students`)
    
    // Count by year
    const secondYear = allStudents.filter(s => s.academic_year === '2nd Year')
    const thirdYear = allStudents.filter(s => s.academic_year === '3rd Year')
    
    console.log(`   🎓 2nd Year: ${secondYear.length} students`)
    console.log(`   🎓 3rd Year: ${thirdYear.length} students`)
    console.log('')
    
    // Step 2: Check if Contest 460 already exists
    console.log('🔍 Checking Contest 460 status...')
    
    let contest460 = null
    try {
      contest460 = await db.getContest('460')
      console.log(`✅ Contest 460 found: ${contest460.title}`)
      console.log(`   📊 Total participants: ${contest460.total_participants}`)
      console.log(`   📋 Table: ${contest460.table_name}`)
      console.log(`   ✅ Data fetched: ${contest460.data_fetched}`)
    } catch {
      console.log('ℹ️ Contest 460 not found, will create it')
    }
    
    // Step 3: If contest exists, check the table data
    if (contest460 && contest460.table_name) {
      console.log('')
      console.log('📊 Checking existing Contest 460 data...')
      
      try {
        const tableData = await db.query(`SELECT COUNT(*) as total, 
          SUM(CASE WHEN participated = true THEN 1 ELSE 0 END) as participated,
          SUM(CASE WHEN participated = false THEN 1 ELSE 0 END) as not_participated
          FROM ${contest460.table_name}`)
        
        if (tableData && tableData.length > 0) {
          const stats = tableData[0]
          console.log(`✅ Contest 460 data found:`)
          console.log(`   📊 Total records: ${stats.total}`)
          console.log(`   ✅ Participated: ${stats.participated}`)
          console.log(`   ❌ Not participated: ${stats.not_participated}`)
          
          // Step 4: Show year-wise breakdown if possible
          console.log('')
          console.log('🎓 YEAR-WISE ANALYSIS:')
          
          // Since we don't have academic_year in contest table, 
          // let's join with users table to get the breakdown
          try {
            const yearQuery = `
              SELECT u.academic_year, 
                COUNT(*) as total,
                SUM(CASE WHEN c.participated = true THEN 1 ELSE 0 END) as participated,
                SUM(CASE WHEN c.participated = false THEN 1 ELSE 0 END) as not_participated
              FROM ${contest460.table_name} c
              JOIN users u ON c.leetcode_id = u.leetcode_id
              GROUP BY u.academic_year
              ORDER BY u.academic_year`
            
            const yearStats = await db.query(yearQuery)
            
            if (yearStats && yearStats.length > 0) {
              yearStats.forEach(stat => {
                const rate = stat.total > 0 ? ((stat.participated / stat.total) * 100).toFixed(2) : '0.00'
                console.log(`   ${stat.academic_year}: ${stat.participated}/${stat.total} participated (${rate}%)`)
              })
            }
          } catch (yearError) {
            console.log('   ⚠️ Could not get year-wise breakdown:', yearError.message)
          }
          
          console.log('')
          console.log('✅ CONTEST 460 DATA IS READY!')
          console.log('🔗 Your app at http://localhost:3000 should show:')
          console.log('   • Contest 460 in the dropdown')
          console.log('   • Year-wise tabs (2nd Year / 3rd Year)')
          console.log('   • All participation data')
          
        } else {
          console.log('⚠️ Contest 460 table exists but is empty')
        }
        
      } catch (tableError) {
        console.log('❌ Error checking table data:', tableError.message)
      }
      
    } else {
      console.log('')
      console.log('ℹ️ Contest 460 needs to be set up')
      console.log('💡 Try running: node load-contest-460.js')
    }
    
    console.log('')
    console.log('📊 SUMMARY:')
    console.log(`   🎓 Total students in system: ${allStudents.length}`)
    console.log(`   📋 Contest 460 status: ${contest460 ? 'Ready' : 'Needs setup'}`)
    console.log(`   🔗 App URL: http://localhost:3000`)
    
  } catch (error) {
    console.error('❌ Error in Contest 460 check:', error.message)
    throw error
  }
}

// Run the check
fetchContest460Simple()
  .then(() => {
    console.log('\n✅ Contest 460 check complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Error:', error.message)
    process.exit(1)
  })
