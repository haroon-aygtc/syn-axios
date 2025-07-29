import { v4 as uuidv4 } from 'uuid';
import { callAIProvider } from '../../ai';
import { 
  SpecializedAgent, 
  AgentCapability, 
  AgentTask, 
  AgentExecutionResult 
} from '../types';

export class BusinessAnalysisAgent implements SpecializedAgent {
  public readonly id: string;
  public readonly name: string = 'Business Analysis Agent';
  public readonly description: string = 'Analyzes business requirements and generates system specifications';
  public readonly domain: string = 'business';
  public readonly version: string = '1.0.0';
  public readonly isActive: boolean = true;

  public readonly capabilities: AgentCapability[] = [
    {
      id: 'analyze_requirements',
      name: 'analyze_requirements',
      description: 'Analyze business requirements and create detailed specifications',
      inputSchema: {
        type: 'object',
        properties: {
          businessType: { type: 'string' },
          requirements: { type: 'string' },
          industry: { type: 'string', optional: true },
          size: { type: 'string', optional: true }
        },
        required: ['businessType', 'requirements']
      },
      outputSchema: {
        type: 'object',
        properties: {
          modules: { type: 'array' },
          dataSchema: { type: 'object' },
          workflows: { type: 'array' },
          integrations: { type: 'array' }
        }
      },
      domain: 'business'
    },
    {
      id: 'generate_module_spec',
      name: 'generate_module_spec',
      description: 'Generate detailed specifications for business modules',
      inputSchema: {
        type: 'object',
        properties: {
          moduleName: { type: 'string' },
          businessContext: { type: 'string' },
          requirements: { type: 'array' }
        },
        required: ['moduleName', 'businessContext']
      },
      outputSchema: {
        type: 'object',
        properties: {
          specification: { type: 'object' },
          dataModel: { type: 'object' },
          apiEndpoints: { type: 'array' },
          userInterface: { type: 'object' }
        }
      },
      domain: 'business'
    }
  ];

  constructor() {
    this.id = uuidv4();
  }

  async execute(task: AgentTask): Promise<AgentExecutionResult> {
    try {
      switch (task.type) {
        case 'analyze_requirements':
          return await this.analyzeRequirements(task);
        case 'generate_module_spec':
          return await this.generateModuleSpec(task);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        confidence: 0
      };
    }
  }

  private async analyzeRequirements(task: AgentTask): Promise<AgentExecutionResult> {
    const { businessType, requirements, industry, size } = task.input;

    const prompt = `
You are a senior business analyst specializing in system architecture and business process optimization.

Analyze the following business requirements and provide a comprehensive system specification:

Business Type: ${businessType}
Industry: ${industry || 'Not specified'}
Company Size: ${size || 'Not specified'}

Requirements:
${requirements}

Based on this information, provide a detailed analysis including:

1. Recommended business modules (CRM, HR, Finance, Orders, etc.)
2. Data schema requirements for each module
3. Key business workflows that need to be automated
4. Required integrations with external systems
5. Priority levels for each component

Respond in the following JSON format:
{
  "modules": [
    {
      "name": "CRM",
      "priority": "high",
      "description": "Customer relationship management",
      "features": ["contact management", "lead tracking", "sales pipeline"],
      "dataEntities": ["Customer", "Lead", "Opportunity", "Contact"]
    }
  ],
  "dataSchema": {
    "Customer": {
      "fields": {
        "id": "string",
        "name": "string",
        "email": "string",
        "phone": "string",
        "createdAt": "datetime"
      },
      "relationships": {
        "orders": "hasMany:Order",
        "contacts": "hasMany:Contact"
      }
    }
  },
  "workflows": [
    {
      "name": "Lead to Customer Conversion",
      "description": "Process for converting leads to customers",
      "steps": ["Lead qualification", "Proposal creation", "Contract signing", "Customer onboarding"],
      "triggers": ["New lead created", "Lead status changed"],
      "automationLevel": "high"
    }
  ],
  "integrations": [
    {
      "name": "Email Marketing Platform",
      "type": "external",
      "purpose": "Customer communication",
      "priority": "medium"
    }
  ],
  "confidence": 0.9
}
`;

    const response = await callAIProvider({
      provider: 'openai',
      prompt,
      options: {
        temperature: 0.4,
        maxTokens: 3000,
        responseFormat: { type: 'json_object' }
      }
    });

    const result = JSON.parse(response);

    return {
      success: true,
      output: {
        modules: result.modules || [],
        dataSchema: result.dataSchema || {},
        workflows: result.workflows || [],
        integrations: result.integrations || []
      },
      confidence: result.confidence || 0.85,
      metadata: {
        businessType,
        industry,
        size,
        analyzedAt: new Date().toISOString(),
        moduleCount: result.modules?.length || 0
      }
    };
  }

  private async generateModuleSpec(task: AgentTask): Promise<AgentExecutionResult> {
    const { moduleName, businessContext, requirements = [] } = task.input;

    const prompt = `
You are a senior system architect. Generate a detailed specification for the "${moduleName}" module.

Business Context:
${businessContext}

Specific Requirements:
${requirements.join('\n')}

Create a comprehensive module specification including:

1. Detailed feature list
2. Data model with entities and relationships
3. API endpoints (REST)
4. User interface components and layouts
5. Business rules and validation logic
6. Integration points with other modules
7. Security and permission requirements

Respond in JSON format:
{
  "specification": {
    "name": "${moduleName}",
    "description": "Detailed description",
    "features": [
      {
        "name": "Feature name",
        "description": "Feature description",
        "priority": "high|medium|low",
        "complexity": "simple|medium|complex"
      }
    ],
    "businessRules": [
      {
        "rule": "Business rule description",
        "validation": "Validation logic",
        "impact": "What happens when rule is violated"
      }
    ]
  },
  "dataModel": {
    "entities": {
      "EntityName": {
        "fields": {
          "id": { "type": "uuid", "required": true, "primaryKey": true },
          "name": { "type": "string", "required": true, "maxLength": 255 }
        },
        "relationships": {
          "relatedEntity": { "type": "belongsTo", "entity": "RelatedEntity" }
        },
        "indexes": ["name", "createdAt"],
        "permissions": {
          "create": ["admin", "manager"],
          "read": ["admin", "manager", "user"],
          "update": ["admin", "manager"],
          "delete": ["admin"]
        }
      }
    }
  },
  "apiEndpoints": [
    {
      "method": "GET",
      "path": "/api/module/entities",
      "description": "List all entities",
      "parameters": {
        "page": "number",
        "limit": "number",
        "filter": "string"
      },
      "response": {
        "data": "array",
        "pagination": "object"
      },
      "permissions": ["read"]
    }
  ],
  "userInterface": {
    "pages": [
      {
        "name": "List View",
        "path": "/module/list",
        "components": ["DataTable", "SearchFilter", "ActionButtons"],
        "permissions": ["read"]
      }
    ],
    "components": [
      {
        "name": "EntityForm",
        "type": "form",
        "fields": ["name", "description", "status"],
        "validation": "client and server-side",
        "permissions": ["create", "update"]
      }
    ]
  },
  "integrations": [
    {
      "module": "User Management",
      "type": "internal",
      "purpose": "Authentication and permissions",
      "dataExchange": ["userId", "permissions"]
    }
  ],
  "confidence": 0.88
}
`;

    const response = await callAIProvider({
      provider: 'openai',
      prompt,
      options: {
        temperature: 0.3,
        maxTokens: 4000,
        responseFormat: { type: 'json_object' }
      }
    });

    const result = JSON.parse(response);

    return {
      success: true,
      output: {
        specification: result.specification,
        dataModel: result.dataModel,
        apiEndpoints: result.apiEndpoints || [],
        userInterface: result.userInterface,
        integrations: result.integrations || []
      },
      confidence: result.confidence || 0.85,
      metadata: {
        moduleName,
        generatedAt: new Date().toISOString(),
        entityCount: Object.keys(result.dataModel?.entities || {}).length,
        endpointCount: result.apiEndpoints?.length || 0
      }
    };
  }

  getCapabilities(): AgentCapability[] {
    return this.capabilities;
  }

  validate(input: Record<string, any>): boolean {
    return !!(input.businessType && input.requirements);
  }
}