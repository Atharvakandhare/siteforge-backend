const express = require('express');
const { createBooking, getMyBookings, getOwnerBookings, updateBooking } = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', protect, authorize('CUSTOMER'), createBooking);
router.get('/my', protect, authorize('CUSTOMER'), getMyBookings);
router.get('/owner', protect, authorize('OWNER'), getOwnerBookings);
router.put('/:id', protect, updateBooking);

module.exports = router;
