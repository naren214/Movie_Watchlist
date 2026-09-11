"use client";

import { useState } from "react";
import { Search, Plus, Check, Loader2, Film, ChevronDown } from "lucide-react";
import type { OMDbSearchResult, OMDbSearchResponse } from "@/lib/types";

export default function AddPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OMDbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setResults([]);
    setPage(1);
    setTotalResults(0);

    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&s=${encodeURIComponent(trimmed)}&page=1`
      );
      const data: OMDbSearchResponse = await res.json();

      if (data.Response === "False") {
        setError(data.Error ?? "No results found");
        return;
      }

      setResults(data.Search ?? []);
      setTotalResults(parseInt(data.totalResults || "0", 10));
    } catch {
      setError("Search failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadMore() {
    if (loadingMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&s=${encodeURIComponent(query.trim())}&page=${nextPage}`
      );
      const data: OMDbSearchResponse = await res.json();

      if (data.Response === "True" && data.Search) {
        setResults((prev) => [...prev, ...data.Search!]);
        setPage(nextPage);
      }
    } catch {
      // fail silently
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleAdd(movie: OMDbSearchResult) {
    setAddingId(movie.imdbID);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imdbID: movie.imdbID,
          title: movie.Title,
          poster: movie.Poster,
        }),
      });

      if (res.status === 409 || res.ok) {
        setAddedIds((prev) => new Set(prev).add(movie.imdbID));
      } else {
        throw new Error("Failed to add");
      }
    } catch {
      alert("Error adding movie to watchlist");
    } finally {
      setAddingId(null);
    }
  }

  const hasMore = results.length < totalResults;

  return (
    <div className="glass-panel mx-auto max-w-3xl rounded-3xl p-6 sm:p-10 shadow-neu">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-wide text-white drop-shadow-lg">
          Find Movies
        </h1>
        <p className="mt-2 text-sm font-medium text-zinc-300">
          Search the OMDb database to add movies to your watchlist.
        </p>
      </div>

      {/* ── Search Form ── */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title (e.g., Inception)..."
            className="glass-neu-pressed h-14 w-full rounded-2xl pl-14 pr-4 text-sm font-medium text-white placeholder:text-white/40 transition-all focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="glass-neu inline-flex h-14 items-center justify-center gap-2 rounded-2xl px-8 text-sm font-bold tracking-wide text-white transition-all hover:scale-105 active:shadow-neu-pressed active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white/70" />
          ) : (
            "Search"
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="glass-neu-pressed mt-8 rounded-2xl p-4 text-center">
          <p className="text-sm font-medium text-red-300 drop-shadow-md">{error}</p>
        </div>
      )}

      {/* Skeletons */}
      {loading && (
        <div className="mt-10 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-neu-pressed flex items-center gap-4 rounded-2xl p-3 animate-pulse">
              <div className="h-24 w-16 rounded-xl bg-white/10" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-3/4 rounded bg-white/10" />
                <div className="h-3 w-1/4 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50 pl-2">
            Showing {results.length} of {totalResults} results
          </p>

          <div className="space-y-4">
            {results.map((r) => {
              const isAdded = addedIds.has(r.imdbID);
              const isAdding = addingId === r.imdbID;

              return (
                <div
                  key={r.imdbID}
                  className="glass-neu flex items-center gap-4 rounded-2xl p-3 sm:p-4 transition-all hover:bg-white/10"
                >
                  {/* Poster thumbnail */}
                  <div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-black/40 shadow-inner">
                    {r.Poster && r.Poster !== "N/A" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.Poster}
                        alt={r.Title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/20">
                        <Film className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="truncate text-base font-bold text-white drop-shadow-md">
                      {r.Title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs font-medium text-white/50">
                      <span className="glass-neu-pressed rounded-md px-1.5 py-0.5">
                        {r.Year}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{r.Type}</span>
                    </div>
                  </div>

                  {/* Add button */}
                  <div className="pl-2 pr-1 sm:pr-2">
                    <button
                      onClick={() => handleAdd(r)}
                      disabled={isAdded || isAdding}
                      className={`inline-flex h-10 w-10 sm:h-auto sm:w-auto sm:px-5 sm:py-2.5 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
                        isAdded
                          ? "glass-neu-pressed text-emerald-400"
                          : "glass-neu text-white hover:scale-105 active:shadow-neu-pressed active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-5 w-5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline drop-shadow-md">Added</span>
                        </>
                      ) : isAdding ? (
                        <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline drop-shadow-md">Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pb-4 pt-10">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="glass-neu inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold tracking-wide text-white transition-all hover:scale-105 active:shadow-neu-pressed active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white/70" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Load More Results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
