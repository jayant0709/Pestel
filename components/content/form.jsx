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

    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Analysis submitted successfully!");
        // Reset form
        setFormData({
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
      } else {
        alert("Error submitting analysis");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting analysis");
    }
  };

  return (
    <Card className="w-full h-full mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Business Analysis Form
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <Separator className="my-2" />

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  placeholder="Enter business name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Enter industry"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geographical_focus">Geographical Focus</Label>
                  <Input
                    id="geographical_focus"
                    name="geographical_focus"
                    value={formData.geographical_focus}
                    onChange={handleChange}
                    placeholder="Enter geographical focus"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Market Analysis Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Market Analysis</h3>
            <Separator className="my-2" />

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="target_market">Target Market</Label>
                <Input
                  id="target_market"
                  name="target_market"
                  value={formData.target_market}
                  onChange={handleChange}
                  placeholder="Describe your target market"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competitors">Key Competitors</Label>
                <Input
                  id="competitors"
                  name="competitors"
                  value={formData.competitors}
                  onChange={handleChange}
                  placeholder="List main competitors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_frame">Analysis Time Frame</Label>
                <Select
                  name="time_frame"
                  value={formData.time_frame}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Political Factors</h3>
            <Separator className="my-2" />

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(formData.political_factors).map((key) =>
                  key !== "notes" ? (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        name={key}
                        checked={formData.political_factors[key]}
                        onCheckedChange={(checked) => {
                          handleChange({
                            target: { name: key, type: "checkbox", checked },
                          });
                        }}
                      />
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/_/g, " ")}
                      </Label>
                    </div>
                  ) : null
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.political_factors.notes}
                  onChange={handleChange}
                  placeholder="Add any relevant notes or comments"
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full">
            Submit Analysis
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Form;
