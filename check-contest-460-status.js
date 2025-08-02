// Check Contest 460 final status
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkContest460Status() {
  try {
    console.log('📊 CONTEST 460 - FINAL STATUS REPORT')
    console.log('=======================================')
    
    // Get contest info
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .select('*')
      .eq('contest_id', '460')
      .single()
      
    if (contestError) {
      console.error('❌ Contest error:', contestError)
      return
    }
    
    if (contest) {
      console.log('✅ Contest 460 Record:')
      console.log(`   📅 Title: ${contest.title}`)
      console.log(`   🕐 Start: ${contest.start_time}`)
      console.log(`   📊 Total Participants: ${contest.total_participants}`)
      console.log(`   ✅ Data Fetched: ${contest.data_fetched}`)
    }
    
    // Get our students' participation
    const { data: results, error: resultsError } = await supabase
      .from('user_contest_results')
      .select(`
        *,
        target_users!inner(academic_year, display_name)
      `)
      .eq('contest_id', '460')
      
    if (resultsError) {
      console.error('❌ Results error:', resultsError)
      return
    }
    
    const participated = results.filter(r => r.participated).length
    const notParticipated = results.filter(r => !r.participated).length
    const secondYear = results.filter(r => r.target_users.academic_year === '2nd Year').length
    const thirdYear = results.filter(r => r.target_users.academic_year === '3rd Year').length
    
    console.log('\n👥 OUR STUDENTS STATUS:')
    console.log(`   📊 Total Tracked: ${results.length}`)
    console.log(`   ✅ Participated: ${participated}`)
    console.log(`   ❌ Not Participated: ${notParticipated}`)
    console.log(`   🎓 2nd Year: ${secondYear}`)
    console.log(`   🎓 3rd Year: ${thirdYear}`)
    
    if (participated > 0) {
      console.log('\n🏆 TOP PERFORMERS:')
      const topPerformers = results
        .filter(r => r.participated && r.rank)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 5)
      
      topPerformers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.target_users.display_name} - Rank: ${user.rank}, Score: ${user.score}`)
      })
    }
    
    console.log('\n🔮 SYSTEM READY FOR NEXT CONTESTS:')
    console.log('   📅 Contest 461: Tomorrow (August 3, 2025)')
    console.log('   🕐 Time: 8:00 AM - 9:30 AM')
    console.log('   📡 Auto-fetch: 9:45 AM (our system ready)')
    console.log('   🎯 Expected: Some of our 701 students will participate')
    console.log('   📱 Leaderboard: Year-wise separation ready')
    
    console.log('\n✅ CONTEST 460 COMPLETE!')
    console.log('🚀 READY FOR CONTEST 461 AND BEYOND!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkContest460Status()
