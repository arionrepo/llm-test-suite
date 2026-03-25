# LLM Test Suite - System Design

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/docs/DESIGN.md
**Description:** Comprehensive design documentation for LLM test prompts system
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-25

---

## 1. System Overview

### Purpose

The LLM Test Suite is a comprehensive testing framework for evaluating Large Language Model performance across compliance knowledge, application workflows, and operational scenarios. It supports:

- **Generic compliance testing** (vendor-agnostic)
- **Vendor-specific customizations** (e.g., ArionComply, Salesforce, AWS)
- **Multi-dimensional evaluation** (accuracy, speed, context handling, tool use)
- **Performance benchmarking** across multiple LLM providers

### Design Philosophy

**Scalability:**
- Support unlimited vendors/customers without code changes
- Dynamic taxonomy that can grow over time
- No hardcoded vendor assumptions

**Separation of Concerns:**
- Generic compliance knowledge separate from vendor implementations
- Test data separate from test runner logic
- Metrics separate from prompts

**Flexibility:**
- Support multiple retrieval strategies (RAG, vector DB, knowledge graph)
- Accommodate diverse user personas (novice to expert)
- Handle varying complexity levels

---

## 2. Architecture

### 2.1 Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Prompt Data                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Generic    │  │   Vendor A   │  │   Vendor B   │      │
│  │  Compliance  │  │    Custom    │  │    Custom    │      │
│  │    Tests     │  │    Tests     │  │    Tests     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Test Data Generator                        │
│  - Loads all test sources                                   │
│  - Applies taxonomy and metadata                            │
│  - Calculates complexity scores                             │
│  - Exports unified JSON/CSV                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Test Execution                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Enterprise   │  │   Pilot      │  │ Comprehensive│      │
│  │ Test Runner  │  │  Test Runner │  │  Test Suite  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Results & Analysis                         │
│  - JSON reports                                             │
│  - CSV exports                                              │
│  - Prompt viewer (HTML)                                     │
│  - Performance dashboards                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Taxonomy Hierarchy

**Three-Level Classification System:**

```
Level 1: Compliance Standard (29 standards)
  ├─ GDPR
  ├─ ISO 27001
  ├─ SOC 2
  ├─ HIPAA
  └─ ... (25 more)
      │
      └─ Level 2: Knowledge Type (5 types)
            ├─ FACTUAL: Definitions, requirements, facts
            ├─ RELATIONAL: Cross-references, dependencies
            ├─ PROCEDURAL: Step-by-step workflows
            ├─ EXACT_MATCH: Precise citations
            └─ SYNTHESIS: Multi-document comparison
                │
                └─ Level 3: User Persona (6 personas)
                      ├─ NOVICE: New to compliance
                      ├─ PRACTITIONER: Technical implementer
                      ├─ MANAGER: Strategic oversight
                      ├─ AUDITOR: Verification-focused
                      ├─ EXECUTIVE: Business-focused
                      └─ DEVELOPER: Code-focused
```

**Orthogonal Classification: Vendor**

```
Vendor (vendor-agnostic or vendor-specific)
  ├─ Generic: Vendor-agnostic compliance knowledge
  ├─ ArionComply: ArionComply platform-specific tests
  ├─ Salesforce: Salesforce compliance features
  ├─ AWS: AWS compliance services
  └─ ... (extensible)
```

**Why This Structure?**

- **Standard** determines domain knowledge (GDPR vs SOC 2)
- **Knowledge Type** determines cognitive task (memorization vs synthesis)
- **Persona** determines expected expertise level and response style
- **Vendor** determines whether test applies universally or to specific platform

This creates a 4-dimensional matrix:
`[Standard] × [Knowledge Type] × [Persona] × [Vendor]`

Example: `GDPR × PROCEDURAL × PRACTITIONER × ArionComply`
= "How do I configure GDPR data retention in ArionComply?"

---

## 3. Vendor/Customer Handling Strategy

### 3.1 Design Principles

**Vendor Independence:**
- Generic compliance tests are vendor-agnostic
- Vendor-specific tests augment, don't replace, generic tests
- Same schema for both generic and vendor-specific prompts

**Namespace Strategy:**
- Use `vendor` field for namespace separation
- `vendor: "Generic"` for vendor-agnostic tests
- `vendor: "VendorName"` for vendor-specific tests

**Comparison & Benchmarking:**
- Enable side-by-side comparison: Generic vs Vendor-specific performance
- Track whether vendor customization improves accuracy
- Measure value-add of vendor-specific training

### 3.2 Vendor Field Values

**Reserved Values:**
- `"Generic"` - Vendor-agnostic compliance knowledge
- `null` - Legacy, treat as Generic (for backward compatibility)

**Vendor-Specific Values:**
- `"ArionComply"` - ArionComply platform tests
- `"Salesforce"` - Salesforce compliance cloud tests
- `"AWS"` - AWS compliance services tests
- Custom vendor names as needed

**Naming Convention:**
- PascalCase (e.g., `"ArionComply"`, not `"arioncomply"`)
- Use official brand name
- No abbreviations unless standard (e.g., "AWS" is acceptable)

### 3.3 Test Organization by Vendor

**Directory Structure:**

```
enterprise/
├── test-data-generator.js          # Generic compliance tests (vendor: "Generic")
├── compliance-standards.js         # Standard taxonomy
├── user-personas.js               # Persona definitions
├── arioncomply-workflows/         # ArionComply-specific tests
│   ├── ui-tasks.js               # (vendor: "ArionComply")
│   ├── ai-backend-multi-tier-tests.js
│   ├── intent-classification-tests.js
│   └── next-action-tests.js
├── salesforce-compliance/         # Future: Salesforce tests
└── aws-compliance-tests/          # Future: AWS tests
```

### 3.4 Vendor Statistics & Comparison

**Stats Display Requirements:**

1. **Overall Stats:**
   - Total prompts: 173
   - Generic: 52
   - ArionComply: 121
   - Other vendors: 0

2. **Category Breakdown:**
   - Compliance Knowledge: 52 (Generic: 52, ArionComply: 0)
   - ArionComply Workflows: 31 (Generic: 0, ArionComply: 31)
   - AI Backend Multi-Tier: 50 (Generic: 0, ArionComply: 50)
   - Intent Classification: 10 (Generic: 0, ArionComply: 10)
   - Workflow Understanding: 30 (Generic: 0, ArionComply: 30)

3. **Vendor Comparison View:**
   ```
   Test Type                   Generic    ArionComply    Delta
   ─────────────────────────────────────────────────────────────
   GDPR Factual               10          5             +5
   ISO 27001 Procedural       8           12            -4
   Assessment Workflows       0           15            -15
   ```

**Filtering Requirements:**
- Filter by vendor: Show only Generic OR only ArionComply OR All
- Combined filters: Vendor + Standard + KnowledgeType + Persona
- Enable comparison mode: Side-by-side Generic vs Vendor

---

## 4. ArionComply TIER System

### 4.1 Overview

ArionComply uses a multi-tier prompt construction system that combines:
- **TIER 1:** Base system identity (always included)
- **TIER 2:** Situation-specific expertise (one selected)
- **TIER 3:** Organization context (customer-specific)
- **TIER 4:** AI-powered suggestions (optional)

### 4.2 TIER Definitions

**TIER 1: Base System Prompt**
- Purpose: Core ArionComply AI identity and capabilities
- Priority: 100 (highest)
- Selection: ALL tier 1 prompts concatenated
- Size: ~7,500 characters (~1,875 tokens)
- Components:
  - `base-system.md` - Core identity
  - `assessment-answer-parser.md` - JSON extraction
  - `assessment-conversation-guide.md` - Friendly tone
  - `clarification-instructions.md` - When to ask questions

**TIER 2: Situational Context**
- Purpose: Framework expertise or operational mode
- Priority: 70-90
- Selection: ONE tier 2 prompt chosen dynamically
- Size: ~4,000-62,000 characters (~1,000-15,500 tokens)
- Selection Logic (priority order):
  1. Assessment mode → `modes/assessment.md`
  2. Framework hint → `frameworks/{framework}.md`
  3. Value keywords → `product/value-proposition.md`
  4. Product keywords → `product/arioncomply-guide.md`
  5. General fallback → `modes/general.md`

**TIER 3: Context Enrichment**
- Purpose: Organization-specific personalization
- Priority: 50-60
- Selection: Conditional (if org profile available)
- Size: ~350 characters (~90 tokens)
- Template: `org-profile-context.md`
- Variables:
  - `{industry}` - Healthcare, Finance, Technology, etc.
  - `{org_size}` - 1-50, 51-250, 251-1000, 1000+
  - `{region}` - EU, US, UK, Global
  - `{frameworks}` - Licensed frameworks (GDPR, ISO 27001, etc.)
  - `{maturity_level}` - Initial, Developing, Defined, Managed, Optimizing

**TIER 4: AI-Powered Suggestions**
- Purpose: Suggest 5 follow-up actions
- Priority: Enhancement
- Selection: Optional (feature flag controlled)
- Size: ~500 characters (~125 tokens)
- Generated dynamically by `PromptBuilder.buildSuggestionsPrompt()`

### 4.3 Intent Classification System

**23 Intent Categories:**

**Core Intents:**
- `general_question` - Broad compliance questions
- `assessment` - Gap assessment workflows
- `implementation` - Control implementation guidance
- `documentation` - Documentation requirements
- `audit_preparation` - Audit readiness

**Framework-Specific Intents:**
- `gdpr_guidance` - GDPR-specific questions
- `iso27001_guidance` - ISO 27001-specific questions
- `soc2_guidance` - SOC 2-specific questions
- `euai_guidance` - EU AI Act-specific questions

**Feature-Specific Intents:**
- `evidence_management` - Evidence upload/organization
- `risk_management` - Risk assessment and treatment
- `policy_management` - Policy creation and maintenance
- `vendor_management` - Third-party risk assessment
- `incident_management` - Incident response
- `ai_governance` - AI system governance

**Data Operations Intents:**
- `data_subject_request` - GDPR data subject rights
- `privacy_operations` - Privacy program operations
- `data_classification` - Data categorization

**Reporting Intents:**
- `compliance_reporting` - Generate compliance reports
- `dashboard_navigation` - UI navigation help
- `report_generation` - Report creation

**Clarification Intents:**
- `needs_clarification` - Ambiguous request
- `needs_context` - Missing required context

### 4.4 Database Integration

**ArionComply Platform Tables:**

1. **`prompt_templates`** table:
   - Stores TIER 1, 2, 3 prompts
   - Fields: `id`, `tier`, `name`, `priority`, `content`, `variables`
   - Maps to test prompts via `tier2Mode` field

2. **`test_settings`** table:
   - Stores configuration per org/user
   - Fields: `retrieval_bypass_config`, `llm_routing_config`, `ai_backend_config`
   - Determines which LLM and retrieval strategy to use

3. **`organizations`** table:
   - Stores org profile for TIER 3 context
   - Fields: `org_id`, `org_settings` (JSONB with industry, size, region, etc.)

**Test Prompt Alignment:**
- Test prompts in llm-test-suite mirror production prompt construction
- `tier2Mode` field maps to TIER 2 prompt selection
- `orgProfile` field provides TIER 3 context variables
- Enables realistic testing of production prompt behavior

---

## 5. File Organization Principles

### 5.1 Directory Structure

**Current Organization:**

```
llm-test-suite/
├── README.md
├── docs/                          # Design documentation
│   ├── DESIGN.md
│   ├── PROMPT-SCHEMA.md
│   └── TAXONOMY-GUIDE.md
├── enterprise/                    # Enterprise test data
│   ├── test-data-generator.js   # Generic compliance (vendor: "Generic")
│   ├── compliance-standards.js  # Standard metadata
│   ├── user-personas.js        # Persona definitions
│   ├── enterprise-test-runner.js
│   └── arioncomply-workflows/  # ArionComply-specific (vendor: "ArionComply")
│       ├── ui-tasks.js
│       ├── ai-backend-multi-tier-tests.js
│       ├── intent-classification-tests.js
│       └── next-action-tests.js
├── reports/                      # Generated outputs
│   ├── prompts/
│   │   ├── prompt-viewer.html
│   │   ├── compliance-prompts.md
│   │   └── arioncomply-prompts.md
│   └── test-results-*.json
└── analysis-dashboard.html      # Results visualization
```

### 5.2 Naming Conventions

**File Naming:**
- Kebab-case for files: `ai-backend-multi-tier-tests.js`
- Descriptive names indicating content: `intent-classification-tests.js`
- Group related files in vendor directories: `arioncomply-workflows/`

**Test ID Naming:**
- Format: `{VENDOR}_{STANDARD}_{KNOWLEDGETYPE}_{PERSONA}_{INDEX}`
- Examples:
  - Generic: `GDPR_FACTUAL_NOVICE_1`
  - Vendor: `ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1`
- Vendor prefix optional for Generic tests
- Vendor prefix required for vendor-specific tests

**Constant Naming:**
- PascalCase for exported objects: `AI_BACKEND_MULTI_TIER_TESTS`
- SCREAMING_SNAKE_CASE for individual tests: `ASSESSMENT_START_GDPR_NOVICE_1`

### 5.3 Scalability Strategy

**Adding New Vendors:**

1. Create vendor directory: `enterprise/{vendor-name}-tests/`
2. Create test files following existing patterns
3. Use `vendor: "VendorName"` in all test objects
4. Export tests for consumption by test-data-generator.js
5. No changes needed to viewer or test runner (dynamic)

**Adding New Standards:**

1. Add standard to `compliance-standards.js`
2. Define metadata (category, jurisdiction, keyTopics, retrievalNeeds)
3. Generate prompts using test-data-generator.js
4. Standard appears automatically in viewer filters

**Adding New Personas:**

1. Add persona to `user-personas.js`
2. Define characteristics (expertise, queryStyle, expectedBehavior)
3. Generate prompts for new persona
4. Persona appears automatically in viewer filters

---

## 6. Integration Patterns

### 6.1 Test Runner Integration

**Test Execution Flow:**

```
1. Load test data (JSON/JS)
   ↓
2. Filter tests (vendor, standard, persona, complexity)
   ↓
3. For each test:
   a. Construct prompt (TIER 1+2+3+4 if ArionComply)
   b. Send to LLM API
   c. Capture response
   d. Evaluate against expectedTopics/expectedBehavior
   ↓
4. Generate report (JSON, CSV, HTML)
```

### 6.2 Viewer Integration

**Data Flow:**

```
Test Data (JS files)
   ↓
test-data-generator.js (generates unified JSON)
   ↓
prompt-viewer.html (embedded JSON const)
   ↓
User filters (vendor, standard, persona, etc.)
   ↓
Filtered display
```

**Viewer Requirements:**
- Display all test prompts with metadata
- Filter by: vendor, category, standard, knowledge type, persona, complexity
- Search by question text
- Show vendor statistics and comparison
- No vendor-specific UI hardcoding (dynamic from data)

### 6.3 ArionComply Database Sync

**Sync Strategy:**

- Test prompts in llm-test-suite are **test data**
- ArionComply `prompt_templates` table stores **production prompts**
- Keep separate but aligned:
  - Test: Validates prompt construction logic
  - Production: Serves actual customer requests
- Sync process:
  1. Update production prompts in database
  2. Mirror changes in test prompt TIER content
  3. Run tests to validate behavior

---

## 7. Design Rationale

### 7.1 Why 3-Level Taxonomy?

**Standard → KnowledgeType → Persona** creates comprehensive coverage:

- **Standard** (29 options): Broad domain coverage
- **KnowledgeType** (5 options): Cognitive task diversity
- **Persona** (6 options): Expertise level variation

**Total combinations:** 29 × 5 × 6 = **870 potential test scenarios**

Manageable without requiring all combinations (selective coverage based on importance).

### 7.2 Why Separate Vendor Field?

**Alternatives Considered:**

1. **Category namespace:** `arioncomply_workflow` (REJECTED)
   - Couples vendor to category
   - Can't have generic + vendor tests in same category
   - Not flexible

2. **Directory-only separation:** (REJECTED)
   - File organization isn't data taxonomy
   - Viewer can't filter without parsing paths
   - Tight coupling to file structure

3. **Separate vendor metadata field:** (CHOSEN)
   - Orthogonal to existing taxonomy
   - Enables filtering and comparison
   - Scales to unlimited vendors
   - No code changes for new vendors

### 7.3 Why TIER System for ArionComply?

**Problem:** Static prompts can't adapt to different user contexts

**Solution:** Multi-tier dynamic assembly

- TIER 1: Consistent identity across all requests
- TIER 2: Adapt to request type (assessment vs implementation)
- TIER 3: Personalize to organization profile
- TIER 4: Enhance with contextual suggestions

**Benefits:**
- Better accuracy (relevant expertise injected)
- Better UX (personalized guidance)
- Efficient token usage (only relevant context included)

---

## 8. Future Extensibility

### 8.1 Planned Extensions

**Additional Vendors:**
- Salesforce Compliance Cloud
- AWS Audit Manager
- Azure Compliance Manager
- ServiceNow GRC

**Additional Standards:**
- NIST 800-53 (rev 5)
- CIS Controls v8
- ISO 42001 (AI Management)
- State privacy laws (VCDPA, CPA, CTDPA)

**Additional Personas:**
- Data Protection Officer (DPO)
- Chief Information Security Officer (CISO)
- Legal Counsel
- Privacy Engineer

### 8.2 Backward Compatibility

**Schema Versioning:**
- Version field in metadata: `"version": "2.1.0"`
- Major version change: Breaking schema changes
- Minor version: New optional fields
- Patch version: Clarifications, no schema change

**Migration Strategy:**
- Old tests without `vendor` field: Treat as `vendor: "Generic"`
- New required fields: Provide defaults in test-data-generator
- Deprecated fields: Keep for 2 major versions before removal

---

## 9. Success Metrics

**Test Suite Health:**
- Coverage: % of [Standard × KnowledgeType × Persona] combinations tested
- Vendor balance: Ratio of Generic to Vendor-specific tests
- Taxonomy growth: New standards/personas added per quarter

**Test Quality:**
- Prompt clarity: Avg characters per question
- Expected topics: Avg topics per test (target: 3-5)
- Complexity distribution: % beginner/intermediate/advanced

**Platform Value:**
- Vendor adoption: Number of vendors with custom tests
- Comparison insights: Generic vs Vendor accuracy delta
- Execution frequency: Tests run per week

---

## 10. References

**Related Documentation:**
- PROMPT-SCHEMA.md - Formal schema specification
- TAXONOMY-GUIDE.md - Guidelines for extending taxonomy
- METRICS-DOCUMENTATION.md - Complexity scoring system
- README.md - Quick start and overview

**Code References:**
- `enterprise/test-data-generator.js` - Test generation logic
- `enterprise/arioncomply-workflows/prompt-schema-aligned.js` - TIER system implementation
- `reports/prompts/prompt-viewer.html` - Test visualization

---

Questions: libor@arionetworks.com
