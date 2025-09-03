import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Login from './components/Login';
import YearSelection from './components/YearSelection';
import Dashboard from './components/Dashboard';
import { apiCall } from './utils/api';
import './App.css';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [mode, setMode] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Check authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await apiCall('/auth/check');
        if (result.authenticated) {
          setIsAuthenticated(true);
          setUserRole(result.role);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    };
    checkAuth();
  }, []);

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'editor') {
      if (isAuthenticated) {
        setCurrentView('yearSelection');
      } else {
        setCurrentView('login');
      }
    } else {
      setCurrentView('yearSelection');
    }
  };

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setCurrentView('yearSelection');
  };

  const handleLogout = async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentView('home');
    setMode(null);
    setSelectedYear(null);
  };

  const handleSelectYear = (year) => {
    setSelectedYear(year);
    setCurrentView('dashboard');
  };

  const handleBack = () => {
    if (currentView === 'dashboard') {
      setCurrentView('yearSelection');
      setSelectedYear(null);
    } else if (currentView === 'yearSelection') {
      if (mode === 'editor' && isAuthenticated) {
        handleLogout();
      } else {
        setCurrentView('home');
        setMode(null);
      }
    } else if (currentView === 'login') {
      setCurrentView('home');
      setMode(null);
    } else {
      setCurrentView('home');
      setMode(null);
      setSelectedYear(null);
    }
  };

  return (
    <div className="App">
      {/* Logout button for authenticated users */}
      {isAuthenticated && currentView !== 'home' && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </button>
        </div>
      )}

      {/* Render current view */}
      {currentView === 'home' && (
        <Home onSelectMode={handleSelectMode} />
      )}
      
      {currentView === 'login' && (
        <Login onLogin={handleLogin} onBack={handleBack} />
      )}
      
      {currentView === 'yearSelection' && (
        <YearSelection 
          mode={mode} 
          onSelectYear={handleSelectYear} 
          onBack={handleBack} 
        />
      )}
      
      {currentView === 'dashboard' && (
        <Dashboard 
          mode={mode} 
          year={selectedYear} 
          onBack={handleBack} 
        />
      )}
    </div>
  );
};

export default App;