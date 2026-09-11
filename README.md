# Movie Watchlist

A full-stack Movie Watchlist app built with **Next.js 14** (App Router), **TypeScript**, **MongoDB** (Mongoose), and **Tailwind CSS**. Search for movies via the OMDb API, save them to your personal watchlist, and track what you've watched with ratings and notes.

## Features

- **Home page** — Responsive card grid of your watchlist with poster, title, status badge, and rating.
- **Movie detail page** — Full OMDb data (plot, cast, year, IMDb rating) plus editable status, personal rating, and notes.
- **Add page** — Search OMDb by title and add movies to your watchlist in one click.
- **REST API** — `GET`, `POST`, `PATCH`, `DELETE` endpoints under `/api/watchlist`.

## Prerequisites

- **Node.js** 18+
- **MongoDB** running locally or a hosted instance (e.g. MongoDB Atlas)
- **OMDb API key** — get a free one at [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)

## Setup

1. **Clone and install dependencies:**

   ```bash
   cd movie-watchlist
   npm install
   ```

2. **Create environment variables:**

   Copy the example file and fill in your values:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:

   ```env
   MONGODB_URI=mongodb://localhost:27017/movie-watchlist
   NEXT_PUBLIC_OMDB_API_KEY=your_omdb_api_key_here
   ```

   | Variable | Description |
   |---|---|
   | `MONGODB_URI` | MongoDB connection string (local or Atlas) |
   | `NEXT_PUBLIC_OMDB_API_KEY` | Your OMDb API key (prefixed `NEXT_PUBLIC_` so the client can call OMDb directly for search/detail) |

3. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with nav
│   ├── page.tsx                # Home — watchlist grid
│   ├── globals.css             # Tailwind base styles
│   ├── add/
│   │   └── page.tsx            # Search OMDb & add movies
│   ├── movie/
│   │   └── [id]/
│   │       └── page.tsx        # Movie detail & edit form
│   └── api/
│       └── watchlist/
│           ├── route.ts        # GET all, POST new
│           └── [id]/
│               └── route.ts    # PATCH update, DELETE remove
└── lib/
    ├── mongodb.ts              # Mongoose connection (cached)
    ├── types.ts                # TypeScript interfaces
    └── models/
        └── WatchlistMovie.ts   # Mongoose schema & model
```

## API Reference

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `GET` | `/api/watchlist` | — | List all saved movies |
| `POST` | `/api/watchlist` | `{ imdbID, title, poster }` | Add a movie |
| `PATCH` | `/api/watchlist/:id` | `{ status?, myRating?, myNote? }` | Update a movie |
| `DELETE` | `/api/watchlist/:id` | — | Remove a movie |

## Tech Stack

- [Next.js 14](https://nextjs.org/) — App Router, Route Handlers
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OMDb API](https://www.omdbapi.com/)
