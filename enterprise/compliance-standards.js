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

  ISO_27701: {
    name: 'Privacy Information Management System',
    category: 'privacy-framework',
    jurisdiction: 'International',
    year: 2019,
    keyTopics: ['PIMS', 'privacy controls', 'PII processing', 'extends ISO 27001', 'data protection'],
    description: 'Privacy extension to ISO 27001, provides guidance for PII controllers and processors',
    retrievalNeeds: ['knowledge_graph', 'vector_db', 'exact_match']
  },

  ISO_27002: {
    name: 'Information Security Controls',
    category: 'security-guidance',
    jurisdiction: 'International',
    year: 2022,
    controls: 93,
    keyTopics: ['security controls', 'implementation guidance', 'best practices', 'complements ISO 27001'],
    description: 'Code of practice providing implementation guidance for ISO 27001 controls',
    retrievalNeeds: ['procedural', 'vector_db']
  },

  ISO_22301: {
    name: 'Business Continuity Management',
    category: 'business-continuity',
    jurisdiction: 'International',
    year: 2019,
    keyTopics: ['BCMS', 'business continuity', 'disaster recovery', 'resilience'],
    retrievalNeeds: ['procedural', 'knowledge_graph']
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
  
  // NIST Standards
  NIST_800_53: {
    name: 'NIST Security and Privacy Controls',
    category: 'security-framework',
    jurisdiction: 'US Federal',
    year: 2020,
    controls: 1000,
    keyTopics: ['security controls catalog', 'privacy controls', 'federal systems', 'control baselines'],
    description: 'Comprehensive catalog of security and privacy controls for federal systems',
    retrievalNeeds: ['exact_match', 'knowledge_graph', 'vector_db']
  },

  NIST_800_171: {
    name: 'Protecting Controlled Unclassified Information',
    category: 'data-security',
    jurisdiction: 'US Federal',
    year: 2020,
    requirements: 110,
    keyTopics: ['CUI protection', 'contractor requirements', 'CMMC alignment'],
    retrievalNeeds: ['exact_match', 'procedural']
  },

  // Cloud Security
  CSA_STAR: {
    name: 'Cloud Security Alliance Security Trust Assurance and Risk',
    category: 'cloud-security',
    jurisdiction: 'International',
    year: 2023,
    levels: ['Level 1: Self-assessment', 'Level 2: Third-party audit', 'Level 3: Continuous monitoring'],
    keyTopics: ['cloud security certification', 'transparency', 'CCM alignment', 'public registry'],
    retrievalNeeds: ['knowledge_graph', 'procedural']
  },

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
  },

  // Additional Cloud Security Standards
  ISO_IEC_27050: {
    name: 'Electronic Discovery',
    category: 'data-security',
    jurisdiction: 'International',
    year: 2016,
    keyTopics: ['eDiscovery', 'data preservation', 'legal hold', 'ESI'],
    retrievalNeeds: ['procedural', 'exact_match']
  },

  SSAE_18: {
    name: 'Statement on Standards for Attestation Engagements No. 18',
    category: 'audit-standard',
    jurisdiction: 'US',
    year: 2017,
    keyTopics: ['SOC audit standard', 'service organization controls', 'attestation'],
    description: 'Audit standard that defines requirements for SOC 1, SOC 2, and SOC 3 reports',
    retrievalNeeds: ['procedural', 'exact_match']
  },

  COBIT: {
    name: 'Control Objectives for Information and Related Technologies',
    category: 'it-governance',
    jurisdiction: 'International',
    year: 2019,
    version: 'COBIT 2019',
    domains: ['EDM (Evaluate, Direct, Monitor)', 'APO (Align, Plan, Organize)', 'BAI (Build, Acquire, Implement)', 'DSS (Deliver, Service, Support)', 'MEA (Monitor, Evaluate, Assess)'],
    keyTopics: ['IT governance', 'enterprise governance', 'value optimization', 'risk management'],
    retrievalNeeds: ['knowledge_graph', 'procedural', 'vector_db']
  },

  CMMC: {
    name: 'Cybersecurity Maturity Model Certification',
    category: 'data-security',
    jurisdiction: 'US Federal',
    year: 2023,
    version: 'CMMC 2.0',
    levels: ['Level 1: Foundational', 'Level 2: Advanced', 'Level 3: Expert'],
    keyTopics: ['defense contractors', 'CUI protection', 'NIST 800-171', 'certification'],
    retrievalNeeds: ['knowledge_graph', 'procedural']
  },

  // Financial & Audit
  SOX: {
    name: 'Sarbanes-Oxley Act',
    category: 'financial-compliance',
    jurisdiction: 'US',
    year: 2002,
    keyTopics: ['financial reporting', 'IT general controls', 'audit requirements', 'ITGC'],
    retrievalNeeds: ['procedural', 'exact_match']
  },

  GLBA: {
    name: 'Gramm-Leach-Bliley Act',
    category: 'financial-privacy',
    jurisdiction: 'US',
    year: 1999,
    keyTopics: ['financial privacy', 'safeguards rule', 'privacy notice', 'consumer information'],
    retrievalNeeds: ['exact_match', 'procedural']
  },

  // International Privacy
  PIPEDA: {
    name: 'Personal Information Protection and Electronic Documents Act',
    category: 'privacy',
    jurisdiction: 'Canada',
    year: 2000,
    keyTopics: ['Canadian privacy law', 'fair information principles', 'consent', 'accountability'],
    retrievalNeeds: ['vector_db', 'exact_match']
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
