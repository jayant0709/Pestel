import mongoose from 'mongoose';

const politicalFactorsSchema = new mongoose.Schema({
  government_policies: { type: Boolean, default: false },
  political_stability: { type: Boolean, default: false },
  tax_regulations: { type: Boolean, default: false },
  industry_regulations: { type: Boolean, default: false },
  global_trade_agreements: { type: Boolean, default: false },
  notes: { type: String, default: '' }
}, { _id: false });

const economicFactorsSchema = new mongoose.Schema({
  economic_growth: { type: Boolean, default: false },
  interest_rates: { type: Boolean, default: false },
  inflation: { type: Boolean, default: false },
  unemployment: { type: Boolean, default: false },
  labor_costs: { type: Boolean, default: false },
  notes: { type: String, default: '' }
}, { _id: false });

const socialFactorsSchema = new mongoose.Schema({
  demographics: { type: Boolean, default: false },
  education_levels: { type: Boolean, default: false },
  cultural_factors: { type: Boolean, default: false },
  health_consciousness: { type: Boolean, default: false },
  lifestyle_trends: { type: Boolean, default: false },
  notes: { type: String, default: '' }
}, { _id: false });

const technologicalFactorsSchema = new mongoose.Schema({
  r_and_d_activity: { type: Boolean, default: false },
  automation: { type: Boolean, default: false },
  technology_incentives: { type: Boolean, default: false },
  rate_of_technological_change: { type: Boolean, default: false },
  technology_adoption: { type: Boolean, default: false },
  notes: { type: String, default: '' }
}, { _id: false });

const environmentalFactorsSchema = new mongoose.Schema({
  weather: { type: Boolean, default: false },
  climate_change: { type: Boolean, default: false },
  environmental_policies: { type: Boolean, default: false },
  carbon_footprint: { type: Boolean, default: false },
  sustainability: { type: Boolean, default: false },
  notes: { type: String, default: '' }
}, { _id: false });

const legalFactorsSchema = new mongoose.Schema({
  discrimination_laws: { type: Boolean, default: false },
  consumer_protection: { type: Boolean, default: false },
  antitrust_laws: { type: Boolean, default: false },
  employment_laws: { type: Boolean, default: false },
  health_and_safety_regulations: { type: Boolean, default: false },
  notes: { type: String, default: '' }
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  email: { type: String, required: [true, 'User email is required'], trim: true },
  business_name: { type: String, required: [true, 'Business name is required'], trim: true },
  industry: { type: String, required: [true, 'Industry is required'], trim: true },
  geographical_focus: { type: String, required: [true, 'Geographical focus is required'], trim: true },
  target_market: { type: String, required: [true, 'Target market is required'], trim: true },
  competitors: { type: String, trim: true, default: '' },
  time_frame: { type: String, enum: ['Short-term (1-2 years)', 'Long-term (5+ years)'], default: 'Short-term (1-2 years)' },
  political_factors: { type: politicalFactorsSchema, default: () => ({}) },
  economic_factors: { type: economicFactorsSchema, default: () => ({}) },
  social_factors: { type: socialFactorsSchema, default: () => ({}) },
  technological_factors: { type: technologicalFactorsSchema, default: () => ({}) },
  environmental_factors: { type: environmentalFactorsSchema, default: () => ({}) },
  legal_factors: { type: legalFactorsSchema, default: () => ({}) },
  additional_notes: { type: String, default: '' }
}, {
  timestamps: true
});

export default mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema);
