export default function SetupPage() {
  const runDatabaseSetup = async () => {
    try {
      console.log('🚀 Running database setup...')
      const response = await fetch('/api/setup-database', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Database setup successful:', result)
        alert('✅ Database setup completed! Now setting up Contest 460...')
        
        // Now setup Contest 460
        const contestResponse = await fetch('/api/setup-contest-460', { method: 'POST' })
        const contestResult = await contestResponse.json()
        
        if (contestResult.success) {
          console.log('✅ Contest 460 setup successful:', contestResult)
          alert('🎉 Complete! Contest 460 data loaded. Redirecting to main page...')
          window.location.href = '/'
        } else {
          console.error('❌ Contest setup failed:', contestResult)
          alert('❌ Contest setup failed: ' + contestResult.error)
        }
      } else {
        console.error('❌ Database setup failed:', result)
        alert('❌ Database setup failed: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Setup error:', error)
      alert('❌ Setup failed: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🏆 LeetCode Contest Tracker Setup
        </h1>
        <p className="text-gray-600 mb-6">
          Click the button below to set up your database and load Contest 460 data.
        </p>
        <button
          onClick={runDatabaseSetup}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          🚀 Run Complete Setup
        </button>
        <div className="mt-6 text-sm text-gray-500">
          <p>This will:</p>
          <p>✅ Create database tables</p>
          <p>✅ Insert 61 target users</p>
          <p>✅ Load Contest 460 data</p>
        </div>
      </div>
    </div>
  )
}
