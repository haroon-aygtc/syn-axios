import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Brain,
  Check,
  CircleCheck,
  CircleDashed,
  Copy,
  Database,
  FileText,
  FlowChart,
  GitBranch,
  GitFork,
  GitMerge,
  GitPullRequest,
  Layers,
  MessageSquare,
  Plus,
  Settings,
  Trash2,
  Workflow,
  Zap,
} from "lucide-react";

interface WorkflowBuilderProps {
  onComplete?: () => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  onComplete = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("design");
  const [workflowName, setWorkflowName] = useState("New Workflow");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [workflowType, setWorkflowType] = useState("sequential");
  const [workflowSteps, setWorkflowSteps] = useState([
    {
      id: "step1",
      name: "Process Input",
      type: "input",
      agent: "data-processor",
      description: "Process and validate the incoming data",
      isEnabled: true,
    },
    {
      id: "step2",
      name: "Analyze Content",
      type: "agent",
      agent: "content-analyzer",
      description: "Analyze the content using NLP",
      isEnabled: true,
    },
    {
      id: "step3",
      name: "Make Decision",
      type: "condition",
      agent: "decision-maker",
      description: "Determine next steps based on analysis",
      isEnabled: true,
    },
    {
      id: "step4",
      name: "Generate Response",
      type: "output",
      agent: "response-generator",
      description: "Create appropriate response",
      isEnabled: true,
    },
  ]);
  const [selectedStep, setSelectedStep] = useState<string | null>("step1");
  const [isAutomated, setIsAutomated] = useState(true);
  const [hasHumanInLoop, setHasHumanInLoop] = useState(false);
  const [triggerType, setTriggerType] = useState("api");

  const stepTypes = [
    { id: "input", name: "Input", icon: <ArrowRight className="h-4 w-4" /> },
    { id: "agent", name: "Agent", icon: <Brain className="h-4 w-4" /> },
    { id: "tool", name: "Tool", icon: <Zap className="h-4 w-4" /> },
    { id: "condition", name: "Condition", icon: <GitFork className="h-4 w-4" /> },
    { id: "loop", name: "Loop", icon: <GitMerge className="h-4 w-4" /> },
    { id: "output", name: "Output", icon: <FileText className="h-4 w-4" /> },
  ];

  const availableAgents = [
    { id: "data-processor", name: "Data Processor" },
    { id: "content-analyzer", name: "Content Analyzer" },
    { id: "decision-maker", name: "Decision Maker" },
    { id: "response-generator", name: "Response Generator" },
    { id: "knowledge-retriever", name: "Knowledge Retriever" },
    { id: "code-executor", name: "Code Executor" },
  ];

  const triggerTypes = [
    { id: "api", name: "API Endpoint", description: "Trigger via REST API call" },
    { id: "schedule", name: "Schedule", description: "Run on a defined schedule" },
    { id: "event", name: "Event", description: "Triggered by system events" },
    { id: "webhook", name: "Webhook", description: "External service webhook" },
  ];

  const addStep = () => {
    const newStep = {
      id: `step${workflowSteps.length + 1}`,
      name: `New Step ${workflowSteps.length + 1}`,
      type: "agent",
      agent: "content-analyzer",
      description: "Description for new step",
      isEnabled: true,
    };
    setWorkflowSteps([...workflowSteps, newStep]);
    setSelectedStep(newStep.id);
  };

  const removeStep = (stepId: string) => {
    setWorkflowSteps(workflowSteps.filter((step) => step.id !== stepId));
    if (selectedStep === stepId) {
      setSelectedStep(workflowSteps[0]?.id || null);
    }
  };

  const updateStep = (stepId: string, field: string, value: any) => {
    setWorkflowSteps(
      workflowSteps.map((step) =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    );
  };

  const moveStepUp = (stepId: string) => {
    const index = workflowSteps.findIndex((step) => step.id === stepId);
    if (index > 0) {
      const newSteps = [...workflowSteps];
      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
      setWorkflowSteps(newSteps);
    }
  };

  const moveStepDown = (stepId: string) => {
    const index = workflowSteps.findIndex((step) => step.id === stepId);
    if (index < workflowSteps.length - 1) {
      const newSteps = [...workflowSteps];
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      setWorkflowSteps(newSteps);
    }
  };

  return (
    <div className="w-full mx-auto bg-background">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            Workflow Builder
          </CardTitle>
          <CardDescription>
            Design intelligent workflows with agents and tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workflow-name">Workflow Name</Label>
                    <Input
                      id="workflow-name"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workflow-description">Description</Label>
                    <Textarea
                      id="workflow-description"
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      className="mt-1"
                      placeholder="Describe what this workflow does..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="workflow-type">Workflow Type</Label>
                    <Select
                      value={workflowType}
                      onValueChange={setWorkflowType}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select workflow type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Sequential</SelectItem>
                        <SelectItem value="branching">Branching</SelectItem>
                        <SelectItem value="parallel">Parallel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Workflow Steps</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      {workflowSteps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`p-3 border rounded-md cursor-pointer flex items-center justify-between ${
                            selectedStep === step.id ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => setSelectedStep(step.id)}
                        >
                          <div className="flex items-center">
                            <div className="bg-muted w-6 h-6 rounded-full flex items-center justify-center mr-2">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{step.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {stepTypes.find((t) => t.id === step.type)?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {step.isEnabled ? (
                              <CircleCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <CircleDashed className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={addStep}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  {selectedStep && (
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>Step Configuration</CardTitle>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStepUp(selectedStep)}
                              disabled={
                                workflowSteps.findIndex(
                                  (step) => step.id === selectedStep
                                ) === 0
                              }
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStepDown(selectedStep)}
                              disabled={
                                workflowSteps.findIndex(
                                  (step) => step.id === selectedStep
                                ) ===
                                workflowSteps.length - 1
                              }
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStep(selectedStep)}
                              disabled={workflowSteps.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {workflowSteps
                          .filter((step) => step.id === selectedStep)
                          .map((step) => (
                            <div key={step.id} className="space-y-4">
                              <div>
                                <Label htmlFor="step-name">Step Name</Label>
                                <Input
                                  id="step-name"
                                  value={step.name}
                                  onChange={(e) =>
                                    updateStep(step.id, "name", e.target.value)
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="step-type">Step Type</Label>
                                <Select
                                  value={step.type}
                                  onValueChange={(value) =>
                                    updateStep(step.id, "type", value)
                                  }
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select step type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {stepTypes.map((type) => (
                                      <SelectItem key={type.id} value={type.id}>
                                        <div className="flex items-center">
                                          {type.icon}
                                          <span className="ml-2">{type.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {(step.type === "agent" || step.type === "condition") && (
                                <div>
                                  <Label htmlFor="step-agent">Agent</Label>
                                  <Select
                                    value={step.agent}
                                    onValueChange={(value) =>
                                      updateStep(step.id, "agent", value)
                                    }
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Select agent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableAgents.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id}>
                                          {agent.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              <div>
                                <Label htmlFor="step-description">Description</Label>
                                <Textarea
                                  id="step-description"
                                  value={step.description}
                                  onChange={(e) =>
                                    updateStep(
                                      step.id,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className="mt-1"
                                  placeholder="Describe what this step does..."
                                />
                              </div>
                              <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                  id="step-enabled"
                                  checked={step.isEnabled}
                                  onCheckedChange={(checked) =>
                                    updateStep(step.id, "isEnabled", checked)
                                  }
                                />
                                <Label htmlFor="step-enabled">Enable this step</Label>
                              </div>
                            </div>
                          ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Execution Settings</CardTitle>
                    <CardDescription>
                      Configure how this workflow executes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="automated"
                        checked={isAutomated}
                        onCheckedChange={setIsAutomated}
                      />
                      <Label htmlFor="automated">Fully automated execution</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="human-in-loop"
                        checked={hasHumanInLoop}
                        onCheckedChange={setHasHumanInLoop}
                      />
                      <Label htmlFor="human-in-loop">Human-in-the-loop approval</Label>
                    </div>
                    <Separator className="my-4" />
                    <div>
                      <Label>Error Handling</Label>
                      <Select defaultValue="retry">
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select error handling" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retry">Retry (3 attempts)</SelectItem>
                          <SelectItem value="fallback">Use fallback path</SelectItem>
                          <SelectItem value="abort">Abort workflow</SelectItem>
                          <SelectItem value="notify">Notify administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Timeout</Label>
                      <Select defaultValue="60">
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select timeout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 seconds</SelectItem>
                          <SelectItem value="60">1 minute</SelectItem>
                          <SelectItem value="300">5 minutes</SelectItem>
                          <SelectItem value="600">10 minutes</SelectItem>
                          <SelectItem value="1800">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monitoring & Logging</CardTitle>
                    <CardDescription>
                      Configure monitoring and logging options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="detailed-logging" defaultChecked />
                      <Label htmlFor="detailed-logging">Detailed execution logs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="performance-metrics" defaultChecked />
                      <Label htmlFor="performance-metrics">
                        Collect performance metrics
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="error-alerts" defaultChecked />
                      <Label htmlFor="error-alerts">Error alerts</Label>
                    </div>
                    <Separator className="my-4" />
                    <div>
                      <Label>Log Retention</Label>
                      <Select defaultValue="30">
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select log retention" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="integration" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trigger Configuration</CardTitle>
                    <CardDescription>
                      Configure how this workflow is triggered
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Trigger Type</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {triggerTypes.map((trigger) => (
                          <div
                            key={trigger.id}
                            className={`border rounded-md p-3 cursor-pointer ${
                              triggerType === trigger.id
                                ? "border-primary bg-primary/5"
                                : ""
                            }`}
                            onClick={() => setTriggerType(trigger.id)}
                          >
                            <div className="font-medium">{trigger.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {trigger.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {triggerType === "api" && (
                      <div className="space-y-2">
                        <Label>API Endpoint</Label>
                        <div className="bg-muted p-2 rounded-md font-mono text-sm overflow-x-auto">
                          https://api.axientos.com/workflows/{workflowName
                            .toLowerCase()
                            .replace(/\s+/g, "-")}
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}

                    {triggerType === "schedule" && (
                      <div className="space-y-2">
                        <Label>Schedule</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger>
                            <SelectValue placeholder="Select schedule" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="custom">Custom (CRON)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {triggerType === "event" && (
                      <div className="space-y-2">
                        <Label>Event Type</Label>
                        <Select defaultValue="data-updated">
                          <SelectTrigger>
                            <SelectValue placeholder="Select event" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="data-updated">Data Updated</SelectItem>
                            <SelectItem value="user-action">User Action</SelectItem>
                            <SelectItem value="system-alert">System Alert</SelectItem>
                            <SelectItem value="threshold-reached">
                              Threshold Reached
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {triggerType === "webhook" && (
                      <div className="space-y-2">
                        <Label>Webhook URL</Label>
                        <div className="bg-muted p-2 rounded-md font-mono text-sm overflow-x-auto">
                          https://webhooks.axientos.com/workflows/{workflowName
                            .toLowerCase()
                            .replace(/\s+/g, "-")}
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm">
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Integration Options</CardTitle>
                    <CardDescription>
                      Configure how to integrate this workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>SDK Integration</Label>
                      <div className="bg-muted p-2 rounded-md font-mono text-sm mt-2 overflow-x-auto">
                        <pre>
                          {`import { AxientOS } from '@axientos/sdk';

const client = new AxientOS({
  apiKey: 'YOUR_API_KEY'
});

// Run workflow
const result = await client.workflows.run('${workflowName
                            .toLowerCase()
                            .replace(/\s+/g, "-")}', {
  input: yourData
});`}
                        </pre>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button variant="outline" size="sm">
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <Label>REST API</Label>
                      <div className="bg-muted p-2 rounded-md font-mono text-sm mt-2 overflow-x-auto">
                        <pre>
                          {`POST https://api.axientos.com/workflows/${workflowName
                            .toLowerCase()
                            .replace(/\s+/g, "-")}/run

{
  "input": {
    // Your data here
  }
}`}
                        </pre>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button variant="outline" size="sm">
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
            <Button onClick={onComplete}>
              <Check className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkflowBuilder;