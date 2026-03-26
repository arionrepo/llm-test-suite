// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/prompts/org-profiles.js
// Description: Organization Profile Templates for TIER 3 context generation
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26
//
// Organization profiles simulate different customer scenarios
// Used to generate TIER 3 organization-specific context

/**
 * Organization Profile Templates
 *
 * Each profile represents a realistic customer scenario:
 * - Industry: Healthcare, Finance, Technology, Retail, Education
 * - Size: 1-50, 51-250, 251-1000, 1000+ employees
 * - Region: EU, UK, US, Global
 * - Maturity: Initial, Developing, Defined, Managed, Optimizing
 *
 * Used across multiple test cases to ensure consistency
 */
export const ORG_PROFILES = {
  HEALTHTECH_STARTUP: {
    industry: "Healthcare",
    org_size: "1-50",
    region: "EU",
    frameworks: ["GDPR"],
    maturity_level: "Initial",
    profile_completion: 30
  },

  FINANCE_MEDIUM: {
    industry: "Financial Services",
    org_size: "51-250",
    region: "UK",
    frameworks: ["GDPR", "ISO_27001"],
    maturity_level: "Developing",
    profile_completion: 60
  },

  ENTERPRISE_SAAS: {
    industry: "Technology",
    org_size: "251-1000",
    region: "US",
    frameworks: ["SOC_2", "ISO_27001", "GDPR"],
    maturity_level: "Managed",
    profile_completion: 85
  },

  RETAIL_CHAIN: {
    industry: "Retail",
    org_size: "1000+",
    region: "Global",
    frameworks: ["PCI_DSS", "GDPR", "CCPA"],
    maturity_level: "Defined",
    profile_completion: 70
  },

  EDTECH_NONPROFIT: {
    industry: "Education",
    org_size: "1-50",
    region: "EU",
    frameworks: ["GDPR"],
    maturity_level: "Initial",
    profile_completion: 20
  }
};

/**
 * Maturity level guidance text
 * Maps maturity levels to contextual advice
 */
const MATURITY_GUIDANCE = {
  'Initial': 'Your organization is just beginning its compliance journey. Focus on understanding requirements and building foundational policies.',
  'Developing': 'Your organization has basic compliance practices in place. Focus on systematizing processes and filling gaps.',
  'Defined': 'Your organization has documented compliance processes. Focus on optimization and continuous improvement.',
  'Managed': 'Your organization has mature compliance practices. Focus on efficiency and integration with business processes.',
  'Optimizing': 'Your organization has advanced compliance maturity. Focus on innovation and thought leadership.'
};

/**
 * Build TIER 3 Organization Context
 *
 * Generates the TIER 3 prompt section with organization-specific details
 *
 * Version: 2.0 (with Phase 2 optimizations)
 * Changes from v1.0:
 * - Strengthened context mandate (MANDATORY vs optional)
 * - Added specific checkboxes for what to reference
 *
 * @param {Object} orgProfile - Organization profile object
 * @returns {string} TIER 3 context prompt
 */
export function buildTier3Context(orgProfile) {
  const frameworkList = orgProfile.frameworks.join(', ');
  const guidance = MATURITY_GUIDANCE[orgProfile.maturity_level];

  return `Organization Context:
- Industry: ${orgProfile.industry}
- Organization Size: ${orgProfile.org_size} employees
- Region: ${orgProfile.region}
- Licensed Frameworks: ${frameworkList}
- Compliance Maturity: ${orgProfile.maturity_level}
- Profile Completion: ${orgProfile.profile_completion}%

${guidance}

MANDATORY CONTEXT USAGE:
Your responses MUST be tailored to this specific organizational context:
- Reference ${orgProfile.industry} industry in your examples
- Scale recommendations for ${orgProfile.org_size} employee organization
- Match guidance to ${orgProfile.maturity_level} maturity level
- Use ${orgProfile.region}-relevant regulatory context when applicable

Every response should demonstrate understanding of this organization's unique situation.`;
}
