// Main orchestration system exports
export { orchestrationSystem, OrchestrationSystem } from './system';

// Core components
export { ConductorAgentImpl } from './conductor';
export { AgentRegistryImpl } from './registry';
export { WorkflowEngineImpl } from './workflow-engine';
export { KnowledgeBaseImpl } from './knowledge-base';

// Specialized agents
export { CodeGenerationAgent } from './agents/code-generation-agent';
export { BusinessAnalysisAgent } from './agents/business-analysis-agent';

// Types
export * from './types';

// Utility functions
export const createOrchestrationSystem = () => {
  return new OrchestrationSystem();
};

export const getSystemStatus = () => {
  return orchestrationSystem.getSystemStatus();
};