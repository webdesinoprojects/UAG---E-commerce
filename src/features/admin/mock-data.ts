/**
 * @file mock-data.ts
 * @description Provides comprehensive mock data for the Admin Dashboard.
 * This file acts as a substitute for a real database/backend API during the frontend
 * development phase. It exports typed mock data for products, categories, orders, 
 * and analytical chart data.
 */

export const mockDashboardData = {
  overview: {
    totalRevenue: 48295,
    revenueGrowth: 12.5,
    activeUsers: 2847,
    usersGrowth: 8.2,
    totalOrders: 1432,
    ordersGrowth: -3.1,
    pageViews: 284000,
    pageViewsGrowth: 24.7,
  },
  revenueChart: [
    { name: 'Jan', revenue: 20000, orders: 1200 },
    { name: 'Feb', revenue: 25000, orders: 1300 },
    { name: 'Mar', revenue: 22000, orders: 1100 },
    { name: 'Apr', revenue: 32000, orders: 1800 },
    { name: 'May', revenue: 30000, orders: 1700 },
    { name: 'Jun', revenue: 40000, orders: 2100 },
    { name: 'Jul', revenue: 42000, orders: 2300 },
    { name: 'Aug', revenue: 45000, orders: 2400 },
    { name: 'Sep', revenue: 44000, orders: 2350 },
    { name: 'Oct', revenue: 48000, orders: 2500 },
    { name: 'Nov', revenue: 52000, orders: 2800 },
    { name: 'Dec', revenue: 60000, orders: 3200 },
  ],
  trafficSources: [
    { name: 'Direct', value: 35, fill: '#ef4444' }, // red-500
    { name: 'Organic', value: 28, fill: '#06b6d4' }, // cyan-500
    { name: 'Referral', value: 22, fill: '#0f766e' }, // teal-700
    { name: 'Social', value: 15, fill: '#f59e0b' }, // amber-500
  ],
  recentOrders: [
    { id: 'ORD-7352', customer: 'Alice Freeman', product: 'Airdopes Studio ANC', status: 'Completed', amount: 149.99 },
    { id: 'ORD-7351', customer: 'Bob Smith', product: 'UAG Quantum X', status: 'Processing', amount: 89.00 },
    { id: 'ORD-7350', customer: 'Charlie Davis', product: 'Solar Force Core', status: 'Shipped', amount: 120.50 },
    { id: 'ORD-7349', customer: 'Diana Ross', product: 'Neon Flex Sports', status: 'Completed', amount: 65.00 },
    { id: 'ORD-7348', customer: 'Evan Wright', product: 'Basic Edition TWS', status: 'Cancelled', amount: 45.00 },
  ]
};

export const mockProducts = [
  {
    id: "prod_1",
    name: "Airdopes Studio ANC",
    category: "Earbuds",
    price: 149.99,
    stock: 342,
    status: "Active",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
    sales: 1240
  },
  {
    id: "prod_2",
    name: "UAG Quantum X Noise Cancelling",
    category: "Earbuds",
    price: 89.00,
    stock: 12,
    status: "Low Stock",
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80",
    sales: 850
  },
  {
    id: "prod_3",
    name: "Solar Force Core Powerbank",
    category: "Power Banks",
    price: 120.50,
    stock: 0,
    status: "Out of Stock",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80",
    sales: 420
  },
  {
    id: "prod_4",
    name: "Neon Flex Sports Earbuds",
    category: "Earbuds",
    price: 65.00,
    stock: 845,
    status: "Active",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    sales: 2100
  },
  {
    id: "prod_5",
    name: "Titanium Pro 5.3 Bluetooth",
    category: "Smart Watch",
    price: 210.00,
    stock: 54,
    status: "Active",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80",
    sales: 110
  }
];

export const mockCategories = [
  { id: "cat_1", name: "Earbuds", productsCount: 45, status: "Active" },
  { id: "cat_2", name: "Neckbands", productsCount: 22, status: "Active" },
  { id: "cat_3", name: "Smart Watch", productsCount: 12, status: "Active" },
  { id: "cat_4", name: "Power Banks", productsCount: 8, status: "Draft" },
  { id: "cat_5", name: "Data Cable", productsCount: 35, status: "Active" },
];
