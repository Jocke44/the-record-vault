"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Disc, Home, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BandCard } from "@/components/band-card";
import { AlbumCard } from "@/components/album-card";
import { AddAlbumDialog } from "@/components/add-album-dialog";
import { AlbumDetail } from "@/components/album-detail";
import { fetchMusicCollection } from "@/lib/fetch-music-collection";
import type { Band, Album, AlbumFormat } from "@/lib/music-data";
import { cn } from "@/lib/utils";

type View = "bands" | "albums" | "detail";

const FORMAT_FILTERS = ["All", "Vinyl", "CD", "EP"] as const;
type FormatFilter = (typeof FORMAT_FILTERS)[number];

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query);
}

function bandHasFormat(band: Band, format: AlbumFormat) {
  return band.albums.some((album) => album.format === format);
}

export function RecordVault() {
  const [musicCollection, setMusicCollection] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>("bands");
  const [selectedBand, setSelectedBand] = useState<Band | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("All");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const refreshCollection = useCallback(async () => {
    const data = await fetchMusicCollection();
    setMusicCollection(data);
    setSelectedBand((prev) => {
      if (!prev) return prev;
      return data.find((band) => band.id === prev.id) ?? prev;
    });
    setSelectedAlbum((prev) => {
      if (!prev) return prev;
      for (const band of data) {
        const album = band.albums.find((a) => a.id === prev.id);
        if (album) return album;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchMusicCollection()
      .then((data) => {
        if (!cancelled) setMusicCollection(data);
      })
      .catch((error) => {
        console.error("Failed to load collection:", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const sortedBands = [...musicCollection].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const filteredBands = sortedBands.filter((band) => {
    if (formatFilter !== "All" && !bandHasFormat(band, formatFilter)) {
      return false;
    }
    if (normalizedSearch && !matchesQuery(band.name, normalizedSearch)) {
      return false;
    }
    return true;
  });

  const filteredAlbums =
    selectedBand && normalizedSearch
      ? selectedBand.albums.filter(
          (album) =>
            matchesQuery(album.title, normalizedSearch) ||
            matchesQuery(String(album.year), normalizedSearch),
        )
      : selectedBand?.albums ?? [];

  const handleBandClick = (band: Band) => {
    setSelectedBand(band);
    setCurrentView("albums");
  };

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
    setCurrentView("detail");
  };

  const handleBackToBands = () => {
    setSelectedBand(null);
    setSelectedAlbum(null);
    setCurrentView("bands");
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setCurrentView("albums");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* App Title */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto flex items-center gap-3 px-4 py-6">
          <Disc className="h-8 w-8 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">The Record Vault</h1>
        </div>
      </div>

      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToBands}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
          </Button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search your collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              aria-label="Search your collection"
            />
          </div>

          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add New</span>
          </Button>
        </div>
      </nav>

      <AddAlbumDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={refreshCollection}
      />

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <>
        {currentView === "bands" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-foreground">Your Collection</h2>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by format"
            >
              {FORMAT_FILTERS.map((format) => (
                <Button
                  key={format}
                  type="button"
                  variant={formatFilter === format ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setFormatFilter(format)}
                  className={cn(
                    "border-border",
                    formatFilter === format &&
                      "bg-secondary text-foreground shadow-sm ring-1 ring-border",
                  )}
                  aria-pressed={formatFilter === format}
                >
                  {format}
                </Button>
              ))}
            </div>
            {filteredBands.length === 0 ? (
              <p className="text-muted-foreground">
                {normalizedSearch || formatFilter !== "All"
                  ? "No bands match your search and filters."
                  : "No bands in your collection yet."}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredBands.map((band) => (
                  <BandCard
                    key={band.id}
                    band={band}
                    onClick={() => handleBandClick(band)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === "albums" && selectedBand && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBackToBands}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h2 className="text-xl font-semibold text-foreground">
                {selectedBand.name}
              </h2>
            </div>
            {filteredAlbums.length === 0 ? (
              <p className="text-muted-foreground">
                No albums match &ldquo;{searchQuery.trim()}&rdquo;
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAlbums.map((album) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => handleAlbumClick(album)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === "detail" && selectedAlbum && selectedBand && (
          <AlbumDetail
            album={selectedAlbum}
            artistName={selectedBand.name}
            onBack={handleBackToAlbums}
          />
        )}
          </>
        )}
      </main>
    </div>
  );
}
