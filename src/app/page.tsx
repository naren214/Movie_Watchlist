"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Star, Film, Search } from "lucide-react";
import type { IWatchlistMovie } from "@/lib/types";

type SortOption = "newest" | "rating" | "title";
type FilterOption = "all" | "want to watch" | "watched";

export default function HomePage() {
  const [movies, setMovies] = useState<IWatchlistMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  useEffect(() => {
    async function fetchWatchlist() {
      try {
        const res = await fetch("/api/watchlist");
        if (!res.ok) throw new Error("Failed to fetch watchlist");
        const data: IWatchlistMovie[] = await res.json();
        setMovies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchWatchlist();
  }, []);

  const displayedMovies = useMemo(() => {
    let result = [...movies];
    if (filterBy !== "all") {
      result = result.filter((m) => m.status === filterBy);
    }
    result.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      if (sortBy === "rating") return (b.myRating || 0) - (a.myRating || 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });
    return result;
  }, [movies, sortBy, filterBy]);

  const filterCounts = useMemo(() => {
    const watched = movies.filter((m) => m.status === "watched").length;
    return { all: movies.length, watched, "want to watch": movies.length - watched };
  }, [movies]);

  if (loading) {
    return (
      <div className="glass-panel rounded-3xl p-6 sm:p-10 animate-pulse">
        <div className="mb-10 h-10 w-48 rounded-xl bg-white/10" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="glass-panel overflow-hidden rounded-2xl">
              <div className="aspect-[2/3] bg-white/5" />
              <div className="p-4">
                <div className="h-4 w-3/4 rounded-md bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel mx-auto max-w-md rounded-3xl p-10 text-center shadow-neu">
        <p className="text-lg font-medium text-red-300 drop-shadow-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="glass-neu mt-6 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all active:shadow-neu-pressed active:scale-95"
        >
          Try again
        </button>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="glass-panel mx-auto max-w-lg rounded-3xl p-12 text-center shadow-neu">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full glass-neu-pressed">
          <Film className="h-8 w-8 text-white/70" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-wide text-white drop-shadow-md">
          No movies yet
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          Start building your collection by adding movies you want to watch or have already seen.
        </p>
        <Link
          href="/add"
          className="glass-neu mt-8 inline-block rounded-xl px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-all hover:scale-105 active:shadow-neu-pressed active:scale-95"
        >
          Add your first movie
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-neu">
      {/* ── Header row ── */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-wide text-white drop-shadow-lg">
            My Movies
          </h1>
          <p className="mt-2 text-sm text-zinc-300 font-medium">
            {movies.length} {movies.length === 1 ? "title" : "titles"} in your collection
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Neumorphic Filter Pills */}
          <div className="glass-neu-pressed flex gap-2 rounded-2xl p-1.5">
            {(["all", "want to watch", "watched"] as FilterOption[]).map((opt) => {
              const isActive = filterBy === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setFilterBy(opt)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? "glass-neu text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {opt === "all" ? "All" : opt}
                  <span className={`tabular-nums ${isActive ? "text-indigo-300" : "text-zinc-500"}`}>
                    {filterCounts[opt]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Neumorphic Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="glass-neu-pressed appearance-none rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider text-zinc-300 transition-colors focus:outline-none"
          >
            <option className="bg-zinc-900 text-white" value="newest">Newest First</option>
            <option className="bg-zinc-900 text-white" value="rating">Highest Rated</option>
            <option className="bg-zinc-900 text-white" value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {displayedMovies.length === 0 ? (
        <div className="glass-neu-pressed rounded-3xl py-20 text-center">
          <Search className="mx-auto mb-4 h-10 w-10 text-white/30" />
          <p className="text-base font-medium text-zinc-400">
            No movies match this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {displayedMovies.map((m) => (
            <Link
              key={m._id}
              href={`/movie/${m.imdbID}`}
              className="glass-neu group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 active:shadow-neu-pressed"
            >
              {/* Poster Container */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/20">
                {m.poster && m.poster !== "N/A" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.poster}
                    alt={m.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/20">
                    <Film className="h-8 w-8" />
                  </div>
                )}

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/20 opacity-80" />

                {/* Glassmorphic Badge */}
                {m.status === "watched" && (
                  <div className="absolute left-3 top-3 rounded-lg bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-2 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 drop-shadow-md">
                      Watched
                    </span>
                  </div>
                )}

                {/* Text positioned over poster for seamless glass look */}
                <div className="absolute bottom-0 left-0 w-full p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold tracking-wide text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {m.title}
                  </h3>
                  {m.myRating != null && (
                    <div className="mt-1.5 flex items-center gap-1.5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-amber-50">{m.myRating}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
