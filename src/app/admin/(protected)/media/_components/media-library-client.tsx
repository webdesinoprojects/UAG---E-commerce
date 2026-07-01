"use client";

import * as React from "react";
import { useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  FileIcon,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { MediaAssetDto } from "@/features/media/types";
import {
  ALLOWED_MIME_TYPES,
  getFileSizeLimit,
  IMAGEKIT_UPLOAD_API_ENDPOINT,
  IMAGEKIT_UPLOAD_MIME_CHECK,
  isMimeTypeAllowed,
} from "@/features/media/types";

const FOLDER_OPTIONS = [
  { value: "homepage/hero", label: "Homepage Hero" },
  { value: "homepage/categories", label: "Homepage Categories" },
  { value: "products", label: "Products" },
  { value: "general", label: "General" },
];

const ASSET_PAGE_SIZE = 24;

type UploadStatus = "queued" | "uploading" | "saving" | "complete" | "error";

interface UploadQueueItem {
  id: string;
  file: File;
  altText: string;
  status: UploadStatus;
  progress: number;
  error: string | null;
}

interface ImagekitUploadAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

interface ImagekitUploadResult {
  fileId?: string;
  filePath?: string;
  name?: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

interface MediaLibraryClientProps {
  assets: MediaAssetDto[];
  isImagekitConfigured: boolean;
}

function createQueueId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getInitialAltText(file: File) {
  return file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
}

function formatSize(bytes: number | null) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function isVideo(mime: string | null) {
  return mime?.startsWith("video/") ?? false;
}

function isImage(mime: string | null) {
  return mime?.startsWith("image/") ?? false;
}

function validateFile(file: File) {
  if (!isMimeTypeAllowed(file.type)) {
    return `File type ${file.type || "unknown"} is not allowed.`;
  }

  const limit = getFileSizeLimit(file.type);

  if (file.size > limit) {
    return `File size exceeds ${Math.round(limit / 1024 / 1024)}MB limit.`;
  }

  return null;
}

async function readError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

async function getUploadAuth(): Promise<ImagekitUploadAuth> {
  const response = await fetch("/api/admin/media/imagekit-auth", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<ImagekitUploadAuth>;
}

function uploadToImagekit({
  file,
  auth,
  folder,
  onProgress,
}: {
  file: File;
  auth: ImagekitUploadAuth;
  folder: string;
  onProgress: (progress: number) => void;
}) {
  return new Promise<ImagekitUploadResult>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("token", auth.token);
    formData.append("expire", auth.expire.toString());
    formData.append("signature", auth.signature);
    formData.append("publicKey", auth.publicKey);
    formData.append("folder", folder);
    formData.append("checks", IMAGEKIT_UPLOAD_MIME_CHECK);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.min(90, Math.round((event.loaded / event.total) * 90)));
    };

    xhr.onerror = () => reject(new Error("Upload failed"));

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        try {
          const errorPayload = JSON.parse(xhr.responseText) as { error?: string };
          reject(new Error(errorPayload.error ?? "Upload failed"));
        } catch {
          reject(new Error("Upload failed"));
        }
        return;
      }

      try {
        const result = JSON.parse(xhr.responseText) as ImagekitUploadResult;
        resolve(result);
      } catch {
        reject(new Error("Invalid upload response"));
      }
    };

    xhr.open("POST", IMAGEKIT_UPLOAD_API_ENDPOINT);
    xhr.send(formData);
  });
}

async function persistAsset({
  uploadResult,
  file,
  altText,
  folder,
}: {
  uploadResult: ImagekitUploadResult;
  file: File;
  altText: string;
  folder: string;
}) {
  const response = await fetch("/api/admin/media/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      fileId: uploadResult.fileId || uploadResult.name || file.name,
      storageKey: uploadResult.filePath || uploadResult.name || file.name,
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
      name: file.name,
      altText: altText || null,
      mimeType: file.type,
      width: uploadResult.width,
      height: uploadResult.height,
      sizeBytes: file.size,
      folder,
    }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<MediaAssetDto>;
}

export function MediaLibraryClient({
  assets: initialAssets,
  isImagekitConfigured,
}: MediaLibraryClientProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [assets, setAssets] = useState(initialAssets);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [folder, setFolder] = useState("general");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const hasPendingUploads = queue.some(
    (item) => item.status === "queued" || item.status === "error"
  );

  const queuedCount = queue.filter((item) => item.status === "queued").length;
  const completeCount = queue.filter((item) => item.status === "complete").length;
  const assetFolders = React.useMemo(
    () =>
      Array.from(
        new Set(assets.map((asset) => asset.folder).filter(Boolean))
      ) as string[],
    [assets]
  );

  const filteredAssets = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          asset.altText,
          asset.storageKey,
          asset.url,
          asset.folder,
          asset.mimeType,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedSearch));

      const matchesFolder =
        folderFilter === "all" || asset.folder === folderFilter;

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "image" &&
          Boolean(asset.mimeType?.startsWith("image/")) &&
          asset.mimeType !== "image/gif") ||
        (typeFilter === "gif" && asset.mimeType === "image/gif") ||
        (typeFilter === "video" && Boolean(asset.mimeType?.startsWith("video/")));

      return matchesSearch && matchesFolder && matchesType;
    });
  }, [assets, folderFilter, searchTerm, typeFilter]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredAssets.length / ASSET_PAGE_SIZE)
  );
  const pageStart = (currentPage - 1) * ASSET_PAGE_SIZE;
  const paginatedAssets = filteredAssets.slice(
    pageStart,
    pageStart + ASSET_PAGE_SIZE
  );

  // Only show details for an asset the user actually selected. No default
  // selection on load, so the Asset Details panel stays in its empty state
  // until a card is clicked (or a freshly uploaded asset is auto-selected).
  const selectedAsset = selectedAssetId
    ? assets.find((asset) => asset.id === selectedAssetId) ?? null
    : null;

  const updateQueueItem = (
    id: string,
    update: Partial<UploadQueueItem>
  ) => {
    setQueue((current) =>
      current.map((item) => (item.id === id ? { ...item, ...update } : item))
    );
  };

  const addFiles = (fileList: FileList | File[]) => {
    setGlobalError(null);

    const incoming = Array.from(fileList).map((file) => {
      const validationError = validateFile(file);

      return {
        id: createQueueId(),
        file,
        altText: getInitialAltText(file),
        status: validationError ? "error" : "queued",
        progress: 0,
        error: validationError,
      } satisfies UploadQueueItem;
    });

    if (incoming.length === 0) return;

    setQueue((current) => [...incoming, ...current]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeQueueItem = (id: string) => {
    setQueue((current) => current.filter((item) => item.id !== id));
  };

  const clearCompleted = () => {
    setQueue((current) => current.filter((item) => item.status !== "complete"));
  };

  const uploadQueue = async () => {
    if (!isImagekitConfigured || isUploading) return;

    const pendingItems = queue.filter(
      (item) => item.status === "queued" || item.status === "error"
    );

    if (pendingItems.length === 0) return;

    setIsUploading(true);
    setGlobalError(null);

    for (const item of pendingItems) {
      const validationError = validateFile(item.file);

      if (validationError) {
        updateQueueItem(item.id, {
          status: "error",
          progress: 0,
          error: validationError,
        });
        continue;
      }

      try {
        updateQueueItem(item.id, {
          status: "uploading",
          progress: 5,
          error: null,
        });

        const auth = await getUploadAuth();
        const uploadResult = await uploadToImagekit({
          file: item.file,
          auth,
          folder,
          onProgress: (progress) => updateQueueItem(item.id, { progress }),
        });

        updateQueueItem(item.id, {
          status: "saving",
          progress: 95,
        });

        const savedAsset = await persistAsset({
          uploadResult,
          file: item.file,
          altText: item.altText,
          folder,
        });

        setAssets((current) => [savedAsset, ...current]);
        setSelectedAssetId(savedAsset.id);
        updateQueueItem(item.id, {
          status: "complete",
          progress: 100,
          error: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        updateQueueItem(item.id, {
          status: "error",
          progress: 0,
          error: message,
        });
        setGlobalError(message);
      }
    }

    setIsUploading(false);
  };

  const handleCopyUrl = async (asset: MediaAssetDto) => {
    await navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isImagekitConfigured) {
    return (
      <div className="mx-auto w-full max-w-7xl p-6">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Media Library</h1>
          <p className="text-muted-foreground">
            Upload and manage images and videos for the storefront.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ImageKit Not Configured</AlertTitle>
          <AlertDescription>
            Add the ImageKit environment variables before uploading media.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Media Library</h1>
          <p className="text-muted-foreground">
            Upload reusable images, GIFs, and videos for CMS sections and products.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{assets.length} assets</Badge>
          {queue.length > 0 && (
            <Badge variant="secondary">
              {completeCount}/{queue.length} uploaded
            </Badge>
          )}
        </div>
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Files
            </CardTitle>
            <CardDescription>
              Drag files into the drop zone or browse from your device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                if (event.currentTarget === event.target) {
                  setIsDragging(false);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                addFiles(event.dataTransfer.files);
              }}
              className={cn(
                "flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 px-6 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/60 hover:bg-muted/40"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_MIME_TYPES.join(",")}
                onChange={(event) => {
                  if (event.target.files) {
                    addFiles(event.target.files);
                  }
                }}
                className="hidden"
              />
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <p className="text-lg font-semibold">Drag and drop files here</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                JPEG, PNG, WebP, AVIF, GIF, MP4, and WebM. Images up to 8MB,
                GIFs up to 12MB, videos up to 25MB.
              </p>
              <Button type="button" className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Browse Files
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Folder</label>
                <Select value={folder} onValueChange={setFolder}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOLDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                onClick={uploadQueue}
                disabled={!hasPendingUploads || isUploading}
                className="min-w-40"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Queue
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle>Upload Queue</CardTitle>
              <CardDescription>
                {queuedCount > 0
                  ? `${queuedCount} waiting to upload`
                  : "Files appear here before they are saved."}
              </CardDescription>
            </div>
            {completeCount > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={clearCompleted}>
                Clear Done
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border bg-muted/20 px-6 text-center">
                <FileIcon className="mb-4 h-10 w-10 text-muted-foreground" />
                <p className="font-medium">No files queued</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add one file or many files from the upload area.
                </p>
              </div>
            ) : (
              <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                        {isVideo(item.file.type) ? (
                          <Video className="h-5 w-5" />
                        ) : (
                          <ImageIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {item.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatSize(item.file.size)} - {item.file.type || "unknown"}
                            </p>
                          </div>
                          <Badge
                            variant={
                              item.status === "error"
                                ? "destructive"
                                : item.status === "complete"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>

                        <Input
                          value={item.altText}
                          placeholder="Alt text"
                          disabled={
                            item.status === "uploading" || item.status === "saving"
                          }
                          onChange={(event) =>
                            updateQueueItem(item.id, {
                              altText: event.target.value,
                            })
                          }
                          className="h-8 text-xs"
                        />

                        <Progress value={item.progress} />

                        {item.error && (
                          <p className="text-xs text-destructive">{item.error}</p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={
                          item.status === "uploading" || item.status === "saving"
                        }
                        onClick={() => removeQueueItem(item.id)}
                        aria-label={`Remove ${item.file.name}`}
                      >
                        {item.status === "complete" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Existing Assets</h2>
            <p className="text-sm text-muted-foreground">
              Reuse these assets from homepage, product, and category editors.
            </p>
          </div>
          <Badge variant="outline">
            {filteredAssets.length}/{assets.length} shown
          </Badge>
        </div>

        <Card>
          <CardContent className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_180px_160px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, folder, URL, or MIME type"
                className="pl-9"
              />
            </div>
            <Select
              value={folderFilter}
              onValueChange={(value) => {
                setFolderFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All folders</SelectItem>
                {assetFolders.map((assetFolder) => (
                  <SelectItem key={assetFolder} value={assetFolder}>
                    {assetFolder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All media</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="gif">GIFs</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center justify-between gap-2 lg:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Prev
              </Button>
              <span className="min-w-16 text-center text-sm text-muted-foreground">
                {currentPage}/{pageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= pageCount}
                onClick={() =>
                  setCurrentPage((page) => Math.min(pageCount, page + 1))
                }
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        {assets.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">No media assets yet</p>
              <p className="text-sm text-muted-foreground">
                Upload files above to start building the library.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            {filteredAssets.length === 0 ? (
              <Card>
                <CardContent className="flex min-h-[220px] flex-col items-center justify-center text-center">
                  <Search className="mb-4 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">No assets match these filters</p>
                  <p className="text-sm text-muted-foreground">
                    Adjust the search, folder, or media type.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid auto-rows-min content-start grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
                {paginatedAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;

                  return (
                    <Card
                      key={asset.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedAssetId(asset.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedAssetId(asset.id);
                        }
                      }}
                      className={cn(
                        "cursor-pointer gap-0 overflow-hidden py-0 transition-all",
                        isSelected
                          ? "ring-2 ring-primary"
                          : "hover:ring-primary/40"
                      )}
                    >
                      <div className="relative aspect-square bg-muted">
                        {isImage(asset.mimeType) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.url}
                            alt={asset.altText || ""}
                            className="h-full w-full object-cover"
                          />
                        )}
                        {isVideo(asset.mimeType) && (
                          <video
                            src={asset.url}
                            className="h-full w-full object-cover"
                            muted
                            loop
                            playsInline
                          />
                        )}
                        {!isImage(asset.mimeType) && !isVideo(asset.mimeType) && (
                          <div className="flex h-full w-full items-center justify-center">
                            <FileIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="space-y-2 p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {isVideo(asset.mimeType) ? (
                              <Video className="mr-1 h-3 w-3" />
                            ) : (
                              <ImageIcon className="mr-1 h-3 w-3" />
                            )}
                            {asset.mimeType?.split("/")[1] || "file"}
                          </Badge>
                          {asset.width && asset.height && (
                            <span className="text-xs text-muted-foreground">
                              {asset.width}x{asset.height}
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {asset.altText || asset.storageKey}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Card className="h-fit lg:sticky lg:top-20">
              <CardHeader>
                <CardTitle>Asset Details</CardTitle>
                <CardDescription>
                  Select an asset to inspect metadata and copy values.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedAsset ? (
                  <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border bg-muted/20 text-center">
                    <ImageIcon className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No asset selected
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                      {isImage(selectedAsset.mimeType) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedAsset.url}
                          alt={selectedAsset.altText || ""}
                          className="h-full w-full object-contain"
                        />
                      )}
                      {isVideo(selectedAsset.mimeType) && (
                        <video
                          src={selectedAsset.url}
                          className="h-full w-full object-contain"
                          controls
                          muted
                          playsInline
                        />
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Type</span>
                        <span>{selectedAsset.mimeType || "-"}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Size</span>
                        <span>{formatSize(selectedAsset.sizeBytes)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Dimensions</span>
                        <span>
                          {selectedAsset.width && selectedAsset.height
                            ? `${selectedAsset.width}x${selectedAsset.height}`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Folder</span>
                        <span className="max-w-48 truncate">
                          {selectedAsset.folder || "-"}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Alt text</span>
                        <p className="break-words">
                          {selectedAsset.altText || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleCopyUrl(selectedAsset)}
                      >
                        {copiedId === selectedAsset.id ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        Copy URL
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          await navigator.clipboard.writeText(selectedAsset.id);
                          setCopiedId(selectedAsset.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy ID
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-muted-foreground"
                      disabled
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete requires backend delete route
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  );
}
