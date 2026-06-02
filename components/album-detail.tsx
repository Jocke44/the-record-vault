"use client";

import { ArrowLeft, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Album } from "@/lib/music-data";

interface AlbumDetailProps {
  album: Album;
  artistName: string;
  onBack: () => void;
}

export function AlbumDetail({ album, artistName, onBack }: AlbumDetailProps) {
  return (
    <div className="flex flex-col gap-8">
      <Button
        variant="ghost"
        onClick={onBack}
        className="w-fit gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to albums
      </Button>

      <div className="flex flex-col gap-8 md:flex-row md:gap-12">
        <div className="flex aspect-square w-full max-w-xs items-center justify-center rounded-lg bg-card border border-border">
          <Disc3 className="h-24 w-24 text-muted-foreground" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">{artistName}</span>
            <h2 className="text-3xl font-bold text-foreground">{album.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-muted-foreground">{album.year}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                {album.format}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Tracklist</h3>
            <ol className="flex flex-col gap-2">
              {album.tracks.map((track) => (
                <li
                  key={track.number}
                  className="flex items-center gap-4 rounded-md px-3 py-2 hover:bg-card transition-colors"
                >
                  <span className="w-6 text-right text-sm text-muted-foreground">
                    {track.number}
                  </span>
                  <span className="text-foreground">{track.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
