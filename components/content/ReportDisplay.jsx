import React, { useState } from "react";
import {
  ChevronDown,
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const sectionColorMap = {
  Political: "blue",
  Economic: "green",
  Social: "pink",
  Technological: "cyan",
  Environmental: "teal",
  Legal: "amber",
};

const getPriorityColor = (priority) => {
  if (!priority) return "var(--gray-500, #718096)";
  const p = priority.toLowerCase();
  if (p.includes("immediate") || p.includes("critical"))
    return "var(--red-600, #E53E3E)";
  if (p === "high" || p === "transformative")
    return "var(--orange-600, #F59E42)";
  if (p === "medium") return "var(--amber-600, #D97706)";
  if (p === "low") return "var(--blue-600, #3182CE)";
  if (p.includes("long-term")) return "var(--purple-600, #805AD5)";
  return "var(--gray-600, #4A5568)";
};

const renderMarkdown = (content) => {
  if (!content) return null;
  // Simple markdown: headers, paragraphs, lists
  return content.split(/\n{2,}/).map((block, i) => {
    if (block.startsWith("### "))
      return (
        <h3 key={i} className="text-xl font-semibold mt-4 mb-2">
          {block.replace("### ", "")}
        </h3>
      );
    if (block.startsWith("## "))
      return (
        <h2 key={i} className="text-2xl font-bold mt-6 mb-3">
          {block.replace("## ", "")}
        </h2>
      );
    if (block.startsWith("- "))
      return (
        <ul key={i} className="list-disc ml-6 mb-2">
          {block.split("\n").map((li, j) => (
            <li key={j}>{li.replace("- ", "")}</li>
          ))}
        </ul>
      );
    if (block.match(/^\d+\. /))
      return (
        <ol key={i} className="list-decimal ml-6 mb-2">
          {block.split("\n").map((li, j) => (
            <li key={j}>{li.replace(/^\d+\. /, "")}</li>
          ))}
        </ol>
      );
    return (
      <p key={i} className="mb-2">
        {block}
      </p>
    );
  });
};

const Section = ({
  title,
  sectionKey,
  openSections,
  setOpenSections,
  children,
  badgeColor,
  badgeText,
}) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-visible mb-6">
    <div
      className="flex items-center justify-between cursor-pointer p-5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-xl hover:from-gray-800 hover:to-gray-700"
      onClick={() =>
        setOpenSections((prev) => ({
          ...prev,
          [sectionKey]: !prev[sectionKey],
        }))
      }
    >
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
        {badgeColor && (
          <Badge
            className="text-gray-900"
            style={{ backgroundColor: `var(--${badgeColor}-100, #E5F4FB)` }}
          >
            {badgeText || title}
          </Badge>
        )}
      </div>
      <div
        className={`flex items-center justify-center h-8 w-8 rounded-full bg-white/20 transition-transform duration-300 ${
          openSections[sectionKey] ? "rotate-180" : ""
        }`}
      >
        <ChevronDown className="w-5 h-5 text-gray-100" />
      </div>
    </div>
    <div
      className={`transition-all duration-500 ease-in-out ${
        openSections[sectionKey]
          ? "opacity-100"
          : "max-h-0 opacity-0 overflow-hidden"
      }`}
    >
      <div className="p-6 bg-gradient-to-b from-white to-gray-50 text-gray-900">
        {children}
      </div>
    </div>
  </div>
);

const parseReportData = (rawData) => {
  if (!rawData || typeof rawData !== "object") return {};
  // If final_report exists, parse it
  if (rawData.final_report) {
    try {
      return JSON.parse(rawData.final_report);
    } catch (e) {
      // fallback: already parsed?
      return rawData.final_report;
    }
  }
  // Otherwise, check for individual_reports
  if (
    rawData.individual_reports &&
    typeof rawData.individual_reports === "object"
  ) {
    // Find the first non-empty report
    for (const key of Object.keys(rawData.individual_reports)) {
      const val = rawData.individual_reports[key];
      if (typeof val === "string" && val.trim().length > 0) {
        try {
          return JSON.parse(val);
        } catch (e) {
          // fallback: already parsed?
          return val;
        }
      }
    }
  }
  // fallback: maybe already parsed
  return rawData;
};

// Helper: PESTEL keys and labels
const PESTEL_KEYS = [
  { key: "political_report", label: "Political" },
  { key: "economic_report", label: "Economic" },
  { key: "social_report", label: "Social" },
  { key: "technological_report", label: "Technological" },
  { key: "environmental_report", label: "Environmental" },
  { key: "legal_report", label: "Legal" },
];

const ReportDisplay = ({ reportData: rawReportData, onBack }) => {
  // Parse the report data if needed
  const reportData = parseReportData(rawReportData);
  // Determine if this is a final report (has strategic sections)
  const isFinal = !!rawReportData.final_report;
  const pestelSectionKeys = PESTEL_KEYS.map(({ key }) => `pestel_${key}`);
  const [openSections, setOpenSections] = useState(() => {
    // Default: all closed except Political open
    const base = {
      executive_summary: true,
      introduction: false,
      pestel_analysis: false,
      strategic_implications: false,
      opportunities_threats_matrix: false,
      strategic_recommendations: false,
      conclusion: false,
      // For single-dimension (legacy)
      factors_analysis: false,
      risks_opportunities: false,
      regional_dynamics: false,
      scenario_analysis: false,
      recommendations: false,
    };
    pestelSectionKeys.forEach((k, i) => {
      base[k] = i === 0; // Only first (Political) open by default
    });
    return base;
  });

  const toggleAll = (val) => {
    setOpenSections((prev) => {
      const keys = Object.keys(prev);
      // Also include all PESTEL dropdowns
      pestelSectionKeys.forEach((k) => {
        if (!keys.includes(k)) keys.push(k);
      });
      return Object.fromEntries(keys.map((k) => [k, val]));
    });
  };

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-xl w-full">
          <h2 className="text-xl font-semibold text-red-700 mb-3">
            No Report Data
          </h2>
          <Button
            onClick={onBack}
            className="bg-blue-400 hover:bg-blue-500 text-white"
          >
            Return to Form
          </Button>
        </div>
      </div>
    );
  }

  // At the top of ReportDisplay (inside the component, before return):
  let unifiedReportDropdownsTop = null;
  let unifiedReportDropdownsRest = null;
  if (!isFinal && rawReportData.report) {
    let unifiedReport = null;
    try {
      unifiedReport =
        typeof rawReportData.report === "string"
          ? JSON.parse(rawReportData.report)
          : rawReportData.report;
    } catch (e) {
      unifiedReport = rawReportData.report;
    }
    if (unifiedReport) {
      unifiedReportDropdownsTop = (
        <>
          {unifiedReport.executive_summary && (
            <Section
              title="Executive Summary"
              sectionKey="unified_executive_summary"
              openSections={openSections}
              setOpenSections={setOpenSections}
            >
              {renderMarkdown(unifiedReport.executive_summary)}
            </Section>
          )}
          {unifiedReport.introduction && (
            <Section
              title="Introduction"
              sectionKey="unified_introduction"
              openSections={openSections}
              setOpenSections={setOpenSections}
            >
              {renderMarkdown(unifiedReport.introduction)}
            </Section>
          )}
          {unifiedReport.pestel_analysis && (
            <Section
              title="PESTEL Analysis"
              sectionKey="unified_pestel_analysis"
              openSections={openSections}
              setOpenSections={setOpenSections}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/*
                  { key: "political_factors", label: "Political" },
                  { key: "economic_factors", label: "Economic" },
                  { key: "social_factors", label: "Social" },
                  { key: "technological_factors", label: "Technological" },
                  { key: "environmental_factors", label: "Environmental" },
                  { key: "legal_factors", label: "Legal" }
                */}
                {[
                  { key: "political_factors", label: "Political" },
                  { key: "economic_factors", label: "Economic" },
                  { key: "social_factors", label: "Social" },
                  { key: "technological_factors", label: "Technological" },
                  { key: "environmental_factors", label: "Environmental" },
                  { key: "legal_factors", label: "Legal" },
                ].map(({ key, label }) => {
                  const value = unifiedReport.pestel_analysis[key];
                  return (
                    <div
                      key={key}
                      className={`bg-${
                        sectionColorMap[label] || "gray"
                      }-50 rounded-lg p-4 border`}
                    >
                      <h3 className="text-lg font-bold mb-2 text-gray-800">
                        {label}
                      </h3>
                      {value ? (
                        renderMarkdown(value)
                      ) : (
                        <span className="text-gray-400">
                          No data for {label}.
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </>
      );
      unifiedReportDropdownsRest = (
        <>
          {Array.isArray(unifiedReport.strategic_implications) &&
            unifiedReport.strategic_implications.length > 0 && (
              <Section
                title="Strategic Implications"
                sectionKey="unified_strategic_implications"
                openSections={openSections}
                setOpenSections={setOpenSections}
              >
                {unifiedReport.strategic_implications.map((imp, idx) => (
                  <div key={idx} className="mb-6">
                    <h3 className="text-lg font-bold mb-1 text-gray-800">
                      {imp.implication_title}
                    </h3>
                    {renderMarkdown(imp.analysis)}
                    {imp.affected_dimensions && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {imp.affected_dimensions.map((dim, i) => (
                          <Badge key={i} className="bg-blue-700 text-white">
                            {dim}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </Section>
            )}
          {unifiedReport.opportunities_threats_matrix &&
            Array.isArray(
              unifiedReport.opportunities_threats_matrix.dimensions
            ) &&
            unifiedReport.opportunities_threats_matrix.dimensions.length >
              0 && (
              <Section
                title="Opportunities & Threats Matrix"
                sectionKey="unified_opportunities_threats_matrix"
                openSections={openSections}
                setOpenSections={setOpenSections}
              >
                <div className="overflow-x-auto mt-2">
                  <table className="min-w-full divide-y divide-gray-300 shadow-lg border border-gray-300 rounded-lg">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                        <th className="px-6 py-4 text-left text-base font-semibold text-gray-800 uppercase tracking-wider border-b-2 border-gray-300 w-1/5">
                          Dimension
                        </th>
                        <th className="px-6 py-4 text-left text-base font-semibold text-emerald-800 uppercase tracking-wider border-b-2 border-gray-300">
                          Opportunities
                        </th>
                        <th className="px-6 py-4 text-left text-base font-semibold text-amber-800 uppercase tracking-wider border-b-2 border-gray-300">
                          Threats
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unifiedReport.opportunities_threats_matrix.dimensions.map(
                        (dim, idx) => (
                          <tr
                            key={idx}
                            className={
                              idx % 2 === 0
                                ? "bg-white hover:bg-gray-50"
                                : "bg-gray-50 hover:bg-gray-100"
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                              {dim.dimension}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 border-r border-gray-200">
                              {dim.opportunities.map((item, i) => (
                                <p key={i} className="mb-2 last:mb-0">
                                  • {item.trim()}
                                </p>
                              ))}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {dim.threats.map((item, i) => (
                                <p key={i} className="mb-2 last:mb-0">
                                  • {item.trim()}
                                </p>
                              ))}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}
          {Array.isArray(unifiedReport.strategic_recommendations) &&
            unifiedReport.strategic_recommendations.length > 0 && (
              <Section
                title="Strategic Recommendations"
                sectionKey="unified_strategic_recommendations"
                openSections={openSections}
                setOpenSections={setOpenSections}
              >
                {unifiedReport.strategic_recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-white rounded-lg shadow-md border border-cyan-100 mb-4"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold">
                        {rec.recommendation_number}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {rec.recommendation}
                      </h3>
                    </div>
                    {rec.related_dimensions && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {rec.related_dimensions.map((dim, i) => (
                          <Badge key={i} className="bg-blue-700 text-white">
                            {dim}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {rec.implementation_priority && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-gray-600">Priority:</span>
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: getPriorityColor(
                              rec.implementation_priority
                            ),
                            color: "white",
                          }}
                        >
                          {rec.implementation_priority}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </Section>
            )}
          {unifiedReport.conclusion && (
            <Section
              title="Conclusion"
              sectionKey="unified_conclusion"
              openSections={openSections}
              setOpenSections={setOpenSections}
            >
              {renderMarkdown(unifiedReport.conclusion)}
            </Section>
          )}
        </>
      );
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <header className="pt-4 pb-3">
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            <span>Return to Form</span>
          </Button>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => toggleAll(true)}
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
            >
              <Plus size={14} /> Expand All
            </Button>
            <Button
              onClick={() => toggleAll(false)}
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
            >
              <Minus size={14} /> Collapse All
            </Button>
            <Button
              onClick={() => window.print()}
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
            >
              <ExternalLink size={14} /> Export
            </Button>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-md shadow-md rounded-lg p-3">
          <h1 className="text-3xl font-bold text-gray-900">
            PESTEL Analysis Report
          </h1>
        </div>
      </header>
      {/* FINAL REPORT SCHEMA */}
      {isFinal && (
        <>
          <Section
            title="Executive Summary"
            sectionKey="executive_summary"
            openSections={openSections}
            setOpenSections={setOpenSections}
          >
            {renderMarkdown(reportData.executive_summary)}
          </Section>
          <Section
            title="Introduction"
            sectionKey="introduction"
            openSections={openSections}
            setOpenSections={setOpenSections}
          >
            {renderMarkdown(reportData.introduction)}
          </Section>
          <Section
            title="PESTEL Analysis"
            sectionKey="pestel_analysis"
            openSections={openSections}
            setOpenSections={setOpenSections}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: "political_factors", label: "Political" },
                { key: "economic_factors", label: "Economic" },
                { key: "social_factors", label: "Social" },
                { key: "technological_factors", label: "Technological" },
                { key: "environmental_factors", label: "Environmental" },
                { key: "legal_factors", label: "Legal" },
              ].map(({ key, label }) => {
                const value =
                  reportData.pestel_analysis && reportData.pestel_analysis[key];
                return (
                  <div
                    key={key}
                    className={`bg-${
                      sectionColorMap[label] || "gray"
                    }-50 rounded-lg p-4 border`}
                  >
                    <h3 className="text-lg font-bold mb-2 text-gray-800">
                      {label}
                    </h3>
                    {value ? (
                      renderMarkdown(value)
                    ) : (
                      <span className="text-gray-400">
                        No data for {label}.
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
          <Section
            title="Strategic Implications"
            sectionKey="strategic_implications"
            openSections={openSections}
            setOpenSections={setOpenSections}
          >
            {reportData.strategic_implications.map((imp, idx) => (
              <div key={idx} className="mb-6">
                <h3 className="text-lg font-bold mb-1 text-gray-800">
                  {imp.implication_title}
                </h3>
                {renderMarkdown(imp.analysis)}
                {imp.affected_dimensions && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imp.affected_dimensions.map((dim, i) => (
                      <Badge key={i} className="bg-blue-700 text-white">
                        {dim}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Section>
          <Section
            title="Opportunities & Threats Matrix"
            sectionKey="opportunities_threats_matrix"
            openSections={openSections}
            setOpenSections={setOpenSections}
          >
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full divide-y divide-gray-300 shadow-lg border border-gray-300 rounded-lg">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <th className="px-6 py-4 text-left text-base font-semibold text-gray-800 uppercase tracking-wider border-b-2 border-gray-300 w-1/5">
                      Dimension
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold text-emerald-800 uppercase tracking-wider border-b-2 border-gray-300">
                      Opportunities
                    </th>
                    <th className="px-6 py-4 text-left text-base font-semibold text-amber-800 uppercase tracking-wider border-b-2 border-gray-300">
                      Threats
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.opportunities_threats_matrix.dimensions.map(
                    (dim, idx) => (
                      <tr
                        key={idx}
                        className={
                          idx % 2 === 0
                            ? "bg-white hover:bg-gray-50"
                            : "bg-gray-50 hover:bg-gray-100"
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                          {dim.dimension}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 border-r border-gray-200">
                          {dim.opportunities.map((item, i) => (
                            <p key={i} className="mb-2 last:mb-0">
                              • {item.trim()}
                            </p>
                          ))}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {dim.threats.map((item, i) => (
                            <p key={i} className="mb-2 last:mb-0">
                              • {item.trim()}
                            </p>
                          ))}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </Section>
          <Section
            title="Strategic Recommendations"
            sectionKey="strategic_recommendations"
            openSections={openSections}
            setOpenSections={setOpenSections}
          >
            {reportData.strategic_recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-5 bg-white rounded-lg shadow-md border border-cyan-100 mb-4"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold">
                    {rec.recommendation_number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {rec.recommendation}
                  </h3>
                </div>
                {rec.related_dimensions && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {rec.related_dimensions.map((dim, i) => (
                      <Badge key={i} className="bg-blue-700 text-white">
                        {dim}
                      </Badge>
                    ))}
                  </div>
                )}
                {rec.implementation_priority && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-gray-600">Priority:</span>
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: getPriorityColor(
                          rec.implementation_priority
                        ),
                        color: "white",
                      }}
                    >
                      {rec.implementation_priority}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </Section>
          <Section
            title="Conclusion"
            sectionKey="conclusion"
            openSections={openSections}
            setOpenSections={setOpenSections}
          >
            {renderMarkdown(reportData.conclusion)}
          </Section>
        </>
      )}
      {/* CROSS-DIMENSIONAL UNIFIED REPORT (top 3 sections) */}
      {!isFinal && rawReportData.report && unifiedReportDropdownsTop}
      {/* INDIVIDUAL REPORT SCHEMA (6 PESTEL dropdowns) */}
      {!isFinal && rawReportData.individual_reports && (
        <>
          {PESTEL_KEYS.map(({ key, label }) => {
            const reportStr = rawReportData.individual_reports[key];
            let report = null;
            try {
              report = reportStr ? JSON.parse(reportStr) : null;
            } catch (e) {
              report = reportStr || null;
            }
            if (!report) return null;
            return (
              <Section
                key={key}
                title={`${label} Analysis`}
                sectionKey={`pestel_${key}`}
                openSections={openSections}
                setOpenSections={setOpenSections}
                // badgeColor and badgeText removed
              >
                {/* Executive Summary */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800">
                    Executive Summary
                  </h3>
                  {renderMarkdown(report.executive_summary) || (
                    <div className="text-gray-500">
                      No executive summary available.
                    </div>
                  )}
                </div>
                {/* Factors Analysis */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800">
                    Factors Analysis
                  </h3>
                  {Array.isArray(report.factors_analysis) &&
                  report.factors_analysis.length > 0 ? (
                    report.factors_analysis.map((factor, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4"
                      >
                        <h4 className="font-semibold mb-1">
                          {factor.factor_name || (
                            <span className="text-gray-400">
                              No factor name
                            </span>
                          )}
                        </h4>
                        <div className="mb-2">
                          {renderMarkdown(factor.analysis) || (
                            <span className="text-gray-400">No analysis</span>
                          )}
                        </div>
                        {Array.isArray(factor.key_indicators) &&
                        factor.key_indicators.length > 0 ? (
                          <div className="mt-2">
                            <span className="font-semibold text-gray-700">
                              Key Indicators:
                            </span>
                            <ul className="list-disc ml-6">
                              {factor.key_indicators.map((ind, i) => (
                                <li key={i}>{ind}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            No key indicators.
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">
                      No factors analysis available.
                    </div>
                  )}
                </div>
                {/* Risks & Opportunities */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-800">
                    Risks & Opportunities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-red-700 mb-2">Risks</h4>
                      {report.risks_opportunities &&
                      Array.isArray(report.risks_opportunities.risks) &&
                      report.risks_opportunities.risks.length > 0 ? (
                        <ul className="space-y-2">
                          {report.risks_opportunities.risks.map((risk, i) => (
                            <li
                              key={i}
                              className="bg-red-50 rounded p-3 border border-red-100"
                            >
                              <div className="font-semibold text-gray-800">
                                {risk.risk_title || (
                                  <span className="text-gray-400">
                                    No title
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-700 text-sm mb-1">
                                {risk.description || (
                                  <span className="text-gray-400">
                                    No description
                                  </span>
                                )}
                              </div>
                              {risk.impact_level && (
                                <Badge
                                  style={{
                                    backgroundColor: getPriorityColor(
                                      risk.impact_level
                                    ),
                                    color: "white",
                                  }}
                                >
                                  {risk.impact_level}
                                </Badge>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-gray-500">No risks listed.</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-green-700 mb-2">
                        Opportunities
                      </h4>
                      {report.risks_opportunities &&
                      Array.isArray(report.risks_opportunities.opportunities) &&
                      report.risks_opportunities.opportunities.length > 0 ? (
                        <ul className="space-y-2">
                          {report.risks_opportunities.opportunities.map(
                            (op, i) => (
                              <li
                                key={i}
                                className="bg-green-50 rounded p-3 border border-green-100"
                              >
                                <div className="font-semibold text-gray-800">
                                  {op.opportunity_title || (
                                    <span className="text-gray-400">
                                      No title
                                    </span>
                                  )}
                                </div>
                                <div className="text-gray-700 text-sm mb-1">
                                  {op.description || (
                                    <span className="text-gray-400">
                                      No description
                                    </span>
                                  )}
                                </div>
                                {op.potential_benefit && (
                                  <Badge
                                    style={{
                                      backgroundColor: getPriorityColor(
                                        op.potential_benefit
                                      ),
                                      color: "white",
                                    }}
                                  >
                                    {op.potential_benefit}
                                  </Badge>
                                )}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <div className="text-gray-500">
                          No opportunities listed.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Scenario Analysis */}
                {Array.isArray(report.scenario_analysis) &&
                  report.scenario_analysis.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-2 text-gray-800">
                        Scenario Analysis
                      </h3>
                      {report.scenario_analysis.map((sc, idx) => (
                        <div
                          key={idx}
                          className="bg-purple-50 rounded p-3 border border-purple-100 mb-3"
                        >
                          <div className="font-bold text-purple-800">
                            {sc.scenario_name || (
                              <span className="text-gray-400">
                                No scenario name
                              </span>
                            )}
                          </div>
                          <div className="text-gray-800 mb-1">
                            <span className="font-semibold">Drivers:</span>{" "}
                            {sc.drivers || (
                              <span className="text-gray-400">No drivers</span>
                            )}
                          </div>
                          <div className="text-gray-800 mb-1">
                            <span className="font-semibold">Outcome:</span>{" "}
                            {sc.outcome || (
                              <span className="text-gray-400">No outcome</span>
                            )}
                          </div>
                          {sc.probability && (
                            <Badge
                              style={{
                                backgroundColor: getPriorityColor(
                                  sc.probability
                                ),
                                color: "white",
                              }}
                            >
                              {sc.probability}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                {/* Recommendations */}
                <div className="mb-2">
                  <h3 className="text-lg font-bold mb-2 text-gray-800">
                    Recommendations
                  </h3>
                  {Array.isArray(report.recommendations) &&
                  report.recommendations.length > 0 ? (
                    report.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="bg-cyan-50 rounded p-4 border border-cyan-100 mb-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-cyan-800">
                            {rec.recommendation_title || (
                              <span className="text-gray-400">No title</span>
                            )}
                          </span>
                          {rec.priority && (
                            <Badge
                              style={{
                                backgroundColor: getPriorityColor(rec.priority),
                                color: "white",
                              }}
                            >
                              {rec.priority}
                            </Badge>
                          )}
                        </div>
                        <div className="text-gray-800 mb-2">
                          {rec.description || (
                            <span className="text-gray-400">
                              No description
                            </span>
                          )}
                        </div>
                        {Array.isArray(rec.implementation_steps) &&
                        rec.implementation_steps.length > 0 ? (
                          <div className="mb-2">
                            <span className="font-semibold text-gray-700">
                              Implementation Steps:
                            </span>
                            <ul className="list-decimal ml-6">
                              {rec.implementation_steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            No implementation steps.
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">
                      No recommendations available.
                    </div>
                  )}
                </div>
              </Section>
            );
          })}
        </>
      )}
      {/* CROSS-DIMENSIONAL UNIFIED REPORT (rest of sections) */}
      {!isFinal && rawReportData.report && unifiedReportDropdownsRest}
      <footer className="mt-10 text-center text-gray-500 text-sm pb-10">
        <p>PESTEL Analysis generated on {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

export default ReportDisplay;
