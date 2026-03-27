// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/NEW-PROMPTS-V2.3-EXAMPLES.js
// Description: Example prompts following PROMPT-SCHEMA v2.3.0 with ground truth validation
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26
//
// Purpose: These are reference examples showing the complete v2.3.0 schema pattern.
// Once validated, these patterns will be used to update all 239 existing prompts
// and guide creation of new prompts.

/**
 * NEW PROMPTS WITH v2.3.0 GROUND TRUTH FIELDS
 *
 * These prompts demonstrate the complete schema including:
 * - All required base fields (id, category, vendor, question, expectedTopics, complexity)
 * - Complete taxonomy (standard, knowledgeType, persona)
 * - NEW: expectedReferenceURL (authoritative source)
 * - NEW: mustMention (essential facts)
 * - NEW: mustNotMention (common misconceptions)
 * - NEW: referenceAnswer (optional but encouraged)
 *
 * Variety: Covers different standards, personas, knowledge types to show all patterns
 */

export const NEW_PROMPTS_V23_EXAMPLES = [

  // Example 1: FACTUAL + NOVICE (Simple factual question)
  {
    id: "SOC2_FACTUAL_NOVICE_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "SOC_2",
    knowledgeType: "FACTUAL",
    persona: "NOVICE",
    question: "What is SOC 2?",
    expectedTopics: ["audit", "service organization", "trust services", "AICPA"],
    complexity: "beginner",

    // v2.3.0: Authoritative reference
    expectedReferenceURL: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2",
    referenceSource: "AICPA SOC 2 Overview",
    referenceAccessibility: "free",

    // v2.3.0: Ground truth validation
    mustMention: [
      "audit report",
      "service organization",
      "trust services criteria"
    ],
    mustNotMention: [
      "SOC 2 is a certification",  // It's a report, not certification
      "only for cloud companies"    // Applies to all service orgs
    ],
    referenceAnswer: "SOC 2 is an audit framework developed by the AICPA (American Institute of CPAs) for service organizations. It produces an audit report that evaluates controls related to the Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy. SOC 2 Type I reports on control design at a point in time, while Type II reports on operating effectiveness over a period (typically 6-12 months)."
  },

  // Example 2: FACTUAL + EXECUTIVE (Business-focused - fills EXECUTIVE gap)
  {
    id: "ISO27001_FACTUAL_EXECUTIVE_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "ISO_27001",
    knowledgeType: "FACTUAL",
    persona: "EXECUTIVE",
    question: "What business benefits does ISO 27001 certification provide?",
    expectedTopics: ["competitive advantage", "customer trust", "risk management", "market access"],
    complexity: "advanced",

    expectedReferenceURL: "https://www.iso.org/standard/27001",
    alternativeReferenceURL: "https://www.isms.online/iso-27001/",
    referenceSource: "ISO 27001:2022 (Official Standard)",
    referenceAccessibility: "paywall",
    referenceNote: "Free summary available; official standard provides comprehensive business case details",

    mustMention: [
      "customer trust",
      "competitive advantage OR market differentiation",
      "risk management"
    ],
    mustNotMention: [
      "ISO 27001 is easy to get",
      "no ongoing costs",
      "guarantees no breaches"
    ],
    referenceAnswer: "ISO 27001 certification provides significant business benefits: (1) Competitive Advantage - meets customer security requirements, especially for enterprise sales and RFPs; (2) Customer Trust - demonstrates commitment to information security through independent third-party verification; (3) Risk Management - systematic approach to identifying and managing information security risks; (4) Market Access - required or preferred by many industries and regions; (5) Insurance - may reduce cyber insurance premiums; (6) Regulatory Alignment - supports compliance with GDPR, HIPAA, and other regulations requiring security controls. ROI typically realized through increased sales opportunities, reduced breach costs, and operational efficiencies."
  },

  // Example 3: PROCEDURAL + DEVELOPER (Technical implementation - fills DEVELOPER gap)
  {
    id: "GDPR_PROCEDURAL_DEVELOPER_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "GDPR",
    knowledgeType: "PROCEDURAL",
    persona: "DEVELOPER",
    question: "How do I implement GDPR right-to-erasure (Article 17) in a microservices architecture?",
    expectedTopics: ["data deletion", "cascade delete", "microservices", "API", "audit trail"],
    complexity: "advanced",

    expectedReferenceURL: "https://gdpr-info.eu/art-17-gdpr/",
    referenceSource: "GDPR Article 17 (Right to Erasure)",
    referenceAccessibility: "free",

    mustMention: [
      "delete across all services",
      "API endpoint OR deletion endpoint",
      "verify identity",
      "audit log"
    ],
    mustNotMention: [
      "just delete from database",  // Incomplete - must delete everywhere
      "can ignore backups"           // Backups must be addressed
    ],

    // For PROCEDURAL, answerKeyPoints works better than full reference answer
    answerKeyPoints: [
      {
        concept: "Verify requester identity",
        keywords: ["verify", "authenticate", "identity check", "validation"],
        weight: 15,
        required: true,
        alternatives: ["confirm identity", "authentication required"]
      },
      {
        concept: "Create deletion API endpoint",
        keywords: ["API endpoint", "DELETE endpoint", "deletion API"],
        weight: 20,
        required: true
      },
      {
        concept: "Identify all data locations",
        keywords: ["all services", "microservices", "all databases", "data inventory"],
        weight: 20,
        required: true
      },
      {
        concept: "Implement cascade deletion",
        keywords: ["cascade delete", "delete across services", "propagate deletion"],
        weight: 20,
        required: true
      },
      {
        concept: "Handle backups and archives",
        keywords: ["backups", "archives", "backup retention"],
        weight: 10,
        required: true
      },
      {
        concept: "Create audit trail",
        keywords: ["audit log", "deletion log", "compliance record"],
        weight: 10,
        required: true
      },
      {
        concept: "Return confirmation",
        keywords: ["confirm", "acknowledgment", "response"],
        weight: 5,
        required: false
      }
    ],

    referenceAnswer: "Implementing GDPR Article 17 (right to erasure) in microservices requires: (1) Verify requester identity through authentication; (2) Create a central deletion API endpoint that coordinates deletion across all services; (3) Identify all locations where personal data exists (user service, orders, analytics, logs, backups); (4) Implement cascade deletion that propagates the delete request to all microservices; (5) Address backups - mark for deletion or exclude from restoration; (6) Create comprehensive audit trail logging who requested deletion, when, and confirmation of deletion across all services; (7) Return confirmation to user within required timeframe (typically 30 days). Consider using event-driven architecture with deletion events, or synchronous API calls with transaction management to ensure complete deletion."
  },

  // Example 4: EXACT_MATCH + AUDITOR (Citation-based validation)
  {
    id: "PCI_DSS_EXACT_MATCH_AUDITOR_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "PCI_DSS",
    knowledgeType: "EXACT_MATCH",
    persona: "AUDITOR",
    question: "What does PCI-DSS Requirement 8.2.1 state about strong authentication for users?",
    expectedTopics: ["requirement 8.2.1", "authentication", "MFA", "multi-factor", "user access"],
    expectedCitation: "8.2.1",
    complexity: "advanced",

    expectedReferenceURL: "https://docs-prv.pcisecuritystandards.org/PCI%20DSS/Standard/PCI-DSS-v4_0.pdf",
    referenceSource: "PCI DSS v4.0 Requirement 8.2.1",
    referenceAccessibility: "free-with-registration",

    mustMention: [
      "multi-factor authentication",
      "all user access",
      "at least two authentication factors"
    ],
    mustNotMention: [
      "MFA is optional",
      "only for administrators"
    ],

    // For EXACT_MATCH, we want the actual regulatory text
    referenceAnswer: "PCI-DSS Requirement 8.2.1 states: Multi-factor authentication (MFA) is required for all access into the Card Data Environment (CDE). MFA requires at least two of the three authentication factors (something you know, something you have, something you are) to be presented before access is granted. This applies to all users, including administrators, with any access to systems in the CDE. The requirement aims to prevent unauthorized access even if one authentication factor (like a password) is compromised."
  },

  // Example 5: RELATIONAL + PRACTITIONER (Relationship/mapping question)
  {
    id: "HIPAA_RELATIONAL_PRACTITIONER_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "HIPAA",
    knowledgeType: "RELATIONAL",
    persona: "PRACTITIONER",
    question: "How does HIPAA Security Rule relate to HIPAA Privacy Rule in protecting patient data?",
    expectedTopics: ["security rule", "privacy rule", "relationship", "PHI", "safeguards"],
    complexity: "intermediate",

    expectedReferenceURL: "https://www.hhs.gov/hipaa/for-professionals/index.html",
    referenceSource: "HHS HIPAA for Professionals",
    referenceAccessibility: "free",

    mustMention: [
      "privacy rule governs use and disclosure",
      "security rule governs protection measures",
      "complementary"
    ],
    mustNotMention: [
      "security rule is part of privacy rule",  // They're separate
      "only one applies"
    ],

    referenceAnswer: "The HIPAA Privacy Rule and Security Rule are complementary regulations that work together. The Privacy Rule establishes the rules for how Protected Health Information (PHI) can be used and disclosed - it answers 'who can see the data and for what purposes.' The Security Rule establishes the safeguards required to protect electronic PHI (ePHI) - it answers 'how must the data be protected.' Together: Privacy Rule sets boundaries on data use, Security Rule enforces those boundaries through administrative, physical, and technical safeguards. For example, Privacy Rule limits who can access patient records; Security Rule requires access controls, encryption, and audit logs to enforce those limits. Both are required for HIPAA compliance."
  },

  // Example 6: SYNTHESIS + EXECUTIVE (Complex comparison - fills EXECUTIVE gap)
  {
    id: "EUAI_SYNTHESIS_EXECUTIVE_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "EU_AI_ACT",
    knowledgeType: "SYNTHESIS",
    persona: "EXECUTIVE",
    question: "What are the strategic implications of EU AI Act compliance for a US-based AI company?",
    expectedTopics: ["EU market access", "high-risk classification", "compliance costs", "competitive advantage"],
    complexity: "expert",

    expectedReferenceURL: "https://artificialintelligenceact.eu/",
    referenceSource: "EU AI Act (Adopted 2024)",
    referenceAccessibility: "free",

    mustMention: [
      "required for EU market",
      "high-risk systems have strict requirements",
      "extraterritorial scope"
    ],
    mustNotMention: [
      "only applies in Europe",
      "US companies exempt"
    ],

    // For SYNTHESIS/EXECUTIVE, example answers show quality levels
    exampleAnswers: {
      excellent: {
        answer: "EU AI Act creates strategic considerations for US AI companies: (1) Market Access - compliance is mandatory for selling AI systems in EU, regardless of company location; (2) Risk Classification - high-risk AI (hiring, credit scoring, law enforcement) face stringent requirements including conformity assessments, transparency obligations, and human oversight; (3) Compliance Costs - high-risk systems require technical documentation, testing, quality management (~$100K-500K initial investment); (4) Competitive Advantage - early compliance becomes market differentiator; (5) Regulatory Precedent - other jurisdictions may follow EU's approach; (6) Strategic Options - assess if EU market justifies compliance costs, or limit product scope to avoid high-risk classification. Recommendation: Conduct risk classification assessment, estimate compliance costs, evaluate EU revenue potential, consider proactive compliance as competitive advantage.",
        score: 95,
        strengths: ["Comprehensive coverage", "Specific cost estimates", "Strategic options", "Actionable recommendation"]
      },
      acceptable: {
        answer: "US AI companies must comply with EU AI Act to sell in Europe. High-risk AI systems have expensive requirements. Companies should evaluate if EU market revenue justifies compliance costs, and consider whether their AI qualifies as high-risk. Compliance could be competitive advantage.",
        score: 70,
        strengths: ["Covers main points", "Mentions cost consideration"],
        weaknesses: ["Lacks specific details", "No concrete recommendations"]
      },
      insufficient: {
        answer: "EU AI Act affects US companies if they sell in Europe. High-risk AI has more rules.",
        score: 30,
        weaknesses: ["Too vague", "No strategic analysis", "Missing key implications"]
      }
    }
  },

  // Example 7: PROCEDURAL + MANAGER (Workflow/process question)
  {
    id: "SOC2_PROCEDURAL_MANAGER_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "SOC_2",
    knowledgeType: "PROCEDURAL",
    persona: "MANAGER",
    question: "What is the workflow for achieving SOC 2 Type II certification from scratch?",
    expectedTopics: ["scoping", "control design", "implementation", "operating period", "audit"],
    complexity: "advanced",

    expectedReferenceURL: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2",
    alternativeReferenceURL: "https://us.aicpa.org/content/dam/aicpa/interestareas/frc/assuranceadvisoryservices/downloadabledocuments/trust-services-criteria.pdf",
    referenceSource: "AICPA SOC 2 Framework",
    referenceAccessibility: "free",

    mustMention: [
      "scoping",
      "control implementation",
      "6-12 month OR operating period",
      "third-party audit"
    ],
    mustNotMention: [
      "can get SOC 2 in a month",
      "no ongoing monitoring needed"
    ],

    answerKeyPoints: [
      {
        concept: "Determine scope and Trust Services Categories",
        keywords: ["scoping", "scope definition", "which criteria", "TSC selection"],
        weight: 15,
        required: true
      },
      {
        concept: "Design controls for selected criteria",
        keywords: ["design controls", "control design", "implement controls"],
        weight: 20,
        required: true
      },
      {
        concept: "Implement and operationalize controls",
        keywords: ["implementation", "operationalize", "deploy controls"],
        weight: 20,
        required: true
      },
      {
        concept: "Operate for 6-12 months (Type II requirement)",
        keywords: ["6 months", "12 months", "operating period", "6-12 month"],
        weight: 20,
        required: true
      },
      {
        concept: "Collect evidence of operating effectiveness",
        keywords: ["evidence", "documentation", "proof of operation"],
        weight: 10,
        required: true
      },
      {
        concept: "Engage third-party auditor",
        keywords: ["auditor", "CPA firm", "audit firm", "third-party"],
        weight: 10,
        required: true
      },
      {
        concept: "Complete audit and receive report",
        keywords: ["audit", "report", "Type II report"],
        weight: 5,
        required: true
      }
    ]
  },

  // Example 8: EXACT_MATCH + DEVELOPER (Technical spec citation)
  {
    id: "PCIDSS_EXACT_MATCH_DEVELOPER_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "PCI_DSS",
    knowledgeType: "EXACT_MATCH",
    persona: "DEVELOPER",
    question: "What does PCI-DSS Requirement 6.5.1 specify for injection flaw prevention in code?",
    expectedTopics: ["requirement 6.5.1", "injection flaws", "SQL injection", "input validation"],
    expectedCitation: "6.5.1",
    complexity: "advanced",

    expectedReferenceURL: "https://docs-prv.pcisecuritystandards.org/PCI%20DSS/Standard/PCI-DSS-v4_0.pdf",
    referenceSource: "PCI DSS v4.0 Requirement 6.5.1",
    referenceAccessibility: "free-with-registration",

    mustMention: [
      "injection flaws",
      "input validation",
      "parameterized queries OR prepared statements"
    ],
    mustNotMention: [
      "just validate input is enough",  // Need parameterized queries too
      "only SQL injection"              // Covers all injection types
    ],

    referenceAnswer: "PCI-DSS Requirement 6.5.1 requires applications to be developed securely to prevent injection flaws, including SQL injection, LDAP injection, and command injection. Specific requirements: (1) Validate all input data for type, length, format, and range; (2) Use parameterized queries or prepared statements (NOT string concatenation) for database access; (3) Escape special characters in output contexts; (4) Use ORM frameworks with built-in SQL injection protection; (5) Apply principle of least privilege for database accounts; (6) Code review and security testing to verify protection. Implementation: For SQL, always use prepared statements like `connection.execute('SELECT * FROM users WHERE id = ?', [userId])` never `query = 'SELECT * FROM users WHERE id = ' + userId`."
  },

  // Example 9: SYNTHESIS + DEVELOPER (Technical comparison)
  {
    id: "MULTIPLE_SYNTHESIS_DEVELOPER_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "GDPR",  // Primary standard
    knowledgeType: "SYNTHESIS",
    persona: "DEVELOPER",
    question: "Compare encryption requirements across GDPR Article 32, HIPAA Security Rule, and PCI-DSS Requirement 3 - what's the unified approach?",
    expectedTopics: ["encryption", "GDPR", "HIPAA", "PCI-DSS", "unified controls"],
    complexity: "expert",

    expectedReferenceURL: "https://gdpr-info.eu/art-32-gdpr/",
    alternativeReferenceURL: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html",
    referenceSource: "GDPR Article 32 + HIPAA Security Rule + PCI-DSS Req 3",
    referenceAccessibility: "free",

    mustMention: [
      "encryption at rest",
      "encryption in transit",
      "key management"
    ],
    mustNotMention: [
      "encryption is optional under GDPR",  // Article 32 requires appropriate measures
      "same encryption for all data types"  // PCI requires stronger for cardholder data
    ],

    validationRubric: {
      dimensions: [
        {
          name: "Identifies Common Requirements",
          weight: 30,
          levels: {
            excellent: "Lists encryption at rest, in transit, and key management as common to all three",
            good: "Mentions encryption requirements for each standard",
            poor: "Only mentions encryption generally",
            fail: "Doesn't identify commonalities"
          }
        },
        {
          name: "Highlights Differences",
          weight: 30,
          levels: {
            excellent: "Notes PCI requires AES-256 minimum, GDPR/HIPAA are risk-based, PCI has specific key rotation",
            good: "Mentions that requirements differ in specificity",
            poor: "Says they're all the same",
            fail: "Incorrect about differences"
          }
        },
        {
          name: "Proposes Unified Approach",
          weight: 25,
          levels: {
            excellent: "Recommends implementing strongest requirement (PCI) to satisfy all three",
            good: "Suggests using common controls where possible",
            poor: "Doesn't propose unified approach",
            fail: "Proposes non-compliant approach"
          }
        },
        {
          name: "Technical Implementation Guidance",
          weight: 15,
          levels: {
            excellent: "Provides specific algorithms, libraries, or code examples",
            good: "Mentions technical considerations",
            poor: "No technical details",
            fail: "Incorrect technical guidance"
          }
        }
      },
      minimumPassingScore: 60,
      scoringMethod: "weighted"
    }
  },

  // Example 10: FACTUAL + DEVELOPER (Technical definition)
  {
    id: "ISO27001_FACTUAL_DEVELOPER_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "ISO_27001",
    knowledgeType: "FACTUAL",
    persona: "DEVELOPER",
    question: "What does ISO 27001 control A.8.24 require for cryptographic controls implementation?",
    expectedTopics: ["cryptography", "encryption", "key management", "algorithms"],
    complexity: "intermediate",

    expectedReferenceURL: "https://www.iso.org/standard/27001",
    alternativeReferenceURL: "https://www.isms.online/iso-27001/annex-a-8-asset-management/",
    referenceSource: "ISO 27001:2022 Control A.8.24",
    referenceAccessibility: "paywall",
    referenceNote: "Official standard requires purchase; free control summary available",

    mustMention: [
      "cryptographic policy",
      "key management",
      "appropriate algorithms"
    ],
    mustNotMention: [
      "any encryption is acceptable",
      "no need for key rotation"
    ],

    referenceAnswer: "ISO 27001 Control A.8.24 (Use of cryptography) requires: (1) Cryptographic policy defining when and how cryptography is used to protect information; (2) Use of cryptographically strong algorithms and key lengths (e.g., AES-256, RSA-2048+); (3) Secure key management covering: key generation, distribution, storage, rotation, and destruction; (4) Key segregation (encryption keys separate from data); (5) Key backup and recovery procedures; (6) Regular review of cryptographic implementations as algorithms age. Technical implementation: Use industry-standard libraries (not custom crypto), implement automated key rotation, store keys in HSM or key management service (AWS KMS, Azure Key Vault), separate encryption keys by environment (dev/staging/prod), audit all key access."
  },

  // Example 11: PROCEDURAL + EXECUTIVE (Strategic workflow - fills EXECUTIVE gap)
  {
    id: "MULTIPLE_PROCEDURAL_EXECUTIVE_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "ISO_27001",
    knowledgeType: "PROCEDURAL",
    persona: "EXECUTIVE",
    question: "What is the business workflow for building a compliance program from scratch?",
    expectedTopics: ["compliance program", "roadmap", "framework selection", "resource allocation"],
    complexity: "expert",

    expectedReferenceURL: "https://www.iso.org/standard/27001",
    alternativeReferenceURL: "https://www.isms.online/iso-27001/",
    referenceSource: "ISO 27001 ISMS Framework (as example)",
    referenceAccessibility: "paywall",

    mustMention: [
      "gap assessment",
      "framework selection",
      "prioritization",
      "resource commitment"
    ],
    mustNotMention: [
      "can complete in a month",
      "no ongoing costs"
    ],

    answerKeyPoints: [
      {
        concept: "Identify business drivers and requirements",
        keywords: ["business drivers", "customer requirements", "regulatory requirements"],
        weight: 15,
        required: true
      },
      {
        concept: "Select appropriate frameworks",
        keywords: ["select framework", "choose standard", "ISO 27001", "SOC 2"],
        weight: 15,
        required: true
      },
      {
        concept: "Conduct gap assessment",
        keywords: ["gap assessment", "current state", "maturity assessment"],
        weight: 20,
        required: true
      },
      {
        concept: "Prioritize based on risk and value",
        keywords: ["prioritize", "risk-based", "quick wins"],
        weight: 15,
        required: true
      },
      {
        concept: "Allocate resources and budget",
        keywords: ["resources", "budget", "team", "investment"],
        weight: 15,
        required: true
      },
      {
        concept: "Implement controls and documentation",
        keywords: ["implement", "controls", "policies", "procedures"],
        weight: 10,
        required: true
      },
      {
        concept: "Continuous monitoring and improvement",
        keywords: ["monitoring", "continuous", "maintain", "improve"],
        weight: 10,
        required: true
      }
    ]
  },

  // Example 12: RELATIONAL + EXECUTIVE (Strategic relationship)
  {
    id: "ISO27001_RELATIONAL_EXECUTIVE_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "ISO_27001",
    knowledgeType: "RELATIONAL",
    persona: "EXECUTIVE",
    question: "How does ISO 27001 certification impact cyber insurance premiums and coverage?",
    expectedTopics: ["cyber insurance", "premiums", "risk reduction", "certification value"],
    complexity: "advanced",

    expectedReferenceURL: "https://www.iso.org/standard/27001",
    alternativeReferenceURL: "https://www.isms.online/iso-27001/",
    referenceSource: "ISO 27001:2022",
    referenceAccessibility: "paywall",

    mustMention: [
      "reduces premiums",
      "demonstrates risk management",
      "better coverage OR higher limits"
    ],
    mustNotMention: [
      "eliminates need for insurance",
      "guarantees lower premiums"
    ],

    referenceAnswer: "ISO 27001 certification positively impacts cyber insurance in several ways: (1) Premium Reduction - many insurers offer 10-30% premium discounts for certified organizations as it demonstrates systematic risk management; (2) Improved Coverage - certified organizations may qualify for higher coverage limits and broader policy terms; (3) Easier Underwriting - certification streamlines the insurance application process as it provides evidence of security controls; (4) Claims Advantage - in event of a breach, certification demonstrates due diligence which can aid claims process; (5) Risk Transfer - certification enables transfer of more risk to insurer through better policy terms. However, certification doesn't guarantee specific premium reductions (varies by insurer, industry, and organization size) and doesn't eliminate the need for insurance. ROI consideration: If insurance premium savings exceed certification costs (~$50K-150K), there's direct financial benefit beyond other strategic advantages."
  },

  // Example 13: EXACT_MATCH + AUDITOR (Regulatory citation - fills EXACT_MATCH gap)
  {
    id: "HIPAA_EXACT_MATCH_AUDITOR_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "HIPAA",
    knowledgeType: "EXACT_MATCH",
    persona: "AUDITOR",
    question: "What does HIPAA Security Rule § 164.312(a)(1) require for access controls?",
    expectedTopics: ["164.312(a)(1)", "access control", "technical safeguards", "unique user identification"],
    expectedCitation: "164.312(a)(1)",
    complexity: "advanced",

    expectedReferenceURL: "https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html",
    referenceSource: "HIPAA Security Rule § 164.312(a)(1)",
    referenceAccessibility: "free",

    mustMention: [
      "unique user identification",
      "assign unique identifier",
      "technical safeguards"
    ],
    mustNotMention: [
      "shared accounts acceptable",
      "generic logins OK"
    ],

    referenceAnswer: "HIPAA Security Rule § 164.312(a)(1) Standard: Access Control requires: 'Implement technical policies and procedures for electronic information systems that maintain electronic protected health information to allow access only to those persons or software programs that have been granted access rights.' Implementation specification § 164.312(a)(2)(i): Unique User Identification (Required) - Assign a unique name and/or number for identifying and tracking user identity. This means: (1) Each user must have unique credentials; (2) Shared accounts are prohibited; (3) Generic logins (admin, user) are non-compliant; (4) User activities must be traceable to individuals; (5) System must be able to track who accessed what ePHI when. Audit evidence: User account list showing unique identifiers, access logs showing individual user actions, policy prohibiting account sharing."
  },

  // Example 14: FACTUAL + DEVELOPER (Technical implementation detail)
  {
    id: "GDPR_FACTUAL_DEVELOPER_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "GDPR",
    knowledgeType: "FACTUAL",
    persona: "DEVELOPER",
    question: "What are the GDPR requirements for logging personal data access?",
    expectedTopics: ["audit logs", "access logs", "Article 32", "data security"],
    complexity: "intermediate",

    expectedReferenceURL: "https://gdpr-info.eu/art-32-gdpr/",
    referenceSource: "GDPR Article 32 (Security of Processing)",
    referenceAccessibility: "free",

    mustMention: [
      "log who accessed data",
      "when accessed",
      "what data accessed"
    ],
    mustNotMention: [
      "GDPR doesn't require logging",
      "logs are optional"
    ],

    referenceAnswer: "GDPR Article 32 requires 'appropriate technical and organizational measures' for security, which includes audit logging. Logging requirements: (1) WHO - User ID or system accessing personal data; (2) WHAT - Which records/data were accessed or modified; (3) WHEN - Timestamp (UTC recommended); (4) WHY - Purpose or operation (read, update, delete); (5) RESULT - Success or failure. Technical implementation: Use centralized logging (ELK stack, Splunk, CloudWatch); Include PII access in logs but don't log PII values themselves; Implement log retention per Article 32 (recommend 12+ months); Protect logs from tampering (immutable storage); Regular log review for anomalies; Enable rapid incident investigation per Article 33 (72-hour breach notification). Example: `{timestamp: '2024-01-15T10:30:00Z', user: 'user@example.com', action: 'READ', resource: 'customer_record', recordId: '[hash]', success: true}`"
  },

  // Example 15: PROCEDURAL + DEVELOPER (Step-by-step technical implementation)
  {
    id: "SOC2_PROCEDURAL_DEVELOPER_NEW_1",
    category: "compliance_knowledge",
    vendor: "Generic",
    standard: "SOC_2",
    knowledgeType: "PROCEDURAL",
    persona: "DEVELOPER",
    question: "How do I implement SOC 2 CC6.1 (logical access controls) in a web application?",
    expectedTopics: ["access control", "authentication", "authorization", "CC6.1", "implementation"],
    complexity: "advanced",

    expectedReferenceURL: "https://us.aicpa.org/content/dam/aicpa/interestareas/frc/assuranceadvisoryservices/downloadabledocuments/trust-services-criteria.pdf",
    referenceSource: "SOC 2 Trust Services Criteria - CC6.1",
    referenceAccessibility: "free",

    mustMention: [
      "authentication",
      "authorization",
      "role-based access OR RBAC",
      "audit logging"
    ],
    mustNotMention: [
      "basic password is enough",
      "no MFA needed"
    ],

    answerKeyPoints: [
      {
        concept: "Implement strong authentication",
        keywords: ["authentication", "MFA", "multi-factor", "password policy"],
        weight: 25,
        required: true
      },
      {
        concept: "Implement authorization/RBAC",
        keywords: ["authorization", "RBAC", "role-based", "permissions"],
        weight: 25,
        required: true
      },
      {
        concept: "Create access control policy",
        keywords: ["access policy", "least privilege", "access rules"],
        weight: 15,
        required: true
      },
      {
        concept: "Implement session management",
        keywords: ["session", "timeout", "logout"],
        weight: 10,
        required: true
      },
      {
        concept: "Log all access attempts",
        keywords: ["logging", "audit log", "access log"],
        weight: 15,
        required: true
      },
      {
        concept: "Regular access reviews",
        keywords: ["access review", "periodic review", "recertification"],
        weight: 10,
        required: true
      }
    ],

    referenceAnswer: "SOC 2 CC6.1 implementation for web application: (1) Authentication: Implement strong password policy (12+ chars, complexity) + MFA (TOTP, WebAuthn); Use framework like Auth0, Okta, or build with bcrypt/Argon2; (2) Authorization: Implement RBAC with roles (admin, user, readonly); Use middleware to check permissions on every endpoint; Principle of least privilege; (3) Session Management: Secure session tokens (httpOnly, secure, sameSite cookies); 30-minute idle timeout; Logout functionality; (4) Access Logging: Log authentication attempts (success/failure), authorization decisions, session creation/termination; Include user ID, timestamp, IP, resource accessed; (5) Access Reviews: Quarterly review of user accounts and permissions; Remove inactive users; Recertify role assignments; (6) Code Example: `app.post('/api/data', authenticate, authorize(['admin', 'user']), auditLog, handler)`. Testing: Verify unauthorized access blocked, MFA required, logs captured, timeouts enforced."
  }
];

/**
 * Summary of example prompts:
 * - 15 prompts total
 * - Covers 7 different standards (SOC_2, ISO_27001, GDPR, PCI_DSS, HIPAA, EU_AI_ACT, Multiple)
 * - Covers 4 personas (NOVICE, PRACTITIONER, EXECUTIVE, DEVELOPER, AUDITOR, MANAGER)
 * - Covers all 5 knowledge types (FACTUAL, PROCEDURAL, EXACT_MATCH, RELATIONAL, SYNTHESIS)
 * - All have v2.3.0 ground truth fields
 * - Demonstrates different validation approaches (referenceAnswer, answerKeyPoints, validationRubric, exampleAnswers)
 */

export function getNewPromptsV23() {
  return NEW_PROMPTS_V23_EXAMPLES;
}

export function getPromptsByType(knowledgeType) {
  return NEW_PROMPTS_V23_EXAMPLES.filter(p => p.knowledgeType === knowledgeType);
}

export function getPromptsByPersona(persona) {
  return NEW_PROMPTS_V23_EXAMPLES.filter(p => p.persona === persona);
}
