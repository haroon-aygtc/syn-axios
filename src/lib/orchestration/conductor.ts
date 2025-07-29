import { v4 as uuidv4 } from 'uuid';
import { callAIProvider } from '../ai';
import { 
  ConductorAgent, 
  Workflow, 
  WorkflowStep, 
  WorkflowStatus, 
  AgentRegistry,
  KnowledgeBase,
  WorkflowEngine,
  TaskStatus
} from './types';

export class ConductorAgentImpl implements ConductorAgent {
  public readonly id: string;
  public readonly name: string;
  
  private agentRegistry: AgentRegistry;
  private knowledgeBase: KnowledgeBase;
  private workflowEngine: WorkflowEngine;
  private workflows: Map<string, Workflow> = new Map();

  constructor(
    agentRegistry: AgentRegistry,
    knowledgeBase: KnowledgeBase,
    workflowEngine: WorkflowEngine,
    name: string = 'ConductorAgent'
  ) {
    this.id = uuidv4();
    this.name = name;
    this.agentRegistry = agentRegistry;
    this.knowledgeBase = knowledgeBase;
    this.workflowEngine = workflowEngine;
  }

  async planWorkflow(userRequest: string, context: Record<string, any> = {}): Promise<Workflow> {
    try {
      // Retrieve relevant context from knowledge base
      const relevantContext = await this.knowledgeBase.search(userRequest, 5);
      
      // Get available agents and their capabilities
      const availableAgents = this.agentRegistry.getAll();
      const agentCapabilities = availableAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        domain: agent.domain,
        capabilities: agent.capabilities
      }));

      // Create planning prompt for the LLM
      const planningPrompt = this.createPlanningPrompt(
        userRequest, 
        context, 
        relevantContext, 
        agentCapabilities
      );

      // Use LLM to generate workflow plan
      const response = await callAIProvider({
        provider: 'openai',
        prompt: planningPrompt,
        options: {
          temperature: 0.3,
          maxTokens: 2000,
          responseFormat: { type: 'json_object' }
        }
      });

      const workflowPlan = JSON.parse(response);
      
      // Create workflow object
      const workflow: Workflow = {
        id: uuidv4(),
        name: workflowPlan.name || `Workflow for: ${userRequest.substring(0, 50)}...`,
        description: workflowPlan.description || userRequest,
        steps: this.validateAndCreateSteps(workflowPlan.steps),
        status: WorkflowStatus.CREATED,
        context: { ...context, userRequest, relevantContext },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        metadata: {
          originalRequest: userRequest,
          planningConfidence: workflowPlan.confidence || 0.8
        }
      };

      // Store workflow
      this.workflows.set(workflow.id, workflow);
      await this.knowledgeBase.store(`workflow:${workflow.id}`, workflow);

      return workflow;
    } catch (error) {
      throw new Error(`Failed to plan workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async executeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = WorkflowStatus.RUNNING;
    workflow.updatedAt = new Date();
    
    try {
      await this.workflowEngine.executeWorkflow(workflow);
    } catch (error) {
      workflow.status = WorkflowStatus.FAILED;
      workflow.updatedAt = new Date();
      throw error;
    }
  }

  async pauseWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    await this.workflowEngine.pauseWorkflow(workflowId);
    workflow.status = WorkflowStatus.PAUSED;
    workflow.updatedAt = new Date();
  }

  async resumeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    await this.workflowEngine.resumeWorkflow(workflowId);
    workflow.status = WorkflowStatus.RUNNING;
    workflow.updatedAt = new Date();
  }

  async cancelWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    await this.workflowEngine.cancelWorkflow(workflowId);
    workflow.status = WorkflowStatus.CANCELLED;
    workflow.updatedAt = new Date();
  }

  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    return workflow.status;
  }

  private createPlanningPrompt(
    userRequest: string,
    context: Record<string, any>,
    relevantContext: any[],
    agentCapabilities: any[]
  ): string {
    return `
You are an AI Conductor Agent responsible for planning workflows to fulfill user requests. 
Analyze the user request and create a detailed execution plan using available agents.

USER REQUEST: ${userRequest}

CONTEXT: ${JSON.stringify(context, null, 2)}

RELEVANT KNOWLEDGE: ${JSON.stringify(relevantContext, null, 2)}

AVAILABLE AGENTS AND CAPABILITIES:
${JSON.stringify(agentCapabilities, null, 2)}

Create a workflow plan with the following JSON structure:
{
  "name": "Descriptive workflow name",
  "description": "Detailed description of what this workflow accomplishes",
  "confidence": 0.85,
  "steps": [
    {
      "id": "step_1",
      "agentId": "agent_id_from_available_agents",
      "taskType": "specific_task_type",
      "input": {
        "key": "value"
      },
      "conditions": [
        {
          "field": "output.success",
          "operator": "equals",
          "value": true,
          "nextStepId": "step_2"
        }
      ],
      "parallel": false,
      "humanApprovalRequired": false,
      "retryPolicy": {
        "maxRetries": 3,
        "backoffStrategy": "exponential",
        "baseDelay": 1000,
        "maxDelay": 10000
      }
    }
  ]
}

IMPORTANT GUIDELINES:
1. Only use agents that exist in the available agents list
2. Ensure task types match agent capabilities
3. Create logical step dependencies and conditions
4. Consider parallel execution where appropriate
5. Add human approval for critical or irreversible actions
6. Provide realistic confidence scores
7. Include proper error handling and retry policies
8. Make steps atomic and focused on single responsibilities

Respond with valid JSON only.
`;
  }

  private validateAndCreateSteps(steps: any[]): WorkflowStep[] {
    return steps.map((step, index) => {
      // Validate agent exists
      const agent = this.agentRegistry.get(step.agentId);
      if (!agent) {
        throw new Error(`Agent ${step.agentId} not found in registry`);
      }

      // Validate task type matches agent capabilities
      const hasCapability = agent.capabilities.some(cap => cap.name === step.taskType);
      if (!hasCapability) {
        throw new Error(`Agent ${step.agentId} does not have capability ${step.taskType}`);
      }

      return {
        id: step.id || `step_${index + 1}`,
        agentId: step.agentId,
        taskType: step.taskType,
        input: step.input || {},
        conditions: step.conditions || [],
        parallel: step.parallel || false,
        humanApprovalRequired: step.humanApprovalRequired || false,
        retryPolicy: step.retryPolicy || {
          maxRetries: 3,
          backoffStrategy: 'exponential',
          baseDelay: 1000,
          maxDelay: 10000
        }
      };
    });
  }
}