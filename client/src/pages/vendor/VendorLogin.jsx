import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { verifyVendorLogin } from '../../utils/storage';
import '../admin/AdminLogin.css'; // Reusing admin styles for consistency

export default function VendorLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const result = verifyVendorLogin(email, password);

    if (result.success) {
      setError('');
      onLogin(result.vendor); 
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2>Vendor Login</h2>
          <p>Sign in to manage your products and orders</p>
        </div>
        
        {error && <div className="admin-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendor@example.com"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"}
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required 
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="admin-login-btn">
            Login to Vendor Dashboard
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#555' }}>
          Don't have an account? <Link to="/vendor/register" style={{ color: '#4caf50', fontWeight: 'bold' }}>Register Here</Link>
        </div>
      </div>
    </div>
  );
}
