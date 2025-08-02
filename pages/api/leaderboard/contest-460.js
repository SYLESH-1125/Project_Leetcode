// Test API endpoint for year-wise leaderboard
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { contest_id = '460', year } = req.query

    console.log(`🔍 Fetching leaderboard for Contest ${contest_id}, Year: ${year || 'all'}`)

    // Base query
    let query = supabase
      .from('user_contest_results')
      .select(`
        *,
        target_users!inner(
          academic_year,
          batch_year,
          department,
          section,
          display_name
        )
      `)
      .eq('contest_id', contest_id)

    // Filter by year if specified
    if (year && year !== 'all') {
      query = query.eq('target_users.academic_year', year)
    }

    // Order by participation first, then by rank
    query = query.order('participated', { ascending: false })
      .order('rank', { ascending: true, nullsLast: true })

    const { data: results, error } = await query

    if (error) {
      console.error('❌ Database error:', error)
      return res.status(500).json({ error: 'Database error', details: error.message })
    }

    // Group results by year
    const yearGroups = {
      '2nd Year': { participated: [], notParticipated: [] },
      '3rd Year': { participated: [], notParticipated: [] }
    }

    results.forEach(result => {
      const userYear = result.target_users.academic_year
      if (yearGroups[userYear]) {
        if (result.participated) {
          yearGroups[userYear].participated.push({
            ...result,
            display_name: result.target_users.display_name,
            academic_year: result.target_users.academic_year,
            section: result.target_users.section
          })
        } else {
          yearGroups[userYear].notParticipated.push({
            ...result,
            display_name: result.target_users.display_name,
            academic_year: result.target_users.academic_year,
            section: result.target_users.section
          })
        }
      }
    })

    // Get contest info
    const { data: contestInfo } = await supabase
      .from('contests')
      .select('*')
      .eq('contest_id', contest_id)
      .single()

    const response = {
      contest: contestInfo || { contest_id, title: `Contest ${contest_id}`, contest_type: 'unknown' },
      summary: {
        total: results.length,
        participated: results.filter(r => r.participated).length,
        notParticipated: results.filter(r => !r.participated).length
      },
      years: {
        '2nd Year': {
          total: yearGroups['2nd Year'].participated.length + yearGroups['2nd Year'].notParticipated.length,
          participated: yearGroups['2nd Year'].participated.length,
          notParticipated: yearGroups['2nd Year'].notParticipated.length,
          topPerformers: yearGroups['2nd Year'].participated.slice(0, 10),
          allStudents: [...yearGroups['2nd Year'].participated, ...yearGroups['2nd Year'].notParticipated].slice(0, 20)
        },
        '3rd Year': {
          total: yearGroups['3rd Year'].participated.length + yearGroups['3rd Year'].notParticipated.length,
          participated: yearGroups['3rd Year'].participated.length,
          notParticipated: yearGroups['3rd Year'].notParticipated.length,
          topPerformers: yearGroups['3rd Year'].participated.slice(0, 10),
          allStudents: [...yearGroups['3rd Year'].participated, ...yearGroups['3rd Year'].notParticipated].slice(0, 20)
        }
      }
    }

    console.log(`✅ Leaderboard data: ${response.summary.total} total, ${response.summary.participated} participated`)
    console.log(`📊 2nd Year: ${response.years['2nd Year'].total}, 3rd Year: ${response.years['3rd Year'].total}`)

    res.status(200).json(response)

  } catch (error) {
    console.error('❌ API Error:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
