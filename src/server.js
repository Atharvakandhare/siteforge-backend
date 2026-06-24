const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, sequelize } = require('./config/db');
const { User } = require('./models');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API REQUEST] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Rate Limiting to prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Basic Route
app.get('/', (req, res) => {
  res.send('Machines App API is running...');
});

// Routes
app.use('/api/auth', require('./routes/auth.routes.js'));
app.use('/api/machines', require('./routes/machine.routes.js'));
app.use('/api/owner', require('./routes/owner.routes.js'));
app.use('/api/bookings', require('./routes/booking.routes.js'));
app.use('/api/receipts', require('./routes/receipt.routes.js'));
app.use('/api/admin', require('./routes/admin.routes.js'));

// Seed System Admin
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { email: 'atharvakandhare101@gmail.com' } });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'atharvakandhare101@gmail.com',
        password: 'systemadmin@1203',
        role: 'ADMIN'
      });
      console.log('Default System Admin created.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

// Start Server
const startServer = async () => {
  const PORT = process.env.PORT || 80;
  await connectDB();
  
  // Add columns to Users table dynamically if they don't exist
  try {
    await sequelize.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "bankAccounts" JSONB DEFAULT \'[]\'::jsonb;');
    await sequelize.query('ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "phones" JSONB DEFAULT \'[]\'::jsonb;');
    
    // Drop outdated termsAndConditions TEXT column if exists to allow JSONB sync
    await sequelize.query('ALTER TABLE "Users" DROP COLUMN IF EXISTS "termsAndConditions";');
    await sequelize.query('ALTER TABLE "Receipts" DROP COLUMN IF EXISTS "termsAndConditions";');
    
    console.log('Columns successfully checked/created/cleaned.');
  } catch (err) {
    console.error('Error creating dynamic columns:', err);
  }
  
  // Sync Database
  // try {
  //   await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  //   console.log('Database public schema reset completed.');
  // } catch (err) {
  //   console.error('Error resetting public schema:', err);
  // }
  await sequelize.sync(); // Using basic sync to avoid alter/drop constraint issues in Postgres (IPv4 Pooler)
  console.log('Database synced.');

  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
