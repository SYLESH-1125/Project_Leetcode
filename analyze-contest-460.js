// analyze-contest-460.js - Analyze Contest 460 data vs our target users
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeContest460() {
    try {
        console.log('🔍 Analyzing Contest 460 data vs our target users...')
        
        // Get all target users
        const { data: targetUsers, error: targetError } = await supabase
            .from('target_users')
            .select('*')
        
        if (targetError) {
            console.error('❌ Error fetching target users:', targetError)
            return
        }
        
        console.log(`📊 Total target users in database: ${targetUsers.length}`)
        
        // Read Contest 460 data
        const contest460Data = JSON.parse(
            fs.readFileSync('./contest-460-all-users.json', 'utf8')
        )
        
        console.log(`📊 Total users in Contest 460 data: ${contest460Data.users.length}`)
        
        // Create maps for quick lookup
        const targetUserMap = new Map(targetUsers.map(user => [user.leetcode_id.toLowerCase(), user]))
        const contest460Map = new Map(contest460Data.users.map(user => [user.leetcode_id.toLowerCase(), user]))
        
        // Find matches
        const matches = []
        const targetUsersNotInContest = []
        const contestUsersNotInTarget = []
        
        // Check target users against contest data
        for (const targetUser of targetUsers) {
            const contestUser = contest460Map.get(targetUser.leetcode_id.toLowerCase())
            if (contestUser) {
                matches.push({
                    target: targetUser,
                    contest: contestUser
                })
            } else {
                targetUsersNotInContest.push(targetUser)
            }
        }
        
        // Check contest users not in our target list
        for (const contestUser of contest460Data.users) {
            if (!targetUserMap.has(contestUser.leetcode_id.toLowerCase())) {
                contestUsersNotInTarget.push(contestUser)
            }
        }
        
        console.log('\n📊 ANALYSIS RESULTS:')
        console.log(`✅ Matches (our students who have contest data): ${matches.length}`)
        console.log(`❌ Our students NOT in Contest 460: ${targetUsersNotInContest.length}`)
        console.log(`❓ Contest 460 users NOT our students: ${contestUsersNotInTarget.length}`)
        
        // Year-wise breakdown of matches
        const yearBreakdown = {
            '2nd Year': { participated: 0, notParticipated: 0 },
            '3rd Year': { participated: 0, notParticipated: 0 },
            'Unknown': { participated: 0, notParticipated: 0 }
        }
        
        console.log('\n🎯 OUR STUDENTS IN CONTEST 460:')
        matches.forEach((match, index) => {
            const year = match.target.academic_year || 'Unknown'
            const participated = match.contest.participated
            
            if (participated) {
                yearBreakdown[year].participated++
            } else {
                yearBreakdown[year].notParticipated++
            }
            
            if (index < 10) { // Show first 10
                console.log(`  ${index + 1}. ${match.target.display_name} (${match.target.leetcode_id}) - ${year} - ${participated ? '✅ Participated' : '❌ Not Participated'}`)
            }
        })
        
        console.log('\n📈 YEAR-WISE PARTICIPATION:')
        Object.entries(yearBreakdown).forEach(([year, stats]) => {
            const total = stats.participated + stats.notParticipated
            if (total > 0) {
                console.log(`${year}: ${total} total (${stats.participated} participated, ${stats.notParticipated} didn't)`)
            }
        })
        
        // Now load only the matching data
        console.log('\n🚀 Loading only our students\' Contest 460 data...')
        
        // Insert contest record
        const contestRecord = {
            contest_id: '460',
            title: 'Weekly Contest 460',
            contest_type: 'weekly',
            start_time: '2025-08-01T00:00:00Z',
            end_time: '2025-08-01T01:30:00Z',
            total_participants: contest460Data.users.length,
            data_fetched: true
        }
        
        const { error: contestError } = await supabase
            .from('contests')
            .upsert(contestRecord, { onConflict: 'contest_id' })
        
        if (contestError) {
            console.error('❌ Error inserting contest:', contestError)
            return
        }
        
        // Prepare only matching user results
        const userResults = matches.map(match => ({
            contest_id: '460',
            leetcode_id: match.target.leetcode_id,
            display_name: match.target.display_name,
            rank: match.contest.rank || null,
            score: match.contest.score || 0,
            finish_time: match.contest.finish_time || null,
            participated: match.contest.participated || false,
            problems_solved: match.contest.problems_solved || 0
        }))
        
        // Add non-participating target users
        const nonParticipatingUsers = targetUsersNotInContest.map(user => ({
            contest_id: '460',
            leetcode_id: user.leetcode_id,
            display_name: user.display_name,
            rank: null,
            score: 0,
            finish_time: null,
            participated: false,
            problems_solved: 0
        }))
        
        const allUserResults = [...userResults, ...nonParticipatingUsers]
        
        // Insert in batches
        const batchSize = 50
        let insertedCount = 0
        
        for (let i = 0; i < allUserResults.length; i += batchSize) {
            const batch = allUserResults.slice(i, i + batchSize)
            
            const { error: insertError } = await supabase
                .from('user_contest_results')
                .upsert(batch, { onConflict: 'contest_id,leetcode_id' })
            
            if (insertError) {
                console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, insertError)
                continue
            }
            
            insertedCount += batch.length
            console.log(`📝 Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertedCount}/${allUserResults.length} users`)
        }
        
        console.log('\n✅ Contest 460 data loaded successfully for our students!')
        console.log(`📊 Total records: ${allUserResults.length}`)
        console.log(`✅ Participated: ${userResults.length}`)
        console.log(`❌ Not Participated: ${nonParticipatingUsers.length}`)
        
        // Test year-wise leaderboard
        console.log('\n🔍 Testing year-wise leaderboard...')
        
        // Get 2nd Year participants
        const { data: secondYearData, error: secondYearError } = await supabase
            .from('user_contest_results')
            .select(`
                *,
                target_users!inner(academic_year, batch_year, department, section, display_name)
            `)
            .eq('contest_id', '460')
            .eq('participated', true)
            .eq('target_users.academic_year', '2nd Year')
            .order('rank', { ascending: true })
            .limit(10)
        
        // Get 3rd Year participants
        const { data: thirdYearData, error: thirdYearError } = await supabase
            .from('user_contest_results')
            .select(`
                *,
                target_users!inner(academic_year, batch_year, department, section, display_name)
            `)
            .eq('contest_id', '460')
            .eq('participated', true)
            .eq('target_users.academic_year', '3rd Year')
            .order('rank', { ascending: true })
            .limit(10)
        
        if (!secondYearError && secondYearData.length > 0) {
            console.log('\n🥇 2nd Year Top Performers:')
            secondYearData.forEach((user, index) => {
                console.log(`  ${index + 1}. ${user.target_users.display_name} (${user.leetcode_id}) - Rank: ${user.rank}, Score: ${user.score}`)
            })
        }
        
        if (!thirdYearError && thirdYearData.length > 0) {
            console.log('\n🥇 3rd Year Top Performers:')
            thirdYearData.forEach((user, index) => {
                console.log(`  ${index + 1}. ${user.target_users.display_name} (${user.leetcode_id}) - Rank: ${user.rank}, Score: ${user.score}`)
            })
        }
        
        console.log('\n🎯 Contest 460 is now ready for the Year-wise Leaderboard!')
        
    } catch (error) {
        console.error('❌ Error:', error)
    }
}

analyzeContest460()
