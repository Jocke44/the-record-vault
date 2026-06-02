"use client";

import { useState } from "react";
import { ArrowLeft, Disc, Home, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BandCard } from "@/components/band-card";
import { AlbumCard } from "@/components/album-card";
import { AlbumDetail } from "@/components/album-detail";
import { musicCollection, type Band, type Album } from "@/lib/music-data";

type View = "bands" | "albums" | "detail";

export function RecordVault() {
  const [currentView, setCurrentView] = useState<View>("bands");
  const [selectedBand, setSelectedBand] = useState<Band | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

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
              className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              disabled
            />
          </div>

          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add New</span>
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {currentView === "bands" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-foreground">Your Collection</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...musicCollection].sort((a, b) => a.name.localeCompare(b.name)).map((band) => (
                <BandCard
                  key={band.id}
                  band={band}
                  onClick={() => handleBandClick(band)}
                />
              ))}
            </div>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {selectedBand.albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => handleAlbumClick(album)}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === "detail" && selectedAlbum && selectedBand && (
          <AlbumDetail
            album={selectedAlbum}
            artistName={selectedBand.name}
            onBack={handleBackToAlbums}
          />
        )}
      </main>
    </div>
  );
}
