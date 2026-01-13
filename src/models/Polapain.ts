import { Document, Model, model, models, Schema } from "mongoose";

export interface BasePolapain {
  _id?: string;
  name: string;
  dob?: Date;
  phone?: string;
  password: string;
  avatar?: string;
  balance: number;
  isManager: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pushSubscriptions?: any[];
}

export interface Polapain extends Document, Omit<BasePolapain, "_id"> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _id: any; 
}

const polapainSchema = new Schema<Polapain>({
  name: { type: String, required: true },
  dob: { type: Date, required: false },
  phone: { type: String, required: false },
  password: { type: String, required: true },
  avatar: { type: String, required: false },
  balance: { type: Number, default: 0 },
  isManager: { type: Boolean, default: false },
  pushSubscriptions: { type: [Schema.Types.Mixed], default: [] },
});

const PolapainModel =
  (models.Polapain as Model<Polapain>) ||
  model<Polapain>("Polapain", polapainSchema);
export default PolapainModel;
