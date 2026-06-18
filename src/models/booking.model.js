const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  machineId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED'),
    defaultValue: 'PENDING'
  },
  bookingStatus: {
    type: DataTypes.STRING,
    defaultValue: 'ENQUIRY_PENDING'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  siteName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  siteAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  durationOfStay: {
    type: DataTypes.STRING,
    allowNull: true
  },
  workDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  operatorRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  siteContactName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  siteContactPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customerGst: {
    type: DataTypes.STRING,
    allowNull: true
  },
  billingBasis: {
    type: DataTypes.STRING, // 'HOURS', 'WEEKS', 'MONTHS'
    allowNull: true
  },
  billedQuantity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0
  },
  gstPercent: {
     type: DataTypes.DECIMAL(5, 2),
     defaultValue: 18.0
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0
  },
  grandTotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0
  }
});

module.exports = Booking;
