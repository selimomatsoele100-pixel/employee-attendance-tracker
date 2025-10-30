import React, { useState, useEffect } from 'react';
import { statsAPI } from '../services/api';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsAPI.getDashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="stat-card loading">
            <div className="stat-skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Records',
      value: stats?.totalRecords || 0,
      color: 'var(--amethyst)',
      gradient: 'linear-gradient(135deg, #9b59b6, #8e44ad)'
    },
    {
      title: 'Present Today',
      value: stats?.presentToday || 0,
      color: 'var(--emerald)',
      gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)'
    },
    {
      title: 'Absent Today',
      value: stats?.absentToday || 0,
      color: 'var(--coral)',
      gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)'
    },
    {
      title: 'Unique Employees',
      value: stats?.uniqueEmployees || 0,
      color: 'var(--sunflower)',
      gradient: 'linear-gradient(135deg, #f1c40f, #f39c12)'
    }
  ];

  return (
    <div className="stats-grid">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className="stat-card"
          style={{ background: stat.gradient }}
        >
          <div className="stat-content">
            <h3 className="stat-value">{stat.value}</h3>
            <p className="stat-title">{stat.title}</p>
          </div>
          <div className="stat-decoration"></div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;