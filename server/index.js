import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this based on your provider
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

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
  console.log(`Server running on port ${PORT}`);
});
