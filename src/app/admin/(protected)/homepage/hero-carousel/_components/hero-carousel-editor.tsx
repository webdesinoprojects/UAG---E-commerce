"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bluetooth,
  Check,
  Cpu,
  Eye,
  EyeOff,
  GalleryHorizontalEnd,
  ImageIcon,
  Link2,
  Save,
  ShieldCheck,
  Sparkles,
  Volume2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  updateHomepageHeroCarouselAction,
  type HomepageAnnouncementActionState,
} from "@/features/homepage/actions";
import type {
  HeroFeatureIcon,
  HomepageHeroCarousel,
} from "@/features/homepage/types";
import { MediaPickerModal } from "@/features/media/components/media-picker-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface HeroCarouselEditorProps {
  heroCarousel: HomepageHeroCarousel;
}

const initialActionState: HomepageAnnouncementActionState = {
  status: "idle",
  message: null,
};

// Single source of truth for the editable state of one slide. All values are
// submitted via hidden inputs (see HiddenSlideFields) so switching the selected
// slide never drops data from the form.
interface SlideForm {
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageUrl: string;
  imageMediaAssetId: string | null;
  accentColor: string;
  badgeText: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  feature1: string;
  feature1Icon: HeroFeatureIcon;
  feature2: string;
  feature2Icon: HeroFeatureIcon;
}

const FEATURE_ICON_MAP: Record<HeroFeatureIcon, LucideIcon> = {
  volume: Volume2,
  sparkles: Sparkles,
  cpu: Cpu,
  shield: ShieldCheck,
  zap: Zap,
  bluetooth: Bluetooth,
  link: Link2,
  check: Check,
};

const FEATURE_ICON_OPTIONS: { value: HeroFeatureIcon; label: string }[] = [
  { value: "volume", label: "Volume" },
  { value: "sparkles", label: "Sparkles" },
  { value: "cpu", label: "Chip" },
  { value: "shield", label: "Shield" },
  { value: "zap", label: "Bolt" },
  { value: "bluetooth", label: "Bluetooth" },
  { value: "link", label: "Link" },
  { value: "check", label: "Check" },
];

function asFeatureIcon(value: string | undefined): HeroFeatureIcon {
  return value && value in FEATURE_ICON_MAP
    ? (value as HeroFeatureIcon)
    : "sparkles";
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
      {children}
    </p>
  );
}

export function HeroCarouselEditor({ heroCarousel }: HeroCarouselEditorProps) {
  const [state, action, pending] = React.useActionState(
    updateHomepageHeroCarouselAction,
    initialActionState
  );

  const [isEnabled, setIsEnabled] = React.useState(heroCarousel.isEnabled);
  const [autoplaySeconds, setAutoplaySeconds] = React.useState(
    String(heroCarousel.autoplaySeconds)
  );
  const [slides, setSlides] = React.useState<SlideForm[]>(() =>
    heroCarousel.slides.map((slide) => ({
      enabled: slide.isEnabled,
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      image: slide.fallbackImagePath,
      imageUrl: slide.image,
      imageMediaAssetId: slide.imageMediaAssetId,
      accentColor: slide.accentColor,
      badgeText: slide.badgeText,
      primaryCtaLabel: slide.primaryCtaLabel,
      primaryCtaHref: slide.primaryCtaHref,
      secondaryCtaLabel: slide.secondaryCtaLabel,
      secondaryCtaHref: slide.secondaryCtaHref,
      feature1: slide.features[0]?.text ?? "",
      feature1Icon: asFeatureIcon(slide.features[0]?.icon),
      feature2: slide.features[1]?.text ?? "",
      feature2Icon: asFeatureIcon(slide.features[1]?.icon),
    }))
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const current = slides[selectedIndex];
  const visibleCount = slides.filter((slide) => slide.enabled).length;

  const updateSlide = (index: number, patch: Partial<SlideForm>) => {
    setSlides((currentSlides) =>
      currentSlides.map((slide, idx) =>
        idx === index ? { ...slide, ...patch } : slide
      )
    );
  };

  return (
    <form action={action} className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <input type="hidden" name="isEnabled" value={isEnabled ? "true" : "false"} />
      <input type="hidden" name="slideCount" value={slides.length} />

      {/* All slide data is submitted from state via hidden inputs so the
          currently-selected slide is never the only one posted. */}
      {slides.map((slide, index) => (
        <HiddenSlideFields key={`hidden-${index}`} index={index} slide={slide} />
      ))}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="h-9 w-9 shrink-0">
            <Link href="/admin/homepage" aria-label="Back to homepage CMS">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white sm:flex dark:bg-white dark:text-zinc-900">
              <GalleryHorizontalEnd className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Hero Carousel
              </h1>
              <p className="text-sm text-zinc-500">
                Full-width banner carousel shown near the top of the storefront.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isEnabled ? "default" : "secondary"} className="gap-1.5">
            {isEnabled ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            {isEnabled ? "Visible" : "Hidden"}
          </Badge>
          <Button type="submit" disabled={pending}>
            <Save className="h-4 w-4" />
            {pending ? "Publishing..." : "Publish Changes"}
          </Button>
        </div>
      </div>

      {state.message ? (
        <Alert variant={state.status === "error" ? "destructive" : "default"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {/* Section settings */}
      <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Carousel Settings</CardTitle>
          <CardDescription>
            Section-level visibility and autoplay. Per-slide visibility is set in
            the editor below.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 md:col-span-2 dark:border-zinc-800">
            <div className="space-y-0.5">
              <Label htmlFor="hero-active">Show hero carousel</Label>
              <p className="text-xs text-zinc-500">
                Turning this off hides the entire hero section from the
                storefront.
              </p>
            </div>
            <Switch
              id="hero-active"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="autoplaySeconds">Autoplay duration (s)</Label>
            <Input
              id="autoplaySeconds"
              name="autoplaySeconds"
              type="number"
              min={3}
              max={30}
              value={autoplaySeconds}
              onChange={(event) => setAutoplaySeconds(event.target.value)}
            />
            <p className="text-xs text-zinc-500">
              {visibleCount} of {slides.length} slides visible.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Workspace: selector | editor | preview */}
      {slides.length > 0 ? (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Slide selector */}
        <Card className="border-zinc-200 shadow-sm lg:col-span-3 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-base">Slides</CardTitle>
            <CardDescription>Select a slide to edit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {slides.map((slide, index) => {
              const isActive = index === selectedIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-current={isActive}
                  className={
                    "flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors " +
                    (isActive
                      ? "border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-900"
                      : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50")
                  }
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 font-mono text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900 dark:text-white">
                      {slide.title || "Untitled slide"}
                    </span>
                    <span className="block truncate font-mono text-[11px] text-zinc-400">
                      {slide.imageMediaAssetId
                        ? "Media Library asset"
                        : slide.image || "no image"}
                    </span>
                  </span>
                  {slide.enabled ? (
                    <Eye className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 shrink-0 text-zinc-400" />
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Editor for selected slide */}
        <Card className="border-zinc-200 shadow-sm lg:col-span-5 dark:border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">
                  Editing slide {selectedIndex + 1}
                </CardTitle>
                <CardDescription>
                  Changes preview live and submit with all slides.
                </CardDescription>
              </div>
              <Badge variant="outline" className="shrink-0 font-mono">
                {selectedIndex + 1}/{slides.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visibility */}
            <div className="space-y-3">
              <GroupLabel>Visibility</GroupLabel>
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                <Label htmlFor={`slide-${selectedIndex}-active`}>
                  Slide visible
                </Label>
                <Switch
                  id={`slide-${selectedIndex}-active`}
                  checked={current.enabled}
                  onCheckedChange={(value) =>
                    updateSlide(selectedIndex, { enabled: value })
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Content */}
            <div className="space-y-3">
              <GroupLabel>Content</GroupLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={current.title}
                    onChange={(event) =>
                      updateSlide(selectedIndex, { title: event.target.value })
                    }
                    maxLength={80}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={current.subtitle}
                    onChange={(event) =>
                      updateSlide(selectedIndex, { subtitle: event.target.value })
                    }
                    maxLength={120}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={current.description}
                  onChange={(event) =>
                    updateSlide(selectedIndex, {
                      description: event.target.value,
                    })
                  }
                  maxLength={280}
                  rows={3}
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Feature 1</Label>
                  <div className="flex gap-2">
                    <FeatureIconSelect
                      value={current.feature1Icon}
                      onChange={(value) =>
                        updateSlide(selectedIndex, { feature1Icon: value })
                      }
                    />
                    <Input
                      value={current.feature1}
                      onChange={(event) =>
                        updateSlide(selectedIndex, {
                          feature1: event.target.value,
                        })
                      }
                      maxLength={80}
                      className="flex-1"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Feature 2</Label>
                  <div className="flex gap-2">
                    <FeatureIconSelect
                      value={current.feature2Icon}
                      onChange={(value) =>
                        updateSlide(selectedIndex, { feature2Icon: value })
                      }
                    />
                    <Input
                      value={current.feature2}
                      onChange={(event) =>
                        updateSlide(selectedIndex, {
                          feature2: event.target.value,
                        })
                      }
                      maxLength={80}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Media + Design */}
            <div className="space-y-3">
              <GroupLabel>Media &amp; Design</GroupLabel>
              <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
                <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                  {current.imageUrl ? (
                    // Admin-only preview; the selected ImageKit URL is already
                    // validated when the media asset is persisted.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={current.imageUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Hero image</Label>
                  <MediaPickerModal
                    allowedTypes="image"
                    selectedAssetId={current.imageMediaAssetId}
                    onSelect={(asset) =>
                      updateSlide(selectedIndex, {
                        imageMediaAssetId: asset?.id ?? null,
                        imageUrl: asset?.url ?? current.image,
                      })
                    }
                    trigger={
                      <Button type="button" variant="outline">
                        <ImageIcon className="h-4 w-4" />
                        {current.imageMediaAssetId
                          ? "Change media"
                          : "Select from Media Library"}
                      </Button>
                    }
                  />
                  <p className="text-xs text-zinc-500">
                    Select an existing image or use the upload shortcut inside
                    the Media Library drawer.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Local fallback path</Label>
                <div className="flex gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 text-zinc-400 dark:border-zinc-800">
                    <ImageIcon className="h-4 w-4" />
                  </span>
                  <Input
                    value={current.image}
                    onChange={(event) => {
                      const image = event.target.value;
                      updateSlide(selectedIndex, {
                        image,
                        imageUrl: current.imageMediaAssetId
                          ? current.imageUrl
                          : image,
                      });
                    }}
                    maxLength={300}
                    placeholder="/images/carousel/banner1.png"
                    className="flex-1 font-mono text-xs"
                    required
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  Used when no managed media is selected or the selected asset
                  is unavailable publicly.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Accent color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={current.accentColor}
                    onChange={(event) =>
                      updateSlide(selectedIndex, {
                        accentColor: event.target.value,
                      })
                    }
                    className="h-9 w-12 shrink-0 p-1"
                  />
                  <Input
                    value={current.accentColor}
                    readOnly
                    aria-label="Accent color hex value"
                    className="flex-1 font-mono uppercase"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Badge text</Label>
                <Input
                  value={current.badgeText}
                  onChange={(event) =>
                    updateSlide(selectedIndex, { badgeText: event.target.value })
                  }
                  maxLength={40}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* CTA */}
            <div className="space-y-3">
              <GroupLabel>Call To Action</GroupLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Primary label</Label>
                  <Input
                    value={current.primaryCtaLabel}
                    onChange={(event) =>
                      updateSlide(selectedIndex, {
                        primaryCtaLabel: event.target.value,
                      })
                    }
                    maxLength={40}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary link</Label>
                  <Input
                    value={current.primaryCtaHref}
                    onChange={(event) =>
                      updateSlide(selectedIndex, {
                        primaryCtaHref: event.target.value,
                      })
                    }
                    maxLength={300}
                    placeholder="/categories/earbuds"
                    className="font-mono text-xs"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary label</Label>
                  <Input
                    value={current.secondaryCtaLabel}
                    onChange={(event) =>
                      updateSlide(selectedIndex, {
                        secondaryCtaLabel: event.target.value,
                      })
                    }
                    maxLength={40}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary link</Label>
                  <Input
                    value={current.secondaryCtaHref}
                    onChange={(event) =>
                      updateSlide(selectedIndex, {
                        secondaryCtaHref: event.target.value,
                      })
                    }
                    maxLength={300}
                    placeholder="/categories/earbuds"
                    className="font-mono text-xs"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live preview */}
        <Card className="border-zinc-200 shadow-sm lg:sticky lg:top-8 lg:col-span-4 lg:self-start dark:border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Live preview</CardTitle>
                <CardDescription>Slide {selectedIndex + 1}</CardDescription>
              </div>
              {!current.enabled || !isEnabled ? (
                <Badge variant="secondary" className="shrink-0 gap-1.5">
                  <EyeOff className="h-3.5 w-3.5" />
                  Hidden
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <SlidePreview slide={current} dimmed={!current.enabled || !isEnabled} />
          </CardContent>
        </Card>
      </div>
      ) : (
        <Card className="border-zinc-200 shadow-sm dark:border-zinc-800">
          <CardContent className="py-10 text-center text-sm text-zinc-500">
            No slides to edit yet. Slides are seeded by the database migration.
          </CardContent>
        </Card>
      )}
    </form>
  );
}

function FeatureIconSelect({
  value,
  onChange,
}: {
  value: HeroFeatureIcon;
  onChange: (value: HeroFeatureIcon) => void;
}) {
  const Icon = FEATURE_ICON_MAP[value];
  return (
    <Select value={value} onValueChange={(next) => onChange(next as HeroFeatureIcon)}>
      <SelectTrigger className="w-16 shrink-0" aria-label="Feature icon">
        <SelectValue>
          <Icon className="h-4 w-4" />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {FEATURE_ICON_OPTIONS.map((option) => {
          const OptionIcon = FEATURE_ICON_MAP[option.value];
          return (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                <OptionIcon className="h-4 w-4" />
                {option.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function HiddenSlideFields({
  index,
  slide,
}: {
  index: number;
  slide: SlideForm;
}) {
  const prefix = `slide-${index}-`;
  return (
    <>
      <input type="hidden" name={`${prefix}enabled`} value={slide.enabled ? "true" : "false"} />
      <input type="hidden" name={`${prefix}title`} value={slide.title} />
      <input type="hidden" name={`${prefix}subtitle`} value={slide.subtitle} />
      <input type="hidden" name={`${prefix}description`} value={slide.description} />
      <input type="hidden" name={`${prefix}image`} value={slide.image} />
      <input
        type="hidden"
        name={`${prefix}imageMediaAssetId`}
        value={slide.imageMediaAssetId ?? ""}
      />
      <input type="hidden" name={`${prefix}accentColor`} value={slide.accentColor} />
      <input type="hidden" name={`${prefix}badgeText`} value={slide.badgeText} />
      <input type="hidden" name={`${prefix}primaryCtaLabel`} value={slide.primaryCtaLabel} />
      <input type="hidden" name={`${prefix}primaryCtaHref`} value={slide.primaryCtaHref} />
      <input type="hidden" name={`${prefix}secondaryCtaLabel`} value={slide.secondaryCtaLabel} />
      <input type="hidden" name={`${prefix}secondaryCtaHref`} value={slide.secondaryCtaHref} />
      <input type="hidden" name={`${prefix}feature1`} value={slide.feature1} />
      <input type="hidden" name={`${prefix}feature1Icon`} value={slide.feature1Icon} />
      <input type="hidden" name={`${prefix}feature2`} value={slide.feature2} />
      <input type="hidden" name={`${prefix}feature2Icon`} value={slide.feature2Icon} />
    </>
  );
}

function SlidePreview({ slide, dimmed }: { slide: SlideForm; dimmed: boolean }) {
  const Feature1Icon = FEATURE_ICON_MAP[slide.feature1Icon];
  const Feature2Icon = FEATURE_ICON_MAP[slide.feature2Icon];
  const features = [
    { text: slide.feature1, Icon: Feature1Icon },
    { text: slide.feature2, Icon: Feature2Icon },
  ].filter((feature) => feature.text.trim().length > 0);

  return (
    <div
      className={
        "relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950" +
        (dimmed ? " opacity-50" : "")
      }
    >
      {slide.imageUrl ? (
        // Admin-only preview of a validated managed URL or local fallback;
        // next/image optimization adds no value for this live form preview.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />

      <div className="absolute inset-0 flex flex-col items-start justify-center gap-2 p-4">
        {slide.badgeText ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              color: slide.accentColor,
              borderColor: `${slide.accentColor}33`,
            }}
          >
            <span
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: slide.accentColor }}
            />
            {slide.badgeText}
          </span>
        ) : null}
        <h3 className="line-clamp-1 text-lg font-black tracking-tight text-white">
          {slide.title || "Untitled slide"}
        </h3>
        <p className="line-clamp-1 text-xs font-bold text-zinc-300 dark:text-zinc-200">
          {slide.subtitle}
        </p>
        <p className="line-clamp-2 max-w-[90%] text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-300">
          {slide.description}
        </p>
        {features.length > 0 ? (
          <div className="flex flex-wrap gap-3 pt-1">
            {features.map((feature, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 dark:text-zinc-200"
                >
                  <feature.Icon className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                  {feature.text}
                </span>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-2 pt-2">
          {slide.primaryCtaLabel ? (
            <span className="rounded-md bg-white px-2.5 py-1 text-[10px] font-semibold text-zinc-950">
              {slide.primaryCtaLabel}
            </span>
          ) : null}
          {slide.secondaryCtaLabel ? (
            <span className="rounded-md border border-zinc-700 px-2.5 py-1 text-[10px] font-semibold text-white">
              {slide.secondaryCtaLabel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
