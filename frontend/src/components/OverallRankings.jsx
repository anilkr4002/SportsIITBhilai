import React from 'react';

const OverallRankings = ({ rankings, mode, onUpdateRanking, getRankedTeams }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
        <h2 className="text-2xl font-bold">Overall Rankings</h2>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Team
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {getRankedTeams(rankings?.overall || {}).map((item) => (
            <tr key={item.team} className={item.rank <= 3 ? 'bg-yellow-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-2 rounded-full text-sm font-bold ${
                  item.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                  item.rank === 2 ? 'bg-gray-400 text-gray-900' :
                  item.rank === 3 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {item.rank === 1 ? '🥇' : 
                   item.rank === 2 ? '🥈' : 
                   item.rank === 3 ? '🥉' : 
                   `#${item.rank}`}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                {item.team}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {mode === 'editor' ? (
                  <input
                    type="number"
                    value={item.score}
                    onChange={(e) => onUpdateRanking(item.team, 'overall', e.target.value)}
                    className="w-24 border border-gray-300 rounded px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-yellow-500 font-bold"
                  />
                ) : (
                  <span className="font-bold text-xl text-blue-600">{item.score}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OverallRankings;