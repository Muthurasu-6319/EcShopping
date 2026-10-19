import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, Search, PackageSearch, LayoutGrid, Rows3 } from 'lucide-react';
import { getCatalogProducts, categories, getCategory, getCollection } from '../data/catalog';
import { PageHero } from '../components/ui/PageHeader';
import ProductCard from '../components/ui/ProductCard';
import Pagination from '../components/ui/Pagination';
import { EmptyState, SkeletonGrid } from '../components/ui/States';
import './Shop.css';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest first' },
  { value: 'rating', label: 'Customer rating' },
  { value: 'bestselling', label: 'Best selling' }
];

const PRICE_BANDS = [
  { label: 'Under ₹100', min: 0, max: 100 },
  { label: '₹100 – ₹500', min: 100, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: 'Above ₹1,000', min: 1000, max: null }
];

export default function Shop({ onAddToCart }) {
  const { slug } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dense, setDense] = useState(false);

  const mode = location.pathname.startsWith('/category')
    ? 'category'
    : location.pathname.startsWith('/collection')
      ? 'collection'
      : 'all';

  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const activeCategories = searchParams.getAll('category');
  const bandIndex = searchParams.get('band') ? Number(searchParams.get('band')) : null;
  const minRating = Number(searchParams.get('rating') || 0);
  const inStockOnly = searchParams.get('inStock') === '1';
  const seller = searchParams.get('seller') || '';

  const activeCategory = mode === 'category' ? getCategory(slug) : null;
  const activeCollection = mode === 'collection' ? getCollection(slug) : null;

  /* Short simulated fetch so loading states are real UI, not decoration. */
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 260);
    return () => clearTimeout(t);
  }, [location.pathname, searchParams.toString()]);

  const setParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        next.delete(key);
        value.forEach((v) => next.append(key, v));
      } else if (value === '' || value === null || value === undefined || value === false) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next, { replace: false });
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    setSearchParams(next);
  };

  const allProducts = useMemo(() => getCatalogProducts(), []);
  const sellers = useMemo(
    () => Array.from(new Set(allProducts.map((p) => p.seller).filter(Boolean))).sort(),
    [allProducts]
  );

  const results = useMemo(() => {
    let list = [...allProducts];

    if (mode === 'category' && activeCategory) list = list.filter((p) => p.category === activeCategory.slug);
    if (mode === 'collection' && activeCollection) {
      const order = activeCollection.productIds;
      list = order.map((id) => list.find((p) => String(p.id) === String(id))).filter(Boolean);
    }
    if (mode === 'all' && activeCategories.length) {
      list = list.filter((p) => activeCategories.includes(p.category));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => `${p.title} ${p.seller || ''} ${p.category || ''}`.toLowerCase().includes(q));
    }
    if (bandIndex != null && PRICE_BANDS[bandIndex]) {
      const { min, max } = PRICE_BANDS[bandIndex];
      list = list.filter((p) => p.price >= min && (max == null || p.price <= max));
    }
    if (minRating > 0) list = list.filter((p) => (p.rating || 0) >= minRating);
    if (inStockOnly) list = list.filter((p) => p.inStock !== false);
    if (seller) list = list.filter((p) => p.seller === seller);

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'bestselling':
        list.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        break;
      default:
        break;
    }

    return list;
  }, [allProducts, mode, activeCategory, activeCollection, activeCategories, search, bandIndex, minRating, inStockOnly, seller, sort]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = results.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeFilterCount =
    activeCategories.length +
    (bandIndex != null ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (seller ? 1 : 0);

  const title =
    mode === 'category' && activeCategory
      ? activeCategory.title
      : mode === 'collection' && activeCollection
        ? activeCollection.title
        : search
          ? `Results for “${search}”`
          : 'All products';

  const subtitle =
    mode === 'category' && activeCategory
      ? activeCategory.blurb
      : mode === 'collection' && activeCollection
        ? activeCollection.subtitle
        : 'Browse everything listed by our verified sellers.';

  const crumbs = [{ label: 'Shop', to: '/shop' }];
  if (mode === 'category') crumbs.push({ label: activeCategory ? activeCategory.title : slug, to: `/category/${slug}` });
  if (mode === 'collection') crumbs.push({ label: activeCollection ? activeCollection.title : slug, to: `/collection/${slug}` });
  if (search) crumbs.push({ label: `Search: ${search}` });

  const unknownSlug = (mode === 'category' && !activeCategory) || (mode === 'collection' && !activeCollection);

  return (
    <>
      <PageHero title={title} subtitle={subtitle} crumbs={crumbs} />

      <div className="container shop-layout">
        {/* ---------- Filters (desktop sidebar / mobile drawer) ---------- */}
        <aside className={`shop-sidebar ${filtersOpen ? 'open' : ''}`} aria-label="Product filters">
          <div className="sidebar-head">
            <h2>Filters</h2>
            <button type="button" className="sidebar-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
              <X size={19} />
            </button>
          </div>

          <div className="filter-group">
            <h3>Category</h3>
            <ul className="filter-list">
              {categories.map((cat) => {
                const checked = activeCategories.includes(cat.slug);
                return (
                  <li key={cat.slug}>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setParams({
                            category: checked
                              ? activeCategories.filter((c) => c !== cat.slug)
                              : [...activeCategories, cat.slug]
                          })
                        }
                      />
                      <span>{cat.title}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="filter-group">
            <h3>Price</h3>
            <div className="filter-chips">
              {PRICE_BANDS.map((band, index) => (
                <button
                  key={band.label}
                  type="button"
                  className={`chip ${bandIndex === index ? 'active' : ''}`}
                  onClick={() => setParams({ band: bandIndex === index ? '' : index })}
                >
                  {band.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Customer rating</h3>
            <div className="filter-chips">
              {[4.5, 4, 3.5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  className={`chip ${minRating === rating ? 'active' : ''}`}
                  onClick={() => setParams({ rating: minRating === rating ? '' : rating })}
                >
                  {rating}★ &amp; up
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Seller</h3>
            <label className="sr-only" htmlFor="seller-select">Filter by seller</label>
            <select
              id="seller-select"
              className="select"
              value={seller}
              onChange={(e) => setParams({ seller: e.target.value })}
            >
              <option value="">All sellers</option>
              {sellers.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="check">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => setParams({ inStock: inStockOnly ? '' : '1' })}
              />
              <span>In stock only</span>
            </label>
          </div>

          <button type="button" className="btn btn-ghost btn-block" onClick={clearFilters} disabled={activeFilterCount === 0}>
            Clear all filters
          </button>

          <button type="button" className="btn btn-primary btn-block sidebar-apply" onClick={() => setFiltersOpen(false)}>
            Show {results.length} result{results.length === 1 ? '' : 's'}
          </button>
        </aside>

        {filtersOpen && (
          <button type="button" className="sidebar-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Close filters" />
        )}

        {/* ---------- Results ---------- */}
        <section className="shop-results" aria-live="polite">
          <div className="shop-toolbar">
            <button type="button" className="filter-toggle" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal size={16} />
              Filters {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>

            <p className="shop-count">
              {loading ? 'Loading products…' : `${results.length} product${results.length === 1 ? '' : 's'}`}
            </p>

            <div className="shop-toolbar-right">
              <div className="view-toggle" role="group" aria-label="Layout density">
                <button type="button" className={!dense ? 'active' : ''} onClick={() => setDense(false)} aria-label="Comfortable grid" aria-pressed={!dense}>
                  <LayoutGrid size={16} />
                </button>
                <button type="button" className={dense ? 'active' : ''} onClick={() => setDense(true)} aria-label="Compact grid" aria-pressed={dense}>
                  <Rows3 size={16} />
                </button>
              </div>

              <label className="sr-only" htmlFor="sort-select">Sort products</label>
              <select
                id="sort-select"
                className="select sort-select"
                value={sort}
                onChange={(e) => setParams({ sort: e.target.value })}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="active-filters">
              {activeCategories.map((catSlug) => (
                <button
                  key={catSlug}
                  type="button"
                  className="active-chip"
                  onClick={() => setParams({ category: activeCategories.filter((c) => c !== catSlug) })}
                >
                  {getCategory(catSlug)?.title || catSlug} <X size={13} />
                </button>
              ))}
              {bandIndex != null && PRICE_BANDS[bandIndex] && (
                <button type="button" className="active-chip" onClick={() => setParams({ band: '' })}>
                  {PRICE_BANDS[bandIndex].label} <X size={13} />
                </button>
              )}
              {minRating > 0 && (
                <button type="button" className="active-chip" onClick={() => setParams({ rating: '' })}>
                  {minRating}★ &amp; up <X size={13} />
                </button>
              )}
              {seller && (
                <button type="button" className="active-chip" onClick={() => setParams({ seller: '' })}>
                  {seller} <X size={13} />
                </button>
              )}
              {inStockOnly && (
                <button type="button" className="active-chip" onClick={() => setParams({ inStock: '' })}>
                  In stock <X size={13} />
                </button>
              )}
            </div>
          )}

          {unknownSlug ? (
            <EmptyState
              icon={<Search size={28} />}
              title="That page does not exist"
              text={`We could not find “${slug}”. It may have been renamed or removed.`}
              actions={
                <>
                  <Link to="/shop" className="btn btn-primary">Browse all products</Link>
                  <Link to="/" className="btn btn-ghost">Back to home</Link>
                </>
              }
            />
          ) : loading ? (
            <SkeletonGrid count={8} className={dense ? 'compact' : ''} />
          ) : results.length === 0 ? (
            <EmptyState
              icon={<PackageSearch size={28} />}
              title="No products match these filters"
              text="Try removing a filter, widening the price range, or search for something else."
              actions={
                <>
                  <button type="button" className="btn btn-primary" onClick={clearFilters}>Clear filters</button>
                  <Link to="/shop" className="btn btn-ghost">View all products</Link>
                </>
              }
            />
          ) : (
            <>
              <div className={`product-grid shop-grid ${dense ? 'compact' : ''}`}>
                {pageItems.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
                ))}
              </div>

              <Pagination
                page={safePage}
                totalPages={totalPages}
                totalItems={results.length}
                pageSize={PAGE_SIZE}
                onChange={(next) => {
                  setParams({ page: next });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              <p className="shop-footnote">
                All prices are in Indian Rupees (₹) and include applicable taxes where noted by the seller.
              </p>
            </>
          )}
        </section>
      </div>
    </>
  );
}
