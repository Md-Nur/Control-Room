import mongoose, { Schema, model, models } from "mongoose";

const SettingsSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

const Settings = models.Settings || model("Settings", SettingsSchema);
export default Settings;
