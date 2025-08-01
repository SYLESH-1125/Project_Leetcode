// pages/api/contests/index.js - API routes for contest data
import { db } from '../../../lib/supabase.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const contests = await db.getAllContests()
      res.status(200).json({ contests })
    } catch (error) {
      console.error('Error fetching contests:', error)
      res.status(500).json({ error: 'Failed to fetch contests' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: 'Method not allowed' })
  }
}
