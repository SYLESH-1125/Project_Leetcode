// test-contest-fetcher-460.js - Test contest fetcher specifically for Contest 460
import { config } from 'dotenv'
config({ path: '.env.local' })

import ContestFetcher from './lib/contest-fetcher.js'

async function testContestFetcher460() {
  try {
    console.log('🚀 TESTING CONTEST FETCHER FOR CONTEST 460')
    console.log('=' .repeat(60))
    console.log('🎯 This will attempt to scrape LIVE Contest 460 data from LeetCode')
    console.log('📊 Expected: ALL participants + your 701 students matched')
    console.log('')
    
    const fetcher = new ContestFetcher()
    
    // Create Contest 460 info (since it's past, we'll simulate)
    const contest460Info = {
      title: 'Weekly Contest 460',
      title_slug: 'weekly-contest-460',
      start_time: Math.floor(new Date('2025-08-01T08:00:00-04:00').getTime() / 1000),
      duration: 90 * 60 // 90 minutes
    }
    
    console.log('📋 Contest 460 Details:')
    console.log(`   📅 Title: ${contest460Info.title}`)
    console.log(`   🔗 Slug: ${contest460Info.title_slug}`)
    console.log(`   ⏰ Start: ${new Date(contest460Info.start_time * 1000).toLocaleString()}`)
    console.log('')
    
    console.log('🚀 Step 1: Attempting to fetch ALL Contest 460 participants...')
    console.log('⚠️ Note: This will try to scrape LeetCode directly')
    console.log('🔒 May hit Cloudflare protection (403 errors expected)')
    console.log('')
    
    // Attempt to process Contest 460
    const result = await fetcher.processContest(contest460Info)
    
    if (result) {
      console.log('\n🎉 CONTEST FETCHER SUCCESS!')
      console.log('📊 RESULTS:')
      console.log(`   📋 Contest: ${result.title}`)
      console.log(`   📈 Total LeetCode Participants: ${result.participants.toLocaleString()}`)
      console.log(`   🎓 Our Students Found: ${result.found_users}`)
      console.log(`   ❌ Our Students Not Found: ${result.not_found_users}`)
      console.log(`   💾 Records Stored: ${result.total_stored}`)
      console.log(`   📋 Dynamic Table: ${result.table_name}`)
      console.log('')
      console.log('✅ This approach would get REAL participation data!')
      
    } else {
      console.log('\n⚠️ CONTEST FETCHER LIMITATIONS:')
      console.log('❌ Could not fetch live data (expected due to Cloudflare)')
      console.log('🔒 LeetCode has anti-scraping protection')
      console.log('⏰ Contest 460 is past, may not be accessible')
      console.log('')
      console.log('💡 COMPARISON:')
      console.log('   🔴 Contest Fetcher: Gets REAL data but hits limitations')
      console.log('   🟢 Direct Method: Works reliably for your students')
    }
    
  } catch (error) {
    console.error('\n❌ CONTEST FETCHER ERROR:', error.message)
    
    if (error.message.includes('403')) {
      console.log('\n🔒 CLOUDFLARE PROTECTION DETECTED')
      console.log('This is why we used the direct method instead!')
    }
    
    console.log('\n📊 COMPARISON SUMMARY:')
    console.log('=' .repeat(50))
    console.log('🔴 Contest Fetcher (this scraper):')
    console.log('   ✅ Gets REAL contest data from LeetCode')
    console.log('   ✅ Comprehensive participant lists')
    console.log('   ✅ Accurate rankings and scores')
    console.log('   ❌ Blocked by Cloudflare protection')
    console.log('   ❌ Network dependent')
    console.log('   ❌ May fail for past contests')
    console.log('')
    console.log('🟢 Direct Method (what we used):')
    console.log('   ✅ Works reliably for all 701 students')
    console.log('   ✅ Creates complete tracking records')
    console.log('   ✅ Sets up year-wise categorization')
    console.log('   ✅ Ready for your app immediately')
    console.log('   ⚠️ Uses sample/existing data for participation')
    console.log('')
    console.log('🎯 RECOMMENDATION:')
    console.log('   • Use Direct Method for reliable student tracking')
    console.log('   • Use Contest Fetcher for future live contests')
    console.log('   • Your app now has 701 students ready!')
  }
}

// Run the test
testContestFetcher460()
  .then(() => {
    console.log('\n✅ Contest fetcher analysis complete!')
  })
  .catch(error => {
    console.error('\n💥 Analysis error:', error.message)
  })
