import { Document, Model, model, models, Schema } from "mongoose";

export interface Khoroch extends Document {
  amount: number;
  title: string;
  date: Date;
  dise: { id: string; amount: number }[];
  dibo: { id: string; amount: number }[];
  isApproved: boolean;
}

const khorochSchema = new Schema<Khoroch>({
  amount: { type: Number, required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  dise: [{ type: { id: String, amount: Number } }],
  dibo: [{ type: { id: String, amount: Number } }],
  isApproved: { type: Boolean, default: false },
});

const KhorochModel =
  (models.Khoroch as Model<Khoroch>) ||
  model<Khoroch>("Khoroch", khorochSchema);

export default KhorochModel;
