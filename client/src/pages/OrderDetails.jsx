import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, Receipt, Truck, ArrowLeft } from 'lucide-react';
import { getOrders } from '../utils/storage';
import { paymentStatusDisplay } from '../utils/orderSync';
import { formatINR, getDeliveryMethod } from '../utils/pricing';
import { PageHero } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/States';
import {
  formatOrderDate,
  statusBadgeClass,
  getTimeline,
  PAYMENT_STATUS_LABELS
} from '../utils/orderStatus';
import './Orders.css';

export default function OrderDetails({ loggedInCustomer }) {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const order = useMemo(() => {
    const all = getOrders();
    const found = all.find((o) => String(o.id) === String(orderId) || String(o.orderNumber) === String(orderId));
    if (!found) return null;
    if (
      loggedInCustomer?.email &&
      found.customerEmail &&
      found.customerEmail !== loggedInCustomer.email
    ) {
      return { restricted: true };
    }
    return found;
  }, [orderId, loggedInCustomer]);

  if (!order || order.restricted) {
    return (
      <>
        <PageHero title="Order details" crumbs={[{ label: 'My orders', to: '/orders' }, { label: 'Order details' }]} />
        <section className="section">
          <div className="container">
            <EmptyState
              icon={<Package size={30} />}
              title={order?.restricted ? 'This order belongs to another account' : 'Order not found'}
              text={order?.restricted
                ? 'Sign in with the account used at checkout to view this order.'
                : `We could not find an order with the reference “${orderId}” in this browser.`}
              actions={
                <>
                  <Link to="/orders" className="btn btn-primary">My orders</Link>
                  <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Go back</button>
                </>
              }
            />
          </div>
        </section>
      </>
    );
  }

  const method = getDeliveryMethod(order.deliveryMethod || 'standard');
  const timeline = getTimeline(order);

  return (
    <>
      <PageHero
        title={`Order ${order.orderNumber || order.id}`}
        subtitle={`Placed on ${formatOrderDate(order.date)} · ${order.items?.length || 0} item${order.items?.length === 1 ? '' : 's'}`}
        crumbs={[{ label: 'My orders', to: '/orders' }, { label: order.orderNumber || String(order.id) }]}
      />

      <div className="container od-wrap">
        <div className="panel od-head">
          <div className="od-head-main">
            <strong>Reference {order.orderNumber || order.id}</strong>
            <span>Payment: {paymentStatusDisplay(order, PAYMENT_STATUS_LABELS)} · Delivery: {method.label} ({method.detail})</span>
          </div>
          <div className="od-head-badges">
            <span className={statusBadgeClass(order.status)}>
              {(order.status || 'confirmed').replace(/_/g, ' ')}
            </span>
            <span className="badge badge-soft">{order.paymentMethod === 'phonepe' ? 'PhonePe' : 'Cash on delivery'}</span>
          </div>
        </div>

        <div className="od-grid">
          <section className="panel od-block">
            <h3><Package size={17} /> Items</h3>
            <ul className="od-items">
              {(order.items || []).map((item) => (
                <li key={`${item.id}-${item.variant || 'default'}`}>
                  <img src={item.image} alt="" width="56" height="56" />
                  <span className="od-item-copy">
                    <strong>{item.title}</strong>
                    {item.variant && <small>Variant: {item.variant}</small>}
                    <small>Sold by {item.seller || 'EcShopping Seller'} · Qty {item.quantity}</small>
                  </span>
                  <span className="od-item-price">
                    {formatINR((Number(item.price) || 0) * (item.quantity || 1))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="od-side">
            <section className="panel od-block">
              <h3><Truck size={17} /> Status</h3>
              <ul className="timeline">
                {timeline.map((step) => (
                  <li key={step.id} className={`timeline-item ${step.done ? 'done' : ''} ${step.current ? 'current' : ''}`}>
                    <span className="timeline-dot" />
                    <div className="timeline-body">
                      <h4>{step.label}</h4>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel od-block">
              <h3><Receipt size={17} /> Payment summary</h3>
              <dl className="od-totals">
                <div><dt>Subtotal</dt><dd>{formatINR(order.subtotal || 0)}</dd></div>
                {order.discount > 0 && (
                  <div className="od-save"><dt>Coupon {order.couponCode ? `(${order.couponCode})` : ''}</dt><dd>−{formatINR(order.discount)}</dd></div>
                )}
                <div><dt>Shipping</dt><dd>{order.shipping === 0 ? 'FREE' : formatINR(order.shipping || 0)}</dd></div>
                <div className="od-total"><dt>Total</dt><dd>{formatINR(order.totalAmount ?? order.total ?? 0)}</dd></div>
              </dl>
            </section>

            <section className="panel od-block">
              <h3><MapPin size={17} /> Shipping address</h3>
              {order.shippingAddress ? (
                <p className="od-address">
                  <strong>{order.customerName}</strong>
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postcode}<br />
                  {order.customerPhone}
                </p>
              ) : (
                <p className="muted tiny">No address recorded for this order.</p>
              )}
            </section>
          </div>
        </div>

        <div className="od-actions">
          <Link to={`/track-order?id=${encodeURIComponent(order.id)}`} className="btn btn-primary">
            <Truck size={16} /> Track this order
          </Link>
          <Link to="/orders" className="btn btn-outline"><ArrowLeft size={16} /> Back to my orders</Link>
          <Link to="/shop" className="btn btn-ghost">Continue shopping</Link>
        </div>
      </div>
    </>
  );
}
