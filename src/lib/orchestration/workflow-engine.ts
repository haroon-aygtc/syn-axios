import { EventEmitter } from 'eventemitter3';
import PQueue from 'p-queue';
import { v4 as uuidv4 } from 'uuid';
import {
  WorkflowEngine,
  Workflow,
  WorkflowStatus,
  WorkflowStep,
  SpecializedAgent,
  AgentTask,
  TaskStatus,
  WorkflowEvent,
  HumanInteraction,
  AgentExecutionResult,
  AgentRegistry
} from './types';

export class WorkflowEngineImpl extends EventEmitter implements WorkflowEngine {
  private agents: Map<string, SpecializedAgent> = new Map();
  private workflows: Map<string, Workflow> = new Map();
  private runningWorkflows: Map<string, Promise<void>> = new Map();
  private taskQueue: PQueue;
  private humanInteractions: Map<string, HumanInteraction> = new Map();

  constructor(concurrency: number = 5) {
    super();
    this.taskQueue = new PQueue({ concurrency });
  }

  registerAgent(agent: SpecializedAgent): void {
    this.agents.set(agent.id, agent);
    console.log(`Agent ${agent.name} registered with workflow engine`);
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    console.log(`Agent ${agentId} unregistered from workflow engine`);
  }

  getAvailableAgents(): SpecializedAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.isActive);
  }

  async executeWorkflow(workflow: Workflow): Promise<void> {
    if (this.runningWorkflows.has(workflow.id)) {
      throw new Error(`Workflow ${workflow.id} is already running`);
    }

    workflow.status = WorkflowStatus.RUNNING;
    workflow.updatedAt = new Date();
    this.workflows.set(workflow.id, workflow);

    const executionPromise = this.executeWorkflowSteps(workflow);
    this.runningWorkflows.set(workflow.id, executionPromise);

    this.emitWorkflowEvent({
      type: 'workflow_started',
      workflowId: workflow.id,
      timestamp: new Date()
    });

    try {
      await executionPromise;
      workflow.status = WorkflowStatus.COMPLETED;
      workflow.updatedAt = new Date();
      
      this.emitWorkflowEvent({
        type: 'workflow_completed',
        workflowId: workflow.id,
        timestamp: new Date()
      });
    } catch (error) {
      workflow.status = WorkflowStatus.FAILED;
      workflow.updatedAt = new Date();
      
      this.emitWorkflowEvent({
        type: 'workflow_failed',
        workflowId: workflow.id,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      });
      
      throw error;
    } finally {
      this.runningWorkflows.delete(workflow.id);
    }
  }

  async pauseWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = WorkflowStatus.PAUSED;
    workflow.updatedAt = new Date();
    
    // Note: In a production system, you'd need to implement proper pause/resume logic
    // This would involve stopping current tasks and saving state
  }

  async resumeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (workflow.status !== WorkflowStatus.PAUSED) {
      throw new Error(`Workflow ${workflowId} is not paused`);
    }

    workflow.status = WorkflowStatus.RUNNING;
    workflow.updatedAt = new Date();
    
    // Resume execution from current step
    await this.executeWorkflow(workflow);
  }

  async cancelWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = WorkflowStatus.CANCELLED;
    workflow.updatedAt = new Date();
    
    // Cancel running promise if exists
    this.runningWorkflows.delete(workflowId);
  }

  getWorkflowStatus(workflowId: string): WorkflowStatus {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    return workflow.status;
  }

  private async executeWorkflowSteps(workflow: Workflow): Promise<void> {
    const stepResults: Map<string, any> = new Map();
    const executedSteps: Set<string> = new Set();
    
    // Group steps by parallel execution
    const stepGroups = this.groupStepsByExecution(workflow.steps);
    
    for (const stepGroup of stepGroups) {
      if (workflow.status === WorkflowStatus.CANCELLED || workflow.status === WorkflowStatus.PAUSED) {
        break;
      }

      // Execute steps in parallel if they're marked as parallel
      const stepPromises = stepGroup.map(step => 
        this.executeStep(workflow, step, stepResults)
      );

      const results = await Promise.allSettled(stepPromises);
      
      // Check if any step failed
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const step = stepGroup[i];
        
        if (result.status === 'rejected') {
          throw new Error(`Step ${step.id} failed: ${result.reason}`);
        }
        
        if (result.status === 'fulfilled') {
          stepResults.set(step.id, result.value);
          executedSteps.add(step.id);
        }
      }
    }
  }

  private async executeStep(
    workflow: Workflow, 
    step: WorkflowStep, 
    stepResults: Map<string, any>
  ): Promise<any> {
    this.emitWorkflowEvent({
      type: 'step_started',
      workflowId: workflow.id,
      stepId: step.id,
      timestamp: new Date()
    });

    try {
      // Check if human approval is required
      if (step.humanApprovalRequired) {
        await this.requestHumanApproval(workflow.id, step);
      }

      // Get the agent for this step
      const agent = this.agents.get(step.agentId);
      if (!agent) {
        throw new Error(`Agent ${step.agentId} not found`);
      }

      // Create task for the agent
      const task: AgentTask = {
        id: uuidv4(),
        type: step.taskType,
        input: this.resolveStepInput(step.input, stepResults, workflow.context),
        context: workflow.context,
        priority: 1,
        retryCount: 0,
        maxRetries: step.retryPolicy?.maxRetries || 3,
        status: TaskStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        parentWorkflowId: workflow.id
      };

      // Execute task with retry logic
      const result = await this.executeTaskWithRetry(agent, task, step.retryPolicy);

      // Evaluate conditions to determine next steps
      const shouldContinue = this.evaluateStepConditions(step, result);
      if (!shouldContinue) {
        throw new Error(`Step ${step.id} conditions not met`);
      }

      this.emitWorkflowEvent({
        type: 'step_completed',
        workflowId: workflow.id,
        stepId: step.id,
        data: result,
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      this.emitWorkflowEvent({
        type: 'step_failed',
        workflowId: workflow.id,
        stepId: step.id,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      });
      throw error;
    }
  }

  private async executeTaskWithRetry(
    agent: SpecializedAgent,
    task: AgentTask,
    retryPolicy?: any
  ): Promise<AgentExecutionResult> {
    const maxRetries = retryPolicy?.maxRetries || 3;
    const baseDelay = retryPolicy?.baseDelay || 1000;
    const maxDelay = retryPolicy?.maxDelay || 10000;
    const backoffStrategy = retryPolicy?.backoffStrategy || 'exponential';

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        task.status = TaskStatus.RUNNING;
        task.retryCount = attempt;
        task.updatedAt = new Date();

        const result = await agent.execute(task);
        
        task.status = TaskStatus.COMPLETED;
        task.updatedAt = new Date();
        
        return result;
      } catch (error) {
        task.status = TaskStatus.FAILED;
        task.updatedAt = new Date();

        if (attempt === maxRetries) {
          throw error;
        }

        // Calculate delay for next retry
        let delay = baseDelay;
        if (backoffStrategy === 'exponential') {
          delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        } else if (backoffStrategy === 'linear') {
          delay = Math.min(baseDelay * (attempt + 1), maxDelay);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`Task failed after ${maxRetries} retries`);
  }

  private groupStepsByExecution(steps: WorkflowStep[]): WorkflowStep[][] {
    // Simple implementation - in production, you'd want more sophisticated dependency resolution
    const groups: WorkflowStep[][] = [];
    let currentGroup: WorkflowStep[] = [];

    for (const step of steps) {
      if (step.parallel && currentGroup.length > 0) {
        currentGroup.push(step);
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [step];
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  private resolveStepInput(
    input: Record<string, any>,
    stepResults: Map<string, any>,
    context: Record<string, any>
  ): Record<string, any> {
    // Simple template resolution - in production, you'd want more sophisticated templating
    const resolved = { ...input };
    
    for (const [key, value] of Object.entries(resolved)) {
      if (typeof value === 'string' && value.startsWith('${')) {
        const reference = value.slice(2, -1);
        if (reference.startsWith('context.')) {
          const contextKey = reference.slice(8);
          resolved[key] = context[contextKey];
        } else if (reference.startsWith('step.')) {
          const [, stepId, outputKey] = reference.split('.');
          const stepResult = stepResults.get(stepId);
          if (stepResult && outputKey) {
            resolved[key] = stepResult.output?.[outputKey];
          }
        }
      }
    }

    return resolved;
  }

  private evaluateStepConditions(step: WorkflowStep, result: AgentExecutionResult): boolean {
    if (!step.conditions || step.conditions.length === 0) {
      return true;
    }

    return step.conditions.every(condition => {
      const fieldValue = this.getFieldValue(result, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        default:
          return true;
      }
    });
  }

  private getFieldValue(obj: any, field: string): any {
    const parts = field.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  private async requestHumanApproval(workflowId: string, step: WorkflowStep): Promise<void> {
    const interaction: HumanInteraction = {
      id: uuidv4(),
      workflowId,
      stepId: step.id,
      type: 'approval',
      prompt: `Approval required for step: ${step.taskType}`,
      status: 'pending',
      createdAt: new Date()
    };

    this.humanInteractions.set(interaction.id, interaction);

    this.emitWorkflowEvent({
      type: 'human_input_required',
      workflowId,
      stepId: step.id,
      data: interaction,
      timestamp: new Date()
    });

    // Wait for human response (in production, this would be handled differently)
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const updated = this.humanInteractions.get(interaction.id);
        if (updated?.status === 'completed') {
          clearInterval(checkInterval);
          resolve();
        } else if (updated?.status === 'cancelled') {
          clearInterval(checkInterval);
          reject(new Error('Human approval cancelled'));
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Human approval timeout'));
      }, 5 * 60 * 1000);
    });
  }

  private emitWorkflowEvent(event: WorkflowEvent): void {
    this.emit('workflow_event', event);
    this.emit(event.type, event);
  }

  // Public method to respond to human interactions
  respondToHumanInteraction(interactionId: string, response: any): void {
    const interaction = this.humanInteractions.get(interactionId);
    if (!interaction) {
      throw new Error(`Interaction ${interactionId} not found`);
    }

    interaction.response = response;
    interaction.status = 'completed';
    interaction.respondedAt = new Date();
  }
}