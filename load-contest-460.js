// load-contest-460.js - Load Contest 460 data into database and prepare for leaderboard
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
    console.error('Please check your .env.local file')
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
        
        // First, insert/update the contest record
        const contestRecord = {
            contest_id: '460',
            title: 'Weekly Contest 460',
            contest_type: 'weekly',
            start_time: '2025-08-01T00:00:00Z', // Approximate
            end_time: '2025-08-01T01:30:00Z',   // Approximate
            total_participants: contest460Data.contest_info.total_users,
            data_fetched: true,
            table_name: 'contest_460_results'
        }
        
        const { data: contest, error: contestError } = await supabase
            .from('contests')
            .upsert(contestRecord, { onConflict: 'contest_id' })
            .select()
        
        if (contestError) {
            console.error('❌ Error inserting contest:', contestError)
            return
        }
        
        console.log('✅ Contest record created/updated')
        
        // Create the contest results table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS contest_460_results (
                id SERIAL PRIMARY KEY,
                leetcode_id TEXT NOT NULL,
                display_name TEXT,
                rank INTEGER,
                score INTEGER,
                finish_time BIGINT,
                participated BOOLEAN DEFAULT false,
                problems_solved INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                academic_year TEXT,
                batch_year TEXT,
                department TEXT,
                section TEXT
            );
            
            CREATE INDEX IF NOT EXISTS idx_contest_460_leetcode_id ON contest_460_results(leetcode_id);
            CREATE INDEX IF NOT EXISTS idx_contest_460_participated ON contest_460_results(participated);
            CREATE INDEX IF NOT EXISTS idx_contest_460_academic_year ON contest_460_results(academic_year);
        `
        
        const { error: tableError } = await supabase.rpc('execute_sql', { sql: createTableQuery })
        
        if (tableError) {
            console.error('❌ Error creating table:', tableError)
            return
        }
        
        console.log('✅ Contest 460 results table created/verified')
        
        // Prepare the user data with enhanced information
        const usersToInsert = []
        
        for (const user of contest460Data.users) {
            // Get additional user info from target_users table
            const { data: targetUser } = await supabase
                .from('target_users')
                .select('academic_year, batch_year, department, section, display_name')
                .eq('leetcode_id', user.leetcode_id)
                .single()
            
            const userRecord = {
                leetcode_id: user.leetcode_id,
                display_name: user.display_name || targetUser?.display_name || user.leetcode_id,
                rank: user.rank || null,
                score: user.score || 0,
                finish_time: user.finish_time || null,
                participated: user.participated || false,
                problems_solved: user.problems_solved || 0,
                academic_year: targetUser?.academic_year || 'Unknown',
                batch_year: targetUser?.batch_year || 'Unknown',
                department: targetUser?.department || 'CSE',
                section: targetUser?.section || 'Unknown'
            }
            
            usersToInsert.push(userRecord)
        }
        
        // Insert all user data in batches
        const batchSize = 50
        let insertedCount = 0
        
        for (let i = 0; i < usersToInsert.length; i += batchSize) {
            const batch = usersToInsert.slice(i, i + batchSize)
            
            const { error: insertError } = await supabase
                .from('contest_460_results')
                .upsert(batch, { onConflict: 'leetcode_id' })
            
            if (insertError) {
                console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, insertError)
                continue
            }
            
            insertedCount += batch.length
            console.log(`📝 Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertedCount}/${usersToInsert.length} users`)
        }
        
        console.log('✅ All Contest 460 data loaded successfully!')
        
        // Generate summary
        const participated = usersToInsert.filter(u => u.participated).length
        const notParticipated = usersToInsert.filter(u => !u.participated).length
        const secondYear = usersToInsert.filter(u => u.academic_year === '2nd Year').length
        const thirdYear = usersToInsert.filter(u => u.academic_year === '3rd Year').length
        
        console.log('\n📊 CONTEST 460 SUMMARY:')
        console.log(`👥 Total Users: ${usersToInsert.length}`)
        console.log(`✅ Participated: ${participated}`)
        console.log(`❌ Not Participated: ${notParticipated}`)
        console.log(`🎓 2nd Year: ${secondYear}`)
        console.log(`🎓 3rd Year: ${thirdYear}`)
        
        // Show top performers by year
        const participatedUsers = usersToInsert.filter(u => u.participated && u.rank)
        
        if (participatedUsers.length > 0) {
            console.log('\n🏆 TOP PERFORMERS:')
            
            const secondYearParticipants = participatedUsers
                .filter(u => u.academic_year === '2nd Year')
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 5)
            
            const thirdYearParticipants = participatedUsers
                .filter(u => u.academic_year === '3rd Year')
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 5)
            
            console.log('\n🥇 2nd Year Top 5:')
            secondYearParticipants.forEach((user, index) => {
                console.log(`  ${index + 1}. ${user.display_name} (${user.leetcode_id}) - Rank: ${user.rank}, Score: ${user.score}`)
            })
            
            console.log('\n🥇 3rd Year Top 5:')
            thirdYearParticipants.forEach((user, index) => {
                console.log(`  ${index + 1}. ${user.display_name} (${user.leetcode_id}) - Rank: ${user.rank}, Score: ${user.score}`)
            })
        }
        
        console.log('\n🎯 Contest 460 data is now ready for the leaderboard!')
        console.log('You can view it at: /pages/api/contests/460 or through the YearWiseLeaderboard component')
        
    } catch (error) {
        console.error('❌ Error loading Contest 460 data:', error)
    }
}

// Run the script
loadContest460Data()
