import React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ChatWindow from "@/components/chat/ChatWindow";
import { ChevronDown } from "lucide-react";

const Report = ({ reportData, onBack }) => {
  const { data: session } = useSession();
  const [hasBeenSaved, setHasBeenSaved] = React.useState(false);

  const saveReport = async () => {
    if (!session?.user?.email || !reportData?.message || hasBeenSaved) return;

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          content: reportData.message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save report");
      }
      setHasBeenSaved(true);
    } catch (error) {
      console.error("Error saving report:", error);
    }
  };

  React.useEffect(() => {
    if (reportData?.message && !hasBeenSaved) {
      saveReport();
    }
  }, [reportData?.message]);

  const processContent = (content) => {
    if (!content) return [];

    const sections = [];
    let currentSection = null;
    let sectionNumber = 0;

    // Improved regex to handle various section headers
    const sectionRegex = /^(?:##?\s*(\d+\.?\s*)?(.+))/i;
    const insightRegex = /Actionable\s*Insight:/i;

    // Split content into lines and process
    const lines = content.split("\n").filter((line) => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for Introduction or Conclusion
      if (line.toLowerCase() === "**introduction**") {
        sections.push({
          type: "introduction",
          title: "Introduction",
          content: [],
        });
        currentSection = sections[sections.length - 1];
        continue;
      }

      if (line.toLowerCase() === "**conclusion**") {
        if (currentSection) {
          currentSection.content = currentSection.content.join("\n").trim();
        }
        sections.push({
          type: "conclusion",
          title: "Conclusion",
          content: [],
        });
        currentSection = sections[sections.length - 1];
        continue;
      }

      // Check for section headers
      const sectionMatch = line.match(sectionRegex);
      if (sectionMatch) {
        if (currentSection) {
          currentSection.content = currentSection.content.join("\n").trim();
        }
        sectionNumber++;
        sections.push({
          type: "section",
          number: sectionNumber,
          title: sectionMatch[2].trim(),
          content: [],
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
      currentSection.content = currentSection.content.join("\n").trim();
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
          <span className="font-semibold text-blue-700">
            Actionable Insight:{" "}
          </span>
          {part.trim()}
        </div>
      );
    });
  };

  return (
    <>
      <Card className="w-full h-full mx-auto max-w-4xl shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl sticky top-0 z-10 p-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              className="bg-white/90 hover:bg-white text-indigo-700 border shadow-sm hover:shadow-md transition-all duration-200"
            >
              ← Back
            </Button>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
              <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm font-medium text-white">
                Analysis Complete
              </span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-white">
            Political Analysis Report
          </CardTitle>
          <Separator className="bg-white/30" />
        </CardHeader>

        <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          {!reportData?.message ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <path d="M9.5 4h5L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2.5-3z"></path>
                  <circle cx="12" cy="13" r="3"></circle>
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-500">
                No analysis data available
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Submit a form to generate a report
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {processContent(reportData.message).map((section, index) => {
                if (section.type === "introduction") {
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-2 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
                          Introduction
                        </h2>
                      </div>
                      <Separator className="my-4 bg-indigo-100" />
                      <div className="text-gray-700 leading-relaxed">
                        {section.content}
                      </div>
                    </div>
                  );
                }

                if (section.type === "conclusion") {
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-2 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
                          Conclusion
                        </h2>
                      </div>
                      <Separator className="my-4 bg-indigo-100" />
                      <div className="text-gray-700 leading-relaxed">
                        {section.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <Accordion
                    key={index}
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    <AccordionItem
                      value={`section-${index}`}
                      className="border rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:bg-indigo-50 transition-all [&[data-state=open]>div>div:last-child]:rotate-180">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                            <span className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                              {section.number}
                            </span>
                            <h3 className="text-xl font-semibold text-gray-800">
                              {section.title}
                            </h3>
                          </div>
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-50 transition-transform duration-300">
                            <ChevronDown className="w-5 h-5 text-indigo-600" />
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 py-4">
                        <div className="space-y-4 ml-14">
                          {formatContent(section.content)}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <ChatWindow reportData={reportData} />
    </>
  );
};

export default Report;
