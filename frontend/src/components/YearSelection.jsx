import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

const YearSelection = ({ mode, onSelectYear, onBack }) => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const result = await apiCall('/years');
        const currentYear = new Date().getFullYear();
        const allYears = [...new Set([...result, currentYear, currentYear - 1, currentYear + 1])];
        setYears(allYears.sort((a, b) => b - a));
      } catch (err) {
        console.error('Error loading years:', err);
        const currentYear = new Date().getFullYear();
        setYears([currentYear, currentYear - 1, currentYear + 1]);
      }
      setLoading(false);
    };
    loadYears();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading years...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="text-white hover:text-gray-200 transition-colors mr-4"
          >
            <i className="fas fa-arrow-left text-2xl"></i>
          </button>
          <h1 className="text-4xl font-bold text-white">
            Select Year - {mode === 'editor' ? 'Editor Mode' : 'Viewer Mode'}
          </h1>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {years.map((year) => (
            <div
              key={year}
              onClick={() => onSelectYear(year)}
              className="bg-white rounded-2xl p-8 text-center cursor-pointer card-hover shadow-lg"
            >
              <i className="fas fa-calendar-alt text-4xl text-blue-500 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-800">{year}</h3>
              <p className="text-gray-600 mt-2">
                {year === new Date().getFullYear() ? 'Current Year' : 'Previous Year'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YearSelection;