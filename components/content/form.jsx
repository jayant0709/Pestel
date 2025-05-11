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
import Report from "./Report";

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
      notes: "",
    },
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

    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        political_factors: {
          ...prevData.political_factors,
          [name]: checked,
        },
      }));
    } else if (name === "notes") {
      setFormData((prevData) => ({
        ...prevData,
        political_factors: {
          ...prevData.political_factors,
          notes: value,
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
      // Send to Next.js API route
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // Send to Flask backend
      const flaskResponse = await fetch(
        "https://app-362387414228.us-central1.run.app/submit-analysis",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const flaskData = await flaskResponse.json();

      if (data.success) {
        setReportData(flaskData);
        setShowReport(true);
      } else {
        alert("Error submitting analysis");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting analysis");
    } finally {
      setIsLoading(false);
    }
  };

  if (showReport) {
    return (
      <Report reportData={reportData} onBack={() => setShowReport(false)} />
    );
  }

  return (
    <Card className="w-full h-full mx-auto max-w-4xl shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl py-6">
        <CardTitle className="text-3xl font-bold text-center">
          Business Analysis Form
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Basic Information Section */}
          <div className="space-y-4 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-indigo-800 flex items-center gap-2">
              <span className="h-6 w-1 bg-indigo-600 rounded-full"></span>
              Basic Information
            </h3>
            <Separator className="my-3 bg-indigo-100" />

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="business_name"
                  className="text-gray-700 font-medium"
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
                  className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-300"
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
            <h3 className="text-xl font-semibold text-indigo-800 flex items-center gap-2">
              <span className="h-6 w-1 bg-indigo-600 rounded-full"></span>
              Political Factors
            </h3>
            <Separator className="my-3 bg-indigo-100" />

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formData.political_factors).map((key) =>
                  key !== "notes" ? (
                    <div
                      key={key}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <Checkbox
                        id={key}
                        name={key}
                        checked={formData.political_factors[key]}
                        onCheckedChange={(checked) => {
                          handleChange({
                            target: { name: key, type: "checkbox", checked },
                          });
                        }}
                        className="data-[state=checked]:bg-indigo-500"
                      />
                      <Label htmlFor={key} className="capitalize text-gray-700">
                        {key.replace(/_/g, " ")}
                      </Label>
                    </div>
                  ) : null
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-700 font-medium">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.political_factors.notes}
                  onChange={handleChange}
                  placeholder="Add any relevant notes or comments"
                  className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-indigo-500 border-gray-300"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 py-6 bg-white border-t border-gray-200">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-purple-500/20 relative text-white font-medium rounded-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                <span className="ml-2">Processing...</span>
              </div>
            ) : (
              "Submit Analysis"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Form;
