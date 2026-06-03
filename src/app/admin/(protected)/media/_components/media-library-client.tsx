"use client";

import * as React from "react";
import { useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileIcon,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import type { MediaAssetDto } from "@/features/media/types";
import {
  ALLOWED_MIME_TYPES,
  getFileSizeLimit,
  isMimeTypeAllowed,
  IMAGEKIT_UPLOAD_API_ENDPOINT,
  IMAGEKIT_UPLOAD_MIME_CHECK,
} from "@/features/media/types";

const FOLDER_OPTIONS = [
  { value: "homepage/hero", label: "Homepage Hero" },
  { value: "homepage/categories", label: "Homepage Categories" },
  { value: "products", label: "Products" },
  { value: "general", label: "General" },
];

interface MediaLibraryClientProps {
  assets: MediaAssetDto[];
  isImagekitConfigured: boolean;
}

export function MediaLibraryClient({
  assets: initialAssets,
  isImagekitConfigured,
}: MediaLibraryClientProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [folder, setFolder] = useState("general");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    setUploadSuccess(false);

    if (!file) {
      return;
    }

    if (!isMimeTypeAllowed(file.type)) {
      setUploadError(
        `File type ${file.type} is not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`
      );
      setSelectedFile(null);
      return;
    }

    const limit = getFileSizeLimit(file.type);
    if (file.size > limit) {
      setUploadError(
        `File size exceeds ${Math.round(limit / 1024 / 1024)}MB limit`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setAltText(file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!selectedFile || !isImagekitConfigured) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const authResponse = await fetch("/api/admin/media/imagekit-auth", {
        method: "GET",
        credentials: "include",
      });

      if (!authResponse.ok) {
        const err = await authResponse.json();
        throw new Error(err.error || "Failed to get upload auth");
      }

      const auth = await authResponse.json();

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileName", selectedFile.name);
      formData.append("token", auth.token);
      formData.append("expire", auth.expire.toString());
      formData.append("signature", auth.signature);
      formData.append("publicKey", auth.publicKey);
      formData.append("folder", folder);
      formData.append("checks", IMAGEKIT_UPLOAD_MIME_CHECK);

      const uploadResponse = await fetch(
        IMAGEKIT_UPLOAD_API_ENDPOINT,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const err = await uploadResponse.json();
        throw new Error(err.error || "Upload failed");
      }

      const uploadResult = await uploadResponse.json();

      const persistResponse = await fetch("/api/admin/media/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fileId: uploadResult.fileId || uploadResult.name,
          storageKey: uploadResult.filePath || uploadResult.name,
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
          name: selectedFile.name,
          altText: altText || null,
          mimeType: selectedFile.type,
          width: uploadResult.width,
          height: uploadResult.height,
          sizeBytes: selectedFile.size,
          folder,
        }),
      });

      if (!persistResponse.ok) {
        const err = await persistResponse.json();
        throw new Error(err.error || "Failed to save asset");
      }

      const savedAsset = await persistResponse.json();
      setAssets((prev) => [savedAsset, ...prev]);
      setUploadSuccess(true);
      setSelectedFile(null);
      setAltText("");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = async (asset: MediaAssetDto) => {
    await navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const isVideo = (mime: string | null) => mime?.startsWith("video/");
  const isImage = (mime: string | null) => mime?.startsWith("image/");

  if (!isImagekitConfigured) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Upload and manage images and videos for your store.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ImageKit Not Configured</AlertTitle>
          <AlertDescription>
            To enable media uploads, add the following environment variables:
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              <li>NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY</li>
              <li>IMAGEKIT_PRIVATE_KEY</li>
              <li>NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground">
          Upload and manage images and videos for your store.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Media
          </CardTitle>
          <CardDescription>
            Supported: JPEG, PNG, WebP, AVIF, GIF, MP4, WebM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept={ALLOWED_MIME_TYPES.join(",")}
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatSize(selectedFile.size)} - {selectedFile.type}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Alt Text</label>
              <Input
                placeholder="Describe the image..."
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Folder</label>
              <Select value={folder} onValueChange={setFolder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {uploadSuccess && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Media uploaded and saved successfully.</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || !isImagekitConfigured}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existing Assets ({assets.length})</h2>

        {assets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No media assets yet.</p>
              <p className="text-sm text-muted-foreground">
                Upload your first image or video above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden">
                <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-800">
                  {isImage(asset.mimeType) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.url}
                      alt={asset.altText || ""}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {isVideo(asset.mimeType) && (
                    <video
                      src={asset.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  )}
                  {!isImage(asset.mimeType) && !isVideo(asset.mimeType) && (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {isVideo(asset.mimeType) ? (
                        <Video className="h-3 w-3 mr-1" />
                      ) : (
                        <ImageIcon className="h-3 w-3 mr-1" />
                      )}
                      {asset.mimeType?.split("/")[1] || "file"}
                    </Badge>
                    {asset.width && asset.height && (
                      <span className="text-xs text-muted-foreground">
                        {asset.width}x{asset.height}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatSize(asset.sizeBytes)}
                  </p>
                  {asset.folder && (
                    <Badge variant="outline" className="text-xs">
                      {asset.folder}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-8"
                    onClick={() => handleCopyUrl(asset)}
                  >
                    {copiedId === asset.id ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {copiedId === asset.id ? "Copied" : "Copy URL"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
