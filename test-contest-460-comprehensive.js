// test-contest-460-comprehensive.js - Test comprehensive fetcher with Contest 460
import { config } from 'dotenv'
config({ path: '.env.local' })

import ComprehensiveContestFetcher from './lib/comprehensive-contest-fetcher.js'

async function testContest460() {
  try {
    console.log('🚀 TESTING COMPREHENSIVE FETCHER WITH CONTEST 460')
    console.log('=' .repeat(60))
    
    const fetcher = new ComprehensiveContestFetcher()
    
    // Mock contest 460 info
    const contest460Info = {
      title: 'Weekly Contest 460',
      start_time: 1701594000, // Contest 460 start time
      duration: 90 * 60, // 90 minutes
      is_virtual: false
    }
    
    console.log(`📋 Processing contest: ${contest460Info.title}`)
    
    // Process Contest 460 comprehensively
    const result = await fetcher.processContestComprehensively(contest460Info)
    
    if (result) {
      console.log('\n✅ TEST SUCCESSFUL!')
      console.log('📊 Results:')
      console.log(`   Contest: ${result.contest?.title || 'Contest 460'}`)
      console.log(`   Found users: ${result.found}`)
      console.log(`   Not found users: ${result.notFound}`)
      console.log(`   Total saved: ${result.saved}`)
      console.log(`   Success rate: ${((result.found / (result.found + result.notFound)) * 100).toFixed(1)}%`)
    } else {
      console.log('\n⚠️ No results returned')
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message)
    console.error(error.stack)
  }
}

// Run the test
testContest460()
