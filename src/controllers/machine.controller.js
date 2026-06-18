const { Machine } = require('../models');
const { compressBase64Image } = require('../utils/imageCompressor');

exports.createMachine = async (req, res) => {
  try {
    const { 
      name, type, make, modelNumber, year, 
      hourlyRate, dailyRate, weeklyRate, monthlyRate, securityDeposit, 
      capacity, fuelType, location, rcNumber, 
      insuranceExpiry, pucExpiry, additionalParts, imageUrl
    } = req.body;

    const compressedImageUrl = imageUrl ? await compressBase64Image(imageUrl) : null;

    const machine = await Machine.create({
      name,
      type,
      make,
      modelNumber,
      year,
      hourlyRate,
      dailyRate,
      weeklyRate,
      monthlyRate,
      securityDeposit,
      capacity,
      fuelType,
      location,
      rcNumber,
      insuranceExpiry,
      pucExpiry,
      additionalParts,
      imageUrl: compressedImageUrl,
      ownerId: req.user.id
    });

    res.status(201).json({ success: true, machine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyMachines = async (req, res) => {
  try {
    const machines = await Machine.findAll({ where: { ownerId: req.user.id } });
    res.status(200).json({ success: true, machines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.findAll();
    res.status(200).json({ success: true, machines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const machine = await Machine.findOne({ where: { id, ownerId: req.user.id } });
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found or unauthorized' });
    }

    const updateData = { ...req.body };
    if (updateData.imageUrl !== undefined) {
      updateData.imageUrl = updateData.imageUrl ? await compressBase64Image(updateData.imageUrl) : null;
    }

    await machine.update(updateData);
    res.status(200).json({ success: true, machine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const machine = await Machine.findOne({ where: { id, ownerId: req.user.id } });
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found or unauthorized' });
    }

    await machine.destroy();
    res.status(200).json({ success: true, message: 'Machine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMachineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['AVAILABLE', 'BOOKED', 'MAINTENANCE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const machine = await Machine.findOne({ where: { id, ownerId: req.user.id } });
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found or unauthorized' });
    }

    machine.status = status;
    await machine.save();

    res.status(200).json({ success: true, machine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
