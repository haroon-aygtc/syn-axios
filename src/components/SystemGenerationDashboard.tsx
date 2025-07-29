import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  Code,
  Database,
  FileJson,
  Layers,
  Server,
  Settings,
  Zap,
} from "lucide-react";

interface ModuleStatus {
  name: string;
  progress: number;
  status: "pending" | "generating" | "complete" | "error";
  apiEndpoints: number;
  dataSchemas: number;
}

interface SystemGenerationDashboardProps {
  businessName?: string;
  modules?: ModuleStatus[];
  overallProgress?: number;
  onViewDetails?: (moduleName: string) => void;
  onRetry?: (moduleName: string) => void;
  onComplete?: () => void;
}

const SystemGenerationDashboard: React.FC<SystemGenerationDashboardProps> = ({
  businessName = "Acme Corporation",
  modules = [
    {
      name: "CRM",
      progress: 100,
      status: "complete",
      apiEndpoints: 12,
      dataSchemas: 8,
    },
    {
      name: "HR",
      progress: 75,
      status: "generating",
      apiEndpoints: 8,
      dataSchemas: 6,
    },
    {
      name: "Finance",
      progress: 45,
      status: "generating",
      apiEndpoints: 5,
      dataSchemas: 4,
    },
    {
      name: "Orders",
      progress: 20,
      status: "generating",
      apiEndpoints: 3,
      dataSchemas: 2,
    },
    {
      name: "Support",
      progress: 0,
      status: "pending",
      apiEndpoints: 0,
      dataSchemas: 0,
    },
    {
      name: "Legal",
      progress: 0,
      status: "pending",
      apiEndpoints: 0,
      dataSchemas: 0,
    },
  ],
  overallProgress = 40,
  onViewDetails = () => {},
  onRetry = () => {},
  onComplete = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "generating":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Settings className="h-5 w-5 text-blue-500" />
          </motion.div>
        );
      case "pending":
        return <Clock className="h-5 w-5 text-gray-400" />;
      case "error":
        return <Zap className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return (
          <Badge variant="default" className="bg-green-500">
            Complete
          </Badge>
        );
      case "generating":
        return (
          <Badge variant="default" className="bg-blue-500">
            Generating
          </Badge>
        );
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const completedModules = modules.filter(
    (m) => m.status === "complete",
  ).length;
  const totalModules = modules.length;

  return (
    <div className="w-full mx-auto p-4 bg-background">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">
                System Generation Dashboard
              </CardTitle>
              <CardDescription>
                Building your business system for {businessName}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Overall Progress
              </div>
              <div className="text-2xl font-bold">{overallProgress}%</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-2 mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>
              {completedModules} of {totalModules} modules complete
            </span>
            <span>
              Estimated time remaining:{" "}
              {Math.ceil((100 - overallProgress) / 10)} minutes
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="architecture">System Architecture</TabsTrigger>
          <TabsTrigger value="agents">MCP Agent Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>{module.name}</CardTitle>
                    {getStatusBadge(module.status)}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center mb-2">
                    <div className="mr-2">{getStatusIcon(module.status)}</div>
                    <Progress
                      value={module.progress}
                      className="h-2 flex-grow"
                    />
                    <span className="ml-2 text-sm font-medium">
                      {module.progress}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{module.dataSchemas} Data Schemas</span>
                    </div>
                    <div className="flex items-center">
                      <Code className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{module.apiEndpoints} API Endpoints</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(module.name)}
                      disabled={module.status === "pending"}
                    >
                      View Details
                    </Button>
                    {module.status === "error" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRetry(module.name)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {overallProgress === 100 && (
            <div className="flex justify-center mt-6">
              <Button onClick={onComplete} size="lg">
                Complete System Setup
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="architecture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>
                Visual representation of your system's architecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/20 border rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 w-64 text-center">
                      <Layers className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-medium">User Interface Layer</div>
                    </div>
                    <div className="h-8 w-0.5 bg-border" />
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 w-64 text-center">
                      <Server className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-medium">API Layer</div>
                    </div>
                    <div className="h-8 w-0.5 bg-border" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {modules.map((module, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className={`bg-${module.status === "complete" ? "green" : "amber"}-500/10 border border-${module.status === "complete" ? "green" : "amber"}-500/20 rounded-lg p-3 w-32 text-center`}
                        >
                          <div className="font-medium">{module.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {module.status === "complete"
                              ? "Active"
                              : "Building"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-8 w-0.5 bg-border" />
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 w-64 text-center">
                      <Database className="h-8 w-8 mx-auto mb-2" />
                      <div className="font-medium">Database Layer</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MCP Agent Orchestration Pipeline</CardTitle>
              <CardDescription>
                How your AI agents work together to process requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px] p-4">
                  <div className="flex justify-between items-center">
                    {[
                      {
                        name: "Intent",
                        icon: <FileJson className="h-6 w-6" />,
                        description: "Classifies user intent",
                      },
                      {
                        name: "Retriever",
                        icon: <Database className="h-6 w-6" />,
                        description: "Searches knowledge base",
                      },
                      {
                        name: "Tool",
                        icon: <Code className="h-6 w-6" />,
                        description: "Calls APIs",
                      },
                      {
                        name: "Workflow",
                        icon: <Layers className="h-6 w-6" />,
                        description: "Executes business logic",
                      },
                      {
                        name: "Memory",
                        icon: <Server className="h-6 w-6" />,
                        description: "Preserves state",
                      },
                      {
                        name: "LLM",
                        icon: <Zap className="h-6 w-6" />,
                        description: "Generates response",
                      },
                    ].map((agent, index) => (
                      <React.Fragment key={index}>
                        <div className="flex flex-col items-center">
                          <div className="bg-background border rounded-full p-3">
                            {agent.icon}
                          </div>
                          <div className="mt-2 font-medium text-sm">
                            {agent.name}
                          </div>
                          <div className="text-xs text-muted-foreground text-center mt-1">
                            {agent.description}
                          </div>
                        </div>
                        {index < 5 && (
                          <div className="h-0.5 w-12 bg-border self-start mt-10" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Agent Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Intent Agent", status: "active", requests: 128 },
                    {
                      name: "Retriever Agent",
                      status: "active",
                      requests: 112,
                    },
                    { name: "Tool Agent", status: "active", requests: 95 },
                    { name: "Workflow Agent", status: "active", requests: 87 },
                    { name: "Memory Agent", status: "active", requests: 128 },
                    { name: "Follow Agent", status: "active", requests: 76 },
                    {
                      name: "Formatter Agent",
                      status: "active",
                      requests: 128,
                    },
                    {
                      name: "Guardrail Agent",
                      status: "active",
                      requests: 128,
                    },
                    { name: "LLM Agent", status: "active", requests: 128 },
                  ].map((agent, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                        <span>{agent.name}</span>
                      </div>
                      <Badge variant="outline">{agent.requests} requests</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemGenerationDashboard;
