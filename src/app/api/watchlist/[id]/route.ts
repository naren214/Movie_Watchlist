import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import WatchlistMovie from "@/lib/models/WatchlistMovie";

// PATCH /api/watchlist/[id] — update status, myRating, or myNote
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    // Only allow updating these specific fields
    const allowed: Record<string, unknown> = {};
    if (body.status !== undefined) allowed.status = body.status;
    if (body.myRating !== undefined) allowed.myRating = body.myRating;
    if (body.myNote !== undefined) allowed.myNote = body.myNote;

    const movie = await WatchlistMovie.findByIdAndUpdate(id, allowed, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error("PATCH /api/watchlist/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update movie" },
      { status: 500 }
    );
  }
}

// DELETE /api/watchlist/[id] — remove a movie
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const movie = await WatchlistMovie.findByIdAndDelete(id);

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/watchlist/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete movie" },
      { status: 500 }
    );
  }
}
