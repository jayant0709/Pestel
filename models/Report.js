import mongoose from "mongoose";

// Schema for individual report sections
const reportSectionSchema = new mongoose.Schema({
  report_type: { type: String },
  executive_summary: { type: String },
  factors_analysis: { type: mongoose.Schema.Types.Mixed },
  risks_opportunities: { type: mongoose.Schema.Types.Mixed },
  regional_dynamics: { type: mongoose.Schema.Types.Mixed },
  scenario_analysis: { type: mongoose.Schema.Types.Mixed },
  recommendations: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

// Schema for final report
const finalReportSchema = new mongoose.Schema({
  executive_summary: { type: String },
  introduction: { type: String },
  pestel_analysis: { type: mongoose.Schema.Types.Mixed },
  strategic_recommendations: { type: mongoose.Schema.Types.Mixed },
  conclusion: { type: String }
}, { _id: false });

// Main report schema
const reportSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  analysis_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
    required: true
  },
  individual_reports: {
    political_report: reportSectionSchema,
    economic_report: reportSectionSchema,
    social_report: reportSectionSchema,
    technological_report: reportSectionSchema,
    environmental_report: reportSectionSchema,
    legal_report: reportSectionSchema
  },
  news: {
    political_news: [{ title: String, url: String }],
    economic_news: [{ title: String, url: String }],
    social_news: [{ title: String, url: String }],
    technological_news: [{ title: String, url: String }],
    environmental_news: [{ title: String, url: String }],
    legal_news: [{ title: String, url: String }]
  },
  final_report: finalReportSchema,
  report: finalReportSchema,
  success: { type: Boolean, default: true },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

export default mongoose.models.Report || mongoose.model("Report", reportSchema);
