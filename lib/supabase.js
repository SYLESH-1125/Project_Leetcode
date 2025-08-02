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

  // Get all target users
  async getTargetUsers() {
    const { data, error } = await supabase
      .from('target_users')
      .select('*')
      .order('display_name')
    
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

  // Get contest results for a specific contest
  async getContestResults(contestId) {
    const { data, error } = await supabase
      .from('user_contest_results')
      .select(`
        *,
        target_users!inner(display_name, leetcode_id)
      `)
      .eq('contest_id', contestId)
      .order('rank', { ascending: true, nullsFirst: false })
    
    if (error) throw error
    return data
  },

  // Get contest stats
  async getContestStats(contestId) {
    const { data, error } = await supabase
      .from('contest_stats')
      .select('*')
      .eq('contest_id', contestId)
      .single()
    
    if (error) throw error
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

  // Insert contest results
  async insertContestResults(results) {
    const { data, error } = await supabase
      .from('user_contest_results')
      .insert(results)
      .select()
    
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

  // Get leaderboard summary across all contests
  async getLeaderboardSummary() {
    const { data, error } = await supabase
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
    
    if (error) throw error
    return data
  }
}
