// start-comprehensive-scheduler.js - Start the automated comprehensive contest fetcher
import ContestScheduler from './lib/contest-scheduler.js'

async function startComprehensiveScheduler() {
  try {
    console.log('🚀 STARTING COMPREHENSIVE CONTEST AUTOMATION')
    console.log('=' .repeat(60))
    console.log('🎯 Features:')
    console.log('   ✅ Comprehensive participant fetching (ALL 5,000-20,000+ users)')
    console.log('   ✅ Advanced username variation matching (12+ variations)')
    console.log('   ✅ Proven CloudflareBypass system')
    console.log('   ✅ Automatic Supabase database storage')
    console.log('   ✅ Scheduled automation for weekly/biweekly contests')
    console.log('')

    const scheduler = new ContestScheduler()
    
    // Start the scheduler
    scheduler.startScheduler()
    
    // Show current status
    const status = scheduler.getStatus()
    console.log('\n📊 SCHEDULER STATUS:')
    console.log(`   Running: ${status.isRunning}`)
    console.log(`   Processing: ${status.isProcessing}`)
    console.log('')
    console.log('📅 SCHEDULED JOBS:')
    status.jobs.forEach(job => {
      console.log(`   ${job.name}: ${job.running ? '✅ Running' : '❌ Stopped'}`)
    })
    
    // Run a test fetch immediately (optional)
    console.log('\n🧪 RUNNING IMMEDIATE TEST FETCH...')
    await scheduler.fetchNow()
    
    // Keep the process running
    console.log('\n🔄 Scheduler is running continuously...')
    console.log('   Press Ctrl+C to stop')
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n⏹️ Shutting down scheduler...')
      scheduler.stopScheduler()
      process.exit(0)
    })
    
    process.on('SIGTERM', () => {
      console.log('\n\n⏹️ Shutting down scheduler...')
      scheduler.stopScheduler()
      process.exit(0)
    })
    
  } catch (error) {
    console.error('\n❌ SCHEDULER START FAILED:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Start the comprehensive scheduler
startComprehensiveScheduler()
