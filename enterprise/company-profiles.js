// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/company-profiles.js
// Description: Company size and industry profile definitions for context-aware compliance testing
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

export const COMPANY_PROFILES = {
  STARTUP: {
    name: 'Early Stage Startup',
    size: '5-20 employees',
    revenue: '< $1M',
    complianceMaturity: 'minimal',
    priorityStandards: ['GDPR_basics', 'CCPA_basics', 'basic_security'],
    concerns: ['cost', 'speed', 'minimal overhead'],
    queryStyle: 'cost-conscious'
  },
  
  SMB: {
    name: 'Small-Medium Business',
    size: '50-500 employees',
    revenue: '$5M-$50M',
    complianceMaturity: 'developing',
    priorityStandards: ['GDPR', 'ISO_27001', 'SOC_2'],
    concerns: ['resource constraints', 'competitive advantage', 'customer requirements'],
    queryStyle: 'practical'
  },
  
  ENTERPRISE: {
    name: 'Large Enterprise',
    size: '1000+ employees',
    revenue: '$100M+',
    complianceMaturity: 'mature',
    priorityStandards: ['ISO_27001', 'SOC_2', 'multiple_frameworks'],
    concerns: ['comprehensive compliance', 'global operations', 'regulatory oversight'],
    queryStyle: 'comprehensive'
  },
  
  SAAS_PROVIDER: {
    name: 'SaaS/Cloud Service Provider',
    size: '100-1000 employees',
    revenue: '$10M-$100M',
    complianceMaturity: 'advanced',
    priorityStandards: ['SOC_2', 'ISO_27001', 'ISO_27017', 'ISO_27018', 'CSA_STAR'],
    concerns: ['customer trust', 'market differentiation', 'data residency'],
    queryStyle: 'cloud-focused'
  },
  
  HEALTHCARE: {
    name: 'Healthcare Organization',
    size: 'varies',
    revenue: 'varies',
    complianceMaturity: 'required',
    priorityStandards: ['HIPAA', 'GDPR_if_EU', 'ISO_27001'],
    concerns: ['patient privacy', 'regulatory penalties', 'breach notification'],
    queryStyle: 'healthcare-specific'
  },
  
  FINANCIAL_SERVICES: {
    name: 'Financial Services Company',
    size: 'varies',
    revenue: 'varies',
    complianceMaturity: 'required',
    priorityStandards: ['PCI_DSS', 'SOX', 'GLBA', 'SOC_2', 'ISO_27001'],
    concerns: ['financial data protection', 'regulatory audits', 'fraud prevention'],
    queryStyle: 'financial-regulatory'
  },
  
  PUBLIC_SECTOR: {
    name: 'Government/Public Sector',
    size: 'varies',
    revenue: 'N/A',
    complianceMaturity: 'mandated',
    priorityStandards: ['FEDRAMP', 'NIST_CSF', 'NIST_800_53', 'FISMA'],
    concerns: ['citizen data protection', 'procurement requirements', 'transparency'],
    queryStyle: 'government-focused'
  },
  
  AI_COMPANY: {
    name: 'AI/ML Company',
    size: '50-500 employees',
    revenue: '$5M-$100M',
    complianceMaturity: 'emerging',
    priorityStandards: ['EU_AI_ACT', 'CA_SB_1047', 'GDPR', 'SOC_2'],
    concerns: ['AI safety', 'transparency', 'ethical AI', 'bias mitigation'],
    queryStyle: 'ai-focused'
  }
};

export const COMPANY_CONTEXT_QUERIES = {
  STARTUP: {
    examples: [
      'What is the minimum we need to do for GDPR compliance?',
      'Can we self-certify for any compliance frameworks?',
      'What compliance work can we defer until Series A?'
    ]
  },
  
  SMB: {
    examples: [
      'Our customer is requesting SOC 2 - how long will it take?',
      'Should we pursue ISO 27001 or SOC 2 first?',
      'Can we leverage existing security work for compliance?'
    ]
  },
  
  ENTERPRISE: {
    examples: [
      'How do we harmonize compliance across 20 countries?',
      'What is our compliance portfolio strategy?',
      'How to manage multiple concurrent audits?'
    ]
  },
  
  SAAS_PROVIDER: {
    examples: [
      'What cloud-specific security certifications do customers expect?',
      'How do we demonstrate shared responsibility model compliance?',
      'What certifications give us competitive advantage?'
    ]
  },
  
  HEALTHCARE: {
    examples: [
      'Are we a HIPAA covered entity or business associate?',
      'What safeguards are required for ePHI in the cloud?',
      'How to handle patient data breach notification?'
    ]
  },
  
  FINANCIAL_SERVICES: {
    examples: [
      'What PCI-DSS level applies to our transaction volume?',
      'How to demonstrate SOX IT controls?',
      'What are GLBA Safeguards Rule requirements?'
    ]
  },
  
  PUBLIC_SECTOR: {
    examples: [
      'What FedRAMP impact level do we need?',
      'How to implement NIST 800-53 controls?',
      'What are continuous monitoring requirements?'
    ]
  },
  
  AI_COMPANY: {
    examples: [
      'Is our LLM application high-risk under EU AI Act?',
      'What transparency obligations apply to our AI product?',
      'How to document our AI training data governance?'
    ]
  }
};

export function getRelevantStandards(companyProfile) {
  return COMPANY_PROFILES[companyProfile]?.priorityStandards || [];
}

export function getCompanyContextQueries(companyProfile) {
  return COMPANY_CONTEXT_QUERIES[companyProfile]?.examples || [];
}
