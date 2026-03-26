// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js
// Description: ArionComply AI Backend Multi-Tier Prompt Construction Tests
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-25
//
// Tests the AI backend's TIER 1 + TIER 2 + TIER 3 + TIER 4 prompt construction system
// Validates that user queries are correctly enhanced with system prompts, framework expertise, and org context

/**
 * Organization Profile Templates
 * Used across multiple test cases to simulate different customer scenarios
 */
const ORG_PROFILES = {
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
 * Tier 1 Base System Prompt (Always Included)
 * Combines: base-system.md + assessment-answer-parser.md + assessment-conversation-guide.md + clarification-instructions.md
 * Total: ~7,500 characters (~1,875 tokens)
 */
const TIER1_BASE_SYSTEM = `You are ArionComply AI, an expert compliance advisor specializing in data protection, privacy regulations, and information security standards. Your role is to help organizations understand, implement, and maintain compliance with frameworks like GDPR, ISO 27001, ISO 27701, SOC 2, and others.

Core Capabilities:
- Provide accurate, actionable compliance guidance
- Explain complex regulatory requirements in simple terms
- Help users conduct gap assessments and identify compliance requirements
- Guide evidence collection and documentation
- Answer questions about specific controls and requirements

Communication Style:
- Professional yet approachable
- Use clear, jargon-free language when possible
- Provide step-by-step guidance for implementation questions
- Cite specific articles, controls, or requirements when relevant
- Ask clarifying questions when user intent is ambiguous

When helping with assessments:
- Parse natural language responses into structured data
- Extract YES/NO/PARTIAL compliance status from user descriptions
- Identify evidence and implementation details from narrative responses
- Format extracted data as JSON when appropriate

Clarification Protocol:
- Ask clarifying questions when user request is ambiguous
- Narrow down framework scope if multiple standards apply
- Confirm user's role and context before providing detailed guidance
- Verify whether user wants conceptual understanding or implementation steps`;

/**
 * Tier 2 System Prompts (ONE selected based on context)
 */
const TIER2_PROMPTS = {
  ASSESSMENT: `Assessment Mode Active

You are guiding the user through a compliance gap assessment. Your goal is to:
1. Ask clear, focused questions about their current compliance status
2. Parse their responses to extract compliance status and evidence
3. Guide them through all applicable controls systematically
4. Provide encouraging feedback and next steps

Assessment Flow:
- Present one control or requirement at a time
- Ask if they have implemented it (YES/NO/PARTIAL/NOT_APPLICABLE)
- Request evidence or documentation if they claim implementation
- Record gaps and provide guidance on remediation
- Track progress and show completion percentage

Keep the conversation flowing naturally while ensuring comprehensive coverage of all requirements.`,

  GDPR_FRAMEWORK: `GDPR Expert Mode

You have deep expertise in the General Data Protection Regulation (GDPR). You understand:

Key Articles:
- Article 5: Principles (lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, storage limitation, integrity/confidentiality, accountability)
- Article 6: Lawful bases for processing (consent, contract, legal obligation, vital interests, public task, legitimate interests)
- Article 13-14: Information requirements (transparency obligations)
- Article 25: Data protection by design and by default
- Article 32: Security of processing (appropriate technical and organizational measures)
- Article 33-34: Data breach notification requirements
- Article 35: Data Protection Impact Assessment (DPIA) requirements

Common Implementation Challenges:
- Consent management and withdrawal mechanisms
- Data subject rights (access, rectification, erasure, portability, restriction, objection)
- International data transfers and adequacy decisions
- Vendor management and Data Processing Agreements (DPAs)
- Records of Processing Activities (RoPA)

When answering GDPR questions, cite specific articles and provide practical implementation guidance.`,

  ISO27001_FRAMEWORK: `ISO 27001 Expert Mode

You have deep expertise in ISO/IEC 27001:2022 Information Security Management Systems. You understand:

Annex A Controls (93 controls across 4 themes):
- Organizational Controls (37 controls)
- People Controls (8 controls)
- Physical Controls (14 controls)
- Technological Controls (34 controls)

Key Control Families:
- A.5: Information Security Policies
- A.6: Organization of Information Security
- A.8: Asset Management (A.8.1 Responsibility, A.8.2 Classification, A.8.3 Media Handling)
- A.12: Operations Security
- A.13: Communications Security
- A.14: System Acquisition, Development, and Maintenance
- A.16: Incident Management
- A.17: Business Continuity
- A.18: Compliance

Implementation Approach:
- Gap assessment against all 93 controls
- Risk assessment and Statement of Applicability (SoA)
- ISMS documentation (policies, procedures, records)
- Internal audits and management review
- Certification process

When answering ISO 27001 questions, reference specific control IDs and provide implementation best practices.`,

  PRODUCT_VALUE: `ArionComply Value Proposition

You are explaining the benefits and value of the ArionComply platform. Highlight:

Key Benefits:
- Automated compliance workflows reduce manual effort by 60-80%
- AI-powered gap assessments identify compliance gaps in hours, not weeks
- Centralized evidence management eliminates scattered documentation
- Real-time compliance dashboards provide visibility for leadership
- Built-in frameworks (GDPR, ISO 27001, SOC 2, etc.) save research time
- Continuous monitoring alerts you to emerging compliance risks

Who Benefits:
- Compliance Officers: Streamline assessment and reporting workflows
- IT/Security Teams: Implement controls with built-in guidance
- Executives: Dashboard visibility into compliance posture
- Auditors: Organized evidence repository speeds certification

Cost Savings:
- Reduce consultant dependency for routine compliance work
- Avoid penalties and fines through proactive gap identification
- Faster certification timeline means earlier market access
- Lower operational overhead vs. manual spreadsheet tracking

When discussing value, focus on user's specific pain points and how ArionComply addresses them.`,

  PRODUCT_FEATURES: `ArionComply Platform Guide

You are helping users navigate and use the ArionComply platform. Key features:

Core Features:
1. Gap Assessment Wizard
   - Interactive questionnaires for each framework
   - AI-powered response parsing
   - Automated gap identification and prioritization

2. Control Management
   - Browse all controls for your licensed frameworks
   - View implementation guidance and examples
   - Track implementation status (Not Started / In Progress / Complete)

3. Evidence Repository
   - Upload documents, screenshots, policies
   - Link evidence to specific controls
   - Tag and categorize for easy retrieval

4. Compliance Dashboard
   - Overall compliance score by framework
   - Gap summary and remediation status
   - Timeline view of compliance journey

5. Reporting
   - Executive summary reports
   - Detailed gap analysis reports
   - Audit-ready evidence packages
   - Export to PDF or Excel

Navigation:
- Left sidebar: Main navigation (Dashboard, Frameworks, Assessments, Evidence, Reports)
- Top bar: Search, notifications, user profile
- Breadcrumbs: Track your location in deep workflows

When helping users, provide specific step-by-step navigation instructions.`,

  GENERAL: `General Compliance Advisory Mode

You are a general compliance advisor helping with broad compliance questions. You can:

- Explain compliance concepts and terminology
- Compare different frameworks and their relationships
- Provide industry best practices
- Guide users toward appropriate frameworks for their industry/region
- Explain the value of compliance beyond avoiding penalties

Common Topics:
- Choosing the right compliance framework
- Understanding compliance vs. security vs. privacy
- Mapping between frameworks (e.g., GDPR to ISO 27701)
- Compliance program maturity models
- Building a compliance culture in organizations

Remain flexible and adapt to user's specific context and needs.`
};

/**
 * Helper function to build Tier 3 org context
 */
function buildTier3Context(orgProfile) {
  const maturityGuidance = {
    'Initial': 'Your organization is just beginning its compliance journey. Focus on understanding requirements and building foundational policies.',
    'Developing': 'Your organization has basic compliance practices in place. Focus on systematizing processes and filling gaps.',
    'Defined': 'Your organization has documented compliance processes. Focus on optimization and continuous improvement.',
    'Managed': 'Your organization has mature compliance practices. Focus on efficiency and integration with business processes.',
    'Optimizing': 'Your organization has advanced compliance maturity. Focus on innovation and thought leadership.'
  };

  const frameworkList = orgProfile.frameworks.join(', ');
  const guidance = maturityGuidance[orgProfile.maturity_level];

  return `Organization Context:
- Industry: ${orgProfile.industry}
- Organization Size: ${orgProfile.org_size} employees
- Region: ${orgProfile.region}
- Licensed Frameworks: ${frameworkList}
- Compliance Maturity: ${orgProfile.maturity_level}
- Profile Completion: ${orgProfile.profile_completion}%

${guidance}

Tailor your responses to this organization's industry, size, and maturity level. Use relevant examples from the ${orgProfile.industry} industry when possible.`;
}

/**
 * Helper function to assemble full multi-tier prompt
 */
function assembleFullPrompt(tier1, tier2, tier3, conversationHistory, userQuery) {
  let prompt = `[TIER 1 - Base System Prompt]\n${tier1}\n\n`;
  prompt += `[TIER 2 - Situational Context]\n${tier2}\n\n`;
  prompt += `[TIER 3 - Organization Context]\n${tier3}\n\n`;

  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `[CONVERSATION HISTORY]\n`;
    conversationHistory.forEach((msg, idx) => {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    prompt += `\n`;
  }

  prompt += `[CURRENT USER MESSAGE]\n${userQuery}`;

  return prompt;
}

/**
 * 50 AI Backend Multi-Tier Test Prompts
 */
export const AI_BACKEND_MULTI_TIER_TESTS = {

  //
  // ASSESSMENT MODE TESTS (15 prompts - 30%)
  //

  ASSESSMENT_START_GDPR_NOVICE_1: {
    id: "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "PROCEDURAL",
    persona: "NOVICE",
    tier2Mode: "assessment",
    question: "I want to assess my GDPR compliance",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
    orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
      [],
      "I want to assess my GDPR compliance"
    ),
    expectedTopics: ["gap assessment", "questionnaire", "controls", "evidence", "first question"],
    expectedBehavior: "Should initiate GDPR gap assessment workflow and ask first assessment question",
    complexity: "beginner",
    estimatedTokens: 2300
  },

  ASSESSMENT_MID_ISO27001_PRACTITIONER_1: {
    id: "ARION_MULTITIER_ASSESSMENT_ISO27001_PRACTITIONER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "assessment",
    question: "Yes, we have implemented encryption for data at rest using AES-256, and we maintain encryption key management procedures in our security policy document",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [
      { role: "assistant", content: "Let's assess ISO 27001 control A.8.24 (Use of cryptography). Do you use cryptography to protect the confidentiality and integrity of information?" }
    ],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [{ role: "assistant", content: "Let's assess ISO 27001 control A.8.24 (Use of cryptography). Do you use cryptography to protect the confidentiality and integrity of information?" }],
      "Yes, we have implemented encryption for data at rest using AES-256, and we maintain encryption key management procedures in our security policy document"
    ),
    expectedTopics: ["parse response", "extract YES status", "identify evidence", "next control", "progress"],
    expectedBehavior: "Should parse the affirmative response, extract compliance status (YES) and evidence (AES-256, key management policy), then proceed to next control",
    complexity: "intermediate",
    estimatedTokens: 2450
  },

  ASSESSMENT_GAP_QUESTION_GDPR_MANAGER_1: {
    id: "ARION_MULTITIER_ASSESSMENT_GDPR_MANAGER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "SYNTHESIS",
    persona: "MANAGER",
    tier2Mode: "assessment",
    question: "What are my biggest GDPR compliance gaps?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
    orgProfile: ORG_PROFILES.EDTECH_NONPROFIT,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
      [],
      "What are my biggest GDPR compliance gaps?"
    ),
    expectedTopics: ["gap analysis", "prioritization", "high-risk areas", "remediation", "assessment needed"],
    expectedBehavior: "Should explain that gap identification requires assessment, offer to start assessment workflow, or provide common gaps for education sector",
    complexity: "intermediate",
    estimatedTokens: 2350
  },

  ASSESSMENT_EVIDENCE_CLARIFICATION_ISO27001_PRACTITIONER_2: {
    id: "ARION_MULTITIER_ASSESSMENT_ISO27001_PRACTITIONER_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "assessment",
    question: "What kind of evidence do you need for access control?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
    orgProfile: ORG_PROFILES.ENTERPRISE_SAAS,
    conversationHistory: [
      { role: "assistant", content: "Let's assess ISO 27001 control A.9.2.1 (User access provisioning). Do you have a formal user access provisioning process?" },
      { role: "user", content: "Yes, we have implemented access controls" }
    ],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
      [
        { role: "assistant", content: "Let's assess ISO 27001 control A.9.2.1 (User access provisioning). Do you have a formal user access provisioning process?" },
        { role: "user", content: "Yes, we have implemented access controls" }
      ],
      "What kind of evidence do you need for access control?"
    ),
    expectedTopics: ["evidence types", "documentation", "access control policy", "logs", "procedures"],
    expectedBehavior: "Should list acceptable evidence types: access control policy, user provisioning procedure, access logs, screenshots of IAM system, audit trail",
    complexity: "intermediate",
    estimatedTokens: 2500
  },

  ASSESSMENT_PARTIAL_IMPLEMENTATION_GDPR_PRACTITIONER_1: {
    id: "ARION_MULTITIER_ASSESSMENT_GDPR_PRACTITIONER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "assessment",
    question: "We have a privacy policy but it's not up to date with GDPR requirements, and we haven't implemented all the required information disclosures",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
    orgProfile: ORG_PROFILES.RETAIL_CHAIN,
    conversationHistory: [
      { role: "assistant", content: "Let's assess GDPR Article 13 (Information to be provided). Do you provide all required information to data subjects when collecting their personal data?" }
    ],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
      [{ role: "assistant", content: "Let's assess GDPR Article 13 (Information to be provided). Do you provide all required information to data subjects when collecting their personal data?" }],
      "We have a privacy policy but it's not up to date with GDPR requirements, and we haven't implemented all the required information disclosures"
    ),
    expectedTopics: ["partial implementation", "gap identified", "remediation steps", "GDPR Article 13", "next control"],
    expectedBehavior: "Should parse as PARTIAL implementation, identify specific gaps (outdated policy, incomplete disclosures), offer remediation guidance, then continue assessment",
    complexity: "intermediate",
    estimatedTokens: 2480
  },

  // Continue with more assessment tests (10 more to reach 15 total)

  ASSESSMENT_COMPLETE_SUMMARY_ISO27001_MANAGER_1: {
    id: "ARION_MULTITIER_ASSESSMENT_ISO27001_MANAGER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "SYNTHESIS",
    persona: "MANAGER",
    tier2Mode: "assessment",
    question: "Can you summarize our assessment results?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [
      { role: "assistant", content: "We've completed the ISO 27001 assessment. Out of 93 controls: 45 implemented, 30 partially implemented, 18 not implemented." }
    ],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [{ role: "assistant", content: "We've completed the ISO 27001 assessment. Out of 93 controls: 45 implemented, 30 partially implemented, 18 not implemented." }],
      "Can you summarize our assessment results?"
    ),
    expectedTopics: ["assessment summary", "compliance score", "gap prioritization", "remediation roadmap", "next steps"],
    expectedBehavior: "Should provide executive summary of assessment results, highlight critical gaps, suggest prioritization strategy",
    complexity: "advanced",
    estimatedTokens: 2550
  },

  ASSESSMENT_NOT_APPLICABLE_GDPR_PRACTITIONER_2: {
    id: "ARION_MULTITIER_ASSESSMENT_GDPR_PRACTITIONER_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "RELATIONAL",
    persona: "PRACTITIONER",
    tier2Mode: "assessment",
    question: "This doesn't apply to us - we don't make automated decisions",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
    orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP,
    conversationHistory: [
      { role: "assistant", content: "Let's assess GDPR Article 22 (Automated decision-making). Do you make decisions based solely on automated processing?" }
    ],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
      [{ role: "assistant", content: "Let's assess GDPR Article 22 (Automated decision-making). Do you make decisions based solely on automated processing?" }],
      "This doesn't apply to us - we don't make automated decisions"
    ),
    expectedTopics: ["not applicable", "record justification", "skip requirement", "next control"],
    expectedBehavior: "Should mark requirement as NOT_APPLICABLE, record justification, confirm understanding, proceed to next control",
    complexity: "beginner",
    estimatedTokens: 2420
  },

  ASSESSMENT_MULTI_FRAMEWORK_MANAGER_2: {
    id: "ARION_MULTITIER_ASSESSMENT_MULTI_FRAMEWORK_MANAGER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "SYNTHESIS",
    persona: "MANAGER",
    tier2Mode: "assessment",
    question: "Should I assess GDPR and ISO 27001 together or separately?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [],
      "Should I assess GDPR and ISO 27001 together or separately?"
    ),
    expectedTopics: ["assessment strategy", "framework overlap", "efficiency", "separate assessments", "mapping"],
    expectedBehavior: "Should recommend separate assessments but note overlaps, explain benefits of both approaches, let user choose based on their preference",
    complexity: "intermediate",
    estimatedTokens: 2380
  },

  ASSESSMENT_RESTART_REQUEST_ISO27001_NOVICE_1: {
    id: "ARION_MULTITIER_ASSESSMENT_ISO27001_NOVICE_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "NOVICE",
    tier2Mode: "assessment",
    question: "Can I start the assessment over? I made some mistakes",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
    orgProfile: ORG_PROFILES.EDTECH_NONPROFIT,
    conversationHistory: [
      { role: "assistant", content: "Let's assess ISO 27001 control A.8.1.1 (Inventory of assets). Do you maintain an inventory of all information assets?" },
      { role: "user", content: "Yes" },
      { role: "assistant", content: "Great! Let's move to A.8.1.2 (Ownership of assets). Have you assigned ownership for all information assets?" }
    ],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
      [
        { role: "assistant", content: "Let's assess ISO 27001 control A.8.1.1 (Inventory of assets). Do you maintain an inventory of all information assets?" },
        { role: "user", content: "Yes" },
        { role: "assistant", content: "Great! Let's move to A.8.1.2 (Ownership of assets). Have you assigned ownership for all information assets?" }
      ],
      "Can I start the assessment over? I made some mistakes"
    ),
    expectedTopics: ["restart assessment", "confirm action", "data loss warning", "begin again"],
    expectedBehavior: "Should confirm restart request, warn about losing progress, offer to restart from beginning if user confirms",
    complexity: "beginner",
    estimatedTokens: 2520
  },

  ASSESSMENT_PROGRESS_CHECK_GDPR_MANAGER_2: {
    id: "ARION_MULTITIER_ASSESSMENT_GDPR_MANAGER_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "FACTUAL",
    persona: "MANAGER",
    tier2Mode: "assessment",
    question: "How much of the assessment have we completed?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
    orgProfile: ORG_PROFILES.RETAIL_CHAIN,
    conversationHistory: [
      { role: "assistant", content: "We're currently assessing GDPR Article 32 (Security of processing)." }
    ],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
      [{ role: "assistant", content: "We're currently assessing GDPR Article 32 (Security of processing)." }],
      "How much of the assessment have we completed?"
    ),
    expectedTopics: ["progress percentage", "articles completed", "articles remaining", "estimated time"],
    expectedBehavior: "Should provide progress update (e.g., '60% complete, 15 of 25 key articles assessed'), estimate remaining time",
    complexity: "beginner",
    estimatedTokens: 2400
  },

  ASSESSMENT_SKIP_REQUEST_ISO27001_PRACTITIONER_3: {
    id: "ARION_MULTITIER_ASSESSMENT_ISO27001_PRACTITIONER_3",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "assessment",
    question: "Can we skip the physical security controls? Our office is in a shared building managed by the landlord",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
    orgProfile: ORG_PROFILES.ENTERPRISE_SAAS,
    conversationHistory: [
      { role: "assistant", content: "Let's assess ISO 27001 control A.7.2 (Physical entry controls). Do you control physical access to information processing facilities?" }
    ],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
      [{ role: "assistant", content: "Let's assess ISO 27001 control A.7.2 (Physical entry controls). Do you control physical access to information processing facilities?" }],
      "Can we skip the physical security controls? Our office is in a shared building managed by the landlord"
    ),
    expectedTopics: ["cannot skip", "explain importance", "landlord responsibilities", "tenant responsibilities", "assess anyway"],
    expectedBehavior: "Should explain that physical controls can't be skipped entirely, discuss shared responsibility model, guide through assessment of tenant-controlled aspects",
    complexity: "intermediate",
    estimatedTokens: 2490
  },

  ASSESSMENT_CHANGE_ANSWER_GDPR_PRACTITIONER_3: {
    id: "ARION_MULTITIER_ASSESSMENT_GDPR_PRACTITIONER_3",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "assessment",
    question: "Actually, I need to change my answer to the previous question - we don't have a DPO appointed yet",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
    orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP,
    conversationHistory: [
      { role: "assistant", content: "Let's assess GDPR Article 37 (Data Protection Officer). Are you required to appoint a DPO, and if so, have you done so?" },
      { role: "user", content: "Yes, we have a DPO" },
      { role: "assistant", content: "Great! Let's move to Article 38 (DPO tasks and duties). Does your DPO have sufficient resources and access to fulfill their role?" }
    ],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
      [
        { role: "assistant", content: "Let's assess GDPR Article 37 (Data Protection Officer). Are you required to appoint a DPO, and if so, have you done so?" },
        { role: "user", content: "Yes, we have a DPO" },
        { role: "assistant", content: "Great! Let's move to Article 38 (DPO tasks and duties). Does your DPO have sufficient resources and access to fulfill their role?" }
      ],
      "Actually, I need to change my answer to the previous question - we don't have a DPO appointed yet"
    ),
    expectedTopics: ["update previous answer", "record correction", "gap identified", "continue assessment"],
    expectedBehavior: "Should acknowledge correction, update Article 37 status to NO/PARTIAL, record as gap, skip Article 38 (not applicable without DPO), continue to next article",
    complexity: "intermediate",
    estimatedTokens: 2580
  },

  ASSESSMENT_EVIDENCE_UPLOAD_ISO27001_PRACTITIONER_4: {
    id: "ARION_MULTITIER_ASSESSMENT_ISO27001_PRACTITIONER_4",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "assessment",
    question: "Yes, we have an incident response plan. I have the document - how do I upload it as evidence?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [
      { role: "assistant", content: "Let's assess ISO 27001 control A.5.26 (Response to information security incidents). Do you have a documented incident response plan?" }
    ],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [{ role: "assistant", content: "Let's assess ISO 27001 control A.5.26 (Response to information security incidents). Do you have a documented incident response plan?" }],
      "Yes, we have an incident response plan. I have the document - how do I upload it as evidence?"
    ),
    expectedTopics: ["evidence upload", "navigation instructions", "evidence linking", "control mapping", "continue assessment"],
    expectedBehavior: "Should provide step-by-step instructions for uploading evidence, explain how to link it to current control, then continue assessment",
    complexity: "intermediate",
    estimatedTokens: 2470
  },

  ASSESSMENT_TIMELINE_QUESTION_GDPR_MANAGER_3: {
    id: "ARION_MULTITIER_ASSESSMENT_GDPR_MANAGER_3",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "FACTUAL",
    persona: "MANAGER",
    tier2Mode: "assessment",
    question: "How long will this assessment take?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
    orgProfile: ORG_PROFILES.EDTECH_NONPROFIT,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
      [],
      "How long will this assessment take?"
    ),
    expectedTopics: ["time estimate", "25 key articles", "30-90 minutes", "can pause", "can resume"],
    expectedBehavior: "Should provide realistic time estimate (30-90 minutes depending on complexity), mention ability to pause and resume, encourage starting the assessment",
    complexity: "beginner",
    estimatedTokens: 2320
  },

  ASSESSMENT_EXPORT_RESULTS_ISO27001_AUDITOR_1: {
    id: "ARION_MULTITIER_ASSESSMENT_ISO27001_AUDITOR_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "AUDITOR",
    tier2Mode: "assessment",
    question: "Can I export these assessment results to share with our auditors?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
    orgProfile: ORG_PROFILES.ENTERPRISE_SAAS,
    conversationHistory: [
      { role: "assistant", content: "We've completed 50 of 93 ISO 27001 controls in the assessment." }
    ],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
      [{ role: "assistant", content: "We've completed 50 of 93 ISO 27001 controls in the assessment." }],
      "Can I export these assessment results to share with our auditors?"
    ),
    expectedTopics: ["export options", "PDF report", "Excel export", "audit package", "Reports section"],
    expectedBehavior: "Should explain export options (PDF, Excel), guide to Reports section, mention what's included in audit package (results + evidence)",
    complexity: "intermediate",
    estimatedTokens: 2460
  },

  //
  // GDPR FRAMEWORK TESTS (10 prompts - 20%)
  //

  GDPR_ARTICLE6_LEGAL_BASIS_PRACTITIONER_1: {
    id: "ARION_MULTITIER_GDPR_ARTICLE6_PRACTITIONER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "FACTUAL",
    persona: "PRACTITIONER",
    tier2Mode: "framework-gdpr",
    question: "What are the legal bases for processing personal data under GDPR?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
    orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
      [],
      "What are the legal bases for processing personal data under GDPR?"
    ),
    expectedTopics: ["Article 6", "consent", "contract", "legal obligation", "vital interests", "public task", "legitimate interests"],
    expectedBehavior: "Should list all 6 legal bases from Article 6, explain each briefly, provide healthcare-relevant examples",
    complexity: "intermediate",
    estimatedTokens: 2200
  },

  GDPR_DPIA_REQUIREMENT_MANAGER_1: {
    id: "ARION_MULTITIER_GDPR_DPIA_MANAGER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "PROCEDURAL",
    persona: "MANAGER",
    tier2Mode: "framework-gdpr",
    question: "When do we need to conduct a Data Protection Impact Assessment?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [],
      "When do we need to conduct a Data Protection Impact Assessment?"
    ),
    expectedTopics: ["Article 35", "high risk", "systematic monitoring", "large scale", "special categories", "automated decisions"],
    expectedBehavior: "Should explain DPIA requirements from Article 35, list triggers (high-risk processing), provide financial services examples",
    complexity: "intermediate",
    estimatedTokens: 2250
  },

  GDPR_BREACH_NOTIFICATION_PRACTITIONER_2: {
    id: "ARION_MULTITIER_GDPR_BREACH_PRACTITIONER_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "framework-gdpr",
    question: "What are the timelines for notifying a data breach under GDPR?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
    orgProfile: ORG_PROFILES.RETAIL_CHAIN,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
      [],
      "What are the timelines for notifying a data breach under GDPR?"
    ),
    expectedTopics: ["Article 33", "72 hours", "supervisory authority", "Article 34", "without undue delay", "data subjects"],
    expectedBehavior: "Should explain Article 33 (72h to authority) and Article 34 (without undue delay to subjects), explain when notification required",
    complexity: "intermediate",
    estimatedTokens: 2220
  },

  GDPR_CONSENT_IMPLEMENTATION_DEVELOPER_1: {
    id: "ARION_MULTITIER_GDPR_CONSENT_DEVELOPER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "PROCEDURAL",
    persona: "DEVELOPER",
    tier2Mode: "framework-gdpr",
    question: "How do I implement GDPR-compliant consent in our web application?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
    orgProfile: ORG_PROFILES.ENTERPRISE_SAAS,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
      [],
      "How do I implement GDPR-compliant consent in our web application?"
    ),
    expectedTopics: ["freely given", "specific", "informed", "unambiguous", "withdrawal", "granular", "pre-ticked boxes prohibited"],
    expectedBehavior: "Should explain consent requirements (Article 7), provide technical implementation guidance (consent management UI, database schema, audit trail)",
    complexity: "advanced",
    estimatedTokens: 2300
  },

  GDPR_DATA_SUBJECT_RIGHTS_NOVICE_1: {
    id: "ARION_MULTITIER_GDPR_DSR_NOVICE_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "FACTUAL",
    persona: "NOVICE",
    tier2Mode: "framework-gdpr",
    question: "What rights do individuals have under GDPR?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
    orgProfile: ORG_PROFILES.EDTECH_NONPROFIT,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
      [],
      "What rights do individuals have under GDPR?"
    ),
    expectedTopics: ["access", "rectification", "erasure", "portability", "restriction", "objection", "automated decisions"],
    expectedBehavior: "Should list all data subject rights (Articles 15-22), explain each in simple terms, provide education sector examples",
    complexity: "beginner",
    estimatedTokens: 2180
  },

  GDPR_ROPA_CREATION_PRACTITIONER_3: {
    id: "ARION_MULTITIER_GDPR_ROPA_PRACTITIONER_3",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "framework-gdpr",
    question: "What should be included in our Records of Processing Activities?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
    orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
      [],
      "What should be included in our Records of Processing Activities?"
    ),
    expectedTopics: ["Article 30", "controller details", "purposes", "categories of data", "recipients", "transfers", "retention", "security measures"],
    expectedBehavior: "Should list all required RoPA elements from Article 30, explain each, provide healthcare example template",
    complexity: "intermediate",
    estimatedTokens: 2240
  },

  GDPR_INTERNATIONAL_TRANSFER_MANAGER_2: {
    id: "ARION_MULTITIER_GDPR_TRANSFER_MANAGER_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "RELATIONAL",
    persona: "MANAGER",
    tier2Mode: "framework-gdpr",
    question: "Can we transfer personal data to our US-based cloud provider?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [],
      "Can we transfer personal data to our US-based cloud provider?"
    ),
    expectedTopics: ["Chapter V", "adequacy decision", "SCCs", "Standard Contractual Clauses", "DPA", "Schrems II", "transfer impact assessment"],
    expectedBehavior: "Should explain international transfer requirements (Chapter V), discuss US status post-Schrems II, recommend SCCs and transfer impact assessment",
    complexity: "advanced",
    estimatedTokens: 2280
  },

  GDPR_PRIVACY_BY_DESIGN_DEVELOPER_2: {
    id: "ARION_MULTITIER_GDPR_DESIGN_DEVELOPER_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "PROCEDURAL",
    persona: "DEVELOPER",
    tier2Mode: "framework-gdpr",
    question: "What does privacy by design mean in practice for software development?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
    orgProfile: ORG_PROFILES.ENTERPRISE_SAAS,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
      [],
      "What does privacy by design mean in practice for software development?"
    ),
    expectedTopics: ["Article 25", "data minimization", "pseudonymization", "encryption", "access controls", "privacy by default", "security measures"],
    expectedBehavior: "Should explain Article 25 principles, provide concrete technical examples (minimize data collection, default privacy settings, encryption at rest/transit, access logging)",
    complexity: "advanced",
    estimatedTokens: 2320
  },

  GDPR_CHILDREN_DATA_PRACTITIONER_4: {
    id: "ARION_MULTITIER_GDPR_CHILDREN_PRACTITIONER_4",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "RELATIONAL",
    persona: "PRACTITIONER",
    tier2Mode: "framework-gdpr",
    question: "Our education platform collects data from children - what are the special requirements?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
    orgProfile: ORG_PROFILES.EDTECH_NONPROFIT,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
      [],
      "Our education platform collects data from children - what are the special requirements?"
    ),
    expectedTopics: ["Article 8", "age of consent", "16 years", "parental consent", "age verification", "child-appropriate language"],
    expectedBehavior: "Should explain Article 8 requirements (age of consent, parental authorization), discuss age verification methods, emphasize education sector context",
    complexity: "intermediate",
    estimatedTokens: 2270
  },

  GDPR_PROCESSOR_VS_CONTROLLER_NOVICE_2: {
    id: "ARION_MULTITIER_GDPR_ROLES_NOVICE_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "FACTUAL",
    persona: "NOVICE",
    tier2Mode: "framework-gdpr",
    question: "What's the difference between a data controller and a data processor?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
    orgProfile: ORG_PROFILES.RETAIL_CHAIN,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GDPR_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
      [],
      "What's the difference between a data controller and a data processor?"
    ),
    expectedTopics: ["Article 4", "controller determines purposes", "processor processes on behalf", "DPA required", "different obligations"],
    expectedBehavior: "Should define controller vs processor (Article 4), explain key differences in responsibilities, provide retail examples (controller: retailer, processor: payment processor)",
    complexity: "beginner",
    estimatedTokens: 2190
  },

  //
  // ISO 27001 FRAMEWORK TESTS (8 prompts - 16%)
  //

  ISO27001_CONTROL_A82_PRACTITIONER_1: {
    id: "ARION_MULTITIER_ISO27001_A82_PRACTITIONER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "framework-iso27001",
    question: "What are the requirements for ISO 27001 control A.8.2 (Information classification)?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [],
      "What are the requirements for ISO 27001 control A.8.2 (Information classification)?"
    ),
    expectedTopics: ["classification scheme", "labeling", "handling procedures", "public", "internal", "confidential", "restricted"],
    expectedBehavior: "Should explain A.8.2 requirements (classification scheme, labels, handling), provide financial services classification example",
    complexity: "intermediate",
    estimatedTokens: 2230
  },

  ISO27001_ISMS_SCOPE_MANAGER_1: {
    id: "ARION_MULTITIER_ISO27001_ISMS_MANAGER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "MANAGER",
    tier2Mode: "framework-iso27001",
    question: "How do we define the scope of our Information Security Management System?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
    orgProfile: ORG_PROFILES.ENTERPRISE_SAAS,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
      [],
      "How do we define the scope of our Information Security Management System?"
    ),
    expectedTopics: ["Clause 4.3", "boundaries", "organizational context", "interfaces", "dependencies", "business units", "geographical locations"],
    expectedBehavior: "Should explain ISMS scope definition (Clause 4.3), discuss boundaries and interfaces, provide SaaS example (e.g., production environment only, exclude R&D)",
    complexity: "intermediate",
    estimatedTokens: 2250
  },

  ISO27001_RISK_ASSESSMENT_PRACTITIONER_2: {
    id: "ARION_MULTITIER_ISO27001_RISK_PRACTITIONER_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "framework-iso27001",
    question: "What methodology should we use for information security risk assessment?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
    orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
      [],
      "What methodology should we use for information security risk assessment?"
    ),
    expectedTopics: ["Clause 6.1.2", "asset identification", "threat identification", "vulnerability identification", "likelihood", "impact", "risk level"],
    expectedBehavior: "Should explain risk assessment requirements (Clause 6.1.2), discuss methodologies (qualitative vs quantitative), provide healthcare-appropriate guidance",
    complexity: "advanced",
    estimatedTokens: 2280
  },

  ISO27001_SOA_CREATION_AUDITOR_1: {
    id: "ARION_MULTITIER_ISO27001_SOA_AUDITOR_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "AUDITOR",
    tier2Mode: "framework-iso27001",
    question: "What must be included in the Statement of Applicability?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
    orgProfile: ORG_PROFILES.RETAIL_CHAIN,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
      [],
      "What must be included in the Statement of Applicability?"
    ),
    expectedTopics: ["Clause 6.1.3d", "all 93 Annex A controls", "applicability status", "justification for inclusion", "justification for exclusion"],
    expectedBehavior: "Should explain SoA requirements (Clause 6.1.3d), list required information for each control, explain applicability vs exclusion justification",
    complexity: "intermediate",
    estimatedTokens: 2260
  },

  ISO27001_ACCESS_CONTROL_DEVELOPER_1: {
    id: "ARION_MULTITIER_ISO27001_ACCESS_DEVELOPER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "DEVELOPER",
    tier2Mode: "framework-iso27001",
    question: "How do I implement user access provisioning according to ISO 27001?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
    orgProfile: ORG_PROFILES.ENTERPRISE_SAAS,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
      [],
      "How do I implement user access provisioning according to ISO 27001?"
    ),
    expectedTopics: ["A.5.18", "registration process", "approval workflow", "unique user IDs", "access rights review", "deprovisioning"],
    expectedBehavior: "Should explain A.5.18 requirements, provide technical implementation guidance (IAM system, approval workflows, access logging, automated deprovisioning)",
    complexity: "advanced",
    estimatedTokens: 2290
  },

  ISO27001_CERTIFICATION_PROCESS_EXECUTIVE_1: {
    id: "ARION_MULTITIER_ISO27001_CERT_EXECUTIVE_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "FACTUAL",
    persona: "EXECUTIVE",
    tier2Mode: "framework-iso27001",
    question: "What's involved in getting ISO 27001 certified?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [],
      "What's involved in getting ISO 27001 certified?"
    ),
    expectedTopics: ["accredited certification body", "Stage 1 audit", "Stage 2 audit", "certificate", "3 years", "annual surveillance", "timeline", "cost"],
    expectedBehavior: "Should explain certification process (select CB, Stage 1/2 audits, surveillance), provide timeline (6-12 months), discuss business value for financial services",
    complexity: "beginner",
    estimatedTokens: 2240
  },

  ISO27001_INCIDENT_MANAGEMENT_PRACTITIONER_3: {
    id: "ARION_MULTITIER_ISO27001_INCIDENT_PRACTITIONER_3",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "framework-iso27001",
    question: "What should our incident response plan include for ISO 27001 compliance?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
    orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
      [],
      "What should our incident response plan include for ISO 27001 compliance?"
    ),
    expectedTopics: ["A.5.24", "A.5.25", "A.5.26", "detection", "reporting", "assessment", "response", "lessons learned", "evidence collection"],
    expectedBehavior: "Should explain incident management controls (A.5.24-26), list required plan components, provide healthcare-appropriate examples",
    complexity: "intermediate",
    estimatedTokens: 2270
  },

  ISO27001_CRYPTOGRAPHY_POLICY_PRACTITIONER_4: {
    id: "ARION_MULTITIER_ISO27001_CRYPTO_PRACTITIONER_4",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "framework-iso27001",
    question: "What should be in our cryptographic controls policy?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ISO27001_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
    orgProfile: ORG_PROFILES.RETAIL_CHAIN,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.ISO27001_FRAMEWORK,
      buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
      [],
      "What should be in our cryptographic controls policy?"
    ),
    expectedTopics: ["A.8.24", "encryption algorithms", "key management", "key generation", "key storage", "key rotation", "key destruction"],
    expectedBehavior: "Should explain A.8.24 requirements, list policy components (algorithms, key lifecycle, roles/responsibilities), provide retail/PCI-DSS context",
    complexity: "intermediate",
    estimatedTokens: 2250
  },

  //
  // PRODUCT VALUE TESTS (7 prompts - 14%)
  //

  PRODUCT_VALUE_WHY_ARIONCOMPLY_MANAGER_1: {
    id: "ARION_MULTITIER_VALUE_WHY_MANAGER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "FACTUAL",
    persona: "MANAGER",
    tier2Mode: "product-value",
    question: "Why should we use ArionComply instead of spreadsheets for compliance?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.PRODUCT_VALUE,
    tier3Context: buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
    orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.PRODUCT_VALUE,
      buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
      [],
      "Why should we use ArionComply instead of spreadsheets for compliance?"
    ),
    expectedTopics: ["automation", "centralized evidence", "audit trail", "version control", "collaboration", "scalability", "time savings"],
    expectedBehavior: "Should compare ArionComply advantages over spreadsheets (automation, collaboration, audit readiness), quantify time savings, address small org constraints",
    complexity: "beginner",
    estimatedTokens: 2210
  },

  PRODUCT_VALUE_ROI_EXECUTIVE_1: {
    id: "ARION_MULTITIER_VALUE_ROI_EXECUTIVE_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "SYNTHESIS",
    persona: "EXECUTIVE",
    tier2Mode: "product-value",
    question: "What's the ROI of implementing ArionComply for our organization?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.PRODUCT_VALUE,
    tier3Context: buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
    orgProfile: ORG_PROFILES.ENTERPRISE_SAAS,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.PRODUCT_VALUE,
      buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
      [],
      "What's the ROI of implementing ArionComply for our organization?"
    ),
    expectedTopics: ["cost savings", "time to certification", "reduced consultant fees", "penalty avoidance", "operational efficiency", "market access"],
    expectedBehavior: "Should quantify ROI factors (time savings, reduced consulting costs, faster certification), discuss SaaS business benefits (customer trust, compliance requirements)",
    complexity: "intermediate",
    estimatedTokens: 2260
  },

  PRODUCT_VALUE_COMPETITIVE_ADVANTAGE_EXECUTIVE_2: {
    id: "ARION_MULTITIER_VALUE_COMPETITIVE_EXECUTIVE_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "SYNTHESIS",
    persona: "EXECUTIVE",
    tier2Mode: "product-value",
    question: "How does compliance certification give us a competitive advantage?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.PRODUCT_VALUE,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.PRODUCT_VALUE,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [],
      "How does compliance certification give us a competitive advantage?"
    ),
    expectedTopics: ["customer trust", "enterprise sales", "RFP requirements", "market differentiation", "insurance premiums", "investor confidence"],
    expectedBehavior: "Should explain competitive benefits (enterprise sales enablement, RFP wins, trust signal), provide financial services examples (bank partnerships, investor due diligence)",
    complexity: "intermediate",
    estimatedTokens: 2230
  },

  PRODUCT_VALUE_CONSULTANT_VS_PLATFORM_MANAGER_2: {
    id: "ARION_MULTITIER_VALUE_CONSULTANT_MANAGER_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "RELATIONAL",
    persona: "MANAGER",
    tier2Mode: "product-value",
    question: "Should we hire a compliance consultant or use ArionComply?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.PRODUCT_VALUE,
    tier3Context: buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
    orgProfile: ORG_PROFILES.EDTECH_NONPROFIT,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.PRODUCT_VALUE,
      buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
      [],
      "Should we hire a compliance consultant or use ArionComply?"
    ),
    expectedTopics: ["cost comparison", "ongoing vs one-time", "knowledge transfer", "self-service", "hybrid approach", "consultant for gaps"],
    expectedBehavior: "Should compare costs (consultant: $15k-50k one-time vs platform: $X/month ongoing), recommend hybrid approach for small nonprofits (platform + consultant for complex gaps)",
    complexity: "intermediate",
    estimatedTokens: 2240
  },

  PRODUCT_VALUE_CONTINUOUS_MONITORING_PRACTITIONER_1: {
    id: "ARION_MULTITIER_VALUE_MONITORING_PRACTITIONER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "FACTUAL",
    persona: "PRACTITIONER",
    tier2Mode: "product-value",
    question: "How does ArionComply help with continuous compliance monitoring?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.PRODUCT_VALUE,
    tier3Context: buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
    orgProfile: ORG_PROFILES.RETAIL_CHAIN,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.PRODUCT_VALUE,
      buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
      [],
      "How does ArionComply help with continuous compliance monitoring?"
    ),
    expectedTopics: ["real-time dashboard", "gap alerts", "control status tracking", "evidence expiration", "regulatory updates", "proactive notifications"],
    expectedBehavior: "Should explain continuous monitoring features (dashboard, alerts, evidence tracking), contrast with point-in-time assessments, provide retail compliance examples",
    complexity: "beginner",
    estimatedTokens: 2200
  },

  PRODUCT_VALUE_MULTI_FRAMEWORK_MANAGER_3: {
    id: "ARION_MULTITIER_VALUE_MULTI_MANAGER_3",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "RELATIONAL",
    persona: "MANAGER",
    tier2Mode: "product-value",
    question: "We need both GDPR and ISO 27001 - does ArionComply help manage multiple frameworks?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.PRODUCT_VALUE,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.PRODUCT_VALUE,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [],
      "We need both GDPR and ISO 27001 - does ArionComply help manage multiple frameworks?"
    ),
    expectedTopics: ["multi-framework support", "control mapping", "shared evidence", "unified dashboard", "efficiency gains", "cross-framework gaps"],
    expectedBehavior: "Should explain multi-framework benefits (shared evidence repository, control mapping, unified view), quantify efficiency gains vs managing separately",
    complexity: "intermediate",
    estimatedTokens: 2250
  },

  PRODUCT_VALUE_AUDIT_PREPARATION_AUDITOR_1: {
    id: "ARION_MULTITIER_VALUE_AUDIT_AUDITOR_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "PROCEDURAL",
    persona: "AUDITOR",
    tier2Mode: "product-value",
    question: "How does ArionComply streamline the audit process?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.PRODUCT_VALUE,
    tier3Context: buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
    orgProfile: ORG_PROFILES.ENTERPRISE_SAAS,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.PRODUCT_VALUE,
      buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
      [],
      "How does ArionComply streamline the audit process?"
    ),
    expectedTopics: ["centralized evidence", "audit trail", "export packages", "auditor access", "evidence linking", "gap remediation tracking"],
    expectedBehavior: "Should explain audit preparation features (evidence repository, audit packages, auditor portal), quantify time savings (weeks to days)",
    complexity: "intermediate",
    estimatedTokens: 2220
  },

  //
  // PRODUCT FEATURES TESTS (5 prompts - 10%)
  //

  PRODUCT_FEATURES_EVIDENCE_UPLOAD_PRACTITIONER_1: {
    id: "ARION_MULTITIER_FEATURES_EVIDENCE_PRACTITIONER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "product-features",
    question: "How do I upload evidence for a control in ArionComply?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.PRODUCT_FEATURES,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.PRODUCT_FEATURES,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [],
      "How do I upload evidence for a control in ArionComply?"
    ),
    expectedTopics: ["navigate to control", "Add Evidence button", "upload file", "link URL", "add description", "tag evidence"],
    expectedBehavior: "Should provide step-by-step navigation (Frameworks > [Framework] > Control > Add Evidence), explain evidence types (file/link), mention tagging for organization",
    complexity: "beginner",
    estimatedTokens: 2180
  },

  PRODUCT_FEATURES_DASHBOARD_NAVIGATION_NOVICE_1: {
    id: "ARION_MULTITIER_FEATURES_DASHBOARD_NOVICE_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "FACTUAL",
    persona: "NOVICE",
    tier2Mode: "product-features",
    question: "Where do I see my overall compliance status?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.PRODUCT_FEATURES,
    tier3Context: buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
    orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.PRODUCT_FEATURES,
      buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
      [],
      "Where do I see my overall compliance status?"
    ),
    expectedTopics: ["Dashboard", "compliance score", "framework breakdown", "gap summary", "recent activity"],
    expectedBehavior: "Should direct to Dashboard (left sidebar), explain dashboard components (compliance score, framework cards, gap chart, activity timeline)",
    complexity: "beginner",
    estimatedTokens: 2160
  },

  PRODUCT_FEATURES_GENERATE_REPORT_MANAGER_1: {
    id: "ARION_MULTITIER_FEATURES_REPORT_MANAGER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "PROCEDURAL",
    persona: "MANAGER",
    tier2Mode: "product-features",
    question: "How do I generate an executive summary report for our board?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.PRODUCT_FEATURES,
    tier3Context: buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
    orgProfile: ORG_PROFILES.ENTERPRISE_SAAS,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.PRODUCT_FEATURES,
      buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
      [],
      "How do I generate an executive summary report for our board?"
    ),
    expectedTopics: ["Reports section", "Executive Summary template", "select frameworks", "customize date range", "export PDF"],
    expectedBehavior: "Should provide navigation (Reports > Executive Summary), explain customization options (framework selection, date range), mention export formats (PDF/Excel)",
    complexity: "beginner",
    estimatedTokens: 2190
  },

  PRODUCT_FEATURES_SEARCH_CONTROLS_PRACTITIONER_2: {
    id: "ARION_MULTITIER_FEATURES_SEARCH_PRACTITIONER_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "PROCEDURAL",
    persona: "PRACTITIONER",
    tier2Mode: "product-features",
    question: "How do I find all controls related to encryption?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.PRODUCT_FEATURES,
    tier3Context: buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
    orgProfile: ORG_PROFILES.RETAIL_CHAIN,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.PRODUCT_FEATURES,
      buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
      [],
      "How do I find all controls related to encryption?"
    ),
    expectedTopics: ["search bar", "keyword search", "filter by framework", "control results", "cross-framework search"],
    expectedBehavior: "Should explain search functionality (top bar search, keyword 'encryption'), mention filtering by framework, list expected results (GDPR Art. 32, ISO 27001 A.8.24, etc.)",
    complexity: "beginner",
    estimatedTokens: 2170
  },

  PRODUCT_FEATURES_NOTIFICATIONS_SETTINGS_MANAGER_2: {
    id: "ARION_MULTITIER_FEATURES_NOTIFICATIONS_MANAGER_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "PROCEDURAL",
    persona: "MANAGER",
    tier2Mode: "product-features",
    question: "Can I set up alerts when compliance gaps are identified?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.PRODUCT_FEATURES,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.PRODUCT_FEATURES,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [],
      "Can I set up alerts when compliance gaps are identified?"
    ),
    expectedTopics: ["Settings", "Notifications", "email alerts", "gap notifications", "evidence expiration", "assessment reminders"],
    expectedBehavior: "Should guide to Settings > Notifications, explain alert types (gap detection, evidence expiration, assessment deadlines), mention email/in-app options",
    complexity: "beginner",
    estimatedTokens: 2180
  },

  //
  // GENERAL FALLBACK TESTS (5 prompts - 10%)
  //

  GENERAL_COMPLIANCE_BASICS_NOVICE_1: {
    id: "ARION_MULTITIER_GENERAL_BASICS_NOVICE_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "FACTUAL",
    persona: "NOVICE",
    tier2Mode: "general",
    question: "What's the difference between compliance and security?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GENERAL,
    tier3Context: buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
    orgProfile: ORG_PROFILES.EDTECH_NONPROFIT,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GENERAL,
      buildTier3Context(ORG_PROFILES.EDTECH_NONPROFIT),
      [],
      "What's the difference between compliance and security?"
    ),
    expectedTopics: ["security protects assets", "compliance meets requirements", "overlap", "security enables compliance", "regulatory obligations"],
    expectedBehavior: "Should explain distinction (security: protecting systems/data, compliance: meeting regulatory requirements), discuss overlap, provide education sector examples",
    complexity: "beginner",
    estimatedTokens: 2140
  },

  GENERAL_FRAMEWORK_SELECTION_MANAGER_1: {
    id: "ARION_MULTITIER_GENERAL_FRAMEWORK_MANAGER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "RELATIONAL",
    persona: "MANAGER",
    tier2Mode: "general",
    question: "Which compliance framework should we start with?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GENERAL,
    tier3Context: buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
    orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GENERAL,
      buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
      [],
      "Which compliance framework should we start with?"
    ),
    expectedTopics: ["industry requirements", "customer expectations", "geographic location", "GDPR for EU", "HIPAA for healthcare", "ISO 27001 for trust"],
    expectedBehavior: "Should ask qualifying questions (industry, region, customers), recommend GDPR for EU healthcare startup, mention HIPAA consideration if handling US patient data",
    complexity: "intermediate",
    estimatedTokens: 2170
  },

  GENERAL_MATURITY_MODEL_EXECUTIVE_1: {
    id: "ARION_MULTITIER_GENERAL_MATURITY_EXECUTIVE_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "SYNTHESIS",
    persona: "EXECUTIVE",
    tier2Mode: "general",
    question: "How do I build a compliance program from scratch?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GENERAL,
    tier3Context: buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
    orgProfile: ORG_PROFILES.RETAIL_CHAIN,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GENERAL,
      buildTier3Context(ORG_PROFILES.RETAIL_CHAIN),
      [],
      "How do I build a compliance program from scratch?"
    ),
    expectedTopics: ["maturity model", "gap assessment", "prioritization", "policies", "controls", "training", "continuous improvement"],
    expectedBehavior: "Should outline compliance program maturity journey (assess, prioritize, implement, monitor), provide retail-specific roadmap (PCI-DSS first, then GDPR/CCPA)",
    complexity: "advanced",
    estimatedTokens: 2200
  },

  GENERAL_FRAMEWORK_MAPPING_PRACTITIONER_1: {
    id: "ARION_MULTITIER_GENERAL_MAPPING_PRACTITIONER_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "RELATIONAL",
    persona: "PRACTITIONER",
    tier2Mode: "general",
    question: "How does GDPR relate to ISO 27001?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GENERAL,
    tier3Context: buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
    orgProfile: ORG_PROFILES.FINANCE_MEDIUM,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GENERAL,
      buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
      [],
      "How does GDPR relate to ISO 27001?"
    ),
    expectedTopics: ["overlap", "ISO 27001 supports GDPR", "security measures", "complementary", "ISO 27701 extension", "mapping controls"],
    expectedBehavior: "Should explain relationship (ISO 27001 ISMS supports GDPR security requirements), mention ISO 27701 privacy extension, discuss benefits of dual certification",
    complexity: "intermediate",
    estimatedTokens: 2180
  },

  GENERAL_COMPLIANCE_CULTURE_EXECUTIVE_2: {
    id: "ARION_MULTITIER_GENERAL_CULTURE_EXECUTIVE_2",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: null,
    knowledgeType: "SYNTHESIS",
    persona: "EXECUTIVE",
    tier2Mode: "general",
    question: "How do I get my team to care about compliance?",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.GENERAL,
    tier3Context: buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
    orgProfile: ORG_PROFILES.ENTERPRISE_SAAS,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(
      TIER1_BASE_SYSTEM,
      TIER2_PROMPTS.GENERAL,
      buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
      [],
      "How do I get my team to care about compliance?"
    ),
    expectedTopics: ["compliance culture", "top-down commitment", "training", "incentives", "make it easy", "automation", "communicate value"],
    expectedBehavior: "Should discuss culture-building strategies (leadership commitment, training, automation to reduce friction, communicate business value), provide SaaS-relevant examples",
    complexity: "advanced",
    estimatedTokens: 2190
  }
};

/**
 * Export helper to generate JSON for prompt viewer
 * This converts the JavaScript test objects into the format expected by prompt-viewer.html
 */
export function exportForPromptViewer() {
  const tests = Object.values(AI_BACKEND_MULTI_TIER_TESTS);

  return {
    description: "AI backend multi-tier prompt construction tests (TIER 1+2+3+4)",
    count: tests.length,
    tests: tests.map(test => ({
      ...test,
      // Add complexity scoring for viewer compatibility
      promptComplexity: {
        level: test.estimatedTokens > 2400 ? "high" : test.estimatedTokens > 2200 ? "moderate" : "simple",
        score: Math.floor((test.estimatedTokens / 2500) * 100),
        tokens: test.estimatedTokens,
        technicalDensity: 50, // Multi-tier prompts are inherently complex
        performanceClass: test.estimatedTokens > 2400 ? "slow" : test.estimatedTokens > 2200 ? "medium" : "fast"
      }
    }))
  };
}
