import mongoose from "mongoose";

type ConnectionObjcect = {
  isConnected?: number;
};

async function dbConnect(): Promise<void> {
  const connection: ConnectionObjcect = {};

  if (connection.isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {
      dbName: "control_room",
    });

    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
}

export default dbConnect;
