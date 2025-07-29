import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

interface BusinessInterviewWizardProps {
  onComplete?: (data: BusinessData) => void;
}

interface BusinessData {
  businessName: string;
  businessType: string;
  industry: string;
  employeeCount: string;
  businessDescription: string;
  processes: string[];
  modules: string[];
  customRequirements: string;
}

const BusinessInterviewWizard: React.FC<BusinessInterviewWizardProps> = ({
  onComplete = () => {},
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData>({
    businessName: "",
    businessType: "",
    industry: "",
    employeeCount: "",
    businessDescription: "",
    processes: [],
    modules: [],
    customRequirements: "",
  });

  const steps = [
    "Business Information",
    "Business Type",
    "Business Processes",
    "Module Selection",
    "Custom Requirements",
    "Summary",
  ];

  const industries = [
    "Retail",
    "Healthcare",
    "Finance",
    "Technology",
    "Manufacturing",
    "Education",
    "Hospitality",
    "Real Estate",
    "Construction",
    "Transportation",
    "Agriculture",
    "Entertainment",
    "Legal Services",
    "Consulting",
    "Other",
  ];

  const businessTypes = [
    "Sole Proprietorship",
    "Partnership",
    "Limited Liability Company (LLC)",
    "Corporation",
    "Non-profit",
    "Franchise",
    "Cooperative",
    "Other",
  ];

  const businessProcesses = [
    "Customer Management",
    "Sales Pipeline",
    "Inventory Management",
    "Employee Onboarding",
    "Payroll Processing",
    "Leave Management",
    "Invoice Generation",
    "Payment Collection",
    "Expense Tracking",
    "Order Processing",
    "Delivery Management",
    "Support Ticketing",
    "Contract Management",
    "Document Storage",
    "Reporting & Analytics",
  ];

  const availableModules = [
    "CRM",
    "HR",
    "Finance",
    "Orders",
    "Support",
    "Legal",
    "Custom",
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      onComplete(businessData);
      setIsSubmitting(false);
    }, 2000);
  };

  const handleInputChange = (field: keyof BusinessData, value: string) => {
    setBusinessData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (
    field: keyof BusinessData,
    value: string,
    checked: boolean,
  ) => {
    setBusinessData((prev) => {
      const currentValues = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentValues, value] };
      } else {
        return {
          ...prev,
          [field]: currentValues.filter((item) => item !== value),
        };
      }
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Business Information
        return (
          <div className="space-y-4 bg-background">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Enter your business name"
                value={businessData.businessName}
                onChange={(e) =>
                  handleInputChange("businessName", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={businessData.industry}
                onValueChange={(value) => handleInputChange("industry", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeCount">Number of Employees</Label>
              <Select
                value={businessData.employeeCount}
                onValueChange={(value) =>
                  handleInputChange("employeeCount", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="201-500">201-500</SelectItem>
                  <SelectItem value="501+">501+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessDescription">Business Description</Label>
              <Textarea
                id="businessDescription"
                placeholder="Briefly describe your business and its main activities"
                value={businessData.businessDescription}
                onChange={(e) =>
                  handleInputChange("businessDescription", e.target.value)
                }
                className="min-h-[100px]"
              />
            </div>
          </div>
        );

      case 1: // Business Type
        return (
          <div className="space-y-4 bg-background">
            <div className="space-y-2">
              <Label>Business Type</Label>
              <RadioGroup
                value={businessData.businessType}
                onValueChange={(value) =>
                  handleInputChange("businessType", value)
                }
                className="space-y-2"
              >
                {businessTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} />
                    <Label htmlFor={type}>{type}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 2: // Business Processes
        return (
          <div className="space-y-4 bg-background">
            <div className="space-y-2">
              <Label>Select the business processes you need to manage</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {businessProcesses.map((process) => (
                  <div key={process} className="flex items-center space-x-2">
                    <Checkbox
                      id={process}
                      checked={businessData.processes.includes(process)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          "processes",
                          process,
                          checked === true,
                        )
                      }
                    />
                    <Label htmlFor={process}>{process}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Module Selection
        return (
          <div className="space-y-4 bg-background">
            <div className="space-y-2">
              <Label>Recommended Modules</Label>
              <p className="text-sm text-muted-foreground">
                Based on your business processes, we recommend the following
                modules:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                {availableModules.map((module) => (
                  <div key={module} className="flex items-center space-x-2">
                    <Checkbox
                      id={module}
                      checked={businessData.modules.includes(module)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          "modules",
                          module,
                          checked === true,
                        )
                      }
                    />
                    <Label htmlFor={module}>{module}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4: // Custom Requirements
        return (
          <div className="space-y-4 bg-background">
            <div className="space-y-2">
              <Label htmlFor="customRequirements">Custom Requirements</Label>
              <p className="text-sm text-muted-foreground">
                Please describe any specific requirements or customizations you
                need for your business system.
              </p>
              <Textarea
                id="customRequirements"
                placeholder="Enter your custom requirements here..."
                value={businessData.customRequirements}
                onChange={(e) =>
                  handleInputChange("customRequirements", e.target.value)
                }
                className="min-h-[150px]"
              />
            </div>
          </div>
        );

      case 5: // Summary
        return (
          <div className="space-y-4 bg-background">
            <h3 className="text-lg font-medium">Summary</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Business Name:</div>
                <div className="text-sm">{businessData.businessName}</div>

                <div className="text-sm font-medium">Industry:</div>
                <div className="text-sm">{businessData.industry}</div>

                <div className="text-sm font-medium">Business Type:</div>
                <div className="text-sm">{businessData.businessType}</div>

                <div className="text-sm font-medium">Employee Count:</div>
                <div className="text-sm">{businessData.employeeCount}</div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium">Business Description:</div>
                <div className="text-sm mt-1 p-2 bg-muted rounded-md">
                  {businessData.businessDescription}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium">Selected Processes:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {businessData.processes.map((process) => (
                    <span
                      key={process}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                    >
                      {process}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium">Selected Modules:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {businessData.modules.map((module) => (
                    <span
                      key={module}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                    >
                      {module}
                    </span>
                  ))}
                </div>
              </div>

              {businessData.customRequirements && (
                <div className="mt-4">
                  <div className="text-sm font-medium">
                    Custom Requirements:
                  </div>
                  <div className="text-sm mt-1 p-2 bg-muted rounded-md">
                    {businessData.customRequirements}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto bg-background">
      <CardHeader>
        <CardTitle>Business System Interview</CardTitle>
        <CardDescription>
          Let's gather information about your business to create your custom
          system.
        </CardDescription>
        <div className="mt-4">
          <Progress
            value={(currentStep / (steps.length - 1)) * 100}
            className="h-2"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center ${index <= currentStep ? "text-primary" : ""}`}
                style={{ width: `${100 / steps.length}%` }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1
                    ${
                      index < currentStep
                        ? "bg-primary text-primary-foreground"
                        : index === currentStep
                          ? "border-2 border-primary text-primary"
                          : "border border-muted-foreground text-muted-foreground"
                    }`}
                >
                  {index < currentStep ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-center text-[10px] hidden sm:block">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
              </>
            ) : (
              "Generate System"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BusinessInterviewWizard;
