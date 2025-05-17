import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import {
  ChevronDown,
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Target,
  Compass,
  Clock,
  Star,
  FileText,
  Globe,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Color schemes for each PESTEL dimension
const dimensionConfig = {
  Political: {
    icon: (
      <Image
        src="/political.png"
        alt="Political"
        width={24}
        height={24}
        className="w-6 h-6"
      />
    ),
    color: "blue",
    gradientFrom: "from-blue-600",
    gradientTo: "to-blue-800",
    bgLight: "bg-blue-50",
    bgMedium: "bg-blue-100",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    imageSrc: "/political.png",
  },
  Economic: {
    icon: (
      <Image
        src="/economic.png"
        alt="Economic"
        width={24}
        height={24}
        className="w-6 h-6"
      />
    ),
    color: "green",
    gradientFrom: "from-green-600",
    gradientTo: "to-green-800",
    bgLight: "bg-green-50",
    bgMedium: "bg-green-100",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    imageSrc: "/economic.png",
  },
  Social: {
    icon: (
      <Image
        src="/social.png"
        alt="Social"
        width={24}
        height={24}
        className="w-6 h-6"
      />
    ),
    color: "pink",
    gradientFrom: "from-pink-500",
    gradientTo: "to-pink-700",
    bgLight: "bg-pink-50",
    bgMedium: "bg-pink-100",
    borderColor: "border-pink-200",
    textColor: "text-pink-700",
    imageSrc: "/social.png",
  },
  Technological: {
    icon: (
      <Image
        src="/technological.png"
        alt="Technological"
        width={24}
        height={24}
        className="w-6 h-6"
      />
    ),
    color: "cyan",
    gradientFrom: "from-cyan-500",
    gradientTo: "to-cyan-700",
    bgLight: "bg-cyan-50",
    bgMedium: "bg-cyan-100",
    borderColor: "border-cyan-200",
    textColor: "text-cyan-700",
    imageSrc: "/technological.png",
  },
  Environmental: {
    icon: (
      <Image
        src="/environmental.png"
        alt="Environmental"
        width={24}
        height={24}
        className="w-6 h-6"
      />
    ),
    color: "teal",
    gradientFrom: "from-teal-500",
    gradientTo: "to-teal-700",
    bgLight: "bg-teal-50",
    bgMedium: "bg-teal-100",
    borderColor: "border-teal-200",
    textColor: "text-teal-700",
    imageSrc: "/environmental.png",
  },
  Legal: {
    icon: (
      <Image
        src="/legal.png"
        alt="Legal"
        width={24}
        height={24}
        className="w-6 h-6"
      />
    ),
    color: "amber",
    gradientFrom: "from-amber-500",
    gradientTo: "to-amber-700",
    bgLight: "bg-amber-50",
    bgMedium: "bg-amber-100",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    imageSrc: "/legal.png",
  },
  Final: {
    icon: <FileText className="w-6 h-6" />,
    color: "indigo",
    gradientFrom: "from-indigo-500",
    gradientTo: "to-indigo-700",
    bgLight: "bg-indigo-50",
    bgMedium: "bg-indigo-100",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-700",
  },
};

// Priority colors and labels
const getPriorityConfig = (priority) => {
  if (!priority)
    return {
      color: "gray",
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      borderColor: "border-gray-200",
    };

  const p = priority.toLowerCase();

  if (p.includes("immediate") || p.includes("critical"))
    return {
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
      borderColor: "border-red-200",
      icon: <Clock className="w-4 h-4 mr-1" />,
    };
  if (p === "high" || p === "transformative")
    return {
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-700",
      borderColor: "border-orange-200",
      icon: <Star className="w-4 h-4 mr-1" />,
    };
  if (p === "medium")
    return {
      color: "amber",
      bgColor: "bg-amber-100",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
      icon: <Target className="w-4 h-4 mr-1" />,
    };
  if (p === "low")
    return {
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      icon: <Compass className="w-4 h-4 mr-1" />,
    };
  if (p.includes("long-term"))
    return {
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      icon: <Globe className="w-4 h-4 mr-1" />,
    };

  return {
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
  };
};

// Helper: Render text with markdown-like formatting
const renderMarkdown = (content) => {
  if (!content) return null;

  return content.split(/\n{2,}/).map((block, i) => {
    if (block.startsWith("### "))
      return (
        <h3
          key={i}
          className="text-xl font-heading font-bold mt-6 mb-3 text-gray-800"
        >
          {block.replace("### ", "")}
        </h3>
      );
    if (block.startsWith("## "))
      return (
        <h2
          key={i}
          className="text-2xl font-heading font-extrabold mt-8 mb-4 text-gray-800"
        >
          {block.replace("## ", "")}
        </h2>
      );
    if (block.startsWith("- "))
      return (
        <ul key={i} className="list-disc ml-6 mb-5 space-y-2 font-body">
          {block.split("\n").map((li, j) => (
            <li key={j} className="text-gray-700">
              {li.replace("- ", "")}
            </li>
          ))}
        </ul>
      );
    if (block.match(/^\d+\. /))
      return (
        <ol key={i} className="list-decimal ml-6 mb-5 space-y-2 font-body">
          {block.split("\n").map((li, j) => (
            <li key={j} className="text-gray-700">
              {li.replace(/^\d+\. /, "")}
            </li>
          ))}
        </ol>
      );
    return (
      <p key={i} className="mb-5 text-gray-700 leading-relaxed font-body">
        {block}
      </p>
    );
  });
};

// Helper: Get a clean report object from raw data
const parseReportData = (rawData) => {
  if (!rawData || typeof rawData !== "object") return {};

  // Create a structured data object to hold all our report data
  const reportStructure = {
    finalReport: null,
    individualReports: {},
    hasData: false,
  };

  // Check for final_report
  if (rawData.final_report) {
    try {
      reportStructure.finalReport =
        typeof rawData.final_report === "object"
          ? rawData.final_report
          : JSON.parse(rawData.final_report);
      reportStructure.hasData = true;
    } catch (e) {
      reportStructure.finalReport = rawData.final_report;
      reportStructure.hasData = true;
    }
  }

  // Check for individual_reports
  if (
    rawData.individual_reports &&
    typeof rawData.individual_reports === "object"
  ) {
    Object.entries(rawData.individual_reports).forEach(([key, value]) => {
      if (value) {
        try {
          reportStructure.individualReports[key] =
            typeof value === "object" ? value : JSON.parse(value);
          reportStructure.hasData = true;
        } catch (e) {
          reportStructure.individualReports[key] = value;
          reportStructure.hasData = true;
        }
      }
    });
  }

  // Check for unified report
  if (rawData.report) {
    try {
      reportStructure.report =
        typeof rawData.report === "object"
          ? rawData.report
          : JSON.parse(rawData.report);
      reportStructure.hasData = true;
    } catch (e) {
      reportStructure.report = rawData.report;
      reportStructure.hasData = true;
    }
  }

  return reportStructure;
};

// Component for rendering Executive Summary section
const ExecutiveSummarySection = ({ data, dimension }) => {
  const config = dimensionConfig[dimension] || dimensionConfig.Final;

  return (
    <Card
      className={`shadow-lg border ${config.borderColor} overflow-hidden mb-8 shadow-card`}
    >
      <CardHeader
        className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white p-6`}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/summary.png"
            alt="Executive Summary"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <CardTitle className="font-heading tracking-tight text-xl font-bold">
            Executive Summary
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className={`p-6 ${config.bgLight}`}>
        <div className="prose prose-lg max-w-none">{renderMarkdown(data)}</div>
      </CardContent>
    </Card>
  );
};

// Component for rendering Factors Analysis
const FactorsAnalysisSection = ({ factors, dimension }) => {
  const config = dimensionConfig[dimension] || dimensionConfig.Final;

  if (!factors || !Array.isArray(factors) || factors.length === 0) {
    return null;
  }

  return (
    <Card
      className={`shadow-lg border ${config.borderColor} overflow-hidden mb-8 shadow-card`}
    >
      <CardHeader
        className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white p-6`}
      >
        <div className="flex items-center gap-3">
          {config.icon}
          <CardTitle className="font-heading tracking-tight text-xl font-bold">
            Factors Analysis
          </CardTitle>
        </div>
        <CardDescription className="text-white opacity-95 font-body mt-1">
          Key factors affecting the {dimension.toLowerCase()} dimension
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6">
          {factors.map((factor, index) => (
            <div
              key={index}
              className={`rounded-xl border ${config.borderColor} overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              <div className={`p-5 ${config.bgMedium}`}>
                <h3
                  className={`text-xl font-heading font-bold ${config.textColor}`}
                >
                  {factor.factor_name || "Unnamed Factor"}
                </h3>
              </div>
              <div className="p-5">
                <div className="text-gray-700 mb-5 leading-relaxed font-body">
                  {renderMarkdown(factor.analysis)}
                </div>

                {factor.key_indicators && factor.key_indicators.length > 0 && (
                  <div className="mt-5">
                    <h4 className="font-heading font-semibold text-gray-800 mb-3 flex items-center">
                      <Target className="w-4 h-4 mr-2" /> Key Indicators
                    </h4>
                    <ul
                      className={`list-none space-y-2.5 rounded-lg ${config.bgLight} p-4 font-body`}
                    >
                      {factor.key_indicators.map((indicator, idx) => (
                        <li key={idx} className="flex items-center gap-2.5">
                          <div
                            className={`h-2.5 w-2.5 rounded-full ${config.textColor.replace(
                              "text",
                              "bg"
                            )}`}
                          ></div>
                          <span className="text-gray-700">{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for Risks & Opportunities
const RisksOpportunitiesSection = ({ data, dimension }) => {
  const config = dimensionConfig[dimension] || dimensionConfig.Final;

  if (!data || (!data.risks && !data.opportunities)) {
    return null;
  }

  const risks = data.risks || [];
  const opportunities = data.opportunities || [];

  return (
    <Card
      className={`shadow-lg border ${config.borderColor} overflow-hidden mb-8 shadow-card`}
    >
      <CardHeader
        className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white p-6`}
      >
        <div className="flex items-center gap-3">
          <Image
            src={config.imageSrc}
            alt={dimension}
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <CardTitle className="font-heading tracking-tight text-xl font-bold">
            Risks & Opportunities
          </CardTitle>
        </div>
        <CardDescription className="text-white opacity-95 font-body mt-1">
          Key challenges and potential advantages
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risks Column */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-xl font-bold text-red-700 font-heading">Risks</h3>
            </div>

            {risks.length > 0 ? (
              <div className="space-y-4">
                {risks.map((risk, index) => {
                  const impactConfig = getPriorityConfig(risk.impact_level);

                  return (
                    <Card
                      key={index}
                      className="border border-red-200 bg-red-50 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-lg font-semibold text-gray-800 font-heading">
                          {risk.risk_title || "Unnamed Risk"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-4">
                        <p className="text-gray-700 mb-3 font-body">{risk.description}</p>
                        {risk.impact_level && (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2 font-special">
                              Impact:
                            </span>
                            <Badge
                              className={`${impactConfig.bgColor} ${impactConfig.textColor} border ${impactConfig.borderColor} font-semibold`}
                            >
                              {impactConfig.icon} {risk.impact_level}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic font-body">No risks identified.</p>
            )}
          </div>

          {/* Opportunities Column */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <Lightbulb className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-bold text-green-700 font-heading">
                Opportunities
              </h3>
            </div>

            {opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.map((opportunity, index) => {
                  const benefitConfig = getPriorityConfig(
                    opportunity.potential_benefit
                  );

                  return (
                    <Card
                      key={index}
                      className="border border-green-200 bg-green-50 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-lg font-semibold text-gray-800 font-heading">
                          {opportunity.opportunity_title ||
                            "Unnamed Opportunity"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-4">
                        <p className="text-gray-700 mb-3 font-body">
                          {opportunity.description}
                        </p>
                        {opportunity.potential_benefit && (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2 font-special">
                              Potential Benefit:
                            </span>
                            <Badge
                              className={`${benefitConfig.bgColor} ${benefitConfig.textColor} border ${benefitConfig.borderColor} font-semibold`}
                            >
                              {benefitConfig.icon}{" "}
                              {opportunity.potential_benefit}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic font-body">
                No opportunities identified.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for Regional Dynamics
const RegionalDynamicsSection = ({ regions, dimension }) => {
  const config = dimensionConfig[dimension] || dimensionConfig.Final;

  if (!regions || !Array.isArray(regions) || regions.length === 0) {
    return null;
  }

  return (
    <Card
      className={`shadow-lg border ${config.borderColor} overflow-hidden mb-8 shadow-card`}
    >
      <CardHeader
        className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white p-6`}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/regional_dynamics.png"
            alt="Regional Dynamics"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <CardTitle className="font-heading tracking-tight text-xl font-bold">
            Regional Dynamics
          </CardTitle>
        </div>
        <CardDescription className="text-white opacity-95 font-body mt-1">
          Analysis across different geographic regions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regions.map((region, index) => (
            <Card
              key={index}
              className={`border ${config.borderColor} shadow-sm`}
            >
              <CardHeader className={`${config.bgLight} pb-3`}>
                <CardTitle
                  className={`text-lg font-semibold ${config.textColor}`}
                >
                  {region.region}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-gray-700">{region.analysis}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for Scenario Analysis
const ScenarioAnalysisSection = ({ scenarios, dimension }) => {
  const config = dimensionConfig[dimension] || dimensionConfig.Final;

  if (!scenarios || !Array.isArray(scenarios) || scenarios.length === 0) {
    return null;
  }

  return (
    <Card
      className={`shadow-lg border ${config.borderColor} overflow-hidden mb-8 shadow-card`}
    >
      <CardHeader
        className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white p-6`}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/scenario_analysis.png"
            alt="Scenario Analysis"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <CardTitle className="font-heading tracking-tight text-xl font-bold">
            Scenario Analysis
          </CardTitle>
        </div>
        <CardDescription className="text-white opacity-95 font-body mt-1">
          Potential future scenarios and their impacts
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scenarios.map((scenario, index) => {
            const probabilityConfig = getPriorityConfig(scenario.probability);

            return (
              <Card
                key={index}
                className="border border-purple-200 bg-purple-50 shadow-sm"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    {scenario.scenario_name || "Unnamed Scenario"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold text-gray-800">
                        Drivers:
                      </span>
                      <p className="text-gray-700">{scenario.drivers}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-800">
                        Outcome:
                      </span>
                      <p className="text-gray-700">{scenario.outcome}</p>
                    </div>

                    {scenario.probability && (
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-600 mr-2">
                          Probability:
                        </span>
                        <Badge
                          className={`${probabilityConfig.bgColor} ${probabilityConfig.textColor} border ${probabilityConfig.borderColor}`}
                        >
                          {probabilityConfig.icon} {scenario.probability}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for Recommendations
const RecommendationsSection = ({ recommendations, dimension }) => {
  const config = dimensionConfig[dimension] || dimensionConfig.Final;

  if (
    !recommendations ||
    !Array.isArray(recommendations) ||
    recommendations.length === 0
  ) {
    return null;
  }

  return (
    <Card
      className={`shadow-lg border ${config.borderColor} overflow-hidden mb-8 shadow-card`}
    >
      <CardHeader
        className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white p-6`}
      >
        <div className="flex items-center gap-3">
          <Image
            src="/recommendation.png"
            alt="Recommendations"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <CardTitle className="font-heading tracking-tight text-xl font-bold">
            Recommendations
          </CardTitle>
        </div>
        <CardDescription className="text-white opacity-95 font-body mt-1">
          Strategic actions to address the {dimension.toLowerCase()} factors
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {recommendations.map((recommendation, index) => {
            const priorityConfig = getPriorityConfig(
              recommendation.priority || recommendation.implementation_priority
            );
            const title =
              recommendation.recommendation_title ||
              recommendation.recommendation ||
              "Unnamed Recommendation";

            return (
              <Card
                key={index}
                className={`border ${config.borderColor} shadow-md hover:shadow-lg transition-shadow duration-200`}
              >
                <CardHeader className={`${config.bgLight} pb-3`}>
                  <div className="flex items-center gap-3">
                    {recommendation.recommendation_number && (
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo}`}
                      >
                        {recommendation.recommendation_number}
                      </div>
                    )}
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Description */}
                  {(recommendation.description ||
                    recommendation.recommendation) && (
                    <div className="mb-4">
                      <p className="text-gray-700">
                        {recommendation.description ||
                          recommendation.recommendation}
                      </p>
                    </div>
                  )}

                  {/* Implementation Steps */}
                  {recommendation.implementation_steps &&
                    recommendation.implementation_steps.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-heading font-semibold text-gray-800 mb-2">
                          Implementation Steps
                        </h4>
                        <ol className="list-decimal ml-5 space-y-1">
                          {recommendation.implementation_steps.map(
                            (step, idx) => (
                              <li key={idx} className="text-gray-700">
                                {step}
                              </li>
                            )
                          )}
                        </ol>
                      </div>
                    )}

                  {/* Related Dimensions */}
                  {recommendation.related_dimensions &&
                    recommendation.related_dimensions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-heading font-semibold text-gray-800 mb-2">
                          Related Dimensions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.related_dimensions.map((dim, idx) => {
                            const dimConfig =
                              dimensionConfig[dim] || dimensionConfig.Final;
                            return (
                              <Badge
                                key={idx}
                                className={`${dimConfig.bgLight} ${dimConfig.textColor} border ${dimConfig.borderColor}`}
                              >
                                {dim}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Priority */}
                  {(recommendation.priority ||
                    recommendation.implementation_priority) && (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">
                        Priority:
                      </span>
                      <Badge
                        className={`${priorityConfig.bgColor} ${priorityConfig.textColor} border ${priorityConfig.borderColor}`}
                      >
                        {priorityConfig.icon}{" "}
                        {recommendation.priority ||
                          recommendation.implementation_priority}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for Strategic Implications
const StrategicImplicationsSection = ({ implications }) => {
  if (
    !implications ||
    !Array.isArray(implications) ||
    implications.length === 0
  ) {
    return null;
  }

  return (
    <Card className="shadow-lg border border-indigo-200 overflow-hidden mb-8">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6" />
          <CardTitle>Strategic Implications</CardTitle>
        </div>
        <CardDescription className="text-white opacity-90">
          Cross-dimensional strategic analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {implications.map((implication, index) => (
            <Card
              key={index}
              className="border border-indigo-200 shadow-sm bg-indigo-50"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {implication.implication_title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <p className="text-gray-700 mb-3">{implication.analysis}</p>

                {implication.affected_dimensions &&
                  implication.affected_dimensions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {implication.affected_dimensions.map((dim, idx) => {
                        const dimConfig =
                          dimensionConfig[dim] || dimensionConfig.Final;
                        return (
                          <Badge
                            key={idx}
                            className={`${dimConfig.bgLight} ${dimConfig.textColor} border ${dimConfig.borderColor}`}
                          >
                            {dim}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for Opportunities & Threats Matrix
const OpportunitiesThreatsMatrixSection = ({ matrix }) => {
  if (
    !matrix ||
    !matrix.dimensions ||
    !Array.isArray(matrix.dimensions) ||
    matrix.dimensions.length === 0
  ) {
    return null;
  }

  return (
    <Card className="shadow-lg border border-indigo-200 overflow-hidden mb-8">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6">
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6" />
          <CardTitle>Opportunities & Threats Matrix</CardTitle>
        </div>
        <CardDescription className="text-white opacity-90">
          Comprehensive view of challenges and potential advantages
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                  Dimension
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-green-700">
                  Opportunities
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-red-700">
                  Threats
                </th>
              </tr>
            </thead>
            <tbody>
              {matrix.dimensions.map((dim, index) => {
                const dimConfig =
                  dimensionConfig[dim.dimension] || dimensionConfig.Final;

                return (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td
                      className={`border border-gray-300 px-4 py-3 ${dimConfig.textColor} font-medium`}
                    >
                      <div className="flex items-center gap-2">
                        {dimConfig.icon}
                        {dim.dimension}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <ul className="list-disc ml-5 space-y-1">
                        {dim.opportunities.map((item, idx) => (
                          <li key={idx} className="text-gray-700">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <ul className="list-disc ml-5 space-y-1">
                        {dim.threats.map((item, idx) => (
                          <li key={idx} className="text-gray-700">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Main ReportDisplay Component
const ReportDisplay = ({ reportData: rawReportData, onBack, showReturnButton = true }) => {
  // Define the font style sheet inside the component
  const fontStyleSheet = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700&display=swap');

    :root {
      --font-heading: 'Sora', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
      --font-special: 'Manrope', sans-serif;
    }

    h1, h2, h3, h4, h5, h6, .font-heading {
      font-family: var(--font-heading);
      letter-spacing: -0.02em;
      font-weight: 600;
    }

    body, p, ul, ol, li, .font-body {
      font-family: var(--font-body);
      letter-spacing: -0.01em;
    }

    .card-title, .tab-title, .badge-text, .font-special {
      font-family: var(--font-special);
      font-weight: 600;
    }

    /* Enhanced typography */
    h1 {
      font-weight: 800 !important;
      letter-spacing: -0.03em !important;
    }

    h2 {
      font-weight: 700 !important;
    }
    
    h3 {
      font-weight: 600 !important;
    }
    
    .badge, button {
      font-family: var(--font-special) !important;
      font-weight: 600 !important;
    }
    
    .card-header h3 {
      font-weight: 700 !important;
    }
    
    /* Enhance card styling */
    .shadow-card {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
    
    .shadow-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
  `;

  // Parse the report data
  const { finalReport, individualReports, report, hasData } =
    parseReportData(rawReportData);

  // Define PESTEL order for proper sequence
  const pestelOrder = [
    "Political",
    "Economic",
    "Social",
    "Technological",
    "Environmental",
    "Legal",
  ];

  // Get dimension keys for tabs - exclude Final and sort by PESTEL order
  const dimensionKeys = Object.keys(dimensionConfig)
    .filter(
      (key) =>
        key !== "Final" && individualReports[`${key.toLowerCase()}_report`]
    )
    .sort((a, b) => {
      const indexA = pestelOrder.indexOf(a);
      const indexB = pestelOrder.indexOf(b);
      return indexA - indexB; // Sort according to PESTEL sequence
    });

  // Add Unified to dimension keys if report exists
  if (report) {
    dimensionKeys.unshift("Unified");
  }

  const [activeTab, setActiveTab] = useState(dimensionKeys[0] || "Unified");
  const [openSections, setOpenSections] = useState({});

  // Move the useEffect inside the component
  useEffect(() => {
    // Check if style already exists
    if (!document.getElementById("pestel-font-styles")) {
      const style = document.createElement("style");
      style.id = "pestel-font-styles";
      style.innerHTML = fontStyleSheet;
      document.head.appendChild(style);
    }

    return () => {
      // Clean up on unmount
      const styleElement = document.getElementById("pestel-font-styles");
      if (styleElement) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [fontStyleSheet]);

  // Toggle all sections
  const toggleAllSections = (value) => {
    const newOpenSections = {};
    Object.keys(openSections).forEach((key) => {
      newOpenSections[key] = value;
    });
    setOpenSections(newOpenSections);
  };

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <Card className="max-w-md w-full shadow-lg border border-red-200">
          <CardHeader className="bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-700 font-heading">
                No Report Data
              </CardTitle>
            </div>
          </CardHeader>{" "}
          <CardContent className="p-6">
            <p className="text-gray-700 mb-4 font-body">
              No analysis data is available. Please submit a form to generate a
              report.
            </p>
            <Button
              onClick={onBack}
              className="w-full font-heading font-medium text-black"
            >
              Return to Form
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render individual dimension report
  const renderDimensionReport = (dimension) => {
    const key = `${dimension.toLowerCase()}_report`;
    const report = individualReports[key];

    if (!report) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Card className="max-w-md w-full p-6 text-center">
            <CardContent>
              <p className="text-gray-500">
                No data available for {dimension} analysis.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Executive Summary */}
        {report.executive_summary && (
          <ExecutiveSummarySection
            data={report.executive_summary}
            dimension={dimension}
          />
        )}

        {/* Factors Analysis */}
        {report.factors_analysis && (
          <FactorsAnalysisSection
            factors={report.factors_analysis}
            dimension={dimension}
          />
        )}

        {/* Risks & Opportunities */}
        {report.risks_opportunities && (
          <RisksOpportunitiesSection
            data={report.risks_opportunities}
            dimension={dimension}
          />
        )}

        {/* Regional Dynamics */}
        {report.regional_dynamics && (
          <RegionalDynamicsSection
            regions={report.regional_dynamics}
            dimension={dimension}
          />
        )}

        {/* Scenario Analysis */}
        {report.scenario_analysis && (
          <ScenarioAnalysisSection
            scenarios={report.scenario_analysis}
            dimension={dimension}
          />
        )}

        {/* Recommendations */}
        {report.recommendations && (
          <RecommendationsSection
            recommendations={report.recommendations}
            dimension={dimension}
          />
        )}
      </div>
    );
  };

  // Render final report content - still used but not in tabs
  const renderFinalReport = () => {
    if (!finalReport) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Card className="max-w-md w-full p-6 text-center">
            <CardContent>
              <p className="text-gray-500">
                No consolidated report available. Please check individual
                dimension analyses.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Executive Summary */}
        {finalReport.executive_summary && (
          <ExecutiveSummarySection
            data={finalReport.executive_summary}
            dimension="Final"
          />
        )}

        {/* Introduction */}
        {finalReport.introduction && (
          <Card className="shadow-lg border border-indigo-200 overflow-hidden mb-8">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                <CardTitle>Introduction</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-indigo-50">
              {renderMarkdown(finalReport.introduction)}
            </CardContent>
          </Card>
        )}

        {/* PESTEL Analysis */}
        {finalReport.pestel_analysis && (
          <Card className="shadow-lg border border-indigo-200 overflow-hidden mb-8">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
              <div className="flex items-center gap-2">
                <PieChart className="w-6 h-6" />
                <CardTitle>PESTEL Analysis</CardTitle>
              </div>
              <CardDescription className="text-white opacity-90">
                Comprehensive analysis across all six dimensions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: "political_factors", label: "Political" },
                  { key: "economic_factors", label: "Economic" },
                  { key: "social_factors", label: "Social" },
                  { key: "technological_factors", label: "Technological" },
                  { key: "environmental_factors", label: "Environmental" },
                  { key: "legal_factors", label: "Legal" },
                ].map(({ key, label }) => {
                  const dimConfig = dimensionConfig[label];
                  const value = finalReport.pestel_analysis[key];

                  return (
                    <Card
                      key={key}
                      className={`border ${dimConfig.borderColor} shadow-sm hover:shadow-md transition-shadow duration-200`}
                    >
                      <CardHeader className={`${dimConfig.bgLight} pb-3`}>
                        <div className="flex items-center gap-2">
                          {dimConfig.icon}
                          <CardTitle
                            className={`text-lg ${dimConfig.textColor}`}
                          >
                            {label}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3">
                        {value ? (
                          <div className="text-gray-700">
                            {renderMarkdown(value)}
                          </div>
                        ) : (
                          <p className="text-gray-400 italic">
                            No data available.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategic Implications */}
        {finalReport.pestel_analysis?.strategic_implications && (
          <StrategicImplicationsSection
            implications={finalReport.pestel_analysis.strategic_implications}
          />
        )}

        {/* Opportunities & Threats Matrix */}
        {finalReport.pestel_analysis?.opportunities_threats_matrix && (
          <OpportunitiesThreatsMatrixSection
            matrix={finalReport.pestel_analysis.opportunities_threats_matrix}
          />
        )}

        {/* Strategic Recommendations */}
        {finalReport.strategic_recommendations && (
          <RecommendationsSection
            recommendations={finalReport.strategic_recommendations}
            dimension="Final"
          />
        )}

        {/* Conclusion */}
        {finalReport.conclusion && (
          <Card className="shadow-lg border border-indigo-200 overflow-hidden mb-8">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                <CardTitle>Conclusion</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-indigo-50">
              {renderMarkdown(finalReport.conclusion)}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Render unified report
  const renderUnifiedReport = () => {
    if (!report) return null;

    return (
      <div className="space-y-6">
        {/* Executive Summary */}
        {report.executive_summary && (
          <ExecutiveSummarySection
            data={report.executive_summary}
            dimension="Final"
          />
        )}

        {/* Introduction */}
        {report.introduction && (
          <Card className="shadow-lg border border-indigo-200 overflow-hidden mb-8">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                <CardTitle>Introduction</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-indigo-50">
              {renderMarkdown(report.introduction)}
            </CardContent>
          </Card>
        )}

        {/* PESTEL Analysis */}
        {report.pestel_analysis && (
          <Card className="shadow-lg border border-indigo-200 overflow-hidden mb-8">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
              <div className="flex items-center gap-2">
                <PieChart className="w-6 h-6" />
                <CardTitle>PESTEL Analysis</CardTitle>
              </div>
              <CardDescription className="text-white opacity-90">
                Comprehensive analysis across all six dimensions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: "political_factors", label: "Political" },
                  { key: "economic_factors", label: "Economic" },
                  { key: "social_factors", label: "Social" },
                  { key: "technological_factors", label: "Technological" },
                  { key: "environmental_factors", label: "Environmental" },
                  { key: "legal_factors", label: "Legal" },
                ].map(({ key, label }) => {
                  const dimConfig = dimensionConfig[label];
                  const value = report.pestel_analysis[key];

                  return (
                    <Card
                      key={key}
                      className={`border ${dimConfig.borderColor} shadow-sm hover:shadow-md transition-shadow duration-200`}
                    >
                      <CardHeader className={`${dimConfig.bgLight} pb-3`}>
                        <div className="flex items-center gap-2">
                          {dimConfig.icon}
                          <CardTitle
                            className={`text-lg ${dimConfig.textColor}`}
                          >
                            {label}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3">
                        {value ? (
                          <div className="text-gray-700">
                            {renderMarkdown(value)}
                          </div>
                        ) : (
                          <p className="text-gray-400 italic">
                            No data available.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strategic Implications */}
        {report.strategic_implications && (
          <StrategicImplicationsSection
            implications={report.strategic_implications}
          />
        )}

        {/* Opportunities & Threats Matrix */}
        {report.opportunities_threats_matrix && (
          <OpportunitiesThreatsMatrixSection
            matrix={report.opportunities_threats_matrix}
          />
        )}

        {/* Strategic Recommendations */}
        {report.strategic_recommendations && (
          <RecommendationsSection
            recommendations={report.strategic_recommendations}
            dimension="Final"
          />
        )}

        {/* Conclusion */}
        {report.conclusion && (
          <Card className="shadow-lg border border-indigo-200 overflow-hidden mb-8">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                <CardTitle>Conclusion</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-indigo-50">
              {renderMarkdown(report.conclusion)}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {showReturnButton && (
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center gap-2 mb-4 md:mb-0 font-heading text-black hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Form</span>
            </Button>
          </div>
          <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded-xl shadow-xl p-8 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 transform rotate-45 translate-x-[-50%] translate-y-[-25%]"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4 tracking-tight leading-tight">
                PESTEL Analysis Report
              </h1>
              <p className="text-lg md:text-xl opacity-95 font-body leading-relaxed">
                Comprehensive market analysis for strategic decision-making
              </p>
              <div className="flex items-center gap-2 mt-5">
                <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm font-medium font-body">
                  Analysis completed on {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </header>
      )}

      {!showReturnButton && (
        <header className="mb-8">
          <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded-xl shadow-xl p-8 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 transform rotate-45 translate-x-[-50%] translate-y-[-25%]"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4 tracking-tight leading-tight">
                PESTEL Analysis Report
              </h1>
              <p className="text-lg md:text-xl opacity-95 font-body leading-relaxed">
                Comprehensive market analysis for strategic decision-making
              </p>
              <div className="flex items-center gap-2 mt-5">
                <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm font-medium font-body">
                  Analysis completed on {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </header>
      )}

      <main>
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="bg-white rounded-lg shadow-md p-1.5 mb-8 overflow-x-auto border border-gray-100">
            <TabsList className="w-full justify-start gap-1">
              {/* Unified tab first if it exists */}
              {report && (
                <TabsTrigger
                  value="Unified"
                  className="flex items-center gap-1.5 font-special font-semibold py-2.5 px-4"
                >
                  <Image
                    src="/summary.png"
                    alt="PESTEL Analysis"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  <span>PESTEL Analysis</span>
                </TabsTrigger>
              )}

              {/* Sort and render dimension tabs in PESTEL order */}
              {dimensionKeys
                .filter((key) => key !== "Unified") // Exclude Unified from sorted tabs
                .map((dimension) => {
                  const key = `${dimension.toLowerCase()}_report`;
                  const dimConfig = dimensionConfig[dimension];

                  return (
                    <TabsTrigger
                      key={key}
                      value={dimension}
                      className="flex items-center gap-1.5 font-special font-semibold py-2.5 px-4"
                    >
                      <Image
                        src={`/${dimension.toLowerCase()}.png`}
                        alt={dimension}
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                      <span>{dimension}</span>
                    </TabsTrigger>
                  );
                })}
            </TabsList>
          </div>

          {/* Content will now be shown based on the tab selection */}
          {report && (
            <TabsContent value="Unified" className="mt-0">
              {renderUnifiedReport()}
            </TabsContent>
          )}

          {/* Individual Dimension Tabs */}
          {Object.entries(individualReports).map(([key, value]) => {
            const match = key.match(/^(\w+)_report$/);
            if (!match) return null;

            const dimension =
              match[1].charAt(0).toUpperCase() + match[1].slice(1);
            if (!dimensionConfig[dimension] || dimension === "Final")
              return null;

            return (
              <TabsContent key={key} value={dimension} className="mt-0">
                {renderDimensionReport(dimension)}
              </TabsContent>
            );
          })}
        </Tabs>

        {/* If finalReport exists but there's no unified report, render it below */}
        {finalReport && !report && renderFinalReport()}
      </main>

      <footer className="text-center text-gray-500 text-sm py-8 font-body mt-12 border-t border-gray-100 pt-8">
        <p>
          © {new Date().getFullYear()} PESTEL Analysis Tool - All rights
          reserved
        </p>
      </footer>
    </div>
  );
};

export default ReportDisplay;
