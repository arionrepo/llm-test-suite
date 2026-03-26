// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/arioncomply-workflows/ui-tasks.js
// Description: ArionComply application-specific workflow prompts - UI tasks, user guidance, feature usage
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23
// Last Updated: 2026-03-26 - Updated to PROMPT-SCHEMA v2.2.0

// Note: Each task now has separate test objects for different context levels
// This follows schema v2.2.0 with platformFeature taxonomy

export const ARIONCOMPLY_UI_TASKS = [
  // Evidence Management - Complete Context
  {
    id: "ARION_UI_EVIDENCE_UPLOAD_COMPLETE_1",
    category: "platform_feature_test",
    vendor: "ArionComply",
    question: "How do I upload evidence for ISO 27001 control A.8.2 in ArionComply?",
    expectedTopics: ["navigate", "control", "evidence", "upload", "ISO 27001"],
    complexity: "beginner",
    // Platform Feature Taxonomy (Taxonomy C)
    platformFeature: "evidence_management",
    featureAction: "upload",
    userContext: "first_time",
    // UI-specific fields (schema extension)
    standard: "ISO_27001",
    contextLevel: "complete_context",
    expectedGuidance: [
      "Navigate to Frameworks > ISO 27001 > Control A.8.2",
      "Click the Add Evidence button",
      "Select evidence type (file upload or URL)",
      "Upload your file or provide link",
      "Add description and tags",
      "Save to link evidence to control"
    ],
    expectedScreens: ["Frameworks", "Control Detail", "Evidence Upload"],
    expectedButtons: ["Add Evidence", "Upload", "Save"]
  },
  {
    id: "ARION_UI_EVIDENCE_UPLOAD_MISSING_STANDARD_1",
    category: "platform_feature_test",
    vendor: "ArionComply",
    question: "How do I upload evidence for a control?",
    expectedTopics: ["upload", "evidence", "control", "clarification"],
    complexity: "beginner",
    platformFeature: "evidence_management",
    featureAction: "upload",
    userContext: "first_time",
    contextLevel: "missing_standard",
    expectedClarifications: [
      "Which compliance standard are you working with?",
      "Which specific control do you need to provide evidence for?"
    ],
    expectedGuidance: [
      "Navigate to the control detail page",
      "Click Add Evidence button",
      "Upload file or provide link"
    ]
  },
  {
    id: "ARION_UI_EVIDENCE_UPLOAD_MINIMAL_1",
    category: "platform_feature_test",
    vendor: "ArionComply",
    question: "How do I upload evidence?",
    expectedTopics: ["upload", "evidence", "clarification"],
    complexity: "beginner",
    platformFeature: "evidence_management",
    featureAction: "upload",
    userContext: "first_time",
    contextLevel: "minimal_context",
    expectedClarifications: [
      "Which compliance standard are you working with?",
      "Which specific control do you need to provide evidence for?",
      "What type of evidence do you have?"
    ]
  },

  // Control Assessment
  {
    id: "ARION_UI_CONTROL_ASSESSMENT_COMPLETE_1",
    category: "platform_feature_test",
    vendor: "ArionComply",
    question: "How do I assess the implementation status of SOC 2 CC6.1 in ArionComply?",
    expectedTopics: ["assess", "control", "implementation", "status", "SOC 2"],
    complexity: "intermediate",
    platformFeature: "assessment_workflows",
    featureAction: "update",
    userContext: "power_user",
    standard: "SOC_2",
    contextLevel: "complete_context",
    expectedGuidance: [
      "Go to Assessments module from main navigation",
      "Select SOC 2 framework",
      "Find control CC6.1",
      "Review existing evidence",
      "Rate implementation status (Not Implemented / Partially / Fully)",
      "Add assessment notes",
      "Save assessment"
    ],
    expectedScreens: ["Assessments", "SOC 2", "Control Detail"],
    expectedButtons: ["Assess", "Save Assessment"]
  },
  {
    id: "ARION_UI_CONTROL_ASSESSMENT_GENERIC_1",
    category: "platform_feature_test",
    vendor: "ArionComply",
    question: "How do I assess a control?",
    expectedTopics: ["assess", "control", "clarification"],
    complexity: "beginner",
    platformFeature: "assessment_workflows",
    featureAction: "update",
    userContext: "first_time",
    contextLevel: "minimal_context",
    expectedClarifications: [
      "Which framework are you assessing against?",
      "Which control are you assessing?",
      "Do you have evidence already uploaded?"
    ]
  },

  // Framework Mapping
  {
    id: "ARION_UI_FRAMEWORK_MAPPING_COMPLETE_1",
    category: "platform_feature_test",
    vendor: "ArionComply",
    question: "How do I map ISO 27001 A.8.2 to SOC 2 CC6.1 in ArionComply?",
    expectedTopics: ["map", "ISO 27001", "SOC 2", "controls", "mapping"],
    complexity: "intermediate",
    platformFeature: "framework_mapping",
    featureAction: "configure",
    userContext: "power_user",
    standard: "ISO_27001",
    contextLevel: "complete_context",
    expectedGuidance: [
      "Navigate to Framework Mapping module",
      "Select source framework (ISO 27001)",
      "Select target framework (SOC 2)",
      "Select control A.8.2 from source",
      "View AI-suggested mappings to SOC 2 controls",
      "Review mapping to CC6.1",
      "Approve or customize mapping",
      "Link shared evidence if applicable"
    ],
    expectedScreens: ["Framework Mapping"],
    expectedFeatures: ["AI-powered mapping suggestions"]
  },
  {
    id: "ARION_UI_FRAMEWORK_MAPPING_GENERIC_1",
    category: "platform_feature_test",
    vendor: "ArionComply",
    question: "How do I map controls between different frameworks?",
    expectedTopics: ["map", "controls", "frameworks", "mapping"],
    complexity: "intermediate",
    platformFeature: "framework_mapping",
    featureAction: "configure",
    userContext: "first_time",
    contextLevel: "missing_details",
    expectedClarifications: [
      "Which source framework are you mapping from?",
      "Which target framework are you mapping to?"
    ],
    expectedGuidance: [
      "Navigate to Framework Mapping module",
      "Select source and target frameworks",
      "View suggested mappings",
      "Review and approve"
    ]
  },

  // Compliance Dashboard
  {
    id: "ARION_UI_DASHBOARD_COMPLETE_1",
    category: "platform_feature_test",
    vendor: "ArionComply",
    question: "Show me our current GDPR compliance status in ArionComply",
    expectedTopics: ["dashboard", "compliance", "status", "GDPR"],
    complexity: "beginner",
    platformFeature: "compliance_dashboard",
    featureAction: "view",
    userContext: "power_user",
    standard: "GDPR",
    contextLevel: "complete_context",
    expectedGuidance: [
      "Navigate to Dashboard from main menu",
      "View overall compliance score",
      "Filter by GDPR framework",
      "Review control implementation breakdown",
      "Check gap summary"
    ],
    expectedScreens: ["Dashboard", "Compliance Overview"],
    expectedElements: ["compliance score", "framework filter", "gap summary"]
  },
  {
    id: "ARION_UI_DASHBOARD_GENERIC_1",
    category: "platform_feature_test",
    vendor: "ArionComply",
    question: "Where do I see our compliance status?",
    expectedTopics: ["compliance", "status", "dashboard"],
    complexity: "beginner",
    platformFeature: "compliance_dashboard",
    featureAction: "view",
    userContext: "first_time",
    contextLevel: "minimal_context",
    expectedGuidance: [
      "Go to Dashboard from left sidebar",
      "View overall compliance score",
      "Select framework to see details"
    ]
  },

  // Report Generation
  {
    id: "ARION_UI_REPORT_GENERATION_COMPLETE_1",
    category: "platform_feature_test",
    vendor: "ArionComply",
    question: "How do I generate an executive summary report for our ISO 27001 compliance?",
    expectedTopics: ["report", "executive summary", "ISO 27001", "generate"],
    complexity: "intermediate",
    platformFeature: "report_generation",
    featureAction: "generate",
    userContext: "power_user",
    standard: "ISO_27001",
    contextLevel: "complete_context",
    expectedGuidance: [
      "Navigate to Reports section",
      "Select Executive Summary template",
      "Choose ISO 27001 framework",
      "Select date range",
      "Customize report sections (optional)",
      "Generate report",
      "Export as PDF or Excel"
    ],
    expectedScreens: ["Reports", "Executive Summary"],
    expectedButtons: ["Generate Report", "Export"]
  },
  {
    id: "ARION_UI_REPORT_GENERATION_GENERIC_1",
    category: "platform_feature_test",
    vendor: "ArionComply",
    question: "How do I create a compliance report?",
    expectedTopics: ["report", "compliance", "create"],
    complexity: "beginner",
    platformFeature: "report_generation",
    featureAction: "generate",
    userContext: "first_time",
    contextLevel: "minimal_context",
    expectedClarifications: [
      "What type of report do you need?",
      "Which framework(s) should be included?"
    ],
    expectedGuidance: [
      "Navigate to Reports section",
      "Select report template",
      "Choose framework(s)",
      "Generate and export"
    ]
  },

  // Risk Register Management
  {
    id: "ARION_UI_RISK_MANAGEMENT_COMPLETE_1",
    category: "platform_feature_test",
    vendor: "ArionComply",
    question: "How do I add a new cybersecurity risk to the risk register in ArionComply?",
    expectedTopics: ["risk", "add", "register", "cybersecurity"],
    complexity: "intermediate",
    platformFeature: "risk_management",
    featureAction: "create",
    userContext: "power_user",
    contextLevel: "complete_context",
    expectedGuidance: [
      "Navigate to Risk Management > Risk Register",
      "Click Add New Risk",
      "Describe risk scenario",
      "Assess likelihood (Low/Medium/High)",
      "Assess impact (Low/Medium/High)",
      "Link to affected controls",
      "Define mitigation measures",
      "Assign risk owner",
      "Save risk"
    ],
    expectedScreens: ["Risk Management", "Risk Register"],
    expectedButtons: ["Add New Risk", "Save"]
  }
];

export function getAllArionComplyPrompts() {
  return ARIONCOMPLY_UI_TASKS;
}

export function getPromptsByFeature(feature) {
  return ARIONCOMPLY_UI_TASKS.filter(t => t.platformFeature === feature);
}

export function getPromptsByAction(action) {
  return ARIONCOMPLY_UI_TASKS.filter(t => t.featureAction === action);
}

export function getPromptsByContextLevel(level) {
  return ARIONCOMPLY_UI_TASKS.filter(t => t.contextLevel === level);
}
