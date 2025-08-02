// check-contest-460-current-data.js - Check current Contest 460 data via API
import { config } from 'dotenv'
config({ path: '.env.local' })

import DynamicTableManager from './lib/dynamic-table-manager.js'

async function checkContest460CurrentData() {
  try {
    console.log('🚀 CHECKING CONTEST 460 CURRENT DATA')
    console.log('=' .repeat(50))
    
    const tableManager = new DynamicTableManager()
    const tableName = 'contest_460_results'
    
    // Step 1: Check table data using dynamic table manager
    console.log('📊 Fetching Contest 460 data from table...')
    
    const contestData = await tableManager.getContestTableData(tableName)
    
    if (contestData && contestData.length > 0) {
      console.log(`✅ Found ${contestData.length} records in Contest 460`)
      
      // Analyze the data
      const participated = contestData.filter(user => user.participated === true)
      const notParticipated = contestData.filter(user => user.participated === false)
      
      console.log('')
      console.log('📊 CONTEST 460 ANALYSIS:')
      console.log(`   📋 Total records: ${contestData.length}`)
      console.log(`   ✅ Participated: ${participated.length}`)
      console.log(`   ❌ Not participated: ${notParticipated.length}`)
      
      if (participated.length > 0) {
        console.log('')
        console.log('🏆 PARTICIPANTS:')
        participated.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.display_name} (${user.leetcode_id})`)
          console.log(`      🥇 Rank: ${user.rank}`)
          console.log(`      📊 Score: ${user.score}`)
          console.log(`      ⏱️ Finish Time: ${user.finish_time}s`)
          console.log('')
        })
      }
      
      // Show sample of non-participants
      console.log('❌ SAMPLE NON-PARTICIPANTS:')
      notParticipated.slice(0, 10).forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.display_name} (${user.leetcode_id})`)
      })
      
      if (notParticipated.length > 10) {
        console.log(`   ... and ${notParticipated.length - 10} more`)
      }
      
    } else {
      console.log('⚠️ No data found in Contest 460 table')
    }
    
    // Step 2: Get table statistics
    console.log('')
    console.log('📈 TABLE STATISTICS:')
    
    const stats = await tableManager.getTableStats(tableName)
    if (stats) {
      console.log(`   📊 Participation Rate: ${stats.participation_rate}%`)
      console.log(`   🥇 Max Score: ${stats.max_score}`)
      console.log(`   📊 Average Score: ${stats.avg_score}`)
      console.log(`   🥉 Min Score: ${stats.min_score}`)
    }
    
    console.log('')
    console.log('🔗 NEXT STEPS:')
    console.log('   • Your app at http://localhost:3000 has this data')
    console.log('   • Select "Contest 460" from dropdown')
    console.log('   • View year-wise tabs to see 2nd/3rd year breakdown')
    console.log(`   • All ${contestData?.length || 0} students are tracked`)
    
  } catch (error) {
    console.error('❌ Error checking Contest 460 data:', error.message)
    
    // If table doesn't exist, suggest running the loader
    if (error.message.includes('does not exist')) {
      console.log('')
      console.log('💡 SOLUTION: Contest 460 table needs to be created')
      console.log('   Run: node load-contest-460.js')
      console.log('   This will load Contest 460 data for all your students')
    }
  }
}

// Run the check
checkContest460CurrentData()
  .then(() => {
    console.log('\n✅ Contest 460 data check complete!')
  })
  .catch(error => {
    console.error('\n💥 Error:', error.message)
  })
