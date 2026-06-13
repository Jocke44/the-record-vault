import type { Album, AlbumFormat, Band, Track } from "@/lib/music-data";
import { createClient } from "@/src/utils/supabase/client";

export async function fetchMusicCollection(): Promise<Band[]> {
  const supabase = createClient();

  const [bandsResult, albumsResult, tracksResult] = await Promise.all([
    supabase.from("bands").select("id, name, cover_image"),
    supabase.from("albums").select("id, title, year, format, band_id, cover_image").order("year", { ascending: true }),
    supabase.from("tracks").select("id, title, track_number, album_id"),
  ]);

  if (bandsResult.error) throw bandsResult.error;
  if (albumsResult.error) throw albumsResult.error;
  if (tracksResult.error) throw tracksResult.error;

  const tracksByAlbumId = new Map<number, Track[]>();
  for (const row of tracksResult.data ?? []) {
    const track: Track = { number: row.track_number, title: row.title };
    const albumTracks = tracksByAlbumId.get(row.album_id) ?? [];
    albumTracks.push(track);
    tracksByAlbumId.set(row.album_id, albumTracks);
  }
  for (const tracks of tracksByAlbumId.values()) {
    tracks.sort((a, b) => a.number - b.number);
  }

  const albumsByBandId = new Map<number, Album[]>();
  for (const row of albumsResult.data ?? []) {
    const album: Album = {
      id: String(row.id),
      title: row.title,
      year: row.year,
      format: row.format as AlbumFormat,
      tracks: tracksByAlbumId.get(row.id) ?? [],
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
