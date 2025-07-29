import { EventEmitter } from 'eventemitter3';
import { ConductorAgentImpl } from './conductor';
import { AgentRegistryImpl } from './registry';
import { WorkflowEngineImpl } from './workflow-engine';
import { KnowledgeBaseImpl } from './knowledge-base';
import { CodeGenerationAgent } from './agents/code-generation-agent';
import { BusinessAnalysisAgent } from './agents/business-analysis-agent';
import {
  Workflow,
  WorkflowStatus,
  SpecializedAgent,
  SystemMetrics,
  AgentMetrics,
  WorkflowEvent,
  HumanInteraction
} from './types';

export class OrchestrationSystem extends EventEmitter {
  private conductor: ConductorAgentImpl;
  private agentRegistry: AgentRegistryImpl;
  private workflowEngine: WorkflowEngineImpl;
  private knowledgeBase: KnowledgeBaseImpl;
  private isInitialized: boolean = false;
  private metrics: {
    totalWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
    startTime: Date;
  };

  constructor() {
    super();
    
    // Initialize core components
    this.agentRegistry = new AgentRegistryImpl();
    this.knowledgeBase = new KnowledgeBaseImpl();
    this.workflowEngine = new WorkflowEngineImpl();
    this.conductor = new ConductorAgentImpl(
      this.agentRegistry,
      this.knowledgeBase,
      this.workflowEngine
    );

    this.metrics = {
      totalWorkflows: 0,
      completedWorkflows: 0,
      failedWorkflows: 0,
      startTime: new Date()
    };

    this.setupEventHandlers();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Register default agents
      await this.registerDefaultAgents();
      
      // Initialize knowledge base with system information
      await this.initializeKnowledgeBase();
      
      this.isInitialized = true;
      this.emit('system_initialized');
      
      console.log('AI Agent Orchestration System initialized successfully');
    } catch (error) {
      console.error('Failed to initialize orchestration system:', error);
      throw error;
    }
  }

  async processUserRequest(request: string, context?: Record<string, any>): Promise<{
    workflowId: string;
    workflow: Workflow;
    status: WorkflowStatus;
  }> {
    if (!this.isInitialized) {
      throw new Error('System not initialized. Call initialize() first.');
    }

    try {
      // Plan the workflow
      const workflow = await this.conductor.planWorkflow(request, context);
      this.metrics.totalWorkflows++;

      // Start execution
      this.executeWorkflowAsync(workflow.id);

      return {
        workflowId: workflow.id,
        workflow,
        status: workflow.status
      };
    } catch (error) {
      this.metrics.failedWorkflows++;
      throw error;
    }
  }

  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus> {
    return await this.conductor.getWorkflowStatus(workflowId);
  }

  async pauseWorkflow(workflowId: string): Promise<void> {
    await this.conductor.pauseWorkflow(workflowId);
  }

  async resumeWorkflow(workflowId: string): Promise<void> {
    await this.conductor.resumeWorkflow(workflowId);
  }

  async cancelWorkflow(workflowId: string): Promise<void> {
    await this.conductor.cancelWorkflow(workflowId);
  }

  registerAgent(agent: SpecializedAgent): void {
    this.agentRegistry.register(agent);
    this.workflowEngine.registerAgent(agent);
    this.emit('agent_registered', { agentId: agent.id, name: agent.name });
  }

  unregisterAgent(agentId: string): void {
    this.agentRegistry.unregister(agentId);
    this.workflowEngine.unregisterAgent(agentId);
    this.emit('agent_unregistered', { agentId });
  }

  getAvailableAgents(): SpecializedAgent[] {
    return this.agentRegistry.getAll();
  }

  getAgentsByDomain(domain: string): SpecializedAgent[] {
    return this.agentRegistry.getByDomain(domain);
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const agentStats = this.agentRegistry.getAgentStats();
    const knowledgeStats = await this.knowledgeBase.getStorageStats();
    const uptime = Date.now() - this.metrics.startTime.getTime();

    // Calculate agent metrics (simplified)
    const agentMetrics: AgentMetrics[] = this.getAvailableAgents().map(agent => ({
      agentId: agent.id,
      totalExecutions: 0, // Would be tracked in production
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      averageConfidence: 0.85
    }));

    return {
      totalWorkflows: this.metrics.totalWorkflows,
      activeWorkflows: 0, // Would track active workflows
      completedWorkflows: this.metrics.completedWorkflows,
      failedWorkflows: this.metrics.failedWorkflows,
      averageWorkflowDuration: 0, // Would calculate from historical data
      agentMetrics,
      systemLoad: 0.3, // Would calculate actual system load
      uptime: uptime / 1000 // Convert to seconds
    };
  }

  async addKnowledge(content: string, metadata?: Record<string, any>): Promise<string> {
    return await this.knowledgeBase.addDocument(content, metadata);
  }

  async searchKnowledge(query: string, limit?: number): Promise<any[]> {
    return await this.knowledgeBase.search(query, limit);
  }

  respondToHumanInteraction(interactionId: string, response: any): void {
    this.workflowEngine.respondToHumanInteraction(interactionId, response);
  }

  private async executeWorkflowAsync(workflowId: string): Promise<void> {
    try {
      await this.conductor.executeWorkflow(workflowId);
      this.metrics.completedWorkflows++;
    } catch (error) {
      this.metrics.failedWorkflows++;
      console.error(`Workflow ${workflowId} failed:`, error);
    }
  }

  private async registerDefaultAgents(): Promise<void> {
    // Register core agents
    const codeAgent = new CodeGenerationAgent();
    const businessAgent = new BusinessAnalysisAgent();

    this.registerAgent(codeAgent);
    this.registerAgent(businessAgent);

    console.log('Default agents registered successfully');
  }

  private async initializeKnowledgeBase(): Promise<void> {
    // Add system documentation and capabilities
    await this.knowledgeBase.addDocument(`
AI Agent Orchestration System Documentation

This system provides intelligent automation through specialized AI agents that work together to accomplish complex tasks.

Core Components:
1. Conductor Agent - Plans and orchestrates workflows
2. Specialized Agents - Execute specific domain tasks
3. Knowledge Base - Stores and retrieves contextual information
4. Workflow Engine - Manages task execution and state

Available Agents:
- Code Generation Agent: Generates and reviews code in multiple languages
- Business Analysis Agent: Analyzes requirements and creates system specifications

The system supports:
- Multi-step workflow automation
- Human-in-the-loop interactions
- Parallel task execution
- Error handling and retry logic
- Real-time monitoring and metrics
    `, {
      type: 'system_documentation',
      version: '1.0.0',
      category: 'core'
    });

    // Add agent capabilities to knowledge base
    for (const agent of this.getAvailableAgents()) {
      await this.knowledgeBase.addDocument(`
Agent: ${agent.name}
Domain: ${agent.domain}
Description: ${agent.description}

Capabilities:
${agent.capabilities.map(cap => `- ${cap.name}: ${cap.description}`).join('\n')}
      `, {
        type: 'agent_documentation',
        agentId: agent.id,
        domain: agent.domain
      });
    }

    console.log('Knowledge base initialized with system documentation');
  }

  private setupEventHandlers(): void {
    // Listen to workflow engine events
    this.workflowEngine.on('workflow_event', (event: WorkflowEvent) => {
      this.emit('workflow_event', event);
      
      // Log important events
      switch (event.type) {
        case 'workflow_started':
          console.log(`Workflow ${event.workflowId} started`);
          break;
        case 'workflow_completed':
          console.log(`Workflow ${event.workflowId} completed successfully`);
          break;
        case 'workflow_failed':
          console.error(`Workflow ${event.workflowId} failed:`, event.data);
          break;
        case 'human_input_required':
          console.log(`Human input required for workflow ${event.workflowId}, step ${event.stepId}`);
          this.emit('human_input_required', event.data);
          break;
      }
    });

    // Handle system errors
    this.on('error', (error) => {
      console.error('System error:', error);
    });
  }

  // Utility methods for system management
  async shutdown(): Promise<void> {
    console.log('Shutting down AI Agent Orchestration System...');
    
    // Cancel all running workflows
    // In production, you'd want to gracefully handle this
    
    this.removeAllListeners();
    console.log('System shutdown complete');
  }

  getSystemStatus(): {
    initialized: boolean;
    agentCount: number;
    uptime: number;
    metrics: typeof this.metrics;
  } {
    return {
      initialized: this.isInitialized,
      agentCount: this.getAvailableAgents().length,
      uptime: Date.now() - this.metrics.startTime.getTime(),
      metrics: { ...this.metrics }
    };
  }
}

// Export singleton instance
export const orchestrationSystem = new OrchestrationSystem();