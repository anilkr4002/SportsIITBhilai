import React, { useState, useEffect } from 'react';
import OverallRankings from './OverallRankings';
import SportsGrid from './SportsGrid';
import SportDetail from './SportDetail';
import { apiCall } from '../utils/api';

const Dashboard = ({ mode, year, onBack }) => {
  const [rankings, setRankings] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [loading, setLoading] = useState(true);

  const teams = [
    'Silver Falcons', 'Black Archers', 'Desert Hawks', 'Gladiators',
    'Tridents', 'Warlords', 'Snow Leopard', 'Firebirds'
  ];
  
  const sports = [
    'Football', 'Cricket', 'Basketball', 'Badminton',
    'Table Tennis', 'Yoga', 'Chess','Athletics','Volleyball'
  ];

  const loadRankings = async () => {
    try {
      const result = await apiCall(`/rankings/${year}`);
      setRankings(result);
    } catch (err) {
      console.error('Error loading rankings:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRankings();
  }, [year]);

  const updateRanking = async (team, sport, newScore) => {
    if (mode !== 'editor') return;

    const updatedRankings = { ...rankings };
    if (sport === 'overall') {
      updatedRankings.overall[team] = parseFloat(newScore) || 0;
    } else {
      updatedRankings.sports[sport][team] = parseFloat(newScore) || 0;
    }

    try {
      await apiCall(`/rankings/${year}`, {
        method: 'PUT',
        body: JSON.stringify(updatedRankings)
      });
      setRankings(updatedRankings);
    } catch (err) {
      console.error('Error updating rankings:', err);
    }
  };

  const getRankedTeams = (sportData) => {
    return Object.entries(sportData)
      .sort(([,a], [,b]) => b - a)
      .map(([team, score], index) => ({ team, score, rank: index + 1 }));
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors mr-4"
            >
              <i className="fas fa-arrow-left text-2xl"></i>
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Prayatna {year}
              </h1>
              <p className="text-lg text-gray-600">
                {mode === 'editor' ? 'Editor Mode - You can edit data' : 'Viewer Mode - Read only'}
              </p>
            </div>
          </div>
        </div>

        {selectedSport ? (
          /* Sport Detail View */
          <SportDetail
            sport={selectedSport}
            year={year}
            mode={mode}
            rankings={rankings}
            teams={teams}
            onBack={() => setSelectedSport(null)}
            onUpdateRanking={updateRanking}
            getRankedTeams={getRankedTeams}
          />
        ) : (
          /* Main Dashboard View */
          <div>
            {/* Overall Rankings */}
            <OverallRankings
              rankings={rankings}
              mode={mode}
              onUpdateRanking={updateRanking}
              getRankedTeams={getRankedTeams}
            />

            {/* Sports Grid */}
            <SportsGrid
              sports={sports}
              rankings={rankings}
              onSelectSport={setSelectedSport}
              getRankedTeams={getRankedTeams}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;