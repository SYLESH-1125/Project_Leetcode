// pages/api/setup-contest-460.js - One-time setup for Contest 460
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('🚀 Setting up Contest 460...')
      
      // First, ensure the contest exists
      const { data: existingContest, error: contestCheckError } = await supabase
        .from('contests')
        .select('*')
        .eq('contest_id', '460')
        .single()
      
      if (contestCheckError && contestCheckError.code !== 'PGRST116') {
        console.error('Error checking contest:', contestCheckError)
        return res.status(500).json({ error: 'Database error', details: contestCheckError })
      }
      
      if (!existingContest) {
        // Insert Contest 460
        const { error: insertError } = await supabase
          .from('contests')
          .insert({
            contest_id: '460',
            title: 'Weekly Contest 460',
            start_time: '2024-10-13T08:00:00+05:30',
            end_time: '2024-10-13T09:30:00+05:30',
            contest_type: 'weekly',
            total_participants: 5577,
            data_fetched: true
          })
        
        if (insertError) {
          console.error('Error inserting contest:', insertError)
          return res.status(500).json({ error: 'Failed to create contest', details: insertError })
        }
        
        console.log('✅ Contest 460 created')
      }
      
      // Clear existing results first
      console.log('🧹 Clearing existing Contest 460 results...')
      await supabase
        .from('user_contest_results')
        .delete()
        .eq('contest_id', '460')
      
      // Get all target users first
      const { data: allTargetUsers, error: usersError } = await supabase
        .from('target_users')
        .select('leetcode_id, display_name')
      
      if (usersError) {
        console.error('Error fetching target users:', usersError)
        return res.status(500).json({ error: 'Failed to fetch target users', details: usersError })
      }
      
      console.log(`📊 Found ${allTargetUsers.length} target users in database`)
      
      // Load the original contest data from JSON files
      const baseUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`
      
      try {
        // Load original data files
        const [foundResponse, notFoundResponse, summaryResponse] = await Promise.all([
          fetch(`${baseUrl}/contest-460-comprehensive-found.json`),
          fetch(`${baseUrl}/contest-460-comprehensive-not-found.json`),
          fetch(`${baseUrl}/FINAL_SUMMARY_REPORT.json`)
        ])
        
        if (!foundResponse.ok || !notFoundResponse.ok || !summaryResponse.ok) {
          throw new Error('Could not load original contest data files')
        }
        
        const foundUsers = await foundResponse.json()
        const notFoundUsers = await notFoundResponse.json()
        const summary = await summaryResponse.json()
        
        console.log(`📊 Loaded ${foundUsers.length} found users, ${notFoundUsers.length} not found users`)
        
        // Create a map of found users by their original leetcode_id
        const foundUsersMap = new Map()
        foundUsers.forEach(user => {
          const originalId = user.original_leetcode_id || user.leetcode_id
          foundUsersMap.set(originalId, user)
        })
        
        // Create a map of not found users
        const notFoundUsersMap = new Map()
        notFoundUsers.forEach(user => {
          notFoundUsersMap.set(user.leetcode_id, user)
        })
        
        // Now create results for ALL target users
        const allResults = []
        
        for (const targetUser of allTargetUsers) {
          const leetcodeId = targetUser.leetcode_id
          
          if (foundUsersMap.has(leetcodeId)) {
            // User participated
            const foundUser = foundUsersMap.get(leetcodeId)
            allResults.push({
              contest_id: '460',
              leetcode_id: leetcodeId,
              rank: foundUser.rank,
              score: foundUser.score,
              finish_time: foundUser.finish_time,
              problems_solved: foundUser.problems_solved || 0,
              matched_variation: foundUser.matched_variation || null
            })
          } else {
            // User did not participate
            allResults.push({
              contest_id: '460',
              leetcode_id: leetcodeId,
              rank: null,
              score: null,
              finish_time: null,
              problems_solved: 0,
              matched_variation: null
            })
          }
        }
        
        console.log(`📊 Prepared ${allResults.length} user results`)
        
        // Insert in batches
        const batchSize = 50
        let insertedCount = 0
        
        for (let i = 0; i < allResults.length; i += batchSize) {
          const batch = allResults.slice(i, i + batchSize)
          
          const { error: resultsError } = await supabase
            .from('user_contest_results')
            .insert(batch)
          
          if (resultsError) {
            console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, resultsError)
            // Continue with other batches
          } else {
            insertedCount += batch.length
            console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allResults.length/batchSize)}`)
          }
        }
        
        // Insert contest stats
        const participatedCount = allResults.filter(r => r.score !== null).length
        const notParticipatedCount = allResults.filter(r => r.score === null).length
        const successRate = ((participatedCount / allResults.length) * 100).toFixed(2)
        
        const { error: statsError } = await supabase
          .from('contest_stats')
          .upsert({
            contest_id: '460',
            target_users: allResults.length,
            found_users: participatedCount,
            not_found_users: notParticipatedCount,
            success_rate: parseFloat(successRate),
            max_score: summary.contest_stats?.max_score || null,
            min_score: summary.contest_stats?.min_score || null,
            avg_score: summary.contest_stats?.avg_score || null
          }, { onConflict: 'contest_id' })
        
        if (statsError) {
          console.error('Error inserting stats:', statsError)
        } else {
          console.log('✅ Contest stats inserted')
        }
        
        res.status(200).json({ 
          success: true, 
          message: 'Contest 460 setup completed',
          total_users: allResults.length,
          participated: participatedCount,
          not_participated: notParticipatedCount,
          success_rate: `${successRate}%`,
          inserted: insertedCount
        })
        
      } catch (fileError) {
        console.error('Error loading contest data files:', fileError)
        res.status(500).json({ 
          error: 'Could not load original contest data', 
          details: fileError.message,
          hint: 'Make sure the JSON files are in the public directory'
        })
      }
      
    } catch (error) {
      console.error('Setup error:', error)
      res.status(500).json({ error: 'Setup failed', details: error.message })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: 'Method not allowed' })
  }
}
