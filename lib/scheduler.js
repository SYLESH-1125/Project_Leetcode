// lib/scheduler.js - Contest scheduling and automation
import cron from 'node-cron'
import ContestFetcher from './contest-fetcher.js'

class ContestScheduler {
  constructor() {
    this.fetcher = new ContestFetcher()
    this.isRunning = false
  }

  // Start the automated scheduling
  start() {
    console.log('🚀 Starting LeetCode Contest Auto-Fetcher Scheduler')
    
    // Schedule for Weekly Contests (Every Sunday 10:00 AM IST - 1.5 hours after contest ends)
    // Cron: "0 10 * * 0" (Every Sunday at 10:00 AM)
    cron.schedule('0 10 * * 0', async () => {
      console.log('⏰ Weekly Contest automation triggered (Sunday 10:00 AM IST)')
      await this.runContestAutomation('weekly')
    }, {
      timezone: 'Asia/Kolkata'
    })

    // Schedule for Biweekly Contests (Every Saturday 11:00 PM IST - 1.5 hours after contest ends)  
    // Cron: "0 23 * * 6" (Every Saturday at 11:00 PM)
    cron.schedule('0 23 * * 6', async () => {
      console.log('⏰ Biweekly Contest automation triggered (Saturday 11:00 PM IST)')
      await this.runContestAutomation('biweekly')
    }, {
      timezone: 'Asia/Kolkata'
    })

    // Additional check every hour for any missed contests
    cron.schedule('0 * * * *', async () => {
      console.log('🔍 Hourly check for missed contests')
      await this.runContestAutomation('check')
    }, {
      timezone: 'Asia/Kolkata'
    })

    console.log('✅ Scheduler started successfully')
    console.log('📅 Weekly contests: Every Sunday 10:00 AM IST')
    console.log('📅 Biweekly contests: Every Saturday 11:00 PM IST') 
    console.log('🔍 Hourly checks: Every hour on the hour')
  }

  // Run contest automation
  async runContestAutomation(type = 'auto') {
    if (this.isRunning) {
      console.log('⚠️ Automation already running, skipping...')
      return
    }

    try {
      this.isRunning = true
      console.log(`🤖 Running contest automation (type: ${type})`)
      
      const results = await this.fetcher.runAutomation()
      
      if (results.length > 0) {
        console.log(`🎉 Successfully processed ${results.length} contests`)
        
        // Log contest details
        results.forEach(contest => {
          console.log(`   📊 ${contest.title} (ID: ${contest.contest_id})`)
        })
      } else {
        console.log('📝 No new contests to process')
      }

      return results

    } catch (error) {
      console.error('❌ Automation failed:', error.message)
      throw error
    } finally {
      this.isRunning = false
    }
  }

  // Manual trigger for testing
  async triggerManual() {
    console.log('🔧 Manual trigger activated')
    return await this.runContestAutomation('manual')
  }

  // Get next scheduled run times
  getSchedule() {
    const now = new Date()
    const nextSunday = new Date(now)
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7)
    nextSunday.setHours(10, 0, 0, 0)

    const nextSaturday = new Date(now)
    nextSaturday.setDate(now.getDate() + (6 - now.getDay() + 7) % 7)
    nextSaturday.setHours(23, 0, 0, 0)

    return {
      nextWeekly: nextSunday.toISOString(),
      nextBiweekly: nextSaturday.toISOString(),
      timezone: 'Asia/Kolkata'
    }
  }

  // Stop the scheduler
  stop() {
    console.log('🛑 Stopping contest scheduler')
    // Note: node-cron doesn't provide a direct way to stop specific jobs
    // In a production environment, you'd want to store job references
  }
}

export default ContestScheduler
