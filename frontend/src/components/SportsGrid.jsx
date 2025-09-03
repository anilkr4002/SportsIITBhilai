// import React from 'react';

// const SportsGrid = ({ sports, rankings, onSelectSport, getRankedTeams }) => {
//   const getSportIcon = (sport) => {
//     const iconMap = {
//       'Football': 'fa-futbol',
//       'Cricket': 'fa-baseball-ball',
//       'Basketball': 'fa-basketball-ball',
//       'Badminton': 'fa-shuttlecock',
//       'Table Tennis': 'fa-table-tennis',
//       'Yoga': 'fa-spa',
//       'Chess': 'fa-chess',
//     //   'Athlete':'fa-athlete'
//     };
//     return iconMap[sport] || 'fa-trophy';
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">Sports Rankings</h2>
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {sports.map((sport) => (
//           <div
//             key={sport}
//             onClick={() => onSelectSport(sport)}
//             className="sport-card rounded-2xl p-6 text-white cursor-pointer card-hover shadow-lg"
//           >
//             <div className="text-center">
//               <i className={`fas ${getSportIcon(sport)} text-4xl mb-4`}></i>
//               <h3 className="text-xl font-bold mb-2">{sport}</h3>
              
//               {/* Show top 3 teams */}
//               <div className="space-y-1">
//                 {getRankedTeams(rankings?.sports?.[sport] || {}).slice(0, 3).map((item, idx) => (
//                   <div key={item.team} className="text-sm">
//                     <span className="opacity-90">
//                       {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {item.team.split(' ')[1]}
//                     </span>
//                     <span className="ml-2 font-bold">{item.score}</span>
//                   </div>
//                 ))}
//               </div>
              
//               <div className="mt-4 text-sm opacity-75">
//                 Click to view details →
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SportsGrid;

import React from 'react';

const SportsGrid = ({ sports, rankings, onSelectSport, getRankedTeams }) => {
  const getSportIcon = (sport) => {
    const iconMap = {
      'Football': 'fa-futbol',
      'Cricket': 'fa-baseball-ball',
      'Basketball': 'fa-basketball-ball',
      'Badminton': 'fa-shuttlecock',
      'Table Tennis': 'fa-table-tennis',
      'Yoga': 'fa-spa',
      'Chess': 'fa-chess',
      'Athletics': 'fa-running',  // ✅ Athletics added here
      'Volleyball': 'fa-volleyball-ball'
    };
    return iconMap[sport] || 'fa-trophy';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sports Rankings</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sports.map((sport) => (
          <div
            key={sport}
            onClick={() => onSelectSport(sport)}
            className="sport-card rounded-2xl p-6 text-white cursor-pointer card-hover shadow-lg"
          >
            <div className="text-center">
              <i className={`fas ${getSportIcon(sport)} text-4xl mb-4`}></i>
              <h3 className="text-xl font-bold mb-2">{sport}</h3>
              
              {/* Show top 3 teams */}
              <div className="space-y-1">
                {getRankedTeams(rankings?.sports?.[sport] || {}).slice(0, 3).map((item, idx) => (
                  <div key={item.team} className="text-sm">
                    <span className="opacity-90">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} {item.team.split(' ')[1]}
                    </span>
                    <span className="ml-2 font-bold">{item.score}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-sm opacity-75">
                Click to view details →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SportsGrid;
