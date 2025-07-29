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
  Brain,
  Code,
  FileText,
  MessageSquare,
  Settings,
  Sparkles,
  Zap,
  Database,
  Layers,
  Plus,
  Trash2,
  Copy,
  Check,
} from "lucide-react";

interface AgentBuilderProps {
  onComplete?: () => void;
}

const AgentBuilder: React.FC<AgentBuilderProps> = ({
  onComplete = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [agentName, setAgentName] = useState("New Agent");
  const [agentDescription, setAgentDescription] = useState("");
  const [agentType, setAgentType] = useState("task");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>(["web-search"]);
  const [knowledgeBase, setKnowledgeBase] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [isMultiTask, setIsMultiTask] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const aiProviders = [
    {
      id: "openai",
      name: "OpenAI",
      models: ["GPT-4", "GPT-3.5", "GPT-4o"],
      icon: <Sparkles className="h-5 w-5" />,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "anthropic",
      name: "Anthropic",
      models: ["Claude-3-Opus", "Claude-3-Sonnet", "Claude-3-Haiku"],
      icon: <Brain className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "google",
      name: "Google",
      models: ["Gemini-Pro", "Gemini-Ultra"],
      icon: <Layers className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-800",
    },
  ];

  const availableTools = [
    {
      id: "web-search",
      name: "Web Search",
      description: "Search the internet for real-time information",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: "code-interpreter",
      name: "Code Interpreter",
      description: "Execute code and return results",
      icon: <Code className="h-5 w-5" />,
    },
    {
      id: "document-analysis",
      name: "Document Analysis",
      description: "Extract and analyze information from documents",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: "database-query",
      name: "Database Query",
      description: "Query databases and return results",
      icon: <Database className="h-5 w-5" />,
    },
  ];

  const knowledgeBases = [
    {
      id: "company-docs",
      name: "Company Documents",
      documents: 124,
      lastUpdated: "2 days ago",
    },
    {
      id: "product-specs",
      name: "Product Specifications",
      documents: 56,
      lastUpdated: "1 week ago",
    },
    {
      id: "support-faqs",
      name: "Support FAQs",
      documents: 89,
      lastUpdated: "3 days ago",
    },
  ];

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    );
  };

  const toggleKnowledgeBase = (kbId: string) => {
    setKnowledgeBase((prev) =>
      prev.includes(kbId)
        ? prev.filter((id) => id !== kbId)
        : [...prev, kbId]
    );
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemperature(parseFloat(e.target.value));
  };

  const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxTokens(parseInt(e.target.value));
  };

  return (
    <div className="w-full mx-auto bg-background">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Agent Builder
          </CardTitle>
          <CardDescription>
            Create and configure an AI agent with tools and knowledge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-description">Description</Label>
                  <Textarea
                    id="agent-description"
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                    className="mt-1"
                    placeholder="Describe what this agent does..."
                  />
                </div>
                <div>
                  <Label htmlFor="agent-type">Agent Type</Label>
                  <Select
                    value={agentType}
                    onValueChange={setAgentType}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select agent type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task Agent</SelectItem>
                      <SelectItem value="conversational">Conversational Agent</SelectItem>
                      <SelectItem value="orchestrator">Orchestrator Agent</SelectItem>
                      <SelectItem value="specialist">Specialist Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Switch
                    id="multi-task"
                    checked={isMultiTask}
                    onCheckedChange={setIsMultiTask}
                  />
                  <Label htmlFor="multi-task">Multi-task capability</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public-agent"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public-agent">Make agent publicly accessible</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-1 space-y-2">
                  {aiProviders.map((provider) => (
                    <Button
                      key={provider.id}
                      variant={selectedProvider === provider.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left"
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${provider.color.split(" ")[0]}`}></div>
                        {provider.name}
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="md:col-span-4">
                  {aiProviders.map((provider) => (
                    provider.id === selectedProvider && (
                      <div key={provider.id} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${provider.color}`}>
                            {provider.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">{provider.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Configure {provider.name} model settings
                            </p>
                          </div>
                        </div>

                        <div>
                          <Label>Select Model</Label>
                          <Select
                            value={selectedModel}
                            onValueChange={setSelectedModel}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {provider.models.map((model) => (
                                <SelectItem key={model} value={model.toLowerCase()}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="system-prompt">System Prompt</Label>
                          <Textarea
                            id="system-prompt"
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="mt-1 h-32"
                            placeholder="You are a helpful assistant..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="temperature">Temperature: {temperature}</Label>
                            <Input
                              id="temperature"
                              type="range"
                              min="0"
                              max="2"
                              step="0.1"
                              value={temperature}
                              onChange={handleTemperatureChange}
                              className="mt-1"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>Precise</span>
                              <span>Balanced</span>
                              <span>Creative</span>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="max-tokens">Max Tokens: {maxTokens}</Label>
                            <Input
                              id="max-tokens"
                              type="range"
                              min="100"
                              max="8000"
                              step="100"
                              value={maxTokens}
                              onChange={handleMaxTokensChange}
                              className="mt-1"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>Short</span>
                              <span>Medium</span>
                              <span>Long</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Available Tools</h3>
                  <p className="text-sm text-muted-foreground">
                    Select tools for your agent to use
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Tool
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {availableTools.map((tool) => (
                  <Card key={tool.id} className={selectedTools.includes(tool.id) ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {tool.icon}
                          {tool.name}
                        </CardTitle>
                        <Switch
                          checked={selectedTools.includes(tool.id)}
                          onCheckedChange={() => toggleTool(tool.id)}
                        />
                      </div>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">
                          {selectedTools.includes(tool.id) ? "Enabled" : "Disabled"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">Knowledge Bases</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect knowledge bases to your agent
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Knowledge Base
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {knowledgeBases.map((kb) => (
                  <Card key={kb.id} className={knowledgeBase.includes(kb.id) ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{kb.name}</CardTitle>
                        <Switch
                          checked={knowledgeBase.includes(kb.id)}
                          onCheckedChange={() => toggleKnowledgeBase(kb.id)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <Label>Documents</Label>
                          <p className="font-medium">{kb.documents}</p>
                        </div>
                        <div>
                          <Label>Last Updated</Label>
                          <p className="font-medium">{kb.lastUpdated}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
              Create Agent
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AgentBuilder;