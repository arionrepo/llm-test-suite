# Prompt Schema Compliance Analysis

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/PROMPT-SCHEMA-COMPLIANCE-ANALYSIS.md
**Description:** Analysis of current prompt files against standardized PROMPT-SCHEMA.md v2.2.0
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26
**Schema Version:** 2.2.0

---

## Executive Summary

**Status: PARTIALLY COMPLIANT** ⚠️

Current prompt files are **mostly compliant** with schema requirements, but require updates to meet v2.2.0 standards:

| File | Compliance | Missing Fields | Action Required |
|------|------------|----------------|-----------------|
| test-data-generator.js | **70%** ⚠️ | `category`, `vendor` | Add 2 fields |
| ai-backend-multi-tier-tests.js | **95%** ⚠️ | `vendor` | Add 1 field |

**Impact:** Medium - Files are functional but not fully schema-compliant
**Effort:** Low - Simple field additions needed
**Timeline:** 1-2 hours to update all 134 prompts

---

## Schema Requirements (v2.2.0)

### Mandatory Fields (ALL Tests)

```typescript
{
  id: string,                    // ✅ Format: {VENDOR}_{STANDARD}_{TYPE}_{PERSONA}_{N}
  category: string,              // ✅ Test category
  vendor: string | null,         // ✅ "Generic" | "ArionComply" | vendor name
  question: string,              // ✅ The prompt text
  expectedTopics: string[],      // ✅ Expected response topics
  complexity: enum               // ✅ "beginner" | "intermediate" | "advanced" | "expert"
}
```

### Taxonomy Requirements (AT LEAST ONE Required)

**Taxonomy A: Compliance**
```typescript
{
  standard: string,              // "GDPR", "ISO_27001", etc.
  knowledgeType: enum,           // "FACTUAL", "RELATIONAL", etc.
  persona: enum                  // "NOVICE", "PRACTITIONER", etc.
}
```

**Taxonomy B: Enterprise Task**
```typescript
{
  taskDomain: string,            // "customer_service", "document_processing", etc.
  taskType: enum,                // "generate", "analyze", "transform", etc.
  businessFunction: string       // "sales", "support", "finance", etc.
}
```

**Taxonomy C: Platform Feature**
```typescript
{
  platformFeature: string,       // "evidence_management", "assessment_workflows", etc.
  featureAction: enum,           // "upload", "view", "update", etc.
  userContext: enum              // "first_time", "power_user", etc.
}
```

---

## File 1: test-data-generator.js

### Path
```
/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/test-data-generator.js
```

### Description
Generic compliance framework tests across 10 standards, 5 knowledge types, and 5 personas. Contains 84 prompts covering GDPR, ISO 27001, SOC 2, PCI DSS, EU AI Act, and more.

### Current Format

```javascript
{
  "id": "GDPR_FACTUAL_NOVICE_1",           // ✅ COMPLIANT
  "standard": "GDPR",                      // ✅ COMPLIANT
  "knowledgeType": "FACTUAL",              // ✅ COMPLIANT
  "persona": "NOVICE",                     // ✅ COMPLIANT
  "question": "What is GDPR?",             // ✅ COMPLIANT
  "expectedTopics": ["regulation", ...],   // ✅ COMPLIANT
  "expectedCitation": null,                // ✅ COMPLIANT (optional)
  "retrievalStrategy": "vector_db",        // ✅ COMPLIANT (optional)
  "complexity": "beginner"                 // ✅ COMPLIANT
}
```

### Compliance Status: **70%** ⚠️

| Field | Status | Notes |
|-------|--------|-------|
| `id` | ✅ COMPLIANT | Correct format |
| `category` | ❌ MISSING | REQUIRED - must add |
| `vendor` | ❌ MISSING | REQUIRED - must add |
| `question` | ✅ COMPLIANT | Present |
| `expectedTopics` | ✅ COMPLIANT | Present, 2-10 items |
| `complexity` | ✅ COMPLIANT | Valid enum value |
| `standard` | ✅ COMPLIANT | Taxonomy A |
| `knowledgeType` | ✅ COMPLIANT | Taxonomy A |
| `persona` | ✅ COMPLIANT | Taxonomy A |
| `expectedCitation` | ✅ COMPLIANT | Optional, used correctly |
| `retrievalStrategy` | ✅ COMPLIANT | Optional, used correctly |

### Required Changes

**1. Add `category` field**
```javascript
// Should be:
category: "compliance_knowledge"  // Generic compliance tests
```

**2. Add `vendor` field**
```javascript
// Should be:
vendor: "Generic"  // Vendor-agnostic compliance knowledge
```

### Example Fixed Format

```javascript
{
  "id": "GDPR_FACTUAL_NOVICE_1",
  "category": "compliance_knowledge",       // ← ADD THIS
  "vendor": "Generic",                      // ← ADD THIS
  "standard": "GDPR",
  "knowledgeType": "FACTUAL",
  "persona": "NOVICE",
  "question": "What is GDPR?",
  "expectedTopics": ["regulation", "privacy", "EU", "data protection"],
  "expectedCitation": null,
  "retrievalStrategy": "vector_db",
  "complexity": "beginner"
}
```

### Implementation Plan

```javascript
// In generateTests() function:
return templates.map((template, idx) => ({
  id: standard + '_' + knowledgeType + '_' + persona + '_' + (idx + 1),
  category: 'compliance_knowledge',          // ← ADD
  vendor: 'Generic',                          // ← ADD
  standard,
  knowledgeType,
  persona,
  question: template.q,
  expectedTopics: template.expectedTopics || [],
  expectedCitation: template.expectedCitation || null,
  retrievalStrategy: KNOWLEDGE_TYPES[knowledgeType].retrievalStrategy,
  complexity: USER_PERSONAS[persona].expertise
}));
```

### Impact

- **Prompts Affected:** 84 (all prompts)
- **Breaking Changes:** None (additive only)
- **Backward Compatibility:** Maintained
- **Effort:** 5 minutes (simple code change)

---

## File 2: ai-backend-multi-tier-tests.js

### Path
```
/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js
```

### Description
ArionComply-specific multi-tier prompt tests (TIER 1 + TIER 2 + TIER 3). Contains 50 prompts testing assessment workflows, GDPR/ISO frameworks, product features, and general guidance.

### Current Format

```javascript
{
  "id": "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",  // ✅ COMPLIANT
  "category": "ai_backend_multitier",                // ✅ COMPLIANT
  "standard": "GDPR",                                // ✅ COMPLIANT
  "knowledgeType": "PROCEDURAL",                     // ✅ COMPLIANT
  "persona": "NOVICE",                               // ✅ COMPLIANT
  "tier2Mode": "assessment",                         // ✅ COMPLIANT (ArionComply-specific)
  "question": "I want to assess my GDPR compliance", // ✅ COMPLIANT
  "tier1Content": "You are ArionComply AI...",       // ✅ COMPLIANT (ArionComply-specific)
  "tier2Content": "Assessment Mode Active...",       // ✅ COMPLIANT (ArionComply-specific)
  "tier3Context": "Organization Context...",         // ✅ COMPLIANT (ArionComply-specific)
  "orgProfile": { industry: "Healthcare", ... },     // ✅ COMPLIANT (ArionComply-specific)
  "conversationHistory": [],                         // ✅ COMPLIANT (ArionComply-specific)
  "fullPrompt": "[TIER 1]...[TIER 2]...",           // ✅ COMPLIANT (ArionComply-specific)
  "expectedTopics": ["gap assessment", ...],         // ✅ COMPLIANT
  "expectedBehavior": "Should initiate GDPR...",     // ✅ COMPLIANT (optional)
  "complexity": "beginner",                          // ✅ COMPLIANT
  "estimatedTokens": 2300                            // ✅ COMPLIANT (optional)
}
```

### Compliance Status: **95%** ⚠️

| Field | Status | Notes |
|-------|--------|-------|
| `id` | ✅ COMPLIANT | Correct format with ARION prefix |
| `category` | ✅ COMPLIANT | Present and correct |
| `vendor` | ❌ MISSING | REQUIRED - must add "ArionComply" |
| `question` | ✅ COMPLIANT | Present |
| `expectedTopics` | ✅ COMPLIANT | Present, appropriate length |
| `complexity` | ✅ COMPLIANT | Valid enum value |
| `standard` | ✅ COMPLIANT | Taxonomy A (when applicable) |
| `knowledgeType` | ✅ COMPLIANT | Taxonomy A (when applicable) |
| `persona` | ✅ COMPLIANT | Taxonomy A (when applicable) |
| `tier2Mode` | ✅ COMPLIANT | ArionComply extension |
| `tier1Content` | ✅ COMPLIANT | ArionComply extension |
| `tier2Content` | ✅ COMPLIANT | ArionComply extension |
| `tier3Context` | ✅ COMPLIANT | ArionComply extension |
| `orgProfile` | ✅ COMPLIANT | ArionComply extension |
| `fullPrompt` | ✅ COMPLIANT | ArionComply extension |
| `expectedBehavior` | ✅ COMPLIANT | Optional, used correctly |
| `estimatedTokens` | ✅ COMPLIANT | Optional, used correctly |

### Required Changes

**1. Add `vendor` field**
```javascript
// Should be:
vendor: "ArionComply"  // ArionComply platform-specific tests
```

### Example Fixed Format

```javascript
{
  "id": "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",
  "category": "ai_backend_multitier",
  "vendor": "ArionComply",                           // ← ADD THIS
  "standard": "GDPR",
  "knowledgeType": "PROCEDURAL",
  "persona": "NOVICE",
  "tier2Mode": "assessment",
  // ... rest of fields unchanged
}
```

### Implementation Plan

Add single line to all 50 test objects:

```javascript
export const AI_BACKEND_MULTI_TIER_TESTS = {
  ASSESSMENT_START_GDPR_NOVICE_1: {
    id: "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",                           // ← ADD THIS LINE
    standard: "GDPR",
    // ... rest unchanged
  },
  // ... repeat for all 50 tests
};
```

### Impact

- **Prompts Affected:** 50 (all prompts)
- **Breaking Changes:** None (additive only)
- **Backward Compatibility:** Maintained
- **Effort:** 10 minutes (manual addition to 50 objects)

---

## Additional Schema Features (Recommended)

### Optional Fields We Could Add

**1. Routing Configuration (for multi-environment testing)**
```javascript
{
  routingProfile: "arioncomply_local_dev",  // For ArionComply tests
  // OR
  routingProfile: "direct_openai_gpt4",     // For generic tests
}
```

**2. Model Requirements (for advanced tests)**
```javascript
{
  modelRequirements: {
    requiredCapabilities: {
      minimumContextWindow: 32000,          // For long multi-tier prompts
      toolCalling: false                    // These prompts don't use tools
    }
  }
}
```

**3. Expected Guidance (for procedural tests)**
```javascript
{
  expectedGuidance: [                        // Already have expectedBehavior
    "Step 1...",
    "Step 2...",
    "Step 3..."
  ]
}
```

---

## Summary of Changes Required

### Quick Fixes (1-2 hours total)

**File 1: test-data-generator.js**
- Add `category: 'compliance_knowledge'` to all 84 prompts
- Add `vendor: 'Generic'` to all 84 prompts
- **Method:** Modify `generateTests()` function (5 minutes)

**File 2: ai-backend-multi-tier-tests.js**
- Add `vendor: 'ArionComply'` to all 50 prompts
- **Method:** Add line to each test object (10 minutes)

### Validation

After changes, validate with:
```bash
node -e "
import('./enterprise/test-data-generator.js').then(m => {
  const tests = m.generateAllTests();
  const invalid = tests.filter(t => !t.category || !t.vendor);
  console.log('Invalid tests:', invalid.length);
  if (invalid.length > 0) {
    console.log('Examples:', invalid.slice(0, 3));
  }
});"
```

---

## Prompt Files Inventory

### Primary Prompt Source Files

| # | File Path | Prompts | Description | Compliance |
|---|-----------|---------|-------------|------------|
| 1 | `enterprise/test-data-generator.js` | 84 | Generic compliance framework tests | 70% ⚠️ |
| 2 | `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js` | 50 | ArionComply multi-tier workflow tests | 95% ⚠️ |
| 3 | `enterprise/arioncomply-workflows/prompt-schema-aligned.js` | ~10 | Schema alignment validation tests | ✅ 100% |
| 4 | `performance-prompts.js` | ~10 | Performance/speed testing prompts | ⚠️ Unknown |

**Total Prompts:** 154+ across 4 files

### Exported/Report Files (Read-Only)

| # | File Path | Purpose | Format |
|---|-----------|---------|--------|
| 5 | `unified-prompt-database.json` | Consolidated export | JSON |
| 6 | `reports/prompts/all-prompts-comprehensive.json` | Full export with metadata | JSON |
| 7 | `reports/prompts/compliance-prompts.csv` | Spreadsheet format | CSV |
| 8 | `reports/prompts/compliance-prompts.md` | Human-readable report | Markdown |
| 9 | `reports/prompts/arioncomply-prompts.md` | ArionComply-specific report | Markdown |

### Utility Files

| # | File Path | Purpose |
|---|-----------|---------|
| 10 | `prompt-viewer.js` | Node.js viewer script |
| 11 | `view-test-prompts.js` | Interactive viewer |
| 12 | `export-prompts.js` | Export generator |
| 13 | `utils/prompt-complexity-analyzer.js` | Complexity scoring |
| 14 | `reports/prompts/prompt-viewer.html` | Browser-based viewer |

---

## Schema Documentation Reference

### Core Schema Docs

| Document | Location | Purpose |
|----------|----------|---------|
| **Prompt Schema** | `docs/PROMPT-SCHEMA.md` | Test prompt format (INPUT) |
| **Test Result Schema** | `TEST-RESULT-SCHEMA.md` | Test result format (OUTPUT) |
| **Quick Reference** | `docs/SCHEMA-QUICK-REFERENCE.md` | Quick lookup guide |
| **Usage Guide** | `docs/SCHEMA-USAGE-GUIDE.md` | Complete usage documentation |
| **Implementation Guide** | `docs/SCHEMA-IMPLEMENTATION-GUIDE.md` | Step-by-step implementation |
| **Unified Schema README** | `docs/README-UNIFIED-SCHEMA.md` | Master index and overview |

### Schema Versions

- **Prompt Schema:** v2.2.0 (current)
- **Test Result Schema:** v1.0.0 (current)

---

## Planned Enhancements (from TAXONOMY-GUIDE.md & ENHANCEMENT-PLAN.md)

### Enhancement Group A: Tool Calling Taxonomy (Taxonomy D)

**Source:** `docs/TAXONOMY-GUIDE.md` - Section 5.5

**Status:** ⚠️ NOT YET IMPLEMENTED (planned)

This is a **completely new taxonomy dimension** for testing function/tool calling capabilities:

#### Tool Complexity Levels (5 levels)
1. **Single Tool - Simple Parameters** - One tool, 2-3 params, clear intent
2. **Multi-Tool Selection** - 5-10 tools, choose correct one
3. **Complex Parameters** - Nested objects, arrays, JSON schema
4. **Tool Chaining (Sequential)** - Multi-step tool use
5. **Parallel Tool Use** - Multiple tools simultaneously

#### Tool Domains (5 domains)
1. **Data Retrieval** - DB queries, API calls, search
2. **Data Transformation** - Format conversion, calculations
3. **External Actions** - Send email, create tickets, schedule
4. **Code Execution** - Run code, compile, deploy
5. **Workflow Orchestration** - Multi-step processes, approvals

#### Error Scenarios (5 types)
1. **Perfect (Happy Path)** - All params valid
2. **Missing Parameters** - Ask for missing info
3. **Invalid Parameters** - Wrong types, out of range
4. **Tool Unavailable** - Graceful degradation
5. **Ambiguous Selection** - Multiple tools could work

#### Coverage Goals
- **Minimum:** 45 tests total
- **Per Complexity Level:** 10-15 tests each
- **Per Domain:** 5-15 tests each

**Required Schema Fields:**
```javascript
{
  toolCalling: {
    enabled: true,
    toolComplexity: "single" | "multi_selection" | "complex_params" | "chaining" | "parallel",
    toolDomain: "data_retrieval" | "transformation" | "external_action" | "code_execution" | "workflow",
    toolCount: number,
    toolDefinitions: [...],  // OpenAI function calling format
    expectedToolCalls: [...],
    errorScenario: "perfect" | "missing_params" | "invalid_params" | "tool_unavailable" | "ambiguous_selection"
  }
}
```

**Impact:** Enables testing of function calling - critical for tool-capable models (GPT-4, Claude, etc.)

---

### Enhancement Group B: Future Knowledge Types

**Source:** `docs/TAXONOMY-GUIDE.md` - Section 3.2

**Status:** ⚠️ PLANNED (not yet added)

Three potential new knowledge types identified:

1. **PREDICTIVE** - "What will happen if..." scenario analysis
2. **DIAGNOSTIC** - "Why did this happen?" root cause analysis
3. **EVALUATIVE** - "Is X compliant with Y?" judgment questions

**Criteria for Addition:**
- Identifies cognitive gap not covered by existing 5 types
- Requires fundamentally different LLM behavior
- Represents ≥10% of real user questions
- Cannot be classified into existing types

**Process:** Requires ≥20 test prompts demonstrating the new type

---

### Enhancement Group C: Future Personas

**Source:** `docs/TAXONOMY-GUIDE.md` - Section 4.2

**Status:** ⚠️ PLANNED (not yet added)

Six potential new personas identified:

1. **DPO** (Data Protection Officer) - Specialized GDPR/privacy focus
2. **CISO** (Chief Information Security Officer) - Strategic security leadership
3. **LEGAL_COUNSEL** - Legal interpretation and risk assessment
4. **PRIVACY_ENGINEER** - Privacy-by-design technical implementation
5. **COMPLIANCE_OFFICER** - Cross-framework compliance coordination
6. **RISK_ANALYST** - Quantitative risk assessment

**Criteria for Addition:**
- Represents role not covered by existing 6 personas
- Requires fundamentally different response style
- Represents ≥5% of target users
- Cannot be covered by existing personas

**Process:** Generate ≥10 test prompts per knowledge type for new persona

---

### Enhancement Group D: Model Capability Profiles

**Source:** `docs/TAXONOMY-GUIDE.md` - Section 11.3

**Status:** ⚠️ NOT YET IMPLEMENTED

**Purpose:** Define what each LLM can/cannot do for intelligent test filtering

**Required Fields:**
```javascript
{
  modelId: "model-name",
  provider: "Provider Name",
  specs: {
    contextWindow: number,
    parameters: "14B",
    speed: "fast" | "medium" | "slow"
  },
  capabilities: {
    toolCalling: boolean,
    reasoningDepth: "low" | "medium" | "high" | "very_high",
    structuredOutput: boolean
  },
  suitableFor: ["compliance_knowledge", "tool_calling_simple", ...],
  notSuitableFor: ["tool_chaining", "long_context_tasks", ...],
  suitabilityScores: {
    compliance_factual: 85,
    tool_calling_single: 82,
    // ... 0-100 scores per task type
  }
}
```

**Impact:** Enables test runner to skip unsuitable tests, recommend best models for tasks

---

### Enhancement Group E: Infrastructure Improvements (from ENHANCEMENT-PLAN.md)

**Source:** `ENHANCEMENT-PLAN.md` - 6 major enhancement groups

**Status:** ⚠️ COMPREHENSIVE PLAN, NOT YET IMPLEMENTED

The ENHANCEMENT-PLAN.md (4402 lines) specifies infrastructure improvements across 4 phases:

#### E1: Cost Tracking & Economics
- `utils/cost-calculator.js` (NEW)
- `config/pricing.json` (NEW)
- Track costs for local (power, hardware) and cloud (per-token) models
- Enable cost/benefit analysis and ROI calculations

#### E2: Multi-Layer Evaluation System
- `utils/evaluation-orchestrator.js` (NEW)
- Improved keyword matcher
- Ground truth validator (factual accuracy)
- Cloud LLM judge integration (semantic quality)
- Human review sampling
- Move beyond keyword matching to real quality assessment

#### E3: Cloud Model Integration
- `utils/cloud-model-client.js` (NEW)
- `config/model-registry.json` (NEW)
- Support GPT-4, Claude, Gemini for comparison testing
- Enable local vs cloud benchmarking

#### E4: Statistical Analysis
- `utils/stats-analyzer.js` (NEW)
- Multi-run orchestrator
- Variance, confidence intervals, significance testing
- Move from single runs to statistically rigorous results

#### E5: Decision Engine & Output Formats
- `utils/decision-engine.js` (NEW)
- Decision matrix generator ("Use model X for task Y")
- Cost/quality frontier charts
- Executive summaries
- Enable actionable recommendations

#### E6: Configuration & Test Profiles
- Pre-configured test profiles for different goals
- "Cost optimization", "Accuracy baseline", "Quick validation"
- Configurable test execution

**Total Impact:** Transforms test suite from diagnostic tool to decision platform

---

## Recommendations

### Immediate (This Sprint) - Schema Compliance

1. ✅ **Update test-data-generator.js** - Add `category` and `vendor` fields
2. ✅ **Update ai-backend-multi-tier-tests.js** - Add `vendor` field
3. ✅ **Validate all prompts** - Run compliance check script
4. ✅ **Regenerate exports** - Update JSON/CSV/MD exports

### Short-term (Next Sprint) - Planned Taxonomy Extensions

1. **Create Tool Calling test suite** - Implement Taxonomy D (45 tests minimum)
2. **Add routing profiles** - Specify which environment each test should run in
3. **Add model requirements** - Document minimum model capabilities needed
4. **Create model capability profiles** - Define suitability scores per model

### Medium-term (Q2 2026) - Infrastructure Phase 1-2

1. **Implement Cost Tracking** (E1) - Enable economic analysis
2. **Implement Multi-Layer Evaluation** (E2) - Move beyond keyword matching
3. **Integrate Cloud Models** (E3) - Enable local vs cloud comparison
4. **Create schema validator** - Automated compliance checking script
5. **Update prompt viewer** - Display schema compliance status

### Long-term (Q3-Q4 2026) - Infrastructure Phase 3-4

1. **Implement Statistical Analysis** (E4) - Add rigor and reproducibility
2. **Build Decision Engine** (E5) - Generate actionable recommendations
3. **Create Test Profiles** (E6) - Pre-configured test scenarios
4. **Add future personas** (DPO, CISO, etc.) if user research supports
5. **Add future knowledge types** (PREDICTIVE, DIAGNOSTIC, EVALUATIVE) if needed
6. **Build unified test runner** - Route tests to appropriate backends

---

## Migration Checklist

- [ ] Backup current prompt files
- [ ] Update test-data-generator.js (add 2 fields)
- [ ] Update ai-backend-multi-tier-tests.js (add 1 field)
- [ ] Run validation script
- [ ] Regenerate exports (JSON, CSV, MD)
- [ ] Update prompt viewer
- [ ] Test with existing test runners
- [ ] Update documentation
- [ ] Commit changes with message: "feat: Align prompts with PROMPT-SCHEMA v2.2.0"

---

## Questions & Next Steps

**Questions for user:**

1. Should we update **all 4 prompt files** or just the 2 primary ones?
2. Do you want to add **routing profiles** now or later?
3. Should we create a **schema validation script** to check compliance automatically?
4. Do you want to **regenerate all exports** after fixing schema compliance?

**Next steps:**

Let me know which prompts you'd like to build out (from the gap analysis earlier), and I'll ensure they follow the schema v2.2.0 format with all required fields.

---

**Status:** Ready for schema compliance updates
**Effort:** 1-2 hours for full compliance
**Risk:** Low (additive changes only)

Contact: libor@arionetworks.com
