import type { AlbumFormat } from "@/lib/music-data";
import { supabase } from "@/lib/supabase";

export interface TrackInput {
  title: string;
}

export interface AddAlbumInput {
  bandName: string;
  albumTitle: string;
  year: number;
  format: AlbumFormat;
  tracks: TrackInput[];
}

export async function addAlbum(input: AddAlbumInput): Promise<void> {
  const bandName = input.bandName.trim();
  const albumTitle = input.albumTitle.trim();

  const { data: existingBands, error: findError } = await supabase
    .from("bands")
    .select("id, name")
    .ilike("name", bandName);

  if (findError) throw findError;

  const existingBand = (existingBands ?? []).find(
    (band) => band.name.toLowerCase() === bandName.toLowerCase(),
  );

  let bandId: number;

  if (existingBand) {
    bandId = existingBand.id;
  } else {
    const { data: newBand, error: insertBandError } = await supabase
      .from("bands")
      .insert({ name: bandName })
      .select("id")
      .single();

    if (insertBandError) throw insertBandError;
    bandId = newBand.id;
  }

  const { data: newAlbum, error: insertAlbumError } = await supabase
    .from("albums")
    .insert({
      title: albumTitle,
      year: input.year,
      format: input.format,
      band_id: bandId,
    })
    .select("id")
    .single();

  if (insertAlbumError) throw insertAlbumError;

  const tracksToInsert = input.tracks
    .map((t) => t.title.trim())
    .filter((title) => title.length > 0)
    .map((title, index) => ({
      title,
      track_number: index + 1,
      album_id: newAlbum.id,
    }));

  if (tracksToInsert.length > 0) {
    const { error: insertTracksError } = await supabase
      .from("tracks")
      .insert(tracksToInsert);

    if (insertTracksError) throw insertTracksError;
  }
}
