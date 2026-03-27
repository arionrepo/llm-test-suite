// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/user-personas.js
// Description: User persona definitions for compliance testing - different expertise levels and information needs
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

export const USER_PERSONAS = {
  NOVICE: {
    name: 'Novice User',
    description: 'New to compliance, needs basic definitions and simple explanations',
    expertise: 'beginner',
    queryStyle: 'simple',
    needsExplanations: true,
    exampleQueries: [
      'What is GDPR?',
      'Why do we need ISO 27001?',
      'What does compliance mean?'
    ],
    expectedBehavior: {
      responseStyle: 'educational',
      includesDefinitions: true,
      usesAnalogies: true,
      avoidsJargon: true
    }
  },
  
  PRACTITIONER: {
    name: 'Compliance Practitioner',
    description: 'Understands standards, needs implementation details and technical guidance',
    expertise: 'intermediate',
    queryStyle: 'technical',
    needsExplanations: false,
    exampleQueries: [
      'How do I implement GDPR Article 30 records?',
      'What encryption is required for PCI-DSS 3.4?',
      'How to configure cloud logging for SOC 2 CC7.2?'
    ],
    expectedBehavior: {
      responseStyle: 'technical',
      includesSteps: true,
      includesExamples: true,
      referencesSpecificControls: true
    }
  },
  
  MANAGER: {
    name: 'Compliance Manager',
    description: 'Needs high-level workflows, resource planning, and process oversight',
    expertise: 'advanced',
    queryStyle: 'strategic',
    needsExplanations: false,
    exampleQueries: [
      'What workflow is needed for SOC 2 Type II readiness?',
      'How long does GDPR DPIA typically take?',
      'What resources are required for ISO 27001 certification?',
      'What are the key milestones for FedRAMP authorization?'
    ],
    expectedBehavior: {
      responseStyle: 'strategic',
      includesTimelines: true,
      includesResourceNeeds: false, // Per CLAUDE.md - no resource estimates in agentic workflow
      includesWorkflows: true,
      identifiesDependencies: true
    }
  },
  
  AUDITOR: {
    name: 'Auditor / Assessor',
    description: 'Needs verification criteria, evidence requirements, and audit procedures',
    expertise: 'expert',
    queryStyle: 'verification',
    needsExplanations: false,
    exampleQueries: [
      'What evidence is required for ISO 27001 A.8.2?',
      'How to verify HIPAA encryption compliance?',
      'What audit procedures test SOC 2 CC6.1?',
      'How to validate GDPR data subject request process?'
    ],
    expectedBehavior: {
      responseStyle: 'verification-focused',
      includesEvidenceRequirements: true,
      includesTestProcedures: true,
      citesExactRequirements: true
    }
  },
  
  EXECUTIVE: {
    name: 'Executive / C-Suite',
    description: 'Needs risk summaries, business impact, and strategic decisions',
    expertise: 'advanced',
    queryStyle: 'business-focused',
    needsExplanations: false,
    exampleQueries: [
      'What is our risk exposure if we do not comply with EU AI Act?',
      'What business impact does SOC 2 certification have?',
      'What are the strategic benefits of ISO 27001?',
      'What are the penalties for GDPR non-compliance?'
    ],
    expectedBehavior: {
      responseStyle: 'executive-summary',
      includesRiskSummary: true,
      includesBusinessImpact: true,
      avoidsTechnicalDetails: true,
      focusesOnOutcomes: true
    }
  },
  
  DEVELOPER: {
    name: 'Software Developer',
    description: 'Needs secure coding requirements, technical implementation guidance',
    expertise: 'advanced',
    queryStyle: 'code-focused',
    needsExplanations: false,
    exampleQueries: [
      'How to implement GDPR right to erasure in our API?',
      'What secure coding practices does PCI-DSS require?',
      'How to log access for SOC 2 compliance?',
      'What encryption libraries meet HIPAA requirements?'
    ],
    expectedBehavior: {
      responseStyle: 'code-oriented',
      includesCodeExamples: true,
      includesTechnicalSpecs: true,
      referencesStandards: true
    }
  }
};

export const PERSONA_QUERY_COMPLEXITY = {
  NOVICE: {
    knowledgeTypes: ['FACTUAL', 'EXACT_MATCH'],
    complexity: 'simple',
    expectedTokens: '50-150'
  },
  
  PRACTITIONER: {
    knowledgeTypes: ['PROCEDURAL', 'FACTUAL', 'RELATIONAL'],
    complexity: 'medium',
    expectedTokens: '150-400'
  },
  
  MANAGER: {
    knowledgeTypes: ['PROCEDURAL', 'SYNTHESIS', 'RELATIONAL'],
    complexity: 'medium-high',
    expectedTokens: '200-500'
  },
  
  AUDITOR: {
    knowledgeTypes: ['EXACT_MATCH', 'PROCEDURAL', 'RELATIONAL'],
    complexity: 'high',
    expectedTokens: '250-600'
  },
  
  EXECUTIVE: {
    knowledgeTypes: ['SYNTHESIS', 'FACTUAL'],
    complexity: 'high',
    expectedTokens: '100-300'
  },
  
  DEVELOPER: {
    knowledgeTypes: ['PROCEDURAL', 'FACTUAL', 'EXACT_MATCH'],
    complexity: 'medium-high',
    expectedTokens: '200-500'
  }
};

export function getPersonasByExpertise(level) {
  return Object.entries(USER_PERSONAS)
    .filter(([key, persona]) => persona.expertise === level)
    .map(([key, persona]) => ({ key, ...persona }));
}

export function getPersonaQueryTypes(personaKey) {
  return PERSONA_QUERY_COMPLEXITY[personaKey]?.knowledgeTypes || [];
}
