const db = require('../config/db');

class Attendance {
  static getAll(callback) {
    const query = 'SELECT * FROM Attendance ORDER BY date DESC, created_at DESC';
    db.query(query, callback);
  }

  static create(attendanceData, callback) {
    const { employeeName, employeeID, date, status } = attendanceData;
    const query = 'INSERT INTO Attendance (employeeName, employeeID, date, status) VALUES (?, ?, ?, ?)';
    db.query(query, [employeeName, employeeID, date, status], callback);
  }

  static delete(id, callback) {
    const query = 'DELETE FROM Attendance WHERE id = ?';
    db.query(query, [id], callback);
  }

  static getByEmployeeID(employeeID, callback) {
    const query = 'SELECT * FROM Attendance WHERE employeeID = ? ORDER BY date DESC';
    db.query(query, [employeeID], callback);
  }

  static getByDate(date, callback) {
    const query = 'SELECT * FROM Attendance WHERE date = ? ORDER BY employeeName';
    db.query(query, [date], callback);
  }
}

module.exports = Attendance;