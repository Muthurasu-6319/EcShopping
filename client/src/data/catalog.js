import { getProducts } from '../utils/storage';

/**
 * Front-end catalogue (mock data for UI development).
 * This module is deliberately kept separate from any future API layer:
 * when a real backend is connected, replace the bodies of the exported
 * functions with API calls — the signatures stay the same.
 *
 * Imagery: only photo URLs already used elsewhere in this project are
 * reused here so no new external assets are introduced.
 */

export const categories = [
  {
    slug: 'fresh-produce',
    title: 'Fresh Produce',
    tagline: 'Vegetables, fruits & greens',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=80',
    blurb: 'Harvested by partner farms and packed the same morning.'
  },
  {
    slug: 'pantry-staples',
    title: 'Pantry Staples',
    tagline: 'Rice, oils, spices & sweeteners',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=700&q=80',
    blurb: 'Cold-pressed oils, stone-ground spices and everyday grains.'
  },
  {
    slug: 'dairy-eggs',
    title: 'Dairy & Eggs',
    tagline: 'Milk, curd & country eggs',
    image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=700&q=80',
    blurb: 'Collected daily from small dairy farms near your city.'
  },
  {
    slug: 'livestock',
    title: 'Livestock',
    tagline: 'Cattle, sheep & poultry',
    image: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=700&q=80',
    blurb: 'Verified native breeds with health records from trusted breeders.'
  },
  {
    slug: 'pets-birds',
    title: 'Pets & Birds',
    tagline: 'Feed, care & accessories',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=700&q=80',
    blurb: 'Nutrition and care essentials for the animals at home.'
  },
  {
    slug: 'home-lifestyle',
    title: 'Home & Lifestyle',
    tagline: 'Handmade, garden & living',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=700&q=80',
    blurb: 'Handmade goods, gardening kits and slow-living essentials.'
  }
];

const U = 'https://images.unsplash.com/photo-';
const img = (id, w = 700) => `${U}${id}?auto=format&fit=crop&w=${w}&q=80`;

export const products = [
  {
    id: 'eco-coconut-oil-1l',
    title: 'Cold-Pressed Coconut Oil 1L',
    price: 150,
    compareAt: 190,
    image: img('1611077543781-a96c138b1d98'),
    images: [img('1611077543781-a96c138b1d98'), img('1474979266404-7eaacbcd87c5'), img('1542838132-92c53300491e')],
    category: 'pantry-staples',
    seller: 'Ramesh Farms',
    badge: 'Bestseller',
    rating: 4.8,
    reviews: 42,
    variants: ['1 Litre', '500 ml', '250 ml'],
    tags: ['bestseller', 'deal'],
    inStock: true,
    sales: 320,
    addedAt: '2026-08-14',
    unit: 'bottle',
    description:
      'Wood-pressed in small batches from fresh coconut grown on our partner farms. No refining, no additives — just a clean, aromatic oil for cooking, hair care and everyday kitchen use.',
    specs: [
      ['Pressing method', 'Cold / wood pressed'],
      ['Ingredients', '100% coconut oil'],
      ['Shelf life', '9 months'],
      ['Origin', 'Namakkal, Tamil Nadu']
    ]
  },
  {
    id: 'eco-sesame-oil-1l',
    title: 'Wood-Pressed Sesame Oil 1L',
    price: 240,
    compareAt: 285,
    image: img('1474979266404-7eaacbcd87c5'),
    images: [img('1474979266404-7eaacbcd87c5'), img('1611077543781-a96c138b1d98')],
    category: 'pantry-staples',
    seller: 'Ramesh Farms',
    badge: null,
    rating: 4.7,
    reviews: 26,
    variants: ['1 Litre', '500 ml'],
    tags: ['bestseller'],
    inStock: true,
    sales: 180,
    addedAt: '2026-07-02',
    unit: 'bottle',
    description:
      'Gingelly (til) oil pressed the traditional way at low temperature so the nutty flavour, aroma and natural antioxidants stay intact. Ideal for South Indian cooking and pickles.',
    specs: [
      ['Pressing method', 'Wood pressed, low heat'],
      ['Ingredients', '100% sesame oil'],
      ['Shelf life', '6 months'],
      ['Origin', 'Thanjavur, Tamil Nadu']
    ]
  },
  {
    id: 'eco-turmeric-250',
    title: 'Organic Turmeric Powder 250g',
    price: 79,
    compareAt: 99,
    image: img('1615485925600-97237c4fc1ec'),
    images: [img('1615485925600-97237c4fc1ec'), img('1613589921763-7140e6c5bbbd')],
    category: 'pantry-staples',
    seller: 'Pure Spices Co.',
    badge: 'Lab tested',
    rating: 4.9,
    reviews: 64,
    variants: ['250 g', '500 g', '1 kg'],
    tags: ['bestseller'],
    inStock: true,
    sales: 410,
    addedAt: '2026-06-21',
    unit: 'pack',
    description:
      'Single-origin finger turmeric, sun-dried and stone-ground in small lots. Naturally high curcumin, no colourants or preservatives — the golden colour in the jar is the real thing.',
    specs: [
      ['Ingredients', '100% turmeric'],
      ['Curcumin', '3.4% (lab tested)'],
      ['Shelf life', '12 months'],
      ['Origin', 'Erode, Tamil Nadu']
    ]
  },
  {
    id: 'eco-mustard-250',
    title: 'Farm Mustard Seeds 250g',
    price: 55,
    compareAt: 70,
    image: img('1613589921763-7140e6c5bbbd'),
    images: [img('1613589921763-7140e6c5bbbd')],
    category: 'pantry-staples',
    seller: 'Pure Spices Co.',
    badge: null,
    rating: 4.8,
    reviews: 12,
    variants: ['250 g', '500 g'],
    tags: ['deal'],
    inStock: true,
    sales: 96,
    addedAt: '2026-05-30',
    unit: 'pack',
    description:
      'Sharp, uniform yellow mustard seeds for tempering, pickles and fresh ground paste. Cleaned and graded twice before packing.',
    specs: [
      ['Ingredients', '100% mustard seeds'],
      ['Purity', '99.9% hand cleaned'],
      ['Shelf life', '12 months'],
      ['Origin', 'Madurai, Tamil Nadu']
    ]
  },
  {
    id: 'eco-palm-jaggery-500',
    title: 'Palm Jaggery Powder 500g',
    price: 120,
    compareAt: 150,
    image: img('1596547609652-9cf5d8d76921'),
    images: [img('1596547609652-9cf5d8d76921'), img('1613589921763-7140e6c5bbbd')],
    category: 'pantry-staples',
    seller: 'Shop Up',
    badge: 'Bestseller',
    rating: 4.9,
    reviews: 28,
    variants: ['500 g', '1 kg'],
    tags: ['bestseller', 'deal'],
    inStock: true,
    sales: 265,
    addedAt: '2026-08-01',
    unit: 'pack',
    description:
      'Naturally sweet palm sap collected from tall palm trees, boiled and powdered without any chemicals. A healthier swap for refined sugar in coffee, desserts and porridge.',
    specs: [
      ['Ingredients', 'Palm sap only'],
      ['Added sugar', 'None'],
      ['Shelf life', '8 months'],
      ['Origin', 'Virudhunagar, Tamil Nadu']
    ]
  },
  {
    id: 'eco-forest-honey-350',
    title: 'Forest Honey 350g',
    price: 275,
    compareAt: 320,
    image: img('1587049352846-4a222e784d38'),
    images: [img('1587049352846-4a222e784d38')],
    category: 'pantry-staples',
    seller: 'Hill Range Collectives',
    badge: 'Raw',
    rating: 4.8,
    reviews: 73,
    variants: ['350 g', '700 g'],
    tags: ['bestseller'],
    inStock: true,
    sales: 340,
    addedAt: '2026-07-19',
    unit: 'jar',
    description:
      'Unheated, unfiltered honey gathered by forest-edge beekeepers. Expect natural variation in colour and flavour across batches — that is how raw honey behaves.',
    specs: [
      ['Processing', 'Raw, unheated'],
      ['Additives', 'None'],
      ['Shelf life', 'Best before 24 months'],
      ['Origin', 'Anaimalai hills']
    ]
  },
  {
    id: 'eco-sona-rice-5kg',
    title: 'Sona Masoori Rice 5kg',
    price: 420,
    compareAt: 480,
    image: img('1586201375761-83865001e31c'),
    images: [img('1586201375761-83865001e31c'), img('1542838132-92c53300491e')],
    category: 'pantry-staples',
    seller: 'Green Valley Farms',
    badge: null,
    rating: 4.6,
    reviews: 51,
    variants: ['5 kg', '10 kg', '26 kg'],
    tags: ['bestseller'],
    inStock: true,
    sales: 520,
    addedAt: '2026-06-10',
    unit: 'bag',
    description:
      'Light, aromatic Sona Masoori milled fresh each week. Medium grain, low starch and soft after cooking — the everyday rice for South Indian homes.',
    specs: [
      ['Grain', 'Medium grain'],
      ['Milling', 'Weekly, unpolished options'],
      ['Shelf life', '6 months'],
      ['Origin', 'Thanjavur, Tamil Nadu']
    ]
  },
  {
    id: 'eco-tomatoes-1kg',
    title: 'Farm-Fresh Tomatoes 1kg',
    price: 40,
    compareAt: 48,
    image: img('1592924357228-91a4daadcfea'),
    images: [img('1592924357228-91a4daadcfea'), img('1488459716781-31db52582fe9')],
    category: 'fresh-produce',
    seller: 'Green Valley Farms',
    badge: 'Picked today',
    rating: 4.9,
    reviews: 230,
    variants: ['1 kg', '2 kg', '5 kg'],
    tags: ['new', 'bestseller'],
    inStock: true,
    sales: 610,
    addedAt: '2026-10-12',
    unit: 'kg',
    description:
      'Vine-ripened country tomatoes harvested the night before dispatch. Firm, tangy and perfect for gravies, chutneys and salads.',
    specs: [
      ['Grade', 'Hand picked A grade'],
      ['Pesticide', 'Residue tested'],
      ['Shelf life', '4–6 days refrigerated'],
      ['Origin', 'Kancheepuram, Tamil Nadu']
    ]
  },
  {
    id: 'eco-nendran-banana-1kg',
    title: 'Nendran Bananas 1kg',
    price: 65,
    compareAt: 80,
    image: img('1571771894821-ce9b6c11b08e'),
    images: [img('1571771894821-ce9b6c11b08e'), img('1610832958506-aa56368176cf')],
    category: 'fresh-produce',
    seller: 'Kerala Harvest',
    badge: null,
    rating: 4.7,
    reviews: 88,
    variants: ['1 kg', '2 kg', 'Dozen'],
    tags: ['new'],
    inStock: true,
    sales: 190,
    addedAt: '2026-10-08',
    unit: 'kg',
    description:
      'Firm, fragrant Nendran bananas — great for steaming, chips or letting ripen at home for a sweeter bite. Dispatched slightly under-ripe so they last the week.',
    specs: [
      ['Ripeness', 'Slightly under-ripe'],
      ['Spray', 'None'],
      ['Shelf life', '5–7 days'],
      ['Origin', 'Palakkad, Kerala']
    ]
  },
  {
    id: 'eco-fruit-basket-2kg',
    title: 'Seasonal Fruit Basket 2kg',
    price: 199,
    compareAt: 240,
    image: img('1610832958506-aa56368176cf'),
    images: [img('1610832958506-aa56368176cf'), img('1596040033229-a9821ebd058d')],
    category: 'fresh-produce',
    seller: 'Green Valley Farms',
    badge: 'New',
    rating: 4.6,
    reviews: 34,
    variants: ['2 kg', '4 kg'],
    tags: ['new', 'deal'],
    inStock: true,
    sales: 120,
    addedAt: '2026-10-15',
    unit: 'basket',
    description:
      'A rotating selection of five seasonal fruits chosen by the farm team each morning. Contents change with the harvest — expect variety, not sameness.',
    specs: [
      ['Contents', '5 seasonal fruits'],
      ['Packing', 'Returnable crate'],
      ['Shelf life', '3–5 days'],
      ['Origin', 'Mixed farms, TN & KL']
    ]
  },
  {
    id: 'eco-veg-combo-3kg',
    title: 'Everyday Vegetable Combo 3kg',
    price: 299,
    compareAt: 350,
    image: img('1488459716781-31db52582fe9'),
    images: [img('1488459716781-31db52582fe9'), img('1592924357228-91a4daadcfea')],
    category: 'fresh-produce',
    seller: 'Green Valley Farms',
    badge: 'Combo',
    rating: 4.8,
    reviews: 96,
    variants: ['3 kg', '6 kg'],
    tags: ['deal', 'bestseller'],
    inStock: true,
    sales: 275,
    addedAt: '2026-09-25',
    unit: 'combo',
    description:
      'Eight staples — onion, tomato, carrot, beans, brinjal, cabbage, potato and greens — sorted, weighed and packed for a week of home cooking.',
    specs: [
      ['Contents', '8 vegetables'],
      ['Approx. weight', '3 kg ± 200 g'],
      ['Shelf life', '4–7 days'],
      ['Origin', 'Kancheepuram & Thiruvallur']
    ]
  },
  {
    id: 'eco-country-chicken-1kg',
    title: 'Country Chicken 1kg (Cleaned)',
    price: 450,
    compareAt: 499,
    image: img('1548365328-8c6db3220e4c'),
    images: [img('1548365328-8c6db3220e4c')],
    category: 'livestock',
    seller: 'Poultry Hub',
    badge: null,
    rating: 4.6,
    reviews: 95,
    variants: ['1 kg', '2 kg', 'Live'],
    tags: ['bestseller'],
    inStock: true,
    sales: 210,
    addedAt: '2026-09-05',
    unit: 'kg',
    description:
      'Slow-grown nattu kozhi (country chicken) from free-range flocks, cleaned and cut to order. Firmer texture and deeper flavour than commercial broiler.',
    specs: [
      ['Breed', 'Country / free range'],
      ['Preparation', 'Cleaned & cut on order'],
      ['Shelf life', '2 days chilled'],
      ['Origin', 'Salem, Tamil Nadu']
    ]
  },
  {
    id: 'eco-fresh-milk-500',
    title: 'Farm-Fresh Milk 500ml',
    price: 32,
    compareAt: 36,
    image: img('1550583724-b2692b85b150'),
    images: [img('1550583724-b2692b85b150'), img('1528750997573-59b89d56f4f7')],
    category: 'dairy-eggs',
    seller: 'Aavin Local Dairy',
    badge: 'Daily',
    rating: 4.7,
    reviews: 142,
    variants: ['500 ml', '1 litre'],
    tags: ['new'],
    inStock: true,
    sales: 480,
    addedAt: '2026-10-16',
    unit: 'bottle',
    description:
      'Whole milk from grass-fed cows, pasteurised and chilled within hours of milking. Delivered in reusable glass bottles in the early morning slot.',
    specs: [
      ['Fat content', '4.2%'],
      ['Pasteurised', 'Yes, low temperature'],
      ['Shelf life', '2 days chilled'],
      ['Origin', 'Kanchipuram dairy belt']
    ]
  },
  {
    id: 'eco-country-eggs-12',
    title: 'Free-Range Country Eggs (12)',
    price: 105,
    compareAt: 120,
    image: img('1528750997573-59b89d56f4f7'),
    images: [img('1528750997573-59b89d56f4f7')],
    category: 'dairy-eggs',
    seller: 'Poultry Hub',
    badge: null,
    rating: 4.8,
    reviews: 118,
    variants: ['12 eggs', '30 eggs'],
    tags: ['bestseller'],
    inStock: true,
    sales: 390,
    addedAt: '2026-08-28',
    unit: 'tray',
    description:
      'Brown eggs from free-range hens that roam during the day. Packed in moulded trays so they reach you intact.',
    specs: [
      ['Type', 'Free-range, brown'],
      ['Size', 'Medium to large'],
      ['Shelf life', '12 days'],
      ['Origin', 'Villupuram, Tamil Nadu']
    ]
  },
  {
    id: 'eco-kangayam-cow',
    title: 'Kangayam Heifer (Verified Breed)',
    price: 45000,
    compareAt: 49000,
    image: img('1546445317-29f4545e9d53'),
    images: [img('1546445317-29f4545e9d53')],
    category: 'livestock',
    seller: 'Kangayam Breed Society',
    badge: 'Verified',
    rating: 4.5,
    reviews: 9,
    variants: ['Heifer (2 yr)', 'Calf (8 mo)'],
    tags: [],
    inStock: true,
    sales: 12,
    addedAt: '2026-07-11',
    unit: 'head',
    description:
      'Registered Kangayam heifer with vaccination record, lineage papers and a vet check-up report. Purchase includes transport coordination within Tamil Nadu.',
    specs: [
      ['Breed', 'Kangayam (registered)'],
      ['Age', '2 years'],
      ['Health', 'Vet certified'],
      ['Delivery', 'Transport on request']
    ]
  },
  {
    id: 'eco-live-sheep',
    title: 'Grass-Fed Sheep (Live)',
    price: 8000,
    compareAt: 8600,
    image: img('1484557985045-edf25e08da73'),
    images: [img('1484557985045-edf25e08da73')],
    category: 'livestock',
    seller: 'Agri Farm',
    badge: null,
    rating: 4.5,
    reviews: 12,
    variants: ['Single', 'Pair'],
    tags: [],
    inStock: true,
    sales: 24,
    addedAt: '2026-06-02',
    unit: 'head',
    description:
      'Healthy grass-fed sheep from a small flock, sold live with age and health details shared before purchase. Local pickup or arranged transport.',
    specs: [
      ['Feed', 'Grass fed'],
      ['Age', '8–14 months'],
      ['Health', 'Vet checked'],
      ['Delivery', 'Pickup / local transport']
    ]
  },
  {
    id: 'eco-grocery-combo',
    title: 'Family Grocery Combo',
    price: 549,
    compareAt: 650,
    image: img('1542838132-92c53300491e'),
    images: [img('1542838132-92c53300491e'), img('1596040033229-a9821ebd058d')],
    category: 'pantry-staples',
    seller: 'EcShopping Select',
    badge: 'Combo',
    rating: 4.7,
    reviews: 61,
    variants: ['Standard', 'Large family'],
    tags: ['deal', 'bestseller'],
    inStock: true,
    sales: 305,
    addedAt: '2026-09-14',
    unit: 'combo',
    description:
      'A month-start box of essentials: rice, dals, oil, salt, spices, jaggery and tea — sourced from the same sellers you find in the store, bundled at a lower price.',
    specs: [
      ['Items', '10 pantry essentials'],
      ['Approx. weight', '7 kg'],
      ['Shelf life', 'Varies by item'],
      ['Savings', '15% vs. separate purchase']
    ]
  },
  {
    id: 'eco-flax-seed-200',
    title: 'Organic Flax Seed 200g',
    price: 65,
    compareAt: 85,
    image: img('1500937386664-56d1dfef3854'),
    images: [img('1500937386664-56d1dfef3854')],
    category: 'pantry-staples',
    seller: 'Green Valley Farms',
    badge: null,
    rating: 4.8,
    reviews: 18,
    variants: ['200 g', '500 g'],
    tags: ['new'],
    inStock: true,
    sales: 84,
    addedAt: '2026-10-03',
    unit: 'pack',
    description:
      'Cleaned, slow-roasted flax seed for sprinkling on porridge, dosa batter or salads. Rich source of plant omega-3 with a mild, nutty taste.',
    specs: [
      ['Roasted', 'Light roast'],
      ['Additives', 'None'],
      ['Shelf life', '6 months'],
      ['Origin', 'Salem, Tamil Nadu']
    ]
  },
  {
    id: 'eco-pet-care-bundle',
    title: 'Pet Nutrition & Care Bundle',
    price: 349,
    compareAt: 420,
    image: img('1552728089-57bdde30beb3'),
    images: [img('1552728089-57bdde30beb3')],
    category: 'pets-birds',
    seller: 'Home & Hound',
    badge: null,
    rating: 4.4,
    reviews: 21,
    variants: ['Birds', 'Dogs', 'Cats'],
    tags: ['new'],
    inStock: true,
    sales: 66,
    addedAt: '2026-09-30',
    unit: 'bundle',
    description:
      'A starter bundle of feed, mineral blocks and grooming essentials. Pick the bird, dog or cat variant to get the right mix for your pet.',
    specs: [
      ['Includes', 'Feed, mineral block, brush'],
      ['Made in', 'India'],
      ['Shelf life', '9 months'],
      ['Variant', 'Choose at selection']
    ]
  },
  {
    id: 'eco-grow-bag-set',
    title: 'Handmade Grow Bag Set (5)',
    price: 249,
    compareAt: 299,
    image: img('1485955900006-10f4d324d411'),
    images: [img('1485955900006-10f4d324d411')],
    category: 'home-lifestyle',
    seller: 'Craft & Clay Collective',
    badge: 'Handmade',
    rating: 4.6,
    reviews: 37,
    variants: ['Set of 5', 'Set of 10'],
    tags: ['new'],
    inStock: true,
    sales: 102,
    addedAt: '2026-10-06',
    unit: 'set',
    description:
      'Stitched fabric grow bags with handles, made by a women’s self-help group. Perfect for balcony herbs, tomatoes and chillies — with drainage layers sewn in.',
    specs: [
      ['Material', 'Reusable fabric'],
      ['Sizes', '3 sizes in a set'],
      ['Drainage', 'Sewn-in layer'],
      ['Made by', 'SHG, Tamil Nadu']
    ]
  }
];

export const collections = [
  {
    slug: 'bestsellers',
    title: 'Bestsellers',
    subtitle: 'What repeat customers reorder every week',
    image: img('1542838132-92c53300491e', 1000),
    productIds: ['eco-tomatoes-1kg', 'eco-sona-rice-5kg', 'eco-palm-jaggery-500', 'eco-coconut-oil-1l', 'eco-forest-honey-350', 'eco-veg-combo-3kg', 'eco-country-eggs-12', 'eco-grocery-combo']
  },
  {
    slug: 'new-arrivals',
    title: 'New Arrivals',
    subtitle: 'Fresh listings from our sellers this month',
    image: img('1488459716781-31db52582fe9', 1000),
    productIds: ['eco-fruit-basket-2kg', 'eco-fresh-milk-500', 'eco-flax-seed-200', 'eco-grow-bag-set', 'eco-pet-care-bundle', 'eco-nendran-banana-1kg']
  },
  {
    slug: 'deals',
    title: 'Weekend Deals',
    subtitle: 'Limited-time prices on everyday essentials',
    image: img('1596040033229-a9821ebd058d', 1000),
    productIds: ['eco-veg-combo-3kg', 'eco-grocery-combo', 'eco-turmeric-250', 'eco-mustard-250', 'eco-palm-jaggery-500', 'eco-fruit-basket-2kg']
  },
  {
    slug: 'farm-fresh',
    title: 'Direct from Farms',
    subtitle: 'Harvested and shipped within 24 hours',
    image: img('1610832958506-aa56368176cf', 1000),
    productIds: ['eco-tomatoes-1kg', 'eco-nendran-banana-1kg', 'eco-veg-combo-3kg', 'eco-fresh-milk-500', 'eco-country-eggs-12']
  },
  {
    slug: 'special',
    title: 'EcShopping Special',
    subtitle: 'Small-batch favourites picked by our buyers',
    image: img('1587049352846-4a222e784d38', 1000),
    productIds: ['eco-forest-honey-350', 'eco-palm-jaggery-500', 'eco-turmeric-250', 'eco-coconut-oil-1l']
  },
  {
    slug: 'combos',
    title: 'Combo Offers',
    subtitle: 'Bundle up and save on everyday essentials',
    image: img('1542838132-92c53300491e', 1000),
    productIds: ['eco-grocery-combo', 'eco-veg-combo-3kg', 'eco-fruit-basket-2kg']
  },
  {
    slug: 'weight-gain',
    title: 'Weight Gain',
    subtitle: 'Calorie-dense staples for healthy gains',
    image: img('1586201375761-83865001e31c', 1000),
    productIds: ['eco-country-eggs-12', 'eco-grocery-combo', 'eco-sona-rice-5kg', 'eco-palm-jaggery-500']
  },
  {
    slug: 'pregnancy-care',
    title: 'Pregnancy Care',
    subtitle: 'Nourishing picks for mother and baby',
    image: img('1550583724-b2692b85b150', 1000),
    productIds: ['eco-forest-honey-350', 'eco-country-eggs-12', 'eco-fresh-milk-500', 'eco-fruit-basket-2kg']
  },
  {
    slug: 'kids-wellness',
    title: 'Kids Wellness',
    subtitle: 'Clean, simple foods for growing kids',
    image: img('1571771894821-ce9b6c11b08e', 1000),
    productIds: ['eco-fresh-milk-500', 'eco-nendran-banana-1kg', 'eco-forest-honey-350']
  },
  {
    slug: 'diabetes-friendly',
    title: 'Diabetes-Friendly',
    subtitle: 'Low-GI grains, seeds and pantry staples',
    image: img('1500937386664-56d1dfef3854', 1000),
    productIds: ['eco-flax-seed-200', 'eco-mustard-250', 'eco-veg-combo-3kg', 'eco-turmeric-250']
  },
  {
    slug: 'weight-loss',
    title: 'Weight Loss',
    subtitle: 'Light, fibre-rich foods for everyday meals',
    image: img('1488459716781-31db52582fe9', 1000),
    productIds: ['eco-flax-seed-200', 'eco-veg-combo-3kg', 'eco-tomatoes-1kg', 'eco-nendran-banana-1kg']
  },
  {
    slug: 'high-protein',
    title: 'High-Protein Essentials',
    subtitle: 'Farm protein to fuel your day',
    image: img('1548365328-8c6db3220e4c', 1000),
    productIds: ['eco-country-eggs-12', 'eco-country-chicken-1kg', 'eco-flax-seed-200']
  }
];

/**
 * Shop-by-concern tiles. Each slug maps to a collection above so the
 * existing /collection/:slug listing page handles the results.
 */
export const concerns = [
  { slug: 'weight-gain', title: 'Weight Gain', emoji: '🥜' },
  { slug: 'pregnancy-care', title: 'Pregnancy Care', emoji: '🧡' },
  { slug: 'kids-wellness', title: 'Kids Wellness', emoji: '🌟' },
  { slug: 'diabetes-friendly', title: 'Diabetes-Friendly', emoji: '🩺' },
  { slug: 'weight-loss', title: 'Weight Loss', emoji: '🥗' },
  { slug: 'high-protein', title: 'High-Protein', emoji: '💪' }
];

/** Home page video rail. Cards open a lightbox player. */
export const shopVideos = [
  {
    id: 'vid-oil',
    title: 'How cold-pressed oil is made',
    poster: img('1611077543781-a96c138b1d98', 900),
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    productId: 'eco-coconut-oil-1l'
  },
  {
    id: 'vid-honey',
    title: 'Forest honey, straight from the comb',
    poster: img('1587049352846-4a222e784d38', 900),
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    productId: 'eco-forest-honey-350'
  },
  {
    id: 'vid-farm',
    title: 'A morning at our partner farms',
    poster: img('1592924357228-91a4daadcfea', 900),
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    productId: 'eco-tomatoes-1kg'
  },
  {
    id: 'vid-pasta',
    title: 'Cooking with millet pasta',
    poster: img('1542838132-92c53300491e', 900),
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    productId: 'eco-grocery-combo'
  }
];

/** Scrolling trust band shown between home sections. */
export const marqueeMessages = [
  '8,500+ farmers bring you fresh produce at your doorstep',
  'Pesticide free',
  'Premium quality',
  'Direct from farms',
  'Free delivery over ₹499',
  'Every seller identity-verified'
];

export const benefits = [
  { icon: 'Sprout', title: 'Sourced from verified sellers', text: 'Every seller is identity-verified and reviewed before listings go live.' },
  { icon: 'Truck', title: 'Same-day dispatch', text: 'Orders placed before 4 PM are packed the same day from the nearest hub.' },
  { icon: 'ShieldCheck', title: 'Quality you can check', text: 'Produce is residue-tested and every listing carries honest specs.' },
  { icon: 'RotateCcw', title: 'Easy replacements', text: 'Damaged or wrong item? Raise a replacement request within 48 hours.' },
  { icon: 'IndianRupee', title: 'Transparent pricing', text: 'What you see is what you pay — no hidden handling fees at checkout.' },
  { icon: 'HeartHandshake', title: 'Fair for sellers too', text: 'Local sellers keep a fairer share of every sale they make.' }
];

/**
 * Customer testimonials shown on the home page.
 */
export const testimonials = [
  {
    id: 't1',
    name: 'Priya Raman',
    location: 'Chennai',
    rating: 5,
    text: 'The tomatoes were firm and fresh — picked that morning, exactly as described. Delivery arrived on the second day without any bruising.',
    productId: 'eco-tomatoes-1kg'
  },
  {
    id: 't2',
    name: 'Arun Kumar',
    location: 'Coimbatore',
    rating: 4,
    text: 'Genuine forest honey with a rich, floral taste. The jar was sealed well and the seller included a note about the harvest.',
    productId: 'eco-forest-honey-350'
  },
  {
    id: 't3',
    name: 'Meena Sundaram',
    location: 'Madurai',
    rating: 5,
    text: 'Sona masuri rice that cooks light and fluffy, just like the local mill rice we grew up with. Ordering again for the festive season.',
    productId: 'eco-sona-rice-5kg'
  }
];

export const announcementMessages = [
  'Free standard delivery on orders above ₹499',
  'New: seasonal fruit baskets added this week',
  'Every seller on EcShopping is identity-verified'
];

/* ---------------- helpers ---------------- */

const baseById = new Map(products.map((p) => [String(p.id), p]));

function mapVendorProduct(vp) {
  return {
    id: vp.id,
    title: vp.title || vp.name || 'Untitled product',
    price: Number(vp.price) || 0,
    compareAt: vp.compareAt ? Number(vp.compareAt) : null,
    image: vp.image,
    images: vp.images || (vp.image ? [vp.image] : []),
    category: vp.categorySlug || 'pantry-staples',
    seller: vp.vendorName || vp.soldBy || 'EcShopping Seller',
    vendorId: vp.vendorId || null,
    badge: vp.badge || 'New',
    rating: 5,
    reviews: 0,
    variants: vp.variants || [],
    tags: ['new'],
    inStock: vp.stockStatus ? vp.stockStatus !== 'out_of_stock' : vp.inStock !== false,
    sales: 0,
    addedAt: vp.createdAt || new Date().toISOString(),
    unit: 'unit',
    description: vp.description || 'Listed by an EcShopping seller.',
    specs: vp.specs || [],
    isVendorListing: true
  };
}

/** Catalogue = seeded products + approved vendor listings from local storage. */
export function getCatalogProducts() {
  let vendorItems = [];
  try {
    vendorItems = getProducts()
      .filter((p) => p.status === 'approved')
      .map(mapVendorProduct);
  } catch {
    vendorItems = [];
  }
  return [...products, ...vendorItems];
}

export function findProduct(id) {
  if (id == null) return null;
  const key = String(id);
  const seeded = baseById.get(key);
  if (seeded) return seeded;
  return getCatalogProducts().find((p) => String(p.id) === key) || null;
}

export function getCategory(slug) {
  return categories.find((c) => c.slug === slug) || null;
}

export function getCollection(slug) {
  return collections.find((c) => c.slug === slug) || null;
}

export function getCategoryCounts() {
  const counts = {};
  for (const p of getCatalogProducts()) {
    counts[p.category] = (counts[p.category] || 0) + 1;
  }
  return counts;
}

export function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  const pool = getCatalogProducts().filter((p) => p.id !== product.id);
  const sameCategory = pool.filter((p) => p.category === product.category);
  const rest = pool.filter((p) => p.category !== product.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export function getCollectionProducts(slug) {
  const collection = getCollection(slug);
  if (!collection) return [];
  const byId = new Map(getCatalogProducts().map((p) => [String(p.id), p]));
  return collection.productIds.map((id) => byId.get(id)).filter(Boolean);
}

export function getProductsByTag(tag) {
  return getCatalogProducts().filter((p) => (p.tags || []).includes(tag));
}
