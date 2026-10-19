import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Sprout, IndianRupee, HeartHandshake, Quote, Mail, Star, PackageCheck, ShoppingBasket, Wallet, CalendarClock, Play, X } from 'lucide-react';
import {
  categories,
  collections,
  products,
  getCollection,
  getCatalogProducts,
  benefits,
  testimonials,
  concerns,
  shopVideos,
  marqueeMessages
} from '../../data/catalog';
import ProductCard from '../ui/ProductCard';
import SectionHead from '../ui/SectionHead';
import heroImg from '../../assets/hero.png';
import leafTopRight from '../../assets/corner-leaves-top-right.png';
import './home.css';

/* ---------------------------------------------------------------
   Hero
   --------------------------------------------------------------- */

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-deco" aria-hidden="true">
        <img src={leafTopRight} alt="" className="hero-deco-leaf leaf-tr" />
      </div>

      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="hero-eyebrow"><Sprout size={15} /> Farm-direct marketplace</span>
          <h1>
            Local sellers, <em>delivered fresh</em> to your doorstep.
          </h1>
          <p className="hero-lead">
            Shop produce, pantry staples, dairy, livestock and handmade goods from
            identity-verified sellers across Tamil Nadu — with honest specs and transparent pricing.
          </p>

          <div className="hero-ctas">
            <Link to="/shop" className="btn btn-primary btn-lg">
              Shop all products <ArrowRight size={17} />
            </Link>
            <Link to="/collection/bestsellers" className="btn btn-outline btn-lg">
              Browse bestsellers
            </Link>
          </div>

          <ul className="hero-trust">
            <li><Truck size={16} /> Free delivery over ₹499</li>
            <li><ShieldCheck size={16} /> Verified sellers only</li>
            <li><RotateCcw size={16} /> 48-hour replacements</li>
          </ul>
        </div>

        <div className="hero-media">
          <div className="hero-frame">
            <img
              src={heroImg}
              alt="Fresh farm produce packed for delivery"
              width="720"
              height="560"
            />
          </div>
          <div className="hero-float hero-float-1">
            <span className="hero-float-icon"><CalendarClock size={17} /></span>
            <span><strong>Same-day dispatch</strong><small>Orders before 4 PM</small></span>
          </div>
          <div className="hero-float hero-float-2">
            <span className="hero-float-icon gold"><PackageCheck size={17} /></span>
            <span><strong>{products.length}+ products live</strong><small>{categories.length} categories, verified sellers</small></span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   Categories
   --------------------------------------------------------------- */

export function CategoryGrid() {
  return (
    <section className="section">
      <div className="container">
        <SectionHead
          eyebrow="Shop by category"
          title="Find what you need, aisle by aisle"
          subtitle="Six everyday categories, filled by sellers who source and produce locally."
          linkTo="/shop"
          linkLabel="All products"
        />

        <div className="cat-grid">
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/category/${cat.slug}`} className="cat-card">
              <div className="cat-media">
                <img src={cat.image} alt="" width="420" height="300" loading="lazy" />
              </div>
              <div className="cat-body">
                <h3>{cat.title}</h3>
                <p>{cat.tagline}</p>
                <span className="cat-link">Browse <ArrowRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   Collections
   --------------------------------------------------------------- */

export function CollectionsStrip() {
  return (
    <section className="section section-alt">
      <div className="container">
        <SectionHead
          eyebrow="Featured collections"
          title="Curated by our team each week"
          subtitle="Hand-picked groupings so you can shop a mood, a recipe or a restock in one go."
        />

        <div className="coll-grid">
          {collections.map((coll) => (
            <Link key={coll.slug} to={`/collection/${coll.slug}`} className="coll-card">
              <img src={coll.image} alt="" width="640" height="400" loading="lazy" />
              <div className="coll-overlay">
                <span className="coll-count">{coll.productIds.length} products</span>
                <h3>{coll.title}</h3>
                <p>{coll.subtitle}</p>
                <span className="coll-link">Shop collection <ArrowRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   Shop by concern
   --------------------------------------------------------------- */

export function ConcernGrid() {
  return (
    <section className="section section-alt">
      <div className="container">
        <SectionHead
          center
          eyebrow="Shop by concern"
          title="Products tailored to your health and wellness needs"
          subtitle="Pick a concern and we will show the pantry, produce and everyday essentials that fit."
        />

        <div className="concern-grid">
          {concerns.map((concern) => {
            const collection = getCollection(concern.slug);
            return (
              <Link key={concern.slug} to={`/collection/${concern.slug}`} className="concern-card">
                <span className="concern-emoji" aria-hidden="true">{concern.emoji}</span>
                <span className="concern-title">{concern.title}</span>
                <span className="concern-count">
                  {collection ? `${collection.productIds.length} products` : 'Explore'}
                </span>
                <span className="concern-link">Shop now <ArrowRight size={13} /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   Shop by videos
   --------------------------------------------------------------- */

export function VideoShop() {
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    if (!activeVideo) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [activeVideo]);

  const close = () => setActiveVideo(null);
  const activeProduct = activeVideo
    ? products.find((p) => p.id === activeVideo.productId)
    : null;

  return (
    <section className="section">
      <div className="container">
        <SectionHead
          eyebrow="Shop by videos"
          title="See the products in action"
          subtitle="Short clips from our partner farms, kitchens and packing hubs."
        />

        <div className="video-grid">
          {shopVideos.map((video) => {
            const product = products.find((p) => p.id === video.productId);
            return (
              <button
                key={video.id}
                type="button"
                className="video-card"
                onClick={() => setActiveVideo(video)}
                aria-label={`Play video: ${video.title}`}
              >
                <img src={video.poster} alt="" loading="lazy" />
                <span className="video-play" aria-hidden="true">
                  <Play size={20} fill="currentColor" />
                </span>
                <span className="video-caption">
                  <strong>{video.title}</strong>
                  {product && <small>Shop {product.title}</small>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeVideo && (
        <div className="video-modal" role="dialog" aria-modal="true" aria-label={activeVideo.title}>
          <button type="button" className="video-modal-backdrop" onClick={close} aria-label="Close video" />
          <div className="video-modal-panel">
            <div className="video-modal-head">
              <div>
                <h3>{activeVideo.title}</h3>
                {activeProduct && (
                  <Link to={`/product/${activeProduct.id}`} onClick={close} className="video-modal-link">
                    Shop {activeProduct.title} <ArrowRight size={14} />
                  </Link>
                )}
              </div>
              <button type="button" className="video-modal-close" onClick={close} aria-label="Close video">
                <X size={20} />
              </button>
            </div>
            <video src={activeVideo.src} poster={activeVideo.poster} controls autoPlay playsInline />
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------
   Per-category rails
   --------------------------------------------------------------- */

export function CategoryRails({ onAddToCart }) {
  const allProducts = getCatalogProducts();
  const rails = categories
    .map((category) => ({
      category,
      items: allProducts.filter((p) => p.category === category.slug)
    }))
    .filter((rail) => rail.items.length > 0);

  return (
    <>
      {rails.map(({ category, items }) => (
        <section className="section rail-section" key={category.slug}>
          <div className="container">
            <SectionHead
              eyebrow="Shop by category"
              title={category.title}
              subtitle={category.blurb}
              linkTo={`/category/${category.slug}`}
              linkLabel={`Shop ${category.title}`}
            />
            <div className="product-grid cols-4">
              {items.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

/* ---------------------------------------------------------------
   Marquee trust band
   --------------------------------------------------------------- */

export function MarqueeStrip() {
  const items = [...marqueeMessages, ...marqueeMessages];

  return (
    <div className="marquee" role="region" aria-label="Store highlights">
      <div className="marquee-track">
        {items.map((message, index) => (
          <span className="marquee-item" key={`${message}-${index}`}>
            <Sprout size={15} aria-hidden="true" />
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Product rail (reused for bestsellers / new arrivals / deals)
   --------------------------------------------------------------- */

export function ProductRail({
  eyebrow,
  title,
  subtitle,
  linkTo,
  linkLabel,
  items = [],
  tone = 'plain',
  onAddToCart
}) {
  if (!items.length) return null;

  return (
    <section className={`section rail-section tone-${tone}`}>
      <div className="container">
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} linkTo={linkTo} linkLabel={linkLabel} />
        <div className="product-grid cols-4">
          {items.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   Ordering steps
   --------------------------------------------------------------- */

const orderSteps = [
  { icon: ShoppingBasket, title: 'Pick your items', text: 'Browse categories or search for a specific product and add it to your cart.' },
  { icon: Wallet, title: 'Choose payment', text: 'Pay online with PhonePe or choose cash on delivery at checkout.' },
  { icon: PackageCheck, title: 'We pack it fresh', text: 'Sellers pack your order the same day, with produce picked that morning.' },
  { icon: Truck, title: 'Track to your door', text: 'Follow each step on the order timeline until it reaches your address.' }
];

export function OrderingSteps() {
  return (
    <section className="section section-tint">
      <div className="container">
        <SectionHead
          center
          eyebrow="How ordering works"
          title="Four simple steps from cart to doorstep"
          subtitle="The whole flow is designed to stay predictable — you always know what happens next."
        />

        <div className="steps-row">
          {orderSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div className="step-card" key={step.title}>
                <span className="step-number">{index + 1}</span>
                <span className="step-icon"><Icon size={20} /></span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   Benefits & trust
   --------------------------------------------------------------- */

const iconMap = { Sprout, Truck, ShieldCheck, RotateCcw, IndianRupee, HeartHandshake };

export function BenefitsGrid() {
  return (
    <section className="section">
      <div className="container">
        <SectionHead
          center
          eyebrow="Why shop here"
          title="Built on trust, not on discounts alone"
          subtitle="Marketplaces work when both sides win. Here is what we hold ourselves to."
        />

        <div className="benefits-grid">
          {benefits.map((benefit) => {
            const Icon = iconMap[benefit.icon] || ShieldCheck;
            return (
              <div className="benefit" key={benefit.title}>
                <span className="benefit-icon"><Icon size={20} /></span>
                <div>
                  <h4>{benefit.title}</h4>
                  <p>{benefit.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="trust-strip">
          <div className="stat"><span className="stat-value">{products.length}+</span><span className="stat-label">Live listings</span></div>
          <div className="stat"><span className="stat-value">{categories.length}</span><span className="stat-label">Categories</span></div>
          <div className="stat"><span className="stat-value">4.7</span><span className="stat-label">Average rating</span></div>
          <div className="stat"><span className="stat-value">48 h</span><span className="stat-label">Replacement window</span></div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   Testimonials
   --------------------------------------------------------------- */

export function TestimonialsSection() {
  const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <section className="section section-alt">
      <div className="container">
        <SectionHead
          center
          eyebrow="Customer voices"
          title="What buyers say about their orders"
        />

        <div className="quote-grid">
          {testimonials.map((t) => {
            const product = products.find((p) => p.id === t.productId);
            return (
              <figure className="quote-card" key={t.id}>
                <Quote size={22} className="quote-mark" />
                <div className="quote-stars" aria-label={`${t.rating} out of 5 stars`}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={14} fill={i < t.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <blockquote className="quote-text">“{t.text}”</blockquote>
                <figcaption className="quote-meta">
                  <span className="avatar sm accent">{initials(t.name)}</span>
                  <span>
                    <span className="quote-name">{t.name}</span>
                    <span className="quote-loc">{t.location}</span>
                  </span>
                  {product && (
                    <img className="quote-product" src={product.image} alt={product.title} width="46" height="46" loading="lazy" />
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------
   Newsletter CTA
   --------------------------------------------------------------- */

export function NewsletterCta() {
  return (
    <section className="section">
      <div className="container">
        <div className="newsletter-cta">
          <div className="newsletter-copy">
            <span className="eyebrow">Stay in the loop</span>
            <h2>Seasonal drops and restock alerts, once a week</h2>
            <p>Join the list for new seller announcements, harvest updates and weekend offers.</p>
          </div>

          <form
            className="newsletter-inline"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.email;
              const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
              const note = e.currentTarget.querySelector('.newsletter-inline-msg');
              if (!valid) {
                input.classList.add('has-error');
                note.textContent = 'Please enter a valid email address.';
                note.className = 'newsletter-inline-msg err';
              } else {
                input.classList.remove('has-error');
                input.value = '';
                note.textContent = 'Thanks for subscribing!';
                note.className = 'newsletter-inline-msg ok';
              }
            }}
            noValidate
          >
            <label className="sr-only" htmlFor="home-newsletter">Email address</label>
            <div className="newsletter-field">
              <Mail size={17} />
              <input id="home-newsletter" name="email" type="email" placeholder="you@example.com" />
              <button type="submit" className="btn btn-accent">Subscribe</button>
            </div>
            <p className="newsletter-inline-msg" role="status" aria-live="polite" />
          </form>
        </div>
      </div>
    </section>
  );
}
