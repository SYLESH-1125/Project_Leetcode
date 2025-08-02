// Fetch 50 3rd year students details for Contest 460
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function fetch3rdYearContest460() {
  try {
    console.log('🎓 FETCHING 50 3rd YEAR STUDENTS - CONTEST 460')
    console.log('='.repeat(60))
    
    // Get 3rd year students for Contest 460
    const { data: students, error } = await supabase
      .from('user_contest_results')
      .select(`
        *,
        target_users!inner(
          academic_year,
          batch_year,
          department,
          section,
          display_name
        )
      `)
      .eq('contest_id', '460')
      .eq('target_users.academic_year', '3rd Year')
      .order('leetcode_id', { ascending: true })
      .limit(50)
    
    if (error) {
      console.error('❌ Error fetching students:', error)
      return
    }
    
    console.log(`📊 Found ${students.length} 3rd Year students for Contest 460`)
    console.log('')
    
    // Count participation
    const participated = students.filter(s => s.participated).length
    const notParticipated = students.filter(s => !s.participated).length
    
    console.log('📈 PARTICIPATION SUMMARY:')
    console.log(`   ✅ Participated: ${participated}`)
    console.log(`   ❌ Not Participated: ${notParticipated}`)
    console.log(`   📊 Total: ${students.length}`)
    console.log('')
    
    // Display participants first (if any)
    const participants = students.filter(s => s.participated)
    if (participants.length > 0) {
      console.log('🏆 3rd YEAR PARTICIPANTS:')
      console.log('-'.repeat(80))
      participants.forEach((student, index) => {
        console.log(`${(index + 1).toString().padStart(2, ' ')}. ${student.target_users.display_name.padEnd(25)} | LeetCode: ${student.leetcode_id.padEnd(20)} | Rank: ${student.rank || 'N/A'} | Score: ${student.score}`)
      })
      console.log('')
    }
    
    // Display non-participants (sample)
    const nonParticipants = students.filter(s => !s.participated)
    if (nonParticipants.length > 0) {
      console.log('📝 3rd YEAR NON-PARTICIPANTS (Sample):')
      console.log('-'.repeat(80))
      nonParticipants.slice(0, 20).forEach((student, index) => {
        const section = student.target_users.section || 'N/A'
        console.log(`${(index + 1).toString().padStart(2, ' ')}. ${student.target_users.display_name.padEnd(25)} | LeetCode: ${student.leetcode_id.padEnd(20)} | Section: ${section}`)
      })
      
      if (nonParticipants.length > 20) {
        console.log(`... and ${nonParticipants.length - 20} more non-participants`)
      }
      console.log('')
    }
    
    // Department breakdown
    const departments = {}
    const sections = {}
    
    students.forEach(student => {
      const dept = student.target_users.department || 'Unknown'
      const sect = student.target_users.section || 'Unknown'
      
      departments[dept] = (departments[dept] || 0) + 1
      sections[sect] = (sections[sect] || 0) + 1
    })
    
    console.log('🏢 DEPARTMENT BREAKDOWN:')
    Object.entries(departments).forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count} students`)
    })
    console.log('')
    
    console.log('📚 SECTION BREAKDOWN:')
    Object.entries(sections).forEach(([sect, count]) => {
      console.log(`   Section ${sect}: ${count} students`)
    })
    console.log('')
    
    // Sample detailed info for first 10 students
    console.log('🔍 DETAILED INFO (First 10 Students):')
    console.log('-'.repeat(100))
    console.log('Name'.padEnd(25) + 'LeetCode ID'.padEnd(20) + 'Section'.padEnd(10) + 'Participated'.padEnd(12) + 'Rank'.padEnd(8) + 'Score')
    console.log('-'.repeat(100))
    
    students.slice(0, 10).forEach(student => {
      const name = student.target_users.display_name.padEnd(25)
      const leetcode = student.leetcode_id.padEnd(20)
      const section = (student.target_users.section || 'N/A').padEnd(10)
      const participated = (student.participated ? 'Yes' : 'No').padEnd(12)
      const rank = (student.rank || 'N/A').toString().padEnd(8)
      const score = student.score || 0
      
      console.log(`${name}${leetcode}${section}${participated}${rank}${score}`)
    })
    
    console.log('')
    console.log('✅ 3rd Year Contest 460 data fetched successfully!')
    console.log(`🎯 Next: Contest 461 tomorrow will have real participation data`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fetch3rdYearContest460()
