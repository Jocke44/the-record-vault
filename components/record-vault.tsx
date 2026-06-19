"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Disc, Home, Menu, Plus, Search } from "lucide-react";
import { createClient } from "@/src/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BandCard } from "@/components/band-card";
import { AlbumCard } from "@/components/album-card";
import { AddAlbumDialog } from "@/components/add-album-dialog";
import { EditAlbumDialog } from "@/components/edit-album-dialog";
import { AlbumDetail } from "@/components/album-detail";
import { fetchMusicCollection, fetchTracksForAlbum } from "@/lib/fetch-music-collection";
import { deleteAlbum, deleteBand } from "@/lib/delete";
import type { Band, Album, AlbumFormat, Track } from "@/lib/music-data";
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

function bandSectionId(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function RecordVault() {
  const router = useRouter();
  const [musicCollection, setMusicCollection] = useState<Band[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>("bands");
  const [selectedBand, setSelectedBand] = useState<Band | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("All");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [pendingDeleteBand, setPendingDeleteBand] = useState<Band | null>(null);
  const [pendingDeleteAlbum, setPendingDeleteAlbum] = useState<Album | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingEditBand, setPendingEditBand] = useState<Band | null>(null);
  const [editBandName, setEditBandName] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingEditAlbum, setPendingEditAlbum] = useState<Album | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [albumTracks, setAlbumTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  // Keeps the last album alive during the dialog's exit animation
  const lastEditAlbumRef = useRef<Album | null>(null);
  if (pendingEditAlbum) lastEditAlbumRef.current = pendingEditAlbum;

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

  const sortKey = (name: string) => name.replace(/^The\s+/i, "").trim();
  const sortedBands = [...musicCollection].sort((a, b) =>
    sortKey(a.name).localeCompare(sortKey(b.name), "sv"),
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

  const handleAlbumClick = async (album: Album) => {
    setSelectedAlbum(album);
    setAlbumTracks([]);
    setTracksLoading(true);
    setCurrentView("detail");
    try {
      const tracks = await fetchTracksForAlbum(Number(album.id));
      setAlbumTracks(tracks);
    } finally {
      setTracksLoading(false);
    }
  };

  const handleBackToBands = () => {
    setSelectedBand(null);
    setSelectedAlbum(null);
    setAlbumTracks([]);
    setTracksLoading(false);
    setCurrentView("bands");
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setAlbumTracks([]);
    setTracksLoading(false);
    setCurrentView("albums");
  };

  const scrollToBand = (bandName: string) => {
    document
      .getElementById(bandSectionId(bandName))
      ?.scrollIntoView({ behavior: "smooth" });
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleSaveEditBand = async () => {
    if (!pendingEditBand) return;
    const trimmed = editBandName.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("bands")
        .update({ name: trimmed })
        .eq("id", Number(pendingEditBand.id));
      if (error) throw error;
      setPendingEditBand(null);
      await refreshCollection();
    } catch (err) {
      console.error("Failed to update band:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeleteBand = async () => {
    if (!pendingDeleteBand) return;
    setDeleting(true);
    try {
      await deleteBand(pendingDeleteBand.id);
      if (selectedBand?.id === pendingDeleteBand.id) handleBackToBands();
      setPendingDeleteBand(null);
      await refreshCollection();
    } catch (err) {
      console.error("Failed to delete band:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmDeleteAlbum = async () => {
    if (!pendingDeleteAlbum) return;
    setDeleting(true);
    try {
      await deleteAlbum(pendingDeleteAlbum.id);
      if (selectedAlbum?.id === pendingDeleteAlbum.id) handleBackToAlbums();
      setPendingDeleteAlbum(null);
      await refreshCollection();
    } catch (err) {
      console.error("Failed to delete album:", err);
    } finally {
      setDeleting(false);
    }
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

          <button
            type="button"
            onClick={handleSignOut}
            className="ml-auto text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <AddAlbumDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={refreshCollection}
      />

      {/* ── Edit band dialog ── */}
      <Dialog
        open={!!pendingEditBand}
        onOpenChange={(open) => { if (!open && !saving) setPendingEditBand(null); }}
      >
        <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit band name</DialogTitle>
          </DialogHeader>
          <Input
            value={editBandName}
            onChange={(e) => setEditBandName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveEditBand(); }}
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            placeholder="Band name"
            disabled={saving}
            autoFocus
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingEditBand(null)}
              disabled={saving}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEditBand}
              disabled={saving || !editBandName.trim()}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit album dialog ── */}
      {lastEditAlbumRef.current && (
        <EditAlbumDialog
          album={lastEditAlbumRef.current}
          open={!!pendingEditAlbum}
          onClose={() => setPendingEditAlbum(null)}
          onSaved={refreshCollection}
        />
      )}

      {/* ── Delete band confirmation ── */}
      <AlertDialog
        open={!!pendingDeleteBand}
        onOpenChange={(open) => { if (!open && !deleting) setPendingDeleteBand(null); }}
      >
        <AlertDialogContent className="border-border bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDeleteBand?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all albums and tracks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              className="border-border"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => { e.preventDefault(); handleConfirmDeleteBand(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete album confirmation ── */}
      <AlertDialog
        open={!!pendingDeleteAlbum}
        onOpenChange={(open) => { if (!open && !deleting) setPendingDeleteAlbum(null); }}
      >
        <AlertDialogContent className="border-border bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDeleteAlbum?.title}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all tracks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              className="border-border"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => { e.preventDefault(); handleConfirmDeleteAlbum(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen((open) => !open)}
        className="fixed left-4 top-24 z-40 text-muted-foreground hover:text-foreground lg:hidden"
        aria-label={sidebarOpen ? "Close band list" : "Open band list"}
        aria-expanded={sidebarOpen}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-background/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close band list"
        />
      )}

      <div className="flex w-full">
          <aside
            className={cn(
              "flex w-[200px] shrink-0 flex-col items-start gap-1 border-r border-border pl-4 pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
              "lg:sticky lg:top-14 lg:max-h-[calc(100vh-3.5rem)] lg:self-start lg:overflow-y-auto",
              sidebarOpen
                ? "fixed left-0 top-0 z-40 h-full overflow-y-auto bg-background px-4 py-8 pt-24 lg:static lg:h-auto lg:p-0 lg:pt-0"
                : "hidden lg:flex",
            )}
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Bands
            </p>
            {sortedBands.map((band) => (
              <button
                key={band.id}
                type="button"
                onClick={() => scrollToBand(band.name)}
                className="w-full rounded px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {band.name}
              </button>
            ))}
          </aside>

      <main className="container mx-auto min-w-0 flex-1 px-4 py-8">
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
              <div className="flex flex-col gap-8">
                {filteredBands
                  .reduce<{ letter: string; bands: Band[] }[]>((acc, band) => {
                    const letter = sortKey(band.name).charAt(0).toUpperCase();
                    const last = acc[acc.length - 1];
                    if (last && last.letter === letter) {
                      last.bands.push(band);
                    } else {
                      acc.push({ letter, bands: [band] });
                    }
                    return acc;
                  }, [])
                  .map(({ letter, bands }) => (
                    <div key={letter} className="flex flex-col gap-3">
                      <div>
                        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                          {letter}
                        </span>
                        <div className="mt-1 h-px bg-border" />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {bands.map((band) => (
                          <div key={band.id} className="scroll-mt-20">
                            <h3
                              id={bandSectionId(band.name)}
                              className="sr-only"
                            >
                              {band.name}
                            </h3>
                            <BandCard
                              band={band}
                              onClick={() => handleBandClick(band)}
                              onEdit={() => { setPendingEditBand(band); setEditBandName(band.name); }}
                              onDelete={() => setPendingDeleteBand(band)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
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
                    onEdit={() => setPendingEditAlbum(album)}
                    onDelete={() => setPendingDeleteAlbum(album)}
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
            tracks={albumTracks}
            tracksLoading={tracksLoading}
          />
        )}
          </>
        )}
      </main>
      </div>
    </div>
  );
}
