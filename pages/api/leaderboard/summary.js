// pages/api/leaderboard/summary.js - API route for leaderboard summary
import { db } from '../../../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const leaderboardData = await db.getLeaderboardSummary()
      
      // Process the data to create a comprehensive summary
      const summary = leaderboardData.map(user => {
        const contests = user.user_contest_results || []
        const participatedContests = contests.filter(c => c.participated)
        
        const totalContests = contests.length
        const participatedCount = participatedContests.length
        const participationRate = totalContests > 0 ? (participatedCount / totalContests) * 100 : 0
        
        const avgRank = participatedContests.length > 0 
          ? participatedContests.reduce((sum, c) => sum + (c.rank || 0), 0) / participatedContests.length 
          : null
          
        const avgScore = participatedContests.length > 0
          ? participatedContests.reduce((sum, c) => sum + (c.score || 0), 0) / participatedContests.length
          : null
          
        const bestRank = participatedContests.length > 0
          ? Math.min(...participatedContests.map(c => c.rank || Infinity))
          : null
          
        const bestScore = participatedContests.length > 0
          ? Math.max(...participatedContests.map(c => c.score || 0))
          : null

        return {
          ...user,
          statistics: {
            totalContests,
            participatedCount,
            participationRate: Math.round(participationRate * 100) / 100,
            avgRank: avgRank ? Math.round(avgRank) : null,
            avgScore: avgScore ? Math.round(avgScore * 100) / 100 : null,
            bestRank,
            bestScore
          },
          recentContests: contests
            .sort((a, b) => new Date(b.contests.start_time) - new Date(a.contests.start_time))
            .slice(0, 5)
        }
      })

      // Sort by participation rate and performance
      summary.sort((a, b) => {
        if (a.statistics.participationRate !== b.statistics.participationRate) {
          return b.statistics.participationRate - a.statistics.participationRate
        }
        if (a.statistics.avgRank && b.statistics.avgRank) {
          return a.statistics.avgRank - b.statistics.avgRank
        }
        return (b.statistics.avgScore || 0) - (a.statistics.avgScore || 0)
      })

      res.status(200).json({ 
        users: summary,
        meta: {
          totalUsers: summary.length,
          activeUsers: summary.filter(u => u.statistics.participatedCount > 0).length,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error fetching leaderboard summary:', error)
      res.status(500).json({ error: 'Failed to fetch leaderboard summary' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: 'Method not allowed' })
  }
}
