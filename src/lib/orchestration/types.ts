// Core types for the AI Agent Orchestration Platform
import { EventEmitter } from 'eventemitter3';

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  requiredTools?: string[];
  domain: string;
}

export interface AgentTask {
  id: string;
  type: string;
  input: Record<string, any>;
  context?: Record<string, any>;
  priority: number;
  retryCount: number;
  maxRetries: number;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  parentWorkflowId?: string;
  dependencies?: string[];
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  WAITING_FOR_HUMAN = 'waiting_for_human'
}

export enum WorkflowStatus {
  CREATED = 'created',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  taskType: string;
  input: Record<string, any>;
  conditions?: WorkflowCondition[];
  parallel?: boolean;
  humanApprovalRequired?: boolean;
  retryPolicy?: RetryPolicy;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  nextStepId?: string;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential';
  baseDelay: number;
  maxDelay: number;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  currentStepId?: string;
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  metadata?: Record<string, any>;
}

export interface AgentExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  metadata?: Record<string, any>;
  confidence?: number;
  reviewRequired?: boolean;
}

export interface AgentReviewResult {
  approved: boolean;
  confidence: number;
  feedback: string;
  suggestedChanges?: string[];
  reviewerId: string;
}

export interface SpecializedAgent {
  id: string;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  domain: string;
  version: string;
  isActive: boolean;
  execute(task: AgentTask): Promise<AgentExecutionResult>;
  validate?(input: Record<string, any>): boolean;
  getCapabilities(): AgentCapability[];
}

export interface ConductorAgent {
  id: string;
  name: string;
  planWorkflow(userRequest: string, context?: Record<string, any>): Promise<Workflow>;
  executeWorkflow(workflowId: string): Promise<void>;
  pauseWorkflow(workflowId: string): Promise<void>;
  resumeWorkflow(workflowId: string): Promise<void>;
  cancelWorkflow(workflowId: string): Promise<void>;
  getWorkflowStatus(workflowId: string): Promise<WorkflowStatus>;
}

export interface KnowledgeBase {
  store(key: string, value: any, metadata?: Record<string, any>): Promise<void>;
  retrieve(key: string): Promise<any>;
  search(query: string, limit?: number): Promise<SearchResult[]>;
  embed(text: string): Promise<number[]>;
  addDocument(content: string, metadata?: Record<string, any>): Promise<string>;
  deleteDocument(id: string): Promise<void>;
}

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface WorkflowEngine extends EventEmitter {
  executeWorkflow(workflow: Workflow): Promise<void>;
  pauseWorkflow(workflowId: string): Promise<void>;
  resumeWorkflow(workflowId: string): Promise<void>;
  cancelWorkflow(workflowId: string): Promise<void>;
  getWorkflowStatus(workflowId: string): WorkflowStatus;
  registerAgent(agent: SpecializedAgent): void;
  unregisterAgent(agentId: string): void;
  getAvailableAgents(): SpecializedAgent[];
}

export interface ToolAdapter {
  id: string;
  name: string;
  description: string;
  execute(action: string, parameters: Record<string, any>): Promise<any>;
  validate(action: string, parameters: Record<string, any>): boolean;
  getAvailableActions(): string[];
}

export interface AgentRegistry {
  register(agent: SpecializedAgent): void;
  unregister(agentId: string): void;
  get(agentId: string): SpecializedAgent | undefined;
  getAll(): SpecializedAgent[];
  getByDomain(domain: string): SpecializedAgent[];
  getByCapability(capability: string): SpecializedAgent[];
}

export interface WorkflowEvent {
  type: 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 'step_started' | 'step_completed' | 'step_failed' | 'human_input_required';
  workflowId: string;
  stepId?: string;
  data?: any;
  timestamp: Date;
}

export interface HumanInteraction {
  id: string;
  workflowId: string;
  stepId: string;
  type: 'approval' | 'input' | 'clarification';
  prompt: string;
  options?: string[];
  response?: any;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  respondedAt?: Date;
}

export interface AIProviderConfig {
  name: string;
  apiKey: string;
  baseUrl?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface AgentMetrics {
  agentId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionTime?: Date;
  averageConfidence: number;
}

export interface SystemMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  averageWorkflowDuration: number;
  agentMetrics: AgentMetrics[];
  systemLoad: number;
  uptime: number;
}