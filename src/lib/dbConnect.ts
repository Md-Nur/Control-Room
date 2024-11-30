import mongoose from "mongoose";

type ConnectionObjcect = {
  isConnected?: number;
};

async function dbConnect(): Promise<void> {
  const connection: ConnectionObjcect = {};

  if (connection.isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {
      dbName: "control_room",
    });

    connection.isConnected = db.connections[0].readyState;
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
}

export default dbConnect;
