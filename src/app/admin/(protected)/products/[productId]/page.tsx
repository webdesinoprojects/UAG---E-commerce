/**
 * @file page.tsx
 * @description Product Edit Form for the Admin Dashboard.
 * Uses Shadcn Tabs to organize a massive form into manageable sections:
 * General Info, Media (Gallery), Bento Layout, and Detailed Specs.
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, Plus, Image as ImageIcon, Video, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { mockProducts } from "@/features/admin/mock-data";

export default function ProductEditPage() {
  return (
    <React.Suspense fallback={<div className="p-8 w-full max-w-5xl mx-auto flex items-center justify-center text-zinc-500">Loading product editor...</div>}>
      <ProductEditContent />
    </React.Suspense>
  );
}

function ProductEditContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  // Mock fetching product data
  const product = mockProducts.find(p => p.id === productId) || mockProducts[0];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      
      {/* Top Header Row with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-10 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md py-4 border-b border-zinc-200 dark:border-zinc-800 -mx-6 px-6 md:-mx-8 md:px-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
              Edit Product
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {product.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50">
            Archive
          </Button>
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-zinc-100 dark:bg-zinc-900">
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="media">Gallery Media</TabsTrigger>
          <TabsTrigger value="bento">Bento Layout</TabsTrigger>
          <TabsTrigger value="details">Rich Details</TabsTrigger>
        </TabsList>

        {/* --- GENERAL INFO TAB --- */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
              <CardDescription>The core identifying information for this product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" defaultValue={product.name} className="max-w-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select defaultValue={product.category.toLowerCase()}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="earbuds">Earbuds</SelectItem>
                      <SelectItem value="neckbands">Neckbands</SelectItem>
                      <SelectItem value="smart-watch">Smart Watch</SelectItem>
                      <SelectItem value="power-banks">Power Banks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue={product.status === 'Active' ? 'active' : 'draft'}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (Published)</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="short-desc">Short Description</Label>
                <Textarea id="short-desc" placeholder="A brief summary for category cards..." className="max-w-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price ($)</Label>
                  <Input id="price" type="number" defaultValue={product.price} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compare-price">Original Price ($)</Label>
                  <Input id="compare-price" type="number" defaultValue={product.price * 1.5} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" type="number" defaultValue={product.stock} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- MEDIA GALLERY TAB --- */}
        <TabsContent value="media" className="mt-6 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Product Hero Gallery</CardTitle>
              <CardDescription>Upload up to 6 images and 1 video for the top slider on the Product Detail Page.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Fake Upload Area */}
              <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-500">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-zinc-900 dark:text-white">Click to upload or drag and drop</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">SVG, PNG, JPG or MP4 (max. 800x400px)</p>
              </div>

              {/* Grid of existing media */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-6">
                {[product.image, ...Array(5).fill("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80")].map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden group">
                    <img src={img} alt="Product Media" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {i === 2 && (
                       <div className="absolute top-2 right-2 bg-black/70 rounded p-1">
                         <Video className="h-3 w-3 text-white" />
                       </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- BENTO LAYOUT TAB --- */}
        <TabsContent value="bento" className="mt-6 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Bento Grid Images</CardTitle>
              <CardDescription>Upload exactly 5 images to populate the dynamic bento grid layout on the PDP.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Hero Bento Slot */}
                <div className="md:col-span-2 md:row-span-2 aspect-[4/3] rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-zinc-400">
                  <ImageIcon className="h-8 w-8 text-zinc-400 mb-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                  <span className="font-medium text-sm text-zinc-600 dark:text-zinc-300">Upload Hero Image (Slot 1)</span>
                </div>
                {/* Minor Bento Slots */}
                {[2, 3, 4, 5].map((slot) => (
                  <div key={slot} className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col items-center justify-center p-4 text-center group cursor-pointer hover:border-zinc-400">
                    <ImageIcon className="h-6 w-6 text-zinc-400 mb-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                    <span className="font-medium text-xs text-zinc-600 dark:text-zinc-300">Slot {slot}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- RICH DETAILS TAB --- */}
        <TabsContent value="details" className="mt-6 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Features & Compatibility</CardTitle>
              <CardDescription>The long-form text that appears below the gallery with the &quot;...more&quot; button.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Write an extensive description here..." 
                className="min-h-[200px]" 
                defaultValue="UAG Urbn Armour Gear Bullet z2 ANC Gaming & Music Magnetic Sensor ON/OFF Feature orignal Luxury Ultimate Design with Uniqe Royal Olive colour neckband which is comes with Deep Bass sound ANC protect feature OR Anti Dust Water ipx64 proof with Red safety OR 50hour battery backup."
              />
            </CardContent>
          </Card>
          
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Key Specs (Tabs Section)</CardTitle>
              <CardDescription>Data for the &apos;Detailed Description&apos; bottom tabs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tab Summary Paragraph</Label>
                <Textarea placeholder="Overall summary for the specs tab..." />
              </div>
              
              <div className="pt-4 space-y-3">
                <Label>Specifications List</Label>
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Label (e.g., Playtime)" className="w-1/3" />
                    <Input placeholder="Value (e.g., 6 hours continuous)" className="flex-1" />
                    <Button variant="ghost" size="icon" className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="mt-2"><Plus className="h-4 w-4 mr-2" /> Add Spec</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
