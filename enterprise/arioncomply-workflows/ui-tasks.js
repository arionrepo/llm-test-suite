// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/arioncomply-workflows/ui-tasks.js
// Description: ArionComply application-specific workflow prompts - UI tasks, user guidance, feature usage
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

export const ARIONCOMPLY_UI_TASKS = {
  // Evidence Management
  EVIDENCE_UPLOAD: {
    category: 'evidence_management',
    task: 'Upload evidence for a control',
    userContext: {
      userType: 'PRACTITIONER',
      currentScreen: 'control_detail',
      hasControl: true
    },
    prompts: {
      complete_context: 'How do I upload evidence for ISO 27001 control A.8.2 in ArionComply?',
      missing_standard: 'How do I upload evidence for a control?',
      missing_control: 'How do I upload evidence for ISO 27001?',
      minimal_context: 'How do I upload evidence?'
    },
    expectedClarifications: [
      'Which compliance standard are you working with?',
      'Which specific control do you need to provide evidence for?',
      'What type of evidence do you have? (document, screenshot, policy, etc.)'
    ],
    expectedGuidance: [
      'Navigate to the control detail page',
      'Click the "Add Evidence" button',
      'Select evidence type',
      'Upload file or provide link',
      'Add description and tags'
    ]
  },

  CONTROL_ASSESSMENT: {
    category: 'assessment',
    task: 'Assess control implementation status',
    userContext: {
      userType: 'AUDITOR',
      currentScreen: 'assessment_dashboard',
      hasControl: true
    },
    prompts: {
      complete_context: 'How do I assess the implementation status of SOC 2 CC6.1 in ArionComply?',
      missing_details: 'How do I assess a control?',
      first_time_user: 'I need to evaluate if our security controls are working. Where do I start?'
    },
    expectedClarifications: [
      'Which framework are you assessing against?',
      'Are you conducting a self-assessment or external audit?',
      'Do you have evidence already uploaded for this control?'
    ],
    expectedGuidance: [
      'Go to Assessment module',
      'Select the framework and control',
      'Review existing evidence',
      'Rate implementation status (Not Implemented / Partially / Fully)',
      'Add assessment notes',
      'Assign remediation tasks if needed'
    ]
  },

  FRAMEWORK_MAPPING: {
    category: 'framework_management',
    task: 'Map controls between frameworks',
    userContext: {
      userType: 'MANAGER',
      currentScreen: 'frameworks',
      hasMultipleFrameworks: true
    },
    prompts: {
      complete_context: 'How do I map ISO 27001 A.8.2 to SOC 2 CC6.1 in ArionComply?',
      general: 'How do I map controls between different frameworks?',
      exploratory: 'Can ArionComply show me which ISO controls satisfy SOC 2 requirements?'
    },
    expectedClarifications: [
      'Which source framework are you mapping from?',
      'Which target framework are you mapping to?',
      'Are you looking for automatic mapping suggestions or manual mapping?'
    ],
    expectedGuidance: [
      'Navigate to Framework Mapping module',
      'Select source and target frameworks',
      'View suggested mappings (AI-powered)',
      'Review and approve mappings',
      'Link evidence across mapped controls'
    ]
  },

  COMPLIANCE_DASHBOARD: {
    category: 'reporting',
    task: 'View overall compliance status',
    userContext: {
      userType: 'EXECUTIVE',
      currentScreen: 'dashboard',
      needsOverview: true
    },
    prompts: {
      complete_context: 'Show me our current GDPR compliance status in ArionComply',
      executive_summary: 'What is our overall compliance posture?',
      specific_concern: 'Are we ready for our SOC 2 audit next month?'
    },
    expectedClarifications: [
      'Which frameworks are you most concerned about?',
      'Do you need a summary or detailed breakdown?',
      'Are you preparing for a specific audit or certification?'
    ],
    expectedGuidance: [
      'Go to Compliance Dashboard',
      'Select framework filter',
      'View compliance score and status',
      'Review control implementation breakdown',
      'Check outstanding remediation tasks',
      'Generate executive summary report'
    ]
  },

  RISK_ASSESSMENT: {
    category: 'risk_management',
    task: 'Conduct risk assessment',
    userContext: {
      userType: 'PRACTITIONER',
      currentScreen: 'risk_register',
      needsGuidance: true
    },
    prompts: {
      complete_context: 'How do I create a risk assessment for data breach in ArionComply?',
      missing_risk_type: 'How do I add a new risk?',
      need_methodology: 'What risk assessment methodology does ArionComply use?'
    },
    expectedClarifications: [
      'What type of risk are you assessing? (security, privacy, operational, etc.)',
      'Is this related to a specific compliance requirement?',
      'Do you need to assess inherent risk, residual risk, or both?'
    ],
    expectedGuidance: [
      'Navigate to Risk Register',
      'Click "Add New Risk"',
      'Describe the risk scenario',
      'Assess likelihood and impact',
      'Link to affected controls and assets',
      'Define mitigation measures',
      'Assign risk owner'
    ]
  },

  POLICY_MANAGEMENT: {
    category: 'policy_management',
    task: 'Create or update policy',
    userContext: {
      userType: 'MANAGER',
      currentScreen: 'policies',
      hasTemplate: false
    },
    prompts: {
      complete_context: 'How do I create a data retention policy that meets GDPR requirements in ArionComply?',
      template_needed: 'Where can I find a template for an information security policy?',
      update_existing: 'How do I update our existing access control policy?'
    },
    expectedClarifications: [
      'Which compliance frameworks does this policy need to address?',
      'Do you want to start from a template or create from scratch?',
      'Who are the policy approvers in your organization?'
    ],
    expectedGuidance: [
      'Go to Policy Management module',
      'Choose "Create from Template" or "Create New"',
      'Select relevant framework requirements',
      'Draft policy content (AI assistant available)',
      'Link to relevant controls',
      'Submit for approval workflow',
      'Publish and distribute'
    ]
  },

  AUDIT_PREPARATION: {
    category: 'audit',
    task: 'Prepare for external audit',
    userContext: {
      userType: 'MANAGER',
      currentScreen: 'audit_prep',
      auditDate: 'upcoming'
    },
    prompts: {
      complete_context: 'How do I prepare for our upcoming ISO 27001 certification audit in ArionComply?',
      general: 'What do I need to do to get ready for an audit?',
      checklist: 'Can you give me an audit readiness checklist?'
    },
    expectedClarifications: [
      'Which certification or framework are you being audited against?',
      'When is the audit scheduled?',
      'Is this your first audit or a surveillance audit?',
      'Do you have evidence collected for all required controls?'
    ],
    expectedGuidance: [
      'Run Audit Readiness Report',
      'Review control implementation status (target: 100%)',
      'Verify all evidence is uploaded and current',
      'Complete any outstanding remediation tasks',
      'Generate evidence package for auditor',
      'Review and update all policies',
      'Schedule evidence review sessions',
      'Prepare statement of applicability (if applicable)'
    ]
  },

  DATA_SUBJECT_REQUEST: {
    category: 'privacy_operations',
    task: 'Handle GDPR data subject request',
    userContext: {
      userType: 'PRACTITIONER',
      currentScreen: 'dsr_inbox',
      requestType: 'access'
    },
    prompts: {
      complete_context: 'How do I process a GDPR right to access request in ArionComply?',
      different_right: 'How do I handle a right to erasure request?',
      general: 'How does the data subject request workflow work?'
    },
    expectedClarifications: [
      'Which type of data subject request is this? (access, erasure, portability, etc.)',
      'Have you verified the identity of the data subject?',
      'Which systems contain this person\'s data?'
    ],
    expectedGuidance: [
      'Go to Privacy Operations > Data Subject Requests',
      'Create new request or select existing',
      'Verify requester identity',
      'Search connected systems for data',
      'Review and compile data (30-day deadline)',
      'Redact third-party information if needed',
      'Respond to data subject',
      'Document request handling for compliance'
    ]
  },

  VENDOR_RISK_ASSESSMENT: {
    category: 'third_party_risk',
    task: 'Assess vendor compliance',
    userContext: {
      userType: 'PRACTITIONER',
      currentScreen: 'vendors',
      hasVendor: true
    },
    prompts: {
      complete_context: 'How do I assess our AWS compliance posture in ArionComply?',
      new_vendor: 'How do I onboard and assess a new vendor?',
      questionnaire: 'Where can I send a security questionnaire to a vendor?'
    },
    expectedClarifications: [
      'What type of vendor is this? (cloud provider, SaaS, processor, etc.)',
      'What data do they process or have access to?',
      'Which compliance frameworks must they comply with?'
    ],
    expectedGuidance: [
      'Navigate to Vendor Risk Management',
      'Add or select vendor',
      'Send security questionnaire',
      'Request vendor certifications (SOC 2, ISO 27001, etc.)',
      'Assess risk level based on responses',
      'Review and approve/reject vendor',
      'Monitor ongoing compliance',
      'Schedule periodic re-assessments'
    ]
  },

  AI_SYSTEM_REGISTRATION: {
    category: 'ai_governance',
    task: 'Register AI system for EU AI Act compliance',
    userContext: {
      userType: 'PRACTITIONER',
      currentScreen: 'ai_systems',
      hasAISystem: false
    },
    prompts: {
      complete_context: 'How do I register our customer service chatbot for EU AI Act compliance in ArionComply?',
      classification: 'How do I determine if my AI system is high-risk under EU AI Act?',
      requirements: 'What documentation is required for high-risk AI systems?'
    },
    expectedClarifications: [
      'What is the purpose of this AI system?',
      'Does it affect fundamental rights or safety?',
      'Is it used in hiring, credit scoring, law enforcement, or critical infrastructure?',
      'What type of AI is it? (generative, predictive, classification, etc.)'
    ],
    expectedGuidance: [
      'Go to AI Governance > AI Systems Register',
      'Click "Register New AI System"',
      'Complete AI system questionnaire',
      'System will classify risk level automatically',
      'If high-risk: complete technical documentation requirements',
      'Upload risk management documentation',
      'Document data governance practices',
      'Submit for internal review',
      'Monitor for regulatory updates'
    ]
  }
};

export function getTasksByCategory(category) {
  return Object.entries(ARIONCOMPLY_UI_TASKS)
    .filter(([key, task]) => task.category === category)
    .map(([key, task]) => ({ key, ...task }));
}

export function getTaskPrompts(taskKey, contextLevel = 'complete_context') {
  const task = ARIONCOMPLY_UI_TASKS[taskKey];
  return task ? task.prompts[contextLevel] : null;
}

export function getAllArionComplyPrompts() {
  const allPrompts = [];
  
  for (const [taskKey, task] of Object.entries(ARIONCOMPLY_UI_TASKS)) {
    for (const [contextLevel, prompt] of Object.entries(task.prompts)) {
      allPrompts.push({
        taskKey,
        category: task.category,
        task: task.task,
        contextLevel,
        prompt,
        userType: task.userContext.userType,
        expectedClarifications: task.expectedClarifications,
        expectedGuidance: task.expectedGuidance
      });
    }
  }
  
  return allPrompts;
}
