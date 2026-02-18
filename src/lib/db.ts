import mongoose, { Connection } from "mongoose";
import dns from "dns";

// Use Google DNS to resolve MongoDB Atlas SRV records
// (works around restricted network DNS that blocks SRV lookups)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const cached: { conn: Connection | null; promise: Promise<Connection> | null } =
  {
    conn: null,
    promise: null,
  };

async function connectDB(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined");
    }

    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((mongoose) => mongoose.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
