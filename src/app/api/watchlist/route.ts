import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WatchlistMovie from "@/lib/models/WatchlistMovie";

// GET /api/watchlist — return all saved movies
export async function GET() {
  try {
    await dbConnect();
    const movies = await WatchlistMovie.find().sort({ addedAt: -1 }).lean();
    return NextResponse.json(movies);
  } catch (error) {
    console.error("GET /api/watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

// POST /api/watchlist — add a movie (body: imdbID, title, poster)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { imdbID, title, poster } = body;

    if (!imdbID || !title) {
      return NextResponse.json(
        { error: "imdbID and title are required" },
        { status: 400 }
      );
    }

    // Prevent duplicates
    const existing = await WatchlistMovie.findOne({ imdbID });
    if (existing) {
      return NextResponse.json(
        { error: "Movie already in watchlist" },
        { status: 409 }
      );
    }

    const movie = await WatchlistMovie.create({
      imdbID,
      title,
      poster: poster ?? "",
    });

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error("POST /api/watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to add movie" },
      { status: 500 }
    );
  }
}
