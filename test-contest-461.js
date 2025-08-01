// test-contest-461.js - Test comprehensive fetcher for Contest 461 (this Sunday)
import { config } from 'dotenv'
config({ path: '.env.local' })

import ComprehensiveContestFetcher from './lib/comprehensive-contest-fetcher.js'

async function testContest461() {
  try {
    console.log('🚀 TESTING COMPREHENSIVE FETCHER FOR CONTEST 461')
    console.log('📅 Contest 461: Sunday, August 3, 2025 at 8:00 AM - 9:30 AM')
    console.log('🎯 Results will be fetched at 9:45 AM automatically')
    console.log('=' .repeat(60))
    
    const fetcher = new ComprehensiveContestFetcher()
    
    // Contest 461 info (this Sunday)
    const contest461Info = {
      title: 'Weekly Contest 461',
      start_time: Math.floor(new Date('2025-08-03T08:00:00-04:00').getTime() / 1000), // Sunday Aug 3, 8 AM EDT
      duration: 90 * 60, // 90 minutes
      is_virtual: false
    }
    
    console.log(`📋 Processing contest: ${contest461Info.title}`)
    console.log(`🕐 Contest time: ${new Date(contest461Info.start_time * 1000).toLocaleString()}`)
    console.log(`⏰ Contest duration: ${contest461Info.duration / 60} minutes`)
    
    // Process Contest 461 comprehensively
    console.log('\n🎯 Starting comprehensive processing...')
    const result = await fetcher.processContestComprehensively(contest461Info)
    
    if (result) {
      console.log('\n✅ CONTEST 461 TEST SUCCESSFUL!')
      console.log('📊 Results Summary:')
      console.log(`   Contest: ${result.contest?.title || 'Weekly Contest 461'}`)
      console.log(`   Total participants fetched: ${result.contest?.total_participants || 'Unknown'}`)
      console.log(`   Found users: ${result.found}`)
      console.log(`   Not found users: ${result.notFound}`)
      console.log(`   Total saved to database: ${result.saved}`)
      console.log(`   Success rate: ${((result.found / (result.found + result.notFound)) * 100).toFixed(1)}%`)
      
      if (result.found > 0) {
        console.log('\n🏆 FOUND PARTICIPANTS:')
        console.log('   (Check Supabase database for complete details)')
      }
      
      console.log('\n📅 SCHEDULED AUTOMATION:')
      console.log('   ✅ Contest 461: Sunday, Aug 3 at 9:45 AM (automatic)')
      console.log('   ✅ Biweekly Contest: Saturday at 9:45 PM (automatic)')
      console.log('   ✅ Weekly contests: Every Sunday at 9:45 AM (automatic)')
      console.log('   ✅ Backup checks: 15 minutes later if needed')
      
    } else {
      console.log('\n⚠️ No results returned (contest may not be available yet)')
      console.log('📝 Note: Contest 461 data will be available after the contest ends')
      console.log('🕐 Automatic fetch scheduled for Sunday, Aug 3 at 9:45 AM')
    }
    
  } catch (error) {
    console.error('\n❌ CONTEST 461 TEST FAILED:', error.message)
    if (error.message.includes('contest/api/ranking/weekly-contest-461')) {
      console.log('\n📝 Note: This is expected if Contest 461 hasn\'t started yet')
      console.log('🎯 The system will automatically fetch data on Sunday at 9:45 AM')
    }
    console.error('Full error:', error.stack)
  }
}

// Show scheduler information
function showScheduleInfo() {
  console.log('\n📅 COMPREHENSIVE CONTEST AUTOMATION SCHEDULE')
  console.log('=' .repeat(60))
  console.log('🗓️  WEEKLY SCHEDULE:')
  console.log('   📍 Sunday 8:00 AM - 9:30 AM: Weekly Contest')
  console.log('   📊 Sunday 9:45 AM: Comprehensive data fetch & results')
  console.log('   📍 Saturday 8:00 PM - 9:30 PM: Biweekly Contest')
  console.log('   📊 Saturday 9:45 PM: Comprehensive data fetch & results')
  console.log('')
  console.log('🔄 BACKUP SCHEDULE:')
  console.log('   🛡️  Sunday 10:00 AM: Backup fetch (if 9:45 AM fails)')
  console.log('   🛡️  Saturday 10:00 PM: Backup fetch (if 9:45 PM fails)')
  console.log('   🏥 Daily 11:00 AM: Health check for missed contests')
  console.log('')
  console.log('🎯 NEXT CONTESTS:')
  console.log('   📅 Contest 461: Sunday, August 3, 2025')
  console.log('   📅 Biweekly Contest: Saturday, August 2, 2025')
  console.log('')
  console.log('💾 RESULTS LOCATION:')
  console.log('   📊 Supabase Database: All contest data & user participation')
  console.log('   🖥️  Next.js UI: Visual leaderboard at localhost:3001')
  console.log('   📝 Console Logs: Real-time fetch progress & results')
}

// Run the test and show schedule
console.log('🚀 CONTEST 461 COMPREHENSIVE SYSTEM TEST')
showScheduleInfo()
testContest461()
