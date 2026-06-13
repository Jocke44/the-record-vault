import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "TheRecordVault/1.0",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: 500 });
    }

    const contentType = response.headers.get("Content-Type") ?? "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch {
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
