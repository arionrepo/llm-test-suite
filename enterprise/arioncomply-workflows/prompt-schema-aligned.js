// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/arioncomply-workflows/prompt-schema-aligned.js
// Description: Aligned with ArionComply prompt_templates database schema - tiers, intent categories, framework types
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-24

/**
 * ArionComply Prompt Structure (from database):
 * 
 * prompt_templates table:
 * - template_key (unique identifier)
 * - tier (1: base, 2: framework/mode, 3: context)
 * - template_name (human-readable name)
 * - content (actual prompt text)
 * - variables (dynamic variables for substitution)
 * - intent_categories (array of intents this prompt handles)
 * - framework_types (array of frameworks this applies to)
 * - priority (higher = used first)
 * - active (boolean)
 * - created_at, updated_at, deleted_at
 */

export const ARIONCOMPLY_INTENT_CATEGORIES = [
  // Core intents
  'general_question',
  'assessment',
  'implementation',
  'documentation',
  'audit_preparation',
  
  // Framework-specific
  'gdpr_guidance',
  'iso27001_guidance',
  'soc2_guidance',
  'euai_guidance',
  
  // Feature-specific
  'evidence_management',
  'risk_management',
  'policy_management',
  'vendor_management',
  'incident_management',
  'ai_governance',
  
  // Data operations
  'data_subject_request',
  'privacy_operations',
  'data_classification',
  
  // Reporting
  'compliance_reporting',
  'dashboard_navigation',
  'report_generation'
];

export const FRAMEWORK_TYPES = [
  'gdpr',
  'iso27001',
  'iso27017',
  'iso27018',
  'soc2',
  'nist_csf',
  'pci_dss',
  'hipaa',
  'ccpa',
  'cpra',
  'eu_ai_act',
  'csa_ccm',
  'fedramp',
  'cis_controls'
];

export const PROMPT_TIER_DEFINITIONS = {
  TIER_1: {
    tier: 1,
    name: 'Base System',
    description: 'Core ArionComply identity and capabilities',
    priority: 100,
    examples: ['base_system'],
    alwaysIncluded: true
  },
  
  TIER_2: {
    tier: 2,
    name: 'Situation-Specific',
    description: 'Framework expertise or operational mode guidance',
    priority: '70-90',
    examples: ['framework_gdpr', 'framework_iso27001', 'mode_assessment', 'mode_implementation'],
    triggeredBy: 'intent detection or framework context'
  },
  
  TIER_3: {
    tier: 3,
    name: 'Context Enrichment',
    description: 'Organization-specific context and customization',
    priority: '50-60',
    examples: ['context_org_profile'],
    variables: ['industry', 'org_size', 'region', 'frameworks', 'maturity_level']
  }
};

// Tests aligned with database schema
export const SCHEMA_ALIGNED_TESTS = {
  intentCategoryAccuracy: {
    description: 'Test if model correctly identifies intent_categories from user queries',
    tests: [
      {
        userQuery: "What are GDPR requirements for data retention?",
        expectedIntentCategories: ['gdpr_guidance', 'general_question'],
        expectedFrameworkTypes: ['gdpr'],
        expectedTier2Prompt: 'framework_gdpr'
      },
      {
        userQuery: "How do I assess control implementation status?",
        expectedIntentCategories: ['assessment', 'general_question'],
        expectedFrameworkTypes: null,
        expectedTier2Prompt: 'mode_assessment'
      },
      {
        userQuery: "Walk me through setting up MFA",
        expectedIntentCategories: ['implementation', 'documentation'],
        expectedFrameworkTypes: null,
        expectedTier2Prompt: 'mode_implementation'
      },
      {
        userQuery: "How do I prepare for our ISO 27001 audit?",
        expectedIntentCategories: ['audit_preparation', 'iso27001_guidance'],
        expectedFrameworkTypes: ['iso27001'],
        expectedTier2Prompt: ['framework_iso27001', 'mode_audit']
      }
    ]
  },
  
  promptTierSelection: {
    description: 'Test if correct tier combination is selected based on query',
    tests: [
      {
        userQuery: "Help",
        expectedTiers: [1, 2],
        expectedTier2: 'mode_general',
        contextRequired: false
      },
      {
        userQuery: "What does GDPR Article 30 require?",
        expectedTiers: [1, 2],
        expectedTier2: 'framework_gdpr',
        contextRequired: false
      },
      {
        userQuery: "What compliance gaps do we have in our organization?",
        expectedTiers: [1, 2, 3],
        expectedTier2: 'mode_assessment',
        expectedTier3: 'context_org_profile',
        contextRequired: true,
        requiredVariables: ['frameworks', 'maturity_level']
      }
    ]
  },
  
  variableSubstitution: {
    description: 'Test if TIER 3 variables are properly used in context',
    tests: [
      {
        userQuery: "What should our company focus on for compliance?",
        tier3Variables: {
          industry: 'SaaS',
          org_size: 'SMB',
          region: 'EU',
          frameworks: ['iso27001', 'gdpr'],
          maturity_level: 'developing'
        },
        expectedResponseCharacteristics: [
          'mentions SaaS-specific concerns',
          'appropriate for SMB resources',
          'addresses EU regulatory environment',
          'suggests ISO 27001 and GDPR focus',
          'accounts for developing maturity level'
        ]
      }
    ]
  }
};

export function getSchemaAlignedTests() {
  const allTests = [];
  
  for (const [category, testSet] of Object.entries(SCHEMA_ALIGNED_TESTS)) {
    testSet.tests.forEach((test, idx) => {
      allTests.push({
        id: category + '_' + (idx + 1),
        testCategory: category,
        ...test
      });
    });
  }
  
  return allTests;
}
