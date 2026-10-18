import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import vendorLoginImg from '../../assets/login-page/vendor-login.png';
import { verifyVendorLogin, addVendor } from '../../utils/storage';
import '../Login.css';

export default function VendorLogin({ onLogin, initialSignUp = false }) {
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
  const navigate = useNavigate();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register state
  const [name, setName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Vendor Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/vendor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();

      if (data.success && data.vendor) {
        setSuccessMsg('Login successful! Opening Vendor Panel...');
        setTimeout(() => {
          onLogin(data.vendor);
          navigate('/vendor');
        }, 500);
        return;
      } else if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.log('Backend API notice:', err.message);
    }

    // Fallback verification using storage
    const result = verifyVendorLogin(email.trim(), password);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Login successful! Opening Vendor Panel...');
      setTimeout(() => {
        onLogin(result.vendor);
        navigate('/vendor');
      }, 500);
    } else {
      setError(result.message);
    }
  };

  // Handle Vendor Register (In same UI)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !signUpEmail || !signUpPassword) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/vendor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: signUpEmail.trim(),
          password: signUpPassword,
          phone: phone.trim()
        })
      });
      const data = await res.json();

      if (data.success && data.vendor) {
        addVendor(data.vendor); // Sync local
        setSuccessMsg('Vendor registered successfully! Opening Vendor Panel...');
        setTimeout(() => {
          onLogin(data.vendor);
          navigate('/vendor');
        }, 600);
        return;
      } else if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.log('Backend API notice:', err.message);
    }

    // Local fallback
    const newVendor = addVendor({
      name: name.trim(),
      email: signUpEmail.trim(),
      password: signUpPassword,
      phone: phone.trim(),
      status: 'approved',
      directSelling: true
    });

    setLoading(false);
    setSuccessMsg('Vendor registered successfully! Opening Vendor Panel...');
    setTimeout(() => {
      onLogin(newVendor);
      navigate('/vendor');
    }, 600);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* Left Side: 3D Vendor Illustration */}
        <div className="login-illustration-side">
          <div className="illustration-brand-tag">
            <span className="brand-dot"></span>
            <span>Vendor Portal</span>
          </div>

          <div className="illustration-visual">
            <img 
              src={vendorLoginImg} 
              alt="Sell on EcShopping" 
              className="login-side-hero-img" 
            />
          </div>

          <div className="illustration-caption">
            <h3>Sell & Grow with EcShopping</h3>
            <p>Manage your products, track customer orders, and deliver organic items directly from your farm.</p>
          </div>
        </div>

        {/* Right Side: Vendor Form (Switches between Login and Register in same UI) */}
        <div className="login-form-side">
          <div className="form-content-box">
            <div className="form-header">
              <h2 className="welcome-title">{isSignUp ? 'Become a Seller :)' : 'Vendor Login :)'}</h2>
              <p className="welcome-subtitle">
                {isSignUp 
                  ? 'Register your business to start listing and selling products 🌿' 
                  : 'Sign in to manage your products, storefront, and incoming customer orders 📦'}
              </p>
            </div>

            {error && <div className="login-alert error-alert">{error}</div>}
            {successMsg && <div className="login-alert success-alert">{successMsg}</div>}

            {!isSignUp ? (
              /* VENDOR LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="input-field-group">
                  <label htmlFor="vendor-email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="field-icon" />
                    <input 
                      id="vendor-email"
                      type="email" 
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                    {email.includes('@') && <CheckCircle size={18} className="valid-check" />}
                  </div>
                </div>

                <div className="input-field-group">
                  <label htmlFor="vendor-password">Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="field-icon" />
                    <input 
                      id="vendor-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                    <button 
                      type="button" 
                      className="eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-actions-row">
                  <label className="remember-me-label">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                    />
                    <span>Remember Me</span>
                  </label>
                  <a 
                    href="#forgot" 
                    className="forgot-password-link"
                    onClick={(e) => { e.preventDefault(); alert("Please contact store admin to reset your credentials."); }}
                  >
                    Forgot Password?
                  </a>
                </div>

                <div className="button-group-dual">
                  <button type="submit" className="login-primary-btn" disabled={loading}>
                    <span>{loading ? 'Logging in...' : 'Login to Vendor Panel'}</span>
                    <ArrowRight size={17} />
                  </button>
                  <button 
                    type="button"
                    className="create-account-btn"
                    onClick={() => { setIsSignUp(true); setError(''); setSuccessMsg(''); }}
                  >
                    Register as Seller
                  </button>
                </div>
              </form>
            ) : (
              /* VENDOR REGISTER FORM (Same Card UI) */
              <form onSubmit={handleRegisterSubmit} className="auth-form">
                <div className="input-field-group">
                  <label htmlFor="vendor-reg-name">Name</label>
                  <div className="input-with-icon">
                    <User size={18} className="field-icon" />
                    <input 
                      id="vendor-reg-name"
                      type="text" 
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="input-field-group">
                  <label htmlFor="vendor-reg-email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="field-icon" />
                    <input 
                      id="vendor-reg-email"
                      type="email" 
                      placeholder="Enter your email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required 
                    />
                    {signUpEmail.includes('@') && <CheckCircle size={18} className="valid-check" />}
                  </div>
                </div>

                <div className="input-field-group">
                  <label htmlFor="vendor-reg-phone">Phone Number (Optional)</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="field-icon" />
                    <input 
                      id="vendor-reg-phone"
                      type="tel" 
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field-group">
                  <label htmlFor="vendor-reg-password">Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="field-icon" />
                    <input 
                      id="vendor-reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required 
                    />
                    <button 
                      type="button" 
                      className="eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="button-group-dual">
                  <button type="submit" className="login-primary-btn" disabled={loading}>
                    <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
                    <ArrowRight size={17} />
                  </button>
                  <button 
                    type="button"
                    className="create-account-btn"
                    onClick={() => { setIsSignUp(false); setError(''); setSuccessMsg(''); }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {/* Switch to Customer Login */}
            <div className="other-portals-section">
              <span className="or-text">Are you a customer?</span>
              <div className="portals-dual-links">
                <Link to="/login" className="portal-pill-link">
                  <User size={15} />
                  <span>Switch to Customer Login</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
