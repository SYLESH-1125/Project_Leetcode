// lib/contest-scheduler.js - Automated scheduling for comprehensive contest fetching
import cron from 'node-cron'
import ComprehensiveContestFetcher from './comprehensive-contest-fetcher.js'

class ContestScheduler {
  constructor() {
    this.fetcher = new ComprehensiveContestFetcher()
    this.isRunning = false
    this.jobs = []
  }

  // Schedule comprehensive contest fetching
  startScheduler() {
    console.log('🚀 Starting Comprehensive Contest Scheduler')
    console.log('📅 Schedule:')
    console.log('   - Weekly Contest: Sunday 8:00 AM to 9:30 AM → Results at 9:45 AM')
    console.log('   - Biweekly Contest: Saturday 8:00 PM to 9:30 PM → Results at 9:45 PM')
    console.log('   - Contest 461: This Sunday at 8:00 AM')
    
    // Weekly Contest - Sunday at 9:45 AM (15 minutes after contest ends)
    const weeklyJob = cron.schedule('45 9 * * 0', async () => {
      await this.runComprehensiveFetch('Weekly Contest - Sunday 9:45 AM')
    }, {
      scheduled: false,
      timezone: 'America/New_York' // Adjust timezone as needed
    })

    // Biweekly Contest - Saturday at 9:45 PM (15 minutes after contest ends)
    const biweeklyJob = cron.schedule('45 21 * * 6', async () => {
      await this.runComprehensiveFetch('Biweekly Contest - Saturday 9:45 PM')
    }, {
      scheduled: false,
      timezone: 'America/New_York' // Adjust timezone as needed
    })

    // Backup check - Sunday at 10:00 AM (in case 9:45 AM fails)
    const weeklyBackupJob = cron.schedule('0 10 * * 0', async () => {
      await this.runComprehensiveFetch('Weekly Contest - Backup Check')
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    })

    // Backup check - Saturday at 10:00 PM (in case 9:45 PM fails)
    const biweeklyBackupJob = cron.schedule('0 22 * * 6', async () => {
      await this.runComprehensiveFetch('Biweekly Contest - Backup Check')
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    })

    // Daily health check at 11:00 AM (check for any missed contests)
    const dailyHealthJob = cron.schedule('0 11 * * *', async () => {
      await this.runComprehensiveFetch('Daily Health Check')
    }, {
      scheduled: false,
      timezone: 'America/New_York'
    })

    this.jobs = [
      { name: 'Weekly Contest (Sunday 9:45 AM)', job: weeklyJob },
      { name: 'Biweekly Contest (Saturday 9:45 PM)', job: biweeklyJob },
      { name: 'Weekly Backup (Sunday 10:00 AM)', job: weeklyBackupJob },
      { name: 'Biweekly Backup (Saturday 10:00 PM)', job: biweeklyBackupJob },
      { name: 'Daily Health Check (11:00 AM)', job: dailyHealthJob }
    ]

    // Start all jobs
    this.jobs.forEach(({ name, job }) => {
      job.start()
      console.log(`✅ Started: ${name}`)
    })

    this.isRunning = true
    console.log('🎯 Comprehensive Contest Scheduler is running!')
  }

  // Stop all scheduled jobs
  stopScheduler() {
    console.log('⏹️ Stopping Contest Scheduler...')
    
    this.jobs.forEach(({ name, job }) => {
      job.stop()
      console.log(`🛑 Stopped: ${name}`)
    })

    this.isRunning = false
    console.log('✅ Contest Scheduler stopped')
  }

  // Run comprehensive contest fetching
  async runComprehensiveFetch(triggerType = 'Manual') {
    if (this.isProcessing) {
      console.log('⏭️ Comprehensive fetch already in progress, skipping...')
      return
    }

    try {
      this.isProcessing = true
      console.log(`\n🎯 COMPREHENSIVE CONTEST FETCH TRIGGERED`)
      console.log(`📋 Trigger: ${triggerType}`)
      console.log(`🕐 Time: ${new Date().toISOString()}`)
      console.log('=' .repeat(60))

      // Run comprehensive processing
      const result = await this.fetcher.runComprehensiveProcessing()

      if (result) {
        console.log(`\n✅ COMPREHENSIVE FETCH SUCCESSFUL`)
        console.log(`📊 Results:`)
        console.log(`   Contest: ${result.contest?.title || 'Unknown'}`)
        console.log(`   Found users: ${result.found}`)
        console.log(`   Not found users: ${result.notFound}`)
        console.log(`   Total saved: ${result.saved}`)
        console.log(`   Success rate: ${((result.found / (result.found + result.notFound)) * 100).toFixed(1)}%`)

        // Send notification (could be extended to email, Slack, etc.)
        this.sendNotification({
          type: 'success',
          trigger: triggerType,
          result
        })

      } else {
        console.log(`\n⚠️ No contest data found`)
        this.sendNotification({
          type: 'no_data',
          trigger: triggerType
        })
      }

    } catch (error) {
      console.error(`\n❌ COMPREHENSIVE FETCH FAILED`)
      console.error(`Trigger: ${triggerType}`)
      console.error(`Error: ${error.message}`)
      console.error(error.stack)

      this.sendNotification({
        type: 'error',
        trigger: triggerType,
        error: error.message
      })

    } finally {
      this.isProcessing = false
      console.log(`\n🏁 Comprehensive fetch completed for: ${triggerType}`)
    }
  }

  // Send notification about fetch results
  sendNotification(data) {
    const timestamp = new Date().toISOString()
    
    switch (data.type) {
      case 'success':
        console.log(`\n📧 NOTIFICATION: Contest processed successfully`)
        console.log(`   Contest: ${data.result.contest?.title}`)
        console.log(`   Found: ${data.result.found} users`)
        console.log(`   Trigger: ${data.trigger}`)
        console.log(`   Time: ${timestamp}`)
        break
        
      case 'no_data':
        console.log(`\n📧 NOTIFICATION: No contest data available`)
        console.log(`   Trigger: ${data.trigger}`)
        console.log(`   Time: ${timestamp}`)
        break
        
      case 'error':
        console.log(`\n📧 NOTIFICATION: Contest fetch failed`)
        console.log(`   Error: ${data.error}`)
        console.log(`   Trigger: ${data.trigger}`)
        console.log(`   Time: ${timestamp}`)
        break
    }
    
    // TODO: Add email/Slack notifications here
    // await sendEmailNotification(data)
    // await sendSlackNotification(data)
  }

  // Manual comprehensive fetch (for testing or immediate processing)
  async fetchNow() {
    console.log('🚀 Manual Comprehensive Contest Fetch')
    await this.runComprehensiveFetch('Manual')
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      isProcessing: this.isProcessing || false,
      jobs: this.jobs.map(({ name, job }) => ({
        name,
        running: job.running || false
      })),
      nextRuns: this.jobs.map(({ name, job }) => ({
        name,
        nextRun: job.nextDate ? job.nextDate() : null
      }))
    }
  }
}

export default ContestScheduler
