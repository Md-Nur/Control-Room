
import { Document, Schema, model, models } from "mongoose";

export interface INotification extends Document {
  recipient: Schema.Types.ObjectId;
  sender: Schema.Types.ObjectId;
  message: string;
  link?: string;
  isRead: boolean;
  type: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "Polapain", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "Polapain", required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    type: { type: String, default: "system" },
  },
  { timestamps: true }
);

const Notification = models.Notification || model<INotification>("Notification", NotificationSchema);
export default Notification;
