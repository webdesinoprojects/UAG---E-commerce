"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { MediaAssetDto } from "@/features/media/types";
import { Check, Image as ImageIcon, Video } from "lucide-react";

interface MediaPickerModalProps {
  mediaAssets: MediaAssetDto[];
  selectedAssetId?: string | null;
  onSelect: (asset: MediaAssetDto | null) => void;
  allowedTypes?: "all" | "image" | "video";
  trigger?: React.ReactNode;
}

export function MediaPickerModal({
  mediaAssets,
  selectedAssetId,
  onSelect,
  allowedTypes = "all",
  trigger,
}: MediaPickerModalProps) {
  const [open, setOpen] = useState(false);

  const filteredAssets = mediaAssets.filter((asset) => {
    if (allowedTypes === "image") return asset.mimeType?.startsWith("image/");
    if (allowedTypes === "video") return asset.mimeType?.startsWith("video/");
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline" type="button">Select Media</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Media Asset</DialogTitle>
          <p className="text-sm text-zinc-500">
            Upload new assets in the <a href="/admin/media" className="underline text-primary" target="_blank" rel="noreferrer">Media Library</a>.
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 border rounded-md mt-4">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div 
              className={`relative aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${!selectedAssetId ? 'border-primary bg-primary/5' : 'border-zinc-200 hover:border-primary/50'}`}
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
            >
              <span className="text-sm font-medium text-zinc-500">None</span>
            </div>
            
            {filteredAssets.map((asset) => {
              const isSelected = selectedAssetId === asset.id;
              const isVideo = asset.mimeType?.startsWith("video/");
              
              return (
                <div
                  key={asset.id}
                  className={`group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50 bg-zinc-100 dark:bg-zinc-800'}`}
                  onClick={() => {
                    onSelect(asset);
                    setOpen(false);
                  }}
                >
                  {isVideo ? (
                    <video src={asset.url} className="w-full h-full object-cover" />
                  ) : (
                    <Image src={asset.url} alt={asset.altText || ""} fill className="object-cover" sizes="(max-width: 768px) 33vw, 20vw" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="self-end bg-black/60 rounded p-1 text-white">
                      {isVideo ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {filteredAssets.length === 0 && (
            <div className="py-12 text-center text-zinc-500">
              No media assets found matching the criteria.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
