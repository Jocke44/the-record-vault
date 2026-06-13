export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder.svg";
  if (url.includes("discogs.com")) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}
