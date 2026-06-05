"use client";

import { useId, useState } from "react";
import { Search, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addAlbum } from "@/lib/add-album";
import type { AlbumFormat } from "@/lib/music-data";
import { cn } from "@/lib/utils";

const FORMAT_OPTIONS: AlbumFormat[] = ["Vinyl", "CD", "EP"];

const fieldClassName =
  "bg-secondary border-border text-foreground placeholder:text-muted-foreground";

// ── Discogs types ────────────────────────────────────────────────────────────

interface DiscogsSearchResult {
  id: number;
  title: string;
  year?: string;
  format?: string[];
  thumb?: string;
  cover_image?: string;
  country?: string;
}

interface DiscogsRelease {
  title: string;
  year: number;
  artists?: { name: string; thumbnail_url?: string }[];
  formats?: { name: string }[];
  images?: { uri: string; type: string }[];
  tracklist?: { position: string; title: string; duration: string }[];
}

// ── Manual-form track helper ─────────────────────────────────────────────────

interface TrackRow {
  id: number;
  title: string;
}

let nextTrackId = 1;
function makeTrack(): TrackRow {
  return { id: nextTrackId++, title: "" };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripArtistSuffix(name: string): string {
  return name.replace(/\s*\(\d+\)\s*$/, "").trim();
}

function mapDiscogsFormat(name: string): AlbumFormat {
  const lower = name.toLowerCase();
  if (lower.includes("cd")) return "CD";
  if (lower.includes("ep")) return "EP";
  return "Vinyl";
}

// ── Props ────────────────────────────────────────────────────────────────────

interface AddAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
}

// ── Component ────────────────────────────────────────────────────────────────

export function AddAlbumDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddAlbumDialogProps) {
  const formId = useId();

  // Mode
  const [mode, setMode] = useState<"search" | "manual">("search");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DiscogsSearchResult[]>([]);
  const [searchPhase, setSearchPhase] = useState<
    "idle" | "searching" | "results" | "loading-detail"
  >("idle");
  const [searchError, setSearchError] = useState<string | null>(null);

  // Manual form state
  const [bandName, setBandName] = useState("");
  const [albumTitle, setAlbumTitle] = useState("");
  const [year, setYear] = useState("");
  const [format, setFormat] = useState<AlbumFormat>("Vinyl");
  const [tracks, setTracks] = useState<TrackRow[]>(() => [makeTrack()]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Reset ──

  const resetAll = () => {
    setMode("search");
    setSearchQuery("");
    setSearchResults([]);
    setSearchPhase("idle");
    setSearchError(null);
    setBandName("");
    setAlbumTitle("");
    setYear("");
    setFormat("Vinyl");
    setTracks([makeTrack()]);
    setSubmitting(false);
    setFormError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetAll();
    onOpenChange(nextOpen);
  };

  // ── Discogs search ──

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearchError(null);
    setSearchResults([]);
    setSearchPhase("searching");
    try {
      const res = await fetch(
        `/api/discogs/search?q=${encodeURIComponent(q)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error ?? "Search failed.");
        setSearchPhase("idle");
        return;
      }
      setSearchResults(data.results ?? []);
      setSearchPhase("results");
    } catch {
      setSearchError("Network error. Please try again.");
      setSearchPhase("idle");
    }
  };

  const handleSelectResult = async (result: DiscogsSearchResult) => {
    setSearchPhase("loading-detail");
    setSearchError(null);
    try {
      const res = await fetch(`/api/discogs/release?id=${result.id}`);
      const data: DiscogsRelease & { error?: string } = await res.json();
      if (!res.ok || data.error) {
        setSearchError(data.error ?? "Failed to load release details.");
        setSearchPhase("results");
        return;
      }

      const artistName = data.artists?.[0]
        ? stripArtistSuffix(data.artists[0].name)
        : (result.title.split(" - ")[0]?.trim() ?? "Unknown Artist");

      const releaseFormat = mapDiscogsFormat(data.formats?.[0]?.name ?? "");
      const coverImage =
        data.images?.find((img) => img.type === "primary")?.uri ??
        data.images?.[0]?.uri ??
        result.thumb ??
        "";

      const tracklist = (data.tracklist ?? []).map((t) => ({ title: t.title }));

      const bandCoverImage = data.artists?.[0]?.thumbnail_url || undefined;

      const albumPayload = {
        bandName: artistName,
        albumTitle: data.title,
        year: data.year,
        format: releaseFormat,
        tracks: tracklist,
        coverImage: coverImage || undefined,
        bandCoverImage,
      };
      console.log("[Discogs] Saving album:", {
        bandName: albumPayload.bandName,
        albumTitle: albumPayload.albumTitle,
        year: albumPayload.year,
        format: albumPayload.format,
        trackCount: albumPayload.tracks.length,
      });

      await addAlbum(albumPayload);

      resetAll();
      onOpenChange(false);
      await onSuccess();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null
            ? JSON.stringify(err)
            : String(err);
      console.error("[Discogs] Failed to add album:", message);
      setSearchError("Could not save. Please try again.");
      setSearchPhase("results");
    }
  };

  // ── Manual form ──

  const addTrack = () => setTracks((prev) => [...prev, makeTrack()]);
  const removeTrack = (id: number) =>
    setTracks((prev) => prev.filter((t) => t.id !== id));
  const updateTrack = (id: number, title: string) =>
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));

  const handleManualSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const trimmedBand = bandName.trim();
    const trimmedTitle = albumTitle.trim();
    const parsedYear = Number(year);

    if (!trimmedBand || !trimmedTitle || !year.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }
    if (!Number.isInteger(parsedYear) || parsedYear < 0) {
      setFormError("Please enter a valid year.");
      return;
    }

    setSubmitting(true);
    try {
      await addAlbum({
        bandName: trimmedBand,
        albumTitle: trimmedTitle,
        year: parsedYear,
        format,
        tracks: tracks.map((t) => ({ title: t.title })),
      });
      resetAll();
      onOpenChange(false);
      await onSuccess();
    } catch (err) {
      console.error("Failed to add album:", err);
      setFormError("Could not save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled =
    searchPhase === "searching" ||
    searchPhase === "loading-detail" ||
    submitting;

  // ── Render ──

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "border-border bg-card text-foreground sm:max-w-md",
          "flex max-h-[90vh] flex-col gap-0 p-0",
        )}
      >
        {/* Header */}
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle className="text-foreground">
            Add to collection
          </DialogTitle>
          <div className="mt-1.5 flex items-center gap-1.5 text-sm">
            <button
              type="button"
              onClick={() => setMode("search")}
              className={cn(
                "transition-colors",
                mode === "search"
                  ? "font-medium text-cyan-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Search Discogs
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={cn(
                "transition-colors",
                mode === "manual"
                  ? "font-medium text-cyan-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Add Manually
            </button>
          </div>
        </DialogHeader>

        {/* ── Search mode ── */}
        {mode === "search" && (
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-6 py-6">
            {/* Search input row */}
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className={fieldClassName}
                placeholder="Search for an album or artist…"
                disabled={isDisabled}
                autoFocus
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isDisabled || !searchQuery.trim()}
                className="shrink-0 gap-1.5"
              >
                {searchPhase === "searching" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {searchPhase === "searching" ? "Searching…" : "Search"}
              </Button>
            </div>

            {/* Loading detail indicator */}
            {searchPhase === "loading-detail" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                Loading details…
              </div>
            )}

            {/* Error */}
            {searchError && (
              <p className="text-sm text-destructive" role="alert">
                {searchError}
              </p>
            )}

            {/* No results */}
            {searchPhase === "results" && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground">No results found.</p>
            )}

            {/* Results list */}
            {(searchPhase === "results" ||
              searchPhase === "loading-detail") &&
              searchResults.length > 0 && (
                <div
                  className="flex flex-col gap-0.5 overflow-y-auto rounded-md"
                  style={{ maxHeight: "380px" }}
                >
                  {searchResults.map((result) => {
                    const separatorIdx = result.title.indexOf(" - ");
                    const artist =
                      separatorIdx !== -1
                        ? result.title.slice(0, separatorIdx)
                        : result.title;
                    const title =
                      separatorIdx !== -1
                        ? result.title.slice(separatorIdx + 3)
                        : "";

                    return (
                      <button
                        key={result.id}
                        type="button"
                        disabled={searchPhase === "loading-detail"}
                        onClick={() => handleSelectResult(result)}
                        className={cn(
                          "flex items-center gap-3 rounded-md p-2 text-left transition-colors",
                          "hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                        )}
                      >
                        {/* Thumbnail — use || (not ??) so empty strings are treated as missing */}
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-secondary">
                          {result.thumb || result.cover_image ? (
                            <img
                              src={result.thumb || result.cover_image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-secondary" />
                          )}
                        </div>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {artist}
                          </p>
                          {title && (
                            <p className="truncate text-sm text-muted-foreground">
                              {title}
                            </p>
                          )}
                          <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                            {result.year && <span>{result.year}</span>}
                            {result.format && result.format.length > 0 && (
                              <span>{result.format.slice(0, 2).join(", ")}</span>
                            )}
                            {result.country && <span>{result.country}</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* ── Manual mode ── */}
        {mode === "manual" && (
          <form
            id={formId}
            onSubmit={handleManualSubmit}
            className="flex min-h-0 flex-col"
          >
            <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-6 py-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="band-name" className="text-foreground">
                    Band name
                  </Label>
                  <Input
                    id="band-name"
                    value={bandName}
                    onChange={(e) => setBandName(e.target.value)}
                    className={fieldClassName}
                    placeholder="e.g. Pearl Jam"
                    disabled={submitting}
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="album-title" className="text-foreground">
                    Album title
                  </Label>
                  <Input
                    id="album-title"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    className={fieldClassName}
                    placeholder="e.g. Ten"
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="year" className="text-foreground">
                      Year
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      min={0}
                      step={1}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className={fieldClassName}
                      placeholder="e.g. 1991"
                      disabled={submitting}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="format" className="text-foreground">
                      Format
                    </Label>
                    <Select
                      value={format}
                      onValueChange={(value) => setFormat(value as AlbumFormat)}
                      disabled={submitting}
                    >
                      <SelectTrigger
                        id="format"
                        className={cn("w-full", fieldClassName)}
                      >
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card text-foreground">
                        {FORMAT_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Tracks */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-foreground">
                  Tracks
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    optional
                  </span>
                </span>

                <ol className="flex flex-col gap-1.5">
                  {tracks.map((track, index) => (
                    <li key={track.id} className="flex items-center gap-2">
                      <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                        {index + 1}
                      </span>
                      <Input
                        value={track.title}
                        onChange={(e) => updateTrack(track.id, e.target.value)}
                        className={cn(fieldClassName, "h-8 text-sm")}
                        placeholder="Track title"
                        disabled={submitting}
                        aria-label={`Track ${index + 1} title`}
                      />
                      <button
                        type="button"
                        onClick={() => removeTrack(track.id)}
                        disabled={submitting}
                        aria-label={`Remove track ${index + 1}`}
                        className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ol>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addTrack}
                  disabled={submitting}
                  className="w-fit gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add track
                </Button>
              </div>

              {formError && (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              )}
            </div>

            <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
                className="border-border"
              >
                Cancel
              </Button>
              <Button type="submit" form={formId} disabled={submitting}>
                {submitting ? "Saving…" : "Add album"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
