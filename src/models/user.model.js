const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'OWNER', 'DRIVER', 'CUSTOMER'),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: true // Only for DRIVER role
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gstNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  panNumber: {
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
  companyTagline: {
    type: DataTypes.STRING,
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
  assignedMachineId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  bankAccounts: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  phones: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  preferredLanguage: {
    type: DataTypes.STRING,
    defaultValue: 'en',
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
