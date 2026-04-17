"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, GripVertical, ImageIcon } from "lucide-react";

const MAX_PHOTOS = 6;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

export interface PhotoFile {
  id: string;
  file: File;
  preview: string;
}

interface PhotoUploaderProps {
  photos: PhotoFile[];
  onChange: (photos: PhotoFile[]) => void;
}

export function PhotoUploader({ photos, onChange }: PhotoUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const valid: PhotoFile[] = [];

      for (const file of Array.from(files)) {
        if (!ACCEPTED.includes(file.type)) {
          setError("Only JPG, PNG, and WebP images are allowed.");
          continue;
        }
        if (file.size > 8 * 1024 * 1024) {
          setError("Each photo must be under 8 MB.");
          continue;
        }
        if (photos.length + valid.length >= MAX_PHOTOS) {
          setError(`Maximum ${MAX_PHOTOS} photos allowed.`);
          break;
        }
        valid.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
        });
      }

      if (valid.length) onChange([...photos, ...valid]);
    },
    [photos, onChange]
  );

  const remove = (id: string) => {
    const removed = photos.find((p) => p.id === id);
    if (removed) URL.revokeObjectURL(removed.preview);
    onChange(photos.filter((p) => p.id !== id));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#64748B]">
        Add up to {MAX_PHOTOS} photos. Clear, well-lit photos from multiple angles help your suit sell faster.
      </p>

      {/* Drop zone */}
      {photos.length < MAX_PHOTOS && (
        <label
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-colors ${
            dragging
              ? "border-[#00B4FF] bg-[#F0F7FF]"
              : "border-slate-200 hover:border-[#00B4FF] hover:bg-[#F0F7FF]/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F0F7FF] flex items-center justify-center">
            <Upload size={24} className="text-[#00B4FF]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#1A1A2E]">
              Drag & drop or <span className="text-[#00B4FF]">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP · Max 8 MB each</p>
          </div>
          <input
            type="file"
            accept={ACCEPTED.join(",")}
            multiple
            className="sr-only"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </label>
      )}

      {error && (
        <p className="text-sm text-[#EF4444] bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group">
              <Image
                src={photo.preview}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="200px"
              />
              {i === 0 && (
                <div className="absolute top-1.5 left-1.5 bg-[#00B4FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Cover
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(photo.id)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-1.5 right-1.5 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical size={14} />
              </div>
            </div>
          ))}

          {/* Add more slot */}
          {photos.length < MAX_PHOTOS && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#00B4FF] transition-colors">
              <ImageIcon size={20} className="text-slate-300" />
              <span className="text-xs text-slate-400">Add more</span>
              <input
                type="file"
                accept={ACCEPTED.join(",")}
                multiple
                className="sr-only"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </label>
          )}
        </div>
      )}

      <p className="text-xs text-slate-400">
        {photos.length} / {MAX_PHOTOS} photos added
        {photos.length === 0 && " · At least 1 photo is required"}
      </p>
    </div>
  );
}
