"use client";

import { Disc3, Pencil, Trash2 } from "lucide-react";
import type { Album } from "@/lib/music-data";
import { getImageUrl } from "@/lib/get-image-url";

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AlbumCard({ album, onClick, onEdit, onDelete }: AlbumCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex cursor-pointer flex-col gap-3 rounded-lg border border-border bg-card p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:bg-accent"
    >
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-[#1a1a1f]">
        {album.coverImage ? (
          <img
            src={getImageUrl(album.coverImage)}
            alt={album.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <Disc3 className="h-12 w-12 text-white/10" strokeWidth={1.25} />
        )}

        {/* Hover-reveal action buttons overlaid on cover art */}
        <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="rounded bg-black/50 p-1 text-white/70 transition-colors hover:bg-black/70 hover:text-white"
            aria-label={`Edit ${album.title}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="rounded bg-black/50 p-1 text-white/70 transition-colors hover:bg-black/70 hover:text-red-400"
            aria-label={`Delete ${album.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="line-clamp-1 font-medium text-card-foreground group-hover:text-foreground">
          {album.title}
        </span>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">{album.year}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {album.format}
          </span>
        </div>
      </div>
    </div>
  );
}
