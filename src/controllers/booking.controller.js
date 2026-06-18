const { Booking, Machine, User } = require('../models');

exports.createBooking = async (req, res) => {
  try {
    const { 
      machineId, startDate, endDate, totalAmount,
      siteName, siteAddress, durationOfStay, workDescription,
      operatorRequired, siteContactName, siteContactPhone, customerGst
    } = req.body;
    
    // Check if machine exists and is available
    const machine = await Machine.findByPk(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    if (machine.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Machine is not available for booking' });
    }

    // Create booking (enquiry initially)
    const booking = await Booking.create({
      customerId: req.user.id,
      machineId,
      ownerId: machine.ownerId,
      startDate,
      endDate,
      totalAmount,
      siteName,
      siteAddress,
      durationOfStay,
      workDescription,
      operatorRequired,
      siteContactName,
      siteContactPhone,
      customerGst,
      bookingStatus: 'ENQUIRY_PENDING'
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { customerId: req.user.id },
      include: [
        { model: Machine, as: 'machine' }
      ]
    });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { ownerId: req.user.id },
      include: [
        { model: Machine, as: 'machine' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus, billingBasis, billedQuantity, gstPercent } = req.body;
    
    const booking = await Booking.findByPk(id, {
      include: [{ model: Machine, as: 'machine' }]
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify authorized user (Owner or Customer)
    if (booking.ownerId !== req.user.id && booking.customerId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (billingBasis !== undefined) booking.billingBasis = billingBasis;
    if (billedQuantity !== undefined) booking.billedQuantity = billedQuantity;
    if (gstPercent !== undefined) booking.gstPercent = gstPercent;

    if (bookingStatus) {
      booking.bookingStatus = bookingStatus;
      
      // Release machine state back to AVAILABLE if completed/cancelled/rejected
      if (bookingStatus === 'COMPLETED' || bookingStatus === 'CANCELLED' || bookingStatus === 'ENQUIRY_REJECTED') {
        if (booking.machine) {
          booking.machine.status = 'AVAILABLE';
          await booking.machine.save();
        }
      } else if (bookingStatus === 'CONFIRMED') {
        if (booking.machine) {
          booking.machine.status = 'BOOKED';
          await booking.machine.save();
        }
      }

      // If status completed, compute subtotal and grandTotal
      if (bookingStatus === 'COMPLETED') {
        const basis = booking.billingBasis;
        const quantity = parseFloat(booking.billedQuantity || 0);
        const gstRate = parseFloat(booking.gstPercent || 18.0);
        
        let rate = 0;
        if (basis === 'HOURS') rate = parseFloat(booking.machine?.hourlyRate || 0);
        else if (basis === 'WEEKS') rate = parseFloat(booking.machine?.weeklyRate || 0);
        else if (basis === 'MONTHS') rate = parseFloat(booking.machine?.monthlyRate || 0);

        const subtotal = rate * quantity;
        const grandTotal = subtotal + (subtotal * (gstRate / 100));

        booking.subtotal = subtotal;
        booking.grandTotal = grandTotal;
        booking.totalAmount = grandTotal;
      }
    }

    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();
    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
