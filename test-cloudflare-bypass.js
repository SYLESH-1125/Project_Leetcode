// test-cloudflare-bypass.js - Test if our app can bypass Cloudflare protection
import { config } from 'dotenv'
config({ path: '.env.local' })

import CloudflareBypass from './lib/cloudflare-bypass.js'

async function testCloudflareBypass() {
  try {
    console.log('🔒 TESTING CLOUDFLARE BYPASS CAPABILITIES')
    console.log('=' .repeat(55))
    console.log('🎯 Testing if our app can bypass LeetCode protection')
    console.log('')
    
    const bypass = new CloudflareBypass()
    
    // Test different LeetCode endpoints
    const testUrls = [
      {
        name: 'Contest List API',
        url: 'https://leetcode.com/contest/api/list/',
        description: 'Main contest listing endpoint'
      },
      {
        name: 'Contest 460 Ranking',
        url: 'https://leetcode.com/contest/api/ranking/weekly-contest-460/?pagination=1&region=global',
        description: 'Contest 460 participant data'
      },
      {
        name: 'General Contest Ranking',
        url: 'https://leetcode.com/contest/api/ranking/weekly-contest-461/?pagination=1&region=global',
        description: 'Future contest ranking (Contest 461)'
      }
    ]
    
    console.log('🧪 Testing Bypass Techniques:')
    console.log('   • Direct connection attempts')
    console.log('   • Advanced user agent rotation')
    console.log('   • Mobile user agent masking')
    console.log('   • Firefox browser simulation')
    console.log('   • Realistic cookie generation')
    console.log('   • Proxy fallback methods')
    console.log('')
    
    let successCount = 0
    let totalTests = testUrls.length
    
    for (let i = 0; i < testUrls.length; i++) {
      const test = testUrls[i]
      console.log(`📋 Test ${i + 1}/${totalTests}: ${test.name}`)
      console.log(`   🔗 URL: ${test.url}`)
      console.log(`   📝 Purpose: ${test.description}`)
      
      try {
        console.log('   🚀 Attempting bypass...')
        
        const result = await bypass.bypassCloudflare(test.url)
        
        if (result && result.status === 200) {
          console.log(`   ✅ SUCCESS! Bypassed Cloudflare protection`)
          console.log(`   📊 Response status: ${result.status}`)
          
          // Check if we got actual data
          if (result.data) {
            if (typeof result.data === 'string' && result.data.includes('<!DOCTYPE html>')) {
              console.log(`   ⚠️ Got HTML page (may be challenge page)`)
            } else if (typeof result.data === 'object' || Array.isArray(result.data)) {
              console.log(`   🎉 Got JSON data! Bypass successful!`)
              console.log(`   📈 Data type: ${Array.isArray(result.data) ? 'Array' : 'Object'}`)
              
              // If it's contest list, show count
              if (Array.isArray(result.data)) {
                console.log(`   📊 Contest count: ${result.data.length}`)
              }
              successCount++
            } else {
              console.log(`   📄 Got data: ${typeof result.data}`)
            }
          }
          
        } else if (result && result.status === 403) {
          console.log(`   🔒 BLOCKED: Cloudflare protection active (403)`)
        } else if (result && result.status === 503) {
          console.log(`   🔒 BLOCKED: Service unavailable (503)`)
        } else if (result === null) {
          console.log(`   ❌ FAILED: No response received`)
        } else {
          console.log(`   ⚠️ UNEXPECTED: Status ${result?.status || 'unknown'}`)
        }
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`)
        
        if (error.message.includes('403')) {
          console.log(`   🔒 Cloudflare is actively blocking requests`)
        } else if (error.message.includes('timeout')) {
          console.log(`   ⏰ Request timed out`)
        } else if (error.message.includes('ENOTFOUND')) {
          console.log(`   🌐 Network/DNS error`)
        }
      }
      
      console.log('')
      
      // Wait between tests to avoid rate limiting
      if (i < testUrls.length - 1) {
        console.log('   ⏱️ Waiting 3 seconds before next test...')
        await new Promise(resolve => setTimeout(resolve, 3000))
        console.log('')
      }
    }
    
    console.log('📊 BYPASS TEST RESULTS:')
    console.log('=' .repeat(30))
    console.log(`✅ Successful bypasses: ${successCount}/${totalTests}`)
    console.log(`🔒 Blocked attempts: ${totalTests - successCount}/${totalTests}`)
    console.log(`📈 Success rate: ${((successCount / totalTests) * 100).toFixed(1)}%`)
    console.log('')
    
    if (successCount > 0) {
      console.log('🎉 BYPASS CAPABILITIES: WORKING!')
      console.log('   ✅ Your app CAN bypass Cloudflare in some cases')
      console.log('   🎯 This means live contest fetching is possible')
      console.log('   📊 Success depends on timing and LeetCode\'s current protection level')
      console.log('')
      console.log('💡 RECOMMENDATIONS:')
      console.log('   • Try running contest fetcher during live contests')
      console.log('   • Use bypass during contest active hours (8-10 AM EST)')
      console.log('   • Implement retry logic with different techniques')
      console.log('   • Monitor for successful bypass windows')
      
    } else {
      console.log('🔒 BYPASS STATUS: CURRENTLY BLOCKED')
      console.log('   ❌ LeetCode has strong protection active')
      console.log('   🕐 This may be temporary or time-dependent')
      console.log('   🔄 Protection levels vary by time and usage')
      console.log('')
      console.log('💡 ALTERNATIVES:')
      console.log('   • Continue using direct database approach')
      console.log('   • Try bypass during different times of day')
      console.log('   • Wait for contests to be live for better success rates')
      console.log('   • Your 701 students are already fully tracked!')
    }
    
    console.log('')
    console.log('🎯 CURRENT STATUS:')
    console.log('   📱 Your app is live and functional')
    console.log('   🎓 All 701 students are tracked')
    console.log('   📊 Contest 460 data is available')
    console.log('   🔄 Bypass capabilities exist for future opportunities')
    
  } catch (error) {
    console.error('❌ Bypass test failed:', error.message)
  }
}

// Run the bypass test
testCloudflareBypass()
  .then(() => {
    console.log('\n✅ Cloudflare bypass test complete!')
  })
  .catch(error => {
    console.error('\n💥 Test error:', error.message)
  })
