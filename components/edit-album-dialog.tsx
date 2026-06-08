"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
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
import { createClient } from "@/src/utils/supabase/client";
import type { Album, AlbumFormat } from "@/lib/music-data";
import { cn } from "@/lib/utils";

// ── Constants ────────────────────────────────────────────────────────────────

const FORMAT_OPTIONS: AlbumFormat[] = ["Vinyl", "CD", "EP"];

const fieldClassName =
  "bg-secondary border-border text-foreground placeholder:text-muted-foreground";

// ── Track row ────────────────────────────────────────────────────────────────

interface EditTrackRow {
  localId: number;
  dbId?: number;
  title: string;
  deleted: boolean;
}

let nextLocalId = 1;
function makeLocalId(): number {
  return nextLocalId++;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface EditAlbumDialogProps {
  album: Album;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export function EditAlbumDialog({
  album,
  open,
  onClose,
  onSaved,
}: EditAlbumDialogProps) {
  const [title, setTitle] = useState(album.title);
  const [year, setYear] = useState(String(album.year));
  const [format, setFormat] = useState<AlbumFormat>(album.format);

  const [coverPreview, setCoverPreview] = useState<string | null>(
    album.coverImage ?? null,
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [tracks, setTracks] = useState<EditTrackRow[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Initialise state whenever the dialog opens or album changes ──

  useEffect(() => {
    if (!open) return;

    setTitle(album.title);
    setYear(String(album.year));
    setFormat(album.format);
    setCoverPreview(album.coverImage ?? null);
    setCoverFile(null);
    setError(null);

    let cancelled = false;
    setTracksLoading(true);

    createClient()
      .from("tracks")
      .select("id, title, track_number")
      .eq("album_id", Number(album.id))
      .order("track_number", { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          console.error("Failed to fetch tracks:", fetchError);
          setTracks([]);
        } else {
          setTracks(
            (data ?? []).map((row) => ({
              localId: makeLocalId(),
              dbId: row.id,
              title: row.title ?? "",
              deleted: false,
            })),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setTracksLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, album.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cover image handlers ──

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (coverFile && coverPreview && coverPreview !== album.coverImage) {
      URL.revokeObjectURL(coverPreview);
    }
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverFile(null);
      setCoverPreview(album.coverImage ?? null);
    }
  };

  const removeCover = () => {
    if (coverFile && coverPreview && coverPreview !== album.coverImage) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverFile(null);
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  // ── Track handlers ──

  const addTrack = () => {
    setTracks((prev) => [
      ...prev,
      { localId: makeLocalId(), title: "", deleted: false },
    ]);
  };

  const removeTrack = (localId: number) => {
    setTracks((prev) =>
      prev.map((t) => (t.localId === localId ? { ...t, deleted: true } : t)),
    );
  };

  const updateTrack = (localId: number, value: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.localId === localId ? { ...t, title: value } : t)),
    );
  };

  // ── Save ──

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const parsedYear = Number(year);

    if (!trimmedTitle || !year.trim()) {
      setError("Title and year are required.");
      return;
    }
    if (!Number.isInteger(parsedYear) || parsedYear < 0) {
      setError("Please enter a valid year.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload new cover image if provided
      let coverUrl: string | null = album.coverImage ?? null;
      if (coverFile) {
        const filePath = `${user.id}/${Date.now()}-${coverFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("covers")
          .upload(filePath, coverFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("covers")
            .getPublicUrl(filePath);
          coverUrl = urlData.publicUrl;
        }
      } else if (coverPreview === null) {
        coverUrl = null;
      }

      // Update album row
      const { error: albumError } = await supabase
        .from("albums")
        .update({
          title: trimmedTitle,
          year: parsedYear,
          format,
          cover_image: coverUrl,
        })
        .eq("id", Number(album.id));
      if (albumError) throw albumError;

      const albumIdNum = Number(album.id);
      const visibleTracks = tracks.filter((t) => !t.deleted);

      // Delete removed tracks
      const toDelete = tracks.filter((t) => t.deleted && t.dbId !== undefined);
      for (const t of toDelete) {
        const { error: delError } = await supabase
          .from("tracks")
          .delete()
          .eq("id", t.dbId!);
        if (delError) throw delError;
      }

      // Update existing tracks and insert new ones
      for (let i = 0; i < visibleTracks.length; i++) {
        const t = visibleTracks[i];
        const base = {
          title: t.title.trim() || "(untitled)",
          track_number: i + 1,
        };

        if (t.dbId !== undefined) {
          const { error: updateError } = await supabase
            .from("tracks")
            .update(base)
            .eq("id", t.dbId);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from("tracks")
            .insert({ ...base, album_id: albumIdNum, user_id: user.id });
          if (insertError) throw insertError;
        }
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to save album:", err);
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──

  const visibleTracks = tracks.filter((t) => !t.deleted);
  const isDisabled = saving || tracksLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !saving) onClose();
      }}
    >
      <DialogContent
        className={cn(
          "border-border bg-card text-foreground sm:max-w-md",
          "flex max-h-[90vh] flex-col gap-0 p-0",
        )}
      >
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle className="text-foreground">Edit album</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-6 py-6">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Album title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClassName}
              placeholder="Album title"
              disabled={isDisabled}
              autoFocus
            />
          </div>

          {/* Year + Format */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Year</Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={fieldClassName}
                placeholder="e.g. 1991"
                disabled={isDisabled}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Format</Label>
              <Select
                value={format}
                onValueChange={(v) => setFormat(v as AlbumFormat)}
                disabled={isDisabled}
              >
                <SelectTrigger className={cn("w-full", fieldClassName)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {FORMAT_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cover image */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">
              Cover image
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                optional
              </span>
            </span>

            {coverPreview ? (
              <div className="flex flex-col gap-1.5">
                <div className="h-20 w-20 overflow-hidden rounded-md border border-border">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-1">
                  {coverFile && (
                    <p className="max-w-[100px] truncate text-[10px] text-muted-foreground">
                      {coverFile.name}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={removeCover}
                    disabled={isDisabled}
                    className="ml-auto flex shrink-0 items-center gap-0.5 text-[10px] text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                  >
                    <X className="h-2.5 w-2.5" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isDisabled}
                className={cn(
                  "flex h-20 w-20 flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border",
                  "text-muted-foreground transition-colors hover:border-cyan-400/60 hover:text-cyan-400",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px]">Add image</span>
              </button>
            )}

            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleCoverChange}
              disabled={isDisabled}
            />
          </div>

          <div className="border-t border-border" />

          {/* Tracklist */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-foreground">Tracks</span>

            {tracksLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                Loading tracks…
              </div>
            ) : (
              <>
                <ol className="flex flex-col gap-1.5">
                  {visibleTracks.map((track, index) => (
                    <li key={track.localId} className="flex items-center gap-2">
                      <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                        {index + 1}
                      </span>
                      <Input
                        value={track.title}
                        onChange={(e) =>
                          updateTrack(track.localId, e.target.value)
                        }
                        className={cn(fieldClassName, "h-8 text-sm")}
                        placeholder="Track title"
                        disabled={saving}
                        aria-label={`Track ${index + 1} title`}
                      />
                      <button
                        type="button"
                        onClick={() => removeTrack(track.localId)}
                        disabled={saving}
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
                  disabled={saving}
                  className="w-fit gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add track
                </Button>
              </>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isDisabled || !title.trim()}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
