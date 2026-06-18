const express = require('express');
const {
  getDashboardData,
  getOwners,
  getDrivers,
  getCustomers,
  getMachines,
  getBookings,
  getReceipts,
  registerOwner
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All admin routes are guarded with JWT protect and ADMIN role authorization
router.get('/dashboard', protect, authorize('ADMIN'), getDashboardData);
router.get('/owners', protect, authorize('ADMIN'), getOwners);
router.get('/drivers', protect, authorize('ADMIN'), getDrivers);
router.get('/customers', protect, authorize('ADMIN'), getCustomers);
router.get('/machines', protect, authorize('ADMIN'), getMachines);
router.get('/bookings', protect, authorize('ADMIN'), getBookings);
router.get('/receipts', protect, authorize('ADMIN'), getReceipts);
router.post('/register-owner', protect, authorize('ADMIN'), registerOwner);

module.exports = router;
