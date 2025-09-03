import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

const SportDetail = ({ 
  sport, 
  year, 
  mode, 
  rankings, 
  teams, 
  onBack, 
  onUpdateRanking,
  getRankedTeams 
}) => {
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ name: '', team: '', position: '' });
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, [sport, year]);

  const loadPlayers = async () => {
    try {
      const result = await apiCall(`/players/${year}/${sport}`);
      setPlayers(result);
    } catch (err) {
      console.error('Error loading players:', err);
      setPlayers([]);
    }
  };

  const addPlayer = async () => {
    if (!newPlayer.name || !newPlayer.team) return;

    try {
      await apiCall(`/players/${year}/${sport}`, {
        method: 'POST',
        body: JSON.stringify(newPlayer)
      });
      setNewPlayer({ name: '', team: '', position: '' });
      setShowAddPlayer(false);
      loadPlayers();
    } catch (err) {
      console.error('Error adding player:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="text-blue-500 hover:text-blue-600 mr-4"
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-3xl font-bold text-gray-800">{sport} Rankings</h2>
        </div>
        {mode === 'editor' && (
          <button
            onClick={() => setShowAddPlayer(!showAddPlayer)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            <i className="fas fa-plus mr-2"></i>Add Player
          </button>
        )}
      </div>

      {/* Add Player Form */}
      {showAddPlayer && mode === 'editor' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Add New Player</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Player Name"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newPlayer.team}
              onChange={(e) => setNewPlayer({...newPlayer, team: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Team</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Position (optional)"
              value={newPlayer.position}
              onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={addPlayer}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Add Player
            </button>
            <button
              onClick={() => setShowAddPlayer(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
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
                Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getRankedTeams(rankings?.sports?.[sport] || {}).map((item) => (
              <tr key={item.team}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                    item.rank === 2 ? 'bg-gray-100 text-gray-800' :
                    item.rank === 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    #{item.rank}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.team}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {mode === 'editor' ? (
                    <input
                      type="number"
                      value={item.score}
                      onChange={(e) => onUpdateRanking(item.team, sport, e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="font-semibold">{item.score}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Players List */}
      {players.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Players</h3>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800">{player.name}</h4>
                  <p className="text-sm text-gray-600">{player.team}</p>
                  {player.position && (
                    <p className="text-xs text-gray-500">{player.position}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportDetail;