import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create TiDB Cloud MySQL Connection Pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: Number(process.env.DB_PORT) || 4000,
  user: process.env.DB_USER || '2jfg5VSYFYcSWGr.root',
  password: process.env.DB_PASSWORD || 'fbKhrByYkqOlhF6S',
  database: process.env.DB_NAME || 'ecshopping',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // TiDB Cloud closes idle connections; keep them alive and recycle them.
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 20000,
  maxIdle: 5,
  idleTimeout: 60000,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

// Transient network resets happen on TiDB Cloud; retry the query once.
const TRANSIENT_DB_ERRORS = new Set([
  'ECONNRESET',
  'EPIPE',
  'ETIMEDOUT',
  'PROTOCOL_CONNECTION_LOST',
  'PROTOCOL_SEQUENCE_TIMEOUT'
]);

const isTransientDbError = (err) => TRANSIENT_DB_ERRORS.has(err?.code);

const retryOnce = async (operation) => {
  try {
    return await operation();
  } catch (err) {
    if (!isTransientDbError(err)) throw err;
    console.warn(`⚠️ TiDB connection reset (${err.code}); retrying once…`);
    await new Promise((resolve) => setTimeout(resolve, 350));
    return operation();
  }
};

const rawQuery = pool.query.bind(pool);
const rawExecute = pool.execute.bind(pool);
const rawGetConnection = pool.getConnection.bind(pool);

pool.query = (...args) => retryOnce(() => rawQuery(...args));
pool.execute = (...args) => retryOnce(() => rawExecute(...args));

// Initialize database schema (clean without any dummy data)
export const initDatabase = async () => {
  try {
    const connection = await retryOnce(() => rawGetConnection());
    console.log('⚡ Connected to TiDB Cloud Database successfully!');

    // Create Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Vendors table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50) DEFAULT '',
        status VARCHAR(50) DEFAULT 'approved',
        direct_selling BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        vendor_id VARCHAR(64) DEFAULT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Products table (multi-vendor listings + admin approval)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        vendor_id VARCHAR(64) DEFAULT NULL,
        vendor_name VARCHAR(255) DEFAULT '',
        title VARCHAR(255) NOT NULL,
        name VARCHAR(255) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        category VARCHAR(255) DEFAULT 'General',
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        strike_price DECIMAL(10,2) DEFAULT NULL,
        unit VARCHAR(100) DEFAULT '',
        image TEXT DEFAULT NULL,
        stock_status VARCHAR(50) DEFAULT 'in_stock',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_products_vendor (vendor_id),
        INDEX idx_products_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        customer_name VARCHAR(255) DEFAULT '',
        customer_email VARCHAR(255) DEFAULT '',
        customer_phone VARCHAR(50) DEFAULT '',
        shipping_address TEXT DEFAULT NULL,
        subtotal DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        shipping DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) DEFAULT 0,
        coupon_code VARCHAR(64) DEFAULT NULL,
        delivery_method VARCHAR(50) DEFAULT NULL,
        payment_method VARCHAR(50) DEFAULT NULL,
        payment_status VARCHAR(50) DEFAULT NULL,
        payment_reference VARCHAR(128) DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'Processing',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_orders_customer (customer_email),
        INDEX idx_orders_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Order Items table (per-vendor line items)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL,
        product_id VARCHAR(64) DEFAULT NULL,
        vendor_id VARCHAR(64) DEFAULT NULL,
        vendor_name VARCHAR(255) DEFAULT NULL,
        title VARCHAR(255) DEFAULT NULL,
        price DECIMAL(10,2) DEFAULT 0,
        quantity INT DEFAULT 1,
        image TEXT DEFAULT NULL,
        variant VARCHAR(128) DEFAULT NULL,
        INDEX idx_items_order (order_id),
        INDEX idx_items_vendor (vendor_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create Reviews table (customer feedback per product/vendor)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(64) PRIMARY KEY,
        product_id VARCHAR(64) DEFAULT NULL,
        vendor_id VARCHAR(64) DEFAULT NULL,
        product_title VARCHAR(255) DEFAULT NULL,
        customer_name VARCHAR(255) DEFAULT NULL,
        customer_email VARCHAR(255) DEFAULT NULL,
        rating INT DEFAULT 5,
        comment TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_reviews_vendor (vendor_id),
        INDEX idx_reviews_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    connection.release();
    console.log('✅ TiDB Cloud tables (users, vendors, categories, products, orders, order_items, reviews) ready & clean (no dummy data)!');
  } catch (error) {
    console.error('❌ Error initializing TiDB Cloud database:', error.message);
  }
};

export default pool;
