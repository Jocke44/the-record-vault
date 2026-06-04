"use client";

import { useState } from "react";
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
  const [bandName, setBandName] = useState("");
  const [albumTitle, setAlbumTitle] = useState("");
  const [year, setYear] = useState("");
  const [format, setFormat] = useState<AlbumFormat>("Vinyl");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setBandName("");
    setAlbumTitle("");
    setYear("");
    setFormat("Vinyl");
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

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
          "gap-0 p-0",
        )}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle className="text-foreground">Add to collection</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-6 py-6">
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

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className="border-border"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Add album"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
