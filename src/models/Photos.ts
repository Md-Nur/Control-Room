import { Document, model, models, Schema } from "mongoose";

export interface Photos extends Document {
  title: string;
  date: string;
  img: string;
  isPrivate?: boolean;
}

const PhotosSchema = new Schema<Photos>({
  title: { type: String, required: true },
  date: { type: String, required: true },
  img: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
});

const PhotosModel = models.Gallery || model<Photos>("Gallery", PhotosSchema);

export default PhotosModel;
