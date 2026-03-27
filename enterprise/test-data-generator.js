// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/test-data-generator.js
// Description: Generate compliance test questions across standards, knowledge types, and user personas
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { COMPLIANCE_STANDARDS, KNOWLEDGE_TYPES } from './compliance-standards.js';
import { USER_PERSONAS } from './user-personas.js';

// Sample test templates for each combination
export const TEST_TEMPLATES = {
  GDPR: {
    FACTUAL: {
      NOVICE: [
        { q: 'What is GDPR?', expectedTopics: ['regulation', 'privacy', 'EU', 'data protection'] },
        { q: 'What are the main principles of GDPR?', expectedTopics: ['lawfulness', 'fairness', 'transparency', 'purpose limitation'] },
        { q: 'What is the maximum GDPR fine?', expectedTopics: ['20 million', '4%', 'annual turnover'] }
      ],
      PRACTITIONER: [
        { q: 'What are the legal bases for processing under GDPR Article 6?', expectedTopics: ['consent', 'contract', 'legal obligation', 'vital interests', 'public task', 'legitimate interests'] },
        { q: 'What information must be in a GDPR privacy notice?', expectedTopics: ['controller identity', 'purposes', 'legal basis', 'retention', 'rights'] },
        { q: 'What is the difference between a controller and a processor?', expectedTopics: ['determines purposes', 'processes on behalf'] }
      ],
      MANAGER: [
        { q: 'What are the key GDPR principles that guide our data governance?', expectedTopics: ['accountability', 'data minimization', 'storage limitation'] },
        { q: 'What are the main data subject rights under GDPR?', expectedTopics: ['access', 'rectification', 'erasure', 'portability', 'object'] }
      ],
      AUDITOR: [
        { q: 'What documentation is required to demonstrate GDPR accountability?', expectedTopics: ['records of processing', 'DPIA', 'data protection policies', 'processor agreements'] },
        { q: 'What criteria determine if a DPIA is required?', expectedTopics: ['systematic monitoring', 'large scale', 'sensitive data', 'automated decisions'] }
      ]
    },
    
    RELATIONAL: {
      PRACTITIONER: [
        { q: 'How does GDPR Article 30 (Records of Processing Activities) support Article 5 (Principles)?', expectedTopics: ['accountability', 'demonstrate compliance', 'transparency'] },
        { q: 'What is the relationship between GDPR Article 32 (Security) and Article 25 (Data Protection by Design)?', expectedTopics: ['technical measures', 'organizational measures', 'proactive security'] }
      ],
      MANAGER: [
        { q: 'How do GDPR data subject rights relate to our business processes?', expectedTopics: ['request handling', 'system modifications', 'process integration'] }
      ]
    },
    
    PROCEDURAL: {
      PRACTITIONER: [
        { q: 'What are the steps to conduct a GDPR Data Protection Impact Assessment?', expectedTopics: ['describe processing', 'assess necessity', 'identify risks', 'mitigation measures'] },
        { q: 'What is the process for handling a GDPR data subject access request?', expectedTopics: ['verify identity', 'search systems', 'compile data', 'respond within 30 days'] }
      ],
      MANAGER: [
        { q: 'What workflow is needed to ensure GDPR compliance for new projects?', expectedTopics: ['privacy assessment', 'legal review', 'DPIA if needed', 'documentation'] },
        { q: 'What are the steps for GDPR data breach notification?', expectedTopics: ['detect', 'assess', 'notify DPA within 72 hours', 'notify individuals if high risk'] }
      ]
    },
    
    EXACT_MATCH: {
      AUDITOR: [
        { q: 'What does GDPR Article 17 state about the right to erasure?', expectedCitation: 'Article 17', expectedTopics: ['Article 17', 'right to erasure', 'deletion', 'data subject rights'] },
        { q: 'Find the exact text of GDPR Article 25 on data protection by design', expectedCitation: 'Article 25', expectedTopics: ['Article 25', 'data protection by design', 'privacy by default', 'technical measures'] }
      ]
    },
    
    SYNTHESIS: {
      MANAGER: [
        { q: 'Compare GDPR and CCPA consumer rights - what are the key differences?', expectedTopics: ['territorial scope', 'rights differences', 'enforcement'] },
        { q: 'How do GDPR requirements relate to ISO 27001 and ISO 27018?', expectedTopics: ['security controls', 'PII protection', 'cloud services'] }
      ],
      EXECUTIVE: [
        { q: 'What is the business impact of GDPR non-compliance?', expectedTopics: ['fines', 'reputation', 'customer trust', 'market access'] }
      ]
    }
  },
  
  EU_AI_ACT: {
    FACTUAL: {
      NOVICE: [
        { q: 'What is the EU AI Act?', expectedTopics: ['regulation', 'artificial intelligence', 'risk-based', 'EU'] },
        { q: 'What are the risk levels in the EU AI Act?', expectedTopics: ['unacceptable', 'high-risk', 'limited risk', 'minimal risk'] }
      ],
      PRACTITIONER: [
        { q: 'What AI practices are prohibited under the EU AI Act?', expectedTopics: ['social scoring', 'subliminal manipulation', 'exploitation of vulnerabilities', 'biometric categorization'] },
        { q: 'What requirements apply to high-risk AI systems?', expectedTopics: ['risk management', 'data governance', 'transparency', 'human oversight', 'accuracy'] }
      ]
    },
    
    RELATIONAL: {
      PRACTITIONER: [
        { q: 'How does the EU AI Act relate to GDPR for AI systems processing personal data?', expectedTopics: ['data protection', 'compliance overlap', 'transparency requirements'] }
      ]
    },
    
    PROCEDURAL: {
      PRACTITIONER: [
        { q: 'What are the steps for conformity assessment of high-risk AI?', expectedTopics: ['technical documentation', 'quality management', 'testing', 'notified body'] },
        { q: 'How to conduct a fundamental rights impact assessment for AI?', expectedTopics: ['identify affected rights', 'assess risks', 'mitigation measures', 'documentation'] }
      ]
    },
    
    SYNTHESIS: {
      MANAGER: [
        { q: 'Compare EU AI Act and California SB 1047 requirements for large AI models', expectedTopics: ['scope differences', 'compliance obligations', 'enforcement'] }
      ]
    }
  },
  
  ISO_27001: {
    FACTUAL: {
      PRACTITIONER: [
        { q: 'How many controls are in ISO 27001:2022 Annex A?', expectedTopics: ['93 controls', 'Annex A', 'ISO 27001:2022', 'control count'] },
        { q: 'What are the main domains in ISO 27001 Annex A?', expectedTopics: ['organizational', 'people', 'physical', 'technological'] }
      ]
    },
    
    RELATIONAL: {
      PRACTITIONER: [
        { q: 'How does ISO 27001 control A.8.2 (information classification) support other controls?', expectedTopics: ['access control', 'encryption', 'labeling'] },
        { q: 'What is the relationship between ISO 27001 and ISO 27017 for cloud services?', expectedTopics: ['cloud-specific guidance', 'shared responsibility', 'additional controls'] }
      ]
    },
    
    PROCEDURAL: {
      MANAGER: [
        { q: 'What workflow is required for ISO 27001 certification?', expectedTopics: ['gap analysis', 'ISMS implementation', 'internal audit', 'stage 1 audit', 'stage 2 audit'] },
        { q: 'How to perform an ISO 27001 risk assessment?', expectedTopics: ['asset identification', 'threat and vulnerability assessment', 'risk evaluation', 'treatment plan'] }
      ]
    },
    
    EXACT_MATCH: {
      AUDITOR: [
        { q: 'What is the exact requirement of ISO 27001 control A.8.1?', expectedCitation: 'A.8.1', expectedTopics: ['A.8.1', 'inventory of assets', 'asset management', 'asset register'] },
        { q: 'Find ISO 27001 Annex A control 5.7 on threat intelligence', expectedCitation: 'A.5.7', expectedTopics: ['A.5.7', 'threat intelligence', 'threat information', 'security intelligence'] }
      ]
    },
    
    SYNTHESIS: {
      MANAGER: [
        { q: 'Map ISO 27001 Annex A controls to SOC 2 Trust Services Criteria', expectedTopics: ['control mapping', 'coverage analysis', 'gaps'] }
      ]
    }
  },
  
  SOC_2: {
    FACTUAL: {
      NOVICE: [
        { q: 'What is SOC 2?', expectedTopics: ['audit', 'service organization', 'trust services criteria'] },
        { q: 'What are the five Trust Services Criteria?', expectedTopics: ['security', 'availability', 'processing integrity', 'confidentiality', 'privacy'] }
      ],
      PRACTITIONER: [
        { q: 'What is the difference between SOC 2 Type I and Type II?', expectedTopics: ['point in time', 'period of time', 'operating effectiveness'] }
      ]
    },
    
    RELATIONAL: {
      PRACTITIONER: [
        { q: 'How do SOC 2 Common Criteria relate to Additional Criteria?', expectedTopics: ['security baseline', 'optional criteria', 'availability specific'] }
      ]
    },
    
    PROCEDURAL: {
      MANAGER: [
        { q: 'What workflow is needed for SOC 2 Type II readiness?', expectedTopics: ['scoping', 'control design', 'implementation', '6-12 month operating period', 'audit'] },
        { q: 'What are the steps to respond to SOC 2 audit findings?', expectedTopics: ['root cause analysis', 'remediation plan', 'evidence collection', 'retest'] }
      ]
    },
    
    SYNTHESIS: {
      MANAGER: [
        { q: 'Compare SOC 2 and ISO 27001 for cloud service providers', expectedTopics: ['certification vs report', 'scope differences', 'market recognition'] }
      ]
    }
  },
  
  PCI_DSS: {
    FACTUAL: {
      PRACTITIONER: [
        { q: 'What are the 12 requirements of PCI-DSS?', expectedTopics: ['firewall', 'encryption', 'antivirus', 'access control', 'monitoring', 'testing'] }
      ]
    },
    
    EXACT_MATCH: {
      AUDITOR: [
        { q: 'What does PCI-DSS requirement 3.4 state about encryption of cardholder data?', expectedCitation: '3.4', expectedTopics: ['requirement 3.4', 'encryption', 'cardholder data', 'cryptography'] }
      ]
    },
    
    PROCEDURAL: {
      PRACTITIONER: [
        { q: 'What are the steps for PCI-DSS quarterly vulnerability scanning?', expectedTopics: ['approved scanning vendor', 'scan all IPs', 'remediate', 'rescan', 'clean scan'] }
      ]
    }
  },
  
  CSA_CCM: {
    FACTUAL: {
      PRACTITIONER: [
        { q: 'What are the control domains in CSA Cloud Controls Matrix?', expectedTopics: ['application security', 'audit assurance', 'business continuity', 'change control'] }
      ]
    },
    
    RELATIONAL: {
      PRACTITIONER: [
        { q: 'How does CSA CCM map to ISO 27001 and SOC 2?', expectedTopics: ['control crosswalk', 'coverage analysis'] }
      ]
    },
    
    SYNTHESIS: {
      MANAGER: [
        { q: 'Compare CSA STAR Level 1 vs Level 2 vs Level 3', expectedTopics: ['self-assessment', 'third-party audit', 'continuous monitoring'] }
      ]
    }
  },

  ISO_42001: {
    FACTUAL: {
      NOVICE: [
        { q: 'What is ISO 42001?', expectedTopics: ['AI Management System', 'AIMS', 'artificial intelligence', 'governance'] },
        { q: 'Why do organizations need ISO 42001?', expectedTopics: ['AI governance', 'responsible AI', 'risk management', 'compliance'] }
      ],
      PRACTITIONER: [
        { q: 'What are the key components of an AI Management System under ISO 42001?', expectedTopics: ['AI policy', 'risk assessment', 'controls', 'monitoring', 'improvement'] },
        { q: 'How does ISO 42001 help with EU AI Act compliance?', expectedTopics: ['governance framework', 'risk management', 'documentation', 'controls'] }
      ],
      MANAGER: [
        { q: 'What are the business benefits of ISO 42001 certification?', expectedTopics: ['trust', 'competitive advantage', 'regulatory compliance', 'risk mitigation'] }
      ]
    },
    RELATIONAL: {
      PRACTITIONER: [
        { q: 'How does ISO 42001 relate to ISO 27001 for AI systems?', expectedTopics: ['complementary', 'AI-specific', 'governance', 'security overlap'] },
        { q: 'How does ISO 42001 support compliance with EU AI Act and CA SB 1047?', expectedTopics: ['governance framework', 'demonstrates compliance', 'risk management alignment'] }
      ]
    },
    PROCEDURAL: {
      PRACTITIONER: [
        { q: 'What are the steps to implement an AI Management System under ISO 42001?', expectedTopics: ['gap assessment', 'AI inventory', 'risk assessment', 'controls implementation', 'documentation'] },
        { q: 'How to conduct an AI risk assessment per ISO 42001?', expectedTopics: ['identify AI systems', 'assess risks', 'evaluate controls', 'document findings'] }
      ]
    },
    SYNTHESIS: {
      MANAGER: [
        { q: 'Compare ISO 42001 with EU AI Act requirements for AI governance', expectedTopics: ['framework vs regulation', 'voluntary vs mandatory', 'risk-based approach', 'overlap'] }
      ]
    }
  },

  ISO_27035: {
    FACTUAL: {
      PRACTITIONER: [
        { q: 'What is ISO 27035?', expectedTopics: ['incident management', 'security incidents', 'breach response', 'incident handling'] },
        { q: 'What are the phases of incident management in ISO 27035?', expectedTopics: ['detection', 'reporting', 'assessment', 'response', 'recovery', 'lessons learned'] }
      ]
    },
    PROCEDURAL: {
      PRACTITIONER: [
        { q: 'What are the steps for handling a data breach according to ISO 27035?', expectedTopics: ['detect', 'assess severity', 'contain', 'investigate', 'notify', 'recover', 'learn'] },
        { q: 'How to establish an incident response team per ISO 27035?', expectedTopics: ['roles', 'responsibilities', 'training', 'procedures', 'escalation'] }
      ],
      MANAGER: [
        { q: 'What workflow is needed for ISO 27035 incident management implementation?', expectedTopics: ['policy', 'procedures', 'team', 'tools', 'testing', 'improvement'] }
      ]
    },
    RELATIONAL: {
      PRACTITIONER: [
        { q: 'How does ISO 27035 relate to GDPR breach notification requirements?', expectedTopics: ['72 hours', 'notification', 'documentation', 'complementary'] }
      ]
    }
  },

  ISO_20000: {
    FACTUAL: {
      PRACTITIONER: [
        { q: 'What is ISO 20000?', expectedTopics: ['IT Service Management', 'ITSM', 'service quality', 'ITIL'] },
        { q: 'What are the key processes in ISO 20000?', expectedTopics: ['incident management', 'change management', 'service desk', 'problem management'] }
      ]
    },
    PROCEDURAL: {
      PRACTITIONER: [
        { q: 'How to implement ISO 20000 incident management?', expectedTopics: ['incident detection', 'logging', 'categorization', 'prioritization', 'resolution', 'closure'] },
        { q: 'What is the ISO 20000 change management process?', expectedTopics: ['request', 'assessment', 'approval', 'implementation', 'review'] }
      ]
    },
    RELATIONAL: {
      PRACTITIONER: [
        { q: 'How does ISO 20000 complement ISO 27001 for service providers?', expectedTopics: ['service management', 'security management', 'overlapping controls', 'integration'] }
      ]
    }
  },

  ISO_27701: {
    FACTUAL: {
      NOVICE: [
        { q: 'What is ISO 27701?', expectedTopics: ['PIMS', 'privacy extension', 'ISO 27001', 'PII'] },
        { q: 'What does PIMS stand for in ISO 27701?', expectedTopics: ['Privacy Information Management System', 'ISO 27001 extension'] }
      ],
      PRACTITIONER: [
        { q: 'How does ISO 27701 extend ISO 27001?', expectedTopics: ['privacy controls', 'PII controller', 'PII processor', 'additional guidance'] },
        { q: 'What are the key privacy controls in ISO 27701?', expectedTopics: ['consent', 'data minimization', 'purpose limitation', 'PII processing'] },
        { q: 'What is the difference between a PII controller and PII processor under ISO 27701?', expectedTopics: ['determines purposes', 'processes on behalf', 'contractual obligations'] }
      ],
      MANAGER: [
        { q: 'Why would we implement ISO 27701 in addition to ISO 27001?', expectedTopics: ['privacy focus', 'GDPR alignment', 'PII management', 'certification'] }
      ]
    },
    RELATIONAL: {
      PRACTITIONER: [
        { q: 'How does ISO 27701 relate to GDPR requirements?', expectedTopics: ['complementary', 'privacy controls', 'GDPR alignment', 'demonstrates compliance'] },
        { q: 'What is the relationship between ISO 27701 and ISO 27001 Annex A controls?', expectedTopics: ['extends', 'additional controls', 'privacy-specific', 'complements existing'] }
      ]
    },
    PROCEDURAL: {
      PRACTITIONER: [
        { q: 'What are the steps to implement ISO 27701 on top of existing ISO 27001?', expectedTopics: ['gap analysis', 'PII mapping', 'additional controls', 'PIMS documentation'] }
      ]
    },
    EXACT_MATCH: {
      AUDITOR: [
        { q: 'What does ISO 27701 control 7.2.2 state about determining lawful basis?', expectedCitation: '7.2.2', expectedTopics: ['control 7.2.2', 'lawful basis', 'PII processing', 'legal basis'] }
      ]
    },
    SYNTHESIS: {
      MANAGER: [
        { q: 'Compare ISO 27701 and GDPR privacy requirements - what are the differences?', expectedTopics: ['framework vs regulation', 'certification vs compliance', 'PII focus', 'international vs EU'] }
      ]
    }
  }
};

export function generateTests(standard, knowledgeType, persona) {
  const templates = TEST_TEMPLATES[standard]?.[knowledgeType]?.[persona];
  if (!templates) return [];
  
  return templates.map((template, idx) => ({
    id: standard + '_' + knowledgeType + '_' + persona + '_' + (idx + 1),
    category: 'compliance_knowledge',
    vendor: 'Generic',
    standard,
    knowledgeType,
    persona,
    question: template.q,
    expectedTopics: template.expectedTopics || [],
    expectedCitation: template.expectedCitation || null,
    retrievalStrategy: KNOWLEDGE_TYPES[knowledgeType].retrievalStrategy,
    complexity: USER_PERSONAS[persona].expertise
  }));
}

export function generateAllTests() {
  const allTests = [];
  
  for (const [stdKey, stdInfo] of Object.entries(TEST_TEMPLATES)) {
    for (const [ktKey, ktTests] of Object.entries(stdInfo)) {
      for (const [personaKey, tests] of Object.entries(ktTests)) {
        allTests.push(...generateTests(stdKey, ktKey, personaKey));
      }
    }
  }
  
  return allTests;
}

export function getTestsByStandard(standard) {
  return generateAllTests().filter(t => t.standard === standard);
}

export function getTestsByKnowledgeType(knowledgeType) {
  return generateAllTests().filter(t => t.knowledgeType === knowledgeType);
}

export function getTestsByPersona(persona) {
  return generateAllTests().filter(t => t.persona === persona);
}

export function getTestStats() {
  const allTests = generateAllTests();
  const stats = {
    total: allTests.length,
    byStandard: {},
    byKnowledgeType: {},
    byPersona: {}
  };
  
  allTests.forEach(test => {
    stats.byStandard[test.standard] = (stats.byStandard[test.standard] || 0) + 1;
    stats.byKnowledgeType[test.knowledgeType] = (stats.byKnowledgeType[test.knowledgeType] || 0) + 1;
    stats.byPersona[test.persona] = (stats.byPersona[test.persona] || 0) + 1;
  });
  
  return stats;
}
