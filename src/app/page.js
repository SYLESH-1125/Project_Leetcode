'use client'

import { useEffect, useState } from 'react'

export default function Page() {
  const [contests, setContests] = useState([])
  const [selectedContest, setSelectedContest] = useState(null)
  const [contestData, setContestData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [automationStatus, setAutomationStatus] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' })

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetch('/api/contests')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Check if data and contests array exist
        if (data && Array.isArray(data.contests)) {
          setContests(data.contests)
          
          if (data.contests.length > 0) {
            const latest = data.contests[0]
            setSelectedContest(latest.contest_id)
            await loadContestData(latest.contest_id)
          }
        } else {
          console.error('Invalid API response:', data)
          setContests([])
        }
      } catch (error) {
        console.error('Error loading contests:', error)
        setContests([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchContests()
  }, [])

  const loadContestData = async (contestId) => {
    try {
      const response = await fetch(`/api/contests/${contestId}`)
      const data = await response.json()
      setContestData(data)
    } catch (error) {
      console.error('Error loading contest data:', error)
    }
  }

  const triggerAutomation = async () => {
    setAutomationStatus('running')
    try {
      const response = await fetch('/api/automation/trigger', { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        setAutomationStatus('success')
        // Refresh the contests list
        const contestsResponse = await fetch('/api/contests')
        const contestsData = await contestsResponse.json()
        setContests(contestsData.contests)
      } else {
        setAutomationStatus('error')
      }
    } catch (error) {
      console.error('Automation failed:', error)
      setAutomationStatus('error')
    }
    
    setTimeout(() => setAutomationStatus(null), 5000)
  }

  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'asc'
    
    // For score column, default to descending order (highest first)
    if (key === 'score') {
      direction = 'desc'
      if (sortConfig.key === key && sortConfig.direction === 'desc') {
        direction = 'asc'
      }
    } else {
      // For other columns, use normal ascending/descending toggle
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc'
      }
    }
    
    setSortConfig({ key, direction })
  }

  const getSortedUsers = () => {
    if (!contestData) return { found: [], notFound: [] }
    
    const allUsers = [
      ...(contestData.found_users || []).map(user => ({ ...user, participated: true })),
      ...(contestData.not_found_users || []).map(user => ({ ...user, participated: false }))
    ]

    const sortedUsers = [...allUsers].sort((a, b) => {
      const { key, direction } = sortConfig
      let aValue = a[key]
      let bValue = b[key]

      // Handle special cases
      if (key === 'display_name' || key === 'leetcode_id') {
        aValue = (aValue || '').toLowerCase()
        bValue = (bValue || '').toLowerCase()
      } else if (key === 'rank' || key === 'score') {
        // Handle NULL values - put them at the end
        if (aValue === null && bValue === null) return 0
        if (aValue === null) return 1
        if (bValue === null) return -1
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (key === 'participated') {
        aValue = aValue ? 1 : 0
        bValue = bValue ? 1 : 0
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1
      }
      return 0
    })

    return {
      found: sortedUsers.filter(user => user.participated),
      notFound: sortedUsers.filter(user => !user.participated)
    }
  }

  const SortableHeader = ({ sortKey, children, className = "" }) => (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {children}
        <div className="flex flex-col">
          <span className={`text-xs ${sortConfig.key === sortKey && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-300'}`}>▲</span>
          <span className={`text-xs ${sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-300'}`}>▼</span>
        </div>
      </div>
    </th>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                🏆 LeetCode Contest Auto-Tracker
              </h1>
              <p className="text-gray-600 mt-2">
                Automated tracking for all Weekly & Biweekly contests
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={triggerAutomation}
                disabled={automationStatus === 'running'}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  automationStatus === 'running'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : automationStatus === 'success'
                    ? 'bg-green-500 text-white'
                    : automationStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {automationStatus === 'running' ? '🔄 Running...' : 
                 automationStatus === 'success' ? '✅ Success!' :
                 automationStatus === 'error' ? '❌ Failed' :
                 '🚀 Trigger Fetch'}
              </button>
              <div className="text-sm text-gray-500">
                📅 {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Contest Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Contest</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contests.map((contest) => (
              <div
                key={contest.contest_id}
                onClick={() => {
                  setSelectedContest(contest.contest_id)
                  loadContestData(contest.contest_id)
                }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedContest === contest.contest_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{contest.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    contest.contest_type === 'weekly' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {contest.contest_type}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(contest.start_time).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2 h-2 rounded-full ${
                    contest.data_fetched ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                  <span className="text-xs text-gray-600">
                    {contest.data_fetched ? 'Data Available' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contest Data Display */}
        {contestData && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{contestData?.summary?.target_users || 0}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Participated</p>
                    <p className="text-3xl font-bold text-green-600">{contestData?.summary?.found_users || 0}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Did Not Participate</p>
                    <p className="text-3xl font-bold text-red-600">{contestData?.summary?.not_found_users || 0}</p>
                  </div>
                  <div className="text-4xl">❌</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-3xl font-bold text-yellow-600">{contestData?.summary?.success_rate || '0%'}</p>
                  </div>
                  <div className="text-4xl">🎯</div>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    🏅 Contest {selectedContest} - {contestData?.contest?.title || 'Loading...'}
                  </h2>
                  <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                    📊 Sorted by: <span className="font-medium capitalize">{sortConfig.key.replace('_', ' ')}</span> 
                    <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {contestData?.contest?.start_time ? new Date(contestData.contest.start_time).toLocaleString() : 'Loading...'} | 
                  Total Participants: {contestData?.contest?.total_participants?.toLocaleString() || 'N/A'}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  💡 Click on any column header to sort the data
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <SortableHeader sortKey="display_name">
                        Name
                      </SortableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        LeetCode ID
                      </th>
                      <SortableHeader sortKey="participated">
                        Status
                      </SortableHeader>
                      <SortableHeader sortKey="rank">
                        Contest Rank
                      </SortableHeader>
                      <SortableHeader sortKey="score">
                        Score
                      </SortableHeader>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Render sorted users */}
                    {(() => {
                      const { found, notFound } = getSortedUsers()
                      const allSortedUsers = [...found, ...notFound]
                      
                      return allSortedUsers.map((user, index) => (
                        <tr key={user.leetcode_id} className={`hover:bg-gray-50 transition-colors ${!user.participated ? 'opacity-75' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                user.participated ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                <span className={`text-sm font-medium ${
                                  user.participated ? 'text-green-800' : 'text-gray-600'
                                }`}>{index + 1}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.display_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.original_leetcode_id || user.leetcode_id}</div>
                            {user.matched_variation && (
                              <div className="text-xs text-blue-600">→ {user.matched_variation}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.participated 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.participated ? '✅ Participated' : '❌ Did Not Participate'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.participated && user.rank ? (
                              <>
                                #{user.rank.toLocaleString()} / {contestData.contest.total_participants?.toLocaleString() || 'N/A'}
                                {contestData.contest.total_participants && (
                                  <div className="text-xs text-gray-500">
                                    {(((contestData.contest.total_participants - user.rank + 1) / contestData.contest.total_participants) * 100).toFixed(1)}% percentile
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.participated && user.score !== null ? user.score + ' pts' : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${
                              !user.participated || !user.score ? 'text-gray-500' :
                              user.score >= 18 ? 'text-green-600' :
                              user.score >= 15 ? 'text-blue-600' :
                              user.score >= 12 ? 'text-yellow-600' :
                              user.score >= 9 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              {!user.participated ? 'Did Not Participate' :
                               !user.score ? 'Did Not Score' :
                               user.score >= 18 ? '🌟 Excellent' :
                               user.score >= 15 ? '� Very Good' :
                               user.score >= 12 ? '� Good' :
                               user.score >= 9 ? '👌 Fair' : '📈 Needs Improvement'}
                            </span>
                          </td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contest Stats Footer */}
            {contestData.stats && (
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Contest Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{contestData.stats?.max_score || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Highest Score</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {contestData.stats?.avg_score && typeof contestData.stats.avg_score === 'number' 
                        ? contestData.stats.avg_score.toFixed(1) 
                        : contestData.stats?.avg_score || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-orange-600">{contestData.stats?.min_score || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Lowest Score</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-600">{contestData.contest.total_participants?.toLocaleString() || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Total Participants</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Automation Info */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">🤖 Automated Contest Tracking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">📅 Weekly Contests</h4>
              <p className="text-sm opacity-90">
                Every Sunday 8:00 AM - 9:30 AM IST<br/>
                Auto-fetch at 10:00 AM IST
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📅 Biweekly Contests</h4>
              <p className="text-sm opacity-90">
                Every 2nd Saturday 8:00 PM - 9:30 PM IST<br/>
                Auto-fetch at 11:00 PM IST
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm opacity-90">
            🔄 System automatically detects new contests and fetches data post-completion
          </div>
        </div>
      </div>
    </div>
  )
}
