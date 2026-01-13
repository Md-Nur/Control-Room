import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMeal extends Document {
  userId: string;
  date: Date;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  isGuest: boolean; 
  // We can treat "not present" as simply no record or a record with isPresent=false?
  // Let's stick to the plan: if a record exists, we assume user is tracking that day.
  // The 'default' logic applies if B=F, L=F, D=F. 
}

const MealSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Polapain", required: true },
    date: { type: Date, required: true },
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    dinner: { type: Boolean, default: false },
    isGuest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure one record per user per day
// @ts-expect-error - Mongoose types for index are tricky sometimes
MealSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Meal: Model<IMeal> =
  mongoose.models.Meal || mongoose.model<IMeal>("Meal", MealSchema);
