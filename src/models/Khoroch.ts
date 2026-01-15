import { Document, Model, model, models, Schema } from "mongoose";

export interface Khoroch extends Document {
  amount: number;
  title: string;
  date: Date;
  dise: { id: string; name: string; amount: number; avatar: string }[];
  dibo: { id: string; name: string; amount: number; avatar: string }[];
  type: string;
  isApproved: boolean;
}

const khorochSchema = new Schema<Khoroch>({
  amount: { type: Number, required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  dise: [{ id: String, amount: Number, name: String, avatar: String }],
  dibo: [{ id: String, amount: Number, name: String, avatar: String }],
  type: { 
    type: String, 
    required: true, 
    enum: [
      "food", "grocery", "transportation", "house_rent", "utilities", 
      "entertainment", "healthcare", "shopping", "personal_care", "others", "add-taka"
    ] 
  },
  isApproved: { type: Boolean, default: false },
});

// Indices for performance
khorochSchema.index({ "dibo.id": 1, date: -1 });
khorochSchema.index({ type: 1 });
khorochSchema.index({ "dise.id": 1, "dise.amount": 1 });
khorochSchema.index({ "dibo.id": 1, "dibo.amount": 1 });

// Force delete the model from cache in development to ensure schema changes are picked up
if (process.env.NODE_ENV === "development") {
  delete models.Khoroch;
}

const KhorochModel =
  (models.Khoroch as Model<Khoroch>) ||
  model<Khoroch>("Khoroch", khorochSchema);

export default KhorochModel;
