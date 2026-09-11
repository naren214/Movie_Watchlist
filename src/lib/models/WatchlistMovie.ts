import mongoose, { Schema, model, models, Document } from "mongoose";
import type { WatchStatus } from "@/lib/types";

export interface WatchlistMovieDocument extends Document {
  imdbID: string;
  title: string;
  poster: string;
  status: WatchStatus;
  myRating?: number;
  myNote?: string;
  addedAt: Date;
}

const WatchlistMovieSchema = new Schema<WatchlistMovieDocument>(
  {
    imdbID: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    poster: { type: String, default: "" },
    status: {
      type: String,
      enum: ["want to watch", "watched"],
      default: "want to watch",
    },
    myRating: { type: Number, min: 0, max: 10 },
    myNote: { type: String },
    addedAt: { type: Date, default: Date.now },
  },
  { collection: "WatchlistMovie" }
);

const WatchlistMovie =
  (models.WatchlistMovie as mongoose.Model<WatchlistMovieDocument>) ||
  model<WatchlistMovieDocument>("WatchlistMovie", WatchlistMovieSchema);

export default WatchlistMovie;
