import React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  Cpu,
  Database,
  FileText,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import BusinessInterviewWizard from "./BusinessInterviewWizard";
import ModuleConfigurationPanel from "./ModuleConfigurationPanel";
import SystemGenerationDashboard from "./SystemGenerationDashboard";
import WidgetGenerator from "./WidgetGenerator";
import AIAgentOrchestration from "./AIAgentOrchestration";

const Home = () => {
  const [activeTab, setActiveTab] = React.useState("interview");
  const [progress, setProgress] = React.useState(0);

  // Mock data for demonstration purposes
  const businessTypes = [
    "E-commerce",
    "Service Provider",
    "Manufacturing",
    "Healthcare",
    "Education",
    "Finance",
  ];
  const recommendedModules = [
    { id: "crm", name: "CRM", icon: <Users size={20} />, selected: true },
    { id: "hr", name: "HR", icon: <Users size={20} />, selected: true },
    {
      id: "finance",
      name: "Finance",
      icon: <FileText size={20} />,
      selected: true,
    },
    {
      id: "orders",
      name: "Orders",
      icon: <Database size={20} />,
      selected: false,
    },
    {
      id: "support",
      name: "Support",
      icon: <Building2 size={20} />,
      selected: false,
    },
    {
      id: "legal",
      name: "Legal",
      icon: <FileText size={20} />,
      selected: false,
    },
  ];

  // Simulate progress update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress((prev) => Math.min(prev + 5, 100));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-none">
          <div className="flex items-center space-x-2">
            <Cpu className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">AxientOS</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-none">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Build Your Business System
          </h2>
          <p className="text-muted-foreground">
            Create a complete operational system tailored to your business needs
            through our AI-powered platform.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <div
              className={`text-sm font-medium ${activeTab === "interview" ? "text-primary" : "text-muted-foreground"}`}
            >
              1. Business Interview
            </div>
            <div
              className={`text-sm font-medium ${activeTab === "modules" ? "text-primary" : "text-muted-foreground"}`}
            >
              2. Module Configuration
            </div>
            <div
              className={`text-sm font-medium ${activeTab === "generation" ? "text-primary" : "text-muted-foreground"}`}
            >
              3. System Generation
            </div>
            <div
              className={`text-sm font-medium ${activeTab === "widget" ? "text-primary" : "text-muted-foreground"}`}
            >
              4. Widget Setup
            </div>
            <div
              className={`text-sm font-medium ${activeTab === "orchestration" ? "text-primary" : "text-muted-foreground"}`}
            >
              5. AI Orchestration
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <motion.div
              className="bg-primary h-2.5 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="interview">Business Interview</TabsTrigger>
            <TabsTrigger value="modules">Module Configuration</TabsTrigger>
            <TabsTrigger value="generation">System Generation</TabsTrigger>
            <TabsTrigger value="widget">Widget Generator</TabsTrigger>
            <TabsTrigger value="orchestration">AI Orchestration</TabsTrigger>
          </TabsList>

          <TabsContent value="interview" className="space-y-4">
            <BusinessInterviewWizard
              businessTypes={businessTypes}
              onComplete={() => {
                setActiveTab("modules");
                setProgress(20);
              }}
            />
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <ModuleConfigurationPanel
              recommendedModules={recommendedModules}
              onComplete={() => {
                setActiveTab("generation");
                setProgress(40);
              }}
            />
          </TabsContent>

          <TabsContent value="generation" className="space-y-4">
            <SystemGenerationDashboard
              onComplete={() => {
                setActiveTab("widget");
                setProgress(60);
              }}
            />
          </TabsContent>

          <TabsContent value="widget" className="space-y-4">
            <WidgetGenerator
              onComplete={() => {
                setActiveTab("orchestration");
                setProgress(80);
              }}
            />
          </TabsContent>

          <TabsContent value="orchestration" className="space-y-4">
            <AIAgentOrchestration />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current build progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progress}%</div>
              <p className="text-muted-foreground mt-2">
                {progress < 20
                  ? "Gathering business information..."
                  : progress < 40
                    ? "Configuring modules..."
                    : progress < 60
                      ? "Generating system components..."
                      : progress < 80
                        ? "Setting up widget..."
                        : progress < 100
                          ? "Initializing AI orchestration..."
                          : "System ready!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Modules</CardTitle>
              <CardDescription>Business components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recommendedModules
                  .filter((module) => module.selected)
                  .map((module) => (
                    <div
                      key={module.id}
                      className="flex items-center bg-muted px-3 py-1 rounded-full text-sm"
                    >
                      {module.icon}
                      <span className="ml-2">{module.name}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>Continue your setup</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => {
                  if (activeTab === "interview") setActiveTab("modules");
                  else if (activeTab === "modules") setActiveTab("generation");
                  else if (activeTab === "generation") setActiveTab("widget");
                  else if (activeTab === "widget") setActiveTab("orchestration");
                  else if (activeTab === "orchestration") setProgress(100);
                }}
              >
                {activeTab === "orchestration" ? "Complete Setup" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Home;