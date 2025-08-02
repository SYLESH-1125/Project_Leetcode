// pages/api/contests/index.js - API routes for contest data with dynamic tables
import { db } from '../../../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('API: Fetching contests with tables...')
      
      // Get contests with their dynamic table names
      const contests = await db.getContestsWithTables()
      
      console.log('API: Found contests:', contests.length)
      
      res.status(200).json({ 
        contests,
        total: contests.length,
        message: 'Contests with dynamic tables retrieved successfully'
      })
    } catch (error) {
      console.error('API Error fetching contests:', error)
      res.status(500).json({ 
        error: 'Failed to fetch contests',
        details: error.message 
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: 'Method not allowed' })
  }
}
