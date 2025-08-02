// lib/supabase.js - Supabase client configuration
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please check your .env.local file')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database operations
export const db = {
  // Access to supabase client
  supabase,
  
  // Get all contests
  async getAllContests() {
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .order('start_time', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get contest by ID
  async getContest(contestId) {
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .eq('contest_id', contestId)
    
    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  },

  // Get latest contest
  async getLatestContest() {
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(1)
    
    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  },

  // Get all target users with department/year filtering
  async getTargetUsers(filters = {}) {
    let query = supabase
      .from('target_users')
      .select('*')
    
    // Apply filters if provided
    if (filters.department) {
      query = query.eq('department', filters.department)
    }
    if (filters.academic_year) {
      query = query.eq('academic_year', filters.academic_year)
    }
    if (filters.batch_year) {
      query = query.eq('batch_year', filters.batch_year)
    }
    if (filters.active !== undefined) {
      query = query.eq('active', filters.active)
    }
    
    query = query.order('display_name')
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Alias for getTargetUsers for backward compatibility
  async getUsers() {
    return this.getTargetUsers()
  },

  // Update contest with table name
  async updateContestTableName(contestId, tableName) {
    const { data, error } = await supabase
      .from('contests')
      .update({ table_name: tableName })
      .eq('contest_id', contestId)
      .select()
    
    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  },

  // Get contest data from dynamic table
  async getContestTableData(tableName) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('participated', { ascending: false })
      .order('rank', { ascending: true, nullsFirst: false })
    
    if (error) throw error
    return data
  },

  // Get all contest tables
  async getAllContestTables() {
    const { data, error } = await supabase
      .rpc('get_contest_tables')
    
    if (error) throw error
    return data || []
  },

  // Get contests with table names
  async getContestsWithTables() {
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .not('table_name', 'is', null)
      .order('start_time', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get contest results with year-wise filtering
  async getContestResults(contestId, filters = {}) {
    let query = supabase
      .from('user_contest_results')
      .select(`
        *,
        target_users!inner(display_name, leetcode_id, reg_no, section, academic_year, batch_year)
      `)
      .eq('contest_id', contestId)
    
    // Apply filters
    if (filters.academic_year) {
      query = query.eq('academic_year', filters.academic_year)
    }
    if (filters.department) {
      query = query.eq('department', filters.department)
    }
    if (filters.batch_year) {
      query = query.eq('batch_year', filters.batch_year)
    }
    
    query = query.order('rank', { ascending: true, nullsFirst: false })
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get contest stats with year-wise breakdown
  async getContestStats(contestId, academicYear = null) {
    let query = supabase
      .from('contest_stats')
      .select('*')
      .eq('contest_id', contestId)
    
    if (academicYear) {
      query = query.eq('academic_year', academicYear)
    } else {
      query = query.is('academic_year', null) // Overall stats
    }
    
    const { data, error } = await query.single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get user performance across all contests
  async getUserPerformance(leetcodeId) {
    const { data, error } = await supabase
      .from('user_contest_results')
      .select(`
        *,
        contests!inner(title, contest_type, start_time)
      `)
      .eq('leetcode_id', leetcodeId)
      .eq('participated', true)
      .order('contests.start_time', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Insert new contest
  async insertContest(contestData) {
    const { data, error } = await supabase
      .from('contests')
      .insert(contestData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Insert contest results with department/year info
  async insertContestResults(results) {
    // Enhance results with department and year info from target_users
    const enhancedResults = []
    
    for (const result of results) {
      const targetUser = await this.getTargetUserByLeetcodeId(result.leetcode_id)
      enhancedResults.push({
        ...result,
        department: targetUser?.department || 'CSE',
        academic_year: targetUser?.academic_year || '3rd Year',
        batch_year: targetUser?.batch_year || 2023
      })
    }
    
    const { data, error } = await supabase
      .from('user_contest_results')
      .insert(enhancedResults)
      .select()
    
    if (error) throw error
    return data
  },

  // Save contest participation (single user)
  async saveContestParticipation(participationData) {
    // Get target user info to enhance the data
    const targetUser = await this.getTargetUserByLeetcodeId(participationData.leetcode_id)
    
    const enhancedData = {
      ...participationData,
      department: targetUser?.department || 'CSE',
      academic_year: targetUser?.academic_year || '3rd Year',
      batch_year: targetUser?.batch_year || 2023
    }
    
    const { data, error } = await supabase
      .from('user_contest_results')
      .upsert(enhancedData, { 
        onConflict: 'contest_id,leetcode_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get target user by leetcode ID
  async getTargetUserByLeetcodeId(leetcodeId) {
    const { data, error } = await supabase
      .from('target_users')
      .select('*')
      .eq('leetcode_id', leetcodeId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return data
  },

  // Create contest
  async createContest(contestData) {
    const { data, error } = await supabase
      .from('contests')
      .insert(contestData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update contest
  async updateContest(contestId, updateData) {
    const { data, error } = await supabase
      .from('contests')
      .update(updateData)
      .eq('contest_id', contestId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update contest data fetched status
  async markContestDataFetched(contestId, totalParticipants) {
    const { data, error } = await supabase
      .from('contests')
      .update({ 
        data_fetched: true, 
        total_participants: totalParticipants,
        updated_at: new Date().toISOString()
      })
      .eq('contest_id', contestId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get leaderboard summary with year-wise breakdown
  async getLeaderboardSummary(filters = {}) {
    let query = supabase
      .from('target_users')
      .select(`
        *,
        user_contest_results(
          contest_id,
          rank,
          score,
          participated,
          contests!inner(title, contest_type, start_time)
        )
      `)
      .eq('active', true)
    
    // Apply filters
    if (filters.academic_year) {
      query = query.eq('academic_year', filters.academic_year)
    }
    if (filters.department) {
      query = query.eq('department', filters.department)
    }
    if (filters.batch_year) {
      query = query.eq('batch_year', filters.batch_year)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get year-wise leaderboard for a specific contest
  async getContestLeaderboardByYear(contestId) {
    const secondYear = await this.getContestResults(contestId, { academic_year: '2nd Year' })
    const thirdYear = await this.getContestResults(contestId, { academic_year: '3rd Year' })
    
    return {
      secondYear,
      thirdYear,
      combined: [...secondYear, ...thirdYear].sort((a, b) => {
        if (a.participated !== b.participated) return b.participated - a.participated
        if (!a.rank && !b.rank) return 0
        if (!a.rank) return 1
        if (!b.rank) return -1
        return a.rank - b.rank
      })
    }
  }
}
