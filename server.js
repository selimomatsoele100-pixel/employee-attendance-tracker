const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Database connection - FIXED
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'turntable.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'abikPApQDKnSOtXeRuTNZTtfsvFmpcYd',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 28151
});

// Connect to database
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
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('✅ Attendance table ready');
      }
    });
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Employee Attendance API is running',
    database: db.state === 'connected' ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/attendance', (req, res) => {
  const query = 'SELECT * FROM Attendance ORDER BY date DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching attendance:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
    res.json(results);
  });
});

app.post('/api/attendance', (req, res) => {
  const { employeeName, employeeID, date, status } = req.body;
  const query = 'INSERT INTO Attendance (employeeName, employeeID, date, status) VALUES (?, ?, ?, ?)';
  db.query(query, [employeeName, employeeID, date, status], (err, results) => {
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

// Serve React build with error handling
app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get('*', (req, res) => {
  const buildPath = path.join(__dirname, 'frontend/build/index.html');
  if (fs.existsSync(buildPath)) {
    res.sendFile(buildPath);
  } else {
    res.json({ 
      message: 'Employee Attendance Tracker API is running!',
      note: 'Frontend build in progress...',
      endpoints: {
        health: '/api/health',
        getAttendance: '/api/attendance',
        addAttendance: 'POST /api/attendance',
        deleteAttendance: 'DELETE /api/attendance/:id',
        stats: '/api/stats/dashboard'
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});