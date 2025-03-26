import {NextRequest, NextResponse} from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({error: "URL is required"}, {status: 400});
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      next: {revalidate: 3600},
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({error: `Failed to fetch image: ${response.statusText}`}, {status: response.status});
    }

    const contentType = response.headers.get("content-type");
    const cacheControl = response.headers.get("cache-control") || "public, max-age=86400";

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": cacheControl,
      },
    });
  } catch (error: unknown) {
    console.error("Image proxy error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({error: "url parameter is valid but upstream response timed out"}, {status: 504});
    }

    return NextResponse.json({error: "Failed to fetch image"}, {status: 500});
  }
}
