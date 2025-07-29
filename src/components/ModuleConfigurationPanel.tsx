import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  ChevronRight,
  Database,
  FileJson,
  Layers,
  Settings,
  Workflow,
} from "lucide-react";

interface ModuleConfigurationPanelProps {
  selectedModules?: string[];
  onSave?: (moduleConfigurations: any) => void;
  onPreview?: () => void;
}

const ModuleConfigurationPanel = ({
  selectedModules = ["CRM", "HR", "Finance", "Orders"],
  onSave = () => {},
  onPreview = () => {},
}: ModuleConfigurationPanelProps) => {
  const [activeTab, setActiveTab] = useState("schemas");
  const [activeModule, setActiveModule] = useState(selectedModules[0] || "CRM");

  const moduleColors: Record<string, string> = {
    CRM: "bg-blue-100 text-blue-800",
    HR: "bg-green-100 text-green-800",
    Finance: "bg-purple-100 text-purple-800",
    Orders: "bg-amber-100 text-amber-800",
    Support: "bg-cyan-100 text-cyan-800",
    Legal: "bg-rose-100 text-rose-800",
    Custom: "bg-gray-100 text-gray-800",
  };

  // Mock schema data for demonstration
  const mockSchemas: Record<string, any[]> = {
    CRM: [
      {
        name: "Customer",
        fields: [
          { name: "name", type: "string" },
          { name: "email", type: "string" },
          { name: "phone", type: "string" },
        ],
      },
      {
        name: "Lead",
        fields: [
          { name: "source", type: "string" },
          { name: "status", type: "enum" },
          { name: "potential_value", type: "number" },
        ],
      },
      {
        name: "Opportunity",
        fields: [
          { name: "title", type: "string" },
          { name: "value", type: "number" },
          { name: "probability", type: "number" },
        ],
      },
    ],
    HR: [
      {
        name: "Employee",
        fields: [
          { name: "name", type: "string" },
          { name: "position", type: "string" },
          { name: "department", type: "string" },
        ],
      },
      {
        name: "Leave",
        fields: [
          { name: "start_date", type: "date" },
          { name: "end_date", type: "date" },
          { name: "type", type: "enum" },
        ],
      },
      {
        name: "Payroll",
        fields: [
          { name: "salary", type: "number" },
          { name: "bonus", type: "number" },
          { name: "deductions", type: "number" },
        ],
      },
    ],
    Finance: [
      {
        name: "Invoice",
        fields: [
          { name: "number", type: "string" },
          { name: "amount", type: "number" },
          { name: "due_date", type: "date" },
        ],
      },
      {
        name: "Payment",
        fields: [
          { name: "method", type: "string" },
          { name: "amount", type: "number" },
          { name: "date", type: "date" },
        ],
      },
      {
        name: "Expense",
        fields: [
          { name: "category", type: "string" },
          { name: "amount", type: "number" },
          { name: "date", type: "date" },
        ],
      },
    ],
    Orders: [
      {
        name: "Product",
        fields: [
          { name: "name", type: "string" },
          { name: "price", type: "number" },
          { name: "stock", type: "number" },
        ],
      },
      {
        name: "Order",
        fields: [
          { name: "status", type: "enum" },
          { name: "total", type: "number" },
          { name: "date", type: "date" },
        ],
      },
      {
        name: "Delivery",
        fields: [
          { name: "address", type: "string" },
          { name: "status", type: "enum" },
          { name: "tracking_number", type: "string" },
        ],
      },
    ],
    Support: [
      {
        name: "Ticket",
        fields: [
          { name: "subject", type: "string" },
          { name: "status", type: "enum" },
          { name: "priority", type: "enum" },
        ],
      },
      {
        name: "Refund",
        fields: [
          { name: "amount", type: "number" },
          { name: "reason", type: "string" },
          { name: "status", type: "enum" },
        ],
      },
    ],
    Legal: [
      {
        name: "Contract",
        fields: [
          { name: "title", type: "string" },
          { name: "start_date", type: "date" },
          { name: "end_date", type: "date" },
        ],
      },
      {
        name: "Policy",
        fields: [
          { name: "title", type: "string" },
          { name: "content", type: "text" },
          { name: "effective_date", type: "date" },
        ],
      },
    ],
    Custom: [],
  };

  // Mock workflow data
  const mockWorkflows: Record<string, any[]> = {
    CRM: [
      {
        name: "Lead Qualification",
        steps: ["New Lead", "Initial Contact", "Qualification", "Opportunity"],
      },
      {
        name: "Customer Onboarding",
        steps: ["Welcome Email", "Account Setup", "Training", "Follow-up"],
      },
    ],
    HR: [
      {
        name: "Employee Onboarding",
        steps: [
          "Offer Letter",
          "Document Collection",
          "System Setup",
          "Training",
        ],
      },
      {
        name: "Leave Approval",
        steps: [
          "Request Submission",
          "Manager Approval",
          "HR Verification",
          "Notification",
        ],
      },
    ],
    Finance: [
      {
        name: "Invoice Processing",
        steps: [
          "Invoice Creation",
          "Client Notification",
          "Payment Tracking",
          "Reconciliation",
        ],
      },
      {
        name: "Expense Approval",
        steps: [
          "Submission",
          "Manager Review",
          "Finance Verification",
          "Reimbursement",
        ],
      },
    ],
    Orders: [
      {
        name: "Order Fulfillment",
        steps: [
          "Order Received",
          "Payment Verification",
          "Inventory Check",
          "Shipping",
          "Delivery",
        ],
      },
      {
        name: "Return Processing",
        steps: [
          "Return Request",
          "Approval",
          "Item Receipt",
          "Refund Processing",
        ],
      },
    ],
    Support: [
      {
        name: "Ticket Resolution",
        steps: [
          "Ticket Creation",
          "Assignment",
          "Investigation",
          "Resolution",
          "Feedback",
        ],
      },
      {
        name: "Refund Processing",
        steps: [
          "Request",
          "Verification",
          "Approval",
          "Processing",
          "Notification",
        ],
      },
    ],
    Legal: [
      {
        name: "Contract Approval",
        steps: [
          "Draft Creation",
          "Internal Review",
          "Client Review",
          "Negotiation",
          "Signing",
        ],
      },
      {
        name: "Policy Update",
        steps: [
          "Draft Changes",
          "Legal Review",
          "Management Approval",
          "Publication",
          "Training",
        ],
      },
    ],
    Custom: [],
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full mx-auto">
      <div className="flex h-[650px]">
        {/* Module Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">
            SELECTED MODULES
          </h3>
          <div className="space-y-1">
            {selectedModules.map((module) => (
              <Button
                key={module}
                variant={activeModule === module ? "secondary" : "ghost"}
                className="w-full justify-start text-left"
                onClick={() => setActiveModule(module)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${moduleColors[module]?.split(" ")[0] || "bg-gray-400"}`}
                  ></div>
                  {module}
                  {activeModule === module && (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  )}
                </div>
              </Button>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="mt-6">
            <Button variant="outline" className="w-full mb-2">
              <Settings className="mr-2 h-4 w-4" /> Module Settings
            </Button>
            <Button variant="outline" className="w-full">
              Add Custom Module
            </Button>
          </div>
        </div>

        {/* Main Configuration Area */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{activeModule} Module</h2>
                <p className="text-gray-500">
                  Configure your {activeModule.toLowerCase()} module settings
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={onPreview}>
                  Preview
                </Button>
                <Button onClick={() => onSave({ module: activeModule })}>
                  Save Configuration
                </Button>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="schemas">
                  <Database className="mr-2 h-4 w-4" /> Data Schemas
                </TabsTrigger>
                <TabsTrigger value="workflows">
                  <Workflow className="mr-2 h-4 w-4" /> Workflows
                </TabsTrigger>
                <TabsTrigger value="apis">
                  <FileJson className="mr-2 h-4 w-4" /> API Endpoints
                </TabsTrigger>
                <TabsTrigger value="ui">
                  <Layers className="mr-2 h-4 w-4" /> UI Components
                </TabsTrigger>
              </TabsList>

              {/* Data Schemas Tab */}
              <TabsContent value="schemas" className="space-y-4">
                <ScrollArea className="h-[450px] pr-4">
                  {mockSchemas[activeModule]?.map((schema, index) => (
                    <Card key={index} className="mb-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Database className="mr-2 h-4 w-4" /> {schema.name}
                        </CardTitle>
                        <CardDescription>
                          Data model for {schema.name.toLowerCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {schema.fields.map(
                            (field: any, fieldIndex: number) => (
                              <div
                                key={fieldIndex}
                                className="grid grid-cols-3 gap-4"
                              >
                                <div>
                                  <Label
                                    htmlFor={`${schema.name}-${field.name}`}
                                  >
                                    {field.name}
                                  </Label>
                                  <Input
                                    id={`${schema.name}-${field.name}`}
                                    defaultValue={field.name}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`${schema.name}-${field.name}-type`}
                                  >
                                    Type
                                  </Label>
                                  <Select defaultValue={field.type}>
                                    <SelectTrigger
                                      id={`${schema.name}-${field.name}-type`}
                                      className="mt-1"
                                    >
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="string">
                                        String
                                      </SelectItem>
                                      <SelectItem value="number">
                                        Number
                                      </SelectItem>
                                      <SelectItem value="date">Date</SelectItem>
                                      <SelectItem value="enum">Enum</SelectItem>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="boolean">
                                        Boolean
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-end">
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Switch
                                      id={`${schema.name}-${field.name}-required`}
                                      defaultChecked
                                    />
                                    <Label
                                      htmlFor={`${schema.name}-${field.name}-required`}
                                    >
                                      Required
                                    </Label>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                        <Button variant="outline" size="sm" className="mt-4">
                          Add Field
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full mt-2">
                    Add New Schema
                  </Button>
                </ScrollArea>
              </TabsContent>

              {/* Workflows Tab */}
              <TabsContent value="workflows" className="space-y-4">
                <ScrollArea className="h-[450px] pr-4">
                  {mockWorkflows[activeModule]?.map((workflow, index) => (
                    <Card key={index} className="mb-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Workflow className="mr-2 h-4 w-4" /> {workflow.name}
                        </CardTitle>
                        <CardDescription>
                          Workflow process for {workflow.name.toLowerCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2 mb-4">
                          {workflow.steps.map(
                            (step: string, stepIndex: number) => (
                              <React.Fragment key={stepIndex}>
                                <div className="flex flex-col items-center">
                                  <div className="bg-primary/10 text-primary font-medium rounded-full px-3 py-1 text-sm">
                                    {step}
                                  </div>
                                  {stepIndex === 0 && (
                                    <Badge variant="outline" className="mt-1">
                                      Start
                                    </Badge>
                                  )}
                                  {stepIndex === workflow.steps.length - 1 && (
                                    <Badge className="mt-1">End</Badge>
                                  )}
                                </div>
                                {stepIndex < workflow.steps.length - 1 && (
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                )}
                              </React.Fragment>
                            ),
                          )}
                        </div>
                        <div className="space-y-4 mt-6">
                          <div>
                            <Label htmlFor={`${workflow.name}-description`}>
                              Workflow Description
                            </Label>
                            <Textarea
                              id={`${workflow.name}-description`}
                              placeholder="Describe the workflow process..."
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`${workflow.name}-active`}
                              defaultChecked
                            />
                            <Label htmlFor={`${workflow.name}-active`}>
                              Active
                            </Label>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="ml-auto">
                          Edit Workflow
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full mt-2">
                    Add New Workflow
                  </Button>
                </ScrollArea>
              </TabsContent>

              {/* API Endpoints Tab */}
              <TabsContent value="apis" className="space-y-4">
                <ScrollArea className="h-[450px] pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated API Endpoints</CardTitle>
                      <CardDescription>
                        These endpoints will be automatically created for your{" "}
                        {activeModule} module
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockSchemas[activeModule]?.map((schema, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <h3 className="font-medium mb-2">
                              {schema.name} Endpoints
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Badge className="bg-green-100 text-green-800 mr-2">
                                  GET
                                </Badge>
                                <code className="text-sm">
                                  /api/{activeModule.toLowerCase()}/
                                  {schema.name.toLowerCase()}
                                </code>
                                <Badge variant="outline" className="ml-auto">
                                  List
                                </Badge>
                              </div>
                              <div className="flex items-center">
                                <Badge className="bg-green-100 text-green-800 mr-2">
                                  GET
                                </Badge>
                                <code className="text-sm">
                                  /api/{activeModule.toLowerCase()}/
                                  {schema.name.toLowerCase()}/{"{"}
                                  {schema.name.toLowerCase()}_id{"}"}
                                </code>
                                <Badge variant="outline" className="ml-auto">
                                  Detail
                                </Badge>
                              </div>
                              <div className="flex items-center">
                                <Badge className="bg-blue-100 text-blue-800 mr-2">
                                  POST
                                </Badge>
                                <code className="text-sm">
                                  /api/{activeModule.toLowerCase()}/
                                  {schema.name.toLowerCase()}
                                </code>
                                <Badge variant="outline" className="ml-auto">
                                  Create
                                </Badge>
                              </div>
                              <div className="flex items-center">
                                <Badge className="bg-amber-100 text-amber-800 mr-2">
                                  PUT
                                </Badge>
                                <code className="text-sm">
                                  /api/{activeModule.toLowerCase()}/
                                  {schema.name.toLowerCase()}/{"{"}
                                  {schema.name.toLowerCase()}_id{"}"}
                                </code>
                                <Badge variant="outline" className="ml-auto">
                                  Update
                                </Badge>
                              </div>
                              <div className="flex items-center">
                                <Badge className="bg-red-100 text-red-800 mr-2">
                                  DELETE
                                </Badge>
                                <code className="text-sm">
                                  /api/{activeModule.toLowerCase()}/
                                  {schema.name.toLowerCase()}/{"{"}
                                  {schema.name.toLowerCase()}_id{"}"}
                                </code>
                                <Badge variant="outline" className="ml-auto">
                                  Delete
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex items-center space-x-2">
                        <Switch id="enable-api-docs" defaultChecked />
                        <Label htmlFor="enable-api-docs">
                          Generate API Documentation
                        </Label>
                      </div>
                    </CardFooter>
                  </Card>
                </ScrollArea>
              </TabsContent>

              {/* UI Components Tab */}
              <TabsContent value="ui" className="space-y-4">
                <ScrollArea className="h-[450px] pr-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Generated UI Components</CardTitle>
                      <CardDescription>
                        These UI components will be automatically created for
                        your {activeModule} module
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {mockSchemas[activeModule]?.map((schema, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <h3 className="font-medium mb-4">
                              {schema.name} UI Components
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="border rounded-md p-3 bg-gray-50">
                                <div className="flex items-center mb-2">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span className="font-medium">
                                    {schema.name} List View
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Table with pagination, sorting and filtering
                                </p>
                              </div>
                              <div className="border rounded-md p-3 bg-gray-50">
                                <div className="flex items-center mb-2">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span className="font-medium">
                                    {schema.name} Detail View
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Detailed information with related data
                                </p>
                              </div>
                              <div className="border rounded-md p-3 bg-gray-50">
                                <div className="flex items-center mb-2">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span className="font-medium">
                                    {schema.name} Create Form
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Form with validation for creating new entries
                                </p>
                              </div>
                              <div className="border rounded-md p-3 bg-gray-50">
                                <div className="flex items-center mb-2">
                                  <Check className="h-4 w-4 text-green-500 mr-2" />
                                  <span className="font-medium">
                                    {schema.name} Edit Form
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  Form with validation for updating entries
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex items-center space-x-2">
                        <Switch id="enable-dark-mode" defaultChecked />
                        <Label htmlFor="enable-dark-mode">
                          Enable Dark Mode Support
                        </Label>
                      </div>
                    </CardFooter>
                  </Card>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleConfigurationPanel;
