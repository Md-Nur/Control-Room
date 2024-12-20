import { Document, model, models, Schema } from "mongoose";

export interface Photos extends Document {
  title: string;
  date: string;
  img: string;
}

const PhotosSchema = new Schema<Photos>({
  title: { type: String, required: true },
  date: { type: String, required: true },
  img: { type: String, required: true },
});

const PhotosModel = models.Photos || model<Photos>("Photos", PhotosSchema);

export default PhotosModel;
