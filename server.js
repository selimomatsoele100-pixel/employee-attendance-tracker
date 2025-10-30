const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Database connection
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
    database: db.state === 'connected' ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// GET all attendance records
app.get('/api/attendance', (req, res) => {
  const query = 'SELECT * FROM Attendance ORDER BY date DESC, created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching attendance:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance records' });
    }
    res.json(results);
  });
});

// POST new attendance record
app.post('/api/attendance', (req, res) => {
  const { employeeName, employeeID, date, status } = req.body;

  if (!employeeName || !employeeID || !date || !status) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!['Present', 'Absent'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Present or Absent' });
  }

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

// DELETE attendance record
app.delete('/api/attendance/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Attendance WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
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
app.get('/api/attendance/employee/:employeeID', (req, res) => {
  const { employeeID } = req.params;
  const query = 'SELECT * FROM Attendance WHERE employeeID = ? ORDER BY date DESC';
  
  db.query(query, [employeeID], (err, results) => {
    if (err) {
      console.error('Error fetching employee attendance:', err);
      return res.status(500).json({ error: 'Failed to fetch employee attendance' });
    }
    res.json(results);
  });
});

// GET attendance by date
app.get('/api/attendance/date/:date', (req, res) => {
  const { date } = req.params;
  const query = 'SELECT * FROM Attendance WHERE date = ? ORDER BY employeeName';
  
  db.query(query, [date], (err, results) => {
    if (err) {
      console.error('Error fetching date attendance:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance for date' });
    }
    res.json(results);
  });
});

// Stats endpoint
app.get('/api/stats/dashboard', (req, res) => {
  const queries = {
    totalRecords: 'SELECT COUNT(*) as count FROM Attendance',
    presentToday: `SELECT COUNT(*) as count FROM Attendance WHERE date = CURDATE() AND status = 'Present'`,
    absentToday: `SELECT COUNT(*) as count FROM Attendance WHERE date = CURDATE() AND status = 'Absent'`,
    uniqueEmployees: 'SELECT COUNT(DISTINCT employeeID) as count FROM Attendance'
  };

  const results = {};
  let completed = 0;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, result) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        results[key] = { count: 0 };
      } else {
        results[key] = result[0];
      }
      
      completed++;
      if (completed === Object.keys(queries).length) {
        res.json({
          totalRecords: results.totalRecords.count,
          presentToday: results.presentToday.count,
          absentToday: results.absentToday.count,
          uniqueEmployees: results.uniqueEmployees.count
        });
      }
    });
  });
});

// Serve static files from React public folder (for development)
app.use('/static', express.static(path.join(__dirname, 'frontend/public')));

// Serve React build with better error handling
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Main route - serve React app or fallback to public HTML
app.get('*', (req, res) => {
  const buildPath = path.join(__dirname, 'frontend/build/index.html');
  const publicPath = path.join(__dirname, 'frontend/public/index.html');
  
  // First try to serve React build
  if (fs.existsSync(buildPath)) {
    console.log('✅ Serving React build');
    res.sendFile(buildPath);
  } 
  // If no build, try to serve from public folder
  else if (fs.existsSync(publicPath)) {
    console.log('✅ Serving from public folder');
    res.sendFile(publicPath);
  }
  // Fallback to API message
  else {
    console.log('⚠️  No frontend files found, showing API info');
    res.json({ 
      message: 'Employee Attendance Tracker API is running!',
      note: 'Frontend files not found. Check build process.',
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  
  // Check what frontend files are available
  const buildPath = path.join(__dirname, 'frontend/build');
  const publicPath = path.join(__dirname, 'frontend/public');
  
  if (fs.existsSync(buildPath)) {
    console.log('✅ React build folder found');
  }
  if (fs.existsSync(publicPath)) {
    console.log('✅ Public folder found');
    const files = fs.readdirSync(publicPath);
    console.log(`📁 Public files: ${files.join(', ')}`);
  }
});