const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Machine = sequelize.define('Machine', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING, // e.g., Excavator, Crane
    allowNull: false
  },
  make: {
    type: DataTypes.STRING,
    allowNull: true
  },
  modelNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  dailyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  weeklyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  monthlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  securityDeposit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  capacity: {
    type: DataTypes.STRING, // e.g., 20 Tons, 5 kVA
    allowNull: true
  },
  fuelType: {
    type: DataTypes.STRING, // Diesel, Electric, etc.
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'BOOKED', 'MAINTENANCE'),
    defaultValue: 'AVAILABLE'
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rcNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  insuranceExpiry: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  pucExpiry: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  additionalParts: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  }
});

module.exports = Machine;
