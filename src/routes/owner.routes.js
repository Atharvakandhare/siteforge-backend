const express = require('express');
const { 
  addDriver, 
  getMyDrivers, 
  getCustomers,
  assignMachineToDriver,
  markDriverAttendance,
  getDriverAttendanceHistory,
  getDriverWorkHistory
} = require('../controllers/owner.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/add-driver', protect, authorize('OWNER'), addDriver);
router.get('/drivers', protect, authorize('OWNER'), getMyDrivers);
router.get('/customers', protect, authorize('OWNER'), getCustomers);

// New Driver Hub Endpoints
router.put('/drivers/:id/assign-machine', protect, authorize('OWNER'), assignMachineToDriver);
router.post('/attendance', protect, authorize('OWNER'), markDriverAttendance);
router.get('/drivers/:id/attendance', protect, authorize('OWNER'), getDriverAttendanceHistory);
router.get('/drivers/:id/work-history', protect, authorize('OWNER'), getDriverWorkHistory);

module.exports = router;
