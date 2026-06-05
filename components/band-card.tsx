"use client";

import { Music } from "lucide-react";
import type { Band } from "@/lib/music-data";

interface BandCardProps {
  band: Band;
  onClick: () => void;
}

export function BandCard({ band, onClick }: BandCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-4 rounded-lg bg-card p-6 text-left transition-all duration-200 hover:bg-accent hover:scale-[1.02] border border-border"
    >
      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-muted">
        {band.coverImage ? (
          <img
            src={band.coverImage}
            alt={band.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Music className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      <span className="text-lg font-medium text-card-foreground group-hover:text-foreground">
        {band.name}
      </span>
    </button>
  );
}
