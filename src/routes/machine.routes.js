const express = require('express');
const { 
  createMachine, 
  getMyMachines, 
  getAllMachines,
  updateMachine,
  deleteMachine,
  updateMachineStatus
} = require('../controllers/machine.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', protect, authorize('OWNER'), createMachine);
router.get('/my', protect, authorize('OWNER'), getMyMachines);
router.get('/all', getAllMachines);
router.put('/:id', protect, authorize('OWNER'), updateMachine);
router.delete('/:id', protect, authorize('OWNER'), deleteMachine);
router.put('/:id/status', protect, authorize('OWNER'), updateMachineStatus);

module.exports = router;
