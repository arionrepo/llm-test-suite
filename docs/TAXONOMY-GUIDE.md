# Taxonomy Management Guide

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/docs/TAXONOMY-GUIDE.md
**Description:** Guidelines for managing and extending the test prompt taxonomy
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-25

---

## 1. Overview

The LLM Test Suite uses a **4-dimensional taxonomy** for organizing test prompts:

1. **Standard** - Compliance framework or regulation (29 standards)
2. **Knowledge Type** - Cognitive task type (5 types)
3. **Persona** - User expertise level and role (6 personas)
4. **Vendor** - Vendor-agnostic or vendor-specific (extensible)

This creates a matrix with **29 × 5 × 6 × N** potential test combinations, where N is the number of vendors.

---

## 2. Compliance Standards

### 2.1 Current Standards (29 Total)

**Privacy Regulations:**
- GDPR - General Data Protection Regulation (EU)
- CCPA - California Consumer Privacy Act (US)
- CPRA - California Privacy Rights Act (US)
- PIPEDA - Personal Information Protection and Electronic Documents Act (Canada)
- LGPD - Lei Geral de Proteção de Dados (Brazil)
- POPIA - Protection of Personal Information Act (South Africa)
- UK_GDPR - UK General Data Protection Regulation
- APPI - Act on the Protection of Personal Information (Japan)

**Security Frameworks:**
- ISO_27001 - Information Security Management
- ISO_27002 - Information Security Controls
- ISO_27017 - Cloud Security Controls
- ISO_27018 - Cloud Privacy Controls
- ISO_27701 - Privacy Information Management
- NIST_CSF - NIST Cybersecurity Framework
- NIST_800_53 - Security and Privacy Controls
- NIST_800_171 - Protecting CUI in Nonfederal Systems
- CIS_Controls - Center for Internet Security Controls
- CSA_CCM - Cloud Security Alliance Cloud Controls Matrix

**Compliance Standards:**
- SOC_2 - Service Organization Control 2
- ISO_22301 - Business Continuity Management
- PCI_DSS - Payment Card Industry Data Security Standard
- HIPAA - Health Insurance Portability and Accountability Act
- FedRAMP - Federal Risk and Authorization Management Program
- CMMC_2_0 - Cybersecurity Maturity Model Certification
- COBIT - Control Objectives for Information Technologies
- SSAE_18 - Statement on Standards for Attestation Engagements
- SOX - Sarbanes-Oxley Act
- GLBA - Gramm-Leach-Bliley Act

**AI & Emerging:**
- EU_AI_ACT - EU Artificial Intelligence Act
- ISO_27050 - eDiscovery
- CA_SB_1047 - California AI Regulation
- CA_AB_2013 - California Automated Decision Systems

### 2.2 When to Add a New Standard

**Criteria for Addition:**
1. **Regulatory Mandate** - It's a law, regulation, or enforceable standard
2. **Industry Relevance** - Multiple industries/customers require it
3. **Compliance Demand** - Customers are asking for it
4. **Documentation Availability** - Official standards documentation exists
5. **Scope Clarity** - Requirements are well-defined (not draft/proposal)

**Process:**
1. Verify meets criteria above
2. Add to `compliance-standards.js`:
   ```javascript
   {
     name: "NEW_STANDARD",
     fullName: "Full Standard Name",
     category: "privacy" | "security-framework" | "compliance" | "ai-regulation",
     jurisdiction: "EU" | "US" | "UK" | "International" | "Region",
     year: 2024,
     keyTopics: ["topic1", "topic2"],
     retrievalNeeds: ["vector_db", "knowledge_graph"]
   }
   ```
3. Generate initial test prompts (at least 10 covering FACTUAL/PROCEDURAL/RELATIONAL)
4. Update documentation
5. Update viewer filters (automatic if data-driven)

**Example Addition:**
```javascript
// Adding VCDPA (Virginia Consumer Data Protection Act)
{
  name: "VCDPA",
  fullName: "Virginia Consumer Data Protection Act",
  category: "privacy",
  jurisdiction: "US",
  year: 2023,
  keyTopics: ["consumer rights", "data protection", "Virginia", "opt-out"],
  retrievalNeeds: ["vector_db", "structured_retrieval"]
}
```

### 2.3 Standard Naming Conventions

**Format Rules:**
- Use official acronyms (GDPR, not "gdpr")
- Use SCREAMING_SNAKE_CASE for multi-word names (ISO_27001, not "iso27001")
- Preserve numbers without separators where standard (ISO27001) but add underscore for clarity (ISO_27001)
- Use full words for non-acronyms (PIPEDA, not PDPA if ambiguous)

**Disambiguation:**
- If acronym conflicts, add jurisdiction: UK_GDPR vs EU_GDPR
- If year-specific versions, add year: NIST_800_53_REV5

---

## 3. Knowledge Types

### 3.1 Current Knowledge Types (5 Total)

**1. FACTUAL**
- **Purpose:** Test recall of definitions, facts, requirements
- **Characteristics:** Single concept, straightforward answer
- **Examples:**
  - "What is GDPR?"
  - "What is the maximum GDPR fine?"
  - "What is a Data Protection Impact Assessment?"

**2. RELATIONAL**
- **Purpose:** Test understanding of relationships, mappings, dependencies
- **Characteristics:** Connects multiple concepts or frameworks
- **Examples:**
  - "How does GDPR relate to ISO 27701?"
  - "What is the relationship between controller and processor?"
  - "Map ISO 27001 Annex A to NIST CSF"

**3. PROCEDURAL**
- **Purpose:** Test knowledge of processes, workflows, implementation steps
- **Characteristics:** Step-by-step, "how to" questions
- **Examples:**
  - "How do I conduct a GDPR DPIA?"
  - "What are the steps to implement ISO 27001?"
  - "How do I respond to a data subject access request?"

**4. EXACT_MATCH**
- **Purpose:** Test ability to provide precise citations or exact regulatory text
- **Characteristics:** Requires specific article/section references
- **Examples:**
  - "What does GDPR Article 6 say about lawful bases?"
  - "Quote ISO 27001 control A.8.2"
  - "What is the exact definition of 'personal data' in GDPR?"

**5. SYNTHESIS**
- **Purpose:** Test ability to analyze, compare, or synthesize across multiple documents
- **Characteristics:** Complex, requires integration of information from multiple sources
- **Examples:**
  - "Compare GDPR, CCPA, and PIPEDA breach notification requirements"
  - "Analyze the overlap between ISO 27001 and SOC 2"
  - "Synthesize NIST CSF and CIS Controls into a unified security program"

### 3.2 When to Add a New Knowledge Type

**Current Coverage is Comprehensive**

The 5 knowledge types cover the cognitive spectrum from simple recall (FACTUAL) to complex synthesis (SYNTHESIS), based on Bloom's Taxonomy:

```
FACTUAL       → Remember
RELATIONAL    → Understand
PROCEDURAL    → Apply
EXACT_MATCH   → Remember (precise)
SYNTHESIS     → Analyze/Evaluate/Create
```

**Adding a new knowledge type should be RARE and require strong justification:**

**Criteria for Addition:**
1. **Cognitive Gap** - Identifies a cognitive task not covered by existing 5 types
2. **Distinct Behavior** - Requires fundamentally different LLM behavior or retrieval strategy
3. **Common Pattern** - Represents ≥10% of real user questions
4. **Non-Overlapping** - Cannot be reasonably classified into existing types

**Potential Future Additions:**
- **PREDICTIVE** - "What will happen if..." scenario analysis
- **DIAGNOSTIC** - "Why did this happen?" root cause analysis
- **EVALUATIVE** - "Is X compliant with Y?" judgment questions

**Process if Adding:**
1. Justify against criteria above
2. Define characteristics, examples, and retrieval strategy
3. Add to `user-personas.js`
4. Generate ≥20 test prompts demonstrating the new type
5. Update all documentation
6. Ensure viewer can filter by new type

---

## 4. User Personas

### 4.1 Current Personas (6 Total)

**1. NOVICE**
- **Expertise:** Beginner, new to compliance
- **Query Style:** Simple, broad questions
- **Needs:** Explanations, definitions, context
- **Expected Response:** Educational, jargon-free, examples
- **Example:** "What is GDPR?"

**2. PRACTITIONER**
- **Expertise:** Intermediate, technical implementer
- **Query Style:** Technical, implementation-focused
- **Needs:** How-to guidance, practical steps, best practices
- **Expected Response:** Step-by-step, technical details, practical advice
- **Example:** "How do I implement GDPR consent management in our web app?"

**3. MANAGER**
- **Expertise:** Intermediate to advanced, strategic oversight
- **Query Style:** Process-oriented, prioritization-focused
- **Needs:** Workflows, delegation, project management
- **Expected Response:** Process guidance, prioritization, resource allocation
- **Example:** "How should we prioritize ISO 27001 controls for implementation?"

**4. AUDITOR**
- **Expertise:** Advanced, verification-focused
- **Query Style:** Evidence-based, criteria-oriented
- **Needs:** Validation criteria, evidence requirements, audit procedures
- **Expected Response:** Verification steps, evidence types, audit trails
- **Example:** "What evidence is required to demonstrate GDPR Article 32 compliance?"

**5. EXECUTIVE**
- **Expertise:** Advanced, business-focused
- **Query Style:** Strategic, risk and ROI-focused
- **Needs:** Business impact, risk assessment, resource justification
- **Expected Response:** Business value, risk quantification, strategic guidance
- **Example:** "What is the ROI of ISO 27001 certification for our company?"

**6. DEVELOPER**
- **Expertise:** Advanced, technical implementation
- **Query Style:** Code-focused, architecture-oriented
- **Needs:** Technical implementation, code examples, API usage
- **Expected Response:** Code snippets, architecture patterns, technical details
- **Example:** "How do I implement GDPR right-to-erasure in a microservices architecture?"

### 4.2 When to Add a New Persona

**Criteria for Addition:**
1. **Distinct Role** - Represents a role/perspective not covered by existing 6
2. **Distinct Needs** - Requires fundamentally different response style or content
3. **Significant Audience** - Represents ≥5% of target users
4. **Non-Overlapping** - Cannot be reasonably covered by existing personas

**Potential Future Additions:**
- **DPO** (Data Protection Officer) - Specialized GDPR/privacy focus
- **CISO** (Chief Information Security Officer) - Strategic security leadership
- **LEGAL_COUNSEL** - Legal interpretation and risk assessment
- **PRIVACY_ENGINEER** - Privacy-by-design technical implementation
- **COMPLIANCE_OFFICER** - Cross-framework compliance coordination
- **RISK_ANALYST** - Quantitative risk assessment

**Process if Adding:**
1. Define persona characteristics:
   ```javascript
   {
     name: "PERSONA_NAME",
     description: "Who they are and what they do",
     expertise: "beginner" | "intermediate" | "advanced" | "expert",
     queryStyle: "simple" | "technical" | "strategic" | "verification",
     needsExplanations: boolean,
     expectedBehavior: {
       responseStyle: "...",
       includesCitations: boolean,
       includesExamples: boolean,
       includesSteps: boolean
     }
   }
   ```
2. Generate ≥10 test prompts per knowledge type for new persona
3. Update `user-personas.js`
4. Update documentation and viewer

---

## 5. Enterprise Task Domains (Taxonomy B)

### 5.1 Current Task Domains

The enterprise task taxonomy supports **vendor-agnostic business use case testing** beyond compliance:

**1. Customer Service**
- Email response generation
- Chat support automation
- Ticket routing and classification
- FAQ generation
- Escalation handling

**2. Document Processing**
- Contract analysis and summarization
- Report generation
- Document extraction (key terms, dates, obligations)
- Document classification
- Template population

**3. Code & Development**
- Code generation from requirements
- Code review and suggestions
- Bug analysis and debugging
- Documentation generation
- Architecture design assistance

**4. Data Analysis**
- Report generation from data
- Insight extraction
- Trend identification
- Visualization recommendations
- Forecasting and prediction

**5. Communication**
- Email drafting (internal/external)
- Meeting notes and summaries
- Presentation content generation
- Memo and announcement writing
- Status report compilation

**6. Project Management**
- Task breakdown and estimation
- Project planning
- Risk identification
- Resource allocation recommendations
- Timeline generation

**7. Research & Synthesis**
- Information gathering and summarization
- Competitive analysis
- Market research synthesis
- Literature review
- Multi-source comparison

### 5.2 Task Types (Domain-Agnostic Operations)

**1. Generate** - Create new content from scratch or requirements
**2. Analyze** - Understand and interpret existing content
**3. Transform** - Convert format, style, or structure
**4. Classify** - Categorize or tag content
**5. Extract** - Pull specific information from larger content

### 5.3 Business Functions (Department/Industry Context)

**1. Sales** - CRM, proposals, outreach, deal analysis
**2. Support** - Tickets, FAQs, escalation, knowledge base
**3. Finance** - Analysis, reporting, forecasting, compliance
**4. HR** - Recruiting, onboarding, policies, performance
**5. Engineering** - Code, architecture, documentation, DevOps
**6. Operations** - Processes, optimization, monitoring, automation

### 5.4 When to Add Enterprise Task Domains

**Criteria:**
1. **Real Business Need** - Represents actual enterprise LLM use case
2. **Generic Applicability** - Multiple industries/companies can use it
3. **Distinct from Existing** - Not already covered by current domains
4. **Testable** - Can create objective test criteria
5. **Local Model Candidate** - Tasks where local LLMs might be viable alternative

**Process:**
1. Identify 10+ real-world examples of the use case
2. Define task types applicable to the domain
3. Create initial test suite (≥20 tests)
4. Test against local and cloud models to validate
5. Document in taxonomy

---

## 6. Routing Profile Selection

### 6.1 Routing Strategy by Test Type

**Compliance Knowledge Tests:**
- **Default:** `direct_openai_gpt4` (baseline accuracy)
- **Alternative:** `local_llama3_70b` (cost comparison)
- **Customer:** `arioncomply_cloud_dev` (if testing customer pipeline)

**Enterprise Task Tests:**
- **Default:** `local_llama3_70b` (evaluate cost savings)
- **Comparison:** Also test `direct_openai_gpt4` (accuracy baseline)
- **Use case:** Determine if local models sufficient for this task

**Platform Feature Tests:**
- **Required:** Customer pipeline routing (e.g., `arioncomply_local_dev`)
- **Why:** Platform questions need product context from database
- **Cannot use:** Direct LLM (no knowledge of customer product)

### 6.2 Multi-Route Testing Guidelines

**When to test multiple routes:**
- Establishing baseline accuracy (compare cloud vs local)
- Measuring customer pipeline value-add (with RAG vs without)
- Cost-benefit analysis (local vs cloud for specific use cases)
- Model selection decisions (which model for which tasks)

**How to configure:**
```javascript
{
  routingProfiles: [
    "direct_openai_gpt4",      // Accuracy baseline
    "local_llama3_70b",        // Cost-saving alternative
    "arioncomply_cloud_dev"    // Customer enhancement
  ],
  evaluationMode: "comparison"
}
```

**Comparison metrics:**
- Accuracy: % of expected topics covered
- Completeness: Response thoroughness
- Citations: Proper sourcing
- Cost: API cost per query
- Speed: Response time (ms)

### 6.3 Environment-Specific Routing

**Development:**
- Use `arioncomply_local_dev` for customer tests
- Use local models for cost-free testing
- Use cloud models sparingly (API costs)

**Staging/Cloud Dev:**
- Use `arioncomply_cloud_dev` for integration testing
- Mix of local and cloud for comparison

**Production:**
- Use `arioncomply_production` only for critical validation
- Minimize production testing (real customer data)

---

## 7. Vendor Namespace

### 7.1 Current Customers/Vendors

**Generic** - Vendor-agnostic baseline:
- Compliance knowledge (GDPR, ISO 27001, SOC 2, etc.)
- Enterprise tasks (document analysis, customer service, code generation)
- Universal business use cases

**ArionComply** - First customer implementation:
- Platform workflow tests (UI, navigation, features)
- Multi-tier prompt tests (TIER 1/2/3/4 system)
- Intent classification
- Next action prediction
- Full pipeline integration (edge function + database + RAG)

**Future Customers:**
- Salesforce Compliance Cloud
- AWS Audit Manager
- ServiceNow GRC
- Custom enterprise platforms

### 7.2 When to Add a New Customer/Vendor

**Criteria for Addition:**
1. **Platform/Product** - It's a specific compliance platform, tool, or product
2. **Custom Tests Needed** - Generic tests don't adequately cover vendor specifics
3. **Active Customer** - Vendor is using (or will use) the test suite
4. **Documentation Available** - Vendor provides API/feature documentation

**Common Vendor Additions:**
- Compliance platforms: Salesforce, ServiceNow GRC, OneTrust, TrustArc
- Cloud providers: AWS Compliance, Azure Compliance, GCP Compliance
- Industry-specific: Epic (healthcare), Workday (HR compliance)

**Process:**
1. Create vendor directory: `enterprise/{vendor-name}-tests/`
2. Define vendor-specific test categories
3. Create initial test suite (≥20 tests)
4. Set `vendor` field to vendor name (PascalCase)
5. Update viewer (automatic if data-driven)
6. Document vendor-specific schema extensions (if any)

**Example:**
```javascript
// Adding Salesforce Compliance Cloud tests
{
  id: "SALESFORCE_SHIELD_CONFIG_PRACTITIONER_1",
  vendor: "Salesforce",
  category: "salesforce_shield",
  question: "How do I enable Platform Encryption in Salesforce Shield?",
  salesforceModule: "Shield",  // Vendor-specific field
  objectTypes: ["Account", "Contact"],
  expectedGuidance: [...]
}
```

### 7.3 Vendor Naming Conventions

**Format Rules:**
- Use official brand/product name (PascalCase)
- Use full name, not abbreviations: `"Salesforce"` not `"SFDC"`
- Exception: Standard acronyms like "AWS" are acceptable
- Multi-word: `"ServiceNow"` not `"Service Now"` or `"service_now"`

**Examples:**
- ✅ `"ArionComply"`
- ✅ `"Salesforce"`
- ✅ `"AWS"`
- ✅ `"ServiceNow"`
- ✅ `"OneTrust"`
- ❌ `"arioncomply"` (not PascalCase)
- ❌ `"SFDC"` (abbreviation)
- ❌ `"service_now"` (snake_case)

---

## 8. Taxonomy Expansion Decision Matrix

### 8.1 Decision Tree

```
Should I add a new item to the taxonomy?
  │
  ├─ Is it a COMPLIANCE STANDARD?
  │   ├─ Is it a law/regulation/enforceable standard? → YES → Add to Standards
  │   └─ Is it a guideline/best practice? → NO → Don't add
  │
  ├─ Is it a KNOWLEDGE TYPE?
  │   ├─ Does it represent a cognitive task not covered by existing 5? → YES → Consider adding
  │   └─ Can it fit into existing types? → NO → Don't add
  │
  ├─ Is it a USER PERSONA?
  │   ├─ Does it represent a distinct role with different needs? → YES → Consider adding
  │   └─ Can existing personas cover it? → NO → Don't add
  │
  └─ Is it a VENDOR?
      ├─ Is it a compliance platform/product? → YES → Add to Vendors
      └─ Is it a generic concept? → NO → Don't add
```

### 8.2 Impact Assessment

**Before adding to taxonomy, assess impact:**

| Impact Area | Questions to Ask |
|-------------|------------------|
| **Data Volume** | How many new tests will this require? (Min: 10, Ideal: 30+) |
| **Documentation** | Can we document this clearly? |
| **Maintenance** | Can we keep this up to date? |
| **User Value** | Will ≥5% of users benefit? |
| **Coverage** | Does this fill a gap or duplicate existing? |
| **Complexity** | Does this simplify or complicate the taxonomy? |

**Scoring:**
- 5-6 YES → Strong case for addition
- 3-4 YES → Moderate case, consider
- 0-2 YES → Weak case, don't add

---

## 9. Taxonomy Maintenance

### 9.1 Annual Review Process

**When:** January each year

**Review Checklist:**
- [ ] New regulatory standards passed in previous year?
- [ ] New vendors added to customer base?
- [ ] User feedback indicating gaps in personas or knowledge types?
- [ ] Deprecated standards (no longer in use)?
- [ ] Test coverage analysis (which combinations are under-tested)?

**Actions:**
- Add new items following criteria in this guide
- Deprecate obsolete items (mark, don't delete)
- Rebalance test distribution if skewed
- Update documentation

### 9.2 Deprecation Process

**When to Deprecate:**
- Standard is replaced by newer version (e.g., NIST 800-53 Rev 4 → Rev 5)
- Regulation is superseded or repealed
- Vendor discontinues product
- Knowledge type/persona merged into another

**How to Deprecate:**
1. Mark as deprecated in taxonomy files:
   ```javascript
   {
     name: "OLD_STANDARD",
     deprecated: true,
     deprecatedDate: "2026-01-01",
     replacedBy: "NEW_STANDARD",
     fullName: "Old Standard Name (DEPRECATED)"
   }
   ```
2. Keep existing tests but mark as deprecated
3. Don't generate new tests for deprecated items
4. Remove from active filters in viewer (show in "Deprecated" section)
5. After 2 years, archive (move to `archived/` directory)

---

## 10. Test Coverage Goals

### 10.1 Minimum Coverage Requirements

**Per Standard:**
- FACTUAL: ≥5 tests per persona (30 tests total)
- RELATIONAL: ≥3 tests per persona (18 tests total)
- PROCEDURAL: ≥5 tests per persona (30 tests total)
- EXACT_MATCH: ≥2 tests per persona (12 tests total)
- SYNTHESIS: ≥2 tests per persona (12 tests total)

**Total per Standard:** ≥102 tests (across all knowledge types × personas)

**Realistic Goal:** 50-75 tests per major standard (GDPR, ISO 27001, SOC 2)

**Minor Standards:** ≥20 tests

### 10.2 Coverage Tracking

**Use coverage matrix:**

```
                  NOVICE  PRACTITIONER  MANAGER  AUDITOR  EXECUTIVE  DEVELOPER
FACTUAL             10         8           6        4         3          5
RELATIONAL           4         6           4        3         2          3
PROCEDURAL           8        12           8        5         3          8
EXACT_MATCH          2         4           2        5         1          2
SYNTHESIS            1         3           4        4         6          2
```

**Total:** 36 + 22 + 44 + 15 + 15 + 20 = **152 tests for this standard**

**Target Distribution:**
- NOVICE: 15-20% of tests
- PRACTITIONER: 30-35% of tests
- MANAGER: 15-20% of tests
- AUDITOR: 10-15% of tests
- EXECUTIVE: 10-15% of tests
- DEVELOPER: 10-15% of tests

---

## 11. Quality Criteria

### 11.1 Test Quality Checklist

**Before adding a test to the suite:**

- [ ] Question is realistic (something a user would actually ask)
- [ ] Question is unambiguous (clear intent)
- [ ] expectedTopics are specific and verifiable (not too generic)
- [ ] expectedTopics count is reasonable (3-5 ideal)
- [ ] Complexity is appropriate for persona and question type
- [ ] Standard/KnowledgeType/Persona classifications are correct
- [ ] Vendor field is set correctly ("Generic" or specific vendor)
- [ ] No duplicate or near-duplicate tests exist
- [ ] Test is maintainable (won't become outdated quickly)

### 11.2 Test Review Process

**For new standard additions:**
1. Initial batch (20-30 tests) reviewed by domain expert
2. Validate against actual standard documentation
3. Run against multiple LLMs to verify feasibility
4. Iterate based on results
5. Expand to full coverage (50-100 tests)

**For new vendor additions:**
1. Vendor provides documentation and example scenarios
2. Create initial test suite (20-30 tests)
3. Vendor validates tests reflect actual product usage
4. Run tests against vendor's recommended LLM configuration
5. Expand based on coverage needs

---

## 12. Cross-Reference

### Related Documents

- **DESIGN.md** - Overall system architecture and rationale
- **PROMPT-SCHEMA.md** - Formal schema for test prompts
- **compliance-standards.js** - Current standard definitions (source of truth)
- **user-personas.js** - Current persona definitions (source of truth)

### Code Files

- `enterprise/test-data-generator.js` - Generates tests from templates
- `enterprise/compliance-standards.js` - Standard metadata
- `enterprise/user-personas.js` - Persona metadata
- `reports/prompts/prompt-viewer.html` - Visualization and filtering

---

Questions: libor@arionetworks.com
