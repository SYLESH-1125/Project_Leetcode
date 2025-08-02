// lib/comprehensive-contest-fetcher.js - Comprehensive contest data fetching with proven algorithms
import CloudflareBypass from './cloudflare-bypass.js'
import { db } from './supabase.js'

class ComprehensiveContestFetcher {
  constructor() {
    // Use the proven CloudflareBypass system
    this.bypass = new CloudflareBypass()
    this.allParticipants = []
    this.startPage = 1
  }

  // Get current contest info from LeetCode with enhanced detection
  async getCurrentContestInfo() {
    try {
      console.log('🔍 Fetching current contest information...')
      
      // Try multiple approaches to get contest info
      const approaches = [
        () => this.getContestFromAPI(),
        () => this.detectRecentContest(),
        () => this.getSpecificContest()
      ]

      for (const approach of approaches) {
        try {
          const contest = await approach()
          if (contest) {
            console.log(`✅ Found contest: ${contest.title}`)
            return contest
          }
        } catch (error) {
          console.log(`⚠️ Approach failed: ${error.message}`)
        }
      }

      console.log('❌ No contest found with any approach')
      return null

    } catch (error) {
      console.error('❌ Error fetching contest info:', error.message)
      return null
    }
  }

  // Try to get contest from official API
  async getContestFromAPI() {
    const contestListUrl = 'https://leetcode.com/contest/api/list/'
    const response = await this.bypass.bypassCloudflare(contestListUrl)

    if (!response || !response.data) {
      throw new Error('Failed to fetch contest list from API')
    }

    const contests = response.data
    const now = new Date()

    // Find active or recently ended contests
    const recentContests = contests.filter(contest => {
      const startTime = new Date(contest.start_time * 1000)
      const endTime = new Date(startTime.getTime() + contest.duration * 1000)
      const timeSinceEnd = now - endTime
      
      // Include contests that ended within the last 4 hours
      return timeSinceEnd <= 4 * 60 * 60 * 1000 && timeSinceEnd >= -contest.duration * 1000
    })

    if (recentContests.length === 0) {
      // Get the most recent contest if no active ones
      const sortedContests = contests.sort((a, b) => b.start_time - a.start_time)
      return sortedContests[0] || null
    }

    // Return the most recent contest
    return recentContests[0]
  }

  // Detect recent contest based on current date/time
  async detectRecentContest() {
    const now = new Date()
    const currentHour = now.getHours()
    const currentDay = now.getDay() // 0 = Sunday, 6 = Saturday

    let contestInfo = null

    // Sunday: Weekly Contest (Contest 461 this week)
    if (currentDay === 0 && currentHour >= 9 && currentHour <= 12) {
      // Calculate contest number (Contest 461 is this Sunday, July 31, 2025)
      const baseDate = new Date('2025-07-31') // Contest 461 date
      const baseContestNumber = 461
      const weeksDiff = Math.floor((now - baseDate) / (7 * 24 * 60 * 60 * 1000))
      const contestNumber = baseContestNumber + weeksDiff

      contestInfo = {
        title: `Weekly Contest ${contestNumber}`,
        start_time: Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0).getTime() / 1000),
        duration: 90 * 60, // 90 minutes
        is_virtual: false
      }
    }

    // Saturday: Biweekly Contest
    if (currentDay === 6 && currentHour >= 21 && currentHour <= 24) {
      // Calculate biweekly contest number
      const biweeklyContestNumber = Math.floor((Date.now() - new Date('2019-06-01').getTime()) / (14 * 24 * 60 * 60 * 1000)) + 1

      contestInfo = {
        title: `Biweekly Contest ${biweeklyContestNumber}`,
        start_time: Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0).getTime() / 1000),
        duration: 90 * 60, // 90 minutes
        is_virtual: false
      }
    }

    if (contestInfo) {
      console.log(`🎯 Detected contest: ${contestInfo.title}`)
      return contestInfo
    }

    throw new Error('No contest detected for current time')
  }

  // Get specific contest (fallback to Contest 461 for testing)
  async getSpecificContest() {
    // Default to Contest 461 if we're around the expected time
    const contest461Info = {
      title: 'Weekly Contest 461',
      start_time: Math.floor(new Date('2025-08-03T08:00:00-04:00').getTime() / 1000), // Sunday Aug 3, 8 AM EDT
      duration: 90 * 60, // 90 minutes
      is_virtual: false
    }

    console.log(`🎯 Using specific contest: ${contest461Info.title}`)
    return contest461Info
  }

  // COMPREHENSIVE participant fetching - fetches ALL participants
  async fetchAllContestParticipants(contestSlug, maxPages = 1000) {
    console.log(`🚀 COMPREHENSIVE FETCHING: ${contestSlug}`)
    console.log(`🎯 Target: ALL participants (5,000-20,000+ users)`)
    
    this.allParticipants = []
    let page = 1
    let hasMoreData = true
    let consecutiveFailures = 0

    while (hasMoreData && page <= maxPages && consecutiveFailures < 10) {
      const pageUrl = `https://leetcode.com/contest/api/ranking/${contestSlug}/?pagination=${page}&region=global`
      
      console.log(`📄 Fetching page ${page} (Total so far: ${this.allParticipants.length})...`)
      
      try {
        const response = await this.bypass.bypassCloudflare(pageUrl)
        
        if (response && response.status === 200 && response.data) {
          let pageParticipants = []
          
          // Extract participants from different possible response formats
          if (response.data.total_rank && Array.isArray(response.data.total_rank)) {
            pageParticipants = response.data.total_rank
          } else if (response.data.submissions && Array.isArray(response.data.submissions)) {
            pageParticipants = response.data.submissions
          } else if (Array.isArray(response.data)) {
            pageParticipants = response.data
          }
          
          if (pageParticipants.length > 0) {
            console.log(`✅ Got ${pageParticipants.length} participants from page ${page}`)
            this.allParticipants.push(...pageParticipants)
            consecutiveFailures = 0
            
            // Progress update every 50 pages
            if (page % 50 === 0) {
              console.log(`📊 Progress: ${this.allParticipants.length} participants collected...`)
            }
            
            // Check if we've reached the end (fewer than 25 participants indicates last page)
            if (pageParticipants.length < 25) {
              console.log(`📋 Reached end of data at page ${page}`)
              hasMoreData = false
            }
          } else {
            console.log(`⚠️ No participants found on page ${page}`)
            consecutiveFailures++
          }
        } else {
          console.log(`❌ Failed to get data from page ${page}`)
          consecutiveFailures++
        }
      } catch (error) {
        console.log(`❌ Error on page ${page}: ${error.message}`)
        consecutiveFailures++
        
        // Wait longer on network errors
        if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
          console.log(`🕐 Waiting 5 seconds before retry...`)
          await this.delay(5000)
        }
      }
      
      page++
      await this.delay(300) // Rate limiting
    }
    
    console.log(`\n🎯 COMPREHENSIVE FETCH COMPLETE!`)
    console.log(`   Total participants collected: ${this.allParticipants.length}`)
    console.log(`   Last page attempted: ${page - 1}`)
    
    return this.allParticipants
  }

  // Generate COMPREHENSIVE username variations (12+ variations per user)
  generateUsernameVariations(username) {
    const variations = new Set()
    
    // Original username
    variations.add(username)
    
    // Basic transformations
    variations.add(username.toLowerCase())
    variations.add(username.toUpperCase())
    variations.add(username.charAt(0).toUpperCase() + username.slice(1).toLowerCase())
    
    // Space, underscore, hyphen variations
    const spaceVariations = [
      username.replace(/\s+/g, ''),          // Remove all spaces
      username.replace(/\s+/g, '_'),         // Spaces to underscores
      username.replace(/\s+/g, '-'),         // Spaces to hyphens
      username.replace(/_/g, ''),            // Remove underscores
      username.replace(/_/g, ' '),           // Underscores to spaces
      username.replace(/_/g, '-'),           // Underscores to hyphens
      username.replace(/-/g, ''),            // Remove hyphens
      username.replace(/-/g, ' '),           // Hyphens to spaces
      username.replace(/-/g, '_'),           // Hyphens to underscores
    ]
    
    spaceVariations.forEach(variation => {
      variations.add(variation)
      variations.add(variation.toLowerCase())
      variations.add(variation.toUpperCase())
    })
    
    // Special character handling
    variations.add(username.replace(/[^a-zA-Z0-9]/g, ''))  // Alphanumeric only
    variations.add(username.replace(/\W/g, ''))            // Remove non-word chars
    
    // Dot variations
    variations.add(username.replace(/\./g, ''))            // Remove dots
    variations.add(username.replace(/\./g, '_'))           // Dots to underscores
    
    // Trim whitespace variations
    variations.add(username.trim())
    variations.add(username.trim().toLowerCase())
    
    return Array.from(variations).filter(v => v.length > 0)
  }

  // COMPREHENSIVE user search with advanced matching
  async searchForTargetUsers(participants, contestId) {
    console.log(`\n🔍 COMPREHENSIVE USER SEARCH`)
    console.log(`📋 Searching ${participants.length} participants for target users...`)
    
    // Get target users from database
    const targetUsers = await db.getTargetUsers()
    console.log(`🎯 Looking for ${targetUsers.length} target users`)
    
    // Create comprehensive search mapping
    const participantMap = new Map()
    
    // Index ALL participants with ALL variations
    console.log(`📋 Building comprehensive participant index...`)
    participants.forEach((participant, index) => {
      const username = participant.username || participant.user_slug || participant.name
      if (username) {
        const variations = this.generateUsernameVariations(username)
        variations.forEach(variation => {
          const normalizedVariation = variation.toLowerCase().trim()
          if (!participantMap.has(normalizedVariation)) {
            participantMap.set(normalizedVariation, [])
          }
          participantMap.get(normalizedVariation).push({
            ...participant,
            originalUsername: username,
            searchVariation: variation,
            participantIndex: index
          })
        })
      }
      
      // Progress update
      if ((index + 1) % 2000 === 0) {
        console.log(`🔄 Indexed ${index + 1}/${participants.length} participants...`)
      }
    })
    
    console.log(`📊 Participant index built: ${participantMap.size} searchable variations`)
    
    const foundUsers = []
    const notFoundUsers = []
    
    // Search for each target user
    for (const targetUser of targetUsers) {
      console.log(`\n🔍 Searching for: "${targetUser.leetcode_id}" (${targetUser.display_name})`)
      
      const targetVariations = this.generateUsernameVariations(targetUser.leetcode_id)
      console.log(`🎯 Generated ${targetVariations.length} search variations`)
      
      let found = false
      
      for (const variation of targetVariations) {
        const normalizedVariation = variation.toLowerCase().trim()
        
        if (participantMap.has(normalizedVariation)) {
          const matches = participantMap.get(normalizedVariation)
          
          for (const match of matches) {
            console.log(`✅ FOUND! "${targetUser.leetcode_id}" matched as "${match.originalUsername}" using variation "${variation}"`)
            console.log(`   📊 Rank: ${match.rank || 'N/A'}, Score: ${match.score || match.total_score || 'N/A'}`)
            
            foundUsers.push({
              contest_id: contestId,
              leetcode_id: targetUser.leetcode_id,
              display_name: targetUser.display_name,
              rank: match.rank,
              score: match.score || match.total_score || 0,
              finish_time: match.finish_time,
              matched_variation: match.originalUsername !== targetUser.leetcode_id ? match.originalUsername : null,
              original_leetcode_id: targetUser.leetcode_id,
              participated: true,
              search_variation_used: variation,
              participant_data: match
            })
          }
          
          found = true
          break
        }
      }
      
      if (!found) {
        console.log(`❌ Not found: "${targetUser.leetcode_id}" (tried ${targetVariations.length} variations)`)
        notFoundUsers.push({
          contest_id: contestId,
          leetcode_id: targetUser.leetcode_id,
          display_name: targetUser.display_name,
          rank: null,
          score: null,
          finish_time: null,
          matched_variation: null,
          original_leetcode_id: targetUser.leetcode_id,
          participated: false
        })
      }
    }
    
    console.log(`\n🎯 COMPREHENSIVE SEARCH COMPLETE`)
    console.log(`✅ Found: ${foundUsers.length}/${targetUsers.length} target users`)
    console.log(`🔍 Success rate: ${((foundUsers.length / targetUsers.length) * 100).toFixed(1)}%`)
    
    return { foundUsers, notFoundUsers }
  }

  // Save comprehensive results to Supabase
  async saveResultsToSupabase(foundUsers, notFoundUsers, contestInfo) {
    console.log(`\n💾 SAVING COMPREHENSIVE RESULTS TO SUPABASE`)
    
    try {
      // Extract contest ID from title
      const contestId = parseInt(contestInfo.title.match(/\d+/)?.[0])
      if (!contestId) {
        throw new Error('Could not extract contest ID from title')
      }

      // Check if contest exists, create if not
      let contest = await db.getContest(contestId)
      if (!contest) {
        console.log(`📝 Creating new contest entry: ${contestInfo.title}`)
        contest = await db.createContest({
          contest_id: contestId,
          title: contestInfo.title,
          start_time: new Date(contestInfo.start_time * 1000),
          duration: contestInfo.duration,
          is_virtual: contestInfo.is_virtual || false,
          processed: true,
          total_participants: this.allParticipants.length
        })
      }

      // Save all found users (participants)
      if (foundUsers.length > 0) {
        console.log(`💾 Saving ${foundUsers.length} found participants...`)
        
        for (const user of foundUsers) {
          await db.saveContestParticipation({
            contest_id: contestId,
            leetcode_id: user.leetcode_id,
            display_name: user.display_name,
            rank: user.rank,
            score: user.score,
            finish_time: user.finish_time ? new Date(user.finish_time * 1000) : null,
            matched_variation: user.matched_variation,
            original_leetcode_id: user.original_leetcode_id,
            participated: true,
            search_variation_used: user.search_variation_used
          })
        }
        
        console.log(`✅ Saved ${foundUsers.length} participants to database`)
      }

      // Save all not found users (non-participants)
      if (notFoundUsers.length > 0) {
        console.log(`💾 Saving ${notFoundUsers.length} non-participants...`)
        
        for (const user of notFoundUsers) {
          await db.saveContestParticipation({
            contest_id: contestId,
            leetcode_id: user.leetcode_id,
            display_name: user.display_name,
            rank: null,
            score: null,
            finish_time: null,
            matched_variation: null,
            original_leetcode_id: user.original_leetcode_id,
            participated: false,
            search_variation_used: null
          })
        }
        
        console.log(`✅ Saved ${notFoundUsers.length} non-participants to database`)
      }

      // Update contest as processed
      await db.updateContest(contestId, {
        processed: true,
        participants_found: foundUsers.length,
        total_target_users: foundUsers.length + notFoundUsers.length,
        last_processed: new Date()
      })

      console.log(`\n🎉 COMPREHENSIVE DATA SAVE COMPLETE!`)
      console.log(`   Contest: ${contestInfo.title}`)
      console.log(`   Total participants: ${this.allParticipants.length}`)
      console.log(`   Found users: ${foundUsers.length}`)
      console.log(`   Not found users: ${notFoundUsers.length}`)
      console.log(`   Database entries created: ${foundUsers.length + notFoundUsers.length}`)

      return {
        contest,
        saved: foundUsers.length + notFoundUsers.length,
        found: foundUsers.length,
        notFound: notFoundUsers.length
      }

    } catch (error) {
      console.error('❌ Error saving to Supabase:', error.message)
      throw error
    }
  }

  // Process a complete contest with comprehensive approach
  async processContestComprehensively(contestInfo) {
    try {
      console.log(`\n🎯 COMPREHENSIVE CONTEST PROCESSING: ${contestInfo.title}`)
      
      const contestId = parseInt(contestInfo.title.match(/\d+/)?.[0])
      if (!contestId) {
        console.log('❌ Could not extract contest ID from title')
        return null
      }

      // Extract contest slug from title
      let contestSlug = contestInfo.title.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      
      // Handle specific contest naming patterns
      if (contestInfo.title.includes('Weekly Contest')) {
        contestSlug = `weekly-contest-${contestId}`
      } else if (contestInfo.title.includes('Biweekly Contest')) {
        contestSlug = `biweekly-contest-${contestId}`
      }

      console.log(`🔗 Contest slug: ${contestSlug}`)

      // Check if already processed
      const existingContest = await db.getContest(contestId)
      if (existingContest && existingContest.processed) {
        console.log(`⏭️ Contest ${contestId} already processed, skipping...`)
        return existingContest
      }

      // Step 1: Fetch ALL participants comprehensively
      console.log(`\n📥 Step 1: Comprehensive participant fetching`)
      const allParticipants = await this.fetchAllContestParticipants(contestSlug)
      
      if (allParticipants.length === 0) {
        console.log(`❌ No participants found for contest ${contestSlug}`)
        return null
      }

      // Step 2: Comprehensive user search
      console.log(`\n🔍 Step 2: Comprehensive user search`)
      const { foundUsers, notFoundUsers } = await this.searchForTargetUsers(allParticipants, contestId)

      // Step 3: Save to Supabase
      console.log(`\n💾 Step 3: Save comprehensive results`)
      const result = await this.saveResultsToSupabase(foundUsers, notFoundUsers, contestInfo)

      console.log(`\n🏆 COMPREHENSIVE PROCESSING COMPLETE!`)
      console.log(`   Contest: ${contestInfo.title}`)
      console.log(`   Participants fetched: ${allParticipants.length}`)
      console.log(`   Users found: ${foundUsers.length}`)
      console.log(`   Success rate: ${((foundUsers.length / (foundUsers.length + notFoundUsers.length)) * 100).toFixed(1)}%`)

      return result

    } catch (error) {
      console.error(`❌ Error processing contest comprehensively:`, error.message)
      throw error
    }
  }

  // Main comprehensive processing function
  async runComprehensiveProcessing() {
    try {
      console.log(`\n🚀 STARTING COMPREHENSIVE CONTEST PROCESSING`)
      console.log(`📅 ${new Date().toISOString()}`)
      
      // Get current contest info
      const contestInfo = await this.getCurrentContestInfo()
      if (!contestInfo) {
        console.log('❌ No contest information available')
        return null
      }

      console.log(`📋 Found contest: ${contestInfo.title}`)
      console.log(`🕐 Contest time: ${new Date(contestInfo.start_time * 1000).toISOString()}`)

      // Process the contest comprehensively
      const result = await this.processContestComprehensively(contestInfo)

      console.log(`\n✅ COMPREHENSIVE PROCESSING COMPLETE`)
      return result

    } catch (error) {
      console.error('❌ Comprehensive processing failed:', error.message)
      throw error
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default ComprehensiveContestFetcher
