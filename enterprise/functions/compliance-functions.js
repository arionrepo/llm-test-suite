// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/functions/compliance-functions.js
// Description: Enterprise function calling definitions for compliance operations - PII detection, risk assessment, framework mapping
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

export const COMPLIANCE_FUNCTIONS = [
  {
    type: 'function',
    function: {
      name: 'identify_pii',
      description: 'Identify personally identifiable information in text according to specified data protection standards',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The text to analyze for PII'
          },
          standards: {
            type: 'array',
            items: { type: 'string', enum: ['GDPR', 'CCPA', 'HIPAA', 'PIPEDA'] },
            description: 'Privacy standards to apply'
          },
          categories: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional: Specific PII categories to detect (email, ssn, phone, etc.)'
          }
        },
        required: ['text', 'standards']
      }
    }
  },
  
  {
    type: 'function',
    function: {
      name: 'classify_data_sensitivity',
      description: 'Classify data sensitivity level according to organizational data classification policy',
      parameters: {
        type: 'object',
        properties: {
          data_description: {
            type: 'string',
            description: 'Description of the data to classify'
          },
          context: {
            type: 'string',
            description: 'Business context (healthcare, financial, general)'
          }
        },
        required: ['data_description']
      }
    }
  },
  
  {
    type: 'function',
    function: {
      name: 'assess_ai_risk_level',
      description: 'Assess risk level of an AI system according to EU AI Act classification',
      parameters: {
        type: 'object',
        properties: {
          ai_system_description: {
            type: 'string',
            description: 'Description of the AI system and its purpose'
          },
          use_case: {
            type: 'string',
            description: 'Specific use case (hiring, credit scoring, law enforcement, etc.)'
          },
          affects_fundamental_rights: {
            type: 'boolean',
            description: 'Whether the system affects fundamental rights'
          }
        },
        required: ['ai_system_description', 'use_case']
      }
    }
  },
  
  {
    type: 'function',
    function: {
      name: 'check_compliance_requirement',
      description: 'Check if a specific compliance requirement is met based on control implementation',
      parameters: {
        type: 'object',
        properties: {
          framework: {
            type: 'string',
            enum: ['ISO_27001', 'SOC_2', 'PCI_DSS', 'NIST_CSF', 'GDPR', 'HIPAA'],
            description: 'Compliance framework to check against'
          },
          requirement_id: {
            type: 'string',
            description: 'Specific requirement identifier (e.g., "A.8.2", "CC6.1", "3.4")'
          },
          implementation_details: {
            type: 'string',
            description: 'Description of how the control is implemented'
          }
        },
        required: ['framework', 'requirement_id', 'implementation_details']
      }
    }
  },
  
  {
    type: 'function',
    function: {
      name: 'map_controls_across_frameworks',
      description: 'Map security controls between different compliance frameworks',
      parameters: {
        type: 'object',
        properties: {
          source_framework: {
            type: 'string',
            enum: ['ISO_27001', 'SOC_2', 'NIST_CSF', 'CIS_CONTROLS', 'CSA_CCM'],
            description: 'Source framework'
          },
          source_control_id: {
            type: 'string',
            description: 'Control identifier in source framework'
          },
          target_frameworks: {
            type: 'array',
            items: { type: 'string' },
            description: 'Target frameworks to map to'
          }
        },
        required: ['source_framework', 'source_control_id', 'target_frameworks']
      }
    }
  },
  
  {
    type: 'function',
    function: {
      name: 'generate_compliance_gap_analysis',
      description: 'Generate gap analysis between current state and target compliance framework',
      parameters: {
        type: 'object',
        properties: {
          target_framework: {
            type: 'string',
            enum: ['ISO_27001', 'SOC_2', 'PCI_DSS', 'HIPAA', 'FEDRAMP'],
            description: 'Target compliance framework'
          },
          current_controls: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of currently implemented controls'
          },
          scope: {
            type: 'string',
            description: 'Scope of the assessment (entire organization, specific system, etc.)'
          }
        },
        required: ['target_framework', 'current_controls']
      }
    }
  },
  
  {
    type: 'function',
    function: {
      name: 'extract_security_requirements',
      description: 'Extract specific security requirements from policy or contract documents',
      parameters: {
        type: 'object',
        properties: {
          document_text: {
            type: 'string',
            description: 'Text of the policy or contract to analyze'
          },
          requirement_type: {
            type: 'string',
            enum: ['technical', 'administrative', 'physical', 'all'],
            description: 'Type of requirements to extract'
          }
        },
        required: ['document_text']
      }
    }
  },
  
  {
    type: 'function',
    function: {
      name: 'determine_shared_responsibility',
      description: 'Determine cloud security shared responsibility for a specific control',
      parameters: {
        type: 'object',
        properties: {
          cloud_service_model: {
            type: 'string',
            enum: ['IaaS', 'PaaS', 'SaaS'],
            description: 'Cloud service model'
          },
          control_description: {
            type: 'string',
            description: 'Description of the security control'
          },
          cloud_provider: {
            type: 'string',
            enum: ['AWS', 'Azure', 'GCP', 'generic'],
            description: 'Cloud service provider'
          }
        },
        required: ['cloud_service_model', 'control_description']
      }
    }
  },
  
  {
    type: 'function',
    function: {
      name: 'generate_audit_finding',
      description: 'Generate structured audit finding from identified compliance issue',
      parameters: {
        type: 'object',
        properties: {
          issue_description: {
            type: 'string',
            description: 'Description of the compliance issue'
          },
          framework: {
            type: 'string',
            description: 'Relevant compliance framework'
          },
          severity: {
            type: 'string',
            enum: ['Critical', 'High', 'Medium', 'Low'],
            description: 'Severity level of the finding'
          },
          affected_requirement: {
            type: 'string',
            description: 'Specific requirement that is not met'
          }
        },
        required: ['issue_description', 'framework', 'severity']
      }
    }
  },
  
  {
    type: 'function',
    function: {
      name: 'calculate_compliance_score',
      description: 'Calculate overall compliance score based on control implementation status',
      parameters: {
        type: 'object',
        properties: {
          framework: {
            type: 'string',
            description: 'Compliance framework to score against'
          },
          implemented_controls: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of implemented control IDs'
          },
          partial_controls: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of partially implemented control IDs'
          }
        },
        required: ['framework', 'implemented_controls']
      }
    }
  }
];

export function getFunctionsByCategory(category) {
  const categories = {
    'privacy': ['identify_pii', 'classify_data_sensitivity'],
    'ai_regulation': ['assess_ai_risk_level'],
    'compliance_checking': ['check_compliance_requirement', 'generate_compliance_gap_analysis'],
    'framework_mapping': ['map_controls_across_frameworks'],
    'document_analysis': ['extract_security_requirements'],
    'cloud_security': ['determine_shared_responsibility'],
    'audit': ['generate_audit_finding', 'calculate_compliance_score']
  };
  
  const functionNames = categories[category] || [];
  return COMPLIANCE_FUNCTIONS.filter(f => functionNames.includes(f.function.name));
}
