import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertTriangle } from "lucide-react";
import ChatWindow from "@/components/chat/ChatWindow";
import ReportDisplay from "@/components/content/ReportDisplay";

const Report = ({ reportData, onBack }) => {
  const { data: session } = useSession();
  const [hasBeenSaved, setHasBeenSaved] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [parsedData, setParsedData] = useState(null);

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
      setError("Failed to save your report. Please try again later.");
    }
  };

  // Parse and prepare data from the response
  useEffect(() => {
    if (reportData?.message) {
      try {
        setIsLoading(true);
        // Check if message is a JSON string and parse it
        let parsedContent;
        if (typeof reportData.message === 'string') {
          try {
            parsedContent = JSON.parse(reportData.message);
          } catch (e) {
            // If not valid JSON, use the message as text content for legacy support
            parsedContent = { report: reportData.message };
          }
        } else {
          // Already an object
          parsedContent = reportData.message;
        }
        
        setParsedData(parsedContent);
        setIsLoading(false);
        
        // Save report if not saved yet
        if (!hasBeenSaved) {
          saveReport();
        }
      } catch (error) {
        console.error("Error parsing report data:", error);
        setError("There was an error processing your report data.");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [reportData?.message, hasBeenSaved]);

  // Show loading spinner while processing the data
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] w-full">
        <Card className="w-full max-w-lg p-8 text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-800">Processing your PESTEL analysis</h3>
              <p className="text-gray-500">This may take a moment as we organize your comprehensive report...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error message if there's an issue
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] w-full">
        <Card className="w-full max-w-lg border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-700">Error Loading Report</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
            <Button onClick={onBack} className="mt-4 bg-blue-600 hover:bg-blue-700">
              Return to Form
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no data is available
  if (!parsedData && !reportData?.message) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] w-full">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center">No Analysis Data Available</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
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
            <p className="text-lg font-medium text-gray-500 text-center">
              Please submit a form to generate a PESTEL analysis report
            </p>
            <Button onClick={onBack} className="mt-6 bg-indigo-600 hover:bg-indigo-700">
              Return to Form
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the ReportDisplay component with the parsed data
  return (
    <div className="flex flex-col">
      <ReportDisplay 
        reportData={parsedData} 
        onBack={onBack} 
      />
      <div className="mt-6">
        <ChatWindow reportData={reportData} />
      </div>
    </div>
  );
};

export default Report;
