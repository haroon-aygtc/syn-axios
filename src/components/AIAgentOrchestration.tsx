import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Cpu,
  Play,
  Pause,
  Square,
  Users,
  Activity,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
  Settings,
  Database,
  Code,
  BarChart3,
  Network,
  Bot
} from 'lucide-react';
import { orchestrationSystem } from '@/lib/orchestration/system';
import { WorkflowStatus, WorkflowEvent, SystemMetrics, SpecializedAgent } from '@/lib/orchestration/types';

interface ChatMessage {
  id: string;
  type: 'user' | 'system' | 'agent' | 'workflow';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface WorkflowExecution {
  id: string;
  name: string;
  status: WorkflowStatus;
  progress: number;
  startTime: Date;
  endTime?: Date;
  currentStep?: string;
  error?: string;
}

const AIAgentOrchestration: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);
  const [agents, setAgents] = useState<SpecializedAgent[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSystem();
    setupEventListeners();
    
    return () => {
      orchestrationSystem.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const initializeSystem = async () => {
    setIsInitializing(true);
    try {
      await orchestrationSystem.initialize();
      setIsInitialized(true);
      setAgents(orchestrationSystem.getAvailableAgents());
      
      addChatMessage({
        type: 'system',
        content: 'AI Agent Orchestration System initialized successfully! You can now submit complex requests that will be automatically planned and executed by specialized agents.',
        metadata: { systemReady: true }
      });

      // Load initial metrics
      const metrics = await orchestrationSystem.getSystemMetrics();
      setSystemMetrics(metrics);
    } catch (error) {
      console.error('Failed to initialize system:', error);
      addChatMessage({
        type: 'system',
        content: `Failed to initialize system: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: true }
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const setupEventListeners = () => {
    orchestrationSystem.on('workflow_event', (event: WorkflowEvent) => {
      handleWorkflowEvent(event);
    });

    orchestrationSystem.on('human_input_required', (interaction) => {
      addChatMessage({
        type: 'system',
        content: `Human input required: ${interaction.prompt}`,
        metadata: { 
          requiresResponse: true, 
          interactionId: interaction.id,
          workflowId: interaction.workflowId 
        }
      });
    });

    orchestrationSystem.on('agent_registered', ({ agentId, name }) => {
      addChatMessage({
        type: 'system',
        content: `New agent registered: ${name}`,
        metadata: { agentId }
      });
      setAgents(orchestrationSystem.getAvailableAgents());
    });
  };

  const handleWorkflowEvent = (event: WorkflowEvent) => {
    setWorkflows(prev => {
      const updated = [...prev];
      const workflowIndex = updated.findIndex(w => w.id === event.workflowId);
      
      if (workflowIndex >= 0) {
        const workflow = updated[workflowIndex];
        
        switch (event.type) {
          case 'workflow_started':
            workflow.status = WorkflowStatus.RUNNING;
            workflow.progress = 10;
            break;
          case 'step_started':
            workflow.currentStep = event.stepId;
            workflow.progress = Math.min(workflow.progress + 20, 90);
            break;
          case 'step_completed':
            workflow.progress = Math.min(workflow.progress + 10, 95);
            break;
          case 'workflow_completed':
            workflow.status = WorkflowStatus.COMPLETED;
            workflow.progress = 100;
            workflow.endTime = new Date();
            break;
          case 'workflow_failed':
            workflow.status = WorkflowStatus.FAILED;
            workflow.error = event.data?.error;
            workflow.endTime = new Date();
            break;
        }
      }
      
      return updated;
    });

    // Add chat message for important events
    if (event.type === 'workflow_completed') {
      addChatMessage({
        type: 'system',
        content: `Workflow completed successfully! All tasks have been executed.`,
        metadata: { workflowId: event.workflowId, success: true }
      });
    } else if (event.type === 'workflow_failed') {
      addChatMessage({
        type: 'system',
        content: `Workflow failed: ${event.data?.error || 'Unknown error'}`,
        metadata: { workflowId: event.workflowId, error: true }
      });
    }
  };

  const handleSubmitRequest = async () => {
    if (!userInput.trim() || !isInitialized || isProcessing) return;

    const request = userInput.trim();
    setUserInput('');
    setIsProcessing(true);

    // Add user message
    addChatMessage({
      type: 'user',
      content: request
    });

    try {
      // Process the request
      const result = await orchestrationSystem.processUserRequest(request);
      
      // Add workflow to tracking
      const newWorkflow: WorkflowExecution = {
        id: result.workflowId,
        name: result.workflow.name,
        status: result.status,
        progress: 5,
        startTime: new Date(),
        currentStep: undefined
      };
      
      setWorkflows(prev => [newWorkflow, ...prev]);

      // Add system response
      addChatMessage({
        type: 'system',
        content: `Workflow created: "${result.workflow.name}". The system will now execute ${result.workflow.steps.length} steps to fulfill your request.`,
        metadata: { 
          workflowId: result.workflowId,
          stepCount: result.workflow.steps.length
        }
      });

      // Switch to workflows tab to show progress
      setActiveTab('workflows');
    } catch (error) {
      addChatMessage({
        type: 'system',
        content: `Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: true }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...message
    };
    
    setChatMessages(prev => [...prev, newMessage]);
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.RUNNING:
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case WorkflowStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case WorkflowStatus.FAILED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case WorkflowStatus.PAUSED:
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.RUNNING:
        return 'bg-blue-500';
      case WorkflowStatus.COMPLETED:
        return 'bg-green-500';
      case WorkflowStatus.FAILED:
        return 'bg-red-500';
      case WorkflowStatus.PAUSED:
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = endTime.getTime() - start.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <CardTitle>Initializing AI Orchestration System</CardTitle>
            <CardDescription>
              Setting up agents and knowledge base...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={75} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-none">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">AI Agent Orchestration</h1>
              <p className="text-sm text-muted-foreground">
                Intelligent automation through specialized AI agents
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isInitialized ? "default" : "secondary"}>
              {isInitialized ? "System Ready" : "Initializing"}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-none">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat Interface
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Metrics
            </TabsTrigger>
          </TabsList>

          {/* Chat Interface */}
          <TabsContent value="chat" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Conversation
                    </CardTitle>
                    <CardDescription>
                      Describe what you want to accomplish, and the system will create and execute a workflow
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4">
                        <AnimatePresence>
                          {chatMessages.map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[80%] rounded-lg p-3 ${
                                message.type === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : message.metadata?.error
                                    ? 'bg-red-50 border border-red-200 text-red-800'
                                    : 'bg-muted'
                              }`}>
                                <div className="flex items-start gap-2">
                                  {message.type === 'system' && <Cpu className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                                  {message.type === 'agent' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                                  <div className="flex-1">
                                    <p className="text-sm">{message.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                      {message.timestamp.toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <div ref={chatEndRef} />
                      </div>
                    </ScrollArea>
                    
                    <div className="mt-4 flex gap-2">
                      <Textarea
                        placeholder="Describe what you want to accomplish (e.g., 'Create a customer management system with user authentication and reporting')"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmitRequest();
                          }
                        }}
                        className="flex-1 min-h-[60px]"
                        disabled={!isInitialized || isProcessing}
                      />
                      <Button 
                        onClick={handleSubmitRequest}
                        disabled={!isInitialized || isProcessing || !userInput.trim()}
                        size="lg"
                      >
                        {isProcessing ? (
                          <Activity className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setUserInput("Create a complete CRM system with customer management, lead tracking, and sales reporting")}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Build CRM System
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setUserInput("Generate a React component library with TypeScript, Storybook, and automated testing")}
                    >
                      <Code className="mr-2 h-4 w-4" />
                      Create Component Library
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setUserInput("Design and implement a business intelligence dashboard with data visualization and real-time analytics")}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Build Analytics Dashboard
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Active Agents</span>
                        <Badge>{agents.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Running Workflows</span>
                        <Badge variant="secondary">
                          {workflows.filter(w => w.status === WorkflowStatus.RUNNING).length}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">System Load</span>
                        <Badge variant="outline">Low</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            <div className="grid gap-4">
              {workflows.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Network className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Workflows Yet</h3>
                    <p className="text-muted-foreground text-center">
                      Submit a request in the chat to create your first automated workflow
                    </p>
                  </CardContent>
                </Card>
              ) : (
                workflows.map((workflow) => (
                  <Card key={workflow.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(workflow.status)}
                          <div>
                            <CardTitle className="text-lg">{workflow.name}</CardTitle>
                            <CardDescription>
                              Started {formatDuration(workflow.startTime)} ago
                              {workflow.currentStep && ` • Current: ${workflow.currentStep}`}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {workflow.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{workflow.progress}%</span>
                        </div>
                        <Progress value={workflow.progress} className="w-full" />
                        
                        {workflow.error && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{workflow.error}</AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </Button>
                          <Button size="sm" variant="outline">
                            <Square className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        {agent.name}
                      </CardTitle>
                      <Badge variant={agent.isActive ? "default" : "secondary"}>
                        {agent.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Domain</span>
                        <Badge variant="outline">{agent.domain}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Capabilities</span>
                        <span>{agent.capabilities.length}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Available Actions:</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.slice(0, 3).map((cap) => (
                            <Badge key={cap.id} variant="secondary" className="text-xs">
                              {cap.name}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{agent.capabilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            {systemMetrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemMetrics.totalWorkflows}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {systemMetrics.totalWorkflows > 0 
                        ? Math.round((systemMetrics.completedWorkflows / systemMetrics.totalWorkflows) * 100)
                        : 0}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{agents.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(systemMetrics.uptime / 60)}m
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Loading Metrics</h3>
                    <p className="text-muted-foreground">System metrics will appear here</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AIAgentOrchestration;