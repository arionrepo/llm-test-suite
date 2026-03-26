// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/arioncomply-workflows/next-action-tests.js
// Description: Test LLM's ability to suggest logical next actions based on user context and journey stage
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-24
// Last Updated: 2026-03-26 - Updated to PROMPT-SCHEMA v2.2.0

/**
 * Next Action Suggestion Testing
 *
 * Purpose: Test if LLM can guide users through compliance journey logically
 *
 * Scenarios:
 * - User just completed action X → What should they do next?
 * - User has specific goal Y → What's the logical sequence to achieve it?
 * - User is stuck → What are possible next steps?
 */

export const NEXT_ACTION_SCENARIOS = [
  // Compliance Journey: Getting Started
  {
    id: "ARION_NEXTACTION_GETTING_STARTED_1",
    category: "next_action_test",
    vendor: "ArionComply",
    question: "We're a new SaaS company. Where do we start with compliance?",
    expectedTopics: ["framework selection", "gap assessment", "roadmap", "getting started"],
    complexity: "beginner",
    // Next-action specific fields (schema extension)
    scenario: 'New organization, no compliance work done yet',
    userContext: {
      complianceMaturity: 'none',
      frameworksSelected: [],
      completedActivities: []
    },
    expectedNextActions: [
      "Identify which compliance frameworks your customers require (SOC 2, ISO 27001)",
      "Conduct initial gap assessment to understand current state",
      "Create compliance roadmap with priorities and timeline",
      "Assign compliance officer or responsible person"
    ],
    logicalSequence: true,
    actionOrder: 'prioritized',
    scoringCriteria: {
      mentionsFrameworkSelection: 25,
      mentionsGapAssessment: 25,
      suggestsRoadmap: 25,
      suggestsResponsibility: 25
    }
  },

  // Compliance Journey: Framework Selected
  {
    id: "ARION_NEXTACTION_FRAMEWORK_SELECTED_1",
    category: "next_action_test",
    vendor: "ArionComply",
    question: "We decided to pursue ISO 27001. What do we do next?",
    expectedTopics: ["gap assessment", "scoping", "roles", "ISO 27001", "implementation"],
    complexity: "intermediate",
    standard: "ISO_27001",
    scenario: 'Framework selected, starting implementation',
    userContext: {
      complianceMaturity: 'developing',
      frameworksSelected: ['ISO_27001'],
      completedActivities: ['framework_selection']
    },
    expectedNextActions: [
      "Conduct ISO 27001 gap assessment to identify control gaps",
      "Define scope of your ISMS (what systems/processes to include)",
      "Assign roles and responsibilities (ISMS manager, control owners)",
      "Create project timeline for certification",
      "Begin documenting current security controls"
    ],
    logicalSequence: true,
    actionOrder: 'sequential',
    shouldNotSuggest: [
      "Start Stage 2 audit",
      "Implement all controls immediately",
      "Apply for certification"
    ],
    scoringCriteria: {
      mentionsGapAssessment: 30,
      mentionsScoping: 25,
      mentionsRoles: 20,
      appropriateSequencing: 25
    }
  },

  // Compliance Journey: Gap Assessment Complete
  {
    id: "ARION_NEXTACTION_GAP_COMPLETE_1",
    category: "next_action_test",
    vendor: "ArionComply",
    question: "We finished our ISO 27001 gap assessment. We have 38 controls not implemented. What's next?",
    expectedTopics: ["prioritize", "remediation", "implementation", "quick wins", "control owners"],
    complexity: "intermediate",
    standard: "ISO_27001",
    scenario: 'Gap assessment done, ready to implement controls',
    userContext: {
      complianceMaturity: 'developing',
      frameworksSelected: ['ISO_27001'],
      completedActivities: ['framework_selection', 'gap_assessment'],
      gapAssessmentResults: {
        totalControls: 93,
        implemented: 25,
        partiallyImplemented: 30,
        notImplemented: 38
      }
    },
    expectedNextActions: [
      "Prioritize controls based on risk and audit requirements",
      "Create remediation plan with timelines for each control",
      "Start with quick wins (easy to implement, low cost)",
      "Focus on critical controls (encryption, access control, incident response)",
      "Assign control owners for each control",
      "Begin implementation working through priority list"
    ],
    logicalSequence: true,
    actionOrder: 'prioritized',
    shouldMention: ['prioritize', 'remediation', 'quick wins'],
    scoringCriteria: {
      mentionsPrioritization: 30,
      suggestsRemediationPlan: 25,
      mentionsQuickWins: 20,
      mentionsControlOwners: 25
    }
  },

  // Compliance Journey: Controls Implemented
  {
    id: "ARION_NEXTACTION_CONTROLS_IMPLEMENTED_1",
    category: "next_action_test",
    vendor: "ArionComply",
    question: "All our ISO 27001 controls are implemented. Ready for audit?",
    expectedTopics: ["internal audit", "readiness", "documentation", "Stage 1", "Stage 2"],
    complexity: "advanced",
    standard: "ISO_27001",
    scenario: 'Controls implemented, preparing for audit',
    userContext: {
      complianceMaturity: 'advanced',
      frameworksSelected: ['ISO_27001'],
      completedActivities: ['gap_assessment', 'control_implementation', 'evidence_collection'],
      implementationStatus: {
        totalControls: 93,
        fullyImplemented: 88,
        partiallyImplemented: 5,
        notImplemented: 0
      }
    },
    expectedNextActions: [
      "Conduct internal audit to verify controls are working",
      "Review and update all documentation (policies, procedures)",
      "Ensure evidence is complete for all controls",
      "Run audit readiness assessment",
      "Fix any findings from internal audit",
      "Schedule Stage 1 audit (documentation review)",
      "After Stage 1: Schedule Stage 2 audit (implementation verification)"
    ],
    logicalSequence: true,
    actionOrder: 'sequential',
    shouldNotSuggest: [
      "Implement more controls",
      "Do gap assessment"
    ],
    scoringCriteria: {
      mentionsInternalAudit: 30,
      mentionsReadinessCheck: 25,
      mentionsStageAudits: 25,
      correctSequencing: 20
    }
  },

  // Task Continuation: Evidence Upload
  {
    id: "ARION_NEXTACTION_EVIDENCE_UPLOADED_1",
    category: "next_action_test",
    vendor: "ArionComply",
    question: "I uploaded our data classification policy. What should I do next?",
    expectedTopics: ["review", "additional evidence", "status update", "next control"],
    complexity: "beginner",
    standard: "ISO_27001",
    scenario: 'User just uploaded evidence, what next?',
    userContext: {
      lastAction: 'evidence_upload',
      currentControl: 'ISO 27001 A.8.2 (Information Classification)',
      evidenceCount: 1
    },
    expectedNextActions: [
      "Review the evidence to ensure it addresses control requirements",
      "Add more evidence if needed (classification procedures, training records)",
      "Update control implementation status to reflect evidence",
      "Move to next control requiring evidence",
      "If all evidence for this control is complete, mark it as implemented"
    ],
    logicalSequence: true,
    contextAware: true,
    scoringCriteria: {
      suggestsReview: 25,
      suggestsAdditionalEvidence: 25,
      suggestsStatusUpdate: 25,
      suggestsNextControl: 25
    }
  },

  // Task Continuation: Assessment Complete
  {
    id: "ARION_NEXTACTION_ASSESSMENT_COMPLETE_1",
    category: "next_action_test",
    vendor: "ArionComply",
    question: "I marked CC6.1 as partially implemented. What now?",
    expectedTopics: ["remediation", "tasks", "gaps", "document", "next control"],
    complexity: "intermediate",
    standard: "SOC_2",
    scenario: 'User just finished assessing a control',
    userContext: {
      lastAction: 'control_assessment',
      currentControl: 'SOC 2 CC6.1 (Logical Access)',
      assessmentResult: 'partially_implemented'
    },
    expectedNextActions: [
      "Document why it's only partial (what's missing?)",
      "Create remediation tasks for missing elements",
      "Assign owners to remediation tasks",
      "Set target completion dates",
      "Continue assessing other controls",
      "Review overall assessment progress"
    ],
    logicalSequence: true,
    contextAware: true,
    shouldMention: ['remediation', 'tasks', 'missing'],
    scoringCriteria: {
      suggestsDocumentGaps: 30,
      suggestsRemediationTasks: 30,
      suggestsAssignOwners: 20,
      suggestsContinueAssessment: 20
    }
  },

  // Cross-Framework Journey
  {
    id: "ARION_NEXTACTION_CROSS_FRAMEWORK_1",
    category: "next_action_test",
    vendor: "ArionComply",
    question: "We're SOC 2 certified. We want ISO 27001. What's the fastest path?",
    expectedTopics: ["mapping", "leverage", "gap", "ISO 27001", "SOC 2"],
    complexity: "advanced",
    standard: "ISO_27001",
    scenario: 'User has SOC 2, wants to add ISO 27001',
    userContext: {
      complianceMaturity: 'mature',
      frameworksSelected: ['SOC_2'],
      certifications: ['SOC 2 Type II'],
      completedActivities: ['soc2_certification']
    },
    expectedNextActions: [
      "Map existing SOC 2 controls to ISO 27001 Annex A",
      "Identify ISO 27001 controls not covered by SOC 2",
      "Leverage existing SOC 2 evidence for mapped controls",
      "Focus implementation effort on ISO-specific controls only",
      "Review ISO 27001 ISMS requirements (clauses 4-10)",
      "Create ISO 27001-specific documentation (Statement of Applicability)"
    ],
    logicalSequence: true,
    actionOrder: 'optimized',
    shouldMention: ['mapping', 'leverage', 'gap'],
    shouldNotSuggest: [
      "Start from scratch",
      "Implement all 93 controls"
    ],
    scoringCriteria: {
      suggestsControlMapping: 35,
      suggestsLeverageExisting: 30,
      identifiesGaps: 20,
      mentionsISMSRequirements: 15
    }
  },

  // Incident Response
  {
    id: "ARION_NEXTACTION_INCIDENT_RESPONSE_1",
    category: "next_action_test",
    vendor: "ArionComply",
    question: "We detected a potential data breach. What do we do immediately?",
    expectedTopics: ["contain", "assess", "notification", "72 hours", "incident response"],
    complexity: "advanced",
    standard: "GDPR",
    scenario: 'Security incident occurred, immediate response needed',
    userContext: {
      lastAction: 'incident_detected',
      incidentType: 'potential_data_breach',
      frameworks: ['GDPR', 'HIPAA']
    },
    expectedNextActions: [
      "Activate incident response plan",
      "Contain the incident to prevent further exposure",
      "Preserve evidence for investigation",
      "Assess scope and impact (what data, how many individuals)",
      "Determine if notification is required (GDPR: 72 hours to DPA)",
      "Document all incident response activities",
      "Prepare for breach notification if required"
    ],
    logicalSequence: true,
    actionOrder: 'time-critical',
    urgency: 'high',
    shouldMention: ['contain', 'assess', '72 hours', 'notification'],
    scoringCriteria: {
      mentionsContainment: 30,
      mentionsImpactAssessment: 25,
      mentions72HourDeadline: 25,
      mentionsDocumentation: 20
    }
  },

  // Audit Preparation
  {
    id: "ARION_NEXTACTION_AUDIT_PREP_1",
    category: "next_action_test",
    vendor: "ArionComply",
    question: "Our SOC 2 Type II audit is in 2 weeks. Last-minute preparations?",
    expectedTopics: ["readiness", "evidence", "preparation", "staff briefing", "audit"],
    complexity: "intermediate",
    standard: "SOC_2",
    scenario: 'Audit scheduled in 2 weeks, preparing',
    userContext: {
      lastAction: 'audit_scheduled',
      auditDate: '2 weeks',
      framework: 'SOC_2',
      auditType: 'Type_II'
    },
    expectedNextActions: [
      "Run audit readiness report to identify gaps",
      "Review all evidence for completeness and currency",
      "Complete any outstanding remediation tasks",
      "Verify all policies are up to date and approved",
      "Prepare evidence package for auditor",
      "Schedule internal evidence review sessions",
      "Brief staff on audit process and expectations",
      "Ensure system access for auditor is ready"
    ],
    logicalSequence: true,
    actionOrder: 'checklist',
    urgency: 'medium',
    timeConstraint: '2 weeks',
    scoringCriteria: {
      mentionsReadinessCheck: 25,
      mentionsEvidenceReview: 25,
      mentionsStaffPrep: 20,
      appropriateUrgency: 30
    }
  },

  // Policy Update Chain
  {
    id: "ARION_NEXTACTION_POLICY_UPDATED_1",
    category: "next_action_test",
    vendor: "ArionComply",
    question: "I updated our access control policy. What else needs updating?",
    expectedTopics: ["linked controls", "procedures", "training", "notification", "policy cascade"],
    complexity: "intermediate",
    scenario: 'User updated access control policy, what cascades?',
    userContext: {
      lastAction: 'policy_updated',
      policy: 'Access Control Policy',
      affectedControls: ['ISO 27001 A.5.15', 'SOC 2 CC6.1', 'NIST CSF PR.AC']
    },
    expectedNextActions: [
      "Update linked controls to reference new policy version",
      "Review related procedures and update if needed",
      "Notify affected staff of policy changes",
      "Update training materials if policy requirements changed",
      "Re-assess affected controls for implementation status",
      "Update audit evidence with new policy version",
      "Document policy change in change management log"
    ],
    logicalSequence: true,
    contextAware: true,
    shouldMention: ['linked controls', 'procedures', 'training', 'notify'],
    scoringCriteria: {
      identifiesLinkedControls: 30,
      suggestsProcedureReview: 25,
      mentionsStaffNotification: 20,
      mentionsTraining: 25
    }
  }
];

export const NEXT_ACTION_CATEGORIES = {
  GETTING_STARTED: 'Initial setup and framework selection',
  ASSESSMENT: 'Gap assessment and readiness evaluation',
  IMPLEMENTATION: 'Control implementation and remediation',
  EVIDENCE_COLLECTION: 'Gathering and organizing proof',
  AUDIT_PREPARATION: 'Getting ready for external audit',
  POST_AUDIT: 'Addressing findings and maintaining certification',
  INCIDENT_RESPONSE: 'Handling security incidents',
  CONTINUOUS_IMPROVEMENT: 'Ongoing compliance maintenance',
  CROSS_FRAMEWORK: 'Adding additional frameworks',
  CHANGE_MANAGEMENT: 'Handling policy/control updates'
};

export function getNextActionTests() {
  return NEXT_ACTION_SCENARIOS;
}

export function getTestsByCategory(category) {
  return NEXT_ACTION_SCENARIOS.filter(s =>
    s.userContext.lastAction === category ||
    s.scenario.toLowerCase().includes(category.toLowerCase())
  );
}

export function getUrgentActionTests() {
  return NEXT_ACTION_SCENARIOS.filter(s => s.urgency === 'high');
}

export function getSequentialActionTests() {
  return NEXT_ACTION_SCENARIOS.filter(s => s.actionOrder === 'sequential');
}
