const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// GET all attendance records
router.get('/', (req, res) => {
  Attendance.getAll((err, results) => {
    if (err) {
      console.error('Error fetching attendance:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
    res.json(results);
  });
});

// POST new attendance record
router.post('/', (req, res) => {
  const { employeeName, employeeID, date, status } = req.body;

  if (!employeeName || !employeeID || !date || !status) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!['Present', 'Absent'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Present or Absent' });
  }

  Attendance.create({ employeeName, employeeID, date, status }, (err, results) => {
    if (err) {
      console.error('Error creating attendance:', err);
      return res.status(500).json({ error: 'Failed to create attendance record' });
    }
    res.status(201).json({ 
      message: 'Attendance recorded successfully', 
      id: results.insertId 
    });
  });
});

// DELETE attendance record
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  Attendance.delete(id, (err, results) => {
    if (err) {
      console.error('Error deleting attendance:', err);
      return res.status(500).json({ error: 'Failed to delete attendance record' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  });
});

// GET attendance by employee ID
router.get('/employee/:employeeID', (req, res) => {
  const { employeeID } = req.params;

  Attendance.getByEmployeeID(employeeID, (err, results) => {
    if (err) {
      console.error('Error fetching employee attendance:', err);
      return res.status(500).json({ error: 'Failed to fetch employee attendance' });
    }
    res.json(results);
  });
});

// GET attendance by date
router.get('/date/:date', (req, res) => {
  const { date } = req.params;

  Attendance.getByDate(date, (err, results) => {
    if (err) {
      console.error('Error fetching date attendance:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance for date' });
    }
    res.json(results);
  });
});

module.exports = router;