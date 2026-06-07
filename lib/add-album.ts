import type { AlbumFormat } from "@/lib/music-data";
import { createClient } from "@/src/utils/supabase/client";

export interface TrackInput {
  title: string;
}

export interface AddAlbumInput {
  bandName: string;
  albumTitle: string;
  year: number;
  format: AlbumFormat;
  tracks: TrackInput[];
  coverImage?: string;
  coverImageFile?: File;
  bandCoverImage?: string;
  bandCoverImageFile?: File;
  discogsReleaseId?: number;
}

export async function addAlbum(
  input: AddAlbumInput,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "unknown" };

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
    let resolvedBandCoverImage = input.bandCoverImage;

    if (input.bandCoverImageFile) {
      const file = input.bandCoverImageFile;
      const filePath = `${user.id}/bands/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(filePath, file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("covers")
          .getPublicUrl(filePath);
        resolvedBandCoverImage = urlData.publicUrl;
      }
    }

    const { data: newBand, error: insertBandError } = await supabase
      .from("bands")
      .insert({
        name: bandName,
        user_id: user.id,
        ...(resolvedBandCoverImage ? { cover_image: resolvedBandCoverImage } : {}),
      })
      .select("id")
      .single();

    if (insertBandError) throw insertBandError;
    bandId = newBand.id;
  }

  let resolvedCoverImage = input.coverImage;

  if (input.coverImageFile) {
    const file = input.coverImageFile;
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("covers")
      .upload(filePath, file);

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("covers")
        .getPublicUrl(filePath);
      resolvedCoverImage = urlData.publicUrl;
    }
  }

  const { data: newAlbum, error: insertAlbumError } = await supabase
    .from("albums")
    .insert({
      title: albumTitle,
      year: input.year,
      format: input.format,
      band_id: bandId,
      user_id: user.id,
      ...(resolvedCoverImage ? { cover_image: resolvedCoverImage } : {}),
      ...(input.discogsReleaseId !== undefined ? { discogs_release_id: input.discogsReleaseId } : {}),
    })
    .select("id")
    .single();

  if (insertAlbumError) {
    if (insertAlbumError.code === "23505") {
      return { success: false, error: "duplicate" };
    }
    return { success: false, error: "unknown" };
  }

  const tracksToInsert = input.tracks
    .map((t) => t.title.trim())
    .filter((title) => title.length > 0)
    .map((title, index) => ({
      title,
      track_number: index + 1,
      album_id: newAlbum.id,
      user_id: user.id,
    }));

  if (tracksToInsert.length > 0) {
    const { error: insertTracksError } = await supabase
      .from("tracks")
      .insert(tracksToInsert);

    if (insertTracksError) throw insertTracksError;
  }

  return { success: true };
}
