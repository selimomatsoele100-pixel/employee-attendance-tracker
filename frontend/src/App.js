import React, { useState } from 'react';
import AttendanceForm from './components/AttendanceForm';
import AttendanceDashboard from './components/AttendanceDashboard';
import DashboardStats from './components/DashboardStats';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAttendanceAdded = () => {
    setRefreshKey(prev => prev + 1);
    setCurrentView('dashboard');
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'form', label: 'Record Attendance' },
    { key: 'reports', label: 'Reports' },
  ];

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-text">
              <h1>AttendancePro</h1>
              <span>Employee Management System</span>
            </div>
          </div>
          
          <nav className="main-nav">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.key)}
                className={`nav-item ${currentView === item.key ? 'active' : ''}`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="header-actions">
            <div className="user-profile">
              <div className="user-avatar">HR</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {currentView === 'dashboard' && (
          <div className="dashboard-view">
            <DashboardStats />
            <AttendanceDashboard key={refreshKey} />
          </div>
        )}
        
        {currentView === 'form' && (
          <AttendanceForm onAttendanceAdded={handleAttendanceAdded} />
        )}
        
        {currentView === 'reports' && (
          <div className="reports-view">
            <div className="coming-soon">
              <h2>Advanced Reports</h2>
              <p>Detailed analytics and reporting features coming soon!</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2024 AttendancePro. Built with React & Node.js</p>
          <div className="footer-links">
            <span>v1.0.0</span>
            <span>•</span>
            <span>HR System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;