import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  PackageSearch,
  BadgeCheck,
  Share2,
  MapPin
} from 'lucide-react';
import { findProduct, getRelatedProducts, categories } from '../data/catalog';
import { formatINR, discountPercent, DELIVERY_METHODS, getDeliveryMethod } from '../utils/pricing';
import { useCart } from '../context/CartContext';
import { Breadcrumbs } from '../components/ui/PageHeader';
import QuantityStepper from '../components/ui/QuantityStepper';
import ProductCard from '../components/ui/ProductCard';
import { EmptyState, LoadingBlock } from '../components/ui/States';
import { Tabs, TabPanel } from '../components/ui/Tabs';
import { isWishlisted, toggleWishlistItem } from '../components/ui/ProductCard';
import api from '../utils/api';
import { getCurrentCustomer } from '../utils/storage';
import './ProductDetails.css';

export default function ProductDetails({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const cart = useCart();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [wished, setWished] = useState(false);
  const [tab, setTab] = useState('description');
  const [added, setAdded] = useState(false);

  const customer = getCurrentCustomer();
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    name: customer?.name || '',
    rating: 5,
    comment: ''
  });
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const found = findProduct(id);
      setProduct(found);
      setActiveImage(0);
      setQuantity(1);
      setSelectedVariant(found?.variants?.[0] || '');
      setWished(found ? isWishlisted(found.id) : false);
      setLoading(false);
    }, 180);
    return () => clearTimeout(t);
  }, [id]);

  useEffect(() => {
    if (!product?.id) return;
    let cancelled = false;
    api.getReviews({ productId: product.id })
      .then((data) => {
        if (!cancelled) setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => { cancelled = true; };
  }, [product?.id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      setReviewStatus('Please write a short review.');
      return;
    }

    setReviewSubmitting(true);
    setReviewStatus('');

    try {
      const data = await api.createReview({
        productId: product.id,
        vendorId: product.vendorId || null,
        productTitle: product.title,
        customerName: reviewForm.name.trim() || customer?.name || 'Customer',
        customerEmail: customer?.email || null,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim()
      });

      if (data?.success && data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setReviewForm({ name: customer?.name || reviewForm.name, rating: 5, comment: '' });
        setReviewStatus('Thanks! Your review has been posted.');
      }
    } catch (err) {
      setReviewStatus(err.message || 'Could not post your review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const related = useMemo(() => getRelatedProducts(product, 4), [product]);
  const category = product ? categories.find((c) => c.slug === product.category) : null;
  const add = onAddToCart || cart?.add;
  const delivery = getDeliveryMethod('standard') || DELIVERY_METHODS[0];

  const crumbs = [
    { label: 'Shop', to: '/shop' },
    ...(category ? [{ label: category.title, to: `/category/${category.slug}` }] : []),
    ...(product ? [{ label: product.title }] : [])
  ];

  const handleAdd = () => {
    if (!product || !add) return;
    add(product, quantity, selectedVariant || null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    handleAdd();
    navigate('/checkout');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product?.title, url });
      else if (navigator.clipboard) await navigator.clipboard.writeText(url);
    } catch {
      /* sharing dismissed or unsupported */
    }
  };

  if (loading) {
    return (
      <div className="container pdp-loading">
        <Breadcrumbs items={[{ label: 'Shop', to: '/shop' }, { label: 'Loading…' }]} />
        <div className="pdp-grid">
          <LoadingBlock height={440} label="Loading product image" />
          <div className="pdp-loading-copy">
            <LoadingBlock height={24} label="Loading product title" />
            <LoadingBlock height={44} label="Loading product price" />
            <LoadingBlock height={90} label="Loading product details" />
            <LoadingBlock height={56} label="Loading product actions" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <section className="section">
        <div className="container">
          <EmptyState
            icon={<PackageSearch size={30} />}
            title="Product not found"
            text={`We could not find the product “${id}”. It may have been removed by the seller.`}
            actions={
              <>
                <Link to="/shop" className="btn btn-primary">Back to shop</Link>
                <Link to="/" className="btn btn-ghost">Go home</Link>
              </>
            }
          />
        </div>
      </section>
    );
  }

  const gallery = product.images && product.images.length ? product.images : [product.image];
  const off = discountPercent(product.price, product.compareAt);
  const specs = product.specs || product.specifications || [];

  return (
    <>
      <div className="crumbs-bar">
        <div className="container"><Breadcrumbs items={crumbs} /></div>
      </div>

      <section className="section-tight">
        <div className="container pdp-grid">
          {/* ---------- Gallery ---------- */}
          <div className="pdp-gallery">
            <div className="pdp-main-image">
              {off > 0 && <span className="badge badge-sale pdp-off-badge">{off}% off</span>}
              <img
                src={gallery[activeImage]}
                alt={`${product.title} — image ${activeImage + 1}`}
                width="720"
                height="720"
              />
            </div>

            {gallery.length > 1 && (
              <div className="pdp-thumbs" role="tablist" aria-label="Product images">
                {gallery.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    role="tab"
                    aria-selected={index === activeImage}
                    className={`pdp-thumb ${index === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={src} alt={`View ${index + 1}`} width="80" height="80" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------- Info ---------- */}
          <div className="pdp-info">
            <div className="pdp-meta-row">
              <span className="seller-pill"><BadgeCheck size={14} /> {product.seller || 'EcShopping Seller'}</span>
              <button type="button" className="pdp-icon-btn" onClick={handleShare} aria-label="Share this product" title="Share">
                <Share2 size={17} />
              </button>
              <button
                type="button"
                className={`pdp-icon-btn ${wished ? 'active' : ''}`}
                onClick={() => setWished(toggleWishlistItem(product))}
                aria-pressed={wished}
                aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                title="Wishlist"
              >
                <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
              </button>
            </div>

            <h1 className="pdp-title">{product.title}</h1>

            <a
              className="pdp-rating"
              href="#pdp-tabs"
              onClick={() => setTab('reviews')}
            >
              <span className="rating-stars">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={15} fill={i < Math.round(product.rating || 0) ? 'currentColor' : 'none'} />
                ))}
              </span>
              <strong>{Number(product.rating || 0).toFixed(1)}</strong>
                <span>{reviews.length} {reviews.length === 1 ? 'rating' : 'ratings'}</span>
            </a>

            <div className="pdp-price-block">
              <span className="pdp-price">{formatINR(product.price)}</span>
              {product.compareAt && product.compareAt > product.price && (
                <>
                  <span className="pdp-compare">{formatINR(product.compareAt)}</span>
                  <span className="badge badge-sale">Save {formatINR(product.compareAt - product.price)}</span>
                </>
              )}
              <p className="tiny muted">Inclusive of all taxes · Shipping calculated at checkout</p>
            </div>

            <p className="pdp-description">{product.description}</p>

            {product.variants && product.variants.length > 0 && (
              <div className="pdp-variants">
                <div className="pdp-label-row">
                  <span className="pdp-field-label">Select pack / variant</span>
                  <span className="tiny muted">Selected: {selectedVariant}</span>
                </div>
                <div className="pdp-variant-list" role="radiogroup" aria-label="Product variant">
                  {product.variants.map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      role="radio"
                      aria-checked={selectedVariant === variant}
                      className={`pdp-variant ${selectedVariant === variant ? 'active' : ''}`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pdp-buy-row">
              <QuantityStepper value={quantity} onChange={setQuantity} label="quantity" max={10} />
              <button
                type="button"
                className="btn btn-outline btn-lg pdp-add-btn"
                onClick={handleAdd}
                disabled={product.inStock === false}
              >
                <ShoppingCart size={17} /> {added ? 'Added to cart' : 'Add to cart'}
              </button>
              <button
                type="button"
                className="btn btn-accent btn-lg pdp-buy-btn"
                onClick={handleBuyNow}
                disabled={product.inStock === false}
              >
                <Zap size={17} /> Buy now
              </button>
            </div>

            {product.inStock === false ? (
              <p className="notice notice-danger pdp-stock-note">This item is currently out of stock.</p>
            ) : (
              <p className="notice notice-success pdp-stock-note">
                <strong>In stock</strong> · Dispatched within 24 hours by {product.seller || 'the seller'}.
              </p>
            )}

            <ul className="pdp-assurances">
              <li>
                <Truck size={17} />
                <span>
                  <strong>Delivery</strong>
                  <small>{delivery.detail || '3-5 business days'} · {delivery.price === 0 ? 'Free' : formatINR(delivery.price)}</small>
                </span>
              </li>
              <li>
                <RotateCcw size={17} />
                <span>
                  <strong>Easy replacements</strong>
                  <small>Damaged or wrong item? Raise a request within 48 hours.</small>
                </span>
              </li>
              <li>
                <ShieldCheck size={17} />
                <span>
                  <strong>Secure checkout</strong>
                  <small>PhonePe and cash on delivery at the final step.</small>
                </span>
              </li>
              <li>
                <MapPin size={17} />
                <span>
                  <strong>Sold by {product.seller || 'EcShopping Seller'}</strong>
                  <small>Identity-verified marketplace seller</small>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- Tabs ---------- */}
      <section className="section" id="pdp-tabs">
        <div className="container">
          <Tabs
            tabs={[
              { id: 'description', label: 'Description' },
              { id: 'specs', label: 'Specifications' },
              { id: 'reviews', label: 'Reviews' }
            ]}
            active={tab}
            onChange={setTab}
            ariaLabel="Product information"
          />

          <TabPanel active={tab} id="description">
            <div className="prose pdp-panel">
              <p>{product.description}</p>
              {product.highlights && product.highlights.length > 0 && (
                <ul>
                  {product.highlights.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
              <p className="tiny muted">
                Specifications and highlights are supplied by the seller and may be updated without notice.
              </p>
            </div>
          </TabPanel>

          <TabPanel active={tab} id="specs">
            <div className="pdp-panel">
              {specs.length > 0 ? (
                <dl className="spec-list">
                  {specs.map((spec) => (
                    <div key={spec.label || spec.name}>
                      <dt>{spec.label || spec.name}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="muted">The seller has not listed detailed specifications for this product yet.</p>
              )}
            </div>
          </TabPanel>

          <TabPanel active={tab} id="reviews">
            <div className="pdp-panel">
              <form className="pdp-review-form" onSubmit={handleReviewSubmit}>
                <h3>Write a review</h3>
                <div className="pdp-review-form-row">
                  <label className="field">
                    <span className="field-label">Your name</span>
                    <input
                      className="input"
                      type="text"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Rating</span>
                    <select
                      className="input"
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="field">
                  <span className="field-label">Review</span>
                  <textarea
                    className="input"
                    rows="3"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Tell others what you thought about this product"
                  />
                </label>
                {reviewStatus && <p className="muted" role="status">{reviewStatus}</p>}
                <button type="submit" className="btn btn-primary" disabled={reviewSubmitting}>
                  {reviewSubmitting ? 'Posting…' : 'Post review'}
                </button>
              </form>

              <div className="pdp-review-list">
                {reviews.map((review) => (
                  <article className="pdp-review" key={review.id}>
                    <div className="pdp-review-head">
                      <span className="avatar sm accent">{(review.customerName || 'C')[0]}</span>
                      <span>
                        <strong>{review.customerName || 'Customer'}</strong>
                        <small className="muted">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                        </small>
                      </span>
                      <span className="rating-stars" aria-label={`${review.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={13} fill={n <= review.rating ? 'currentColor' : 'none'} />
                        ))}
                      </span>
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))}
                {reviews.length === 0 && (
                  <p className="muted">No reviews yet. Be the first to share your experience.</p>
                )}
              </div>
            </div>
          </TabPanel>
        </div>
      </section>

      {/* ---------- Related ---------- */}
      {related.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="pdp-related-head">
              <div>
                <span className="eyebrow">You may also like</span>
                <h2>Related products</h2>
              </div>
              <Link to={category ? `/category/${category.slug}` : '/shop'} className="link-more">
                View all in {category ? category.title : 'shop'}
              </Link>
            </div>
            <div className="product-grid cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} onAddToCart={onAddToCart} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
