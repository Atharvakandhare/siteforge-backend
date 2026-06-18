const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  selfieUrl: {
    type: DataTypes.STRING,
    allowNull: true // Optional when marked by owner
  },
  checkInTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  checkOutTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PRESENT', 'ABSENT', 'LATE'),
    defaultValue: 'PRESENT'
  },
  location: {
    type: DataTypes.STRING, // Store coords or address
    allowNull: true
  }
});

module.exports = Attendance;
