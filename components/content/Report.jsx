import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Report = ({ reportData, onBack }) => {
  const processContent = (content) => {
    if (!content) return [];

    const sections = [];
    let currentSection = null;
    let sectionNumber = 0;

    // Improved regex to handle various section headers
    const sectionRegex = /^(?:##?\s*(\d+\.?\s*)?(.+))/i;
    const insightRegex = /Actionable\s*Insight:/i;

    // Split content into lines and process
    const lines = content.split('\n').filter(line => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for Introduction or Conclusion
      if (line.toLowerCase() === '**introduction**') {
        sections.push({
          type: 'introduction',
          title: 'Introduction',
          content: []
        });
        currentSection = sections[sections.length - 1];
        continue;
      }

      if (line.toLowerCase() === '**conclusion**') {
        if (currentSection) {
          currentSection.content = currentSection.content.join('\n').trim();
        }
        sections.push({
          type: 'conclusion',
          title: 'Conclusion',
          content: []
        });
        currentSection = sections[sections.length - 1];
        continue;
      }

      // Check for section headers
      const sectionMatch = line.match(sectionRegex);
      if (sectionMatch) {
        if (currentSection) {
          currentSection.content = currentSection.content.join('\n').trim();
        }
        sectionNumber++;
        sections.push({
          type: 'section',
          number: sectionNumber,
          title: sectionMatch[2].trim(),
          content: []
        });
        currentSection = sections[sections.length - 1];
        continue;
      }

      // If we have a current section, add the line to its content
      if (currentSection) {
        // Skip numeric lines that don't contain content
        if (!/^(\*\*\d+\*\*)?$/.test(line)) {
          currentSection.content.push(line);
        }
      }
    }

    // Process the last section
    if (currentSection) {
      currentSection.content = currentSection.content.join('\n').trim();
    }

    return sections;
  };

  const formatContent = (content) => {
    // Split content by Actionable Insight and create formatted sections
    const parts = content.split(/Actionable\s*Insight:/i);
    return parts.map((part, index) => {
      if (index === 0) return part.trim();
      return (
        <div key={index} className="mt-4 bg-blue-50 p-4 rounded-lg">
          <span className="font-semibold text-blue-700">Actionable Insight: </span>
          {part.trim()}
        </div>
      );
    });
  };

  const renderContent = () => {
    if (!reportData?.message) {
      return <div className="text-center text-slate-500">No analysis data available</div>;
    }

    const sections = processContent(reportData.message);

    return (
      <div className="space-y-6">
        {sections.map((section, index) => {
          if (section.type === 'introduction') {
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Introduction</h2>
                <Separator className="my-4" />
                <div className="text-slate-600 leading-relaxed">
                  {section.content}
                </div>
              </div>
            );
          }

          if (section.type === 'conclusion') {
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Conclusion</h2>
                <Separator className="my-4" />
                <div className="text-slate-600 leading-relaxed">
                  {section.content}
                </div>
              </div>
            );
          }

          return (
            <Accordion key={index} type="single" collapsible className="w-full">
              <AccordionItem value={`section-${index}`} className="border rounded-lg bg-white">
                <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {section.number}
                    </span>
                    <h3 className="text-xl font-semibold text-slate-800">
                      {section.title}
                    </h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4">
                  <div className="space-y-4 ml-12">
                    {formatContent(section.content)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="w-full h-full mx-auto max-w-4xl shadow-lg border-2">
      <CardHeader className="space-y-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg sticky top-0 z-10 p-6">
        <div className="flex items-center justify-between">
          <Button 
            onClick={onBack}
            className="bg-white hover:bg-slate-100 text-slate-700 border shadow-sm"
          >
            ← Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-slate-600">Analysis Complete</span>
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
          Political Analysis Report
        </CardTitle>
        <Separator className="bg-slate-200" />
      </CardHeader>

      <CardContent className="p-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default Report;