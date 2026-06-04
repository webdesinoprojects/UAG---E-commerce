"use client";

import React, { useActionState, useState } from "react";
import Image from "next/image";
import { updateHomepageCategoryCirclesAction } from "@/features/homepage/actions";
import type { HomepageCategoryCircles, HomepageCategoryCircle } from "@/features/homepage/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MediaPickerModal } from "@/features/media/components/media-picker-modal";
import { Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CategoriesEditorProps {
  initialData: HomepageCategoryCircles;
}

export default function CategoriesEditor({
  initialData,
}: CategoriesEditorProps) {
  const [state, action, isPending] = useActionState(updateHomepageCategoryCirclesAction, {
    status: "idle",
    message: null,
  });

  const [isEnabled, setIsEnabled] = useState(initialData.isEnabled);
  const [items, setItems] = useState<HomepageCategoryCircle[]>(initialData.items);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `cat-new-${Date.now()}`,
        name: "New Category",
        slug: "new-category",
        href: "/categories/new-category",
        productCount: 0,
        fallbackImagePath: "",
        imageUrl: "",
        imageAlt: "",
        imageMediaAssetId: null,
        hoverMediaUrl: null,
        hoverMediaMimeType: null,
        hoverMediaAssetId: null,
        sortOrder: items.length > 0 ? Math.max(...items.map((i) => i.sortOrder)) + 10 : 10,
        isEnabled: true,
      },
    ]);
  };

  const updateItem = (index: number, updates: Partial<HomepageCategoryCircle>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  return (
    <form action={action} className="flex flex-col gap-6 pb-20">
      <input type="hidden" name="isEnabled" value={isEnabled.toString()} />
      <input type="hidden" name="itemCount" value={items.length} />

      <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-4 border rounded-lg shadow-sm">
        <div className="flex items-center space-x-3">
          <Switch
            id="isEnabled"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="isEnabled" className="text-base font-semibold">
              Enable Categories Showcase
            </Label>
            <p className="text-sm text-zinc-500">
              Turn off to completely hide this section from the storefront.
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {state.status === "error" && state.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.status === "success" && state.message && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 p-4">
            {items.map((item, index) => {
              const prefix = `item-${index}-`;
              // Simple slug extraction from href
              const parsedSlug = item.href.startsWith("/categories/") 
                ? item.href.substring("/categories/".length) 
                : item.slug || "unknown";

              return (
                <div key={item.id} className="flex flex-col gap-4 p-4 border rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50 relative group">
                  <input type="hidden" name={`${prefix}id`} value={item.id} />
                  <input type="hidden" name={`${prefix}imageMediaAssetId`} value={item.imageMediaAssetId || ""} />
                  <input type="hidden" name={`${prefix}hoverMediaAssetId`} value={item.hoverMediaAssetId || ""} />
                  <input type="hidden" name={`${prefix}isEnabled`} value={item.isEnabled.toString()} />
                  <input type="hidden" name={`${prefix}slug`} value={parsedSlug} />
                  <input type="hidden" name={`${prefix}image`} value={item.fallbackImagePath} />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Category Name</Label>
                        <Input 
                          name={`${prefix}name`} 
                          value={item.name} 
                          onChange={(e) => updateItem(index, { name: e.target.value })} 
                          placeholder="Earbuds"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Link (Href)</Label>
                        <Input 
                          name={`${prefix}href`} 
                          value={item.href} 
                          onChange={(e) => updateItem(index, { href: e.target.value })} 
                          placeholder="/categories/earbuds"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Product Count</Label>
                        <Input 
                          name={`${prefix}productCount`} 
                          type="number" 
                          min="0"
                          value={item.productCount} 
                          onChange={(e) => updateItem(index, { productCount: parseInt(e.target.value) || 0 })} 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Sort Order</Label>
                        <Input 
                          name={`${prefix}sortOrder`} 
                          type="number" 
                          min="0"
                          value={item.sortOrder} 
                          onChange={(e) => updateItem(index, { sortOrder: parseInt(e.target.value) || 0 })} 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Button variant="ghost" size="icon" type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center space-x-2 mt-2">
                        <Switch
                          checked={item.isEnabled}
                          onCheckedChange={(c) => updateItem(index, { isEnabled: c })}
                        />
                        <Label className="text-xs text-zinc-500 w-12">{item.isEnabled ? "Visible" : "Hidden"}</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-2">
                    <div className="flex gap-4 items-start">
                      <div className="w-24 h-24 bg-white dark:bg-zinc-800 border rounded-lg flex items-center justify-center overflow-hidden relative shrink-0">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-2" sizes="96px" />
                        ) : (
                          <span className="text-xs text-zinc-400 text-center px-1">No Image</span>
                        )}
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label>Normal Image</Label>
                        <div className="flex flex-col items-start gap-2">
                          <MediaPickerModal
                            allowedTypes="image"
                            selectedAssetId={item.imageMediaAssetId}
                            onSelect={(asset) => updateItem(index, { 
                              imageMediaAssetId: asset?.id || null,
                              imageUrl: asset?.url || item.fallbackImagePath, 
                            })}
                          />
                          {!item.imageMediaAssetId && (
                            <div className="w-full">
                              <Label className="text-[10px] text-zinc-500">Fallback Path (no media selected)</Label>
                              <Input 
                                value={item.fallbackImagePath} 
                                onChange={(e) => updateItem(index, {
                                  fallbackImagePath: e.target.value,
                                  imageUrl: e.target.value,
                                })} 
                                placeholder="/images/categories/..."
                                className="h-7 text-xs mt-1"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start">
                      <div className="w-24 h-24 bg-white dark:bg-zinc-800 border rounded-lg flex items-center justify-center overflow-hidden relative shrink-0">
                        {item.hoverMediaUrl ? (
                          item.hoverMediaMimeType?.startsWith("video/") ? (
                            <video src={item.hoverMediaUrl} className="object-cover w-full h-full" autoPlay muted loop playsInline />
                          ) : (
                            <Image src={item.hoverMediaUrl} alt="Hover" fill className="object-cover" sizes="96px" />
                          )
                        ) : (
                          <span className="text-xs text-zinc-400 text-center px-1">No Hover Media</span>
                        )}
                      </div>
                      <div className="space-y-2 flex-1">
                        <Label>Hover Media (Optional)</Label>
                        <div className="flex flex-col items-start gap-2">
                          <MediaPickerModal
                            allowedTypes="all"
                            selectedAssetId={item.hoverMediaAssetId}
                            onSelect={(asset) => updateItem(index, { 
                              hoverMediaAssetId: asset?.id || null,
                              hoverMediaUrl: asset?.url || null,
                              hoverMediaMimeType: asset?.mimeType || null,
                            })}
                          />
                          <p className="text-[11px] text-zinc-500 leading-tight">
                            Select an image, GIF, or short video to play on hover.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Button type="button" variant="outline" onClick={addItem} className="border-dashed py-8 mt-2">
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
