"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { updateHomepageMerchandisingBannersAction } from "@/features/homepage/actions";
import type {
  HeroFeatureIcon,
  HomepageMerchandisingBanners,
  HomepageMerchandisingSlide,
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

interface MerchandisingEditorProps {
  initialData: HomepageMerchandisingBanners;
}

const featureIcons: HeroFeatureIcon[] = [
  "volume",
  "sparkles",
  "cpu",
  "shield",
  "zap",
  "bluetooth",
  "link",
  "check",
];

function nextSortOrder(slides: HomepageMerchandisingSlide[]) {
  return slides.length > 0
    ? Math.max(...slides.map((slide) => slide.sortOrder)) + 10
    : 10;
}

export default function MerchandisingEditor({
  initialData,
}: MerchandisingEditorProps) {
  const [state, action, isPending] = useActionState(
    updateHomepageMerchandisingBannersAction,
    {
      status: "idle",
      message: null,
    }
  );
  const [isEnabled, setIsEnabled] = useState(initialData.isEnabled);
  const [eyebrow, setEyebrow] = useState(initialData.eyebrow);
  const [autoplaySeconds, setAutoplaySeconds] = useState(
    initialData.autoplaySeconds
  );
  const [slides, setSlides] = useState<HomepageMerchandisingSlide[]>(
    initialData.slides
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedSlide = slides[selectedIndex] ?? slides[0] ?? null;

  const updateSlide = (
    index: number,
    updates: Partial<HomepageMerchandisingSlide>
  ) => {
    setSlides((current) =>
      current.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...updates } : slide
      )
    );
  };

  const updateFeature = (
    slideIndex: number,
    featureIndex: number,
    updates: Partial<HomepageMerchandisingSlide["features"][number]>
  ) => {
    const slide = slides[slideIndex];
    if (!slide) return;

    const features = [
      slide.features[0] ?? { text: "", icon: "sparkles" as HeroFeatureIcon },
      slide.features[1] ?? { text: "", icon: "sparkles" as HeroFeatureIcon },
    ];
    features[featureIndex] = { ...features[featureIndex], ...updates };
    updateSlide(slideIndex, { features });
  };

  const addSlide = () => {
    if (slides.length >= 8) return;

    const nextSlide: HomepageMerchandisingSlide = {
      id: `slide-new-${Date.now()}`,
      title: "New Merchandising Banner",
      subtitle: "Launch subtitle",
      body: "Describe this promotional banner.",
      badgeText: eyebrow || "Exclusive Launch",
      accentColor: "#f59e0b",
      primaryCtaLabel: "Shop Now",
      primaryCtaHref: "/categories",
      secondaryCtaLabel: "Details",
      secondaryCtaHref: "/categories",
      features: [
        { text: "Feature one", icon: "sparkles" },
        { text: "Feature two", icon: "shield" },
      ],
      fallbackImagePath: "",
      imageUrl: "",
      imageAlt: "New Merchandising Banner",
      imageMediaAssetId: null,
      sortOrder: nextSortOrder(slides),
      isEnabled: true,
    };

    setSlides((current) => [...current, nextSlide]);
    setSelectedIndex(slides.length);
  };

  const removeSlide = (index: number) => {
    setSlides((current) => current.filter((_, slideIndex) => slideIndex !== index));
    setSelectedIndex((current) => Math.max(0, Math.min(current, slides.length - 2)));
  };

  return (
    <form action={action} className="flex flex-col gap-6 pb-20">
      <input type="hidden" name="isEnabled" value={isEnabled.toString()} />
      <input type="hidden" name="eyebrow" value={eyebrow} />
      <input type="hidden" name="autoplaySeconds" value={autoplaySeconds} />
      <input type="hidden" name="itemCount" value={slides.length} />

      {slides.map((slide, index) => {
        const prefix = `item-${index}-`;
        return (
          <div key={slide.id} className="hidden">
            <input name={`${prefix}id`} value={slide.id} readOnly />
            <input name={`${prefix}title`} value={slide.title} readOnly />
            <input name={`${prefix}subtitle`} value={slide.subtitle} readOnly />
            <input name={`${prefix}body`} value={slide.body} readOnly />
            <input name={`${prefix}badgeText`} value={slide.badgeText} readOnly />
            <input name={`${prefix}accentColor`} value={slide.accentColor} readOnly />
            <input
              name={`${prefix}primaryCtaLabel`}
              value={slide.primaryCtaLabel}
              readOnly
            />
            <input
              name={`${prefix}primaryCtaHref`}
              value={slide.primaryCtaHref}
              readOnly
            />
            <input
              name={`${prefix}secondaryCtaLabel`}
              value={slide.secondaryCtaLabel}
              readOnly
            />
            <input
              name={`${prefix}secondaryCtaHref`}
              value={slide.secondaryCtaHref}
              readOnly
            />
            <input
              name={`${prefix}feature1`}
              value={slide.features[0]?.text ?? ""}
              readOnly
            />
            <input
              name={`${prefix}feature1Icon`}
              value={slide.features[0]?.icon ?? "sparkles"}
              readOnly
            />
            <input
              name={`${prefix}feature2`}
              value={slide.features[1]?.text ?? ""}
              readOnly
            />
            <input
              name={`${prefix}feature2Icon`}
              value={slide.features[1]?.icon ?? "sparkles"}
              readOnly
            />
            <input name={`${prefix}image`} value={slide.fallbackImagePath} readOnly />
            <input
              name={`${prefix}imageMediaAssetId`}
              value={slide.imageMediaAssetId ?? ""}
              readOnly
            />
            <input name={`${prefix}sortOrder`} value={slide.sortOrder} readOnly />
            <input name={`${prefix}isEnabled`} value={slide.isEnabled.toString()} readOnly />
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Merchandising</h1>
            <p className="text-sm text-muted-foreground">
              Manage the large promotional carousel shown mid-homepage.
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
        <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_260px_180px]">
          <div className="flex items-center gap-3">
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            <div>
              <Label>Show merchandising banners</Label>
              <p className="text-xs text-muted-foreground">
                Turn off to hide the whole promotional carousel.
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Eyebrow</Label>
            <Input value={eyebrow} onChange={(event) => setEyebrow(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Autoplay Seconds</Label>
            <Input
              type="number"
              min={3}
              max={30}
              value={autoplaySeconds}
              onChange={(event) => setAutoplaySeconds(Number(event.target.value) || 7)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_380px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Slides</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addSlide}
              disabled={slides.length >= 8}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                  selectedIndex === index ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {slide.imageUrl ? (
                    <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" sizes="48px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{slide.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {slide.isEnabled ? "visible" : "hidden"} - {slide.sortOrder}
                  </p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Slide</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedSlide ? (
              <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                Add a slide to begin.
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input
                      value={selectedSlide.title}
                      onChange={(event) =>
                        updateSlide(selectedIndex, {
                          title: event.target.value,
                          imageAlt: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subtitle</Label>
                    <Input
                      value={selectedSlide.subtitle}
                      onChange={(event) =>
                        updateSlide(selectedIndex, { subtitle: event.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    value={selectedSlide.body}
                    onChange={(event) =>
                      updateSlide(selectedIndex, { body: event.target.value })
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Badge</Label>
                    <Input
                      value={selectedSlide.badgeText}
                      onChange={(event) =>
                        updateSlide(selectedIndex, { badgeText: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Accent</Label>
                    <Input
                      type="color"
                      value={selectedSlide.accentColor}
                      onChange={(event) =>
                        updateSlide(selectedIndex, { accentColor: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={selectedSlide.sortOrder}
                      onChange={(event) =>
                        updateSlide(selectedIndex, {
                          sortOrder: Number(event.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Primary CTA Label</Label>
                    <Input
                      value={selectedSlide.primaryCtaLabel}
                      onChange={(event) =>
                        updateSlide(selectedIndex, {
                          primaryCtaLabel: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Primary CTA Href</Label>
                    <Input
                      value={selectedSlide.primaryCtaHref}
                      onChange={(event) =>
                        updateSlide(selectedIndex, {
                          primaryCtaHref: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Secondary CTA Label</Label>
                    <Input
                      value={selectedSlide.secondaryCtaLabel}
                      onChange={(event) =>
                        updateSlide(selectedIndex, {
                          secondaryCtaLabel: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Secondary CTA Href</Label>
                    <Input
                      value={selectedSlide.secondaryCtaHref}
                      onChange={(event) =>
                        updateSlide(selectedIndex, {
                          secondaryCtaHref: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[0, 1].map((featureIndex) => (
                    <div key={featureIndex} className="space-y-2 rounded-lg border p-3">
                      <Label>Feature {featureIndex + 1}</Label>
                      <Input
                        value={selectedSlide.features[featureIndex]?.text ?? ""}
                        onChange={(event) =>
                          updateFeature(selectedIndex, featureIndex, {
                            text: event.target.value,
                          })
                        }
                      />
                      <Select
                        value={selectedSlide.features[featureIndex]?.icon ?? "sparkles"}
                        onValueChange={(value) =>
                          updateFeature(selectedIndex, featureIndex, {
                            icon: value as HeroFeatureIcon,
                          })
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {featureIcons.map((icon) => (
                            <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
                  <div className="relative h-28 overflow-hidden rounded-lg border bg-muted">
                    {selectedSlide.imageUrl ? (
                      <Image
                        src={selectedSlide.imageUrl}
                        alt={selectedSlide.title}
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
                      selectedAssetId={selectedSlide.imageMediaAssetId}
                      onSelect={(asset) =>
                        updateSlide(selectedIndex, {
                          imageMediaAssetId: asset?.id ?? null,
                          imageUrl: asset?.url ?? selectedSlide.fallbackImagePath,
                        })
                      }
                    />
                    {!selectedSlide.imageMediaAssetId && (
                      <Input
                        value={selectedSlide.fallbackImagePath}
                        onChange={(event) =>
                          updateSlide(selectedIndex, {
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
                      checked={selectedSlide.isEnabled}
                      onCheckedChange={(checked) =>
                        updateSlide(selectedIndex, { isEnabled: checked })
                      }
                    />
                    <Label>Slide visible</Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => removeSlide(selectedIndex)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:sticky xl:top-8 xl:self-start">
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSlide ? (
              <div className="relative min-h-[460px] overflow-hidden rounded-2xl bg-zinc-950 p-6 text-white">
                {selectedSlide.imageUrl && (
                  <Image
                    src={selectedSlide.imageUrl}
                    alt={selectedSlide.title}
                    fill
                    className="object-cover opacity-70"
                    sizes="380px"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/75 to-transparent" />
                <div className="relative z-10 flex min-h-[410px] max-w-xs flex-col justify-center gap-4">
                  <span
                    className="w-fit rounded-full border px-3 py-1 text-[10px] font-bold uppercase"
                    style={{
                      borderColor: `${selectedSlide.accentColor}44`,
                      color: selectedSlide.accentColor,
                    }}
                  >
                    {selectedSlide.badgeText}
                  </span>
                  <div>
                    <h3 className="text-3xl font-black leading-none text-zinc-900 dark:text-white">{selectedSlide.title}</h3>
                    <p className="mt-2 text-sm font-bold text-zinc-300">
                      {selectedSlide.subtitle}
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    {selectedSlide.body}
                  </p>
                  <Button
                    type="button"
                    className="w-fit text-zinc-950"
                    style={{ backgroundColor: selectedSlide.accentColor }}
                  >
                    {selectedSlide.primaryCtaLabel}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                No slide selected.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
