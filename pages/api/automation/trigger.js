// pages/api/automation/trigger.js - Manual trigger for contest automation
import ContestFetcher from '../../../lib/contest-fetcher.js'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('🔧 Manual automation trigger requested')
      
      const fetcher = new ContestFetcher()
      const results = await fetcher.runAutomation()
      
      res.status(200).json({
        success: true,
        message: `Processed ${results.length} contests`,
        contests: results
      })
    } catch (error) {
      console.error('Automation trigger failed:', error)
      res.status(500).json({ 
        success: false,
        error: 'Automation failed',
        message: error.message 
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ error: 'Method not allowed' })
  }
}
