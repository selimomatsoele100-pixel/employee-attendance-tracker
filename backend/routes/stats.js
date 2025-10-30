const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get dashboard statistics
router.get('/dashboard', (req, res) => {
  const queries = {
    totalRecords: 'SELECT COUNT(*) as count FROM Attendance',
    presentToday: `SELECT COUNT(*) as count FROM Attendance WHERE date = CURDATE() AND status = 'Present'`,
    absentToday: `SELECT COUNT(*) as count FROM Attendance WHERE date = CURDATE() AND status = 'Absent'`,
    uniqueEmployees: 'SELECT COUNT(DISTINCT employeeID) as count FROM Attendance',
    recentActivity: 'SELECT * FROM Attendance ORDER BY created_at DESC LIMIT 5'
  };

  const results = {};
  let completed = 0;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, result) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        results[key] = null;
      } else {
        results[key] = result;
      }
      
      completed++;
      if (completed === Object.keys(queries).length) {
        res.json({
          totalRecords: results.totalRecords[0].count,
          presentToday: results.presentToday[0].count,
          absentToday: results.absentToday[0].count,
          uniqueEmployees: results.uniqueEmployees[0].count,
          recentActivity: results.recentActivity
        });
      }
    });
  });
});

// Get monthly attendance trends
router.get('/monthly-trends', (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(date, '%Y-%m') as month,
      status,
      COUNT(*) as count
    FROM Attendance 
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY month, status
    ORDER BY month DESC, status
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching monthly trends:', err);
      return res.status(500).json({ error: 'Failed to fetch trends' });
    }
    res.json(results);
  });
});

module.exports = router;