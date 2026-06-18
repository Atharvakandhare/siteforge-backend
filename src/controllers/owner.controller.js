const { User, Machine, Attendance, Booking, Receipt } = require('../models');
const { Op } = require('sequelize');

exports.addDriver = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const driver = await User.create({
      name,
      email,
      password,
      role: 'DRIVER',
      phone,
      ownerId: req.user.id // Link to the current Owner
    });

    res.status(201).json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyDrivers = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const drivers = await User.findAll({ 
      where: { 
        ownerId: req.user.id,
        role: 'DRIVER'
      },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Machine,
          as: 'assignedMachine',
          attributes: ['id', 'name', 'type', 'dailyRate', 'hourlyRate']
        },
        {
          model: Attendance,
          as: 'attendanceLogs',
          where: {
            checkInTime: {
              [Op.between]: [todayStart, todayEnd]
            }
          },
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, drivers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.findAll({
      where: { role: 'CUSTOMER' },
      attributes: ['id', 'name', 'phone', 'email']
    });
    res.status(200).json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignMachineToDriver = async (req, res) => {
  try {
    const { id } = req.params; // Driver ID
    const { machineId } = req.body; // Assigned machine ID (can be null to unassign)

    const driver = await User.findOne({
      where: { id, ownerId: req.user.id, role: 'DRIVER' }
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (machineId) {
      // Check if machine exists and belongs to this owner
      const machine = await Machine.findOne({
        where: { id: machineId, ownerId: req.user.id }
      });
      if (!machine) {
        return res.status(404).json({ message: 'Machine not found or unauthorized' });
      }
    }

    driver.assignedMachineId = machineId;
    await driver.save();

    res.status(200).json({ 
      success: true, 
      message: 'Machine assignment updated successfully', 
      driver 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markDriverAttendance = async (req, res) => {
  try {
    const { driverId, status, date, location } = req.body;

    if (!driverId || !status) {
      return res.status(400).json({ message: 'driverId and status are required' });
    }

    // Verify driver belongs to this owner
    const driver = await User.findOne({
      where: { id: driverId, ownerId: req.user.id, role: 'DRIVER' }
    });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Get date range for the attendance record
    const targetDate = date ? new Date(date) : new Date();
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Check if attendance already exists for this day
    let attendance = await Attendance.findOne({
      where: {
        driverId,
        checkInTime: {
          [Op.between]: [dayStart, dayEnd]
        }
      }
    });

    if (attendance) {
      // Update existing record
      attendance.status = status;
      if (location) attendance.location = location;
      await attendance.save();
    } else {
      // Create new record
      attendance = await Attendance.create({
        driverId,
        status,
        checkInTime: targetDate,
        selfieUrl: null, // Optional for owner-marked attendance
        location: location || 'Marked by Owner'
      });
    }

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDriverAttendanceHistory = async (req, res) => {
  try {
    const { id } = req.params; // Driver ID

    const driver = await User.findOne({
      where: { id, ownerId: req.user.id, role: 'DRIVER' }
    });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const attendanceLogs = await Attendance.findAll({
      where: { driverId: id },
      order: [['checkInTime', 'DESC']]
    });

    res.status(200).json({ success: true, attendanceLogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDriverWorkHistory = async (req, res) => {
  try {
    const { id } = req.params; // Driver ID

    const driver = await User.findOne({
      where: { id, ownerId: req.user.id, role: 'DRIVER' },
      include: [
        {
          model: Machine,
          as: 'assignedMachine',
          attributes: ['id', 'name', 'type', 'hourlyRate', 'dailyRate']
        }
      ]
    });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    let bookings = [];
    let receipts = [];

    if (driver.assignedMachineId) {
      // Find all bookings for this machine
      bookings = await Booking.findAll({
        where: { machineId: driver.assignedMachineId },
        include: [{ model: User, as: 'customer', attributes: ['id', 'name', 'phone'] }],
        order: [['startDate', 'DESC']]
      });

      // Find all receipts matching the machine name
      if (driver.assignedMachine && driver.assignedMachine.name) {
        receipts = await Receipt.findAll({
          where: { 
            ownerId: req.user.id,
            machineName: driver.assignedMachine.name 
          },
          order: [['invoiceDate', 'DESC']]
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      assignedMachine: driver.assignedMachine,
      bookings,
      receipts 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
