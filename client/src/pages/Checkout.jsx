import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, Banknote, Tag, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { addCustomer, addOrder } from '../utils/storage';
import {
  formatINR,
  computeTotals,
  validateCoupon,
  DELIVERY_METHODS
} from '../utils/pricing';
import { useCart } from '../context/CartContext';
import { PageHero } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/States';
import PhonePe from '../components/checkout/PhonePe';
import PaymentStates from '../components/checkout/PaymentStates';
import { initiatePhonePePayment } from '../components/checkout/paymentGateway';
import './Checkout.css';

const DELIVERY_ICONS = { standard: Truck, express: Truck };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;
const PIN_RE = /^\d{6}$/;

export default function Checkout({ cartItems, clearCart, loggedInCustomer, onCustomerLogin }) {
  const navigate = useNavigate();
  const ctx = useCart();
  const items = ctx?.items ?? cartItems ?? [];

  const [firstName, setFirstName] = useState(loggedInCustomer?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(loggedInCustomer?.name?.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(loggedInCustomer?.email || '');
  const [phone, setPhone] = useState(loggedInCustomer?.phone || '');
  const [street, setStreet] = useState(loggedInCustomer?.address || '');
  const [city, setCity] = useState(loggedInCustomer?.city || '');
  const [stateCode, setStateCode] = useState(loggedInCustomer?.state || 'TN');
  const [postcode, setPostcode] = useState(loggedInCustomer?.postcode || '');

  const [deliveryId, setDeliveryId] = useState('standard');
  const [couponInput, setCouponInput] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [payState, setPayState] = useState('idle');
  const [payInfo, setPayInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const totals = useMemo(
    () => computeTotals({ items, couponResult, deliveryMethodId: deliveryId }),
    [items, couponResult, deliveryId]
  );

  if (items.length === 0) {
    return (
      <>
        <PageHero title="Checkout" subtitle="Secure checkout in a few short steps." crumbs={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
        <section className="section">
          <div className="container">
            <EmptyState
              icon={<ShoppingBag size={30} />}
              title="Your cart is empty"
              text="Add a few products before heading to checkout."
              actions={
                <>
                  <Link to="/shop" className="btn btn-primary">Browse the shop <ArrowRight size={16} /></Link>
                  <Link to="/cart" className="btn btn-ghost">Back to cart</Link>
                </>
              }
            />
          </div>
        </section>
      </>
    );
  }

  const applyCoupon = (event) => {
    event.preventDefault();
    const result = validateCoupon(couponInput, totals.subtotal);
    setCouponResult(result);
  };

  const clearCoupon = () => {
    setCouponInput('');
    setCouponResult(null);
  };

  const validate = () => {
    const next = {};
    if (!firstName.trim()) next.firstName = 'Enter your first name.';
    if (!lastName.trim()) next.lastName = 'Enter your last name.';
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!PHONE_RE.test(phone.trim())) next.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (!street.trim()) next.street = 'Enter your street address.';
    if (!city.trim()) next.city = 'Enter your town or city.';
    if (!PIN_RE.test(postcode.trim())) next.postcode = 'Enter a valid 6-digit PIN code.';
    return next;
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.querySelector('.field-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    /* Existing auto-account behaviour: create or log in the customer silently. */
    let autoCredentials = null;
    if (!loggedInCustomer) {
      const generatedPassword = Math.random().toString(36).slice(-8) + 'A1!';
      const created = addCustomer({
        name: fullName,
        email: email.trim(),
        phone: phone.trim(),
        address: street.trim(),
        city: city.trim(),
        state: stateCode,
        postcode: postcode.trim(),
        password: generatedPassword
      });

      if (created?.success && created.customer) {
        onCustomerLogin?.(created.customer);
        autoCredentials = { email: email.trim(), password: generatedPassword, isNew: true };
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          await fetch(`${apiUrl}/api/send-welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: fullName, email: email.trim(), password: generatedPassword })
          });
        } catch {
          /* Backend email service unavailable in this release — account still works locally. */
        }
      } else if (created?.customer) {
        onCustomerLogin?.(created.customer);
        autoCredentials = { email: email.trim(), isNew: false };
      }
    }

    /* PhonePe handoff — the order is not created if the payment fails. */
    let payment = null;
    if (paymentMethod === 'phonepe') {
      setPayState('processing');
      setPayInfo(null);
      payment = await initiatePhonePePayment({
        orderId: `DRAFT-${Date.now()}`,
        amount: totals.total
      });
      setPayInfo(payment);

      if (payment.status === 'failed') {
        setPayState('failed');
        setSubmitting(false);
        return;
      }
      setPayState(payment.status === 'pending' ? 'pending' : 'success');
    }

    const order = addOrder({
      customerName: fullName,
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      shippingAddress: {
        street: street.trim(),
        city: city.trim(),
        state: stateCode,
        postcode: postcode.trim()
      },
      email: email.trim(),
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        variant: item.variant || null,
        quantity: item.quantity,
        seller: item.seller || item.soldBy || 'EcShopping Seller',
        vendorId: item.vendorId || null
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      total: totals.total,
      totalAmount: totals.total,
      couponCode: couponResult?.ok ? couponResult.coupon.code : null,
      deliveryMethod: deliveryId,
      paymentMethod,
      paymentStatus: paymentMethod === 'phonepe' ? (payment.status === 'pending' ? 'pending' : 'paid') : 'pending',
      paymentReference: payment?.reference || null,
      paymentNote: payment?.message || null
    });

    try {
      localStorage.setItem('ecshopping_last_order', JSON.stringify(order));
    } catch {
      /* storage unavailable — confirmation page falls back to route state */
    }

    clearCart?.();
    setSubmitting(false);
    navigate(`/order-confirmation/${order.id}`, { state: { order, autoCredentials, payment } });
  };

  const setPayment = (method) => {
    setPaymentMethod(method);
    if (method !== 'phonepe') {
      setPayState('idle');
      setPayInfo(null);
    }
  };

  const fieldError = (key) => (errors[key] ? <p className="field-error" role="alert">{errors[key]}</p> : null);

  return (
    <>
      <PageHero
        title="Checkout"
        subtitle={`${items.length} item${items.length === 1 ? '' : 's'} · ${formatINR(totals.total)} to pay`}
        crumbs={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]}
      />

      <form className="container checkout-layout" onSubmit={placeOrder} noValidate>
        <div className="checkout-main">
          {/* 1 — Contact */}
          <section className="panel co-section">
            <header className="co-head">
              <span className="co-num">1</span>
              <div>
                <h2>Contact details</h2>
                <p className="tiny muted">We send order updates to these details.</p>
              </div>
            </header>

            <div className="form-grid form-grid-2">
              <label className="field">
                <span className="field-label">First name *</span>
                <input className="input" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
                {fieldError('firstName')}
              </label>
              <label className="field">
                <span className="field-label">Last name *</span>
                <input className="input" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
                {fieldError('lastName')}
              </label>
              <label className="field">
                <span className="field-label">Email address *</span>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" />
                {fieldError('email')}
              </label>
              <label className="field">
                <span className="field-label">Mobile number *</span>
                <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="98765 43210" />
                {fieldError('phone')}
              </label>
            </div>

            {!loggedInCustomer && (
              <p className="notice notice-info co-account-note">
                <CheckCircle2 size={15} /> New here? We will create a basic account automatically so you can track this order.
              </p>
            )}
          </section>

          {/* 2 — Address */}
          <section className="panel co-section">
            <header className="co-head">
              <span className="co-num">2</span>
              <div>
                <h2>Shipping address</h2>
                <p className="tiny muted">Where should the seller send this order?</p>
              </div>
            </header>

            <div className="form-grid">
              <label className="field">
                <span className="field-label">Street address *</span>
                <input className="input" type="text" value={street} onChange={(e) => setStreet(e.target.value)} autoComplete="street-address" placeholder="House number and street name" />
                {fieldError('street')}
              </label>
            </div>

            <div className="form-grid form-grid-2">
              <label className="field">
                <span className="field-label">Town / city *</span>
                <input className="input" type="text" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
                {fieldError('city')}
              </label>
              <label className="field">
                <span className="field-label">State *</span>
                <select className="select" value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
                  <option value="TN">Tamil Nadu</option>
                  <option value="KA">Karnataka</option>
                  <option value="KL">Kerala</option>
                  <option value="AP">Andhra Pradesh</option>
                  <option value="TS">Telangana</option>
                  <option value="MH">Maharashtra</option>
                  <option value="DL">Delhi</option>
                </select>
              </label>
              <label className="field">
                <span className="field-label">PIN code *</span>
                <input className="input" type="text" inputMode="numeric" maxLength={6} value={postcode} onChange={(e) => setPostcode(e.target.value.replace(/\D/g, ''))} autoComplete="postal-code" placeholder="600001" />
                {fieldError('postcode')}
              </label>
            </div>
          </section>

          {/* 3 — Delivery */}
          <section className="panel co-section">
            <header className="co-head">
              <span className="co-num">3</span>
              <div>
                <h2>Delivery method</h2>
                <p className="tiny muted">Speed and cost — pick what suits this order.</p>
              </div>
            </header>

            <div className="co-delivery-list">
              {DELIVERY_METHODS.map((method) => {
                const Icon = DELIVERY_ICONS[method.id] || Truck;
                const freeByCoupon = couponResult?.ok && couponResult.freeShipping;
                const price = method.freeOver && totals.subtotal >= method.freeOver ? 0 : method.price;
                return (
                  <label key={method.id} className={`co-delivery ${deliveryId === method.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryId === method.id}
                      onChange={() => setDeliveryId(method.id)}
                    />
                    <Icon size={19} />
                    <span className="co-delivery-main">
                      <strong>{method.label}</strong>
                      <small>{method.detail}</small>
                    </span>
                    <span className="co-delivery-price">
                      {price === 0 || freeByCoupon ? <em>FREE</em> : formatINR(price)}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* 4 — Payment */}
          <section className="panel co-section">
            <header className="co-head">
              <span className="co-num">4</span>
              <div>
                <h2>Payment</h2>
                <p className="tiny muted">Choose how you would like to pay for this order.</p>
              </div>
            </header>

            <div className="co-pay-list">
              <PhonePe
                selected={paymentMethod === 'phonepe'}
                onSelect={setPayment}
                amountLabel={formatINR(totals.total)}
              />

              <label className={`co-pay-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPayment('cod')} />
                <Banknote size={19} />
                <span className="co-pay-main">
                  <strong>Cash on delivery</strong>
                  <small>Pay the courier when your order arrives.</small>
                </span>
              </label>
            </div>

            {paymentMethod === 'phonepe' && (
              <PaymentStates
                state={payState}
                message={payInfo?.message}
                reference={payInfo?.reference}
                onRetry={() => {
                  setPayState('idle');
                  setPayInfo(null);
                }}
                onCancel={() => setPayment('cod')}
              />
            )}
          </section>
        </div>

        {/* ---------- Summary ---------- */}
        <aside className="checkout-summary" aria-label="Order summary">
          <div className="panel co-summary-panel">
            <h2>Your order</h2>

            <ul className="co-items">
              {items.map((item) => (
                <li key={`${item.id}::${item.variant || 'default'}`}>
                  <img src={item.image} alt="" width="48" height="48" />
                  <span className="co-item-name">
                    {item.title}
                    {item.variant && <small> · {item.variant}</small>}
                    <small>Qty {item.quantity}</small>
                  </span>
                  <span className="co-item-price">{formatINR((Number(item.price) || 0) * item.quantity)}</span>
                </li>
              ))}
            </ul>

            {/* Coupon */}
            <div className="co-coupon">
              <label className="sr-only" htmlFor="coupon-code">Coupon code</label>
              <div className="co-coupon-row">
                <Tag size={16} />
                <input
                  id="coupon-code"
                  type="text"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={couponResult?.ok}
                />
                {couponResult?.ok ? (
                  <button type="button" className="btn btn-sm btn-ghost" onClick={clearCoupon}>Remove</button>
                ) : (
                  <button type="button" className="btn btn-sm btn-outline" onClick={applyCoupon}>Apply</button>
                )}
              </div>
              {couponResult && (
                <p className={`co-coupon-msg ${couponResult.ok ? 'ok' : 'err'}`} role="status">
                  {couponResult.message}
                </p>
              )}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatINR(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="summary-row discount">
                <span>Coupon ({couponResult?.coupon?.code})</span>
                <span>−{formatINR(totals.discount)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping · {DELIVERY_METHODS.find((m) => m.id === deliveryId)?.label}</span>
              <span>{totals.shipping === 0 ? 'FREE' : formatINR(totals.shipping)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatINR(totals.total)}</span>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block co-place" disabled={submitting}>
              {submitting
                ? (paymentMethod === 'phonepe' ? 'Processing payment…' : 'Placing order…')
                : `Place order · ${formatINR(totals.total)}`}
            </button>

            <p className="co-secure-note">
              <Lock size={13} /> Your details are encrypted and used only to fulfil this order.
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}
