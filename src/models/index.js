const User = require('./user.model');
const Machine = require('./machine.model');
const Attendance = require('./attendance.model');
const Booking = require('./booking.model');
const Receipt = require('./receipt.model');

// User & Machine (One-to-Many: Owner -> Machines)
User.hasMany(Machine, { foreignKey: 'ownerId', as: 'ownedMachines' });
Machine.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Owner & Driver (One-to-Many: Owner -> Drivers)
User.hasMany(User, { foreignKey: 'ownerId', as: 'drivers', constraints: false });
User.belongsTo(User, { foreignKey: 'ownerId', as: 'owner', constraints: false });

// Driver & Assigned Machine (Many-to-One / One-to-One: Driver -> Assigned Machine)
User.belongsTo(Machine, { foreignKey: 'assignedMachineId', as: 'assignedMachine' });
Machine.hasOne(User, { foreignKey: 'assignedMachineId', as: 'assignedDriver' });

// User & Attendance (One-to-Many: Driver -> Attendance logs)
User.hasMany(Attendance, { foreignKey: 'driverId', as: 'attendanceLogs' });
Attendance.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

// Bookings Associations
User.hasMany(Booking, { foreignKey: 'customerId', as: 'myBookings' });
Booking.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

User.hasMany(Booking, { foreignKey: 'ownerId', as: 'receivedBookings' });
Booking.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Booking, { foreignKey: 'driverId', as: 'assignedTasks' });
Booking.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

Machine.hasMany(Booking, { foreignKey: 'machineId', as: 'bookingHistory' });
Booking.belongsTo(Machine, { foreignKey: 'machineId', as: 'machine' });

// Receipt Associations
User.hasMany(Receipt, { foreignKey: 'ownerId', as: 'receipts' });
Receipt.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Receipt, { foreignKey: 'customerId', as: 'receivedReceipts' });
Receipt.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

module.exports = {
  User,
  Machine,
  Attendance,
  Booking,
  Receipt
};
