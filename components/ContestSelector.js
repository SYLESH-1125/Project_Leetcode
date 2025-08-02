// components/ContestSelector.js - Dynamic contest selection component
'use client'

export default function ContestSelector({ contests, selectedContest, onContestSelect, contestData }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">📋 Select Contest</h2>
        <div className="text-sm text-gray-500">
          {contests.length} contests with dynamic tables
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contests.map((contest) => (
          <div
            key={contest.contest_id}
            onClick={() => onContestSelect(contest.contest_id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              selectedContest === contest.contest_id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 truncate">{contest.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                contest.contest_type === 'weekly' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {contest.contest_type}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-2">
              📅 {new Date(contest.start_time).toLocaleDateString()}
            </p>
            
            {contest.table_name && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  🗄️ {contest.table_name}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs">
              <span className={`flex items-center gap-1 ${
                contest.data_fetched ? 'text-green-600' : 'text-orange-600'
              }`}>
                {contest.data_fetched ? '✅ Processed' : '⏳ Pending'}
              </span>
              
              {contest.total_participants && (
                <span className="text-gray-500">
                  👥 {contest.total_participants.toLocaleString()}
                </span>
              )}
            </div>
            
            {selectedContest === contest.contest_id && contestData && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">
                      {contestData.summary?.found_users || 0}
                    </div>
                    <div className="text-gray-500">Participated</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">
                      {contestData.summary?.not_found_users || 0}
                    </div>
                    <div className="text-gray-500">Absent</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {contests.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium mb-2">No Contests Found</h3>
          <p className="text-sm">Contests will appear here after automation runs</p>
        </div>
      )}
    </div>
  )
}
