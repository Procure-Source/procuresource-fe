import mongoose from "mongoose";

const DATABASE_URI =
  process.env.COSMOS_MONGODB_URI?.trim() || process.env.MONGODB_URI?.trim();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export default async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!DATABASE_URI || !/^mongodb(\+srv)?:\/\//.test(DATABASE_URI)) {
    throw new Error("COSMOS_MONGODB_URI or MONGODB_URI is not configured");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(DATABASE_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
