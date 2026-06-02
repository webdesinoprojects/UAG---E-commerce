import "server-only";

import { GetProductsParams, PaginatedProducts, FilterOptions } from "./types";
import { Product } from "./components/product-card";

// Shared mock dataset
const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: "UAG Crystal Gaming ANC Transparent Deep Bass Earbuds",
    category: "Earbuds Or Airdopes ENC",
    price: 1199,
    originalPrice: 2999,
    discount: 80,
    image: "/images/products/drone.png",
    slug: "crystal-gaming-anc-red"
  },
  {
    id: "prod_2",
    name: "UAG Crystal Transparent Gaming or ANC Earbuds",
    category: "Earbuds Or Airdopes ENC",
    price: 1189,
    originalPrice: 2699,
    discount: 83,
    image: "/images/products/drone.png",
    slug: "crystal-transparent-gaming-yellow"
  },
  {
    id: "prod_3",
    name: "UAG Urbn Armour Gear 151ANC Airdopes",
    category: "Earbuds Or Airdopes ENC",
    price: 1090,
    originalPrice: 2299,
    discount: 64,
    image: "/images/products/drone.png",
    slug: "151anc-airdopes-black"
  },
  {
    id: "prod_4",
    name: "UAG Urbn Armour Gear 171X ANC Airdopes",
    category: "Earbuds Or Airdopes ENC",
    price: 1050,
    originalPrice: 2999,
    discount: 82,
    image: "/images/products/drone.png",
    slug: "171x-anc-white"
  },
  {
    id: "prod_5",
    name: "UAG Urbn Armour Gear Bullet 22 ANC",
    category: "Earbuds Or Airdopes ENC",
    price: 899,
    originalPrice: 2199,
    discount: 63,
    image: "/images/products/drone.png",
    slug: "bullet-22-anc"
  },
  {
    id: "prod_6",
    name: "UAG True Wireless Deep Bass Earbuds Gold",
    category: "Earbuds Or Airdopes ENC",
    price: 1299,
    originalPrice: 3199,
    discount: 67,
    image: "/images/products/drone.png",
    slug: "tws-deep-bass-gold"
  },
  { id: "prod_7", name: "UAG Quantum X Noise Cancelling Pods", category: "Earbuds Or Airdopes ENC", price: 1499, originalPrice: 3499, discount: 57, image: "/images/products/drone.png", slug: "quantum-x-pods" },
  { id: "prod_8", name: "UAG Sonic Boom Bass Boost Edition", category: "Earbuds Or Airdopes ENC", price: 999, originalPrice: 1999, discount: 50, image: "/images/products/drone.png", slug: "sonic-boom-edition" },
  { id: "prod_9", name: "UAG Stealth Black Gaming Earbuds", category: "Earbuds Or Airdopes ENC", price: 1799, originalPrice: 4299, discount: 58, image: "/images/products/drone.png", slug: "stealth-black-gaming" },
  { id: "prod_10", name: "UAG AeroLite Ultra-light Airdopes", category: "Earbuds Or Airdopes ENC", price: 1150, originalPrice: 2899, discount: 60, image: "/images/products/drone.png", slug: "aerolite-ultra-light" },
  { id: "prod_11", name: "UAG Titanium Pro 5.3 Bluetooth", category: "Earbuds Or Airdopes ENC", price: 2100, originalPrice: 4999, discount: 58, image: "/images/products/drone.png", slug: "titanium-pro-53" },
  { id: "prod_12", name: "UAG Neon Flex Sports Earbuds", category: "Earbuds Or Airdopes ENC", price: 1350, originalPrice: 3100, discount: 56, image: "/images/products/drone.png", slug: "neon-flex-sports" },
  { id: "prod_13", name: "UAG Deep Dive IPX7 Waterproof", category: "Earbuds Or Airdopes ENC", price: 1699, originalPrice: 3899, discount: 56, image: "/images/products/drone.png", slug: "deep-dive-waterproof" },
  { id: "prod_14", name: "UAG Crystal Clear Commute ENC", category: "Earbuds Or Airdopes ENC", price: 1250, originalPrice: 2999, discount: 58, image: "/images/products/drone.png", slug: "crystal-clear-commute" },
  { id: "prod_15", name: "UAG Pulse Rhythm 2.0", category: "Earbuds Or Airdopes ENC", price: 899, originalPrice: 1599, discount: 44, image: "/images/products/drone.png", slug: "pulse-rhythm-2" },
  { id: "prod_16", name: "UAG Xtreme Power 40h Battery", category: "Earbuds Or Airdopes ENC", price: 1899, originalPrice: 4599, discount: 59, image: "/images/products/drone.png", slug: "xtreme-power-40h" },
  { id: "prod_17", name: "UAG Phantom White Minimalist", category: "Earbuds Or Airdopes ENC", price: 1100, originalPrice: 2499, discount: 56, image: "/images/products/drone.png", slug: "phantom-white" },
  { id: "prod_18", name: "UAG Studio Pro Audio Pods", category: "Earbuds Or Airdopes ENC", price: 2499, originalPrice: 5999, discount: 58, image: "/images/products/drone.png", slug: "studio-pro-audio" },
  { id: "prod_19", name: "UAG Basic Edition TWS", category: "Earbuds Or Airdopes ENC", price: 780, originalPrice: 1299, discount: 40, image: "/images/products/drone.png", slug: "basic-edition-tws" },
  { id: "prod_20", name: "UAG Elite Command ENC Series", category: "Earbuds Or Airdopes ENC", price: 1950, originalPrice: 4899, discount: 60, image: "/images/products/drone.png", slug: "elite-command-enc" },
  { id: "prod_21", name: "UAG Mini Pods Ultra Compact", category: "Earbuds Or Airdopes ENC", price: 1450, originalPrice: 3299, discount: 56, image: "/images/products/drone.png", slug: "mini-pods-compact" },
  { id: "prod_22", name: "UAG Gamer Elite Low Latency", category: "Earbuds Or Airdopes ENC", price: 1650, originalPrice: 3799, discount: 56, image: "/images/products/drone.png", slug: "gamer-elite-latency" },
  { id: "prod_23", name: "UAG Zenith Transparent Casing", category: "Earbuds Or Airdopes ENC", price: 1399, originalPrice: 3499, discount: 60, image: "/images/products/drone.png", slug: "zenith-transparent" },
  { id: "prod_24", name: "UAG Boost Charge 10min Pods", category: "Earbuds Or Airdopes ENC", price: 1550, originalPrice: 3699, discount: 58, image: "/images/products/drone.png", slug: "boost-charge-10min" },
  { id: "prod_25", name: "UAG Absolute Zero Noise Cancelling", category: "Earbuds Or Airdopes ENC", price: 2299, originalPrice: 5599, discount: 59, image: "/images/products/drone.png", slug: "absolute-zero-anc" },
  { id: "prod_26", name: "UAG Classic Onyx Series", category: "Earbuds Or Airdopes ENC", price: 950, originalPrice: 1999, discount: 52, image: "/images/products/drone.png", slug: "classic-onyx" },
];

// Helper to generate missing image paths as placeholders if needed, though they should ideally exist in public/images/products.

import { cacheLife, cacheTag } from "next/cache";

/**
 * Mock query function to fetch and filter products.
 * This simulates a database call with filtering, sorting, and pagination.
 */
export async function getProducts(params: GetProductsParams): Promise<PaginatedProducts> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `category-${params.categorySlug}`);
  
  // Simulate network latency (backend friendly)
  await new Promise(resolve => setTimeout(resolve, 600));

  let filtered = [...MOCK_PRODUCTS];

  // Apply filters
  if (params.categorySlug) {
    // In a real DB, you'd match by slug. Here we loosely match for mock purposes.
    filtered = filtered.filter(p => p.category.toLowerCase().includes(params.categorySlug!.replace("-", " ")));
  }

  if (params.minPrice) {
    filtered = filtered.filter(p => p.price >= params.minPrice!);
  }

  if (params.maxPrice) {
    filtered = filtered.filter(p => p.price <= params.maxPrice!);
  }

  // Stock status would check product inventory in a real system.
  if (params.stockStatus) {
    // mock behavior: everything is in stock for now
  }

  // Apply sorting
  switch (params.sort) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "latest":
      filtered.reverse(); // Mock latest by reversing
      break;
    case "rating":
      filtered.sort((a, b) => b.discount - a.discount); // Mock rating by discount
      break;
    case "popularity":
    case "default":
    default:
      // default mock sorting
      break;
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = 12; // Items per page
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return {
    data: paginatedData,
    total,
    totalPages,
    currentPage: page
  };
}

/**
 * Mock query to fetch filter options (aggregations) based on the current category
 */
export async function getFilterOptions(categorySlug?: string): Promise<FilterOptions> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");

  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    priceRange: { min: 780, max: 1800 }, // Matching screenshot
    brands: [
      { name: "UAG Urbn Armour Gear", count: 39 }
    ],
    stockStatuses: [
      { label: "On sale", value: "on_sale", count: 24 },
      { label: "In stock", value: "in_stock", count: 35 },
      { label: "On backorder", value: "backorder", count: 2 }
    ]
  };
}

/**
 * Mock query to fetch top rated products for the sidebar
 */
export async function getTopRatedProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", "top-rated");

  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_PRODUCTS.slice(3, 6); // Grab a few products for the top rated section
}

/**
 * Mock query to fetch a single product by its slug for the Product Detail Page (PDP)
 */
export async function getProductBySlug(slug: string): Promise<import("./types").ProductDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product-${slug}`);

  await new Promise(resolve => setTimeout(resolve, 300));
  
  const product = MOCK_PRODUCTS.find(p => p.slug === slug);
  if (!product) return null;

  return {
    ...product,
    brand: "UAG Urbn Armour Gear",
    description: `${product.name} features an advanced design built for heavy use, offering deep bass sound and seamless connectivity. With specialized charging capabilities and an extended battery life, it sets a new standard. Built with high-quality components for long-lasting durability.`,
    features: [
      "Strong Magnet",
      "Cooper Speaker",
      "Siri Function Available",
      "Sweat & Water Proof IP64X",
      "Game Mode",
      "ANC Support Feature",
      "320 Mah / 72 Hr. Backup"
    ],
    media: [
      { id: "img-1", type: "image", src: product.image },
      { id: "vid-1", type: "video", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
      { id: "img-2", type: "image", src: "/images/products/drone.png" },
      { id: "img-3", type: "image", src: "/images/products/drone.png" },
      { id: "img-4", type: "image", src: "/images/products/drone.png" },
      { id: "img-5", type: "image", src: "/images/products/drone.png" },
    ],
    featuresAndCompatibility: "UAG Urbn Armour Gear Bullet z2 ANC Gaming & Music Magnetic Sensor ON/OFF Feature orignal Luxury Ultimate Design with Uniqe Royal Olive colour neckband which is comes with Deep Bass sound ANC protect feature OR Anti Dust Water ipx64 proof with Red safety OR 50hour battery backup. Bluetooth Connectivity: The neckband would have Bluetooth technology built into it, allowing it to connect wirelessly to other Bluetooth-enabled devices such as smartphones, tablets, or computers. This would enable the user to listen to music, take phone calls, or use other audio features without being tethered by wires. Magnetic Sensor On-Off: The magnetic sensor on-off feature could serve multiple purposes: Power Control: The neckband could have a magnetic switch that turns the device on or off. When the two ends of the neckband come together (where the magnets are located), it triggers the sensor to turn the device on. Conversely, separating the ends would turn it off. This feature can make it easy to power the device on or off with a simple gesture. Call Answer/End: Additionally, the magnetic sensor could be used to answer or end phone calls. For example, bringing the two ends of the neckband together could answer an incoming call, while separating them could end the call. Convenience and User Experience: Incorporating a magnetic sensor on-off feature adds convenience and improves the user experience by providing a simple and intuitive way to control the device's power and certain functions without the need for physical buttons or complex gestures. Such a Bluetooth neckband with a magnetic sensor on-off feature would offer users a wireless and hassle-free audio experience with added functionality for easy control and management",
    promises: [
      { icon: "Percent", title: "Additional", subtitle: "prepaid Discount" },
      { icon: "RefreshCw", title: "72 hours", subtitle: "Replacement" },
      { icon: "ShieldCheck", title: "6 months", subtitle: "Warranty" },
      { icon: "Truck", title: "Free", subtitle: "Shipping" },
      { icon: "MapPin", title: "20,000+", subtitle: "Pincodes" },
      { icon: "PackageCheck", title: "ATS: Amazon", subtitle: "Delivery Partner" }
    ],
    bentoImages: [
      "/images/products/drone.png",
      "/images/products/drone.png",
      "/images/products/drone.png",
      "/images/products/drone.png",
      "/images/products/drone.png"
    ],
    detailedDescription: {
      summary: "TecSox Rockstar Speaker boasts Bluetooth connectivity, 6-hour playtime, powerful bass, IPX water resistance, providing a long-lasting, high-quality experience.",
      specifications: [
        { label: "Playtime", value: "6 hours of continuous audio on a single charge" },
        { label: "Sound", value: "Powerful bass with clear highs for balanced sound" },
        { label: "Water Resistance", value: "IPX-rated for protection against splashes and outdoor elements" },
        { label: "Connectivity", value: "Seamless Bluetooth pairing with compatible devices" },
        { label: "Controls", value: "Intuitive buttons for volume, track skipping, and calls" },
        { label: "Design", value: "Portable, rugged, and durable for outdoor use" }
      ],
      usp: [
        { label: "Extended Playtime", value: "6 hours of continuous music for long journeys or outdoor adventures" },
        { label: "Rich, Immersive Sound", value: "Powerful bass and clear highs for an enhanced listening experience" },
        { label: "Durable & Water-Resistant", value: "IPX-rated to withstand splashes and outdoor conditions" },
        { label: "Easy Connectivity", value: "Seamless Bluetooth pairing for effortless streaming" },
        { label: "User-Friendly Controls", value: "Simple controls for volume, tracks, and calls" },
        { label: "Portable & Rugged Design", value: "Compact and durable, perfect for on-the-go and outdoor use" }
      ]
    },
    shippingPolicy: "Orders are dispatched within 24 hours. Standard delivery takes 3-5 business days across India. We use premium logistics partners to ensure your package arrives safely.",
    reviews: {
      stats: {
        average: 4.64,
        totalCount: 124,
        distribution: { 5: 80, 4: 43, 3: 1, 2: 0, 1: 0 }
      },
      list: Array.from({ length: 20 }).map((_, i) => {
        const rating = i % 5 === 0 ? 4 : 5;
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() - (i * 3));
        return {
          id: `rev-${i}`,
          author: "Anonymous",
          isVerified: true,
          rating: rating,
          date: baseDate.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }),
          title: rating === 5 ? "Sound quality is very good" : "Good product at a reasonable price.",
          content: rating === 5 ? "The bass is extremely powerful and it lasts forever on a single charge. Definitely recommend this." : "It works well, though the fit could be slightly better for my ears. Overall a solid purchase."
        };
      })
    }
  };
}

/**
 * Fetch all products for client-side filtering (e.g. Recently Viewed)
 */
export async function getAllProducts(): Promise<import("./components/product-card").Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", "all");
  return MOCK_PRODUCTS;
}
