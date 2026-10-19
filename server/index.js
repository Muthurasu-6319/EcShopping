import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import pool, { initDatabase } from './db.js';

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  console.log(`✅ Cloudinary configured (cloud: ${process.env.CLOUDINARY_CLOUD_NAME})`);
} else {
  console.warn('⚠️ Cloudinary not configured — uploads will fall back to inline data URIs.');
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB maximum file size
});

const app = express();
app.use(cors());
app.use(express.json());

// Friendly root so opening http://localhost:5000/ doesn't return "Cannot GET /".
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'EcShopping API',
    message: 'API is running. Use the /api/* endpoints.',
    health: '/api/health',
    endpoints: {
      vendors: '/api/vendors',
      products: '/api/products',
      orders: '/api/orders',
      reviews: '/api/reviews',
      categories: '/api/categories'
    }
  });
});

// Initialize TiDB Cloud Database tables (clean, no dummy data)
initDatabase();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
  transporter.verify()
    .then(() => console.log(`✅ SMTP connected as ${process.env.SMTP_EMAIL}`))
    .catch((err) => console.error('❌ SMTP connection failed:', err.message));
} else {
  console.warn('⚠️ SMTP not configured (SMTP_EMAIL / SMTP_PASSWORD) — emails will be skipped.');
}

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

// Cloudinary Image Upload Endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    // Check if Cloudinary credentials are configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      // Fallback data URI for smooth development until user adds keys
      const base64 = req.file.buffer.toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${base64}`;
      return res.status(200).json({
        success: true,
        url: dataUri,
        isFallback: true,
        notice: 'Cloudinary credentials missing in .env. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in server/.env'
      });
    }

    // Upload buffer directly to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'ecshopping_products',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const result = await uploadPromise;
    console.log(`✅ [Cloudinary] Image uploaded successfully: ${result.secure_url}`);
    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error('❌ Cloudinary upload error:', err);
    return res.status(500).json({ success: false, error: 'Cloudinary upload error: ' + err.message });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 as connected');
    res.json({
      status: 'online',
      database: 'TiDB Cloud MySQL connected',
      dbName: process.env.DB_NAME || 'ecshopping',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', database: err.message });
  }
});

// ================= USER AUTHENTICATION (TiDB Cloud) =================

// User Register
app.post('/api/auth/user/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
  }

  try {
    // Check if email already exists in TiDB
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Email is already registered' });
    }

    const userId = 'c' + Date.now();
    const cleanPhone = phone ? phone.trim() : '';

    await pool.query(
      'INSERT INTO users (id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)',
      [userId, name.trim(), email.trim().toLowerCase(), password, cleanPhone]
    );

    const newUser = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone
    };

    console.log(`✅ [TiDB] User registered: ${newUser.name} (${newUser.email})`);
    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error('❌ User register DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// User Login
app.post('/api/auth/user/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, created_at FROM users WHERE LOWER(email) = LOWER(?) AND password = ?',
      [email.trim(), password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = rows[0];
    console.log(`✅ [TiDB] User logged in: ${user.name} (${user.email})`);
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('❌ User login DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// ================= VENDOR AUTHENTICATION (TiDB Cloud) =================

// Vendor Register
app.post('/api/auth/vendor/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
  }

  try {
    // Check if email already registered as vendor
    const [existing] = await pool.query(
      'SELECT id FROM vendors WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Email is already registered as seller' });
    }

    const vendorId = 'v' + Date.now();
    const cleanPhone = phone ? phone.trim() : '';

    await pool.query(
      'INSERT INTO vendors (id, name, email, password, phone, status, direct_selling) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [vendorId, name.trim(), email.trim().toLowerCase(), password, cleanPhone, 'pending', 0]
    );

    const newVendor = {
      id: vendorId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      status: 'pending',
      directSelling: false
    };

    console.log(`✅ [TiDB] Vendor registered (pending approval): ${newVendor.name} (${newVendor.email})`);
    return res.status(201).json({ success: true, vendor: newVendor });
  } catch (err) {
    console.error('❌ Vendor register DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Vendor Login
app.post('/api/auth/vendor/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, status, direct_selling, created_at FROM vendors WHERE LOWER(email) = LOWER(?) AND password = ?',
      [email.trim(), password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const vendor = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      phone: rows[0].phone,
      status: rows[0].status,
      directSelling: Boolean(rows[0].direct_selling),
      createdAt: rows[0].created_at
    };

    if (vendor.status === 'pending') {
      return res.status(403).json({ success: false, error: 'Your account is pending admin approval' });
    }

    if (vendor.status === 'rejected') {
      return res.status(403).json({ success: false, error: 'Your seller account has been rejected' });
    }

    console.log(`✅ [TiDB] Vendor logged in: ${vendor.name} (${vendor.email})`);
    return res.status(200).json({ success: true, vendor });
  } catch (err) {
    console.error('❌ Vendor login DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// List vendors (admin) — password intentionally omitted
app.get('/api/vendors', async (req, res) => {
  const { status } = req.query;
  try {
    let query = 'SELECT id, name, email, phone, status, direct_selling AS directSelling, created_at AS createdAt FROM vendors';
    const params = [];
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    const vendors = rows.map((v) => ({ ...v, directSelling: Boolean(v.directSelling) }));
    return res.status(200).json({ success: true, vendors });
  } catch (err) {
    console.error('❌ Get vendors DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Approve / reject / reset a vendor (admin)
app.put('/api/vendors/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid vendor status' });
  }

  try {
    const [result] = await pool.query('UPDATE vendors SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }
    console.log(`✅ [TiDB] Vendor ${id} status -> ${status}`);
    return res.status(200).json({ success: true, message: 'Vendor status updated' });
  } catch (err) {
    console.error('❌ Update vendor status DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Enable / disable direct selling for a vendor (admin)
app.put('/api/vendors/:id/direct-selling', async (req, res) => {
  const { id } = req.params;
  const { directSelling } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE vendors SET direct_selling = ? WHERE id = ?',
      [directSelling ? 1 : 0, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }
    console.log(`✅ [TiDB] Vendor ${id} direct selling -> ${Boolean(directSelling)}`);
    return res.status(200).json({ success: true, message: 'Vendor direct selling updated' });
  } catch (err) {
    console.error('❌ Update vendor direct selling DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// ================= CATEGORY MANAGEMENT (TiDB Cloud) =================

// Get all categories (filtered by vendorId or shared)
app.get('/api/categories', async (req, res) => {
  const { vendorId } = req.query;

  try {
    let query = 'SELECT id, vendor_id AS vendorId, name, description, status, created_at AS createdAt FROM categories';
    let params = [];

    if (vendorId) {
      query += ' WHERE vendor_id = ? OR vendor_id IS NULL ORDER BY created_at DESC';
      params.push(vendorId);
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, categories: rows });
  } catch (err) {
    console.error('❌ Get categories DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Create new category
app.post('/api/categories', async (req, res) => {
  const { name, description, status = 'active', vendorId } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Category name is required' });
  }

  try {
    // Check if category name already exists for this vendor
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER(?) AND (vendor_id = ? OR vendor_id IS NULL)',
      [name.trim(), vendorId || null]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Category already exists' });
    }

    const categoryId = 'cat_' + Date.now();
    const cleanDesc = description ? description.trim() : '';
    const cleanStatus = status === 'inactive' ? 'inactive' : 'active';

    await pool.query(
      'INSERT INTO categories (id, vendor_id, name, description, status) VALUES (?, ?, ?, ?, ?)',
      [categoryId, vendorId || null, name.trim(), cleanDesc, cleanStatus]
    );

    const newCategory = {
      id: categoryId,
      vendorId: vendorId || null,
      name: name.trim(),
      description: cleanDesc,
      status: cleanStatus,
      createdAt: new Date().toISOString()
    };

    console.log(`✅ [TiDB] Category created: ${newCategory.name} (${newCategory.status})`);
    return res.status(201).json({ success: true, category: newCategory });
  } catch (err) {
    console.error('❌ Create category DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Update category status or details
app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const current = rows[0];
    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedDesc = description !== undefined ? description.trim() : current.description;
    const updatedStatus = status !== undefined ? status : current.status;

    await pool.query(
      'UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ?',
      [updatedName, updatedDesc, updatedStatus, id]
    );

    console.log(`✅ [TiDB] Category updated: ${id} -> ${updatedName} (${updatedStatus})`);
    return res.status(200).json({
      success: true,
      category: {
        id,
        name: updatedName,
        description: updatedDesc,
        status: updatedStatus
      }
    });
  } catch (err) {
    console.error('❌ Update category DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    console.log(`✅ [TiDB] Category deleted: ${id}`);
    return res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    console.error('❌ Delete category DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// ================= PRODUCT MANAGEMENT (multi-vendor + admin approval) =================

const PRODUCT_COLUMNS = `id, vendor_id AS vendorId, vendor_name AS vendorName, title, name, description, category,
  price, strike_price AS strikePrice, unit, image, stock_status AS stockStatus, status, created_at AS createdAt`;

// List products (optionally filtered by vendorId, status, category)
app.get('/api/products', async (req, res) => {
  const { vendorId, status, category } = req.query;

  try {
    let sql = `SELECT ${PRODUCT_COLUMNS} FROM products WHERE 1 = 1`;
    const params = [];

    if (vendorId) { sql += ' AND vendor_id = ?'; params.push(vendorId); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (category) { sql += ' AND category = ?'; params.push(category); }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(sql, params);
    return res.status(200).json({ success: true, products: rows });
  } catch (err) {
    console.error('❌ Get products DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Get a single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    return res.status(200).json({ success: true, product: rows[0] });
  } catch (err) {
    console.error('❌ Get product DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Vendor submits a new product — always enters as 'pending' for admin approval
app.post('/api/products', async (req, res) => {
  const {
    id, vendorId, vendorName, title, name, description,
    category, price, strikePrice, unit, image, stockStatus
  } = req.body || {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ success: false, error: 'Product title is required' });
  }

  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return res.status(400).json({ success: false, error: 'A valid selling price is required' });
  }

  try {
    const productId = id || ('p' + Date.now());
    const strike = strikePrice !== undefined && strikePrice !== null && strikePrice !== ''
      ? Number(strikePrice)
      : null;

    await pool.query(
      `INSERT INTO products
        (id, vendor_id, vendor_name, title, name, description, category, price, strike_price, unit, image, stock_status, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
       ON DUPLICATE KEY UPDATE
         vendor_id = VALUES(vendor_id), vendor_name = VALUES(vendor_name), title = VALUES(title),
         name = VALUES(name), description = VALUES(description), category = VALUES(category),
         price = VALUES(price), strike_price = VALUES(strike_price), unit = VALUES(unit),
         image = VALUES(image), stock_status = VALUES(stock_status)`,
      [
        productId,
        vendorId || null,
        vendorName || '',
        String(title).trim(),
        name ? String(name).trim() : String(title).trim(),
        description || '',
        category || 'General',
        numericPrice,
        strike,
        unit || '',
        image || '',
        stockStatus === 'out_of_stock' ? 'out_of_stock' : 'in_stock'
      ]
    );

    const [rows] = await pool.query(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`, [productId]);
    console.log(`✅ [TiDB] Product submitted (pending approval): ${title} by ${vendorName || vendorId}`);

    // Notify the admin that a vendor submitted a product for approval.
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL;
    if (adminEmail && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      const senderName = process.env.SENDER_NAME || 'EcShopping';
      transporter.sendMail({
        from: `"${senderName}" <${process.env.SMTP_EMAIL}>`,
        to: adminEmail,
        subject: `New product awaiting approval: ${String(title).trim()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #0e5c4a;">New product awaiting approval</h2>
            <p>A vendor has submitted a new product on ${senderName}.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 6px 0;"><strong>Product:</strong></td><td>${escapeHtml(title)}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Vendor:</strong></td><td>${escapeHtml(vendorName || vendorId || 'Unknown')}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Category:</strong></td><td>${escapeHtml(category || 'General')}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Price:</strong></td><td>₹${escapeHtml(numericPrice)}</td></tr>
            </table>
            <p>Log in to the admin dashboard to approve or reject this listing.</p>
            <p style="color: #64748b; font-size: 13px;">Product ID: ${escapeHtml(productId)}</p>
          </div>
        `
      })
        .then(() => console.log(`📧 Admin approval email sent to: ${adminEmail}`))
        .catch((err) => console.error('⚠️ Admin approval email failed:', err.message));
    } else {
      console.warn('⚠️ Admin approval email skipped: set SMTP_EMAIL, SMTP_PASSWORD and ADMIN_EMAIL.');
    }

    return res.status(201).json({ success: true, product: rows[0] });
  } catch (err) {
    console.error('❌ Create product DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Update product fields (vendor edits)
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { title, name, description, category, price, strikePrice, unit, image, stockStatus } = req.body || {};

  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const current = rows[0];
    const updated = {
      title: title !== undefined ? String(title).trim() : current.title,
      name: name !== undefined ? String(name).trim() : current.name,
      description: description !== undefined ? description : current.description,
      category: category !== undefined ? category : current.category,
      price: price !== undefined && Number.isFinite(Number(price)) ? Number(price) : current.price,
      strikePrice: strikePrice !== undefined ? (strikePrice === '' || strikePrice === null ? null : Number(strikePrice)) : current.strike_price,
      unit: unit !== undefined ? unit : current.unit,
      image: image !== undefined ? image : current.image,
      stockStatus: stockStatus !== undefined ? stockStatus : current.stock_status
    };

    await pool.query(
      `UPDATE products SET title = ?, name = ?, description = ?, category = ?, price = ?, strike_price = ?, unit = ?, image = ?, stock_status = ?
       WHERE id = ?`,
      [updated.title, updated.name, updated.description, updated.category, updated.price, updated.strikePrice, updated.unit, updated.image, updated.stockStatus, id]
    );

    const [result] = await pool.query(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`, [id]);
    console.log(`✅ [TiDB] Product updated: ${id}`);
    return res.status(200).json({ success: true, product: result[0] });
  } catch (err) {
    console.error('❌ Update product DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Admin approves / rejects / re-pends a product
app.put('/api/products/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Status must be pending, approved or rejected' });
  }

  try {
    const [result] = await pool.query('UPDATE products SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const [rows] = await pool.query(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = ?`, [id]);
    console.log(`✅ [TiDB] Product ${id} status -> ${status}`);
    return res.status(200).json({ success: true, product: rows[0] });
  } catch (err) {
    console.error('❌ Update product status DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    console.log(`✅ [TiDB] Product deleted: ${req.params.id}`);
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('❌ Delete product DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// ================= ORDER MANAGEMENT (multi-vendor) =================

const ORDER_COLUMNS = `id, customer_name AS customerName, customer_email AS customerEmail, customer_phone AS customerPhone,
  shipping_address AS shippingAddress, subtotal, discount, shipping, total, total AS totalAmount,
  coupon_code AS couponCode, delivery_method AS deliveryMethod, payment_method AS paymentMethod,
  payment_status AS paymentStatus, payment_reference AS paymentReference, status, created_at AS date`;

const parseShippingAddress = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const fetchOrderItems = async (orderId) => {
  const [rows] = await pool.query(
    `SELECT product_id AS id, product_id AS productId, vendor_id AS vendorId, vendor_name AS vendorName,
            title, price, quantity, image, variant
     FROM order_items WHERE order_id = ?`,
    [orderId]
  );
  return rows;
};

const hydrateOrders = async (orders, vendorId, vendorName) => {
  const hydrated = [];
  for (const order of orders) {
    const items = await fetchOrderItems(order.id);
    const decorated = {
      ...order,
      shippingAddress: parseShippingAddress(order.shippingAddress),
      items
    };
    if (vendorId || vendorName) {
      decorated.vendorItems = items.filter((item) => {
        if (vendorId && String(item.vendorId) === String(vendorId)) return true;
        const name = (item.vendorName || '').toLowerCase();
        const target = (vendorName || '').toLowerCase();
        return Boolean(name && target && (name.includes(target) || target.includes(name)));
      });
    }
    hydrated.push(decorated);
  }
  return hydrated;
};

// List orders (filter by customerEmail, status, or vendor)
app.get('/api/orders', async (req, res) => {
  const { customerEmail, status, vendorId, vendorName } = req.query;

  try {
    let sql = `SELECT ${ORDER_COLUMNS} FROM orders WHERE 1 = 1`;
    const params = [];

    if (customerEmail) { sql += ' AND LOWER(customer_email) = LOWER(?)'; params.push(customerEmail); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (vendorId || vendorName) {
      sql += ' AND id IN (SELECT order_id FROM order_items WHERE vendor_id = ? OR LOWER(vendor_name) LIKE LOWER(?))';
      params.push(vendorId || '__none__', `%${vendorName || '__none__'}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const [orders] = await pool.query(sql, params);
    const hydrated = await hydrateOrders(orders, vendorId, vendorName);
    return res.status(200).json({ success: true, orders: hydrated });
  } catch (err) {
    console.error('❌ Get orders DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Get a single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT ${ORDER_COLUMNS} FROM orders WHERE id = ?`, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const [order] = await hydrateOrders(rows);
    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('❌ Get order DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Create a new order with its line items (transaction)
app.post('/api/orders', async (req, res) => {
  const body = req.body || {};
  const items = Array.isArray(body.items) ? body.items : [];

  if (items.length === 0) {
    return res.status(400).json({ success: false, error: 'An order must contain at least one item' });
  }

  const orderId = body.id || ('ORD-' + Math.floor(100000 + Math.random() * 900000));
  const shippingAddress = body.shippingAddress
    ? (typeof body.shippingAddress === 'string' ? body.shippingAddress : JSON.stringify(body.shippingAddress))
    : null;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO orders
        (id, customer_name, customer_email, customer_phone, shipping_address, subtotal, discount, shipping, total,
         coupon_code, delivery_method, payment_method, payment_status, payment_reference, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing')
       ON DUPLICATE KEY UPDATE
         customer_name = VALUES(customer_name), customer_email = VALUES(customer_email),
         customer_phone = VALUES(customer_phone), shipping_address = VALUES(shipping_address),
         subtotal = VALUES(subtotal), discount = VALUES(discount), shipping = VALUES(shipping), total = VALUES(total),
         coupon_code = VALUES(coupon_code), delivery_method = VALUES(delivery_method),
         payment_method = VALUES(payment_method), payment_status = VALUES(payment_status),
         payment_reference = VALUES(payment_reference)`,
      [
        orderId,
        body.customerName || '',
        body.customerEmail || body.email || '',
        body.customerPhone || '',
        shippingAddress,
        Number(body.subtotal) || 0,
        Number(body.discount) || 0,
        Number(body.shipping) || 0,
        Number(body.total ?? body.totalAmount) || 0,
        body.couponCode || null,
        body.deliveryMethod || 'standard',
        body.paymentMethod || 'cod',
        body.paymentStatus || 'pending',
        body.paymentReference || null
      ]
    );

    // Replace line items (idempotent for retries)
    await conn.query('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, vendor_id, vendor_name, title, price, quantity, image, variant)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.id || item.productId || null,
          item.vendorId || item.sellerId || null,
          item.vendorName || item.seller || item.soldBy || null,
          item.title || item.name || '',
          Number(item.price) || 0,
          Number(item.quantity) || 1,
          item.image || null,
          item.variant || null
        ]
      );
    }

    await conn.commit();

    const [rows] = await pool.query(`SELECT ${ORDER_COLUMNS} FROM orders WHERE id = ?`, [orderId]);
    const [order] = await hydrateOrders(rows);
    console.log(`✅ [TiDB] Order placed: ${orderId} (${items.length} items)`);
    return res.status(201).json({ success: true, order });
  } catch (err) {
    await conn.rollback();
    console.error('❌ Create order DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  } finally {
    conn.release();
  }
});

// Update order fulfillment status (vendor/admin)
app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required' });
  }

  try {
    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    console.log(`✅ [TiDB] Order ${id} status -> ${status}`);
    return res.status(200).json({ success: true, message: 'Order status updated' });
  } catch (err) {
    console.error('❌ Update order status DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// ================= REVIEWS =================

// List reviews (optionally filtered by vendorId / productId). Customer email is never returned.
app.get('/api/reviews', async (req, res) => {
  const { vendorId, productId } = req.query;

  try {
    let sql = `SELECT id, product_id AS productId, vendor_id AS vendorId, product_title AS productTitle,
      customer_name AS customerName, rating, comment, created_at AS createdAt
      FROM reviews WHERE 1 = 1`;
    const params = [];

    if (vendorId) { sql += ' AND vendor_id = ?'; params.push(vendorId); }
    if (productId) { sql += ' AND product_id = ?'; params.push(productId); }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(sql, params);
    return res.status(200).json({ success: true, reviews: rows });
  } catch (err) {
    console.error('❌ Get reviews DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// Submit a product review (customer)
app.post('/api/reviews', async (req, res) => {
  const {
    id, productId, vendorId, productTitle,
    customerName, customerEmail, rating, comment
  } = req.body || {};

  if (!productId) {
    return res.status(400).json({ success: false, error: 'Product is required' });
  }

  const numericRating = Number(rating);
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
  }

  if (!comment || !String(comment).trim()) {
    return res.status(400).json({ success: false, error: 'Review comment is required' });
  }

  try {
    const reviewId = id || ('rev' + Date.now());

    await pool.query(
      `INSERT INTO reviews
        (id, product_id, vendor_id, product_title, customer_name, customer_email, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reviewId,
        productId,
        vendorId || null,
        productTitle || '',
        customerName || 'Customer',
        customerEmail || null,
        Math.round(numericRating),
        String(comment).trim()
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, product_id AS productId, vendor_id AS vendorId, product_title AS productTitle,
        customer_name AS customerName, rating, comment, created_at AS createdAt
       FROM reviews WHERE id = ?`,
      [reviewId]
    );

    console.log(`✅ [TiDB] Review submitted for product ${productId}`);
    return res.status(201).json({ success: true, review: rows[0] });
  } catch (err) {
    console.error('❌ Create review DB error:', err);
    return res.status(500).json({ success: false, error: 'Database error: ' + err.message });
  }
});

// ================= EMAIL NOTIFICATION =================

app.post('/api/send-welcome', async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const senderName = process.env.SENDER_NAME || 'EcShopping';

  const mailOptions = {
    from: `"${senderName}" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: `Welcome to ${senderName}! Your Account Details`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4caf50;">Welcome to ${senderName}, ${name || 'Customer'}!</h2>
        <p>Thank you for placing your order with us.</p>
        <p>We have automatically created an account for you to track your orders and manage your wishlist.</p>
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Your Login Credentials:</strong></p>
          <p style="margin: 0 0 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p>You can change your password anytime after logging in.</p>
        <p>Happy Shopping!</p>
        <p>Best Regards,<br>The ${senderName} Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Mail successfully sent to: ${email}`);
    res.status(200).json({ success: true, message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
