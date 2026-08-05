"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { updateHomepageWatchStoriesAction } from "@/features/homepage/actions";
import type {
  HomepageStory,
  HomepageWatchStories,
} from "@/features/homepage/types";
import type { MediaAssetDto } from "@/features/media/types";
import {
  FILE_SIZE_LIMITS,
  IMAGEKIT_UPLOAD_API_ENDPOINT,
  IMAGEKIT_UPLOAD_MIME_CHECK,
} from "@/features/media/types";
import { MediaPickerModal } from "@/features/media/components/media-picker-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

const MAX_STORIES = 8;
const STORY_VIDEO_FOLDER = "homepage/watch-stories";

interface WatchStoriesEditorProps {
  initialData: HomepageWatchStories;
}

interface ImagekitUploadAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
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

async function readError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Request failed.";
  } catch {
    return "Request failed.";
  }
}

async function getUploadAuth() {
  const response = await fetch("/api/admin/media/imagekit-auth", {
    credentials: "include",
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<ImagekitUploadAuth>;
}

function uploadToImagekit(
  file: File,
  auth: ImagekitUploadAuth,
  onProgress: (progress: number) => void
) {
  return new Promise<ImagekitUploadResult>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("token", auth.token);
    formData.append("expire", String(auth.expire));
    formData.append("signature", auth.signature);
    formData.append("publicKey", auth.publicKey);
    formData.append("folder", STORY_VIDEO_FOLDER);
    formData.append("checks", IMAGEKIT_UPLOAD_MIME_CHECK);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.min(90, Math.round((event.loaded / event.total) * 90)));
    };
    xhr.onerror = () => reject(new Error("Video upload failed."));
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error("Video upload failed."));
        return;
      }
      try {
        resolve(JSON.parse(xhr.responseText) as ImagekitUploadResult);
      } catch {
        reject(new Error("Invalid upload response."));
      }
    };
    xhr.open("POST", IMAGEKIT_UPLOAD_API_ENDPOINT);
    xhr.send(formData);
  });
}

async function registerVideo(
  file: File,
  uploadResult: ImagekitUploadResult,
  title: string
) {
  const response = await fetch("/api/admin/media/assets", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileId: uploadResult.fileId || uploadResult.name || file.name,
      storageKey: uploadResult.filePath || uploadResult.name || file.name,
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
      name: file.name,
      altText: title,
      mimeType: file.type,
      width: uploadResult.width,
      height: uploadResult.height,
      sizeBytes: file.size,
      folder: STORY_VIDEO_FOLDER,
    }),
  });

  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<MediaAssetDto>;
}

function normalizeOrder(items: HomepageStory[]) {
  return items.map((item, index) => ({ ...item, sortOrder: (index + 1) * 10 }));
}

export default function WatchStoriesEditor({ initialData }: WatchStoriesEditorProps) {
  const [state, action, isPending] = useActionState(
    updateHomepageWatchStoriesAction,
    { status: "idle", message: null }
  );
  const [isEnabled, setIsEnabled] = useState(initialData.isEnabled);
  const [eyebrow, setEyebrow] = useState(initialData.eyebrow);
  const [heading, setHeading] = useState(initialData.heading);
  const [accentHeading, setAccentHeading] = useState(initialData.accentHeading);
  const [items, setItems] = useState(initialData.items.slice(0, MAX_STORIES));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const selectedItem = items[selectedIndex] ?? null;

  function updateItem(index: number, updates: Partial<HomepageStory>) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item
      )
    );
  }

  function addItem() {
    if (items.length >= MAX_STORIES) return;
    const nextIndex = items.length;
    setItems((current) => [
      ...current,
      {
        id: `story-new-${Date.now()}`,
        title: `Story ${nextIndex + 1}`,
        fallbackVideoPath: "",
        videoUrl: "",
        videoMediaAssetId: null,
        sortOrder: (nextIndex + 1) * 10,
        isEnabled: true,
      },
    ]);
    setSelectedIndex(nextIndex);
    setUploadError(null);
  }

  function removeItem(index: number) {
    const next = normalizeOrder(items.filter((_, itemIndex) => itemIndex !== index));
    setItems(next);
    setSelectedIndex(Math.max(0, Math.min(index, next.length - 1)));
    setUploadError(null);
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(normalizeOrder(next));
    setSelectedIndex(target);
  }

  async function handleVideoUpload(file: File | undefined) {
    if (!file || !selectedItem) return;
    setUploadError(null);

    if (file.type !== "video/mp4" && file.type !== "video/webm") {
      setUploadError("Only MP4 and WebM videos are supported.");
      return;
    }
    if (file.size > FILE_SIZE_LIMITS.video) {
      setUploadError("Video size must be 30MB or smaller.");
      return;
    }

    const targetIndex = selectedIndex;
    setUploadingIndex(targetIndex);
    setUploadProgress(2);

    try {
      const auth = await getUploadAuth();
      const uploaded = await uploadToImagekit(file, auth, setUploadProgress);
      setUploadProgress(95);
      const asset = await registerVideo(file, uploaded, selectedItem.title);
      updateItem(targetIndex, {
        videoMediaAssetId: asset.id,
        videoUrl: asset.url,
        fallbackVideoPath: "",
      });
      setUploadProgress(100);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Video upload failed.");
    } finally {
      setUploadingIndex(null);
    }
  }

  const hasIncompleteItem = items.some(
    (item) => !item.title.trim() || (!item.videoMediaAssetId && !item.fallbackVideoPath)
  );

  return (
    <form action={action} className="flex flex-col gap-6 pb-20">
      <input type="hidden" name="isEnabled" value={String(isEnabled)} />
      <input type="hidden" name="eyebrow" value={eyebrow} />
      <input type="hidden" name="heading" value={heading} />
      <input type="hidden" name="accentHeading" value={accentHeading} />
      <input type="hidden" name="itemCount" value={items.length} />
      {items.map((item, index) => {
        const prefix = `item-${index}-`;
        return (
          <div key={item.id} className="hidden">
            <input name={`${prefix}id`} value={item.id} readOnly />
            <input name={`${prefix}title`} value={item.title} readOnly />
            <input name={`${prefix}video`} value={item.fallbackVideoPath} readOnly />
            <input
              name={`${prefix}videoMediaAssetId`}
              value={item.videoMediaAssetId ?? ""}
              readOnly
            />
            <input name={`${prefix}sortOrder`} value={item.sortOrder} readOnly />
            <input name={`${prefix}isEnabled`} value={String(item.isEnabled)} readOnly />
          </div>
        );
      })}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" type="button" asChild>
            <Link href="/admin/homepage">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to storefront CMS</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Watch Stories
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage up to 8 homepage story videos. MP4 or WebM, maximum 30MB each.
            </p>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isPending || uploadingIndex !== null || hasIncompleteItem}
        >
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
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[minmax(260px,0.8fr)_2fr]">
          <div className="flex items-center gap-3">
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            <div>
              <Label>Show Watch Stories</Label>
              <p className="text-xs text-muted-foreground">
                Turn off to hide the entire video section from the homepage.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="stories-eyebrow">Eyebrow</Label>
              <Input id="stories-eyebrow" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stories-heading">Heading</Label>
              <Input id="stories-heading" value={heading} onChange={(e) => setHeading(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stories-accent-heading">Accent heading</Label>
              <Input
                id="stories-accent-heading"
                value={accentHeading}
                onChange={(e) => setAccentHeading(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Stories</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{items.length} of {MAX_STORIES} slots used</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={addItem} disabled={items.length >= MAX_STORIES}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                Add your first story video.
              </div>
            )}
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedIndex(index);
                  setUploadError(null);
                }}
                className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                  selectedIndex === index ? "border-primary bg-primary/5" : "hover:bg-muted"
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-zinc-950">
                  {item.videoUrl ? (
                    <video src={item.videoUrl} muted playsInline className="h-full w-full object-cover" />
                  ) : (
                    <Video className="h-5 w-5 text-zinc-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{String(index + 1).padStart(2, "0")} · {item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.isEnabled ? "visible" : "hidden"}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Story</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedItem ? (
              <div className="rounded-lg border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                Add a story to begin.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="story-title">Story title</Label>
                  <Input
                    id="story-title"
                    maxLength={60}
                    value={selectedItem.title}
                    onChange={(e) => updateItem(selectedIndex, { title: e.target.value })}
                  />
                </div>

                <div className="rounded-xl border border-dashed p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Story video</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Upload directly to the website or select an existing video.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingIndex !== null}
                        onClick={() =>
                          document.getElementById(`story-video-${selectedIndex}`)?.click()
                        }
                      >
                        {uploadingIndex === selectedIndex ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        Upload video
                      </Button>
                      <input
                        id={`story-video-${selectedIndex}`}
                        type="file"
                        accept="video/mp4,video/webm"
                        className="sr-only"
                        disabled={uploadingIndex !== null}
                        onChange={(event) => {
                          void handleVideoUpload(event.target.files?.[0]);
                          event.currentTarget.value = "";
                        }}
                      />
                      <MediaPickerModal
                        allowedTypes="video"
                        selectedAssetId={selectedItem.videoMediaAssetId}
                        onSelect={(asset) => {
                          if (asset && asset.sizeBytes !== null && asset.sizeBytes > FILE_SIZE_LIMITS.video) {
                            setUploadError("Selected video is larger than 30MB.");
                            return;
                          }
                          setUploadError(null);
                          updateItem(selectedIndex, {
                            videoMediaAssetId: asset?.id ?? null,
                            videoUrl: asset?.url ?? selectedItem.fallbackVideoPath,
                          });
                        }}
                        trigger={<Button type="button" variant="outline">Media Library</Button>}
                      />
                    </div>
                  </div>
                  {uploadingIndex === selectedIndex && (
                    <div className="mt-4 space-y-1.5">
                      <Progress value={uploadProgress} />
                      <p className="text-xs text-muted-foreground">Uploading {uploadProgress}%</p>
                    </div>
                  )}
                  <p className="mt-4 text-xs text-muted-foreground">MP4 or WebM · maximum 30MB</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={selectedItem.isEnabled}
                      onCheckedChange={(checked) => updateItem(selectedIndex, { isEnabled: checked })}
                    />
                    <Label>Story visible</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" size="icon" variant="outline" disabled={selectedIndex === 0} onClick={() => moveItem(selectedIndex, -1)}>
                      <ArrowUp className="h-4 w-4" />
                      <span className="sr-only">Move story up</span>
                    </Button>
                    <Button type="button" size="icon" variant="outline" disabled={selectedIndex === items.length - 1} onClick={() => moveItem(selectedIndex, 1)}>
                      <ArrowDown className="h-4 w-4" />
                      <span className="sr-only">Move story down</span>
                    </Button>
                    <Button type="button" variant="ghost" className="text-destructive" onClick={() => removeItem(selectedIndex)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </Button>
                  </div>
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
            {selectedItem?.videoUrl ? (
              <div className="mx-auto max-w-[240px] overflow-hidden rounded-3xl border border-zinc-800 bg-black shadow-xl">
                <video
                  key={selectedItem.videoUrl}
                  src={selectedItem.videoUrl}
                  controls
                  muted
                  loop
                  playsInline
                  className="aspect-[9/16] w-full object-cover"
                />
                <div className="bg-[#0a0a0a] p-4">
                  <p className="text-[10px] font-black tracking-widest text-amber-500/80">
                    {String(selectedIndex + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-xs font-black uppercase tracking-wider text-white">
                    {selectedItem.title}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed text-center text-muted-foreground">
                <Video className="mb-3 h-8 w-8 opacity-40" />
                <p className="text-sm">Upload a video to preview it.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
