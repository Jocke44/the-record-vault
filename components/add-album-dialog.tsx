"use client";

import { useId, useState } from "react";
import { Plus, X } from "lucide-react";
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

interface TrackRow {
  id: number;
  title: string;
}

let nextTrackId = 1;
function makeTrack(): TrackRow {
  return { id: nextTrackId++, title: "" };
}

interface AddAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
}

export function AddAlbumDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddAlbumDialogProps) {
  const formId = useId();
  const [bandName, setBandName] = useState("");
  const [albumTitle, setAlbumTitle] = useState("");
  const [year, setYear] = useState("");
  const [format, setFormat] = useState<AlbumFormat>("Vinyl");
  const [tracks, setTracks] = useState<TrackRow[]>(() => [makeTrack()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setBandName("");
    setAlbumTitle("");
    setYear("");
    setFormat("Vinyl");
    setTracks([makeTrack()]);
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const addTrack = () => setTracks((prev) => [...prev, makeTrack()]);

  const removeTrack = (id: number) =>
    setTracks((prev) => prev.filter((t) => t.id !== id));

  const updateTrack = (id: number, title: string) =>
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedBand = bandName.trim();
    const trimmedTitle = albumTitle.trim();
    const parsedYear = Number(year);

    if (!trimmedBand || !trimmedTitle || !year.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (!Number.isInteger(parsedYear) || parsedYear < 0) {
      setError("Please enter a valid year.");
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
      resetForm();
      onOpenChange(false);
      await onSuccess();
    } catch (err) {
      console.error("Failed to add album:", err);
      setError("Could not save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "border-border bg-card text-foreground sm:max-w-md",
          "flex max-h-[90vh] flex-col gap-0 p-0",
        )}
      >
        <form
          id={formId}
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-col"
        >
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle className="text-foreground">
              Add to collection
            </DialogTitle>
          </DialogHeader>

          <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-6 py-6">
            {/* Album fields */}
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

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Tracks section */}
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
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className="border-border"
            >
              Cancel
            </Button>
            <Button type="submit" form={formId} disabled={submitting}>
              {submitting ? "Saving..." : "Add album"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
