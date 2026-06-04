import type { AlbumFormat } from "@/lib/music-data";
import { supabase } from "@/lib/supabase";

export interface AddAlbumInput {
  bandName: string;
  albumTitle: string;
  year: number;
  format: AlbumFormat;
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

  const { error: insertAlbumError } = await supabase.from("albums").insert({
    title: albumTitle,
    year: input.year,
    format: input.format,
    band_id: bandId,
  });

  if (insertAlbumError) throw insertAlbumError;
}
