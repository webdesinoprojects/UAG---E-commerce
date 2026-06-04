"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Search,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { MediaAssetDto } from "@/features/media/types";

interface MediaPickerModalProps {
  selectedAssetId?: string | null;
  onSelect: (asset: MediaAssetDto | null) => void;
  allowedTypes?: "all" | "image" | "video";
  trigger?: React.ReactNode;
}

interface PickerApiResponse {
  assets: MediaAssetDto[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  folders: string[];
}

interface FilterState {
  query: string;
  folder: string;
  type: string;
  page: number;
}

const PAGE_SIZE = 24;

function defaultType(allowedTypes: "all" | "image" | "video"): string {
  if (allowedTypes === "image") return "image";
  if (allowedTypes === "video") return "video";
  return "all";
}

function getTypeOptions(allowedTypes: "all" | "image" | "video") {
  if (allowedTypes === "image")
    return [
      { value: "image", label: "All images" },
      { value: "gif", label: "GIFs only" },
    ];
  if (allowedTypes === "video") return [{ value: "video", label: "Videos" }];
  return [
    { value: "all", label: "All types" },
    { value: "image", label: "Images" },
    { value: "gif", label: "GIFs" },
    { value: "video", label: "Videos" },
  ];
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "--";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function AssetCard({
  asset,
  isSelected,
  onClick,
}: {
  asset: MediaAssetDto;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isVid = asset.mimeType?.startsWith("video/") ?? false;

  return (
    <button
      type="button"
      title={asset.altText || asset.storageKey}
      onClick={onClick}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all bg-muted cursor-pointer",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-transparent hover:border-primary/50"
      )}
    >
      {isVid ? (
        <video src={asset.url} className="w-full h-full object-cover" muted />
      ) : (
        <Image
          src={asset.url}
          alt={asset.altText || ""}
          fill
          className="object-cover"
          sizes="120px"
          unoptimized
        />
      )}

      {/* Type badge */}
      <div className="absolute bottom-1 left-1 flex items-center rounded bg-black/70 px-1.5 py-0.5 gap-1">
        {isVid ? (
          <Video className="h-2.5 w-2.5 text-white" />
        ) : (
          <ImageIcon className="h-2.5 w-2.5 text-white" />
        )}
        <span className="text-[9px] text-white/80 font-medium truncate max-w-[60px]">
          {asset.mimeType?.split("/")[1]?.toUpperCase() || "FILE"}
        </span>
      </div>

      {isSelected && (
        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
          <Check className="h-3 w-3" />
        </div>
      )}

      {/* Hover overlay with key info */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
        <p className="text-[9px] text-white/90 font-mono truncate leading-tight">
          {asset.storageKey.split("/").pop() || asset.storageKey}
        </p>
        {asset.width && asset.height && (
          <p className="text-[8px] text-white/70">
            {asset.width}x{asset.height}
          </p>
        )}
      </div>
    </button>
  );
}

function AssetPreview({ asset }: { asset: MediaAssetDto }) {
  const isVid = asset.mimeType?.startsWith("video/") ?? false;
  const [copied, setCopied] = useState(false);

  function handleCopyId() {
    navigator.clipboard.writeText(asset.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted/50">
        {isVid ? (
          <video
            src={asset.url}
            controls
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <Image
            src={asset.url}
            alt={asset.altText || ""}
            fill
            className="object-contain"
            sizes="320px"
            unoptimized
          />
        )}
      </div>

      <div className="space-y-3 text-xs">
        {asset.altText && (
          <div>
            <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px] mb-0.5">
              Alt text
            </p>
            <p>{asset.altText}</p>
          </div>
        )}
        <div>
          <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px] mb-0.5">
            Asset ID
          </p>
          <div className="flex items-center gap-1">
            <p className="font-mono text-[10px] break-all leading-relaxed flex-1">
              {asset.id}
            </p>
            <button
              type="button"
              onClick={handleCopyId}
              className="shrink-0 rounded p-1 hover:bg-muted transition-colors"
              title="Copy ID"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
        <div>
          <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px] mb-0.5">
            Storage key
          </p>
          <p className="font-mono text-[11px] break-all leading-relaxed">
            {asset.storageKey}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {asset.mimeType && (
            <div>
              <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px] mb-0.5">
                Type
              </p>
              <p className="break-all">{asset.mimeType}</p>
            </div>
          )}
          {asset.sizeBytes != null && (
            <div>
              <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px] mb-0.5">
                Size
              </p>
              <p>{formatSize(asset.sizeBytes)}</p>
            </div>
          )}
          {asset.width && asset.height && (
            <div>
              <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px] mb-0.5">
                Dimensions
              </p>
              <p>
                {asset.width} x {asset.height}
              </p>
            </div>
          )}
          {asset.folder && (
            <div>
              <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px] mb-0.5">
                Folder
              </p>
              <p>{asset.folder}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MediaPickerModal({
  selectedAssetId,
  onSelect,
  allowedTypes = "all",
  trigger,
}: MediaPickerModalProps) {
  const [open, setOpen] = useState(false);

  // Internal pending selection -- committed only on "Use selected".
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAsset, setPendingAsset] = useState<MediaAssetDto | null>(null);

  // rawQuery is what the user sees in the search box;
  // it commits to filters after a 300 ms debounce via handleQueryChange.
  const [rawQuery, setRawQuery] = useState("");
  const queryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    query: "",
    folder: "",
    type: defaultType(allowedTypes),
    page: 1,
  });

  // pageData === null means "loading or not yet fetched".
  // fetchError !== null means "fetch failed".
  // isLoading is fully derived -- no synchronous setState in effects.
  const [pageData, setPageData] = useState<PickerApiResponse | null>(null);
  const [allFolders, setAllFolders] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // refreshKey lets the retry button and open-handler trigger a fetch without
  // changing filters.
  const [refreshKey, setRefreshKey] = useState(0);

  // Track whether we already tried to hydrate the selected asset on open.
  const hydratedRef = useRef(false);

  const isLoading = open && pageData === null && fetchError === null;
  const typeOptions = getTypeOptions(allowedTypes);
  const hasActiveFilters =
    filters.query !== "" ||
    filters.folder !== "" ||
    filters.type !== defaultType(allowedTypes);

  // Fetch whenever the sheet is open and filters or refreshKey change.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const params = new URLSearchParams({
      query: filters.query,
      folder: filters.folder,
      type: filters.type,
      page: String(filters.page),
      pageSize: String(PAGE_SIZE),
    });

    fetch(`/api/admin/media/assets?${params}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json() as Promise<PickerApiResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setPageData(data);
        setFetchError(null);
        if (data.folders.length > 0) setAllFolders(data.folders);
        // Sync preview if the pending asset is on this page.
        if (pendingId) {
          const found = data.assets.find((a) => a.id === pendingId);
          if (found) setPendingAsset(found);
        }
      })
      .catch(() => {
        if (!cancelled)
          setFetchError("Could not load media assets. Please try again.");
      });

    return () => {
      cancelled = true;
    };
  }, [open, filters, refreshKey, pendingId]);

  // Hydrate the selected asset once on open if it has an ID.
  useEffect(() => {
    if (!open || !selectedAssetId || hydratedRef.current) return;
    hydratedRef.current = true;

    fetch(
      `/api/admin/media/assets?query=${encodeURIComponent(selectedAssetId)}&pageSize=1`,
      { credentials: "include" }
    )
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as PickerApiResponse;
        if (data.assets.length > 0) {
          setPendingAsset(data.assets[0]);
        }
      })
      .catch(() => {
        // Silent -- preview just won't hydrate.
      });
  }, [open, selectedAssetId]);

  function handleOpenChange(next: boolean) {
    if (next) {
      setPendingId(selectedAssetId ?? null);
      setPendingAsset(null);
      setRawQuery("");
      hydratedRef.current = false;
      // Clear data state first so isLoading becomes true (derived).
      setPageData(null);
      setFetchError(null);
      setFilters({
        query: "",
        folder: "",
        type: defaultType(allowedTypes),
        page: 1,
      });
      setRefreshKey((k) => k + 1);
    } else {
      // Clean up debounce timer on close.
      if (queryDebounceRef.current) {
        clearTimeout(queryDebounceRef.current);
        queryDebounceRef.current = null;
      }
    }
    setOpen(next);
  }

  // Debounce query input in the event handler, not in an effect.
  function handleQueryChange(value: string) {
    setRawQuery(value);
    if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
    queryDebounceRef.current = setTimeout(() => {
      queryDebounceRef.current = null;
      setPageData(null); // show loading while new results arrive
      setFetchError(null);
      setFilters((f) => ({ ...f, query: value, page: 1 }));
    }, 300);
  }

  function handleFolderChange(v: string) {
    setPageData(null);
    setFetchError(null);
    setFilters((f) => ({ ...f, folder: v === "__all__" ? "" : v, page: 1 }));
  }

  function handleTypeChange(v: string) {
    setPageData(null);
    setFetchError(null);
    setFilters((f) => ({ ...f, type: v, page: 1 }));
  }

  function handlePageChange(delta: number) {
    setPageData(null);
    setFetchError(null);
    setFilters((f) => ({ ...f, page: f.page + delta }));
  }

  function handleClearFilters() {
    setRawQuery("");
    if (queryDebounceRef.current) {
      clearTimeout(queryDebounceRef.current);
      queryDebounceRef.current = null;
    }
    setPageData(null);
    setFetchError(null);
    setFilters({
      query: "",
      folder: "",
      type: defaultType(allowedTypes),
      page: 1,
    });
  }

  function handleRetry() {
    setPageData(null);
    setFetchError(null);
    setRefreshKey((k) => k + 1);
  }

  function handleConfirm() {
    onSelect(pendingAsset);
    setOpen(false);
  }

  function handleClear() {
    onSelect(null);
    setOpen(false);
  }

  function handleCancel() {
    setOpen(false);
  }

  // Cleanup debounce on unmount.
  useEffect(() => {
    return () => {
      if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
    };
  }, []);

  const assets = pageData?.assets ?? [];
  const pageCount = pageData?.pageCount ?? 0;
  const total = pageData?.total ?? 0;
  const showPagination = !isLoading && !fetchError && pageCount > 1;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" type="button">
            Select Media
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex h-full w-[92vw] max-w-[1080px] flex-col gap-0 overflow-hidden p-0 sm:max-w-none sm:w-[92vw] data-[side=right]:sm:max-w-[1080px]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b px-5 py-4">
          <div>
            <SheetTitle className="text-base font-semibold">
              Select Media Asset
            </SheetTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Click a tile to preview, then{" "}
              <span className="font-medium">Use selected</span> to confirm.
            </p>
          </div>
          <div className="ml-4 flex shrink-0 items-center gap-2">
            <a
              href="/admin/media"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Upload in Media Library
            </a>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b bg-muted/20 px-5 py-3">
          <div className="relative min-w-[160px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, folder, URL, MIME, or exact ID..."
              value={rawQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>

          <Select
            value={filters.folder || "__all__"}
            onValueChange={handleFolderChange}
          >
            <SelectTrigger className="h-8 w-40 text-sm">
              <SelectValue placeholder="All folders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All folders</SelectItem>
              {allFolders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {typeOptions.length > 1 && (
            <Select value={filters.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="h-8 w-36 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleClearFilters}
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>

        {/* Main content: grid + preview */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Asset grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {isLoading && (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && fetchError && (
              <div className="flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
                <AlertCircle className="h-6 w-6" />
                <p className="text-sm">{fetchError}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                >
                  Retry
                </Button>
              </div>
            )}

            {!isLoading && !fetchError && assets.length === 0 && pageData && (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="h-8 w-8 opacity-40" />
                <p className="text-sm">No assets found.</p>
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {!isLoading && !fetchError && assets.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {assets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    isSelected={pendingId === asset.id}
                    onClick={() => {
                      setPendingId(asset.id);
                      setPendingAsset(asset);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Preview panel -- desktop only */}
          <div className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l md:flex">
            <div className="flex-1 p-4">
              {pendingAsset ? (
                <AssetPreview asset={pendingAsset} />
              ) : pendingId ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10 opacity-30" />
                  <p className="text-sm">
                    Selected asset is not on this page.
                  </p>
                  <p className="text-xs">
                    Search the exact ID to load its preview.
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
                  <ImageIcon className="h-10 w-10 opacity-30" />
                  <p className="text-sm">Select an asset to preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className="flex shrink-0 items-center justify-between border-t bg-muted/20 px-5 py-2.5">
            <p className="text-xs text-muted-foreground">
              {total} {total === 1 ? "asset" : "assets"} - Page {filters.page}{" "}
              of {pageCount}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(-1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                disabled={filters.page >= pageCount}
                onClick={() => handlePageChange(1)}
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t px-5 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            Clear selection
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!pendingAsset}
              onClick={handleConfirm}
            >
              Use selected
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
