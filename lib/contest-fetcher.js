// lib/contest-fetcher.js - Automated contest data fetching with dynamic tables
import axios from 'axios'
import { db } from './supabase.js'
import DynamicTableManager from './dynamic-table-manager.js'

// Cloudflare bypass headers (from your working system)
const FIREFOX_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0'
}

class ContestFetcher {
  constructor() {
    this.axiosConfig = {
      headers: FIREFOX_HEADERS,
      timeout: 30000,
      validateStatus: status => status === 200
    }
    this.tableManager = new DynamicTableManager()
  }

  // Get current contest info from LeetCode
  async getCurrentContestInfo() {
    try {
      console.log('🔍 Fetching current contest information...')
      
      // Get contest list
      const response = await axios.get(
        'https://leetcode.com/contest/api/list/',
        this.axiosConfig
      )

      const contests = response.data
      const now = new Date()

      // Find active or recently ended contests
      const recentContests = contests.filter(contest => {
        const startTime = new Date(contest.start_time * 1000)
        const endTime = new Date(startTime.getTime() + contest.duration * 1000)
        const timeSinceEnd = now - endTime
        
        // Include contests that ended within the last 2 hours
        return timeSinceEnd >= 0 && timeSinceEnd <= 2 * 60 * 60 * 1000
      })

      console.log(`📊 Found ${recentContests.length} recent contests`)
      return recentContests
    } catch (error) {
      console.error('❌ Error fetching contest info:', error.message)
      throw error
    }
  }

  // Detect contest type from title
  detectContestType(title) {
    if (title.includes('Biweekly')) return 'biweekly'
    if (title.includes('Weekly')) return 'weekly'
    return 'weekly' // default
  }

  // Fetch contest ranking data - COMPREHENSIVE approach
  async fetchContestRanking(contestSlug, maxPages = 800) {
    console.log(`🚀 Fetching COMPLETE ranking data for contest: ${contestSlug}`)
    console.log(`🎯 Target: ALL participants (5,000-20,000+ users)`)
    
    let allParticipants = []
    let page = 1
    let hasMoreData = true
    let consecutiveFailures = 0

    while (hasMoreData && page <= maxPages && consecutiveFailures < 10) {
      try {
        console.log(`📄 Fetching page ${page} (Total so far: ${allParticipants.length})...`)
        
        const response = await axios.get(
          `https://leetcode.com/contest/api/ranking/${contestSlug}/?pagination=${page}&region=global`,
          this.axiosConfig
        )

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
          allParticipants = allParticipants.concat(pageParticipants)
          consecutiveFailures = 0
          
          // Progress update every 50 pages
          if (page % 50 === 0) {
            console.log(`📊 Progress: ${allParticipants.length} participants collected...`)
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

        page++

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 300))

      } catch (error) {
        console.error(`❌ Error fetching page ${page}:`, error.message)
        
        if (error.response?.status === 403) {
          console.log('🔒 Cloudflare protection detected, waiting before retry...')
          await new Promise(resolve => setTimeout(resolve, 5000))
          continue
        }
        
        break
      }
    }

    console.log(`🎯 Total participants fetched: ${allParticipants.length}`)
    return allParticipants
  }

  // Find target users in contest data
  async findTargetUsersInContest(participants, contestId) {
    console.log('🔍 Finding target users in contest data...')
    
    const targetUsers = await db.getTargetUsers()
    const foundUsers = []
    const notFoundUsers = []

    for (const user of targetUsers) {
      let found = false
      
      // Try exact match first
      let participant = participants.find(p => 
        p.username.toLowerCase() === user.leetcode_id.toLowerCase()
      )

      if (!participant) {
        // Try partial matches
        const variations = [
          user.leetcode_id.replace(/[^a-zA-Z0-9]/g, ''),
          user.leetcode_id.replace(/\s+/g, ''),
          user.leetcode_id.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
        ]

        for (const variation of variations) {
          participant = participants.find(p => 
            p.username.toLowerCase().includes(variation.toLowerCase()) ||
            variation.toLowerCase().includes(p.username.toLowerCase())
          )
          if (participant) break
        }
      }

      if (participant) {
        foundUsers.push({
          contest_id: contestId,
          leetcode_id: user.leetcode_id,
          display_name: user.display_name,
          rank: participant.rank,
          score: participant.score,
          finish_time: participant.finish_time,
          matched_variation: participant.username !== user.leetcode_id ? participant.username : null,
          original_leetcode_id: user.leetcode_id,
          participated: true
        })
        found = true
      }

      if (!found) {
        notFoundUsers.push({
          contest_id: contestId,
          leetcode_id: user.leetcode_id,
          display_name: user.display_name,
          rank: null,
          score: null,
          finish_time: null,
          matched_variation: null,
          original_leetcode_id: user.leetcode_id,
          participated: false
        })
      }
    }

    console.log(`✅ Found ${foundUsers.length} users, ${notFoundUsers.length} not found`)
    return { foundUsers, notFoundUsers }
  }

  // Process a single contest with dynamic table creation
  async processContest(contestInfo) {
    try {
      console.log(`🎯 Processing contest: ${contestInfo.title}`)
      
      const contestIdMatch = contestInfo.title.match(/\d+/)?.[0]
      if (!contestIdMatch) {
        console.log('❌ Could not extract contest ID from title')
        return null
      }
      
      // Store as string to match database TEXT type
      const contestId = contestIdMatch.toString()
      
      // Generate dynamic table name
      const tableName = this.tableManager.generateTableName(contestInfo.title)
      console.log(`📋 Generated table name: ${tableName}`)

      // Check if contest already exists and is processed
      let contest = null
      try {
        contest = await db.getContest(contestId)
        if (contest && contest.data_fetched && contest.table_name) {
          console.log(`✅ Contest ${contestId} already processed in table ${contest.table_name}`)
          return contest
        }
      } catch {
        // Contest doesn't exist, we'll create it
      }

      // Create dynamic table for this contest
      await this.tableManager.createContestTable(tableName, contestInfo.title)

      // Insert/Update contest record with table name
      if (!contest) {
        const contestData = {
          contest_id: contestId,
          title: contestInfo.title,
          contest_type: this.detectContestType(contestInfo.title),
          start_time: new Date(contestInfo.start_time * 1000).toISOString(),
          end_time: new Date((contestInfo.start_time + contestInfo.duration) * 1000).toISOString(),
          total_participants: 0,
          data_fetched: false,
          table_name: tableName
        }

        contest = await db.insertContest(contestData)
        console.log(`📝 Created new contest record: ${contest.title} → ${tableName}`)
      } else {
        // Update existing contest with table name
        await db.updateContestTableName(contestId, tableName)
        contest.table_name = tableName
      }

      // Fetch contest participants
      const participants = await this.fetchContestRanking(contestInfo.title_slug)
      
      if (participants.length === 0) {
        console.log('❌ No participants found for contest')
        return null
      }

      // Find target users and prepare data for dynamic table
      const { foundUsers, notFoundUsers } = await this.findTargetUsersInContest(participants)
      
      // Prepare users for dynamic table (remove contest_id as it's not needed per table)
      const allUsersForTable = [...foundUsers, ...notFoundUsers].map(user => ({
        leetcode_id: user.leetcode_id,
        display_name: user.display_name,
        rank: user.rank,
        score: user.score,
        finish_time: user.finish_time,
        participated: user.participated,
        original_leetcode_id: user.original_leetcode_id,
        matched_variation: user.matched_variation
      }))
      
      // Insert all users into the dynamic contest table
      await this.tableManager.insertUsersIntoContestTable(tableName, allUsersForTable)
      
      // Mark contest as processed and update participant count
      await db.markContestDataFetched(contestId, participants.length)
      
      console.log(`🎉 Successfully processed contest ${contestId} in table ${tableName}`)
      console.log(`📊 Results: ${foundUsers.length} participated, ${notFoundUsers.length} did not participate`)
      
      return {
        contest_id: contestId,
        title: contestInfo.title,
        table_name: tableName,
        participants: participants.length,
        found_users: foundUsers.length,
        not_found_users: notFoundUsers.length,
        total_stored: allUsersForTable.length
      }

    } catch (error) {
      console.error(`❌ Error processing contest:`, error.message)
      throw error
    }
  }

  // Helper method to find target users in contest participants
  async findTargetUsersInContest(participants) {
    try {
      // Get all target users from database
      const targetUsers = await db.getUsers()
      
      const foundUsers = []
      const notFoundUsers = []
      
      // Create a map of participants for quick lookup (normalize to lowercase)
      const participantMap = new Map()
      participants.forEach(p => {
        participantMap.set(p.username.toLowerCase(), p)
      })
      
      // Check each target user
      for (const user of targetUsers) {
        const variations = [
          user.leetcode_id.toLowerCase(),
          user.display_name?.toLowerCase()
        ].filter(Boolean)
        
        let found = false
        let participantData = null
        let matchedVariation = null
        
        // Try to find user by any variation
        for (const variation of variations) {
          if (participantMap.has(variation)) {
            found = true
            participantData = participantMap.get(variation)
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
      
      return { foundUsers, notFoundUsers }
      
    } catch (error) {
      console.error('❌ Error finding target users:', error.message)
      throw error
    }
  }

  // Main automation function
  async runAutomation() {
    try {
      console.log('🤖 Starting automated contest fetching...')
      console.log(`⏰ Current time: ${new Date().toISOString()}`)
      
      // Get recent contests
      const recentContests = await this.getCurrentContestInfo()
      
      if (recentContests.length === 0) {
        console.log('📝 No recent contests found')
        return []
      }

      const processedContests = []
      
      for (const contestInfo of recentContests) {
        try {
          const result = await this.processContest(contestInfo)
          if (result) {
            processedContests.push(result)
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000))
          
        } catch (error) {
          console.error(`❌ Failed to process contest ${contestInfo.title}:`, error.message)
          continue
        }
      }

      console.log(`🎯 Automation complete. Processed ${processedContests.length} contests.`)
      return processedContests

    } catch (error) {
      console.error('❌ Automation failed:', error.message)
      throw error
    }
  }
}
export default ContestFetcher