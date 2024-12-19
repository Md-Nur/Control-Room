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
  type: { type: String, required: true, enum: ["food", "others", "add-taka"] },
  isApproved: { type: Boolean, default: false },
});

const KhorochModel =
  (models.Khoroch as Model<Khoroch>) ||
  model<Khoroch>("Khoroch", khorochSchema);

export default KhorochModel;
