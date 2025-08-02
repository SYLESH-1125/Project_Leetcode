// load-contest-460-fixed.js - Load Contest 460 data with proper table structure
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function loadContest460Data() {
    try {
        console.log('🚀 Loading Contest 460 data into database...')
        
        // Read the Contest 460 data
        const contest460Data = JSON.parse(
            fs.readFileSync('./contest-460-all-users.json', 'utf8')
        )
        
        console.log(`📊 Contest Info: ${contest460Data.contest_info.title}`)
        console.log(`👥 Total Users: ${contest460Data.contest_info.total_users}`)
        console.log(`✅ Participated: ${contest460Data.contest_info.participated_count}`)
        console.log(`❌ Not Participated: ${contest460Data.contest_info.non_participated_count}`)
        
        // Insert contest record into contests table
        const contestRecord = {
            contest_id: '460',
            title: 'Weekly Contest 460',
            contest_type: 'weekly',
            start_time: '2025-08-01T00:00:00Z',
            end_time: '2025-08-01T01:30:00Z',
            total_participants: contest460Data.contest_info.total_users,
            data_fetched: true
        }
        
        const { error: contestError } = await supabase
            .from('contests')
            .upsert(contestRecord, { onConflict: 'contest_id' })
        
        if (contestError) {
            console.error('❌ Error inserting contest:', contestError)
            return
        }
        
        console.log('✅ Contest record created/updated')
        
        // Prepare user contest results (without academic_year columns - these will be joined from target_users)
        const userResults = []
        const yearStats = { '2nd Year': 0, '3rd Year': 0, 'Unknown': 0 }
        const participationStats = { participated: 0, notParticipated: 0 }
        
        for (const user of contest460Data.users) {
            // Get additional user info from target_users table
            const { data: targetUser } = await supabase
                .from('target_users')
                .select('academic_year, batch_year, department, section, display_name')
                .eq('leetcode_id', user.leetcode_id)
                .single()
            
            const userResult = {
                contest_id: '460',
                leetcode_id: user.leetcode_id,
                display_name: user.display_name || targetUser?.display_name || user.leetcode_id,
                rank: user.rank || null,
                score: user.score || 0,
                finish_time: user.finish_time || null,
                participated: user.participated || false,
                problems_solved: user.problems_solved || 0
            }
            
            userResults.push(userResult)
            
            // Track stats
            const year = targetUser?.academic_year || 'Unknown'
            yearStats[year] = (yearStats[year] || 0) + 1
            
            if (user.participated) {
                participationStats.participated++
            } else {
                participationStats.notParticipated++
            }
        }
        
        // Insert all user results in batches
        const batchSize = 50
        let insertedCount = 0
        
        for (let i = 0; i < userResults.length; i += batchSize) {
            const batch = userResults.slice(i, i + batchSize)
            
            const { error: insertError } = await supabase
                .from('user_contest_results')
                .upsert(batch, { onConflict: 'contest_id,leetcode_id' })
            
            if (insertError) {
                console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, insertError)
                continue
            }
            
            insertedCount += batch.length
            console.log(`📝 Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertedCount}/${userResults.length} users`)
        }
        
        console.log('✅ All Contest 460 data loaded successfully!')
        
        // Generate year-wise summary
        console.log('\n📊 CONTEST 460 SUMMARY:')
        console.log(`👥 Total Users: ${userResults.length}`)
        console.log(`✅ Participated: ${participationStats.participated}`)
        console.log(`❌ Not Participated: ${participationStats.notParticipated}`)
        console.log(`🎓 2nd Year: ${yearStats['2nd Year']}`)
        console.log(`🎓 3rd Year: ${yearStats['3rd Year']}`)
        console.log(`❓ Unknown: ${yearStats['Unknown']}`)
        
        // Test the leaderboard data fetch with proper JOIN
        console.log('\n🔍 Testing year-wise leaderboard data fetch...')
        
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
        
        if (secondYearError) {
            console.error('❌ Error fetching 2nd year data:', secondYearError)
        } else {
            console.log(`✅ 2nd Year participants: ${secondYearData.length}`)
            if (secondYearData.length > 0) {
                console.log('\n🥇 2nd Year Top Performers:')
                secondYearData.slice(0, 5).forEach((user, index) => {
                    console.log(`  ${index + 1}. ${user.display_name} (${user.leetcode_id}) - Rank: ${user.rank}, Score: ${user.score}`)
                })
            }
        }
        
        if (thirdYearError) {
            console.error('❌ Error fetching 3rd year data:', thirdYearError)
        } else {
            console.log(`✅ 3rd Year participants: ${thirdYearData.length}`)
            if (thirdYearData.length > 0) {
                console.log('\n🥇 3rd Year Top Performers:')
                thirdYearData.slice(0, 5).forEach((user, index) => {
                    console.log(`  ${index + 1}. ${user.display_name} (${user.leetcode_id}) - Rank: ${user.rank}, Score: ${user.score}`)
                })
            }
        }
        
        console.log('\n🎯 Contest 460 data is now ready for the year-wise leaderboard!')
        console.log('✨ The YearWiseLeaderboard component will automatically fetch this data with year separation')
        
    } catch (error) {
        console.error('❌ Error loading Contest 460 data:', error)
    }
}

// Run the script
loadContest460Data()
