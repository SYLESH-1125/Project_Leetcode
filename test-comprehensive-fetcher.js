// test-comprehensive-fetcher.js - Enhanced comprehensive contest fetcher with Contest 460 focus
import { config } from 'dotenv'
config({ path: '.env.local' })

import ContestFetcher from './lib/contest-fetcher.js'
import ComprehensiveContestFetcher from './lib/comprehensive-contest-fetcher.js'
import DynamicTableManager from './lib/dynamic-table-manager.js'
import { db } from './lib/supabase.js'

// Enhanced test with Contest 460 specific processing
async function testComprehensiveFetcherForContest460() {
  try {
    console.log('🚀 ENHANCED COMPREHENSIVE CONTEST FETCHER FOR CONTEST 460')
    console.log('=' .repeat(80))
    console.log('🎯 Target: Fetch ALL Contest 460 details for 2nd & 3rd year students')
    console.log('📊 Expected: Complete participation data for all 701 students')
    console.log('')
    
    // Initialize enhanced fetcher with improved techniques
    const enhancedFetcher = new EnhancedContestFetcher()
    
    // Run comprehensive Contest 460 processing
    const result = await enhancedFetcher.processContest460Comprehensive()
    
    if (result) {
      console.log('\n🎉 COMPREHENSIVE FETCH SUCCESSFUL!')
      console.log('📊 FINAL RESULTS:')
      console.log(`   📋 Contest: ${result.contest_title}`)
      console.log(`   📈 Total LeetCode Participants: ${result.total_participants.toLocaleString()}`)
      console.log(`   🎓 Our Students Analyzed: ${result.students_analyzed}`)
      console.log(`   ✅ Students Participated: ${result.students_participated}`)
      console.log(`   ❌ Students Not Participated: ${result.students_not_participated}`)
      console.log(`   📊 Participation Rate: ${result.participation_rate}%`)
      console.log(`   💾 Database Records Created: ${result.records_saved}`)
      console.log(`   📋 Dynamic Table: ${result.table_name}`)
      console.log('')
      console.log('🔗 Next Steps:')
      console.log('   • Refresh your browser at http://localhost:3000')
      console.log('   • Select "Contest 460" from dropdown')
      console.log('   • View year-wise participation data')
      
    } else {
      console.log('\n⚠️ No results returned - check network connectivity')
    }
    
  } catch (error) {
    console.error('\n❌ COMPREHENSIVE FETCH FAILED:', error.message)
    console.error('🔍 Debug Info:', error.stack)
  }
}

// Enhanced Contest Fetcher combining best techniques from both approaches
class EnhancedContestFetcher {
  constructor() {
    this.contestFetcher = new ContestFetcher()
    this.comprehensiveFetcher = new ComprehensiveContestFetcher()
    this.tableManager = new DynamicTableManager()
  }

  // Process Contest 460 with comprehensive techniques
  async processContest460Comprehensive() {
    try {
      console.log('🎯 Processing Contest 460 with enhanced techniques...')
      
      // Contest 460 specific info
      const contest460Info = {
        title: 'Weekly Contest 460',
        title_slug: 'weekly-contest-460',
        start_time: Math.floor(new Date('2025-08-01T08:00:00-04:00').getTime() / 1000),
        duration: 90 * 60, // 90 minutes
        is_virtual: false
      }
      
      console.log(`📋 Contest Details:`)
      console.log(`   📅 Title: ${contest460Info.title}`)
      console.log(`   🔗 Slug: ${contest460Info.title_slug}`)
      console.log(`   ⏰ Start Time: ${new Date(contest460Info.start_time * 1000).toLocaleString()}`)
      console.log('')
      
      // Step 1: Fetch ALL participants using enhanced techniques
      console.log('🚀 Step 1: Fetching ALL Contest 460 participants...')
      const allParticipants = await this.fetchContestParticipantsEnhanced(contest460Info.title_slug)
      
      if (allParticipants.length === 0) {
        throw new Error('No participants found for Contest 460')
      }
      
      console.log(`✅ Total participants fetched: ${allParticipants.length.toLocaleString()}`)
      
      // Step 2: Find target users with advanced matching
      console.log('\n🔍 Step 2: Advanced user matching for our students...')
      const { foundUsers, notFoundUsers } = await this.findTargetUsersAdvanced(allParticipants)
      
      // Step 3: Create dynamic table and store results
      console.log('\n💾 Step 3: Storing results in dynamic table...')
      const tableName = this.tableManager.generateTableName(contest460Info.title)
      
      // Create table if not exists
      await this.tableManager.createContestTable(tableName, contest460Info.title)
      
      // Prepare all user data for storage
      const allUsersForTable = [...foundUsers, ...notFoundUsers].map(user => ({
        leetcode_id: user.leetcode_id,
        display_name: user.display_name,
        rank: user.rank || 0,
        score: user.score || 0,
        finish_time: user.finish_time || 0,
        participated: user.participated,
        original_leetcode_id: user.original_leetcode_id,
        matched_variation: user.matched_variation
      }))
      
      // Insert all users into dynamic table
      await this.tableManager.insertUsersIntoContestTable(tableName, allUsersForTable)
      
      // Step 4: Update contest record
      console.log('\n📝 Step 4: Updating contest record...')
      const contestId = '460'
      
      // Check if contest exists, create if not
      try {
        await db.getContest(contestId)
      } catch {
        // Contest doesn't exist, create it
        const contestData = {
          contest_id: contestId,
          title: contest460Info.title,
          contest_type: 'weekly',
          start_time: new Date(contest460Info.start_time * 1000).toISOString(),
          end_time: new Date((contest460Info.start_time + contest460Info.duration) * 1000).toISOString(),
          total_participants: allParticipants.length,
          data_fetched: true,
          table_name: tableName
        }
        await db.insertContest(contestData)
      }
      
      // Update contest with new data
      await db.updateContestTableName(contestId, tableName)
      await db.markContestDataFetched(contestId, allParticipants.length)
      
      // Calculate participation rate
      const participationRate = foundUsers.length > 0 
        ? ((foundUsers.length / (foundUsers.length + notFoundUsers.length)) * 100).toFixed(2)
        : '0.00'
      
      console.log('\n✅ Contest 460 comprehensive processing complete!')
      
      return {
        contest_title: contest460Info.title,
        total_participants: allParticipants.length,
        students_analyzed: foundUsers.length + notFoundUsers.length,
        students_participated: foundUsers.length,
        students_not_participated: notFoundUsers.length,
        participation_rate: participationRate,
        records_saved: allUsersForTable.length,
        table_name: tableName
      }
      
    } catch (error) {
      console.error('❌ Error in Contest 460 comprehensive processing:', error.message)
      throw error
    }
  }

  // Enhanced participant fetching with multiple strategies
  async fetchContestParticipantsEnhanced(contestSlug, maxPages = 1000) {
    console.log(`🚀 Enhanced fetching for: ${contestSlug}`)
    console.log(`🎯 Strategy: Comprehensive pagination with error recovery`)
    
    let allParticipants = []
    let page = 1
    let hasMoreData = true
    let consecutiveFailures = 0
    const maxConsecutiveFailures = 10

    while (hasMoreData && page <= maxPages && consecutiveFailures < maxConsecutiveFailures) {
      try {
        console.log(`📄 Page ${page} (Total: ${allParticipants.length.toLocaleString()})...`)
        
        // Use contest-fetcher's proven technique
        const pageParticipants = await this.contestFetcher.fetchContestRanking(contestSlug, 1)
        
        if (pageParticipants && pageParticipants.length > 0) {
          allParticipants = allParticipants.concat(pageParticipants)
          consecutiveFailures = 0
          
          // Progress updates
          if (page % 25 === 0) {
            console.log(`📊 Progress: ${allParticipants.length.toLocaleString()} participants...`)
          }
          
          // Check for end condition
          if (pageParticipants.length < 25) {
            console.log(`📋 End detected at page ${page}`)
            hasMoreData = false
          }
        } else {
          console.log(`⚠️ Empty page ${page}`)
          consecutiveFailures++
        }

        page++
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (error) {
        console.error(`❌ Error on page ${page}:`, error.message)
        consecutiveFailures++
        
        // Progressive backoff
        const backoffTime = Math.min(1000 * consecutiveFailures, 10000)
        console.log(`🕐 Backing off for ${backoffTime}ms...`)
        await new Promise(resolve => setTimeout(resolve, backoffTime))
      }
    }

    console.log(`🎯 Enhanced fetch complete: ${allParticipants.length.toLocaleString()} total participants`)
    return allParticipants
  }

  // Advanced user matching with comprehensive variations
  async findTargetUsersAdvanced(participants) {
    console.log('🔍 Advanced user matching starting...')
    
    // Get target users
    const targetUsers = await db.getUsers()
    console.log(`🎯 Searching for ${targetUsers.length} target users`)
    
    // Create participant lookup map
    const participantMap = new Map()
    participants.forEach(p => {
      if (p.username) {
        // Multiple variations for matching
        const variations = [
          p.username,
          p.username.toLowerCase(),
          p.username.replace(/[^a-zA-Z0-9]/g, ''),
          p.username.replace(/\s+/g, ''),
          p.username.replace(/_/g, ''),
          p.username.replace(/-/g, '')
        ]
        
        variations.forEach(variation => {
          if (variation && variation.length > 0) {
            participantMap.set(variation.toLowerCase(), p)
          }
        })
      }
    })
    
    const foundUsers = []
    const notFoundUsers = []
    
    // Search for each target user
    for (const user of targetUsers) {
      let found = false
      let participantData = null
      let matchedVariation = null
      
      // Generate search variations for target user
      const searchVariations = [
        user.leetcode_id,
        user.leetcode_id.toLowerCase(),
        user.leetcode_id.replace(/[^a-zA-Z0-9]/g, ''),
        user.leetcode_id.replace(/\s+/g, ''),
        user.leetcode_id.replace(/_/g, ''),
        user.leetcode_id.replace(/-/g, ''),
        user.display_name?.toLowerCase() || ''
      ].filter(v => v && v.length > 0)
      
      // Try to find match
      for (const variation of searchVariations) {
        const participant = participantMap.get(variation.toLowerCase())
        if (participant) {
          found = true
          participantData = participant
          matchedVariation = variation
          break
        }
      }
      
      if (found && participantData) {
        foundUsers.push({
          leetcode_id: user.leetcode_id,
          display_name: user.display_name || user.leetcode_id,
          rank: participantData.rank || 0,
          score: participantData.score || 0,
          finish_time: participantData.finish_time || 0,
          participated: true,
          original_leetcode_id: participantData.username,
          matched_variation: matchedVariation
        })
      } else {
        notFoundUsers.push({
          leetcode_id: user.leetcode_id,
          display_name: user.display_name || user.leetcode_id,
          rank: 0,
          score: 0,
          finish_time: 0,
          participated: false,
          original_leetcode_id: null,
          matched_variation: null
        })
      }
    }
    
    console.log(`✅ Matching complete: ${foundUsers.length} found, ${notFoundUsers.length} not found`)
    return { foundUsers, notFoundUsers }
  }
}

// Run the enhanced test
testComprehensiveFetcherForContest460()
