"use client";

import { Disc3 } from "lucide-react";
import type { Album } from "@/lib/music-data";

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
}

export function AlbumCard({ album, onClick }: AlbumCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-lg bg-card p-4 text-left transition-all duration-200 hover:bg-accent hover:scale-[1.02] border border-border"
    >
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-muted">
        {album.coverImage ? (
          <img
            src={album.coverImage}
            alt={album.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <Disc3 className="h-16 w-16 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-card-foreground group-hover:text-foreground line-clamp-1">
          {album.title}
        </span>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">{album.year}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {album.format}
          </span>
        </div>
      </div>
    </button>
  );
}
