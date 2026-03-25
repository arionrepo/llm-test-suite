// Performance test prompts - 50 prompts across 5 input token ranges
export const PERFORMANCE_PROMPTS = {
  RUN_1_TINY: [
    { id: 'TINY_01', input: 'What is GDPR?', tokens: 4 },
    { id: 'TINY_02', input: 'What is ISO 27001?', tokens: 5 },
    { id: 'TINY_03', input: 'What is SOC 2?', tokens: 4 },
    { id: 'TINY_04', input: 'What is HIPAA?', tokens: 4 },
    { id: 'TINY_05', input: 'What is PCI-DSS?', tokens: 4 },
    { id: 'TINY_06', input: 'What is the EU AI Act?', tokens: 6 },
    { id: 'TINY_07', input: 'What is FedRAMP?', tokens: 4 },
    { id: 'TINY_08', input: 'What is NIST CSF?', tokens: 5 },
    { id: 'TINY_09', input: 'What is ISO 27701?', tokens: 5 },
    { id: 'TINY_10', input: 'What is CMMC?', tokens: 4 }
  ],

  RUN_2_SHORT: [
    { id: 'SHORT_01', input: 'What are the main principles of GDPR?', tokens: 8 },
    { id: 'SHORT_02', input: 'What are the key requirements of ISO 27001 certification?', tokens: 11 },
    { id: 'SHORT_03', input: 'What are the Trust Services Criteria in SOC 2?', tokens: 10 },
    { id: 'SHORT_04', input: 'What are the main HIPAA privacy rule requirements?', tokens: 10 },
    { id: 'SHORT_05', input: 'What are the 12 requirements of PCI-DSS?', tokens: 10 },
    { id: 'SHORT_06', input: 'What are the risk levels in the EU AI Act?', tokens: 11 },
    { id: 'SHORT_07', input: 'What are the FedRAMP impact levels?', tokens: 7 },
    { id: 'SHORT_08', input: 'What are the 6 functions of NIST CSF?', tokens: 10 },
    { id: 'SHORT_09', input: 'How does ISO 27701 extend ISO 27001?', tokens: 9 },
    { id: 'SHORT_10', input: 'What are the CMMC 2.0 certification levels?', tokens: 9 }
  ],

  RUN_3_MEDIUM: [
    { id: 'MED_01', input: 'For a small healthcare organization processing patient data, what are the key HIPAA Security Rule requirements for protecting electronic protected health information?', tokens: 25 },
    { id: 'MED_02', input: 'What are the specific documentation requirements needed to demonstrate GDPR accountability, including records of processing activities and data protection impact assessments?', tokens: 24 },
    { id: 'MED_03', input: 'How do ISO 27001 Annex A controls relate to SOC 2 Trust Services Criteria, and what are the main overlaps?', tokens: 23 },
    { id: 'MED_04', input: 'What are the steps a financial services company must take to achieve PCI-DSS compliance for payment card processing?', tokens: 21 },
    { id: 'MED_05', input: 'For an AI system used in hiring decisions, what makes it high-risk under the EU AI Act and what requirements apply?', tokens: 25 },
    { id: 'MED_06', input: 'What are the key differences between FedRAMP Moderate and High authorization levels for cloud service providers?', tokens: 19 },
    { id: 'MED_07', input: 'How does implementing NIST Cybersecurity Framework help organizations manage cyber risk and what are the implementation tiers?', tokens: 21 },
    { id: 'MED_08', input: 'What privacy controls does ISO 27701 add beyond ISO 27001 for organizations acting as PII processors?', tokens: 19 },
    { id: 'MED_09', input: 'What are the assessment requirements for achieving CMMC Level 2 certification for defense contractors?', tokens: 17 },
    { id: 'MED_10', input: 'How does ISO 27035 incident management integrate with GDPR data breach notification requirements including the 72-hour rule?', tokens: 21 }
  ],

  RUN_4_LONG: [
    { id: 'LONG_01', input: 'For a SaaS company with 100 employees operating globally, what is the complete workflow needed to achieve SOC 2 Type II certification, including scoping decisions, control implementation, evidence collection, and audit preparation, with estimated timeframes for each phase?', tokens: 44 },
    { id: 'LONG_02', input: 'A multinational corporation processes personal data of EU citizens, California residents, and Canadian customers. What are the overlapping requirements between GDPR, CCPA/CPRA, and PIPEDA that can be addressed with unified privacy controls, and what are the unique requirements for each regulation?', tokens: 48 },
    { id: 'LONG_03', input: 'What are the specific technical and organizational security controls required under ISO 27001 Annex A for a cloud service provider, focusing on controls related to access management, encryption, network security, and incident response, with implementation guidance for each?', tokens: 44 },
    { id: 'LONG_04', input: 'For an e-commerce platform handling payment card data, what are the complete PCI-DSS compliance requirements covering network security, cardholder data protection, vulnerability management, access control, monitoring, and testing, including quarterly and annual obligations?', tokens: 39 },
    { id: 'LONG_05', input: 'An organization is developing a generative AI system for customer service that processes personal data. What compliance requirements apply from EU AI Act, GDPR, and ISO 42001, including risk classification, transparency obligations, data protection requirements, and AI governance controls?', tokens: 46 },
    { id: 'LONG_06', input: 'What is the complete process for a cloud service provider to achieve FedRAMP authorization at the Moderate impact level, including pre-assessment, system security plan development, control implementation, third-party assessment, authorization decision, and continuous monitoring?', tokens: 42 },
    { id: 'LONG_07', input: 'How should an organization implement the NIST Cybersecurity Framework covering all six functions - Govern, Identify, Protect, Detect, Respond, and Recover - with specific activities, controls, and metrics for each function?', tokens: 38 },
    { id: 'LONG_08', input: 'For a healthcare organization implementing both HIPAA and ISO 27001, what are the mappings between HIPAA Security Rule safeguards and ISO 27001 Annex A controls, and how can a single ISMS address both requirements efficiently?', tokens: 41 },
    { id: 'LONG_09', input: 'What are the complete requirements for establishing a Privacy Information Management System under ISO 27701, including the additional privacy controls beyond ISO 27001, PII controller and processor obligations, and integration with existing ISMS?', tokens: 39 },
    { id: 'LONG_10', input: 'For a defense contractor handling Controlled Unclassified Information, what is the path to CMMC Level 2 certification including NIST 800-171 implementation, System Security Plan development, assessment preparation, and third-party certification process?', tokens: 39 }
  ],

  RUN_5_VERYLONG: [
    { id: 'VLONG_01', input: '[TIER 1: You are ArionComply AI, expert compliance advisor]\n[TIER 2: GDPR Assessment Mode - helping with gap assessment]\n[TIER 3: Industry: Healthcare, Size: SMB (50-250), Region: EU, Frameworks: GDPR+HIPAA, Maturity: Developing]\n[CONTEXT: Organization is healthcare provider with EU and US patients]\n[QUESTION: We need to conduct a comprehensive data protection gap assessment covering both GDPR requirements for EU patient data and HIPAA requirements for US patient health information. What is the systematic workflow to assess our current state, identify gaps, prioritize remediation, and track implementation progress for both regulations simultaneously while avoiding duplicate work where requirements overlap?]', tokens: 110 },
    { id: 'VLONG_02', input: '[TIER 1: ArionComply expert advisor]\n[TIER 2: ISO 27001 Implementation Mode]\n[TIER 3: Industry: Financial Services, Size: Enterprise (1000+), Region: Global, Frameworks: ISO27001+SOC2+PCI-DSS, Maturity: Managed]\n[QUESTION: As a global financial services firm, we are implementing ISO 27001 to complement existing SOC 2 and PCI-DSS programs. How do we leverage our existing SOC 2 controls and PCI-DSS security measures to accelerate ISO 27001 implementation, what additional ISO-specific controls are needed, and what is the optimal implementation sequence to achieve certification within 12 months while maintaining existing compliance?]', tokens: 105 },
    { id: 'VLONG_03', input: '[TIER 1: Compliance advisor]\n[TIER 2: Multi-framework mapping mode]\n[TIER 3: Industry: Technology/SaaS, Size: SMB (100-500), Region: US+EU, Frameworks: SOC2+GDPR+ISO27001, Maturity: Developing]\n[QUESTION: We currently have SOC 2 Type II certification. Enterprise customers are now requiring ISO 27001 certification, and we also need GDPR compliance for EU customers. What is the optimal approach to map our existing SOC 2 controls to both ISO 27001 and GDPR requirements, identify the unique controls needed for each framework, and create an implementation roadmap that minimizes duplicate effort while achieving all three certifications?]', tokens: 108 },
    { id: 'VLONG_04', input: '[TIER 1: ArionComply advisor]\n[TIER 2: AI Governance + Risk Assessment]\n[TIER 3: Industry: AI/ML Company, Size: Startup (50), Region: EU+CA, Frameworks: EU_AI_Act+ISO42001+GDPR, Maturity: Initial]\n[QUESTION: We are developing an AI-powered hiring assistant that screens resumes and ranks candidates. Under the EU AI Act, is this high-risk? What specific requirements apply from EU AI Act, how does ISO 42001 AI Management System help us meet those requirements, what GDPR considerations exist for processing candidate personal data, and how does California SB 1047 apply if we operate in California?]', tokens: 108 },
    { id: 'VLONG_05', input: '[TIER 1: Compliance expert]\n[TIER 2: Incident Response + Breach Management]\n[TIER 3: Industry: Retail, Size: Enterprise (5000+), Region: Global, Frameworks: GDPR+CCPA+PCI-DSS+ISO27001+ISO27035, Maturity: Defined]\n[QUESTION: We experienced a data breach affecting customer payment card data and personal information of EU and California residents. What is the complete incident response workflow covering ISO 27035 incident handling, GDPR 72-hour breach notification to DPA, CCPA breach notification to California AG, PCI-DSS incident reporting to card brands and acquiring bank, customer notification requirements under each regulation, and post-incident lessons learned documentation?]', tokens: 108 },
    { id: 'VLONG_06', input: '[TIER 1: Expert advisor]\n[TIER 2: Cloud Security Compliance]\n[TIER 3: Industry: Cloud Service Provider, Size: Enterprise, Region: US Federal, Frameworks: FedRAMP+ISO27017+CSA_STAR, Maturity: Managed]\n[QUESTION: As a cloud service provider targeting federal government customers, we need FedRAMP Moderate authorization. How do we leverage our existing ISO 27017 cloud security controls and CSA STAR Level 2 certification to accelerate FedRAMP readiness, what are the FedRAMP-specific NIST 800-53 controls that go beyond ISO and CSA, and what is the end-to-end authorization process including 3PAO selection, SAR development, and authorization timeline?]', tokens: 105 },
    { id: 'VLONG_07', input: '[TIER 1: ArionComply]\n[TIER 2: Privacy Program Development]\n[TIER 3: Industry: Education Technology, Size: SMB, Region: US+EU, Frameworks: GDPR+FERPA+COPPA, Maturity: Initial]\n[QUESTION: We provide educational software to K-12 schools processing student data in US and EU. What privacy program framework addresses GDPR requirements for EU student data, FERPA requirements for US educational records, and COPPA requirements for children under 13, including consent management, data retention policies, security safeguards, and parent rights fulfillment across all three regulations?]', tokens: 95 },
    { id: 'VLONG_08', input: '[TIER 1: Advisor]\n[TIER 2: Vendor Risk Management]\n[TIER 3: Industry: Healthcare, Size: Large (2000+), Region: US, Frameworks: HIPAA+SOC2+ISO27001, Maturity: Managed]\n[QUESTION: We use multiple cloud vendors (AWS, Azure, GCP) and SaaS providers processing protected health information. What is the comprehensive vendor risk assessment and management program needed to ensure third-party HIPAA Business Associate compliance, evaluate vendor security controls against SOC 2/ISO 27001, manage vendor contracts and BAAs, conduct ongoing vendor monitoring, and maintain vendor risk register?]', tokens: 92 },
    { id: 'VLONG_09', input: '[TIER 1: Expert]\n[TIER 2: IT Service Management + Security Integration]\n[TIER 3: Industry: Managed Service Provider, Size: Medium, Region: Global, Frameworks: ISO20000+ISO27001+SOC2, Maturity: Developing]\n[QUESTION: We provide managed IT services and need both ISO 20000 ITSM and ISO 27001 security certifications plus SOC 2 for customer requirements. How do we integrate incident management, change management, and problem management processes to satisfy ISO 20000 service requirements while also meeting ISO 27001 security incident handling and SOC 2 availability criteria without duplicate processes?]', tokens: 98 },
    { id: 'VLONG_10', input: '[TIER 1: Advisor]\n[TIER 2: Compliance Program Optimization]\n[TIER 3: Industry: Financial Services, Size: Enterprise, Region: US, Frameworks: SOX+GLBA+PCI-DSS+SOC2, Maturity: Optimizing]\n[QUESTION: Our organization currently maintains separate compliance programs for SOX IT general controls, GLBA Safeguards Rule, PCI-DSS payment security, and SOC 2 service organization controls. How can we consolidate these into an integrated compliance management framework that eliminates duplicate audits and evidence collection, maps controls across all four frameworks, and optimizes resource allocation while maintaining certification for each?]', tokens: 96 }
  ]
};
