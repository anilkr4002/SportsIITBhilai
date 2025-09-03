import React from 'react';

const Home = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
        <div className="mb-8">
          <i className="fas fa-trophy text-6xl text-yellow-500 mb-4"></i>
          <h1 className="text-5xl font-bold text-gray-800 mb-2">PRAYATNA</h1>
          <p className="text-xl text-gray-600">IntraIIT Sports Competition</p>
          <p className="text-lg text-gray-500 mt-2">8 Teams • 7+ Sports • Ultimate Glory</p>
        </div>
        
        <div className="space-y-6">
          <button
            onClick={() => onSelectMode('viewer')}
            className="w-full py-4 px-8 bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold rounded-xl transition-all duration-300 card-hover"
          >
            <i className="fas fa-eye mr-3"></i>
            Enter as Viewer
          </button>
          
          <button
            onClick={() => onSelectMode('editor')}
            className="w-full py-4 px-8 bg-purple-500 hover:bg-purple-600 text-white text-xl font-semibold rounded-xl transition-all duration-300 card-hover"
          >
            <i className="fas fa-edit mr-3"></i>
            Enter as Editor
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;