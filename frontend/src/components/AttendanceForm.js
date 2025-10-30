import React, { useState } from 'react';
import { attendanceAPI } from '../services/api';

const AttendanceForm = ({ onAttendanceAdded }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeID: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (message || error) {
      setMessage('');
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    if (!formData.employeeName.trim() || !formData.employeeID.trim() || !formData.date) {
      setError('All fields are required');
      setIsSubmitting(false);
      return;
    }

    if (formData.employeeName.length < 2) {
      setError('Employee name must be at least 2 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      await attendanceAPI.create(formData);
      setMessage('Attendance recorded successfully!');
      setFormData({
        employeeName: '',
        employeeID: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present'
      });
      
      if (onAttendanceAdded) {
        setTimeout(() => {
          onAttendanceAdded();
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">Record New Attendance</h2>
        <p className="form-subtitle">Add employee attendance records to the system</p>
      </div>

      {message && (
        <div className="message message-success">
          {message}
        </div>
      )}
      
      {error && (
        <div className="message message-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="attendance-form">
        <div className="form-group">
          <label htmlFor="employeeName" className="form-label">
            Employee Name
          </label>
          <input
            type="text"
            id="employeeName"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter full name"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="employeeID" className="form-label">
            Employee ID
          </label>
          <input
            type="text"
            id="employeeID"
            name="employeeID"
            value={formData.employeeID}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter employee ID"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Attendance Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
              disabled={isSubmitting}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        <button 
          type="submit" 
          className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="spinner"></div>
              Recording...
            </>
          ) : (
            'Record Attendance'
          )}
        </button>
      </form>
    </div>
  );
};

export default AttendanceForm;