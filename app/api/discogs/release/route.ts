import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id || !id.trim()) {
    return NextResponse.json(
      { error: "Missing required query parameter: id" },
      { status: 400 },
    );
  }

  const token = process.env.DISCOGS_TOKEN;

  let response: Response;
  try {
    response = await fetch(`https://api.discogs.com/releases/${id.trim()}`, {
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
