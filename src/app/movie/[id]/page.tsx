"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Star, ArrowLeft, Loader2, Film, Trash2, Save } from "lucide-react";
import Link from "next/link";
import type { OMDbDetailResponse, IWatchlistMovie, WatchStatus } from "@/lib/types";

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: imdbID } = use(params);

  const [omdb, setOmdb] = useState<OMDbDetailResponse | null>(null);
  const [saved, setSaved] = useState<IWatchlistMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [status, setStatus] = useState<WatchStatus>("want to watch");
  const [rating, setRating] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const omdbRes = await fetch(
          `https://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}&i=${imdbID}&plot=full`
        );
        const omdbData: OMDbDetailResponse = await omdbRes.json();
        if (omdbData.Response === "False") {
          throw new Error(omdbData.Error ?? "Movie not found on OMDb");
        }
        setOmdb(omdbData);

        const wlRes = await fetch("/api/watchlist");
        if (wlRes.ok) {
          const all: IWatchlistMovie[] = await wlRes.json();
          const match = all.find((m) => m.imdbID === imdbID);
          if (match) {
            setSaved(match);
            setStatus(match.status);
            setRating(
              match.myRating !== undefined && match.myRating !== null
                ? String(match.myRating)
                : ""
            );
            setNote(match.myNote ?? "");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [imdbID]);

  async function handleSave() {
    if (!saved) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const body: Record<string, unknown> = { status };
      if (rating !== "") body.myRating = Number(rating);
      body.myNote = note;

      const res = await fetch(`/api/watchlist/${saved._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated: IWatchlistMovie = await res.json();
      setSaved(updated);
      setSaveMsg("Saved successfully");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("Error saving");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!saved || !confirm("Remove this movie from your watchlist?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/watchlist/${saved._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/");
    } catch {
      alert("Error deleting movie");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-panel mx-auto max-w-4xl rounded-3xl p-6 sm:p-10 shadow-neu animate-pulse">
        <div className="mb-10 h-4 w-28 rounded-lg bg-white/10" />
        <div className="grid gap-10 md:grid-cols-[260px_1fr]">
          <div className="aspect-[2/3] rounded-2xl bg-white/5" />
          <div className="space-y-6 pt-2">
            <div className="h-10 w-3/4 rounded-xl bg-white/10" />
            <div className="h-4 w-1/2 rounded-lg bg-white/5" />
            <div className="mt-8 space-y-3">
              <div className="h-4 w-full rounded-lg bg-white/5" />
              <div className="h-4 w-full rounded-lg bg-white/5" />
              <div className="h-4 w-4/5 rounded-lg bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !omdb) {
    return (
      <div className="glass-panel mx-auto max-w-md rounded-3xl p-12 text-center shadow-neu">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full glass-neu-pressed">
          <Film className="h-8 w-8 text-white/50" />
        </div>
        <p className="mt-6 text-lg font-bold tracking-wide text-red-300 drop-shadow-md">
          {error || "Movie data unavailable"}
        </p>
        <Link
          href="/"
          className="glass-neu mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 active:shadow-neu-pressed active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Watchlist
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <Link
        href="/"
        className="glass-neu mb-8 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold tracking-wide text-white transition-all hover:scale-105 active:shadow-neu-pressed active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-neu">
        <div className="grid gap-10 md:grid-cols-[280px_1fr] items-start">
          
          {/* ── Poster ── */}
          <div className="glass-neu mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl bg-black/20 p-2">
            <div className="overflow-hidden rounded-xl">
              {omdb.Poster && omdb.Poster !== "N/A" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={omdb.Poster}
                  alt={omdb.Title}
                  className="w-full"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center text-white/20">
                  <Film className="h-12 w-12" />
                </div>
              )}
            </div>
          </div>

          {/* ── Details ── */}
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {omdb.Title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-white/60">
              <span className="glass-neu-pressed rounded-md px-2 py-1 text-white">{omdb.Year}</span>
              <span>•</span>
              <span>{omdb.Runtime}</span>
              <span>•</span>
              <span>{omdb.Genre}</span>
              {omdb.imdbRating && omdb.imdbRating !== "N/A" && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5 text-amber-400 drop-shadow-md">
                    <Star className="h-4 w-4 fill-amber-400" />
                    {omdb.imdbRating}
                  </span>
                </>
              )}
            </div>

            <p className="mt-8 text-[15px] leading-relaxed text-white/80 font-medium">
              {omdb.Plot}
            </p>

            {/* Metadata Grid */}
            <dl className="mt-8 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              {[
                ["Director", omdb.Director],
                ["Cast", omdb.Actors],
                ["Writer", omdb.Writer],
              ]
                .filter(([, v]) => v && v !== "N/A")
                .map(([label, value]) => (
                  <div key={label} className="glass-neu-pressed rounded-xl p-3">
                    <dt className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">
                      {label}
                    </dt>
                    <dd className="text-[13px] font-semibold text-white">{value}</dd>
                  </div>
                ))}
            </dl>

            {/* ── Edit form ── */}
            {saved ? (
              <div className="mt-12 rounded-2xl border-t border-white/10 pt-10">
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-xl font-black tracking-wide text-white drop-shadow-md">
                    Your Review
                  </h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Status */}
                  <div className="glass-panel rounded-2xl p-4 shadow-neu">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as WatchStatus)}
                      className="glass-neu-pressed h-12 w-full appearance-none rounded-xl px-4 text-sm font-bold text-white focus:outline-none"
                    >
                      <option className="bg-zinc-900" value="want to watch">Want to Watch</option>
                      <option className="bg-zinc-900" value="watched">Watched</option>
                    </select>
                  </div>

                  {/* Rating */}
                  <div className="glass-panel rounded-2xl p-4 shadow-neu">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">
                      Rating
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      placeholder="0–10"
                      className="glass-neu-pressed h-12 w-full rounded-xl px-4 text-sm font-bold text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>

                  {/* Note */}
                  <div className="glass-panel rounded-2xl p-4 shadow-neu sm:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/50">
                      Notes
                    </label>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Your thoughts…"
                      className="glass-neu-pressed w-full resize-none rounded-xl p-4 text-sm font-medium text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="glass-neu inline-flex h-12 items-center gap-2 rounded-xl px-8 text-sm font-bold tracking-wide text-white transition-all hover:scale-105 active:shadow-neu-pressed active:scale-95 disabled:opacity-40"
                  >
                    {saving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    Save Changes
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="glass-neu inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-bold tracking-wide text-red-300 transition-all hover:scale-105 hover:text-red-400 active:shadow-neu-pressed active:scale-95 disabled:opacity-40"
                  >
                    {deleting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                    Remove
                  </button>

                  {saveMsg && (
                    <span
                      className={`ml-2 text-sm font-bold drop-shadow-md ${
                        saveMsg.includes("Error")
                          ? "text-red-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {saveMsg}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-12 glass-panel rounded-2xl p-6 text-center shadow-neu">
                <p className="text-sm font-medium text-white/60">
                  This movie isn&apos;t in your watchlist.
                </p>
                <Link
                  href="/add"
                  className="glass-neu mt-4 inline-block rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 active:shadow-neu-pressed active:scale-95"
                >
                  Search to Add
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
