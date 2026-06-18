const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Receipt = sequelize.define('Receipt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customerGst: {
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
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  invoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  period: {
    type: DataTypes.STRING,
    allowNull: true
  },
  withGst: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  machineName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  workedDuration: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  billingBasis: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  gstAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0
  },
  grandTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PAID', 'OVERDUE', 'PARTIALLY_PAID'),
    defaultValue: 'OVERDUE'
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0
  },
  remainingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  // Snapped owner details
  companyName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companyTagline: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companyAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companyPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ownerGst: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ownerPan: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankBranch: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankAccountNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankIfscCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  companyLogo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companyStamp: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ownerSignature: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isConsolidated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  consolidatedSites: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  additionalParts: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  transportCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0
  }
});

module.exports = Receipt;
