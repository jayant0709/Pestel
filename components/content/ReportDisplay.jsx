import React, { useState } from "react";
import {
  ChevronDown,
  ArrowLeft,
  Tag,
  BookOpen,
  AlertTriangle,
  ExternalLink,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ReportDisplay = ({ reportData, onBack }) => {
  const [sections, setSections] = useState({
    executiveSummary: true,
    introduction: false,
    pestelAnalysis: false,
    political: false,
    economic: false,
    social: false,
    technological: false,
    environmental: false,
    legal: false,
    strategicImplications: false,
    opportunitiesThreats: false,
    recommendations: false,
    conclusion: false,
  });

  // Parse the report data to determine available sections
  const parseReportContent = () => {
    // Get the final report content
    const finalReport = reportData?.report || "";
    const individualReports = reportData?.individual_reports || {};

    // Check which sections are available
    const hasSection = {
      political: individualReports.hasOwnProperty("political_report"),
      economic: individualReports.hasOwnProperty("economic_report"),
      social: individualReports.hasOwnProperty("social_report"),
      technological: individualReports.hasOwnProperty("technological_report"),
      environmental: individualReports.hasOwnProperty("environmental_report"),
      legal: individualReports.hasOwnProperty("legal_report"),
    };

    // Check if final report exists (should always be there if any report was generated)
    const hasFinalReport = finalReport.length > 0;

    return {
      finalReport,
      individualReports,
      hasSection,
      hasFinalReport,
    };
  };

  const { finalReport, individualReports, hasSection, hasFinalReport } =
    parseReportContent();

  const toggleSection = (section) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleAllSections = (value) => {
    const newState = {};
    Object.keys(sections).forEach((key) => {
      newState[key] = value;
    });
    setSections(newState);
  };
  const renderSectionHeader = (
    title,
    sectionKey,
    badgeColor = null,
    badgeText = null
  ) => (
    <div
      className="flex items-center justify-between cursor-pointer p-5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-xl transition-all hover:from-gray-800 hover:to-gray-700"
      onClick={() => toggleSection(sectionKey)}
    >
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {badgeColor && (
          <Badge
            className="text-white"
            style={{
              backgroundColor: `var(--${badgeColor}-500, #4299E1)`,
            }}
          >
            {badgeText || title}
          </Badge>
        )}
      </div>
      <div
        className={`flex items-center justify-center h-8 w-8 rounded-full bg-white/20 transition-transform duration-300 ${
          sections[sectionKey] ? "rotate-180" : ""
        }`}
      >
        <ChevronDown className="w-5 h-5 text-white" />
      </div>
    </div>
  );

  // Helper function to render Markdown content as HTML
  const renderMarkdown = (content) => {
    if (!content) return null;

    // Split the content into sections based on markdown headers
    const sections = [];
    let currentSection = { title: null, content: [] };
    let inList = false;
    let listItems = [];

    content.split("\n").forEach((line) => {
      if (line.startsWith("# ")) {
        // This is a main header - we'll ignore it as we're showing the section headers elsewhere
        return;
      } else if (line.startsWith("## ")) {
        // This is a section header - close any open list before proceeding
        if (inList && listItems.length > 0) {
          currentSection.content.push(
            <ul
              className="list-disc my-3 ml-5 text-gray-900"
              key={`ul-${currentSection.content.length}`}
            >
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }

        if (currentSection.content.length > 0 || currentSection.title) {
          sections.push({ ...currentSection });
        }
        currentSection = {
          title: line.substring(3).trim(),
          content: [],
        };
      } else if (line.startsWith("### ")) {
        // Close any open list before adding a subheader
        if (inList && listItems.length > 0) {
          currentSection.content.push(
            <ul
              className="list-disc my-3 ml-5 text-gray-900"
              key={`ul-${currentSection.content.length}`}
            >
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }

        // This is a subsection header
        currentSection.content.push(
          <h3
            className="text-xl font-semibold text-gray-900 mt-6 mb-3"
            key={`h3-${currentSection.content.length}`}
          >
            {line.substring(4).trim()}
          </h3>
        );
      } else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        // This is a bullet point
        inList = true;
        listItems.push(
          <li className="my-1 text-gray-900" key={`li-${listItems.length}`}>
            {line.substring(2).trim()}
          </li>
        );
      } else if (line.trim().match(/^\d+\.\s/)) {
        // This is a numbered list item
        inList = true;
        const text = line.trim().replace(/^\d+\.\s/, "");
        listItems.push(
          <li
            className="my-1 text-gray-900 list-decimal"
            key={`li-${listItems.length}`}
          >
            {text}
          </li>
        );
      } else if (line.trim() === "") {
        // This is an empty line - close any open list
        if (inList && listItems.length > 0) {
          currentSection.content.push(
            <ul
              className="list-disc my-3 ml-5 text-gray-900"
              key={`ul-${currentSection.content.length}`}
            >
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }

        // Add a paragraph break if there's content
        if (currentSection.content.length > 0) {
          currentSection.content.push(
            <div className="my-2" key={`br-${currentSection.content.length}`} />
          );
        }
      } else {
        // Close any open list before adding regular text
        if (inList && listItems.length > 0) {
          currentSection.content.push(
            <ul
              className="list-disc my-3 ml-5 text-gray-900"
              key={`ul-${currentSection.content.length}`}
            >
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }

        // This is regular text
        currentSection.content.push(
          <p
            className="my-2 text-gray-900"
            key={`p-${currentSection.content.length}`}
          >
            {line}
          </p>
        );
      }
    });

    // Add any remaining list items
    if (inList && listItems.length > 0) {
      currentSection.content.push(
        <ul
          className="list-disc my-3 ml-5 text-gray-900"
          key={`ul-${currentSection.content.length}`}
        >
          {listItems}
        </ul>
      );
    }

    // Add the last section
    if (currentSection.content.length > 0 || currentSection.title) {
      sections.push({ ...currentSection });
    }

    // Return the rendered sections
    return sections.map((section, index) => (
      <div key={index} className="mb-8">
        {section.title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
            {section.title}
          </h2>
        )}
        <div>{section.content}</div>
      </div>
    ));
  }; // Helper function to extract and render opportunities and threats matrix
  const renderOpportunitiesThreatsMatrix = (content) => {
    if (!content) return null;

    try {
      // Extract content by removing spaces and checking for the specific matrix format
      const lines = content.split("\n");

      // Check if content matches the format in the screenshot
      if (
        content.includes("| Opportunities |") &&
        content.includes("| Threats |")
      ) {
        // Find all opportunity and threat lines with numbered items
        const opportunities = [];
        const threats = [];

        // This approach handles the exact format shown in the screenshot
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          // Look for lines that contain opportunity and threat content
          if (
            line.includes("| 1.") ||
            line.includes("| 2.") ||
            line.includes("| 3.") ||
            line.includes("| 4.") ||
            line.includes("| 5.")
          ) {
            // Split the line by pipe character
            const parts = line
              .split("|")
              .map((part) => part.trim())
              .filter(Boolean);

            if (parts.length >= 2) {
              // First part is opportunity, second part is threat
              if (parts[0].match(/^\d+\./)) {
                opportunities.push(parts[0]);
              }
              if (parts[1].match(/^\d+\./)) {
                threats.push(parts[1]);
              }
            }
          }
        }
        // Clean up the data but keep the numbering format
        const cleanOpportunities = opportunities.map((item) => item.trim());
        const cleanThreats = threats.map((item) => item.trim());

        // Return the beautifully styled matrix
        return (
          <div className="overflow-hidden mt-6 rounded-xl bg-gradient-to-b from-white to-gray-50 shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-y divide-gray-200">
              {/* Headers */}
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/20 rounded-full">
                    <Tag size={20} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-800">
                    Opportunities
                  </h3>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-amber-50 to-amber-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/20 rounded-full">
                    <AlertTriangle size={20} className="text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-amber-800">Threats</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-4 bg-white">
                {" "}
                <ul className="space-y-4">
                  {cleanOpportunities.map((item, index) => {
                    // Split the item into number and content (e.g., "1. Text" -> ["1", "Text"])
                    const match = item.match(/^(\d+)\.(.*)$/);
                    if (match) {
                      const [_, number, content] = match;
                      return (
                        <li
                          key={`opp-${index}`}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-700 font-semibold text-sm">
                              {number}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">
                              {content.trim()}
                            </p>
                          </div>
                        </li>
                      );
                    }
                    // Fallback for items that don't match the expected format
                    return (
                      <li key={`opp-${index}`} className="flex items-start">
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{item}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="p-6 pt-4 bg-white">
                {" "}
                <ul className="space-y-4">
                  {cleanThreats.map((item, index) => {
                    // Split the item into number and content (e.g., "1. Text" -> ["1", "Text"])
                    const match = item.match(/^(\d+)\.(.*)$/);
                    if (match) {
                      const [_, number, content] = match;
                      return (
                        <li
                          key={`threat-${index}`}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-amber-700 font-semibold text-sm">
                              {number}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">
                              {content.trim()}
                            </p>
                          </div>
                        </li>
                      );
                    }
                    // Fallback for items that don't match the expected format
                    return (
                      <li key={`threat-${index}`} className="flex items-start">
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{item}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      }

      // Original format handling (with Dimension column)
      else if (content.includes("| Dimension |")) {
        // Extract table rows from the content
        const tableSection = content.split("| Dimension |")[1];
        const rows = tableSection
          .split("\n")
          .filter((line) => line.trim().startsWith("|") && line.includes("|"))
          .filter((line) => !line.includes("|-")); // Skip divider rows

        // Extract dimensions and their opportunities and threats
        const tableData = rows
          .map((row) => {
            const columns = row
              .split("|")
              .map((col) => col.trim())
              .filter(Boolean);
            if (columns.length >= 3) {
              return {
                dimension: columns[0],
                opportunities: columns[1],
                threats: columns[2],
              };
            }
            return null;
          })
          .filter(Boolean);

        return (
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full divide-y divide-gray-300 shadow-lg border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-800 uppercase tracking-wider border-b-2 border-gray-300 w-1/5">
                    Dimension
                  </th>
                  <th className="px-6 py-4 text-left text-base font-semibold text-emerald-800 uppercase tracking-wider border-b-2 border-gray-300">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-emerald-600" />
                      Opportunities
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-base font-semibold text-amber-800 uppercase tracking-wider border-b-2 border-gray-300">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-600" />
                      Threats
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((row, index) => (
                  <tr
                    key={index}
                    className={
                      index % 2 === 0
                        ? "bg-white hover:bg-gray-50"
                        : "bg-gray-50 hover:bg-gray-100"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                      {row.dimension}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 border-r border-gray-200">
                      {row.opportunities.split(";").map((item, i) => (
                        <p key={i} className="mb-2 last:mb-0">
                          • {item.trim()}
                        </p>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {row.threats.split(";").map((item, i) => (
                        <p key={i} className="mb-2 last:mb-0">
                          • {item.trim()}
                        </p>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    } catch (error) {
      console.error("Error rendering opportunities and threats matrix:", error);
    }

    return null;
  };

  // If we don't have a final report, show a message
  if (!hasFinalReport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-xl w-full">
          <h2 className="text-xl font-semibold text-red-700 mb-3">
            No Report Generated
          </h2>
          <p className="text-gray-700 mb-4">
            No PESTEL analysis report was generated. This could be because no
            factors were selected or there was an error during processing.
          </p>
          <Button
            onClick={onBack}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Return to Form
          </Button>
        </div>
      </div>
    );
  }
  const sectionColorMap = {
    political: "blue",
    economic: "green",
    social: "pink",
    technological: "cyan",
    environmental: "teal",
    legal: "amber",
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      <header className="pt-4 pb-3">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Top navigation bar with shadow and stronger blur */}
          <div className="bg-white/95 backdrop-blur-md shadow-md rounded-lg p-3 mb-2">
            <div className="flex justify-between items-center">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft size={16} />
                <span className="text-gray-700">Return to Form</span>
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => toggleAllSections(true)}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
                >
                  <Plus size={14} />{" "}
                  <span className="text-gray-700">Expand All</span>
                </Button>
                <Button
                  onClick={() => toggleAllSections(false)}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
                >
                  <Minus size={14} />{" "}
                  <span className="text-gray-700">Collapse All</span>
                </Button>
                <Button
                  onClick={() => window.print()}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
                >
                  <ExternalLink size={14} />{" "}
                  <span className="text-gray-700">Export</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Title bar with different styling */}
          <div className="bg-white/95 backdrop-blur-md shadow-md rounded-lg p-3">
            <h1 className="text-3xl font-bold text-gray-900">
              PESTEL Analysis Report
            </h1>
          </div>
        </div>
      </header>
      {/* Title */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 bg-gradient-to-r from-gray-900 to-gray-800">
          <h1 className="text-4xl font-bold text-white text-center">
            COMPREHENSIVE PESTEL ANALYSIS
          </h1>
          <p className="text-gray-300 text-center mt-2">
            {reportData?.business_name ? `${reportData.business_name} - ` : ""}
            {reportData?.industry ? `${reportData.industry} Industry` : ""}
            {reportData?.geographical_focus
              ? ` - ${reportData.geographical_focus}`
              : ""}
          </p>
        </div>{" "}
      </div>{" "}
      {/* Report Navigation */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-4 mb-6 hidden md:block">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={16} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Report Navigation
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
          {Object.keys(sections).map((sectionKey) => {
            if (sectionKey === "pestelAnalysis") return null;
            const isFactorSection = [
              "political",
              "economic",
              "social",
              "technological",
              "environmental",
              "legal",
            ].includes(sectionKey);
            if (isFactorSection && !hasSection[sectionKey]) return null;
            const sectionTitle =
              sectionKey.charAt(0).toUpperCase() +
              sectionKey.slice(1).replace(/([A-Z])/g, " $1");
            const color = isFactorSection
              ? sectionColorMap[sectionKey]
              : "gray";

            return (
              <Button
                key={sectionKey}
                variant="outline"
                className="justify-start text-sm border-gray-200 hover:bg-gray-50"
                style={{
                  color: isFactorSection
                    ? `var(--${color}-600, #718096)`
                    : "#718096",
                  borderColor: isFactorSection
                    ? `var(--${color}-200, #E2E8F0)`
                    : "#E2E8F0",
                }}
                onClick={() => {
                  toggleSection(sectionKey);
                  // Scroll to the section with standard offset
                  const element = document.getElementById(sectionKey);
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              >
                {sectionTitle}
              </Button>
            );
          })}
        </div>
      </div>
      {/* Executive Summary */}
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
        id="executiveSummary"
      >
        {renderSectionHeader("Executive Summary", "executiveSummary")}

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            sections.executiveSummary
              ? "max-h-[2000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 bg-gradient-to-b from-white to-gray-50">
            {renderMarkdown(
              finalReport.split("## Executive Summary")[1]?.split("##")[0]
            )}
          </div>
        </div>
      </div>
      {/* Introduction */}
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
        id="introduction"
      >
        {renderSectionHeader("Introduction", "introduction")}

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            sections.introduction
              ? "max-h-[2000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 bg-gradient-to-b from-white to-gray-50">
            {renderMarkdown(
              finalReport.split("## Introduction")[1]?.split("##")[0]
            )}
          </div>
        </div>
      </div>
      {/* PESTEL Analysis */}
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
        id="pestelAnalysis"
      >
        {renderSectionHeader("PESTEL Analysis", "pestelAnalysis")}

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            sections.pestelAnalysis
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              The PESTEL analysis examines the external factors affecting BMW in
              the Indian market over the next 1-2 years. These factors provide
              both challenges and opportunities that will shape BMW's strategic
              decisions.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {Object.entries(hasSection).map(([key, value]) => {
                if (!value) return null;
                const title = key.charAt(0).toUpperCase() + key.slice(1);
                const color = sectionColorMap[key];

                return (
                  <Button
                    key={key}
                    className="border hover:bg-gray-100"
                    style={{
                      backgroundColor: `var(--${color}-100, #F7FAFC)`,
                      color: `var(--${color}-800, #2D3748)`,
                      borderColor: `var(--${color}-200, #EDF2F7)`,
                    }}
                    onClick={() => {
                      toggleSection(key);
                      // Scroll to the section with standard offset
                      const element = document.getElementById(key);
                      if (element) {
                        element.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    {title} Factors
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Political Factors */}
      {hasSection.political && (
        <div
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          id="political"
        >
          {renderSectionHeader("Political Factors", "political", "blue", "P")}

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              sections.political
                ? "max-h-[5000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6">
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100">
                {renderMarkdown(individualReports.political_report)}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Economic Factors */}
      {hasSection.economic && (
        <div
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          id="economic"
        >
          {renderSectionHeader("Economic Factors", "economic", "green", "E")}

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              sections.economic
                ? "max-h-[5000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6">
              <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100">
                {renderMarkdown(individualReports.economic_report)}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Social Factors */}
      {hasSection.social && (
        <div
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          id="social"
        >
          {renderSectionHeader("Social Factors", "social", "pink", "S")}

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              sections.social
                ? "max-h-[5000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6">
              <div className="bg-pink-50 p-6 rounded-lg shadow-sm border border-pink-100">
                {renderMarkdown(individualReports.social_report)}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Technological Factors */}
      {hasSection.technological && (
        <div
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          id="technological"
        >
          {renderSectionHeader(
            "Technological Factors",
            "technological",
            "cyan",
            "T"
          )}

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              sections.technological
                ? "max-h-[5000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6">
              <div className="bg-cyan-50 p-6 rounded-lg shadow-sm border border-cyan-100">
                {renderMarkdown(individualReports.technological_report)}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Environmental Factors */}
      {hasSection.environmental && (
        <div
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          id="environmental"
        >
          {renderSectionHeader(
            "Environmental Factors",
            "environmental",
            "teal",
            "E"
          )}

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              sections.environmental
                ? "max-h-[5000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6">
              <div className="bg-teal-50 p-6 rounded-lg shadow-sm border border-teal-100">
                {renderMarkdown(individualReports.environmental_report)}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Legal Factors */}
      {hasSection.legal && (
        <div
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          id="legal"
        >
          {renderSectionHeader("Legal Factors", "legal", "amber", "L")}

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              sections.legal
                ? "max-h-[5000px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6">
              <div className="bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-100 text-gray-900">
                {renderMarkdown(individualReports.legal_report)}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Strategic Implications */}
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
        id="strategicImplications"
      >
        {renderSectionHeader("Strategic Implications", "strategicImplications")}

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            sections.strategicImplications
              ? "max-h-[3000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 bg-gradient-to-b from-white to-indigo-50">
            {renderMarkdown(
              finalReport.split("## Strategic Implications")[1]?.split("##")[0]
            )}
          </div>
        </div>
      </div>
      {/* Opportunities & Threats Matrix */}
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
        id="opportunitiesThreats"
      >
        {renderSectionHeader(
          "Opportunities & Threats Matrix",
          "opportunitiesThreats"
        )}

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            sections.opportunitiesThreats
              ? "max-h-[3000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 text-gray-900">
            {finalReport.includes("Opportunities & Threats Matrix") && (
              <div>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  The following matrix summarizes the key opportunities and
                  threats identified across the PESTEL dimensions:
                </p>

                {renderOpportunitiesThreatsMatrix(
                  finalReport
                    .split("## Opportunities & Threats Matrix")[1]
                    ?.split("##")[0]
                )}

                {!finalReport.includes("| Dimension |") &&
                  renderMarkdown(
                    finalReport
                      .split("## Opportunities & Threats Matrix")[1]
                      ?.split("##")[0]
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Strategic Recommendations */}
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
        id="recommendations"
      >
        {renderSectionHeader("Strategic Recommendations", "recommendations")}

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            sections.recommendations
              ? "max-h-[5000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 bg-gradient-to-b from-white to-cyan-50">
            {renderMarkdown(
              finalReport
                .split("## Strategic Recommendations")[1]
                ?.split("##")[0]
            )}
          </div>
        </div>
      </div>
      {/* Conclusion */}
      <div
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
        id="conclusion"
      >
        {renderSectionHeader("Conclusion", "conclusion")}

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            sections.conclusion
              ? "max-h-[2000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-6 bg-gradient-to-b from-white to-purple-50">
            {renderMarkdown(finalReport.split("## Conclusion")[1])}
          </div>
        </div>
      </div>
      <footer className="mt-10 text-center text-gray-500 text-sm pb-10">
        <p>PESTEL Analysis generated on {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

export default ReportDisplay;
