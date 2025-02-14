import mongoose from 'mongoose';

const politicalFactorsSchema = new mongoose.Schema({
  government_policies: {
    type: Boolean,
    default: false
  },
  political_stability: {
    type: Boolean,
    default: false
  },
  tax_regulations: {
    type: Boolean,
    default: false
  },
  industry_regulations: {
    type: Boolean,
    default: false
  },
  global_trade_agreements: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  }
});

const AnalysisSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'User email is required'],
    trim: true
  },
  business_name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  geographical_focus: {
    type: String,
    required: [true, 'Geographical focus is required'],
    trim: true
  },
  target_market: {
    type: String,
    required: [true, 'Target market is required'],
    trim: true
  },
  competitors: {
    type: String,
    trim: true,
    default: ''
  },
  time_frame: {
    type: String,
    enum: ['Short-term (1-2 years)', 'Long-term (5+ years)'],
    default: 'Short-term (1-2 years)'
  },
  political_factors: {
    type: politicalFactorsSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

export default mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema);
