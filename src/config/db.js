const dns = require('dns');
const originalLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (hostname && (hostname.includes('supabase') || hostname.includes('supabase.co'))) {
    if (options && typeof options === 'object') {
      options = { ...options, family: 4 };
    } else {
      options = { family: 4 };
    }
  }
  return originalLookup.call(dns, hostname, options, callback);
};
dns.setDefaultResultOrder('ipv4first');

const { Sequelize } = require('sequelize');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const sequelize = connectionString
  ? new Sequelize(connectionString, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: process.env.DB_SSL === 'true' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT || 5432,
        logging: false,
        dialectOptions: process.env.DB_SSL === 'true' ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        } : {},
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected Successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
