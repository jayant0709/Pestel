import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ReportDisplay from "./ReportDisplay";

const Form = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    business_name: "",
    industry: "",
    geographical_focus: "",
    target_market: "",
    competitors: "",
    time_frame: "Short-term (1-2 years)",
    political_factors: {
      government_policies: false,
      political_stability: false,
      tax_regulations: false,
      industry_regulations: false,
      global_trade_agreements: false,
    },
    economic_factors: {
      economic_growth: false,
      interest_rates: false,
      inflation: false,
      unemployment: false,
      labor_costs: false,
    },
    social_factors: {
      demographics: false,
      education_levels: false,
      cultural_factors: false,
      health_consciousness: false,
      lifestyle_trends: false,
    },
    technological_factors: {
      r_and_d_activity: false,
      automation: false,
      technology_incentives: false,
      rate_of_technological_change: false,
      technology_adoption: false,
    },
    environmental_factors: {
      weather: false,
      climate_change: false,
      environmental_policies: false,
      carbon_footprint: false,
      sustainability: false,
    },
    legal_factors: {
      discrimination_laws: false,
      consumer_protection: false,
      antitrust_laws: false,
      employment_laws: false,
      health_and_safety_regulations: false,
    },
    additional_notes: "", // Single additional notes field for all factors
  });
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (session?.user?.email) {
      setFormData((prev) => ({
        ...prev,
        email: session.user.email,
      }));
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const category = e.target.getAttribute("data-category");

    if (type === "checkbox" && category) {
      setFormData((prevData) => ({
        ...prevData,
        [category]: {
          ...prevData[category],
          [name]: checked,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      time_frame: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      alert("Please sign in to submit analysis");
      return;
    }

    setIsLoading(true);

    try {
      // Set the email from the session
      const submissionData = {
        ...formData,
        email: session.user.email,
      };

      // Step 1: Save form data to Analysis collection
      const analysisResponse = await fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!analysisResponse.ok) {
        throw new Error(
          `Analysis API returned status code ${analysisResponse.status}`
        );
      }

      const analysisData = await analysisResponse.json();

      // Step 2: Get report from Flask backend
      try {
        const flaskResponse = await fetch(
          "http://127.0.0.1:8080/submit-analysis",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(submissionData),
          }
        );

        if (flaskResponse.ok) {
          const reportData = await flaskResponse.json(); // Step 3: Save the report data to MongoDB with reference to the analysis
          if (reportData && analysisData.success) {
            // Ensure all required properties exist
            const dataToSave = {
              analysis_id: analysisData.data._id,
              individual_reports: reportData.individual_reports || {},
              final_report: reportData.final_report || {},
              report: reportData.report || {},
              news: reportData.news || {},
              success:
                reportData.success !== undefined ? reportData.success : true,
              timestamp: reportData.timestamp || new Date().toISOString(),
            };

            console.log(
              "Saving report data:",
              JSON.stringify(dataToSave, null, 2)
            );

            const reportSaveResponse = await fetch("/api/reports", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(dataToSave),
            });

            if (reportSaveResponse.ok) {
              const savedReport = await reportSaveResponse.json();
              console.log("Report saved successfully:", savedReport);
              // Display the report
              setReportData(reportData);
              setShowReport(true);
            } else {
              const errorData = await reportSaveResponse.json();
              console.error("Failed to save report data:", errorData);
              alert(
                "Warning: Your report data couldn't be saved to the database."
              );
              // Still show the report even if saving to DB failed
              setReportData(reportData);
              setShowReport(true);
            }
          } else {
            setReportData(reportData);
            setShowReport(true);
          }
        } else {
          // If Flask fails, we can still show a success message for DB storage
          alert("Form saved successfully, but report generation failed.");
        }
      } catch (flaskError) {
        console.error("Flask API Error:", flaskError);
        alert(
          "Your data was saved successfully, but we couldn't generate a report at this time."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting analysis: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (showReport && reportData) {
    return (
      <ReportDisplay
        reportData={reportData}
        onBack={() => setShowReport(false)}
      />
    );
  }

  return (
    <Card className="w-full h-full mx-auto max-w-4xl shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl py-6">
        <CardTitle className="text-3xl font-bold text-center font-heading">
          Business Analysis Form
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Basic Information Section */}
          <div className="space-y-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-indigo-800 flex items-center gap-2 font-heading">
              <span className="h-6 w-1 bg-indigo-600 rounded-full"></span>
              Basic Information
            </h3>
            <Separator className="my-3 bg-indigo-100" />

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="business_name"
                  className="text-gray-700 font-medium font-sans"
                >
                  Business Name
                </Label>
                <Input
                  id="business_name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  placeholder="Enter business name"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-300 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="industry"
                    className="text-gray-700 font-medium"
                  >
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Enter industry"
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="geographical_focus"
                    className="text-gray-700 font-medium"
                  >
                    Geographical Focus
                  </Label>
                  <Input
                    id="geographical_focus"
                    name="geographical_focus"
                    value={formData.geographical_focus}
                    onChange={handleChange}
                    placeholder="Enter geographical focus"
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Market Analysis Section */}
          <div className="space-y-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-purple-800 flex items-center gap-2">
              <span className="h-6 w-1 bg-purple-600 rounded-full"></span>
              Market Analysis
            </h3>
            <Separator className="my-3 bg-purple-100" />

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="target_market"
                  className="text-gray-700 font-medium"
                >
                  Target Market
                </Label>
                <Input
                  id="target_market"
                  name="target_market"
                  value={formData.target_market}
                  onChange={handleChange}
                  placeholder="Describe your target market"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="competitors"
                  className="text-gray-700 font-medium"
                >
                  Key Competitors
                </Label>
                <Input
                  id="competitors"
                  name="competitors"
                  value={formData.competitors}
                  onChange={handleChange}
                  placeholder="List main competitors"
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="time_frame"
                  className="text-gray-700 font-medium"
                >
                  Analysis Time Frame
                </Label>
                <Select
                  name="time_frame"
                  value={formData.time_frame}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 border-gray-300">
                    <SelectValue placeholder="Select time frame" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Short-term (1-2 years)">
                      Short-term (1-2 years)
                    </SelectItem>
                    <SelectItem value="Long-term (5+ years)">
                      Long-term (5+ years)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Political Factors Section */}
          <div className="space-y-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-indigo-800 flex items-center gap-2 font-heading">
              <span className="h-6 w-1 bg-indigo-600 rounded-full"></span>
              Political Factors
            </h3>
            <Separator className="my-3 bg-indigo-100" />

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formData.political_factors).map((key) => (
                  <div
                    key={key}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Checkbox
                      id={`political_${key}`}
                      name={key}
                      data-category="political_factors"
                      checked={formData.political_factors[key]}
                      onCheckedChange={(checked) =>
                        handleChange({
                          target: {
                            name: key,
                            type: "checkbox",
                            checked,
                            getAttribute: () => "political_factors",
                          },
                        })
                      }
                      className="data-[state=checked]:bg-indigo-500"
                    />
                    <Label
                      htmlFor={`political_${key}`}
                      className="capitalize text-gray-700"
                    >
                      {key.replace(/_/g, " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Economic Factors Section */}
          <div className="space-y-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2 font-heading">
              <span className="h-6 w-1 bg-green-600 rounded-full"></span>
              Economic Factors
            </h3>
            <Separator className="my-3 bg-green-100" />

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formData.economic_factors).map((key) => (
                  <div
                    key={key}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <Checkbox
                      id={`economic_${key}`}
                      name={key}
                      data-category="economic_factors"
                      checked={formData.economic_factors[key]}
                      onCheckedChange={(checked) =>
                        handleChange({
                          target: {
                            name: key,
                            type: "checkbox",
                            checked,
                            getAttribute: () => "economic_factors",
                          },
                        })
                      }
                      className="data-[state=checked]:bg-green-500"
                    />
                    <Label
                      htmlFor={`economic_${key}`}
                      className="capitalize text-gray-700"
                    >
                      {key.replace(/_/g, " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Factors Section */}
          <div className="space-y-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-blue-800 flex items-center gap-2 font-heading">
              <span className="h-6 w-1 bg-blue-600 rounded-full"></span>
              Social Factors
            </h3>
            <Separator className="my-3 bg-blue-100" />

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formData.social_factors).map((key) => (
                  <div
                    key={key}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Checkbox
                      id={`social_${key}`}
                      name={key}
                      data-category="social_factors"
                      checked={formData.social_factors[key]}
                      onCheckedChange={(checked) =>
                        handleChange({
                          target: {
                            name: key,
                            type: "checkbox",
                            checked,
                            getAttribute: () => "social_factors",
                          },
                        })
                      }
                      className="data-[state=checked]:bg-blue-500"
                    />
                    <Label
                      htmlFor={`social_${key}`}
                      className="capitalize text-gray-700"
                    >
                      {key.replace(/_/g, " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technological Factors Section */}
          <div className="space-y-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-cyan-800 flex items-center gap-2 font-heading">
              <span className="h-6 w-1 bg-cyan-600 rounded-full"></span>
              Technological Factors
            </h3>
            <Separator className="my-3 bg-cyan-100" />

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formData.technological_factors).map((key) => (
                  <div
                    key={key}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-cyan-50 transition-colors"
                  >
                    <Checkbox
                      id={`technological_${key}`}
                      name={key}
                      data-category="technological_factors"
                      checked={formData.technological_factors[key]}
                      onCheckedChange={(checked) =>
                        handleChange({
                          target: {
                            name: key,
                            type: "checkbox",
                            checked,
                            getAttribute: () => "technological_factors",
                          },
                        })
                      }
                      className="data-[state=checked]:bg-cyan-500"
                    />
                    <Label
                      htmlFor={`technological_${key}`}
                      className="capitalize text-gray-700"
                    >
                      {key.replace(/_/g, " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Environmental Factors Section */}
          <div className="space-y-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-teal-800 flex items-center gap-2 font-heading">
              <span className="h-6 w-1 bg-teal-600 rounded-full"></span>
              Environmental Factors
            </h3>
            <Separator className="my-3 bg-teal-100" />

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formData.environmental_factors).map((key) => (
                  <div
                    key={key}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-teal-50 transition-colors"
                  >
                    <Checkbox
                      id={`environmental_${key}`}
                      name={key}
                      data-category="environmental_factors"
                      checked={formData.environmental_factors[key]}
                      onCheckedChange={(checked) =>
                        handleChange({
                          target: {
                            name: key,
                            type: "checkbox",
                            checked,
                            getAttribute: () => "environmental_factors",
                          },
                        })
                      }
                      className="data-[state=checked]:bg-teal-500"
                    />
                    <Label
                      htmlFor={`environmental_${key}`}
                      className="capitalize text-gray-700"
                    >
                      {key.replace(/_/g, " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legal Factors Section - THIS IS WHERE THE BUG IS */}
          <div className="space-y-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-amber-800 flex items-center gap-2 font-heading">
              <span className="h-6 w-1 bg-amber-600 rounded-full"></span>
              Legal Factors
            </h3>
            <Separator className="my-3 bg-amber-100" />

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formData.legal_factors).map((key) => (
                  <div
                    key={key}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    <Checkbox
                      id={`legal_${key}`}
                      name={key}
                      data-category="legal_factors"
                      checked={formData.legal_factors[key]}
                      onCheckedChange={(checked) =>
                        handleChange({
                          target: {
                            name: key,
                            type: "checkbox",
                            checked,
                            getAttribute: () => "legal_factors",
                          },
                        })
                      }
                      className="data-[state=checked]:bg-amber-500"
                    />
                    <Label
                      htmlFor={`legal_${key}`}
                      className="capitalize text-gray-700"
                    >
                      {key.replace(/_/g, " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Common Additional Notes Section */}
          <div className="space-y-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-purple-800 flex items-center gap-2">
              <span className="h-6 w-1 bg-purple-600 rounded-full"></span>
              Additional Notes
            </h3>
            <Separator className="my-3 bg-purple-100" />

            <div className="space-y-2">
              <Label
                htmlFor="additional_notes"
                className="text-gray-700 font-medium"
              >
                Provide any additional information, context or specific
                requirements for the analysis
              </Label>
              <Textarea
                id="additional_notes"
                name="additional_notes"
                value={formData.additional_notes}
                onChange={handleChange}
                placeholder="Add any relevant notes or comments about your business context, specific risks, opportunities or areas of focus..."
                className="min-h-[150px] transition-all duration-200 focus:ring-2 focus:ring-purple-500 border-gray-300"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-6 bg-white border-t border-gray-200">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-purple-500/20 relative text-white font-medium rounded-xl font-heading"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                <span className="ml-2">Processing...</span>
              </div>
            ) : (
              "Submit"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Form;
