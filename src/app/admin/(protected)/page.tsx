/**
 * @file page.tsx
 * @description Main E-commerce Dashboard page.
 * Displays key metrics, revenue charts using Recharts (via Shadcn Chart), 
 * and recent customer activity. Implements the Dashboard 2 design language.
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { Download, ArrowUpRight, ShoppingBag, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Cell } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { mockDashboardData, mockProducts } from "@/features/admin/mock-data";

// Chart configurations for Shadcn Chart wrapper
const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--zinc-900))", // default
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--zinc-400))",
  },
};

const returningChartConfig = {
  returning: {
    label: "Returning Rate",
    color: "hsl(var(--zinc-900))",
  }
};

// Helper to determine bar color based on revenue
const getRevenueColor = (revenue: number) => {
  if (revenue >= 45000) return "#10b981"; // emerald-500 (High)
  if (revenue >= 25000) return "#f59e0b"; // amber-500 (Med)
  return "#f43f5e"; // rose-500 (Low)
};

export default function AdminDashboardPage() {
  const [chartFilter, setChartFilter] = React.useState("year");

  // Get top 4 products for the "Top Selling" widget
  const topProducts = [...mockProducts].sort((a, b) => b.sales - a.sales).slice(0, 4);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            E-Commerce Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            10 Apr 2026 - 07 May 2026
          </div>
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm h-9 px-4">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Top Metric Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Welcome Card */}
        <Card className="col-span-1 lg:col-span-1 border-none shadow-sm bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 overflow-hidden relative">
          
          {/* Decorative Animated SVG Backgrounds */}
          <div 
            className="absolute -right-8 -top-8 text-emerald-500/10 dark:text-emerald-400/10 pointer-events-none"
            style={{ animation: 'spin 20s linear infinite' }}
          >
            <svg width="140" height="140" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor" />
            </svg>
          </div>
          <div 
            className="absolute -bottom-10 -left-6 text-zinc-900/5 dark:text-white/5 pointer-events-none"
            style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          >
            <svg width="160" height="160" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" />
               <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>

          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="text-lg">Congratulations Toby! 🎉</CardTitle>
            <CardDescription>Best seller of the month</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold mt-2">$15,231.89</div>
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-500 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +65% from last month
            </div>
            <Button variant="outline" size="sm" className="mt-4 bg-white/50 hover:bg-white dark:bg-zinc-900/50 dark:hover:bg-zinc-900 backdrop-blur-sm">
              View Sales
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 overflow-hidden relative group">
          {/* Decorative Animated SVG */}
          <div 
            className="absolute -right-4 -bottom-4 text-emerald-500/5 dark:text-emerald-400/5 pointer-events-none transition-transform duration-1000 group-hover:scale-110"
            style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          >
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 22L12 2L22 22H2Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
              <path d="M6 18L12 8L18 18H6Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
            </svg>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-500">Monthly recurring revenue</CardTitle>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">+6.1%</span>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">$34.1K</div>
          </CardContent>
          <CardFooter className="pt-4 pb-4 relative z-10">
            <Link href="#" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center hover:text-zinc-900 dark:hover:text-white transition-colors">
              View more <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 overflow-hidden relative group">
          {/* Decorative Animated SVG */}
          <div 
            className="absolute -left-6 -top-6 text-blue-500/5 dark:text-blue-400/5 pointer-events-none"
            style={{ animation: 'spin 25s linear infinite reverse' }}
          >
            <svg width="130" height="130" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-500">Users</CardTitle>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">+19.2%</span>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">500.1K</div>
          </CardContent>
          <CardFooter className="pt-4 pb-4 relative z-10">
            <Link href="#" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center hover:text-zinc-900 dark:hover:text-white transition-colors">
              View more <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 overflow-hidden relative group">
          {/* Decorative Animated SVG */}
          <div 
            className="absolute right-0 top-1/2 -translate-y-1/2 text-red-500/5 dark:text-red-400/5 pointer-events-none"
            style={{ animation: 'pulse 5s ease-in-out infinite' }}
          >
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="1" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-zinc-500">User growth</CardTitle>
            <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">-1.2%</span>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">11.3%</div>
          </CardContent>
          <CardFooter className="pt-4 pb-4 relative z-10">
            <Link href="#" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center hover:text-zinc-900 dark:hover:text-white transition-colors">
              View more <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>

      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        
        {/* Total Revenue Bar Chart */}
        <Card className="lg:col-span-4 shadow-sm border-zinc-200 dark:border-zinc-800 flex flex-col">
          <CardHeader className="flex flex-row justify-between items-start pb-6">
            <div>
              <CardTitle className="text-base">Total Revenue</CardTitle>
              <CardDescription className="text-xs mt-1">Income overview by period</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select value={chartFilter} onValueChange={setChartFilter}>
                <SelectTrigger className="h-8 w-[110px] text-xs">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
              <BarChart data={mockDashboardData.revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-zinc-200)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--color-zinc-500)' }} 
                  dy={10}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--color-zinc-500)' }} 
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} barSize={32}>
                  {mockDashboardData.revenueChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRevenueColor(entry.revenue)} />
                  ))}
                </Bar>
                <Bar dataKey="orders" fill="var(--color-zinc-200)" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Returning Rate Line Chart */}
        <Card className="lg:col-span-3 shadow-sm border-zinc-200 dark:border-zinc-800 flex flex-col">
          <CardHeader className="flex flex-row justify-between items-center pb-6">
            <div>
              <CardTitle className="text-base">Returning Rate</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-bold">$42,379</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">+2.5%</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-8 shadow-sm">
              <Download className="h-3.5 w-3.5 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={returningChartConfig} className="h-[200px] w-full mt-8">
              <LineChart data={mockDashboardData.revenueChart} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-zinc-200)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--color-zinc-500)' }}
                  dy={10} 
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-zinc-900)" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

      </div>

      {/* Bottom Tables Row */}
      <div className="grid gap-4 lg:grid-cols-7 mt-2">
        
        {/* Recent Orders */}
        <Card className="lg:col-span-4 shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <CardDescription className="text-xs mt-1">Latest transactions from your store.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold" asChild>
                <Link href="/admin/orders">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-100 dark:border-zinc-800/60">
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDashboardData.recentOrders.map((order) => (
                  <TableRow key={order.id} className="border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{order.id}</TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-300">{order.customer}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={order.status === 'Completed' ? 'default' : order.status === 'Processing' ? 'secondary' : 'outline'}
                        className={
                          order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium' :
                          order.status === 'Processing' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 font-medium' :
                          'bg-zinc-100 text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 font-medium'
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">${order.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="lg:col-span-3 shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Top Selling Products</CardTitle>
                <CardDescription className="text-xs mt-1">Products with the most sales this month.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">{product.name}</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{product.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">${product.price.toFixed(2)}</span>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                      {product.sales} sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
