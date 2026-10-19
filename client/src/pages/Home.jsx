import {
  Hero,
  CategoryGrid,
  CollectionsStrip,
  ConcernGrid,
  VideoShop,
  CategoryRails,
  MarqueeStrip,
  ProductRail,
  OrderingSteps,
  BenefitsGrid,
  TestimonialsSection,
  NewsletterCta
} from '../components/home/HomeSections';
import { getProductsByTag, getCollectionProducts } from '../data/catalog';

export default function Home({ onAddToCart }) {
  const bestsellers = getProductsByTag('bestseller');
  const newArrivals = getProductsByTag('new');
  const deals = getCollectionProducts('deals');

  return (
    <>
      <Hero />
      <CategoryGrid />
      <ConcernGrid />
      <CollectionsStrip />
      <VideoShop />
      <ProductRail
        eyebrow="Bestsellers"
        title="What customers reorder every week"
        subtitle="Consistent quality is why these keep coming back."
        linkTo="/collection/bestsellers"
        items={bestsellers}
        onAddToCart={onAddToCart}
      />
      <OrderingSteps />
      <ProductRail
        eyebrow="New products"
        title="Fresh listings from our sellers"
        subtitle="New produce, pantry items and home goods added this month."
        linkTo="/collection/new-arrivals"
        items={newArrivals}
        onAddToCart={onAddToCart}
      />
      <CategoryRails onAddToCart={onAddToCart} />
      <MarqueeStrip />
      <ProductRail
        eyebrow="Limited time deals"
        title="Lower prices on everyday essentials"
        subtitle="Limited-period pricing across pantry and fresh combos."
        linkTo="/collection/deals"
        items={deals}
        tone="accent"
        onAddToCart={onAddToCart}
      />
      <BenefitsGrid />
      <TestimonialsSection />
      <NewsletterCta />
    </>
  );
}
