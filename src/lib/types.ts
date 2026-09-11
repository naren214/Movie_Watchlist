// ── OMDb API response shapes ────────────────────────────────────────

/** A single movie in an OMDb *search* response (s= param). */
export interface OMDbSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

/** The envelope returned by OMDb for a search query. */
export interface OMDbSearchResponse {
  Search?: OMDbSearchResult[];
  totalResults?: string;
  Response: "True" | "False";
  Error?: string;
}

/** Full movie detail returned by OMDb for a single-title lookup (i= param). */
export interface OMDbDetailResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  imdbRating: string;
  imdbID: string;
  Type: string;
  Response: "True" | "False";
  Error?: string;
}

// ── Watchlist (internal) types ──────────────────────────────────────

export type WatchStatus = "want to watch" | "watched";

/** The shape of a document coming out of MongoDB (serialised to JSON). */
export interface IWatchlistMovie {
  _id: string;
  imdbID: string;
  title: string;
  poster: string;
  status: WatchStatus;
  myRating?: number;
  myNote?: string;
  addedAt: string;
}
