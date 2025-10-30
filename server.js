// =============================
// Employee Attendance Tracker Server
// =============================
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// =============================
// DATABASE CONNECTION
// =============================
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'turntable.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'abikPApQDKnSOtXeRuTNZTtfsvFmpcYd',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 28151
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL database');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS Attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employeeName VARCHAR(255) NOT NULL,
        employeeID VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        status ENUM('Present', 'Absent') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.query(createTableQuery, (err) => {
      if (err) console.error('❌ Error creating table:', err);
      else console.log('✅ Attendance table ready');
    });
  }
});

// =============================
// MIDDLEWARE
// =============================
app.use(cors());
app.use(express.json());

// =============================
// API ROUTES
// =============================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Employee Attendance API is running',
    database: db.state === 'connected' ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Get all attendance
app.get('/api/attendance', (req, res) => {
  db.query('SELECT * FROM Attendance ORDER BY date DESC, created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch attendance records' });
    res.json(results);
  });
});

// Add new attendance
app.post('/api/attendance', (req, res) => {
  const { employeeName, employeeID, date, status } = req.body;
  if (!employeeName || !employeeID || !date || !status)
    return res.status(400).json({ error: 'All fields are required' });

  if (!['Present', 'Absent'].includes(status))
    return res.status(400).json({ error: 'Status must be Present or Absent' });

  db.query(
    'INSERT INTO Attendance (employeeName, employeeID, date, status) VALUES (?, ?, ?, ?)',
    [employeeName, employeeID, date, status],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to create attendance record' });
      res.status(201).json({ message: 'Attendance recorded successfully', id: results.insertId });
    }
  );
});

// Delete attendance
app.delete('/api/attendance/:id', (req, res) => {
  db.query('DELETE FROM Attendance WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to delete attendance record' });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Attendance record deleted successfully' });
  });
});

// Get attendance by employee ID
app.get('/api/attendance/employee/:employeeID', (req, res) => {
  db.query('SELECT * FROM Attendance WHERE employeeID = ? ORDER BY date DESC', [req.params.employeeID], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch employee attendance' });
    res.json(results);
  });
});

// Get attendance by date
app.get('/api/attendance/date/:date', (req, res) => {
  db.query('SELECT * FROM Attendance WHERE date = ? ORDER BY employeeName', [req.params.date], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch attendance for date' });
    res.json(results);
  });
});

// Dashboard stats
app.get('/api/stats/dashboard', (req, res) => {
  const queries = {
    totalRecords: 'SELECT COUNT(*) as count FROM Attendance',
    presentToday: "SELECT COUNT(*) as count FROM Attendance WHERE date = CURDATE() AND status = 'Present'",
    absentToday: "SELECT COUNT(*) as count FROM Attendance WHERE date = CURDATE() AND status = 'Absent'",
    uniqueEmployees: 'SELECT COUNT(DISTINCT employeeID) as count FROM Attendance',
  };

  const results = {};
  let completed = 0;

  Object.keys(queries).forEach((key) => {
    db.query(queries[key], (err, result) => {
      results[key] = err ? { count: 0 } : result[0];
      completed++;
      if (completed === Object.keys(queries).length) {
        res.json({
          totalRecords: results.totalRecords.count,
          presentToday: results.presentToday.count,
          absentToday: results.absentToday.count,
          uniqueEmployees: results.uniqueEmployees.count,
        });
      }
    });
  });
});

// =============================
// FRONTEND SERVING
// =============================
const buildPath = path.join(__dirname, 'frontend', 'build');
const indexFile = path.join(buildPath, 'index.html');

// Serve React static build
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  console.log('✅ Serving React build folder');
} else {
  console.warn('⚠️  React build folder not found. Did you run npm run build?');
}

// Catch-all: serve React app or API info
app.get('*', (req, res) => {
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.json({
      message: 'Employee Attendance Tracker API is running!',
      note: 'Frontend build not found. Please run "npm run build" inside frontend/',
      endpoints: {
        health: '/api/health',
        getAll: '/api/attendance',
        post: 'POST /api/attendance',
        delete: 'DELETE /api/attendance/:id',
        stats: '/api/stats/dashboard',
      },
    });
  }
});

// =============================
// START SERVER
// =============================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
