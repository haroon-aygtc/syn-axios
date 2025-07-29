import { v4 as uuidv4 } from 'uuid';
import { callAIProvider } from '../../ai';
import { 
  SpecializedAgent, 
  AgentCapability, 
  AgentTask, 
  AgentExecutionResult 
} from '../types';

export class CodeGenerationAgent implements SpecializedAgent {
  public readonly id: string;
  public readonly name: string = 'Code Generation Agent';
  public readonly description: string = 'Generates code in various programming languages based on specifications';
  public readonly domain: string = 'development';
  public readonly version: string = '1.0.0';
  public readonly isActive: boolean = true;

  public readonly capabilities: AgentCapability[] = [
    {
      id: 'generate_code',
      name: 'generate_code',
      description: 'Generate code based on specifications',
      inputSchema: {
        type: 'object',
        properties: {
          language: { type: 'string', enum: ['javascript', 'typescript', 'python', 'java', 'go', 'rust'] },
          specification: { type: 'string' },
          framework: { type: 'string', optional: true },
          style: { type: 'string', optional: true }
        },
        required: ['language', 'specification']
      },
      outputSchema: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          explanation: { type: 'string' },
          dependencies: { type: 'array', items: { type: 'string' } }
        }
      },
      domain: 'development'
    },
    {
      id: 'review_code',
      name: 'review_code',
      description: 'Review code for quality, security, and best practices',
      inputSchema: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          language: { type: 'string' },
          criteria: { type: 'array', items: { type: 'string' } }
        },
        required: ['code', 'language']
      },
      outputSchema: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          issues: { type: 'array' },
          suggestions: { type: 'array' }
        }
      },
      domain: 'development'
    }
  ];

  constructor() {
    this.id = uuidv4();
  }

  async execute(task: AgentTask): Promise<AgentExecutionResult> {
    try {
      switch (task.type) {
        case 'generate_code':
          return await this.generateCode(task);
        case 'review_code':
          return await this.reviewCode(task);
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

  private async generateCode(task: AgentTask): Promise<AgentExecutionResult> {
    const { language, specification, framework, style } = task.input;

    const prompt = `
You are an expert software developer. Generate high-quality, production-ready code based on the following specification:

Language: ${language}
Framework: ${framework || 'None specified'}
Code Style: ${style || 'Standard best practices'}

Specification:
${specification}

Requirements:
1. Write clean, readable, and maintainable code
2. Follow best practices for the specified language
3. Include proper error handling
4. Add meaningful comments where necessary
5. Ensure code is secure and performant

Provide your response in the following JSON format:
{
  "code": "// Your generated code here",
  "explanation": "Brief explanation of the code and approach",
  "dependencies": ["list", "of", "required", "dependencies"],
  "confidence": 0.95
}
`;

    const response = await callAIProvider({
      provider: 'openai',
      prompt,
      options: {
        temperature: 0.3,
        maxTokens: 2000,
        responseFormat: { type: 'json_object' }
      }
    });

    const result = JSON.parse(response);

    return {
      success: true,
      output: {
        code: result.code,
        explanation: result.explanation,
        dependencies: result.dependencies || []
      },
      confidence: result.confidence || 0.8,
      metadata: {
        language,
        framework,
        generatedAt: new Date().toISOString()
      }
    };
  }

  private async reviewCode(task: AgentTask): Promise<AgentExecutionResult> {
    const { code, language, criteria = ['quality', 'security', 'performance', 'maintainability'] } = task.input;

    const prompt = `
You are an expert code reviewer. Review the following ${language} code against these criteria: ${criteria.join(', ')}.

Code to review:
\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive review with:
1. Overall quality score (0-100)
2. Specific issues found
3. Suggestions for improvement
4. Security concerns (if any)
5. Performance considerations

Respond in JSON format:
{
  "score": 85,
  "issues": [
    {
      "type": "security",
      "severity": "high",
      "description": "Issue description",
      "line": 10,
      "suggestion": "How to fix"
    }
  ],
  "suggestions": [
    "General improvement suggestions"
  ],
  "summary": "Overall assessment",
  "confidence": 0.9
}
`;

    const response = await callAIProvider({
      provider: 'openai',
      prompt,
      options: {
        temperature: 0.2,
        maxTokens: 1500,
        responseFormat: { type: 'json_object' }
      }
    });

    const result = JSON.parse(response);

    return {
      success: true,
      output: {
        score: result.score,
        issues: result.issues || [],
        suggestions: result.suggestions || [],
        summary: result.summary
      },
      confidence: result.confidence || 0.85,
      reviewRequired: result.score < 70, // Flag for human review if score is low
      metadata: {
        language,
        criteria,
        reviewedAt: new Date().toISOString()
      }
    };
  }

  getCapabilities(): AgentCapability[] {
    return this.capabilities;
  }

  validate(input: Record<string, any>): boolean {
    // Basic validation - in production, use a proper schema validator
    if (input.language && typeof input.language === 'string') {
      const supportedLanguages = ['javascript', 'typescript', 'python', 'java', 'go', 'rust'];
      return supportedLanguages.includes(input.language);
    }
    return false;
  }
}