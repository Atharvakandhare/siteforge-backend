const { Receipt, User } = require('../models');
const { Op } = require('sequelize');
const { compressBase64Image } = require('../utils/imageCompressor');

exports.createReceipt = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const ownerUser = await User.findByPk(ownerId);
    if (!ownerUser) {
      return res.status(404).json({ message: 'Owner profile not found' });
    }

    // Calculate sequential invoice number
    const lastReceipt = await Receipt.findOne({
      where: { ownerId },
      order: [['createdAt', 'DESC']]
    });
    let nextNum = 1;
    if (lastReceipt) {
      const lastNum = parseInt(lastReceipt.invoiceNumber, 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    const autoInvoiceNumber = String(nextNum).padStart(3, '0');
    const invoiceNumber = req.body.invoiceNumber || autoInvoiceNumber;

    // Billing calculations
    const workedDuration = parseFloat(req.body.workedDuration || 0);
    const rate = parseFloat(req.body.rate || 0);
    const subtotal = parseFloat(req.body.subtotal || (workedDuration * rate));
    const withGst = req.body.withGst === true;
    const gstAmount = withGst ? parseFloat((subtotal * 0.18).toFixed(2)) : 0.0;
    const grandTotal = parseFloat((subtotal + gstAmount).toFixed(2));

    // Status & Payment calculations
    const status = req.body.status || 'OVERDUE'; // Default to Not Paid (OVERDUE)
    let amountPaid = 0.0;
    let remainingAmount = grandTotal;
    let paymentDate = null;

    if (status === 'PAID') {
      amountPaid = grandTotal;
      remainingAmount = 0.0;
      paymentDate = req.body.paymentDate || req.body.invoiceDate || new Date().toISOString().split('T')[0];
    } else if (status === 'PARTIALLY_PAID') {
      amountPaid = parseFloat(req.body.amountPaid || 0);
      if (amountPaid > grandTotal) {
        return res.status(400).json({ message: 'Amount paid cannot exceed grand total' });
      }
      remainingAmount = parseFloat((grandTotal - amountPaid).toFixed(2));
      paymentDate = req.body.paymentDate || new Date().toISOString().split('T')[0];
    }

    // Snap owner/bank details (prefer body overrides if passed, otherwise fall back to owner user fields)
    const companyName = req.body.companyName || ownerUser.companyName || '';
    const companyTagline = req.body.companyTagline || ownerUser.companyTagline || '';
    const companyAddress = req.body.companyAddress || ownerUser.companyAddress || '';
    const companyPhone = req.body.companyPhone || ownerUser.companyPhone || ownerUser.phone || '';
    const ownerGst = req.body.ownerGst || ownerUser.gstNumber || '';
    const ownerPan = req.body.ownerPan || ownerUser.panNumber || '';
    const bankName = req.body.bankName || ownerUser.bankName || '';
    const bankBranch = req.body.bankBranch || ownerUser.bankBranch || '';
    const bankAccountNumber = req.body.bankAccountNumber || ownerUser.bankAccountNumber || '';
    const bankIfscCode = req.body.bankIfscCode || ownerUser.bankIfscCode || '';
    let companyLogo = ownerUser.companyLogo || null;
    if (req.body.companyLogo !== undefined) {
      companyLogo = req.body.companyLogo ? await compressBase64Image(req.body.companyLogo) : null;
    }

    let companyStamp = ownerUser.companyStamp || null;
    if (req.body.companyStamp !== undefined) {
      companyStamp = req.body.companyStamp ? await compressBase64Image(req.body.companyStamp) : null;
    }

    let ownerSignature = ownerUser.ownerSignature || null;
    if (req.body.ownerSignature !== undefined) {
      ownerSignature = req.body.ownerSignature ? await compressBase64Image(req.body.ownerSignature) : null;
    }

    // Customer details
    const customerId = req.body.customerId || null;
    const customerName = req.body.customerName || 'N/A';
    const customerPhone = req.body.customerPhone || 'N/A';
    const customerGst = req.body.customerGst || '';

    const receipt = await Receipt.create({
      ownerId,
      customerId,
      customerName,
      customerPhone,
      customerGst,
      siteName: req.body.siteName,
      siteAddress: req.body.siteAddress,
      invoiceNumber,
      invoiceDate: req.body.invoiceDate || new Date().toISOString().split('T')[0],
      period: req.body.period,
      withGst,
      machineName: req.body.machineName,
      workedDuration,
      billingBasis: req.body.billingBasis || 'HOURS',
      rate,
      subtotal,
      gstAmount,
      grandTotal,
      status,
      amountPaid,
      remainingAmount,
      paymentDate,
      companyName,
      companyTagline,
      companyAddress,
      companyPhone,
      ownerGst,
      ownerPan,
      bankName,
      bankBranch,
      bankAccountNumber,
      bankIfscCode,
      companyLogo,
      companyStamp,
      ownerSignature,
      isConsolidated: req.body.isConsolidated || false,
      consolidatedSites: req.body.consolidatedSites || [],
      additionalParts: req.body.additionalParts || [],
      transportCharges: parseFloat(req.body.transportCharges || 0.0)
    });

    res.status(201).json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.findAll({
      where: { ownerId: req.user.id },
      order: [['invoiceNumber', 'DESC'], ['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, receipts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomerReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.findAll({
      where: { customerId: req.user.id },
      order: [['invoiceDate', 'DESC'], ['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, receipts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReceiptStatus = async (req, res) => {
  try {
    const { status, amountPaid, paymentDate } = req.body;
    const receipt = await Receipt.findByPk(req.params.id);

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (receipt.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this receipt' });
    }

    receipt.status = status || receipt.status;

    if (receipt.status === 'PAID') {
      receipt.amountPaid = receipt.grandTotal;
      receipt.remainingAmount = 0.0;
      receipt.paymentDate = paymentDate || new Date().toISOString().split('T')[0];
    } else if (receipt.status === 'PARTIALLY_PAID') {
      const paid = parseFloat(amountPaid);
      if (isNaN(paid)) {
        return res.status(400).json({ message: 'Invalid payment amount' });
      }
      if (paid > receipt.grandTotal) {
        return res.status(400).json({ message: 'Amount paid cannot exceed grand total' });
      }
      receipt.amountPaid = paid;
      receipt.remainingAmount = parseFloat((receipt.grandTotal - paid).toFixed(2));
      receipt.paymentDate = paymentDate || new Date().toISOString().split('T')[0];
    } else if (receipt.status === 'OVERDUE') {
      receipt.amountPaid = 0.0;
      receipt.remainingAmount = receipt.grandTotal;
      receipt.paymentDate = null;
    }

    await receipt.save();
    res.status(200).json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const ownerId = req.user.id;
    let { month } = req.query; // Format: YYYY-MM
    if (!month) {
      month = new Date().toISOString().split('T')[0].substring(0, 7); // Default current month: YYYY-MM
    }

    const year = parseInt(month.split('-')[0], 10);
    const monthNum = parseInt(month.split('-')[1], 10);
    const startDate = `${month}-01`;
    const lastDay = new Date(year, monthNum, 0).getDate();
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

    const receipts = await Receipt.findAll({
      where: {
        ownerId,
        invoiceDate: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    let totalAmount = 0.0;
    let collectedAmount = 0.0;
    let pendingAmount = 0.0;

    receipts.forEach((r) => {
      totalAmount += parseFloat(r.grandTotal || 0);
      collectedAmount += parseFloat(r.amountPaid || 0);
      pendingAmount += parseFloat(r.remainingAmount || 0);
    });

    res.status(200).json({
      success: true,
      month,
      analytics: {
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        collectedAmount: parseFloat(collectedAmount.toFixed(2)),
        pendingAmount: parseFloat(pendingAmount.toFixed(2))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
