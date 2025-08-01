// test-comprehensive-fetcher.js - Test the comprehensive contest fetcher
import { config } from 'dotenv'
config({ path: '.env.local' })

import ComprehensiveContestFetcher from './lib/comprehensive-contest-fetcher.js'

async function testComprehensiveFetcher() {
  try {
    console.log('🚀 TESTING COMPREHENSIVE CONTEST FETCHER')
    console.log('=' .repeat(60))
    
    const fetcher = new ComprehensiveContestFetcher()
    
    // Run comprehensive processing
    const result = await fetcher.runComprehensiveProcessing()
    
    if (result) {
      console.log('\n✅ TEST SUCCESSFUL!')
      console.log('📊 Results:')
      console.log(`   Found users: ${result.found}`)
      console.log(`   Not found users: ${result.notFound}`)
      console.log(`   Total saved: ${result.saved}`)
    } else {
      console.log('\n⚠️ No results returned')
    }
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message)
    console.error(error.stack)
  }
}

// Run the test
testComprehensiveFetcher()
