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

  const handleRefresh = () => {
    setFilterDate('');
    setSearchTerm('');
    setSortConfig({ key: 'date', direction: 'desc' });
  };

  const exportToCSV = () => {
    const headers = ['Employee Name', 'Employee ID', 'Date', 'Status'];
    const csvData = attendance.map(record => [
      record.employeeName,
      record.employeeID,
      new Date(record.date).toLocaleDateString(),
      record.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h2 className="dashboard-title">Attendance Dashboard</h2>
          <p className="dashboard-subtitle">
            {attendance.length} record{attendance.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="dashboard-actions">
          <button onClick={exportToCSV} className="action-button export-button">
            Export CSV
          </button>
          <button onClick={handleRefresh} className="action-button refresh-button">
            Refresh
          </button>
        </div>
      </div>

      <div className="filter-container">
        <div className="filter-group search-group">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="date-filter"
          />
        </div>
      </div>

      {error && <div className="message message-error">{error}</div>}

      {attendance.length === 0 ? (
        <div className="empty-state">
          <h3>No attendance records found</h3>
          <p>Try adjusting your search criteria or add new records.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('employeeName')} className="sortable">
                  Employee Name <SortIcon column="employeeName" />
                </th>
                <th onClick={() => handleSort('employeeID')} className="sortable">
                  Employee ID <SortIcon column="employeeID" />
                </th>
                <th onClick={() => handleSort('date')} className="sortable">
                  Date <SortIcon column="date" />
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status <SortIcon column="status" />
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id} className="table-row">
                  <td className="employee-name">
                    <div className="avatar">
                      {record.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    {record.employeeName}
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
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;