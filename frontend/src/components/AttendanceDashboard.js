import React, { useState, useEffect, useCallback } from 'react';
import { attendanceAPI } from '../services/api';

const AttendanceDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      if (filterDate) {
        response = await attendanceAPI.getByDate(filterDate);
      } else {
        response = await attendanceAPI.getAll();
      }
      
      let filteredData = response.data;
      
      if (searchTerm) {
        filteredData = filteredData.filter(record =>
          record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.employeeID.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort data
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
      
      setAttendance(filteredData);
    } catch (err) {
      setError('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  }, [filterDate, searchTerm, sortConfig]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await attendanceAPI.delete(id);
        setError('');
        fetchAttendance();
      } catch (err) {
        setError('Failed to delete record');
      }
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const SortIcon = ({ column }) => (
    <span className="sort-icon">
      {sortConfig.key === column && (
        sortConfig.direction === 'asc' ? '↑' : '↓'
      )}
    </span>
  );

  if (loading) return (
    <div className="dashboard-loading">
      <div className="loading-spinner"></div>
      <p>Loading attendance records...</p>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Header Card */}
      <div className="header-card">
        <div className="header-content">
          <div className="title-section">
            <h1 className="dashboard-title">Attendance Dashboard</h1>
            <p className="dashboard-subtitle">
              {attendance.length} record{attendance.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="date-display">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="filter-card">
        <div className="search-section">
          <div className="search-container">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search employees by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="filter-section">
          <label className="filter-label">Filter by Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="date-filter"
          />
        </div>
      </div>

      {error && (
        <div className="error-card">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="error-icon">
            <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {error}
        </div>
      )}

      {attendance.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" 
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>No attendance records found</h3>
          <p>Try adjusting your search criteria or add new records.</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('employeeName')} className="sortable">
                    <div className="th-content">
                      Employee Name
                      <SortIcon column="employeeName" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('employeeID')} className="sortable">
                    <div className="th-content">
                      Employee ID
                      <SortIcon column="employeeID" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('date')} className="sortable">
                    <div className="th-content">
                      Date
                      <SortIcon column="date" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('status')} className="sortable">
                    <div className="th-content">
                      Status
                      <SortIcon column="status" />
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id} className="table-row">
                    <td className="employee-name">
                      <div className="employee-info">
                        <div className="avatar">
                          {record.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="name-details">
                          <span className="name">{record.employeeName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="employee-id">{record.employeeID}</td>
                    <td className="attendance-date">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td>
                      <span className={`status-badge ${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDelete(record.id)}
                        className="delete-btn"
                        title="Delete record"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" 
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;