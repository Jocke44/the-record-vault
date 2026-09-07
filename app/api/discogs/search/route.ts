import { NextRequest, NextResponse } from "next/server";

function normalizeBarcode(value: string): string {
  return value.replace(/\D/g, "");
}

function isBarcodeValue(value: string): boolean {
  const digits = normalizeBarcode(value);
  return digits.length >= 8 && digits.length <= 14;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || !q.trim()) {
    return NextResponse.json(
      { error: "Missing required query parameter: q" },
      { status: 400 },
    );
  }

  const token = process.env.DISCOGS_TOKEN;
  const searchType = request.nextUrl.searchParams.get("searchType");

  const trimmed = q.trim();
  const barcodeDigits = normalizeBarcode(trimmed);
  const looksLikeBarcode = isBarcodeValue(trimmed);

  const format = request.nextUrl.searchParams.get("format");

  const url = new URL("https://api.discogs.com/database/search");
  url.searchParams.set("type", "release");
  url.searchParams.set("per_page", "20");
  if (searchType === "barcode") {
    if (!looksLikeBarcode) {
      return NextResponse.json(
        { error: "Enter a valid barcode (8–14 digits)." },
        { status: 400 },
      );
    }
    url.searchParams.set("barcode", barcodeDigits);
  } else if (searchType === "catno") {
    url.searchParams.set("catno", trimmed);
  } else if (looksLikeBarcode) {
    url.searchParams.set("barcode", barcodeDigits);
  } else {
    url.searchParams.set("q", trimmed);
  }
  if (format && format.trim()) {
    url.searchParams.set("format", format);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: {
        Authorization: token ? `Discogs token=${token}` : "",
        "User-Agent": "TheRecordVault/1.0",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return NextResponse.json(
      { error: `Failed to reach Discogs API: ${message}` },
      { status: 500 },
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return NextResponse.json(
      { error: `Discogs API error ${response.status}: ${body}` },
      { status: 500 },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
