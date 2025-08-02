// components/YearWiseLeaderboard.js - Enhanced leaderboard with year separation
import { useState, useEffect } from 'react'
import { db } from '../lib/supabase.js'

export default function YearWiseLeaderboard({ contestId = null }) {
  const [leaderboardData, setLeaderboardData] = useState({
    secondYear: [],
    thirdYear: [],
    combined: []
  })
  const [activeTab, setActiveTab] = useState('combined')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contestInfo, setContestInfo] = useState(null)
  const [stats, setStats] = useState({})

  useEffect(() => {
    const fetchContestLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get contest info
        const contest = await db.getContest(contestId)
        setContestInfo(contest)
        
        // Get year-wise leaderboard
        const data = await db.getContestLeaderboardByYear(contestId)
        setLeaderboardData(data)
        
        // Get year-wise stats
        const overallStats = await db.getContestStats(contestId)
        const secondYearStats = await db.getContestStats(contestId, '2nd Year')
        const thirdYearStats = await db.getContestStats(contestId, '3rd Year')
        
        setStats({
          overall: overallStats,
          secondYear: secondYearStats,
          thirdYear: thirdYearStats
        })
        
      } catch (err) {
        console.error('Error fetching contest leaderboard:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchOverallLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get overall performance
        const allUsers = await db.getLeaderboardSummary()
        const secondYearUsers = await db.getLeaderboardSummary({ academic_year: '2nd Year' })
        const thirdYearUsers = await db.getLeaderboardSummary({ academic_year: '3rd Year' })
        
        setLeaderboardData({
          secondYear: secondYearUsers,
          thirdYear: thirdYearUsers,
          combined: allUsers
        })
        
      } catch (err) {
        console.error('Error fetching overall leaderboard:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchData = async () => {
      if (contestId) {
        await fetchContestLeaderboard()
      } else {
        await fetchOverallLeaderboard()
      }
    }
    
    fetchData()
  }, [contestId])


  const renderStats = () => {
    if (!contestId || !stats.overall) return null
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-3">📊 Contest Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-blue-600">🎯 Overall</h4>
            <p className="text-sm">Participated: {stats.overall?.target_users_found || 0}</p>
            <p className="text-sm">Success Rate: {stats.overall?.success_rate || 0}%</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-green-600">🎓 2nd Year</h4>
            <p className="text-sm">Participated: {stats.secondYear?.target_users_found || 0}</p>
            <p className="text-sm">Success Rate: {stats.secondYear?.success_rate || 0}%</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-purple-600">🎓 3rd Year</h4>
            <p className="text-sm">Participated: {stats.thirdYear?.target_users_found || 0}</p>
            <p className="text-sm">Success Rate: {stats.thirdYear?.success_rate || 0}%</p>
          </div>
        </div>
      </div>
    )
  }

  const renderUserRow = (user, index, showYear = false) => {
    const isContestView = contestId !== null
    const participationData = isContestView ? user : user.user_contest_results?.[0]
    
    return (
      <tr key={user.id || user.leetcode_id} className={`${participationData?.participated ? 'bg-green-50' : 'bg-red-50'} hover:bg-gray-100`}>
        <td className="px-4 py-2 text-center font-medium">
          {participationData?.participated ? participationData.rank || '-' : '-'}
        </td>
        <td className="px-4 py-2">
          <div>
            <div className="font-medium">{user.display_name || user.target_users?.display_name}</div>
            <div className="text-sm text-gray-500">@{user.leetcode_id || user.target_users?.leetcode_id}</div>
            {user.reg_no && <div className="text-xs text-gray-400">{user.reg_no}</div>}
          </div>
        </td>
        {showYear && (
          <td className="px-4 py-2 text-center">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              user.academic_year === '2nd Year' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {user.academic_year}
            </span>
          </td>
        )}
        <td className="px-4 py-2 text-center">
          {user.section && <span className="text-sm font-medium">{user.section}</span>}
        </td>
        <td className="px-4 py-2 text-center font-medium">
          {participationData?.participated ? (participationData.score || 0) : 0}
        </td>
        <td className="px-4 py-2 text-center">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            participationData?.participated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {participationData?.participated ? '✅ Yes' : '❌ No'}
          </span>
        </td>
      </tr>
    )
  }

  const renderLeaderboard = (data, title, yearColor = '') => (
    <div className="overflow-x-auto">
      <h3 className={`text-lg font-semibold mb-3 ${yearColor}`}>
        {title} ({data.length} students)
      </h3>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-center font-medium text-gray-700">Rank</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Student</th>
            {activeTab === 'combined' && <th className="px-4 py-2 text-center font-medium text-gray-700">Year</th>}
            <th className="px-4 py-2 text-center font-medium text-gray-700">Section</th>
            <th className="px-4 py-2 text-center font-medium text-gray-700">Score</th>
            <th className="px-4 py-2 text-center font-medium text-gray-700">Participated</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user, index) => renderUserRow(user, index, activeTab === 'combined'))}
        </tbody>
      </table>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error Loading Leaderboard</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          🔄 Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Contest Info */}
      {contestInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-blue-800">{contestInfo.title}</h2>
          <p className="text-blue-600">
            📅 {new Date(contestInfo.start_time).toLocaleDateString()} | 
            👥 {contestInfo.total_participants} total participants
          </p>
        </div>
      )}

      {/* Statistics */}
      {renderStats()}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('combined')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'combined'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🎯 Combined ({leaderboardData.combined.length})
          </button>
          <button
            onClick={() => setActiveTab('secondYear')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'secondYear'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🎓 2nd Year ({leaderboardData.secondYear.length})
          </button>
          <button
            onClick={() => setActiveTab('thirdYear')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'thirdYear'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🎓 3rd Year ({leaderboardData.thirdYear.length})
          </button>
        </nav>
      </div>

      {/* Leaderboard Content */}
      <div className="space-y-6">
        {activeTab === 'combined' && renderLeaderboard(leaderboardData.combined, '🎯 Combined Leaderboard')}
        {activeTab === 'secondYear' && renderLeaderboard(leaderboardData.secondYear, '🎓 2nd Year Leaderboard', 'text-green-600')}
        {activeTab === 'thirdYear' && renderLeaderboard(leaderboardData.thirdYear, '🎓 3rd Year Leaderboard', 'text-purple-600')}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">📊 Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Students</p>
            <p className="font-bold text-lg">{leaderboardData.combined.length}</p>
          </div>
          <div>
            <p className="text-gray-600">2nd Year</p>
            <p className="font-bold text-lg text-green-600">{leaderboardData.secondYear.length}</p>
          </div>
          <div>
            <p className="text-gray-600">3rd Year</p>
            <p className="font-bold text-lg text-purple-600">{leaderboardData.thirdYear.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Participated</p>
            <p className="font-bold text-lg text-blue-600">
              {leaderboardData.combined.filter(u => contestId ? u.participated : u.user_contest_results?.length > 0).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
