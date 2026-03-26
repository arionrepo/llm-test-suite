// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/arioncomply-workflows/intent-classification-tests.js
// Description: Intent classification accuracy tests for ArionComply - test if model can correctly identify user intent from queries
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23
// Last Updated: 2026-03-26 - Updated to PROMPT-SCHEMA v2.2.0

export const INTENT_CLASSIFICATION_TESTS = [
  // Evidence Management Intents
  {
    id: "ARION_INTENT_EVIDENCE_UPLOAD_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "I need to upload a document for one of our security controls",
    expectedTopics: ["upload", "document", "evidence", "control"],
    complexity: "beginner",
    // Intent-specific fields (schema extension)
    expectedIntent: "EVIDENCE_UPLOAD",
    intentCategory: "evidence_management",
    confidence: "high",
    contextClues: ["upload", "document", "security controls"]
  },
  {
    id: "ARION_INTENT_EVIDENCE_UPLOAD_2",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "How do I attach proof that we have encryption in place?",
    expectedTopics: ["attach", "proof", "evidence", "encryption"],
    complexity: "beginner",
    expectedIntent: "EVIDENCE_UPLOAD",
    intentCategory: "evidence_management",
    confidence: "high",
    contextClues: ["attach", "proof", "encryption"]
  },
  {
    id: "ARION_INTENT_EVIDENCE_UPLOAD_AMBIGUOUS_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "Where do I add files?",
    expectedTopics: ["add", "files", "upload"],
    complexity: "beginner",
    expectedIntent: "EVIDENCE_UPLOAD",
    intentCategory: "evidence_management",
    confidence: "low",
    ambiguity: "Could be evidence, policy, or general file upload"
  },

  // Assessment Intents
  {
    id: "ARION_INTENT_ASSESSMENT_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "I need to mark this control as implemented",
    expectedTopics: ["mark", "control", "implemented", "status"],
    complexity: "beginner",
    expectedIntent: "CONTROL_ASSESSMENT",
    intentCategory: "assessment",
    confidence: "high",
    contextClues: ["mark", "control", "implemented"]
  },
  {
    id: "ARION_INTENT_ASSESSMENT_2",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "How do I evaluate if our access control is working?",
    expectedTopics: ["evaluate", "assess", "control", "working"],
    complexity: "intermediate",
    expectedIntent: "CONTROL_ASSESSMENT",
    intentCategory: "assessment",
    confidence: "high",
    contextClues: ["evaluate", "control", "working"]
  },
  {
    id: "ARION_INTENT_ASSESSMENT_3",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "We finished implementing MFA, where do I update the status?",
    expectedTopics: ["update", "status", "implementation", "MFA"],
    complexity: "beginner",
    expectedIntent: "CONTROL_ASSESSMENT",
    intentCategory: "assessment",
    confidence: "high",
    contextClues: ["finished implementing", "update status"]
  },

  // Framework Mapping Intents
  {
    id: "ARION_INTENT_MAPPING_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "Which ISO 27001 controls satisfy SOC 2 requirements?",
    expectedTopics: ["ISO 27001", "SOC 2", "mapping", "controls"],
    complexity: "intermediate",
    standard: "ISO_27001",
    expectedIntent: "FRAMEWORK_MAPPING",
    intentCategory: "framework_management",
    confidence: "high",
    contextClues: ["ISO 27001", "SOC 2", "satisfy"]
  },
  {
    id: "ARION_INTENT_MAPPING_2",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "Can you show me how our controls map across different standards?",
    expectedTopics: ["controls", "map", "standards", "mapping"],
    complexity: "intermediate",
    expectedIntent: "FRAMEWORK_MAPPING",
    intentCategory: "framework_management",
    confidence: "high",
    contextClues: ["controls", "map", "different standards"]
  },

  // Dashboard/Reporting Intents
  {
    id: "ARION_INTENT_DASHBOARD_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "What's our overall compliance score?",
    expectedTopics: ["compliance", "score", "status", "dashboard"],
    complexity: "beginner",
    expectedIntent: "COMPLIANCE_DASHBOARD",
    intentCategory: "reporting",
    confidence: "high",
    contextClues: ["overall", "compliance score"]
  },
  {
    id: "ARION_INTENT_DASHBOARD_2",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "Show me where we stand with GDPR",
    expectedTopics: ["status", "GDPR", "compliance", "dashboard"],
    complexity: "beginner",
    standard: "GDPR",
    expectedIntent: "COMPLIANCE_DASHBOARD",
    intentCategory: "reporting",
    confidence: "high",
    contextClues: ["where we stand", "GDPR"]
  },
  {
    id: "ARION_INTENT_DASHBOARD_AMBIGUOUS_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "I need a report for the board meeting",
    expectedTopics: ["report", "board", "compliance"],
    complexity: "beginner",
    expectedIntent: "COMPLIANCE_DASHBOARD",
    intentCategory: "reporting",
    confidence: "medium",
    ambiguity: "Could be dashboard, custom report, or audit report"
  },

  // Risk Management Intents
  {
    id: "ARION_INTENT_RISK_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "How do I add a new security risk to the system?",
    expectedTopics: ["add", "risk", "security", "risk register"],
    complexity: "beginner",
    expectedIntent: "RISK_ASSESSMENT",
    intentCategory: "risk_management",
    confidence: "high",
    contextClues: ["add", "security risk"]
  },
  {
    id: "ARION_INTENT_RISK_2",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "We identified a data breach risk, where do I document it?",
    expectedTopics: ["risk", "data breach", "document", "register"],
    complexity: "intermediate",
    expectedIntent: "RISK_ASSESSMENT",
    intentCategory: "risk_management",
    confidence: "high",
    contextClues: ["identified", "risk", "document"]
  },

  // Policy Management Intents
  {
    id: "ARION_INTENT_POLICY_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "I need to create a new data retention policy",
    expectedTopics: ["create", "policy", "data retention"],
    complexity: "beginner",
    expectedIntent: "POLICY_MANAGEMENT",
    intentCategory: "policy_management",
    confidence: "high",
    contextClues: ["create", "policy"]
  },
  {
    id: "ARION_INTENT_POLICY_2",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "Where are the policy templates?",
    expectedTopics: ["policy", "templates", "find"],
    complexity: "beginner",
    expectedIntent: "POLICY_MANAGEMENT",
    intentCategory: "policy_management",
    confidence: "high",
    contextClues: ["policy templates"]
  },
  {
    id: "ARION_INTENT_POLICY_3",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "Our access control policy needs updating",
    expectedTopics: ["policy", "update", "access control"],
    complexity: "beginner",
    expectedIntent: "POLICY_MANAGEMENT",
    intentCategory: "policy_management",
    confidence: "high",
    contextClues: ["policy", "needs updating"]
  },

  // Audit Preparation Intents
  {
    id: "ARION_INTENT_AUDIT_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "Our ISO 27001 audit is in 2 weeks, what do we need to prepare?",
    expectedTopics: ["audit", "preparation", "ISO 27001", "readiness"],
    complexity: "intermediate",
    standard: "ISO_27001",
    expectedIntent: "AUDIT_PREPARATION",
    intentCategory: "audit",
    confidence: "high",
    contextClues: ["audit", "prepare"]
  },
  {
    id: "ARION_INTENT_AUDIT_2",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "How do I generate an evidence package for our auditor?",
    expectedTopics: ["evidence", "package", "auditor", "generate"],
    complexity: "intermediate",
    expectedIntent: "AUDIT_PREPARATION",
    intentCategory: "audit",
    confidence: "high",
    contextClues: ["evidence package", "auditor"]
  },
  {
    id: "ARION_INTENT_AUDIT_3",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "What's missing for our SOC 2 readiness?",
    expectedTopics: ["readiness", "SOC 2", "gaps", "missing"],
    complexity: "intermediate",
    standard: "SOC_2",
    expectedIntent: "AUDIT_PREPARATION",
    intentCategory: "audit",
    confidence: "high",
    contextClues: ["missing", "readiness"]
  },

  // Data Subject Request Intents
  {
    id: "ARION_INTENT_DSR_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "A customer asked for all their data, what do I do?",
    expectedTopics: ["data subject request", "access request", "customer data"],
    complexity: "intermediate",
    standard: "GDPR",
    expectedIntent: "DATA_SUBJECT_REQUEST",
    intentCategory: "privacy_operations",
    confidence: "high",
    contextClues: ["customer", "all their data"]
  },
  {
    id: "ARION_INTENT_DSR_2",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "Someone wants us to delete their account and information",
    expectedTopics: ["delete", "right to erasure", "account", "personal data"],
    complexity: "intermediate",
    standard: "GDPR",
    expectedIntent: "DATA_SUBJECT_REQUEST",
    intentCategory: "privacy_operations",
    confidence: "high",
    contextClues: ["delete", "account", "information"]
  },
  {
    id: "ARION_INTENT_DSR_3",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "GDPR access request came in, how to handle?",
    expectedTopics: ["GDPR", "access request", "data subject rights", "process"],
    complexity: "intermediate",
    standard: "GDPR",
    expectedIntent: "DATA_SUBJECT_REQUEST",
    intentCategory: "privacy_operations",
    confidence: "high",
    contextClues: ["GDPR", "access request", "handle"]
  },

  // Vendor Risk Intents
  {
    id: "ARION_INTENT_VENDOR_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "We're evaluating a new cloud provider, how do we assess them?",
    expectedTopics: ["vendor", "assessment", "cloud provider", "risk"],
    complexity: "intermediate",
    expectedIntent: "VENDOR_RISK_ASSESSMENT",
    intentCategory: "third_party_risk",
    confidence: "high",
    contextClues: ["evaluating", "cloud provider", "assess"]
  },
  {
    id: "ARION_INTENT_VENDOR_2",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "Where do I send a security questionnaire to our vendors?",
    expectedTopics: ["security questionnaire", "vendor", "send"],
    complexity: "beginner",
    expectedIntent: "VENDOR_RISK_ASSESSMENT",
    intentCategory: "third_party_risk",
    confidence: "high",
    contextClues: ["security questionnaire", "vendors"]
  },

  // AI Governance Intents
  {
    id: "ARION_INTENT_AI_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "We built a chatbot, do we need to register it?",
    expectedTopics: ["AI system", "chatbot", "register", "EU AI Act"],
    complexity: "intermediate",
    standard: "EU_AI_ACT",
    expectedIntent: "AI_SYSTEM_REGISTRATION",
    intentCategory: "ai_governance",
    confidence: "high",
    contextClues: ["chatbot", "register"]
  },
  {
    id: "ARION_INTENT_AI_2",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "How do I check if our AI system is high-risk under EU AI Act?",
    expectedTopics: ["AI system", "high-risk", "EU AI Act", "classification"],
    complexity: "intermediate",
    standard: "EU_AI_ACT",
    expectedIntent: "AI_SYSTEM_REGISTRATION",
    intentCategory: "ai_governance",
    confidence: "high",
    contextClues: ["AI system", "high-risk", "EU AI Act"]
  },

  // Ambiguous Queries (Multi-Intent)
  {
    id: "ARION_INTENT_AMBIGUOUS_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "I need help with compliance",
    expectedTopics: ["help", "compliance", "clarification needed"],
    complexity: "beginner",
    expectedIntent: "AMBIGUOUS",
    intentCategory: "needs_clarification",
    confidence: "none",
    possibleIntents: ["COMPLIANCE_DASHBOARD", "AUDIT_PREPARATION", "CONTROL_ASSESSMENT"],
    expectedClarifications: [
      "What specific compliance task do you need help with?",
      "Are you looking for your compliance status, preparing for an audit, or assessing controls?",
      "Which framework or standard are you working with?"
    ]
  },
  {
    id: "ARION_INTENT_AMBIGUOUS_2",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "How do I add something?",
    expectedTopics: ["add", "clarification needed"],
    complexity: "beginner",
    expectedIntent: "AMBIGUOUS",
    intentCategory: "needs_clarification",
    confidence: "none",
    possibleIntents: ["EVIDENCE_UPLOAD", "RISK_ASSESSMENT", "POLICY_MANAGEMENT", "AI_SYSTEM_REGISTRATION"],
    expectedClarifications: [
      "What type of item do you want to add?",
      "Are you uploading evidence, creating a policy, adding a risk, or registering an AI system?"
    ]
  },
  {
    id: "ARION_INTENT_AMBIGUOUS_3",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "Where is the upload button?",
    expectedTopics: ["upload", "button", "navigation"],
    complexity: "beginner",
    expectedIntent: "AMBIGUOUS",
    intentCategory: "needs_clarification",
    confidence: "low",
    possibleIntents: ["EVIDENCE_UPLOAD", "POLICY_MANAGEMENT"],
    expectedClarifications: [
      "What are you trying to upload?",
      "Are you uploading evidence for a control or uploading a policy document?"
    ]
  },

  // Context-Dependent Queries
  {
    id: "ARION_INTENT_CONTEXT_1",
    category: "intent_classification",
    vendor: "ArionComply",
    question: "What do I do next?",
    expectedTopics: ["next action", "guidance", "workflow"],
    complexity: "beginner",
    expectedIntent: "CONTEXT_DEPENDENT",
    intentCategory: "needs_context",
    confidence: "none",
    requiredContext: ["current_screen", "previous_action", "user_role"],
    expectedClarifications: [
      "What screen are you currently on?",
      "What were you just doing?",
      "What is your goal?"
    ]
  }
];

export const WORKFLOW_UNDERSTANDING_TESTS = [
  // Evidence Upload Workflow
  {
    id: "ARION_WORKFLOW_EVIDENCE_UPLOAD_1",
    category: "workflow_understanding",
    vendor: "ArionComply",
    question: "How do I upload evidence for a control?",
    expectedTopics: ["navigate", "control", "evidence", "upload", "button"],
    complexity: "beginner",
    // Workflow-specific fields (schema extension)
    task: "EVIDENCE_UPLOAD",
    expectedSteps: [
      "Navigate to the control detail page",
      "Click the Add Evidence button",
      "Select evidence type",
      "Upload file or provide link",
      "Add description"
    ],
    expectedGuidance: [
      "Navigate to the control detail page",
      "Click the Add Evidence button",
      "Select evidence type",
      "Upload file or provide link",
      "Add description"
    ],
    expectedScreens: ["control detail page", "evidence upload"],
    expectedButtons: ["Add Evidence", "Upload"],
    mustMention: ["control", "evidence", "upload"],
    scoringCriteria: {
      mentionsCorrectScreen: 30,
      mentionsCorrectButton: 20,
      stepsInCorrectOrder: 30,
      includesAllSteps: 20
    }
  },

  // Control Assessment Workflow
  {
    id: "ARION_WORKFLOW_ASSESSMENT_1",
    category: "workflow_understanding",
    vendor: "ArionComply",
    question: "How do I assess the implementation status of a control?",
    expectedTopics: ["assessment", "control", "implementation", "status", "evidence"],
    complexity: "intermediate",
    task: "CONTROL_ASSESSMENT",
    expectedSteps: [
      "Go to Assessment module",
      "Select the framework and control",
      "Review existing evidence",
      "Rate implementation status",
      "Add assessment notes"
    ],
    expectedGuidance: [
      "Go to Assessment module",
      "Select the framework and control",
      "Review existing evidence",
      "Rate implementation status",
      "Add assessment notes"
    ],
    expectedScreens: ["Assessment module", "control assessment"],
    expectedButtons: ["Assess", "Save Assessment"],
    mustMention: ["assessment", "implementation status", "evidence"],
    scoringCriteria: {
      mentionsCorrectScreen: 30,
      mentionsReviewEvidence: 20,
      mentionsRatingOptions: 30,
      mentionsNotes: 20
    }
  },

  // Framework Mapping Workflow
  {
    id: "ARION_WORKFLOW_MAPPING_1",
    category: "workflow_understanding",
    vendor: "ArionComply",
    question: "How do I map controls between ISO 27001 and SOC 2?",
    expectedTopics: ["mapping", "ISO 27001", "SOC 2", "controls", "framework"],
    complexity: "intermediate",
    standard: "ISO_27001",
    task: "FRAMEWORK_MAPPING",
    expectedSteps: [
      "Navigate to Framework Mapping module",
      "Select source framework (ISO 27001)",
      "Select target framework (SOC 2)",
      "View suggested mappings",
      "Review and approve mappings"
    ],
    expectedGuidance: [
      "Navigate to Framework Mapping module",
      "Select source and target frameworks",
      "View AI-powered suggested mappings",
      "Review and approve mappings",
      "Link evidence across mapped controls"
    ],
    expectedScreens: ["Framework Mapping"],
    expectedFeatures: ["AI-powered mapping", "suggested mappings", "manual override"],
    mustMention: ["mapping", "framework", "controls"],
    scoringCriteria: {
      mentionsCorrectScreen: 25,
      mentionsMappingFeature: 25,
      mentionsApprovalProcess: 25,
      mentionsAIAssistance: 25
    }
  },

  // Compliance Dashboard Usage
  {
    id: "ARION_WORKFLOW_DASHBOARD_1",
    category: "workflow_understanding",
    vendor: "ArionComply",
    question: "How do I check our overall compliance status?",
    expectedTopics: ["dashboard", "compliance", "status", "score"],
    complexity: "beginner",
    task: "COMPLIANCE_DASHBOARD",
    expectedSteps: [
      "Go to Compliance Dashboard",
      "Select framework filter (optional)",
      "View compliance score",
      "Review control implementation breakdown"
    ],
    expectedGuidance: [
      "Navigate to Compliance Dashboard from main menu",
      "View overall compliance score",
      "Filter by framework if needed",
      "Review control implementation breakdown"
    ],
    expectedScreens: ["Compliance Dashboard", "Dashboard"],
    expectedElements: ["compliance score", "status breakdown", "metrics"],
    mustMention: ["dashboard", "compliance", "score"],
    scoringCriteria: {
      mentionsCorrectScreen: 40,
      mentionsComplianceScore: 30,
      mentionsBreakdown: 30
    }
  },

  // Risk Assessment Workflow
  {
    id: "ARION_WORKFLOW_RISK_1",
    category: "workflow_understanding",
    vendor: "ArionComply",
    question: "How do I add a new security risk?",
    expectedTopics: ["risk", "add", "register", "likelihood", "impact"],
    complexity: "intermediate",
    task: "RISK_ASSESSMENT",
    expectedSteps: [
      "Navigate to Risk Register",
      "Click Add New Risk",
      "Describe the risk scenario",
      "Assess likelihood and impact",
      "Link to affected controls",
      "Define mitigation measures"
    ],
    expectedGuidance: [
      "Navigate to Risk Register",
      "Click Add New Risk",
      "Describe risk scenario and impact",
      "Assess likelihood and impact levels",
      "Link to affected controls",
      "Define mitigation measures"
    ],
    expectedScreens: ["Risk Register", "Risk Management"],
    expectedButtons: ["Add New Risk", "Add Risk"],
    mustMention: ["risk", "likelihood", "impact"],
    scoringCriteria: {
      mentionsCorrectScreen: 25,
      mentionsRiskScenario: 20,
      mentionsLikelihoodImpact: 30,
      mentionsMitigation: 25
    }
  },

  // Data Subject Request Workflow
  {
    id: "ARION_WORKFLOW_DSR_1",
    category: "workflow_understanding",
    vendor: "ArionComply",
    question: "A customer requested all their data under GDPR, what's the process?",
    expectedTopics: ["data subject request", "GDPR", "access request", "30 days", "process"],
    complexity: "advanced",
    standard: "GDPR",
    task: "DATA_SUBJECT_REQUEST",
    expectedSteps: [
      "Go to Privacy Operations > Data Subject Requests",
      "Create new request",
      "Verify requester identity",
      "Search connected systems for data",
      "Compile data (30-day deadline)",
      "Respond to data subject"
    ],
    expectedGuidance: [
      "Navigate to Privacy Operations",
      "Create new data subject request",
      "Verify requester identity",
      "Search systems for personal data",
      "Compile data within 30-day deadline",
      "Respond to requester"
    ],
    expectedScreens: ["Privacy Operations", "Data Subject Requests"],
    expectedDeadlines: ["30 days", "30-day"],
    mustMention: ["verify identity", "search", "respond"],
    scoringCriteria: {
      mentionsCorrectScreen: 25,
      mentionsIdentityVerification: 25,
      mentions30DayDeadline: 25,
      mentionsDataCompilation: 25
    }
  },

  // Audit Preparation Workflow
  {
    id: "ARION_WORKFLOW_AUDIT_1",
    category: "workflow_understanding",
    vendor: "ArionComply",
    question: "Our ISO 27001 audit is next month, how do I prepare?",
    expectedTopics: ["audit", "preparation", "readiness", "evidence", "ISO 27001"],
    complexity: "advanced",
    standard: "ISO_27001",
    task: "AUDIT_PREPARATION",
    expectedSteps: [
      "Run Audit Readiness Report",
      "Review control implementation status",
      "Verify all evidence is uploaded",
      "Complete outstanding remediation tasks",
      "Generate evidence package",
      "Review and update policies"
    ],
    expectedGuidance: [
      "Run Audit Readiness Report",
      "Review control implementation status",
      "Verify all evidence uploaded",
      "Complete remediation tasks",
      "Generate evidence package",
      "Update policies if needed"
    ],
    expectedScreens: ["Audit Preparation", "Audit Readiness"],
    expectedReports: ["Audit Readiness Report", "evidence package"],
    mustMention: ["readiness", "evidence", "controls"],
    scoringCriteria: {
      mentionsReadinessReport: 30,
      mentionsEvidenceVerification: 30,
      mentionsEvidencePackage: 20,
      mentionsPolicyReview: 20
    }
  },

  // Policy Management Workflow
  {
    id: "ARION_WORKFLOW_POLICY_1",
    category: "workflow_understanding",
    vendor: "ArionComply",
    question: "How do I create a new information security policy?",
    expectedTopics: ["policy", "create", "template", "approval", "controls"],
    complexity: "intermediate",
    task: "POLICY_MANAGEMENT",
    expectedSteps: [
      "Go to Policy Management module",
      "Choose Create from Template or Create New",
      "Select relevant framework requirements",
      "Draft policy content",
      "Link to relevant controls",
      "Submit for approval"
    ],
    expectedGuidance: [
      "Navigate to Policy Management",
      "Create from template or create new",
      "Select framework requirements",
      "Draft policy content",
      "Link to controls",
      "Submit for approval workflow"
    ],
    expectedScreens: ["Policy Management"],
    expectedFeatures: ["templates", "AI assistant", "approval workflow"],
    mustMention: ["policy", "template", "approval"],
    scoringCriteria: {
      mentionsCorrectScreen: 25,
      mentionsTemplates: 25,
      mentionsApprovalWorkflow: 25,
      mentionsControlLinking: 25
    }
  },

  // Vendor Assessment Workflow
  {
    id: "ARION_WORKFLOW_VENDOR_1",
    category: "workflow_understanding",
    vendor: "ArionComply",
    question: "We're using AWS, how do I assess their compliance?",
    expectedTopics: ["vendor", "AWS", "assessment", "questionnaire", "certifications"],
    complexity: "intermediate",
    task: "VENDOR_RISK_ASSESSMENT",
    expectedSteps: [
      "Navigate to Vendor Risk Management",
      "Add or select vendor (AWS)",
      "Send security questionnaire",
      "Request vendor certifications",
      "Assess risk level",
      "Approve or reject vendor"
    ],
    expectedGuidance: [
      "Navigate to Vendor Risk Management",
      "Add or select AWS as vendor",
      "Send security questionnaire",
      "Request compliance certifications",
      "Assess risk level based on responses",
      "Approve or reject vendor"
    ],
    expectedScreens: ["Vendor Risk Management", "Third Party Risk"],
    expectedActions: ["questionnaire", "certifications", "risk assessment"],
    mustMention: ["vendor", "questionnaire", "certifications"],
    scoringCriteria: {
      mentionsCorrectScreen: 25,
      mentionsQuestionnaire: 30,
      mentionsCertifications: 25,
      mentionsRiskAssessment: 20
    }
  },

  // AI System Registration Workflow
  {
    id: "ARION_WORKFLOW_AI_1",
    category: "workflow_understanding",
    vendor: "ArionComply",
    question: "We deployed a new AI model, how do I register it for EU AI Act?",
    expectedTopics: ["AI system", "register", "EU AI Act", "risk classification"],
    complexity: "advanced",
    standard: "EU_AI_ACT",
    task: "AI_SYSTEM_REGISTRATION",
    expectedSteps: [
      "Go to AI Governance > AI Systems Register",
      "Click Register New AI System",
      "Complete AI system questionnaire",
      "System classifies risk level automatically",
      "If high-risk: complete technical documentation",
      "Submit for review"
    ],
    expectedGuidance: [
      "Navigate to AI Governance module",
      "Register new AI system",
      "Complete questionnaire",
      "Review automatic risk classification",
      "Complete additional requirements if high-risk",
      "Submit for compliance review"
    ],
    expectedScreens: ["AI Governance", "AI Systems Register"],
    expectedFeatures: ["automatic risk classification", "questionnaire"],
    mustMention: ["AI system", "register", "risk classification"],
    scoringCriteria: {
      mentionsCorrectScreen: 30,
      mentionsQuestionnaire: 25,
      mentionsRiskClassification: 25,
      mentionsHighRiskRequirements: 20
    }
  }
];

export const INTENT_CLASSIFICATION_CATEGORIES = {
  evidence_management: ["EVIDENCE_UPLOAD", "EVIDENCE_REVIEW"],
  assessment: ["CONTROL_ASSESSMENT", "GAP_ASSESSMENT"],
  framework_management: ["FRAMEWORK_MAPPING", "FRAMEWORK_SELECTION"],
  reporting: ["COMPLIANCE_DASHBOARD", "GENERATE_REPORT"],
  risk_management: ["RISK_ASSESSMENT", "RISK_MITIGATION"],
  policy_management: ["POLICY_MANAGEMENT", "POLICY_REVIEW"],
  audit: ["AUDIT_PREPARATION", "AUDIT_RESPONSE"],
  privacy_operations: ["DATA_SUBJECT_REQUEST", "PRIVACY_ASSESSMENT"],
  third_party_risk: ["VENDOR_RISK_ASSESSMENT", "VENDOR_MONITORING"],
  ai_governance: ["AI_SYSTEM_REGISTRATION", "AI_RISK_ASSESSMENT"]
};

export function getIntentTests() {
  return INTENT_CLASSIFICATION_TESTS;
}

export function getWorkflowTests() {
  return WORKFLOW_UNDERSTANDING_TESTS;
}

export function getTestsByIntent(intent) {
  return INTENT_CLASSIFICATION_TESTS.filter(t => t.expectedIntent === intent);
}

export function getAmbiguousIntents() {
  return INTENT_CLASSIFICATION_TESTS.filter(t => t.expectedIntent === "AMBIGUOUS" || t.confidence === "low");
}
