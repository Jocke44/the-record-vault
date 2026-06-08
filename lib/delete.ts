import { createClient } from "@/src/utils/supabase/client";

export async function deleteAlbum(albumId: string): Promise<void> {
  const supabase = createClient();
  const id = Number(albumId);

  const { error: tracksError } = await supabase
    .from("tracks")
    .delete()
    .eq("album_id", id);
  if (tracksError) throw tracksError;

  const { error: albumError } = await supabase
    .from("albums")
    .delete()
    .eq("id", id);
  if (albumError) throw albumError;
}

export async function deleteBand(bandId: string): Promise<void> {
  const supabase = createClient();
  const id = Number(bandId);

  const { data: albums, error: fetchError } = await supabase
    .from("albums")
    .select("id")
    .eq("band_id", id);
  if (fetchError) throw fetchError;

  const albumIds = (albums ?? []).map((a) => a.id);

  if (albumIds.length > 0) {
    const { error: tracksError } = await supabase
      .from("tracks")
      .delete()
      .in("album_id", albumIds);
    if (tracksError) throw tracksError;

    const { error: albumsError } = await supabase
      .from("albums")
      .delete()
      .eq("band_id", id);
    if (albumsError) throw albumsError;
  }

  const { error: bandError } = await supabase
    .from("bands")
    .delete()
    .eq("id", id);
  if (bandError) throw bandError;
}
