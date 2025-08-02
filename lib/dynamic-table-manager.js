// lib/dynamic-table-manager.js - Dynamic table creation and management
import { supabase } from './supabase.js'

class DynamicTableManager {
  constructor() {
    this.supabase = supabase
  }

  // Generate table name from contest title
  generateTableName(contestTitle) {
    // "Weekly Contest 414" → "weekly_contest_414"
    // "Biweekly Contest 139" → "biweekly_contest_139"
    return contestTitle
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
  }

  // Create contest table with standard columns
  async createContestTable(tableName, contestTitle) {
    try {
      console.log(`🔨 Creating table: ${tableName} for "${contestTitle}"`)
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
          id SERIAL PRIMARY KEY,
          leetcode_id TEXT NOT NULL,
          display_name TEXT,
          rank INTEGER,
          score INTEGER,
          finish_time INTEGER,
          problems_solved INTEGER DEFAULT 0,
          participated BOOLEAN DEFAULT FALSE,
          original_leetcode_id TEXT,
          matched_variation TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(leetcode_id)
        );
        
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_${tableName}_leetcode_id ON ${tableName}(leetcode_id);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_participated ON ${tableName}(participated);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_rank ON ${tableName}(rank);
        CREATE INDEX IF NOT EXISTS idx_${tableName}_score ON ${tableName}(score);
      `
      
      const { error } = await this.supabase.rpc('execute_sql', {
        sql_query: createTableSQL
      })
      
      if (error) {
        console.error(`❌ Error creating table ${tableName}:`, error)
        throw error
      }
      
      console.log(`✅ Table ${tableName} created successfully`)
      return true
      
    } catch (error) {
      console.error(`❌ Failed to create table ${tableName}:`, error)
      throw error
    }
  }

  // Insert users data into contest table
  async insertUsersIntoContestTable(tableName, users) {
    try {
      console.log(`📥 Inserting ${users.length} users into ${tableName}`)
      
      if (users.length === 0) {
        console.log('⚠️ No users to insert')
        return
      }

      const { data, error } = await this.supabase
        .from(tableName)
        .insert(users)
        .select()
      
      if (error) {
        console.error(`❌ Error inserting into ${tableName}:`, error)
        throw error
      }
      
      console.log(`✅ Successfully inserted ${data.length} users into ${tableName}`)
      return data
      
    } catch (error) {
      console.error(`❌ Failed to insert users into ${tableName}:`, error)
      throw error
    }
  }

  // Get data from contest table
  async getContestTableData(tableName) {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .order('participated', { ascending: false })
        .order('rank', { ascending: true, nullsFirst: false })
      
      if (error) {
        console.error(`❌ Error fetching from ${tableName}:`, error)
        throw error
      }
      
      return data
      
    } catch (error) {
      console.error(`❌ Failed to fetch from ${tableName}:`, error)
      throw error
    }
  }

  // Check if table exists
  async tableExists(tableName) {
    try {
      // Simple approach - try to query the table directly
      const { error } = await this.supabase
        .from(tableName)
        .select('count', { count: 'exact', head: true })

      // If no error, table exists
      return !error
      
    } catch (error) {
      console.error(`❌ Failed to check table existence:`, error)
      return false
    }
  }

  // Get table statistics
  async getTableStats(tableName) {
    try {
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
      
      if (error) {
        console.error(`❌ Error getting table stats:`, error)
        return null
      }
      
      const participated = data.filter(u => u.participated === true)
      const notParticipated = data.filter(u => u.participated === false)
      
      const stats = {
        total_users: data.length,
        participated_count: participated.length,
        not_participated_count: notParticipated.length,
        participation_rate: data.length > 0 ? parseFloat((participated.length / data.length * 100).toFixed(1)) : 0,
        max_score: participated.length > 0 ? Math.max(...participated.map(u => u.score || 0)) : null,
        min_score: participated.length > 0 ? Math.min(...participated.map(u => u.score || 0)) : null,
        avg_score: participated.length > 0 ? parseFloat((participated.reduce((sum, u) => sum + (u.score || 0), 0) / participated.length).toFixed(1)) : null
      }
      
      return stats
      
    } catch (error) {
      console.error(`❌ Failed to get table stats:`, error)
      return null
    }
  }

  // List all contest tables
  async getAllContestTables() {
    try {
      const { data, error } = await this.supabase.rpc('get_contest_tables')
      
      if (error) {
        console.error(`❌ Error getting contest tables:`, error)
        return []
      }
      
      return data || []
      
    } catch (error) {
      console.error(`❌ Failed to get contest tables:`, error)
      return []
    }
  }
}

export default DynamicTableManager
