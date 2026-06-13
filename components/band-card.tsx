"use client";

import { Music, Pencil, Trash2 } from "lucide-react";
import type { Band } from "@/lib/music-data";
import { getImageUrl } from "@/lib/get-image-url";

interface BandCardProps {
  band: Band;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BandCard({ band, onClick, onEdit, onDelete }: BandCardProps) {
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
      className="group relative flex cursor-pointer flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 text-left transition-all duration-200 hover:scale-[1.02] hover:bg-accent"
    >
      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#1a1a1f]">
        {band.coverImage ? (
          <img
            src={getImageUrl(band.coverImage)}
            alt={band.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Music className="h-10 w-10 text-white/10" strokeWidth={1.25} />
        )}
      </div>
      <span className="text-lg font-medium text-card-foreground group-hover:text-foreground">
        {band.name}
      </span>

      {/* Hover-reveal action buttons */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={`Edit ${band.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
          aria-label={`Delete ${band.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
