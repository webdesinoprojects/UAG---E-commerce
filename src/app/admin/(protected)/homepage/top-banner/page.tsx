/**
 * @file page.tsx
 * @description Detail view for editing the Top Marquee Banner.
 * Demonstrates the nested routing "Thread" architecture for the CMS.
 */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function TopBannerEditor() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Top Marquee Banner
            </h1>
          </div>
        </div>
        <Button className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Save className="h-4 w-4 mr-2" />
          Publish Changes
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Banner Settings</CardTitle>
              <CardDescription>Configure the scrolling text bar at the top of the storefront.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="banner-active" defaultChecked />
              <Label htmlFor="banner-active">Active</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-3">
            <Label>Marquee Text Items</Label>
            
            {/* Mock Items */}
            <div className="flex gap-2">
              <Input defaultValue="GET 5% EXTRA DISCOUNT ON PREPAID ORDERS" className="flex-1" />
              <Button variant="outline" size="icon" className="shrink-0 text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Input defaultValue="FAST & FREE DELIVERY ON EVERY ORDER" className="flex-1" />
              <Button variant="outline" size="icon" className="shrink-0 text-red-500 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="sm" className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Message
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-2">
                <Input type="color" defaultValue="#000000" className="w-12 h-9 p-1" />
                <Input defaultValue="#000000" className="flex-1 uppercase font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input type="color" defaultValue="#ffffff" className="w-12 h-9 p-1" />
                <Input defaultValue="#ffffff" className="flex-1 uppercase font-mono" />
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
      
    </div>
  );
}
