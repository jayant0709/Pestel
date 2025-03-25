import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.Report || mongoose.model("Report", reportSchema);
