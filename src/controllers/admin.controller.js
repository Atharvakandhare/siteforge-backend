const { User, Machine, Booking, Receipt } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardData = async (req, res) => {
  try {
    const totalOwners = await User.count({ where: { role: 'OWNER' } });
    const totalDrivers = await User.count({ where: { role: 'DRIVER' } });
    const totalCustomers = await User.count({ where: { role: 'CUSTOMER' } });
    const totalMachines = await Machine.count();
    const totalBookings = await Booking.count();

    const totalRevenue = (await Receipt.sum('grandTotal')) || 0;
    const totalCollected = (await Receipt.sum('amountPaid')) || 0;
    const totalPending = (await Receipt.sum('remainingAmount')) || 0;

    // Fetch recent events to compile a chronological activity list
    const recentUsers = await User.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'role', 'createdAt']
    });

    const recentBookings = await Booking.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'createdAt'],
      include: [
        { model: User, as: 'customer', attributes: ['name'] },
        { model: Machine, as: 'machine', attributes: ['name'] }
      ]
    });

    const recentReceipts = await Receipt.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'invoiceNumber', 'customerName', 'machineName', 'grandTotal', 'createdAt']
    });

    // Merge activities into a combined array and sort by date descending
    const activities = [];

    recentUsers.forEach(u => {
      // Do not list Admin registrations
      if (u.role !== 'ADMIN') {
        activities.push({
          id: `user-${u.id}`,
          type: 'USER',
          text: `New ${u.role.toLowerCase()} registered: ${u.name}`,
          date: u.createdAt
        });
      }
    });

    recentBookings.forEach(b => {
      activities.push({
        id: `booking-${b.id}`,
        type: 'BOOKING',
        text: `Booking created for ${b.machine?.name || 'Machine'} by ${b.customer?.name || 'Customer'}`,
        date: b.createdAt
      });
    });

    recentReceipts.forEach(r => {
      activities.push({
        id: `receipt-${r.id}`,
        type: 'RECEIPT',
        text: `Invoice #${r.invoiceNumber} generated for ${r.customerName} (₹${parseFloat(r.grandTotal).toFixed(0)})`,
        date: r.createdAt
      });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivity = activities.slice(0, 15);

    res.status(200).json({
      success: true,
      stats: {
        totalOwners,
        totalDrivers,
        totalCustomers,
        totalMachines,
        totalBookings,
        totalRevenue: parseFloat(totalRevenue),
        totalCollected: parseFloat(totalCollected),
        totalPending: parseFloat(totalPending)
      },
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOwners = async (req, res) => {
  try {
    const owners = await User.findAll({
      where: { role: 'OWNER' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, owners });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDrivers = async (req, res) => {
  try {
    const drivers = await User.findAll({
      where: { role: 'DRIVER' },
      attributes: { exclude: ['password'] },
      include: [
        { model: User, as: 'owner', attributes: ['name', 'companyName'] },
        { model: Machine, as: 'assignedMachine', attributes: ['name'] }
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
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMachines = async (req, res) => {
  try {
    const machines = await Machine.findAll({
      include: [
        { model: User, as: 'owner', attributes: ['name', 'companyName'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, machines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'customer', attributes: ['name', 'phone'] },
        { model: User, as: 'owner', attributes: ['name', 'companyName', 'phone'] },
        { model: Machine, as: 'machine', attributes: ['name', 'type'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.findAll({
      include: [
        { model: User, as: 'owner', attributes: ['name', 'companyName'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, receipts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerOwner = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    let userEmail = email;
    if (!userEmail && phone) {
      userEmail = `${phone.trim()}@siteforge.com`;
    }

    if (!userEmail && !phone) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

    const userExists = await User.findOne({
      where: {
        [Op.or]: [
          ...(userEmail ? [{ email: userEmail }] : []),
          ...(phone ? [{ phone: phone.trim() }] : [])
        ]
      }
    });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: userEmail,
      password,
      role: 'OWNER',
      phone: phone ? phone.trim() : null
    });

    res.status(201).json({
      success: true,
      owner: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
