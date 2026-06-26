"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Plus,
  Star,
  StarOff,
  Trash2,
  Video,
} from "lucide-react";
import {
  PRODUCT_MEDIA_LIMITS,
  type AdminProductMediaItemDto,
  type CatalogProductMediaPlacement,
} from "@/features/catalog/types";
import type { MediaAssetDto } from "@/features/media/types";
import {
  type CatalogActionState,
  updateCatalogProductMediaAction,
} from "@/features/catalog/actions";
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

interface ProductMediaManagerProps {
  productId: string;
  initialMedia: AdminProductMediaItemDto[];
}

interface ProductMediaFieldsProps {
  productId?: string;
  initialMedia: AdminProductMediaItemDto[];
  state?: CatalogActionState;
  isPending: boolean;
  showSaveButton?: boolean;
  showStatusAlerts?: boolean;
  onPrimaryThumbnailChange?: (
    asset: { id: string; url: string; altText: string | null } | null
  ) => void;
  onSaveBlockedChange?: (blocked: boolean) => void;
}

type ClientMediaItem = {
  // DB row id (empty string = new row, not yet saved)
  id: string;
  // Stable React key
  _clientId: string;
  productId: string;
  mediaAssetId: string;
  url: string;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  placement: CatalogProductMediaPlacement;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  isEnabled: boolean;
};

const PLACEMENT_LABELS: Record<CatalogProductMediaPlacement, string> = {
  thumbnail: "Thumbnail",
  gallery: "Gallery",
  hero: "Hero",
  bento: "Bento",
  detail: "Detail",
};

const ALL_PLACEMENTS: CatalogProductMediaPlacement[] = [
  "thumbnail",
  "gallery",
  "hero",
  "bento",
  "detail",
];

const ADDABLE_PLACEMENTS: CatalogProductMediaPlacement[] = [
  "thumbnail",
  "gallery",
  "bento",
];

function allowedTypesForPlacement(
  placement: CatalogProductMediaPlacement
): "all" | "image" | "video" {
  return placement === "gallery" ? "all" : "image";
}

function getPlacementLimit(placement: CatalogProductMediaPlacement) {
  if (placement === "gallery") return PRODUCT_MEDIA_LIMITS.galleryTotal;
  return PRODUCT_MEDIA_LIMITS[placement];
}

function getMediaKind(item: Pick<ClientMediaItem, "mediaAssetId" | "mimeType">) {
  if (!item.mediaAssetId) return "unlinked";
  if (item.mimeType?.startsWith("video/")) return "video";
  if (item.mimeType?.startsWith("image/")) return "image";
  return "file";
}

function newClientId() {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "--";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function MediaThumb({ item }: { item: ClientMediaItem }) {
  const isVideo = item.mimeType?.startsWith("video/") ?? false;
  const isImg = item.mimeType?.startsWith("image/") ?? false;
  const hasAsset = !!item.mediaAssetId;

  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
      {isImg && hasAsset ? (
        <Image
          src={item.url}
          alt={item.altText || ""}
          fill
          className="object-cover"
          sizes="64px"
          unoptimized
        />
      ) : isVideo && hasAsset ? (
        <video src={item.url} muted className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          {isVideo ? (
            <Video className="h-6 w-6 text-muted-foreground" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
      )}
      {!hasAsset && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
          <span className="text-[9px] text-destructive font-semibold">No asset</span>
        </div>
      )}
    </div>
  );
}

export function ProductMediaFields({
  productId = "",
  initialMedia,
  state = { status: "idle", message: null },
  isPending,
  showSaveButton = true,
  showStatusAlerts = true,
  onPrimaryThumbnailChange,
  onSaveBlockedChange,
}: ProductMediaFieldsProps) {
  const [items, setItems] = useState<ClientMediaItem[]>(() =>
    initialMedia.map((m, i) => ({
      id: m.id,
      _clientId: `init-${i}`,
      productId: m.productId,
      mediaAssetId: m.mediaAssetId,
      url: m.url,
      mimeType: m.mimeType,
      width: m.width,
      height: m.height,
      sizeBytes: m.sizeBytes,
      placement: m.placement,
      altText: m.altText,
      sortOrder: m.sortOrder,
      isPrimary: m.isPrimary,
      isEnabled: m.isEnabled,
    }))
  );

  const enabledItems = items.filter((i) => i.isEnabled);
  const thumbnailCount = enabledItems.filter((i) => i.placement === "thumbnail").length;
  const galleryRows = enabledItems.filter((i) => i.placement === "gallery");
  const galleryImages = galleryRows.filter(
    (i) => getMediaKind(i) === "image"
  );
  const galleryVideos = galleryRows.filter(
    (i) => getMediaKind(i) === "video"
  );
  const bentoCount = enabledItems.filter((i) => i.placement === "bento").length;
  const disabledCount = items.filter((i) => !i.isEnabled).length;
  const hasUnlinkedRows = items.some((i) => !i.mediaAssetId);
  const hasPrimaryThumbnail = enabledItems.some(
    (i) => i.placement === "thumbnail" && i.isPrimary
  );
  const needsPrimaryThumbnail = enabledItems.length > 0 && !hasPrimaryThumbnail;
  const hasReservedEnabledRows = enabledItems.some(
    (i) => getPlacementLimit(i.placement) === 0
  );
  const hasLimitOverflow =
    items.length > PRODUCT_MEDIA_LIMITS.total ||
    thumbnailCount > PRODUCT_MEDIA_LIMITS.thumbnail ||
    galleryRows.length > PRODUCT_MEDIA_LIMITS.galleryTotal ||
    galleryImages.length > PRODUCT_MEDIA_LIMITS.galleryImages ||
    galleryVideos.length > PRODUCT_MEDIA_LIMITS.galleryVideos ||
    bentoCount > PRODUCT_MEDIA_LIMITS.bento ||
    hasReservedEnabledRows;
  const saveDisabled =
    isPending || hasUnlinkedRows || hasLimitOverflow || needsPrimaryThumbnail;

  useEffect(() => {
    if (!onPrimaryThumbnailChange) return;

    const primaryThumbnail = items.find(
      (item) =>
        item.isEnabled &&
        item.isPrimary &&
        item.placement === "thumbnail" &&
        item.mediaAssetId
    );

    onPrimaryThumbnailChange(
      primaryThumbnail
        ? {
            id: primaryThumbnail.mediaAssetId,
            url: primaryThumbnail.url,
            altText: primaryThumbnail.altText || null,
          }
        : null
    );
  }, [items, onPrimaryThumbnailChange]);

  useEffect(() => {
    onSaveBlockedChange?.(hasUnlinkedRows || hasLimitOverflow || needsPrimaryThumbnail);
  }, [
    hasLimitOverflow,
    hasUnlinkedRows,
    needsPrimaryThumbnail,
    onSaveBlockedChange,
  ]);

  function countEnabledPlacement(
    placement: CatalogProductMediaPlacement,
    excludeClientId?: string
  ) {
    return items.filter(
      (i) =>
        i.isEnabled &&
        i.placement === placement &&
        i._clientId !== excludeClientId
    ).length;
  }

  function getLimitMessage(
    placement: CatalogProductMediaPlacement,
    excludeClientId?: string
  ) {
    if (items.length >= PRODUCT_MEDIA_LIMITS.total && !excludeClientId) {
      return `Product media is limited to ${PRODUCT_MEDIA_LIMITS.total} rows for the current storefront.`;
    }

    const limit = getPlacementLimit(placement);
    if (limit === 0) {
      return `${PLACEMENT_LABELS[placement]} media is reserved; it is not rendered by the current storefront yet.`;
    }

    if (countEnabledPlacement(placement, excludeClientId) >= limit) {
      return `${PLACEMENT_LABELS[placement]} limit reached (${limit}/${limit}).`;
    }

    return null;
  }

  function addMedia(placement: CatalogProductMediaPlacement) {
    const limitMessage = getLimitMessage(placement);
    if (limitMessage) {
      toast.warning(limitMessage);
      return;
    }

    const placementItems = items.filter((i) => i.placement === placement);
    const maxOrder = placementItems.reduce((m, i) => Math.max(m, i.sortOrder), 0);
    const isFirstThumbnail =
      placement === "thumbnail" && items.filter((i) => i.placement === "thumbnail").length === 0;

    setItems((prev) => [
      ...prev,
      {
        id: "",
        _clientId: newClientId(),
        productId,
        mediaAssetId: "",
        url: "",
        mimeType: null,
        width: null,
        height: null,
        sizeBytes: null,
        placement,
        altText: "",
        sortOrder: maxOrder + 10,
        isPrimary: isFirstThumbnail,
        isEnabled: true,
      },
    ]);
  }

  function removeMedia(clientId: string) {
    setItems((prev) => prev.filter((i) => i._clientId !== clientId));
  }

  // Swap positions and renormalize sortOrder to 10,20,30,...
  function moveMedia(index: number, delta: number) {
    setItems((prev) => {
      const targetIndex = index + delta;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next.map((item, i) => ({ ...item, sortOrder: (i + 1) * 10 }));
    });
  }

  function updateItem(clientId: string, patch: Partial<ClientMediaItem>) {
    setItems((prev) =>
      prev.map((item) => (item._clientId === clientId ? { ...item, ...patch } : item))
    );
  }

  function handlePlacementChange(
    clientId: string,
    placement: CatalogProductMediaPlacement
  ) {
    const current = items.find((i) => i._clientId === clientId);
    if (!current) return;

    if (current.isEnabled) {
      const limitMessage = getLimitMessage(placement, clientId);
      if (limitMessage) {
        toast.warning(limitMessage);
        return;
      }
    }

    const nextPatch: Partial<ClientMediaItem> = {
      placement,
      isPrimary: false,
    };

    if (placement !== "gallery" && getMediaKind(current) === "video") {
      Object.assign(nextPatch, {
        mediaAssetId: "",
        url: "",
        mimeType: null,
        width: null,
        height: null,
        sizeBytes: null,
      });
      toast.warning(`${PLACEMENT_LABELS[placement]} accepts images only. Select an image asset.`);
    }

    updateItem(clientId, nextPatch);
  }

  function handleEnabledChange(clientId: string, enabled: boolean) {
    const current = items.find((i) => i._clientId === clientId);
    if (!current) return;

    if (enabled) {
      const limitMessage = getLimitMessage(current.placement, clientId);
      if (limitMessage) {
        toast.warning(limitMessage);
        return;
      }
    }

    updateItem(clientId, { isEnabled: enabled });
  }

  // Setting thumbnail primary unsets all other thumbnail primaries.
  function setThumbnailPrimary(clientId: string, primary: boolean) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.placement !== "thumbnail") return item;
        if (item._clientId === clientId) return { ...item, isPrimary: primary };
        if (primary) return { ...item, isPrimary: false };
        return item;
      })
    );
  }

  function handleAssetSelect(clientId: string, asset: MediaAssetDto | null) {
    if (!asset) {
      updateItem(clientId, {
        mediaAssetId: "",
        url: "",
        mimeType: null,
        width: null,
        height: null,
        sizeBytes: null,
      });
      return;
    }
    const current = items.find((i) => i._clientId === clientId);
    if (!current) return;

    const assetIsVideo = asset.mimeType?.startsWith("video/") ?? false;
    const assetIsImage = asset.mimeType?.startsWith("image/") ?? false;

    if (current.placement !== "gallery" && !assetIsImage) {
      toast.warning(`${PLACEMENT_LABELS[current.placement]} accepts images only.`);
      return;
    }

    if (current.placement === "gallery" && current.isEnabled) {
      if (assetIsVideo) {
        const otherVideos = items.filter(
          (i) =>
            i._clientId !== clientId &&
            i.isEnabled &&
            i.placement === "gallery" &&
            getMediaKind(i) === "video"
        ).length;
        if (otherVideos >= PRODUCT_MEDIA_LIMITS.galleryVideos) {
          toast.warning(`Gallery video limit reached (${PRODUCT_MEDIA_LIMITS.galleryVideos}/${PRODUCT_MEDIA_LIMITS.galleryVideos}).`);
          return;
        }
      }

      if (assetIsImage) {
        const otherImages = items.filter(
          (i) =>
            i._clientId !== clientId &&
            i.isEnabled &&
            i.placement === "gallery" &&
            getMediaKind(i) === "image"
        ).length;
        if (otherImages >= PRODUCT_MEDIA_LIMITS.galleryImages) {
          toast.warning(`Gallery image limit reached (${PRODUCT_MEDIA_LIMITS.galleryImages}/${PRODUCT_MEDIA_LIMITS.galleryImages}).`);
          return;
        }
      }
    }

    updateItem(clientId, {
      mediaAssetId: asset.id,
      url: asset.url,
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
      sizeBytes: asset.sizeBytes,
      altText: current?.altText || asset.altText || "",
    });
  }

  return (
    <>
      <input type="hidden" name="mediaCount" value={items.length.toString()} />

      {/* Hidden inputs - one set per item, driven by React state */}
      {items.map((item, index) => (
        <div key={item._clientId}>
          <input type="hidden" name={`media.${index}.id`} value={item.id} />
          <input type="hidden" name={`media.${index}.mediaAssetId`} value={item.mediaAssetId} />
          <input type="hidden" name={`media.${index}.placement`} value={item.placement} />
          <input type="hidden" name={`media.${index}.altText`} value={item.altText} />
          <input type="hidden" name={`media.${index}.sortOrder`} value={item.sortOrder} />
          <input type="hidden" name={`media.${index}.isPrimary`} value={item.isPrimary ? "true" : "false"} />
          <input type="hidden" name={`media.${index}.isEnabled`} value={item.isEnabled ? "true" : "false"} />
        </div>
      ))}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Product Media</CardTitle>
            <CardDescription>
              Current storefront uses 1 thumbnail, 5 gallery images, 1 gallery video,
              and 5 bento images.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">
              {items.length}/{PRODUCT_MEDIA_LIMITS.total} total
            </Badge>
            <Badge variant="outline">
              {thumbnailCount}/{PRODUCT_MEDIA_LIMITS.thumbnail} thumbnail
            </Badge>
            <Badge variant="outline">
              {galleryImages.length}/{PRODUCT_MEDIA_LIMITS.galleryImages} gallery img
            </Badge>
            <Badge variant="outline">
              {galleryVideos.length}/{PRODUCT_MEDIA_LIMITS.galleryVideos} gallery video
            </Badge>
            <Badge variant="outline">
              {bentoCount}/{PRODUCT_MEDIA_LIMITS.bento} bento
            </Badge>
            {disabledCount > 0 && (
              <Badge variant="secondary">{disabledCount} disabled</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Alerts */}
          {showStatusAlerts && state.status === "error" && state.message && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          {showStatusAlerts && state.status === "success" && state.message && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          {hasUnlinkedRows && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some rows have no asset selected. Use the Select button to pick an image
                or video before saving.
              </AlertDescription>
            </Alert>
          )}
          {hasLimitOverflow && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Product media exceeds current storefront slots. Keep enabled media within
                1 thumbnail, 5 gallery images, 1 gallery video, and 5 bento images.
                Disable or remove reserved hero/detail rows before saving.
              </AlertDescription>
            </Alert>
          )}
          {needsPrimaryThumbnail && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Select one enabled thumbnail as Primary before saving. Product cards
                and listings need this image.
              </AlertDescription>
            </Alert>
          )}

          {/* Media rows */}
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
              No media added. Use the buttons below to add images or videos.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item._clientId}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-start"
                >
                  {/* Thumbnail */}
                  <MediaThumb item={item} />

                  {/* Controls */}
                  <div className="flex flex-1 flex-col gap-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Placement selector */}
                      <div className="w-36">
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          Placement
                        </Label>
                        <Select
                          value={item.placement}
                          onValueChange={(v) =>
                            handlePlacementChange(
                              item._clientId,
                              v as CatalogProductMediaPlacement
                            )
                          }
                          disabled={isPending}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ALL_PLACEMENTS.map((p) => (
                              <SelectItem
                                key={p}
                                value={p}
                                className="text-xs"
                                disabled={getPlacementLimit(p) === 0}
                              >
                                {PLACEMENT_LABELS[p]}
                                {getPlacementLimit(p) === 0 ? " (reserved)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Alt text */}
                      <div className="flex-1 min-w-[120px]">
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          Alt text
                        </Label>
                        <Input
                          value={item.altText}
                          onChange={(e) =>
                            updateItem(item._clientId, { altText: e.target.value })
                          }
                          placeholder="Describe the image"
                          className="h-8 text-xs"
                          maxLength={200}
                          disabled={isPending}
                        />
                      </div>

                      {/* Enabled switch */}
                      <div className="flex flex-col items-center gap-1">
                        <Label className="text-xs text-muted-foreground">Enabled</Label>
                        <Switch
                          checked={item.isEnabled}
                          onCheckedChange={(v) =>
                            handleEnabledChange(item._clientId, v)
                          }
                          disabled={isPending}
                        />
                      </div>

                      {/* Primary toggle - thumbnail only */}
                      {item.placement === "thumbnail" && (
                        <div className="flex flex-col items-center gap-1">
                          <Label className="text-xs text-muted-foreground">Primary</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${item.isPrimary ? "text-amber-500" : "text-muted-foreground"}`}
                            title={item.isPrimary ? "Primary thumbnail" : "Set as primary"}
                            onClick={() =>
                              setThumbnailPrimary(item._clientId, !item.isPrimary)
                            }
                            disabled={isPending}
                          >
                            {item.isPrimary ? (
                              <Star className="h-4 w-4 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Metadata + actions row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant={getMediaKind(item) === "video" ? "secondary" : "outline"}
                        className="h-6"
                      >
                        {getMediaKind(item) === "video"
                          ? "Video"
                          : getMediaKind(item) === "image"
                            ? "Image"
                            : getMediaKind(item) === "unlinked"
                              ? "No asset"
                              : "File"}
                      </Badge>
                      {item.mimeType && <span>{item.mimeType}</span>}
                      {item.sizeBytes && <span>{formatSize(item.sizeBytes)}</span>}
                      {item.width && item.height && (
                        <span>
                          {item.width}&times;{item.height}
                        </span>
                      )}

                      <Separator orientation="vertical" className="h-3" />

                      {/* Select / Change asset */}
                      <MediaPickerModal
                        selectedAssetId={item.mediaAssetId || null}
                        allowedTypes={allowedTypesForPlacement(item.placement)}
                        onSelect={(asset) => handleAssetSelect(item._clientId, asset)}
                        trigger={
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={isPending}
                          >
                            {item.mediaAssetId ? "Change" : "Select asset"}
                          </Button>
                        }
                      />

                      {/* Move up */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveMedia(index, -1)}
                        disabled={isPending || index === 0}
                        title="Move up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>

                      {/* Move down */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveMedia(index, 1)}
                        disabled={isPending || index === items.length - 1}
                        title="Move down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>

                      {/* Remove */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeMedia(item._clientId)}
                        disabled={isPending}
                        title="Remove row"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {ADDABLE_PLACEMENTS.map((placement) => (
              <Button
                key={placement}
                type="button"
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  addMedia(placement);
                }}
                disabled={isPending}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add {PLACEMENT_LABELS[placement].toLowerCase()} (
                {countEnabledPlacement(placement)}/{getPlacementLimit(placement)})
              </Button>
            ))}
          </div>

          {showSaveButton && (
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={saveDisabled}
              >
                {isPending ? "Saving..." : "Save Media"}
              </Button>
              {hasUnlinkedRows && (
                <p className="text-xs text-destructive">
                  Select an asset for every row before saving.
                </p>
              )}
              {!hasUnlinkedRows && hasLimitOverflow && (
                <p className="text-xs text-destructive">
                  Reduce enabled media to the displayed limits before saving.
                </p>
              )}
              {!hasUnlinkedRows && !hasLimitOverflow && needsPrimaryThumbnail && (
                <p className="text-xs text-destructive">
                  Mark one enabled thumbnail as Primary.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export function ProductMediaManager({
  productId,
  initialMedia,
}: ProductMediaManagerProps) {
  const [state, action, isPending] = useActionState(updateCatalogProductMediaAction, {
    status: "idle",
    message: null,
  });

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="productId" value={productId} />
      <ProductMediaFields
        productId={productId}
        initialMedia={initialMedia}
        state={state}
        isPending={isPending}
      />
    </form>
  );
}
