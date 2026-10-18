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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB maximum file size
});

const app = express();
app.use(cors());
app.use(express.json());

// Initialize TiDB Cloud Database tables (clean, no dummy data)
initDatabase();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

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
      [vendorId, name.trim(), email.trim().toLowerCase(), password, cleanPhone, 'approved', 1]
    );

    const newVendor = {
      id: vendorId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      status: 'approved',
      directSelling: true
    };

    console.log(`✅ [TiDB] Vendor registered: ${newVendor.name} (${newVendor.email})`);
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
