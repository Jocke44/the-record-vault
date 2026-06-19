import type { Album, AlbumFormat, Band, Track } from "@/lib/music-data";
import { createClient } from "@/src/utils/supabase/client";

export async function fetchTracksForAlbum(albumId: number): Promise<Track[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tracks")
    .select("id, title, track_number")
    .eq("album_id", albumId)
    .order("track_number", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    number: row.track_number,
    title: row.title,
  }));
}

export async function fetchMusicCollection(): Promise<Band[]> {
  const supabase = createClient();

  const [bandsResult, albumsResult] = await Promise.all([
    supabase.from("bands").select("id, name, cover_image"),
    supabase.from("albums").select("id, title, year, format, band_id, cover_image").order("year", { ascending: true }),
  ]);

  if (bandsResult.error) throw bandsResult.error;
  if (albumsResult.error) throw albumsResult.error;

  const albumsByBandId = new Map<number, Album[]>();
  for (const row of albumsResult.data ?? []) {
    const album: Album = {
      id: String(row.id),
      title: row.title,
      year: row.year,
      format: row.format as AlbumFormat,
      tracks: [],
      coverImage: row.cover_image ?? undefined,
    };
    const bandAlbums = albumsByBandId.get(row.band_id) ?? [];
    bandAlbums.push(album);
    albumsByBandId.set(row.band_id, bandAlbums);
  }

  return (bandsResult.data ?? []).map((row) => ({
    id: String(row.id),
    name: row.name,
    albums: albumsByBandId.get(row.id) ?? [],
    coverImage: row.cover_image ?? undefined,
  }));
}
