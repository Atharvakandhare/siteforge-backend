const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { Op } = require('sequelize');
const { compressBase64Image } = require('../utils/imageCompressor');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    let userRole = role;
    if (userRole === 'MACHINE OWNER') {
      userRole = 'OWNER';
    }

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
      role: userRole,
      phone: phone ? phone.trim() : null
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: email.trim() },
          { phone: email.trim() }
        ]
      }
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, companyName, gstNumber, panNumber, companyAddress, companyPhone, bankName, bankBranch, bankAccountNumber, bankIfscCode, companyLogo, companyStamp, ownerSignature, companyTagline, preferredLanguage, bankAccounts, phones } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate phones array if passed
    if (phones !== undefined) {
      if (!Array.isArray(phones)) {
        return res.status(400).json({ message: 'Phones must be an array' });
      }
      for (const p of phones) {
        if (typeof p !== 'string' || !/^\d{10}$/.test(p)) {
          return res.status(400).json({ message: 'Mobile number must be exactly 10 digits' });
        }
      }
      user.phones = phones;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (companyName !== undefined) user.companyName = companyName;
    if (gstNumber !== undefined) user.gstNumber = gstNumber;
    if (panNumber !== undefined) user.panNumber = panNumber;
    if (companyAddress !== undefined) user.companyAddress = companyAddress;
    if (companyPhone !== undefined) user.companyPhone = companyPhone;
    if (bankName !== undefined) user.bankName = bankName;
    if (bankBranch !== undefined) user.bankBranch = bankBranch;
    if (bankAccountNumber !== undefined) user.bankAccountNumber = bankAccountNumber;
    if (bankIfscCode !== undefined) user.bankIfscCode = bankIfscCode;
    if (bankAccounts !== undefined) {
      if (!Array.isArray(bankAccounts)) {
        return res.status(400).json({ message: 'Bank accounts must be an array' });
      }
      user.bankAccounts = bankAccounts;
    }
    if (companyLogo !== undefined) {
      user.companyLogo = companyLogo ? await compressBase64Image(companyLogo) : null;
    }
    if (companyStamp !== undefined) {
      user.companyStamp = companyStamp ? await compressBase64Image(companyStamp) : null;
    }
    if (ownerSignature !== undefined) {
      user.ownerSignature = ownerSignature ? await compressBase64Image(ownerSignature) : null;
    }
    if (companyTagline !== undefined) user.companyTagline = companyTagline;
    if (preferredLanguage !== undefined) user.preferredLanguage = preferredLanguage;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        companyName: user.companyName,
        gstNumber: user.gstNumber,
        panNumber: user.panNumber,
        companyAddress: user.companyAddress,
        companyPhone: user.companyPhone,
        bankName: user.bankName,
        bankBranch: user.bankBranch,
        bankAccountNumber: user.bankAccountNumber,
        bankIfscCode: user.bankIfscCode,
        companyLogo: user.companyLogo,
        companyStamp: user.companyStamp,
        ownerSignature: user.ownerSignature,
        companyTagline: user.companyTagline,
        preferredLanguage: user.preferredLanguage,
        bankAccounts: user.bankAccounts,
        phones: user.phones
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
