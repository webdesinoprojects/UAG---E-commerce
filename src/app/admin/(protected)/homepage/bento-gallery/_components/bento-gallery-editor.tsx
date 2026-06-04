"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { updateHomepageBentoGalleryAction } from "@/features/homepage/actions";
import type {
  BentoTileLayout,
  BentoTileType,
  HomepageBentoGallery,
  HomepageBentoItem,
} from "@/features/homepage/types";
import { MediaPickerModal } from "@/features/media/components/media-picker-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface BentoGalleryEditorProps {
  initialData: HomepageBentoGallery;
}

const tileTypes: BentoTileType[] = ["product", "banner", "story", "category"];
const tileLayouts: BentoTileLayout[] = ["standard", "wide", "tall", "large"];

function nextSortOrder(items: HomepageBentoItem[]) {
  return items.length > 0 ? Math.max(...items.map((item) => item.sortOrder)) + 10 : 10;
}

export default function BentoGalleryEditor({
  initialData,
}: BentoGalleryEditorProps) {
  const [state, action, isPending] = useActionState(updateHomepageBentoGalleryAction, {
    status: "idle",
    message: null,
  });
  const [isEnabled, setIsEnabled] = useState(initialData.isEnabled);
  const [eyebrow, setEyebrow] = useState(initialData.eyebrow);
  const [heading, setHeading] = useState(initialData.heading);
  const [description, setDescription] = useState(initialData.description);
  const [items, setItems] = useState<HomepageBentoItem[]>(initialData.items);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedItem = items[selectedIndex] ?? items[0] ?? null;

  const updateItem = (index: number, updates: Partial<HomepageBentoItem>) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      )
    );
  };

  const addItem = () => {
    if (items.length >= 12) return;

    const nextItem: HomepageBentoItem = {
      id: `bento-new-${Date.now()}`,
      title: "New Gallery Tile",
      subtitle: "Short subtitle",
      body: "Describe this tile for the storefront.",
      href: "/categories",
      tileType: "product",
      layout: "standard",
      badgeText: "New",
      accentColor: "#f97316",
      ctaLabel: "View Details",
      fallbackImagePath: "",
      imageUrl: "",
      imageAlt: "New Gallery Tile",
      imageMediaAssetId: null,
      sortOrder: nextSortOrder(items),
      isEnabled: true,
    };

    setItems((current) => [...current, nextItem]);
    setSelectedIndex(items.length);
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setSelectedIndex((current) => Math.max(0, Math.min(current, items.length - 2)));
  };

  return (
    <form action={action} className="flex flex-col gap-6 pb-20">
      <input type="hidden" name="isEnabled" value={isEnabled.toString()} />
      <input type="hidden" name="eyebrow" value={eyebrow} />
      <input type="hidden" name="heading" value={heading} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="itemCount" value={items.length} />

      {items.map((item, index) => {
        const prefix = `item-${index}-`;
        return (
          <div key={item.id} className="hidden">
            <input name={`${prefix}id`} value={item.id} readOnly />
            <input name={`${prefix}title`} value={item.title} readOnly />
            <input name={`${prefix}subtitle`} value={item.subtitle} readOnly />
            <input name={`${prefix}body`} value={item.body} readOnly />
            <input name={`${prefix}href`} value={item.href} readOnly />
            <input name={`${prefix}tileType`} value={item.tileType} readOnly />
            <input name={`${prefix}layout`} value={item.layout} readOnly />
            <input name={`${prefix}badgeText`} value={item.badgeText} readOnly />
            <input name={`${prefix}accentColor`} value={item.accentColor} readOnly />
            <input name={`${prefix}ctaLabel`} value={item.ctaLabel} readOnly />
            <input name={`${prefix}image`} value={item.fallbackImagePath} readOnly />
            <input
              name={`${prefix}imageMediaAssetId`}
              value={item.imageMediaAssetId ?? ""}
              readOnly
            />
            <input name={`${prefix}sortOrder`} value={item.sortOrder} readOnly />
            <input name={`${prefix}isEnabled`} value={item.isEnabled.toString()} readOnly />
          </div>
        );
      })}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" type="button" asChild>
            <Link href="/admin/homepage">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bento Gallery</h1>
            <p className="text-sm text-muted-foreground">
              Manage the visual gallery tiles shown near the lower homepage.
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Publishing..." : "Publish Changes"}
        </Button>
      </div>

      {state.status === "error" && state.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.status === "success" && state.message && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr]">
          <div className="flex items-center gap-3">
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            <div>
              <Label>Show bento gallery</Label>
              <p className="text-xs text-muted-foreground">
                Turn off to hide this full section from the storefront.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Eyebrow</Label>
              <Input value={eyebrow} onChange={(event) => setEyebrow(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Heading</Label>
              <Input value={heading} onChange={(event) => setHeading(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Tiles</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addItem}
              disabled={items.length >= 12}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                  selectedIndex === index ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="48px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.layout} - {item.isEnabled ? "visible" : "hidden"}
                  </p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Tile</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedItem ? (
              <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                Add a tile to begin.
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input
                      value={selectedItem.title}
                      onChange={(event) =>
                        updateItem(selectedIndex, {
                          title: event.target.value,
                          imageAlt: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subtitle</Label>
                    <Input
                      value={selectedItem.subtitle}
                      onChange={(event) =>
                        updateItem(selectedIndex, { subtitle: event.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Body</Label>
                  <Textarea
                    value={selectedItem.body}
                    onChange={(event) =>
                      updateItem(selectedIndex, { body: event.target.value })
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Href</Label>
                    <Input
                      value={selectedItem.href}
                      onChange={(event) =>
                        updateItem(selectedIndex, { href: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CTA Label</Label>
                    <Input
                      value={selectedItem.ctaLabel}
                      onChange={(event) =>
                        updateItem(selectedIndex, { ctaLabel: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Badge</Label>
                    <Input
                      value={selectedItem.badgeText}
                      onChange={(event) =>
                        updateItem(selectedIndex, { badgeText: event.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label>Tile Type</Label>
                    <Select
                      value={selectedItem.tileType}
                      onValueChange={(value) =>
                        updateItem(selectedIndex, { tileType: value as BentoTileType })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {tileTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Layout</Label>
                    <Select
                      value={selectedItem.layout}
                      onValueChange={(value) =>
                        updateItem(selectedIndex, { layout: value as BentoTileLayout })
                      }
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {tileLayouts.map((layout) => (
                          <SelectItem key={layout} value={layout}>{layout}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Accent</Label>
                    <Input
                      type="color"
                      value={selectedItem.accentColor}
                      onChange={(event) =>
                        updateItem(selectedIndex, { accentColor: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={selectedItem.sortOrder}
                      onChange={(event) =>
                        updateItem(selectedIndex, {
                          sortOrder: Number(event.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
                  <div className="relative h-28 overflow-hidden rounded-lg border bg-muted">
                    {selectedItem.imageUrl ? (
                      <Image
                        src={selectedItem.imageUrl}
                        alt={selectedItem.title}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>Media</Label>
                    <MediaPickerModal
                      allowedTypes="image"
                      selectedAssetId={selectedItem.imageMediaAssetId}
                      onSelect={(asset) =>
                        updateItem(selectedIndex, {
                          imageMediaAssetId: asset?.id ?? null,
                          imageUrl: asset?.url ?? selectedItem.fallbackImagePath,
                        })
                      }
                    />
                    {!selectedItem.imageMediaAssetId && (
                      <Input
                        value={selectedItem.fallbackImagePath}
                        onChange={(event) =>
                          updateItem(selectedIndex, {
                            fallbackImagePath: event.target.value,
                            imageUrl: event.target.value,
                          })
                        }
                        placeholder="/images/..."
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={selectedItem.isEnabled}
                      onCheckedChange={(checked) =>
                        updateItem(selectedIndex, { isEnabled: checked })
                      }
                    />
                    <Label>Tile visible</Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => removeItem(selectedIndex)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-zinc-950 p-5 text-white">
                {selectedItem.imageUrl && (
                  <Image
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    fill
                    className="object-cover opacity-70"
                    sizes="360px"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
                <div className="relative z-10 flex min-h-[320px] flex-col justify-between">
                  <span
                    className="w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase"
                    style={{ color: selectedItem.accentColor }}
                  >
                    {selectedItem.badgeText}
                  </span>
                  <div>
                    <h3 className="text-2xl font-black uppercase">{selectedItem.title}</h3>
                    <p className="mt-1 text-sm font-bold text-zinc-300">{selectedItem.subtitle}</p>
                    <p className="mt-3 text-xs text-zinc-400">{selectedItem.body}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                No tile selected.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
