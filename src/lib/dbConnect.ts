import mongoose from "mongoose";

async function dbConnect(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  try {
    const connectionOptions = {
      dbName: "control_room",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await mongoose.connect(process.env.MONGODB_URI || "", connectionOptions as any);

  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
}

export default dbConnect;
