import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle, Clock, Database, Info } from "lucide-react";
import ChatWindow from "@/components/chat/ChatWindow";
import ReportDisplay from "@/components/content/ReportDisplay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Report = ({ reportData, onBack }) => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [isFetchingReports, setIsFetchingReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [displayData, setDisplayData] = useState(null);

  // Fetch saved reports
  const fetchSavedReports = async () => {
    if (!session?.user?.email) return;

    setIsFetchingReports(true);
    try {
      const response = await fetch("/api/reports");
      if (!response.ok) {
        throw new Error(`Failed to fetch saved reports: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched reports data:", data);

      if (data.success && data.data && data.data.length > 0) {
        console.log(
          "First report structure:",
          JSON.stringify(data.data[0], null, 2)
        );
        console.log("Total reports found:", data.data.length);
        setSavedReports(data.data);
        // Select the first report by default
        setSelectedReport(data.data[0]);
        // We'll process the report data in useEffect
      } else {
        console.warn("No reports found or empty data array", data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching saved reports:", error);
      setError(`Failed to fetch saved reports: ${error.message}`);
      setIsLoading(false);
    } finally {
      setIsFetchingReports(false);
    }
  };

  // Process the report data to prepare for display
  const processReportData = (report) => {
    if (!report) {
      console.warn("No report data to process");
      setIsLoading(false);
      return;
    }

    try {
      // Log the full report structure for debugging
      console.log("Processing report (full structure):", report);

      // First, check if the report contains nested data in a 'data' property (common API response structure)
      const reportData = report.data ? report.data : report;

      // IMPORTANT: Always ensure we have proper structure, even if fields are empty
      const processedData = {
        individual_reports: reportData.individual_reports || {},
        report: reportData.report || {},
        final_report: reportData.final_report || {},
        success: reportData.success !== undefined ? reportData.success : true,
        timestamp:
          reportData.timestamp ||
          reportData.createdAt ||
          new Date().toISOString(),
      };

      // Log the exact fields we're extracting
      console.log(
        "individual_reports:",
        JSON.stringify(reportData.individual_reports)
      );
      console.log("report:", JSON.stringify(reportData.report));
      console.log("final_report:", JSON.stringify(reportData.final_report));

      // Important debugging to see what data we're actually working with
      console.log("Processed data for display:", processedData);

      // Set the display data regardless of whether the objects are empty
      // Let the ReportDisplay component handle empty data display
      setDisplayData(processedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error processing report data:", error);
      setError(`Error processing report data: ${error.message}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchSavedReports();
    }
  }, [session]);

  useEffect(() => {
    if (selectedReport) {
      processReportData(selectedReport);
    }
  }, [selectedReport]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Show loading spinner while processing the data
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] w-full">
        <Card className="w-full max-w-lg p-8 text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-800">
                Loading your PESTEL analysis reports
              </h3>
              <p className="text-gray-500">
                Please wait while we fetch your saved reports...
              </p>
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
              <CardTitle className="text-red-700">
                Error Loading Reports
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>{" "}
            <Button
              onClick={() => (window.location.href = "/dashboard?content=form")}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Return to Form
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no reports available
  if (!savedReports || savedReports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] w-full">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center">
              No Analysis Reports Available
            </CardTitle>
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
            </p>{" "}
            <Button
              onClick={() => (window.location.href = "/dashboard?content=form")}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700"
            >
              Return to Form
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main content with report selector and report display
  return (
    <div className="flex flex-col w-full">
      <Card className="mb-6 bg-indigo-600 shadow-lg">
        <CardHeader className="text-white">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-6 w-6" /> Saved PESTEL Analysis Reports
              </CardTitle>
              <p className="text-indigo-100 mt-1">
                Select a report to view detailed analysis
              </p>
            </div>{" "}
            <Button
              onClick={() => (window.location.href = "/dashboard?content=form")}
              variant="outline"
              className="bg-white text-indigo-600 hover:bg-indigo-50"
            >
              Return to Form
            </Button>
          </div>
        </CardHeader>
        <CardContent className="bg-white p-4 rounded-b-lg">
          <Select
            value={selectedReport?._id}
            onValueChange={(value) => {
              const report = savedReports.find((r) => r._id === value);
              if (report) {
                setSelectedReport(report);
              }
            }}
          >
            <SelectTrigger className="w-full mb-2 border-2 border-indigo-200">
              <SelectValue placeholder="Select a report" />
            </SelectTrigger>
            <SelectContent>
              {savedReports.map((report) => (
                <SelectItem key={report._id} value={report._id}>
                  {report.analysis_id?.business_name || "Unnamed Analysis"} -{" "}
                  {formatDate(report.createdAt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedReport && (
            <div className="flex items-center gap-2 text-gray-600 mt-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Generated on: {formatDate(selectedReport.createdAt)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Only try to render the ReportDisplay component if display data exists */}
      {displayData &&
      (Object.keys(displayData.individual_reports || {}).length > 0 ||
        Object.keys(displayData.report || {}).length > 0 ||
        Object.keys(displayData.final_report || {}).length > 0) ? (
        <>
          <ReportDisplay reportData={displayData} />
        </>
      ) : null}
    </div>
  );
};

export default Report;
