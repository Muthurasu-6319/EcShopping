import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, CheckCircle, ArrowRight, Store } from 'lucide-react';
import userLoginImg from '../assets/login-page/user-login.png';
import { getCustomers, addCustomer } from '../utils/storage';
import './Login.css';

export default function Login({ onCustomerLogin, loggedInCustomer }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Sign up form state
  const [name, setName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to profile
  if (loggedInCustomer) {
    navigate('/profile');
    return null;
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
      });
      const data = await res.json();

      if (data.success && data.user) {
        onCustomerLogin(data.user);
        addCustomer(data.user); // Sync local storage
        setSuccessMsg('Login successful! Welcome back.');
        setTimeout(() => {
          navigate('/profile');
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

    // Local storage fallback
    const customers = getCustomers();
    const customer = customers.find(
      c => c.email.toLowerCase() === loginEmail.trim().toLowerCase() && c.password === loginPassword
    );

    setLoading(false);
    if (customer) {
      onCustomerLogin(customer);
      setSuccessMsg('Login successful! Welcome back.');
      setTimeout(() => {
        navigate('/profile');
      }, 500);
    } else {
      setError('Invalid email or password. If you are new, please click "Create Account".');
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !signUpEmail || !signUpPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/auth/user/register`, {
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

      if (data.success && data.user) {
        onCustomerLogin(data.user);
        addCustomer(data.user); // Sync local storage
        setSuccessMsg('Account created successfully! Welcome to EcShopping.');
        setTimeout(() => {
          navigate('/profile');
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

    // Local storage fallback
    const result = addCustomer({
      name: name.trim(),
      email: signUpEmail.trim().toLowerCase(),
      phone: phone.trim(),
      password: signUpPassword,
      address: '',
      city: '',
      state: 'TN',
      postcode: ''
    });

    setLoading(false);
    if (result.success) {
      onCustomerLogin(result.customer);
      setSuccessMsg('Account created successfully! Welcome to EcShopping.');
      setTimeout(() => {
        navigate('/profile');
      }, 600);
    } else {
      setError(result.message || 'Email already registered. Please login.');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* Left Side: 3D Customer Illustration */}
        <div className="login-illustration-side">
          <div className="illustration-brand-tag">
            <span className="brand-dot"></span>
            <span>Customer Portal</span>
          </div>

          <div className="illustration-visual">
            <img 
              src={userLoginImg} 
              alt="Customer Shopping at EcShopping" 
              className="login-side-hero-img" 
            />
          </div>

          <div className="illustration-caption">
            <h3>Fresh & Organic Everyday</h3>
            <p>Shop farm-fresh produce, groceries and authentic products directly from local farmers.</p>
          </div>
        </div>

        {/* Right Side: Login / Register Form */}
        <div className="login-form-side">
          <div className="form-content-box">
            <div className="form-header">
              <h2 className="welcome-title">{isSignUp ? 'Create Account :)' : 'Welcome Back :)'}</h2>
              <p className="welcome-subtitle">
                {isSignUp 
                  ? 'Join EcShopping community to order fresh organic goods 🌿' 
                  : 'To keep connected with us please login with your personal information by email address and password 🔐'}
              </p>
            </div>

            {error && <div className="login-alert error-alert">{error}</div>}
            {successMsg && <div className="login-alert success-alert">{successMsg}</div>}

            {!isSignUp ? (
              /* LOGIN FORM (Common clean field names) */
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="input-field-group">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="field-icon" />
                    <input 
                      id="login-email"
                      type="email" 
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                    {loginEmail.includes('@') && <CheckCircle size={18} className="valid-check" />}
                  </div>
                </div>

                <div className="input-field-group">
                  <label htmlFor="login-password">Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="field-icon" />
                    <input 
                      id="login-password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="eye-toggle" 
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
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
                    onClick={(e) => { e.preventDefault(); alert("Please contact support or check your welcome email for credentials."); }}
                  >
                    Forgot Password?
                  </a>
                </div>

                <div className="button-group-dual">
                  <button type="submit" className="login-primary-btn" disabled={loading}>
                    <span>{loading ? 'Logging in...' : 'Login Now'}</span>
                    <ArrowRight size={17} />
                  </button>
                  <button 
                    type="button" 
                    className="create-account-btn" 
                    onClick={() => { setIsSignUp(true); setError(''); setSuccessMsg(''); }}
                  >
                    Create Account
                  </button>
                </div>
              </form>
            ) : (
              /* SIGN UP FORM (Common clean field names) */
              <form onSubmit={handleSignUpSubmit} className="auth-form">
                <div className="input-field-group">
                  <label htmlFor="signup-name">Name</label>
                  <div className="input-with-icon">
                    <User size={18} className="field-icon" />
                    <input 
                      id="signup-name"
                      type="text" 
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-field-group">
                  <label htmlFor="signup-email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} className="field-icon" />
                    <input 
                      id="signup-email"
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
                  <label htmlFor="signup-phone">Phone Number (Optional)</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="field-icon" />
                    <input 
                      id="signup-phone"
                      type="tel" 
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-field-group">
                  <label htmlFor="signup-password">Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="field-icon" />
                    <input 
                      id="signup-password"
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
                    <span>{loading ? 'Creating Account...' : 'Register Now'}</span>
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

            {/* Vendor Switch Link */}
            <div className="other-portals-section">
              <span className="or-text">Are you a registered seller?</span>
              <div className="portals-dual-links">
                <Link to="/vendor" className="portal-pill-link">
                  <Store size={15} />
                  <span>Switch to Vendor Login</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
