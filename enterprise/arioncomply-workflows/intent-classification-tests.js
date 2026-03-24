// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/arioncomply-workflows/intent-classification-tests.js
// Description: Intent classification accuracy tests for ArionComply - test if model can correctly identify user intent from queries
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

export const INTENT_CLASSIFICATION_TESTS = [
  // Evidence Management Intents
  {
    userQuery: "I need to upload a document for one of our security controls",
    expectedIntent: "EVIDENCE_UPLOAD",
    intentCategory: "evidence_management",
    confidence: "high",
    contextClues: ["upload", "document", "security controls"]
  },
  {
    userQuery: "How do I attach proof that we have encryption in place?",
    expectedIntent: "EVIDENCE_UPLOAD",
    intentCategory: "evidence_management",
    confidence: "high",
    contextClues: ["attach", "proof", "encryption"]
  },
  {
    userQuery: "Where do I add files?",
    expectedIntent: "EVIDENCE_UPLOAD",
    intentCategory: "evidence_management",
    confidence: "low",
    ambiguity: "Could be evidence, policy, or general file upload"
  },
  
  // Assessment Intents
  {
    userQuery: "I need to mark this control as implemented",
    expectedIntent: "CONTROL_ASSESSMENT",
    intentCategory: "assessment",
    confidence: "high",
    contextClues: ["mark", "control", "implemented"]
  },
  {
    userQuery: "How do I evaluate if our access control is working?",
    expectedIntent: "CONTROL_ASSESSMENT",
    intentCategory: "assessment",
    confidence: "high",
    contextClues: ["evaluate", "control", "working"]
  },
  {
    userQuery: "We finished implementing MFA, where do I update the status?",
    expectedIntent: "CONTROL_ASSESSMENT",
    intentCategory: "assessment",
    confidence: "high",
    contextClues: ["finished implementing", "update status"]
  },
  
  // Framework Mapping Intents
  {
    userQuery: "Which ISO 27001 controls satisfy SOC 2 requirements?",
    expectedIntent: "FRAMEWORK_MAPPING",
    intentCategory: "framework_management",
    confidence: "high",
    contextClues: ["ISO 27001", "SOC 2", "satisfy"]
  },
  {
    userQuery: "Can you show me how our controls map across different standards?",
    expectedIntent: "FRAMEWORK_MAPPING",
    intentCategory: "framework_management",
    confidence: "high",
    contextClues: ["controls", "map", "different standards"]
  },
  
  // Dashboard/Reporting Intents
  {
    userQuery: "What's our overall compliance score?",
    expectedIntent: "COMPLIANCE_DASHBOARD",
    intentCategory: "reporting",
    confidence: "high",
    contextClues: ["overall", "compliance score"]
  },
  {
    userQuery: "Show me where we stand with GDPR",
    expectedIntent: "COMPLIANCE_DASHBOARD",
    intentCategory: "reporting",
    confidence: "high",
    contextClues: ["where we stand", "GDPR"]
  },
  {
    userQuery: "I need a report for the board meeting",
    expectedIntent: "COMPLIANCE_DASHBOARD",
    intentCategory: "reporting",
    confidence: "medium",
    ambiguity: "Could be dashboard, custom report, or audit report"
  },
  
  // Risk Management Intents
  {
    userQuery: "How do I add a new security risk to the system?",
    expectedIntent: "RISK_ASSESSMENT",
    intentCategory: "risk_management",
    confidence: "high",
    contextClues: ["add", "security risk"]
  },
  {
    userQuery: "We identified a data breach risk, where do I document it?",
    expectedIntent: "RISK_ASSESSMENT",
    intentCategory: "risk_management",
    confidence: "high",
    contextClues: ["identified", "risk", "document"]
  },
  
  // Policy Management Intents
  {
    userQuery: "I need to create a new data retention policy",
    expectedIntent: "POLICY_MANAGEMENT",
    intentCategory: "policy_management",
    confidence: "high",
    contextClues: ["create", "policy"]
  },
  {
    userQuery: "Where are the policy templates?",
    expectedIntent: "POLICY_MANAGEMENT",
    intentCategory: "policy_management",
    confidence: "high",
    contextClues: ["policy templates"]
  },
  {
    userQuery: "Our access control policy needs updating",
    expectedIntent: "POLICY_MANAGEMENT",
    intentCategory: "policy_management",
    confidence: "high",
    contextClues: ["policy", "needs updating"]
  },
  
  // Audit Preparation Intents
  {
    userQuery: "Our ISO 27001 audit is in 2 weeks, what do we need to prepare?",
    expectedIntent: "AUDIT_PREPARATION",
    intentCategory: "audit",
    confidence: "high",
    contextClues: ["audit", "prepare"]
  },
  {
    userQuery: "How do I generate an evidence package for our auditor?",
    expectedIntent: "AUDIT_PREPARATION",
    intentCategory: "audit",
    confidence: "high",
    contextClues: ["evidence package", "auditor"]
  },
  {
    userQuery: "What's missing for our SOC 2 readiness?",
    expectedIntent: "AUDIT_PREPARATION",
    intentCategory: "audit",
    confidence: "high",
    contextClues: ["missing", "readiness"]
  },
  
  // Data Subject Request Intents
  {
    userQuery: "A customer asked for all their data, what do I do?",
    expectedIntent: "DATA_SUBJECT_REQUEST",
    intentCategory: "privacy_operations",
    confidence: "high",
    contextClues: ["customer", "all their data"]
  },
  {
    userQuery: "Someone wants us to delete their account and information",
    expectedIntent: "DATA_SUBJECT_REQUEST",
    intentCategory: "privacy_operations",
    confidence: "high",
    contextClues: ["delete", "account", "information"]
  },
  {
    userQuery: "GDPR access request came in, how to handle?",
    expectedIntent: "DATA_SUBJECT_REQUEST",
    intentCategory: "privacy_operations",
    confidence: "high",
    contextClues: ["GDPR", "access request", "handle"]
  },
  
  // Vendor Risk Intents
  {
    userQuery: "We're evaluating a new cloud provider, how do we assess them?",
    expectedIntent: "VENDOR_RISK_ASSESSMENT",
    intentCategory: "third_party_risk",
    confidence: "high",
    contextClues: ["evaluating", "cloud provider", "assess"]
  },
  {
    userQuery: "Where do I send a security questionnaire to our vendors?",
    expectedIntent: "VENDOR_RISK_ASSESSMENT",
    intentCategory: "third_party_risk",
    confidence: "high",
    contextClues: ["security questionnaire", "vendors"]
  },
  
  // AI Governance Intents
  {
    userQuery: "We built a chatbot, do we need to register it?",
    expectedIntent: "AI_SYSTEM_REGISTRATION",
    intentCategory: "ai_governance",
    confidence: "high",
    contextClues: ["chatbot", "register"]
  },
  {
    userQuery: "How do I check if our AI system is high-risk under EU AI Act?",
    expectedIntent: "AI_SYSTEM_REGISTRATION",
    intentCategory: "ai_governance",
    confidence: "high",
    contextClues: ["AI system", "high-risk", "EU AI Act"]
  },
  
  // Ambiguous Queries (Multi-Intent)
  {
    userQuery: "I need help with compliance",
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
    userQuery: "How do I add something?",
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
    userQuery: "Where is the upload button?",
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
    userQuery: "What do I do next?",
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
    task: "EVIDENCE_UPLOAD",
    userQuery: "How do I upload evidence for a control?",
    expectedSteps: [
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
    task: "CONTROL_ASSESSMENT",
    userQuery: "How do I assess the implementation status of a control?",
    expectedSteps: [
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
    task: "FRAMEWORK_MAPPING",
    userQuery: "How do I map controls between ISO 27001 and SOC 2?",
    expectedSteps: [
      "Navigate to Framework Mapping module",
      "Select source framework (ISO 27001)",
      "Select target framework (SOC 2)",
      "View suggested mappings",
      "Review and approve mappings"
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
    task: "COMPLIANCE_DASHBOARD",
    userQuery: "How do I check our overall compliance status?",
    expectedSteps: [
      "Go to Compliance Dashboard",
      "Select framework filter (optional)",
      "View compliance score",
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
    task: "RISK_ASSESSMENT",
    userQuery: "How do I add a new security risk?",
    expectedSteps: [
      "Navigate to Risk Register",
      "Click Add New Risk",
      "Describe the risk scenario",
      "Assess likelihood and impact",
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
    task: "DATA_SUBJECT_REQUEST",
    userQuery: "A customer requested all their data under GDPR, what's the process?",
    expectedSteps: [
      "Go to Privacy Operations > Data Subject Requests",
      "Create new request",
      "Verify requester identity",
      "Search connected systems for data",
      "Compile data (30-day deadline)",
      "Respond to data subject"
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
    task: "AUDIT_PREPARATION",
    userQuery: "Our ISO 27001 audit is next month, how do I prepare?",
    expectedSteps: [
      "Run Audit Readiness Report",
      "Review control implementation status",
      "Verify all evidence is uploaded",
      "Complete outstanding remediation tasks",
      "Generate evidence package",
      "Review and update policies"
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
    task: "POLICY_MANAGEMENT",
    userQuery: "How do I create a new information security policy?",
    expectedSteps: [
      "Go to Policy Management module",
      "Choose Create from Template or Create New",
      "Select relevant framework requirements",
      "Draft policy content",
      "Link to relevant controls",
      "Submit for approval"
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
    task: "VENDOR_RISK_ASSESSMENT",
    userQuery: "We're using AWS, how do I assess their compliance?",
    expectedSteps: [
      "Navigate to Vendor Risk Management",
      "Add or select vendor (AWS)",
      "Send security questionnaire",
      "Request vendor certifications",
      "Assess risk level",
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
    task: "AI_SYSTEM_REGISTRATION",
    userQuery: "We deployed a new AI model, how do I register it for EU AI Act?",
    expectedSteps: [
      "Go to AI Governance > AI Systems Register",
      "Click Register New AI System",
      "Complete AI system questionnaire",
      "System classifies risk level automatically",
      "If high-risk: complete technical documentation",
      "Submit for review"
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
