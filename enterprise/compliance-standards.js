// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/compliance-standards.js
// Description: Compliance standards taxonomy - definitions, categories, knowledge requirements for enterprise testing
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

export const COMPLIANCE_STANDARDS = {
  // Privacy & Data Protection
  GDPR: {
    name: 'EU General Data Protection Regulation',
    category: 'privacy',
    jurisdiction: 'EU',
    year: 2018,
    articles: 99,
    keyTopics: ['data subject rights', 'lawful basis', 'accountability', 'privacy by design'],
    retrievalNeeds: ['knowledge_graph', 'vector_db', 'exact_match']
  },
  
  CCPA: {
    name: 'California Consumer Privacy Act',
    category: 'privacy',
    jurisdiction: 'California',
    year: 2018,
    keyTopics: ['consumer rights', 'sale of data', 'opt-out', 'disclosure'],
    retrievalNeeds: ['vector_db', 'exact_match']
  },
  
  CPRA: {
    name: 'California Privacy Rights Act',
    category: 'privacy',
    jurisdiction: 'California',
    year: 2020,
    keyTopics: ['sensitive personal info', 'risk assessments', 'data minimization', 'enforcement'],
    retrievalNeeds: ['knowledge_graph', 'vector_db']
  },
  
  HIPAA: {
    name: 'Health Insurance Portability and Accountability Act',
    category: 'healthcare-privacy',
    jurisdiction: 'US',
    year: 1996,
    keyTopics: ['PHI protection', 'business associates', 'security rule', 'breach notification'],
    retrievalNeeds: ['knowledge_graph', 'exact_match', 'procedural']
  },
  
  // AI-Specific Regulations
  EU_AI_ACT: {
    name: 'EU Artificial Intelligence Act',
    category: 'ai-regulation',
    jurisdiction: 'EU',
    year: 2024,
    keyTopics: ['risk classification', 'prohibited practices', 'high-risk AI', 'transparency', 'conformity assessment'],
    retrievalNeeds: ['knowledge_graph', 'decision_trees', 'exact_match']
  },
  
  CA_SB_1047: {
    name: 'California Safe and Secure Innovation for Frontier AI Models Act',
    category: 'ai-regulation',
    jurisdiction: 'California',
    year: 2024,
    keyTopics: ['frontier AI models', 'safety protocols', 'incident reporting', 'compute thresholds'],
    retrievalNeeds: ['vector_db', 'exact_match']
  },
  
  CA_AB_2013: {
    name: 'California Automated Decision-Making Tools',
    category: 'ai-transparency',
    jurisdiction: 'California',
    year: 2024,
    keyTopics: ['automated decisions', 'disclosure requirements', 'impact assessments'],
    retrievalNeeds: ['procedural', 'exact_match']
  },
  
  // Security Frameworks
  ISO_27001: {
    name: 'Information Security Management System',
    category: 'security-framework',
    jurisdiction: 'International',
    year: 2022,
    controls: 93,
    keyTopics: ['ISMS', 'risk management', 'Annex A controls', 'certification'],
    retrievalNeeds: ['knowledge_graph', 'vector_db', 'exact_match']
  },
  
  ISO_27017: {
    name: 'Cloud Services Security Controls',
    category: 'cloud-security',
    jurisdiction: 'International',
    year: 2015,
    keyTopics: ['cloud provider controls', 'cloud customer controls', 'shared responsibility'],
    retrievalNeeds: ['knowledge_graph', 'vector_db']
  },
  
  ISO_27018: {
    name: 'Cloud PII Protection',
    category: 'cloud-privacy',
    jurisdiction: 'International',
    year: 2019,
    keyTopics: ['PII in cloud', 'cloud processor obligations', 'customer consent'],
    retrievalNeeds: ['vector_db', 'exact_match']
  },
  
  SOC_2: {
    name: 'Service Organization Control 2',
    category: 'security-framework',
    jurisdiction: 'US',
    year: 2017,
    trustCriteria: ['security', 'availability', 'processing integrity', 'confidentiality', 'privacy'],
    keyTopics: ['trust services criteria', 'control activities', 'audit requirements'],
    retrievalNeeds: ['knowledge_graph', 'procedural', 'exact_match']
  },
  
  NIST_CSF: {
    name: 'NIST Cybersecurity Framework',
    category: 'security-framework',
    jurisdiction: 'US',
    year: 2024,
    functions: ['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
    keyTopics: ['cyber risk management', 'framework core', 'implementation tiers'],
    retrievalNeeds: ['knowledge_graph', 'vector_db']
  },
  
  CIS_CONTROLS: {
    name: 'CIS Critical Security Controls',
    category: 'security-framework',
    jurisdiction: 'International',
    year: 2021,
    controls: 18,
    keyTopics: ['asset management', 'secure configuration', 'incident response'],
    retrievalNeeds: ['procedural', 'exact_match']
  },
  
  // Payment & Financial
  PCI_DSS: {
    name: 'Payment Card Industry Data Security Standard',
    category: 'payment-security',
    jurisdiction: 'International',
    year: 2022,
    requirements: 12,
    keyTopics: ['cardholder data', 'network security', 'vulnerability management', 'access control'],
    retrievalNeeds: ['exact_match', 'procedural', 'knowledge_graph']
  },
  
  // Cloud Security
  CSA_CCM: {
    name: 'Cloud Controls Matrix',
    category: 'cloud-security',
    jurisdiction: 'International',
    year: 2023,
    domains: 17,
    keyTopics: ['cloud control domains', 'shared responsibility', 'CSP assessment'],
    retrievalNeeds: ['knowledge_graph', 'vector_db', 'matrix_lookup']
  },
  
  FEDRAMP: {
    name: 'Federal Risk and Authorization Management Program',
    category: 'cloud-security',
    jurisdiction: 'US Federal',
    year: 2011,
    impactLevels: ['Low', 'Moderate', 'High'],
    keyTopics: ['federal cloud security', 'authorization', 'continuous monitoring', 'NIST 800-53'],
    retrievalNeeds: ['knowledge_graph', 'exact_match', 'procedural']
  }
};

export const KNOWLEDGE_TYPES = {
  FACTUAL: {
    name: 'Factual Knowledge',
    description: 'Direct facts, definitions, specific requirements',
    retrievalStrategy: 'vector_db',
    examples: ['What is the GDPR fine limit?', 'How many ISO 27001 controls exist?']
  },
  
  RELATIONAL: {
    name: 'Relational Knowledge',
    description: 'Relationships between entities, cross-references, dependencies',
    retrievalStrategy: 'knowledge_graph',
    examples: ['How does GDPR Article 30 support Article 5?', 'Which ISO controls implement SOC 2 CC6.1?']
  },
  
  PROCEDURAL: {
    name: 'Procedural Knowledge',
    description: 'Step-by-step processes, implementation guidance, workflows',
    retrievalStrategy: 'structured_retrieval',
    examples: ['How to conduct GDPR DPIA?', 'Steps for SOC 2 readiness assessment?']
  },
  
  EXACT_MATCH: {
    name: 'Exact Match Knowledge',
    description: 'Precise citations, regulation numbers, specific clauses',
    retrievalStrategy: 'meilisearch',
    examples: ['Find GDPR Article 17 text', 'Locate PCI-DSS requirement 3.4']
  },
  
  SYNTHESIS: {
    name: 'Synthesis Knowledge',
    description: 'Multi-document analysis, comparison, gap assessment',
    retrievalStrategy: 'rag_synthesis',
    examples: ['Compare ISO 27001 and SOC 2 encryption requirements', 'Map NIST CSF to CIS Controls']
  }
};

export function getStandardsByCategory(category) {
  return Object.entries(COMPLIANCE_STANDARDS)
    .filter(([key, std]) => std.category === category)
    .map(([key, std]) => ({ key, ...std }));
}

export function getStandardsByJurisdiction(jurisdiction) {
  return Object.entries(COMPLIANCE_STANDARDS)
    .filter(([key, std]) => std.jurisdiction === jurisdiction)
    .map(([key, std]) => ({ key, ...std }));
}

export function getAIRegulations() {
  return getStandardsByCategory('ai-regulation')
    .concat(getStandardsByCategory('ai-transparency'));
}

export function getCloudSecurityStandards() {
  return getStandardsByCategory('cloud-security')
    .concat(getStandardsByCategory('cloud-privacy'));
}
