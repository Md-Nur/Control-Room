import { Document, Model, model, models, Schema } from "mongoose";

export interface Polapain extends Document {
  name: string;
  dob?: Date;
  phone?: string;
  password: string;
  avatar?: string;
  balance: number;
}

const polapainSchema = new Schema<Polapain>({
  name: { type: String, required: true },
  dob: { type: Date, required: false },
  phone: { type: String, required: false },
  password: { type: String, required: true },
  avatar: { type: String, required: false },
  balance: { type: Number, default: 0 },
});

const PolapainModel =
  (models.Polapain as Model<Polapain>) ||
  model<Polapain>("Polapain", polapainSchema);
export default PolapainModel;
