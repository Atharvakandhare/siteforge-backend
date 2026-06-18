const express = require('express');
const {
  createReceipt,
  getMyReceipts,
  getCustomerReceipts,
  updateReceiptStatus,
  getAnalytics
} = require('../controllers/receipt.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', protect, authorize('OWNER'), createReceipt);
router.get('/owner', protect, authorize('OWNER'), getMyReceipts);
router.get('/owner/analytics', protect, authorize('OWNER'), getAnalytics);
router.get('/customer', protect, authorize('CUSTOMER'), getCustomerReceipts);
router.put('/:id', protect, authorize('OWNER'), updateReceiptStatus);

module.exports = router;
