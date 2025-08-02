// pages/api/contests/[id].js - API route for specific contest data from dynamic tables
import { db } from '../../../lib/supabase.js'
import DynamicTableManager from '../../../lib/dynamic-table-manager.js'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // Keep contest ID as string to match database TEXT type
      const contestId = id.toString()
      
      if (!contestId || contestId === 'undefined') {
        return res.status(400).json({ error: 'Invalid contest ID' })
      }

      // Fetch contest info
      const contest = await db.getContest(contestId)
      
      if (!contest) {
        return res.status(404).json({ error: 'Contest not found' })
      }

      if (!contest.table_name) {
        return res.status(404).json({ error: 'Contest table not found - contest may not be processed yet' })
      }

      // Initialize table manager
      const tableManager = new DynamicTableManager()

      // Fetch data from dynamic contest table
      const results = await tableManager.getContestTableData(contest.table_name)
      
      // Get table statistics
      const stats = await tableManager.getTableStats(contest.table_name)

      // Separate users based on participated column
      const foundUsers = results.filter(r => r.participated === true)
      const notFoundUsers = results.filter(r => r.participated === false)

      const response = {
        contest,
        stats,
        summary: {
          total_participants: contest.total_participants,
          target_users: results.length,
          found_users: foundUsers.length,
          not_found_users: notFoundUsers.length,
          success_rate: stats ? `${stats.participation_rate}%` : '0%',
          table_name: contest.table_name
        },
        found_users: foundUsers,
        not_found_users: notFoundUsers
      }

      res.status(200).json(response)
    } catch (error) {
      console.error('Error fetching contest:', error)
      res.status(500).json({ error: 'Failed to fetch contest data' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: 'Method not allowed' })
  }
}
