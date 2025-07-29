import { AgentRegistry, SpecializedAgent } from './types';

export class AgentRegistryImpl implements AgentRegistry {
  private agents: Map<string, SpecializedAgent> = new Map();
  private domainIndex: Map<string, Set<string>> = new Map();
  private capabilityIndex: Map<string, Set<string>> = new Map();

  register(agent: SpecializedAgent): void {
    // Store agent
    this.agents.set(agent.id, agent);

    // Index by domain
    if (!this.domainIndex.has(agent.domain)) {
      this.domainIndex.set(agent.domain, new Set());
    }
    this.domainIndex.get(agent.domain)!.add(agent.id);

    // Index by capabilities
    agent.capabilities.forEach(capability => {
      if (!this.capabilityIndex.has(capability.name)) {
        this.capabilityIndex.set(capability.name, new Set());
      }
      this.capabilityIndex.get(capability.name)!.add(agent.id);
    });

    console.log(`Agent ${agent.name} (${agent.id}) registered successfully`);
  }

  unregister(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Remove from main registry
    this.agents.delete(agentId);

    // Remove from domain index
    const domainAgents = this.domainIndex.get(agent.domain);
    if (domainAgents) {
      domainAgents.delete(agentId);
      if (domainAgents.size === 0) {
        this.domainIndex.delete(agent.domain);
      }
    }

    // Remove from capability index
    agent.capabilities.forEach(capability => {
      const capabilityAgents = this.capabilityIndex.get(capability.name);
      if (capabilityAgents) {
        capabilityAgents.delete(agentId);
        if (capabilityAgents.size === 0) {
          this.capabilityIndex.delete(capability.name);
        }
      }
    });

    console.log(`Agent ${agent.name} (${agentId}) unregistered successfully`);
  }

  get(agentId: string): SpecializedAgent | undefined {
    return this.agents.get(agentId);
  }

  getAll(): SpecializedAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.isActive);
  }

  getByDomain(domain: string): SpecializedAgent[] {
    const agentIds = this.domainIndex.get(domain);
    if (!agentIds) {
      return [];
    }

    return Array.from(agentIds)
      .map(id => this.agents.get(id))
      .filter((agent): agent is SpecializedAgent => agent !== undefined && agent.isActive);
  }

  getByCapability(capability: string): SpecializedAgent[] {
    const agentIds = this.capabilityIndex.get(capability);
    if (!agentIds) {
      return [];
    }

    return Array.from(agentIds)
      .map(id => this.agents.get(id))
      .filter((agent): agent is SpecializedAgent => agent !== undefined && agent.isActive);
  }

  // Additional utility methods
  getDomains(): string[] {
    return Array.from(this.domainIndex.keys());
  }

  getCapabilities(): string[] {
    return Array.from(this.capabilityIndex.keys());
  }

  getAgentStats(): { total: number; active: number; byDomain: Record<string, number> } {
    const total = this.agents.size;
    const active = this.getAll().length;
    const byDomain: Record<string, number> = {};

    this.domainIndex.forEach((agentIds, domain) => {
      byDomain[domain] = Array.from(agentIds)
        .map(id => this.agents.get(id))
        .filter(agent => agent && agent.isActive).length;
    });

    return { total, active, byDomain };
  }

  // Search agents by multiple criteria
  search(criteria: {
    domain?: string;
    capability?: string;
    name?: string;
    isActive?: boolean;
  }): SpecializedAgent[] {
    let agents = Array.from(this.agents.values());

    if (criteria.domain) {
      agents = agents.filter(agent => agent.domain === criteria.domain);
    }

    if (criteria.capability) {
      agents = agents.filter(agent => 
        agent.capabilities.some(cap => cap.name === criteria.capability)
      );
    }

    if (criteria.name) {
      agents = agents.filter(agent => 
        agent.name.toLowerCase().includes(criteria.name!.toLowerCase())
      );
    }

    if (criteria.isActive !== undefined) {
      agents = agents.filter(agent => agent.isActive === criteria.isActive);
    }

    return agents;
  }
}