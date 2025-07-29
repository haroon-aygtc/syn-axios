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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Users,
  FileText,
  Database,
  BarChart,
  Code,
  FileIcon,
  Search,
  Plus,
  Settings,
  Check,
  ExternalLink,
} from "lucide-react";

interface ToolsIntegrationHubProps {
  onComplete?: () => void;
}

const ToolsIntegrationHub: React.FC<ToolsIntegrationHubProps> = ({
  onComplete = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("communication");
  const [searchQuery, setSearchQuery] = useState("");

  const toolCategories = [
    {
      id: "communication",
      name: "Communication",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-800",
      tools: [
        { name: "Slack", connected: true },
        { name: "Discord", connected: false },
        { name: "Microsoft Teams", connected: true },
        { name: "Email", connected: true },
        { name: "WhatsApp Business", connected: false },
      ],
      actions: [
        "Send messages",
        "Create channels",
        "Schedule meetings",
        "File sharing",
      ],
    },
    {
      id: "crm",
      name: "Customer Relations",
      icon: <Users className="h-5 w-5" />,
      color: "bg-green-100 text-green-800",
      tools: [
        { name: "Salesforce", connected: true },
        { name: "HubSpot", connected: false },
        { name: "Pipedrive", connected: false },
        { name: "Zendesk", connected: true },
        { name: "Intercom", connected: true },
      ],
      actions: [
        "Contact management",
        "Deal tracking",
        "Ticket handling",
        "Pipeline automation",
      ],
    },
    {
      id: "finance",
      name: "Finance & Accounting",
      icon: <FileText className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-800",
      tools: [
        { name: "QuickBooks", connected: false },
        { name: "Stripe", connected: true },
        { name: "PayPal", connected: true },
        { name: "Xero", connected: false },
        { name: "FreshBooks", connected: false },
      ],
      actions: [
        "Invoice generation",
        "Payment processing",
        "Expense tracking",
        "Financial reporting",
      ],
    },
    {
      id: "marketing",
      name: "Marketing & Analytics",
      icon: <BarChart className="h-5 w-5" />,
      color: "bg-amber-100 text-amber-800",
      tools: [
        { name: "Google Analytics", connected: true },
        { name: "Mailchimp", connected: true },
        { name: "SendGrid", connected: false },
        { name: "Facebook Ads", connected: false },
        { name: "Google Ads", connected: false },
      ],
      actions: [
        "Campaign management",
        "Email automation",
        "Analytics tracking",
        "Content publishing",
      ],
    },
    {
      id: "development",
      name: "Development & DevOps",
      icon: <Code className="h-5 w-5" />,
      color: "bg-rose-100 text-rose-800",
      tools: [
        { name: "GitHub", connected: true },
        { name: "GitLab", connected: false },
        { name: "Jira", connected: true },
        { name: "Jenkins", connected: false },
        { name: "Docker Hub", connected: false },
      ],
      actions: [
        "Code management",
        "Issue tracking",
        "CI/CD automation",
        "Deployment management",
      ],
    },
    {
      id: "documents",
      name: "File & Document Management",
      icon: <FileIcon className="h-5 w-5" />,
      color: "bg-cyan-100 text-cyan-800",
      tools: [
        { name: "Google Drive", connected: true },
        { name: "Dropbox", connected: false },
        { name: "OneDrive", connected: false },
        { name: "Box", connected: false },
        { name: "Notion", connected: true },
      ],
      actions: [
        "File operations",
        "Document creation",
        "Collaboration",
        "Version control",
      ],
    },
    {
      id: "custom",
      name: "Custom & API Tools",
      icon: <Settings className="h-5 w-5" />,
      color: "bg-gray-100 text-gray-800",
      tools: [
        { name: "REST API", connected: true },
        { name: "GraphQL", connected: false },
        { name: "Webhooks", connected: true },
        { name: "Database Connections", connected: false },
      ],
      actions: [
        "Authentication management",
        "Rate limiting",
        "Error handling",
        "Testing framework",
      ],
    },
  ];

  const filteredTools = toolCategories.map(category => ({
    ...category,
    tools: category.tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.tools.length > 0);

  return (
    <div className="w-full mx-auto bg-background">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Tools Integration Hub
          </CardTitle>
          <CardDescription>
            Connect and configure tools for your AI agents to use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for tools..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              {toolCategories.slice(0, 4).map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <span className="hidden md:inline">{category.name}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsList className="grid grid-cols-4 mb-6">
              {toolCategories.slice(4).map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <span className="hidden md:inline">{category.name}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {toolCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{category.name} Tools</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect and configure {category.name.toLowerCase()} tools
                      </p>
                    </div>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Tool
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(searchQuery ? filteredTools.find(c => c.id === category.id)?.tools : category.tools).map((tool, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <Badge variant={tool.connected ? "default" : "outline"}>
                            {tool.connected ? "Connected" : "Not Connected"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-4">
                          {tool.connected ? (
                            <>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                                Authentication successful
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label>API Usage</Label>
                                  <p className="text-sm font-medium">243 calls this month</p>
                                </div>
                                <div>
                                  <Label>Last Used</Label>
                                  <p className="text-sm font-medium">2 hours ago</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="space-y-2">
                              <Label htmlFor={`${tool.name}-api-key`}>API Key</Label>
                              <Input
                                id={`${tool.name}-api-key`}
                                type="password"
                                placeholder={`Enter ${tool.name} API key`}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex justify-between w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Docs
                          </Button>
                          <Button size="sm">
                            {tool.connected ? "Configure" : "Connect"}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-medium mb-4">Available Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.actions.map((action, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 border rounded-lg"
                      >
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Reset</Button>
          <Button onClick={onComplete}>Save Configuration</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ToolsIntegrationHub;