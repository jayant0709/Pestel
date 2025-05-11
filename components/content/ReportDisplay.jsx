import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    conclusion: false
  });

  // Parse the report data to determine available sections
  const parseReportContent = () => {
    // Get the final report content
    const finalReport = reportData?.report || '';
    const individualReports = reportData?.individual_reports || {};
    
    // Check which sections are available
    const hasSection = {
      political: individualReports.hasOwnProperty('political_report'),
      economic: individualReports.hasOwnProperty('economic_report'),
      social: individualReports.hasOwnProperty('social_report'),
      technological: individualReports.hasOwnProperty('technological_report'),
      environmental: individualReports.hasOwnProperty('environmental_report'),
      legal: individualReports.hasOwnProperty('legal_report'),
    };

    // Check if final report exists (should always be there if any report was generated)
    const hasFinalReport = finalReport.length > 0;
    
    return {
      finalReport,
      individualReports,
      hasSection,
      hasFinalReport
    };
  };

  const { finalReport, individualReports, hasSection, hasFinalReport } = parseReportContent();

  const toggleSection = (section) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderSectionHeader = (title, sectionKey) => (
    <div 
      className="flex items-center justify-between cursor-pointer p-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl"
      onClick={() => toggleSection(sectionKey)}
    >
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className={`flex items-center justify-center h-8 w-8 rounded-full bg-white/20 transition-transform duration-300 ${
        sections[sectionKey] ? 'rotate-180' : ''
      }`}>
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
    
    content.split('\n').forEach(line => {
      if (line.startsWith('# ')) {
        // This is a main header - we'll ignore it as we're showing the section headers elsewhere
        return;
      } else if (line.startsWith('## ')) {
        // This is a section header - close any open list before proceeding
        if (inList && listItems.length > 0) {
          currentSection.content.push(
            <ul className="list-disc my-3 ml-5 text-gray-900" key={`ul-${currentSection.content.length}`}>
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        
        if (currentSection.content.length > 0 || currentSection.title) {
          sections.push({...currentSection});
        }
        currentSection = {
          title: line.substring(3).trim(),
          content: []
        };
      } else if (line.startsWith('### ')) {
        // Close any open list before adding a subheader
        if (inList && listItems.length > 0) {
          currentSection.content.push(
            <ul className="list-disc my-3 ml-5 text-gray-900" key={`ul-${currentSection.content.length}`}>
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        
        // This is a subsection header
        currentSection.content.push(
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3" key={`h3-${currentSection.content.length}`}>
            {line.substring(4).trim()}
          </h3>
        );
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        // This is a bullet point
        inList = true;
        listItems.push(
          <li className="my-1 text-gray-900" key={`li-${listItems.length}`}>{line.substring(2).trim()}</li>
        );
      } else if (line.trim().match(/^\d+\.\s/)) {
        // This is a numbered list item
        inList = true;
        const text = line.trim().replace(/^\d+\.\s/, '');
        listItems.push(
          <li className="my-1 text-gray-900 list-decimal" key={`li-${listItems.length}`}>{text}</li>
        );
      } else if (line.trim() === '') {
        // This is an empty line - close any open list
        if (inList && listItems.length > 0) {
          currentSection.content.push(
            <ul className="list-disc my-3 ml-5 text-gray-900" key={`ul-${currentSection.content.length}`}>
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        
        // Add a paragraph break if there's content
        if (currentSection.content.length > 0) {
          currentSection.content.push(<div className="my-2" key={`br-${currentSection.content.length}`} />);
        }
      } else {
        // Close any open list before adding regular text
        if (inList && listItems.length > 0) {
          currentSection.content.push(
            <ul className="list-disc my-3 ml-5 text-gray-900" key={`ul-${currentSection.content.length}`}>
              {listItems}
            </ul>
          );
          listItems = [];
          inList = false;
        }
        
        // This is regular text
        currentSection.content.push(
          <p className="my-2 text-gray-900" key={`p-${currentSection.content.length}`}>{line}</p>
        );
      }
    });
    
    // Add any remaining list items
    if (inList && listItems.length > 0) {
      currentSection.content.push(
        <ul className="list-disc my-3 ml-5 text-gray-900" key={`ul-${currentSection.content.length}`}>
          {listItems}
        </ul>
      );
    }
    
    // Add the last section
    if (currentSection.content.length > 0 || currentSection.title) {
      sections.push({...currentSection});
    }
    
    // Return the rendered sections
    return sections.map((section, index) => (
      <div key={index} className="mb-8">
        {section.title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">{section.title}</h2>
        )}
        <div>{section.content}</div>
      </div>
    ));
  };

  // Helper function to extract and render opportunities and threats matrix
  const renderOpportunitiesThreatsMatrix = (content) => {
    if (!content) return null;
    
    // Check if the content contains a table-like structure
    if (content.includes('| Dimension |') && content.includes('| Opportunities |') && content.includes('| Threats |')) {
      // Extract table rows from the content
      const tableSection = content.split('| Dimension |')[1];
      const rows = tableSection.split('\n')
        .filter(line => line.trim().startsWith('|') && line.includes('|'))
        .filter(line => !line.includes('|-')); // Skip divider rows
    
      // Extract dimensions and their opportunities and threats
      const tableData = rows.map(row => {
        const columns = row.split('|').map(col => col.trim()).filter(Boolean);
        if (columns.length >= 3) {
          return {
            dimension: columns[0],
            opportunities: columns[1],
            threats: columns[2]
          };
        }
        return null;
      }).filter(Boolean);
    
      return (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full divide-y divide-gray-300 shadow-lg border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                <th className="px-6 py-4 text-left text-base font-semibold text-gray-800 uppercase tracking-wider border-b-2 border-gray-300 w-1/5">
                  Dimension
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-green-800 uppercase tracking-wider border-b-2 border-gray-300">
                  Opportunities
                </th>
                <th className="px-6 py-4 text-left text-base font-semibold text-red-800 uppercase tracking-wider border-b-2 border-gray-300">
                  Threats
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                    {row.dimension}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 border-r border-gray-200">
                    {row.opportunities.split(';').map((item, i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        • {item.trim()}
                      </p>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {row.threats.split(';').map((item, i) => (
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
    
    return null;
  };

  // If we don't have a final report, show a message
  if (!hasFinalReport) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-xl w-full">
          <h2 className="text-xl font-semibold text-red-700 mb-3">No Report Generated</h2>
          <p className="text-gray-700 mb-4">
            No PESTEL analysis report was generated. This could be because no factors were selected or there was an error during processing.
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

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">PESTEL Analysis Report</h1>
        <Button 
          onClick={onBack} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Return to Form
        </Button>
      </div>
      
      {/* Title */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
          <h1 className="text-3xl font-bold text-white text-center">COMPREHENSIVE PESTEL ANALYSIS</h1>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {renderSectionHeader("Executive Summary", "executiveSummary")}
        
        <div className={`transition-all duration-300 overflow-hidden ${
          sections.executiveSummary ? 'max-h-[2000px]' : 'max-h-0'
        }`}>
          <div className="p-6">
            {renderMarkdown(finalReport.split('## Executive Summary')[1]?.split('##')[0])}
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {renderSectionHeader("Introduction", "introduction")}
        
        <div className={`transition-all duration-300 overflow-hidden ${
          sections.introduction ? 'max-h-[2000px]' : 'max-h-0'
        }`}>
          <div className="p-6">
            {renderMarkdown(finalReport.split('## Introduction')[1]?.split('##')[0])}
          </div>
        </div>
      </div>

      {/* PESTEL Analysis */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {renderSectionHeader("PESTEL Analysis", "pestelAnalysis")}
      </div>

      {/* Political Factors */}
      {hasSection.political && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-8">
          {renderSectionHeader("Political Factors", "political")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.political ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                {renderMarkdown(individualReports.political_report)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Economic Factors */}
      {hasSection.economic && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-8">
          {renderSectionHeader("Economic Factors", "economic")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.economic ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                {renderMarkdown(individualReports.economic_report)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Factors */}
      {hasSection.social && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-8">
          {renderSectionHeader("Social Factors", "social")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.social ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <div className="bg-pink-50 p-4 rounded-lg shadow-sm">
                {renderMarkdown(individualReports.social_report)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technological Factors */}
      {hasSection.technological && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-8">
          {renderSectionHeader("Technological Factors", "technological")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.technological ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <div className="bg-cyan-50 p-4 rounded-lg shadow-sm">
                {renderMarkdown(individualReports.technological_report)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environmental Factors */}
      {hasSection.environmental && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-8">
          {renderSectionHeader("Environmental Factors", "environmental")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.environmental ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <div className="bg-teal-50 p-4 rounded-lg shadow-sm">
                {renderMarkdown(individualReports.environmental_report)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legal Factors */}
      {hasSection.legal && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-8">
          {renderSectionHeader("Legal Factors", "legal")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.legal ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <div className="bg-amber-50 p-4 rounded-lg shadow-sm text-gray-900">
                {renderMarkdown(individualReports.legal_report)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Implications */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {renderSectionHeader("Strategic Implications", "strategicImplications")}
        
        <div className={`transition-all duration-300 overflow-hidden ${
          sections.strategicImplications ? 'max-h-[3000px]' : 'max-h-0'
        }`}>
          <div className="p-6 bg-gradient-to-b from-white to-indigo-50">
            {renderMarkdown(finalReport.split('## Strategic Implications')[1]?.split('##')[0])}
          </div>
        </div>
      </div>

      {/* Opportunities & Threats Matrix */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {renderSectionHeader("Opportunities & Threats Matrix", "opportunitiesThreats")}
        
        <div className={`transition-all duration-300 overflow-hidden ${
          sections.opportunitiesThreats ? 'max-h-[3000px]' : 'max-h-0'
        }`}>
          <div className="p-6 text-gray-900">
            {finalReport.includes('Opportunities & Threats Matrix') && (
              <div>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  The following matrix summarizes the key opportunities and threats identified across the PESTEL dimensions:
                </p>
                
                {renderOpportunitiesThreatsMatrix(finalReport.split('## Opportunities & Threats Matrix')[1]?.split('##')[0])}
                
                {!finalReport.includes('| Dimension |') && renderMarkdown(finalReport.split('## Opportunities & Threats Matrix')[1]?.split('##')[0])}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {renderSectionHeader("Strategic Recommendations", "recommendations")}
        
        <div className={`transition-all duration-300 overflow-hidden ${
          sections.recommendations ? 'max-h-[5000px]' : 'max-h-0'
        }`}>
          <div className="p-6 bg-gradient-to-b from-white to-cyan-50">
            {renderMarkdown(finalReport.split('## Strategic Recommendations')[1]?.split('##')[0])}
          </div>
        </div>
      </div>

      {/* Conclusion */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {renderSectionHeader("Conclusion", "conclusion")}
        
        <div className={`transition-all duration-300 overflow-hidden ${
          sections.conclusion ? 'max-h-[2000px]' : 'max-h-0'
        }`}>
          <div className="p-6 bg-gradient-to-b from-white to-purple-50">
            {renderMarkdown(finalReport.split('## Conclusion')[1])}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDisplay;
