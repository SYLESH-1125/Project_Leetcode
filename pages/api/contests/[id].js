// pages/api/contests/[id].js - API route for specific contest data
import { db } from '../../../lib/supabase.js'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // Keep contest ID as string to match database TEXT type
      const contestId = id.toString()
      
      if (!contestId || contestId === 'undefined') {
        return res.status(400).json({ error: 'Invalid contest ID' })
      }

      // Fetch contest, results, and stats
      const [contest, results, stats] = await Promise.all([
        db.getContest(contestId),
        db.getContestResults(contestId),
        db.getContestStats(contestId)
      ])

      // Separate users based on participated column (more accurate than score)
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
          success_rate: stats ? `${stats.success_rate}%` : '0%'
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
