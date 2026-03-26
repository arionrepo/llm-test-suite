# LLM Test Suite - File Relationships & Architecture Guide

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/FILE-RELATIONSHIPS-GUIDE.md
**Description:** Clear explanation of how all files relate to each other and what each one does
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

---

## Quick Answer to Common Questions

### "Where do I add new prompts?"

**Answer:** You edit ONE of these TWO source files:

1. **`enterprise/test-data-generator.js`** - For generic compliance tests
2. **`enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js`** - For ArionComply-specific tests

**All other files are either generated from these or are utilities.**

### "What are exports and why regenerate them?"

**Answer:** Exports are **read-only snapshots** of prompts in different formats for viewing/analysis:

- **JSON export** - For programmatic access
- **CSV export** - For Excel/spreadsheet viewing
- **Markdown export** - For human-readable documentation
- **HTML viewer** - For interactive browsing

**Why regenerate?** When you edit source files, exports become outdated. Regenerating updates them.

---

## Architecture Overview

### The Big Picture

```
SOURCE FILES (You edit these)
       ↓
   UTILITIES (Process source files)
       ↓
   EXPORTS (Read-only snapshots)
       ↓
   VIEWERS (Display exports)
       ↓
   TEST RUNNERS (Execute tests using source files)
       ↓
   TEST RESULTS (Saved to reports/)
```

---

## File Categories & Purposes

### Category 1: SOURCE FILES (Editable - This is where prompts live)

#### 1.1 Generic Compliance Test Source

**File:** `enterprise/test-data-generator.js`
**Lines:** ~386 lines
**Purpose:** Define generic compliance framework test prompts

**What's in it:**
- `TEST_TEMPLATES` object with prompt templates
- Organized by: STANDARD → KNOWLEDGE_TYPE → PERSONA
- Contains 84 prompts across 10 standards

**Structure:**
```javascript
TEST_TEMPLATES = {
  GDPR: {
    FACTUAL: {
      NOVICE: [
        { q: 'What is GDPR?', expectedTopics: [...] },
        { q: 'What are the main principles?', expectedTopics: [...] }
      ],
      PRACTITIONER: [ ... ]
    },
    RELATIONAL: { ... },
    PROCEDURAL: { ... }
  },
  ISO_27001: { ... },
  SOC_2: { ... }
}
```

**How to add a prompt:**
```javascript
// Navigate to: TEST_TEMPLATES.GDPR.FACTUAL.NOVICE
// Add to array:
{ q: 'What is personal data under GDPR?', expectedTopics: ['pii', 'identifiable', 'definition'] }
```

**What happens automatically:**
- `generateTests()` function adds: id, category, vendor, standard, knowledgeType, persona, complexity
- You only provide: q (question) and expectedTopics
- Export scripts can then generate JSON/CSV/MD from this

---

#### 1.2 ArionComply Multi-Tier Test Source

**File:** `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js`
**Lines:** ~1688 lines
**Purpose:** Define ArionComply-specific multi-tier prompt tests

**What's in it:**
- `ORG_PROFILES` - 5 organization templates (healthcare startup, finance medium, etc.)
- `TIER1_BASE_SYSTEM` - Base system prompt (always included)
- `TIER2_PROMPTS` - 6 situational prompts (assessment, GDPR, ISO 27001, product, etc.)
- `AI_BACKEND_MULTI_TIER_TESTS` - 50 complete test objects
- Helper functions: `buildTier3Context()`, `assembleFullPrompt()`

**Structure:**
```javascript
AI_BACKEND_MULTI_TIER_TESTS = {
  ASSESSMENT_START_GDPR_NOVICE_1: {
    id: "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",
    category: "ai_backend_multitier",
    vendor: "ArionComply",
    standard: "GDPR",
    knowledgeType: "PROCEDURAL",
    persona: "NOVICE",
    tier2Mode: "assessment",
    question: "I want to assess my GDPR compliance",
    tier1Content: TIER1_BASE_SYSTEM,
    tier2Content: TIER2_PROMPTS.ASSESSMENT + "\n\n" + TIER2_PROMPTS.GDPR_FRAMEWORK,
    tier3Context: buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
    orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP,
    conversationHistory: [],
    fullPrompt: assembleFullPrompt(...),
    expectedTopics: ["gap assessment", "questionnaire"],
    expectedBehavior: "Should initiate GDPR gap assessment workflow",
    complexity: "beginner",
    estimatedTokens: 2300
  },
  ASSESSMENT_MID_ISO27001_PRACTITIONER_1: { ... },
  // ... 48 more tests
}
```

**How to add a prompt:**
```javascript
// Add a new key to AI_BACKEND_MULTI_TIER_TESTS object:
GDPR_ARTICLE25_DESIGN_DEVELOPER_3: {
  id: "ARION_MULTITIER_GDPR_DESIGN_DEVELOPER_3",
  category: "ai_backend_multitier",
  vendor: "ArionComply",
  standard: "GDPR",
  knowledgeType: "PROCEDURAL",
  persona: "DEVELOPER",
  tier2Mode: "framework-gdpr",
  question: "How do I implement privacy by design?",
  tier1Content: TIER1_BASE_SYSTEM,
  tier2Content: TIER2_PROMPTS.GDPR_FRAMEWORK,
  tier3Context: buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
  orgProfile: ORG_PROFILES.ENTERPRISE_SAAS,
  conversationHistory: [],
  fullPrompt: assembleFullPrompt(
    TIER1_BASE_SYSTEM,
    TIER2_PROMPTS.GDPR_FRAMEWORK,
    buildTier3Context(ORG_PROFILES.ENTERPRISE_SAAS),
    [],
    "How do I implement privacy by design?"
  ),
  expectedTopics: ["Article 25", "data minimization", "design patterns"],
  expectedBehavior: "Should explain privacy by design principles with code examples",
  complexity: "advanced",
  estimatedTokens: 2350
}
```

**Note:** You must manually fill in ALL fields (no auto-generation like test-data-generator)

---

#### 1.3 Other Source Files (Minor)

**File:** `enterprise/arioncomply-workflows/prompt-schema-aligned.js`
**Purpose:** Small test set for schema validation testing (~10 tests)
**Use:** Validate intent classification and tier selection

**File:** `performance-prompts.js`
**Purpose:** Simple prompts for speed/throughput testing (~10 tests)
**Use:** Benchmark tokens/second performance

---

### Category 2: CONFIGURATION FILES (Define metadata)

#### 2.1 Standards Definition

**File:** `enterprise/compliance-standards.js`
**Purpose:** Define all 29 compliance standards with metadata

**What's in it:**
```javascript
export const COMPLIANCE_STANDARDS = {
  GDPR: {
    name: "GDPR",
    fullName: "General Data Protection Regulation",
    category: "privacy",
    jurisdiction: "EU",
    year: 2018,
    keyTopics: ["personal data", "consent", "data subject rights"],
    retrievalNeeds: ["vector_db", "knowledge_graph"]
  },
  // ... 28 more standards
}
```

**Why it exists:** Centralized metadata about standards for filtering, documentation, retrieval strategy selection

---

#### 2.2 Personas Definition

**File:** `enterprise/user-personas.js`
**Purpose:** Define all 6 user personas with characteristics

**What's in it:**
```javascript
export const USER_PERSONAS = {
  NOVICE: {
    name: "NOVICE",
    description: "New to compliance, needs explanations",
    expertise: "beginner",
    queryStyle: "simple",
    needsExplanations: true,
    expectedBehavior: {
      responseStyle: "educational",
      includesCitations: false,
      includesExamples: true
    }
  },
  // ... 5 more personas
}
```

**Why it exists:** Defines expected behavior for each persona type

---

#### 2.3 Knowledge Types Definition

**File:** `enterprise/knowledge-types.js` (if exists)
**Purpose:** Define 5 knowledge types and retrieval strategies

**Alternative:** May be inline in test-data-generator.js

---

### Category 3: UTILITY SCRIPTS (Process source files)

#### 3.1 Export Generator

**File:** `export-prompts.js`
**Purpose:** Generate JSON/CSV/MD exports from source files

**What it does:**
1. Imports `test-data-generator.js` and `ai-backend-multi-tier-tests.js`
2. Calls `generateAllTests()` to get all prompts
3. Merges prompts from both sources
4. Writes to:
   - `unified-prompt-database.json`
   - `reports/prompts/all-prompts-comprehensive.json`
   - `reports/prompts/compliance-prompts.csv`
   - `reports/prompts/compliance-prompts.md`

**How to use:**
```bash
node export-prompts.js
```

**When to run:** After editing source files (test-data-generator.js or ai-backend-multi-tier-tests.js)

---

#### 3.2 Prompt Complexity Analyzer

**File:** `utils/prompt-complexity-analyzer.js`
**Purpose:** Calculate complexity scores for prompts

**What it does:**
- Takes a prompt text
- Calculates: token count, technical density, multi-part detection
- Returns: complexity level, performance class, score

**Used by:** Export scripts to add `promptComplexity` field

---

#### 3.3 Schema Validator

**File:** `utils/test-result-validator.js`
**Purpose:** Validate test RESULTS match schema (not prompts)

**Note:** This validates OUTPUT (test results), not INPUT (prompts)

**Future:** Need prompt-schema-validator.js for validating prompt format

---

### Category 4: EXPORT FILES (Read-only snapshots)

**These files are GENERATED. Never edit manually. Regenerate from source files.**

#### 4.1 JSON Exports

**File:** `unified-prompt-database.json`
**Purpose:** Single JSON file with all prompts
**Format:** Array of prompt objects
**Use:** Load in scripts for testing or analysis
```javascript
import prompts from './unified-prompt-database.json';
console.log('Total prompts:', prompts.length);
```

**File:** `reports/prompts/all-prompts-comprehensive.json`
**Purpose:** JSON export with additional metadata wrapper
**Format:**
```json
{
  "metadata": {
    "generated": "2026-03-26T10:30:00Z",
    "totalPrompts": 134,
    "sources": ["test-data-generator", "ai-backend-multi-tier-tests"]
  },
  "prompts": [ ... ]
}
```

---

#### 4.2 CSV Export

**File:** `reports/prompts/compliance-prompts.csv`
**Purpose:** Spreadsheet-friendly format
**Use:** Open in Excel, Google Sheets for filtering/sorting
**Columns:** id, category, vendor, standard, persona, question, complexity, etc.

**Why useful:**
- Quick filtering by standard (show only GDPR)
- Sort by complexity
- Count prompts per category
- Business users prefer spreadsheets

---

#### 4.3 Markdown Reports

**File:** `reports/prompts/compliance-prompts.md`
**Purpose:** Human-readable documentation of all compliance prompts
**Format:** Tables organized by standard

**File:** `reports/prompts/arioncomply-prompts.md`
**Purpose:** Human-readable documentation of ArionComply-specific prompts
**Format:** Organized by tier2Mode

**Why useful:**
- Review prompts without code
- Share with stakeholders
- Documentation for non-technical users

---

### Category 5: VIEWER FILES (Display prompts interactively)

#### 5.1 Browser-Based Viewer

**File:** `reports/prompts/prompt-viewer.html`
**Purpose:** Interactive HTML page to browse prompts
**Features:**
- Filter by standard, persona, complexity, vendor
- Search by keywords
- View full prompt details
- Count distribution stats

**How to use:**
```bash
open reports/prompts/prompt-viewer.html
```

**Data source:** Loads `all-prompts-comprehensive.json`

---

#### 5.2 CLI Viewers

**File:** `view-test-prompts.js`
**Purpose:** Command-line viewer for prompts
**How to use:**
```bash
node view-test-prompts.js
```

**File:** `prompt-viewer.js`
**Purpose:** Alternative CLI viewer
**How to use:**
```bash
node prompt-viewer.js
```

**Why multiple viewers:** Different display formats, filtering options

---

### Category 6: TEST RUNNER FILES (Execute tests with prompts)

#### 6.1 Performance Test Runner

**File:** `run-performance-tests.js`
**Purpose:** Run speed/throughput tests with performance-prompts
**Prompts used:** `performance-prompts.js` (10 simple prompts)
**What it does:**
1. Load 10 performance-focused prompts
2. Start models sequentially
3. Send prompts to each model
4. Measure tokens/second, latency
5. Save results to `reports/performance/{date}/`

**How to use:**
```bash
node run-performance-tests.js
```

**Results:** JSON files with timing metrics

---

#### 6.2 Enterprise Test Runner

**File:** `run-enterprise-tests.js`
**Purpose:** Run compliance accuracy tests
**Prompts used:** `enterprise/test-data-generator.js` (84 prompts)
**What it does:**
1. Load prompts via `generateAllTests()`
2. Start model
3. Send prompts (subset based on mode: pilot/quick/standard/comprehensive)
4. Evaluate response quality
5. Save results to `reports/compliance/{date}/`

**How to use:**
```bash
node run-enterprise-tests.js pilot         # 10 prompts
node run-enterprise-tests.js quick         # 25 prompts
node run-enterprise-tests.js standard      # 50 prompts
node run-enterprise-tests.js comprehensive # 84 prompts
```

**Results:** JSON files with quality scores

---

#### 6.3 Multi-Tier Test Runner

**File:** `run-multitier-performance.js`
**Purpose:** Run ArionComply multi-tier tests
**Prompts used:** `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js` (50 prompts)
**What it does:**
1. Load all 50 multi-tier prompts
2. Start model sequentially
3. Send FULL prompts (TIER1+2+3+user message)
4. Measure performance with complex prompts
5. Save results to `reports/multitier/{date}/`

**How to use:**
```bash
node run-multitier-performance.js
```

**Results:** JSON files with multi-tier test results

---

### Category 7: DOCUMENTATION FILES (Guides & Specifications)

#### 7.1 Schema Specifications

**File:** `docs/PROMPT-SCHEMA.md`
**Purpose:** Official schema specification for prompt format (INPUT)
**When to read:** When creating new prompts or understanding structure

**File:** `TEST-RESULT-SCHEMA.md`
**Purpose:** Official schema specification for test results (OUTPUT)
**When to read:** When creating new test runners or analyzing results

---

#### 7.2 Guides

**File:** `docs/TAXONOMY-GUIDE.md`
**Purpose:** Guide to standards, personas, knowledge types, planned enhancements
**When to read:** When deciding which standard/persona/type to use

**File:** `docs/SCHEMA-USAGE-GUIDE.md`
**Purpose:** How to use the result schema in code
**When to read:** When working with test results

**File:** `docs/SCHEMA-IMPLEMENTATION-GUIDE.md`
**Purpose:** How to implement schema compliance in test runners
**When to read:** When creating a new test runner

**File:** `docs/SCHEMA-QUICK-REFERENCE.md`
**Purpose:** Quick lookup cheat sheet
**When to read:** When you need fast answers

---

#### 7.3 Analysis Documents

**File:** `PROMPT-SCHEMA-COMPLIANCE-ANALYSIS.md`
**Purpose:** Shows current compliance status of all prompt files
**When to read:** To understand if prompts meet schema requirements

**File:** `PROMPT-COMPLEXITY-GAP-ANALYSIS.md`
**Purpose:** Identifies which categories need more prompts
**When to read:** When planning new prompts to build

**File:** `ENHANCEMENT-PLAN.md`
**Purpose:** Infrastructure improvement roadmap (4402 lines!)
**When to read:** Understanding future planned features

---

### Category 8: PROJECT CONFIGURATION

**File:** `CLAUDE.md`
**Purpose:** Project-specific instructions for Claude Code
**Contains:** Testing standards, prompt schema requirements, sequential testing rules

**File:** `.claude/settings.local.json`
**Purpose:** Local project settings (git commands, hooks, etc.)

---

## Data Flow Diagrams

### Adding a New Generic Compliance Prompt

```
1. YOU EDIT:
   enterprise/test-data-generator.js
   └─ Add to TEST_TEMPLATES.GDPR.FACTUAL.NOVICE array
      { q: "New question", expectedTopics: [...] }

2. FUNCTION GENERATES FULL OBJECT:
   generateTests() adds fields automatically:
   └─ id, category, vendor, standard, knowledgeType, persona, complexity

3. OPTIONALLY EXPORT:
   node export-prompts.js
   └─ Writes to:
      ├─ unified-prompt-database.json
      ├─ reports/prompts/all-prompts-comprehensive.json
      ├─ reports/prompts/compliance-prompts.csv
      └─ reports/prompts/compliance-prompts.md

4. VIEW (optional):
   open reports/prompts/prompt-viewer.html
   └─ Browse new prompt interactively

5. TEST:
   node run-enterprise-tests.js comprehensive
   └─ Runs new prompt against model
   └─ Saves results to reports/compliance/{date}/
```

---

### Adding a New ArionComply Multi-Tier Prompt

```
1. YOU EDIT:
   enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js
   └─ Add new object to AI_BACKEND_MULTI_TIER_TESTS
      NEW_TEST_NAME: {
        id: "...",
        category: "ai_backend_multitier",
        vendor: "ArionComply",
        // ... ALL fields manually specified
      }

2. NO AUTO-GENERATION:
   You must provide ALL fields yourself

3. OPTIONALLY EXPORT:
   node export-prompts.js
   └─ Includes new prompt in exports

4. TEST:
   node run-multitier-performance.js
   └─ Runs new multi-tier prompt
   └─ Saves results to reports/multitier/{date}/
```

---

## File Dependency Map

### What Files Import What

```
TEST RUNNERS (execute tests)
├─ run-performance-tests.js
│   └─ imports: performance-prompts.js
│   └─ uses: utils/test-helpers.js (for saving)
│   └─ uses: utils/test-result-validator.js (for validation)
│   └─ saves to: reports/performance/{date}/
│
├─ run-enterprise-tests.js
│   └─ imports: enterprise/test-data-generator.js
│   └─ uses: utils/test-helpers.js
│   └─ uses: utils/test-result-validator.js
│   └─ saves to: reports/compliance/{date}/
│
└─ run-multitier-performance.js
    └─ imports: enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js
    └─ uses: utils/test-helpers.js
    └─ uses: utils/test-result-validator.js
    └─ saves to: reports/multitier/{date}/

EXPORT SCRIPTS (generate snapshots)
└─ export-prompts.js
    ├─ imports: enterprise/test-data-generator.js
    ├─ imports: enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js
    ├─ imports: utils/prompt-complexity-analyzer.js
    └─ writes to:
        ├─ unified-prompt-database.json
        ├─ reports/prompts/all-prompts-comprehensive.json
        ├─ reports/prompts/compliance-prompts.csv
        └─ reports/prompts/compliance-prompts.md

VIEWERS (display prompts)
├─ reports/prompts/prompt-viewer.html
│   └─ loads: reports/prompts/all-prompts-comprehensive.json
│
├─ view-test-prompts.js
│   └─ imports: enterprise/test-data-generator.js (directly)
│
└─ prompt-viewer.js
    └─ imports: enterprise/test-data-generator.js (directly)
```

---

## Common Workflows

### Workflow 1: I Want to Add New Prompts

**Step 1:** Decide which type:
- **Generic compliance?** → Edit `enterprise/test-data-generator.js`
- **ArionComply-specific?** → Edit `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js`

**Step 2:** Edit the appropriate source file (see "How to add a prompt" sections above)

**Step 3:** Test the code loads without errors:
```bash
# For test-data-generator.js
node -e "import('./enterprise/test-data-generator.js').then(m => console.log('✅ Loaded:', m.generateAllTests().length, 'prompts'));"

# For ai-backend-multi-tier-tests.js
node -e "import('./enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js').then(m => console.log('✅ Loaded:', Object.keys(m.AI_BACKEND_MULTI_TIER_TESTS).length, 'prompts'));"
```

**Step 4 (Optional):** Regenerate exports:
```bash
node export-prompts.js
```

**Step 5:** View in browser (optional):
```bash
open reports/prompts/prompt-viewer.html
```

**Step 6:** Run tests with new prompts:
```bash
node run-enterprise-tests.js pilot  # Test a few
```

---

### Workflow 2: I Want to View Existing Prompts

**Option A: Browser (Interactive)**
```bash
# Make sure exports are up to date first
node export-prompts.js

# Open viewer
open reports/prompts/prompt-viewer.html
```

**Option B: Command Line**
```bash
node view-test-prompts.js
```

**Option C: Read Markdown**
```bash
# Make sure exports are up to date
node export-prompts.js

# Open markdown report
cat reports/prompts/compliance-prompts.md
```

**Option D: Read Source Directly**
```bash
# View source files
cat enterprise/test-data-generator.js | less
cat enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js | less
```

---

### Workflow 3: I Want to Understand Test Coverage Gaps

**Step 1:** Run stats:
```bash
node -e "import('./enterprise/test-data-generator.js').then(m => console.log(JSON.stringify(m.getTestStats(), null, 2)));"
```

**Step 2:** Read gap analysis:
```bash
cat PROMPT-COMPLEXITY-GAP-ANALYSIS.md
```

**Step 3:** Identify categories with <20 prompts

**Step 4:** Add prompts to those categories (see Workflow 1)

---

### Workflow 4: I Want to Run Tests

**Performance Test (Speed/Throughput):**
```bash
node run-performance-tests.js
# Uses: performance-prompts.js (10 simple prompts)
# Saves to: reports/performance/{date}/
```

**Compliance Test (Accuracy):**
```bash
node run-enterprise-tests.js quick
# Uses: enterprise/test-data-generator.js (25 prompts)
# Saves to: reports/compliance/{date}/
```

**Multi-Tier Test (ArionComply):**
```bash
node run-multitier-performance.js
# Uses: enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js (50 prompts)
# Saves to: reports/multitier/{date}/
```

---

## File Organization

### Directory Structure

```
llm-test-suite/
├── enterprise/                           # SOURCE FILES (edit these)
│   ├── test-data-generator.js           # 84 generic compliance prompts ⭐ EDIT
│   ├── compliance-standards.js          # Standard metadata
│   ├── user-personas.js                 # Persona definitions
│   └── arioncomply-workflows/
│       ├── ai-backend-multi-tier-tests.js  # 50 ArionComply prompts ⭐ EDIT
│       ├── prompt-schema-aligned.js     # Schema validation tests
│       ├── intent-classification-tests.js
│       └── next-action-tests.js
│
├── utils/                                # UTILITY MODULES
│   ├── test-helpers.js                  # Save results
│   ├── test-result-validator.js         # Validate results
│   ├── prompt-complexity-analyzer.js    # Calculate complexity
│   └── logger.js                        # Logging utilities
│
├── reports/                              # GENERATED OUTPUTS
│   ├── prompts/                         # Prompt exports (read-only)
│   │   ├── all-prompts-comprehensive.json   # JSON export
│   │   ├── compliance-prompts.csv           # CSV export
│   │   ├── compliance-prompts.md            # Markdown export
│   │   ├── arioncomply-prompts.md           # ArionComply export
│   │   └── prompt-viewer.html               # Browser viewer
│   │
│   ├── performance/{date}/              # Performance test results
│   │   └── test-results-*.json
│   │
│   ├── compliance/{date}/               # Compliance test results
│   │   └── test-results-*.json
│   │
│   └── multitier/{date}/                # Multi-tier test results
│       └── test-results-*.json
│
├── logs/                                 # Test execution logs
│   └── test-run-*.log
│
├── docs/                                 # DOCUMENTATION
│   ├── PROMPT-SCHEMA.md                 # Prompt schema spec (INPUT)
│   ├── TAXONOMY-GUIDE.md                # Standards, personas, types
│   ├── SCHEMA-USAGE-GUIDE.md            # Result schema usage
│   ├── SCHEMA-IMPLEMENTATION-GUIDE.md   # Implementation guide
│   ├── SCHEMA-QUICK-REFERENCE.md        # Quick lookup
│   └── README-UNIFIED-SCHEMA.md         # Master index
│
├── TEST RUNNERS (execute tests)
│   ├── run-performance-tests.js         # Speed tests
│   ├── run-enterprise-tests.js          # Compliance tests
│   └── run-multitier-performance.js     # Multi-tier tests
│
├── EXPORT/VIEW SCRIPTS
│   ├── export-prompts.js                # Generate exports
│   ├── view-test-prompts.js             # CLI viewer
│   └── prompt-viewer.js                 # Alternative viewer
│
├── OTHER PROMPT SOURCES
│   └── performance-prompts.js           # 10 simple speed test prompts
│
├── PROJECT FILES
│   ├── CLAUDE.md                        # Project instructions ⭐ NOW INCLUDES SCHEMA
│   ├── TEST-RESULT-SCHEMA.md            # Result schema spec (OUTPUT)
│   ├── ENHANCEMENT-PLAN.md              # Infrastructure roadmap
│   ├── PROMPT-SCHEMA-COMPLIANCE-ANALYSIS.md  # Compliance status
│   ├── PROMPT-COMPLEXITY-GAP-ANALYSIS.md     # Coverage gaps
│   └── unified-prompt-database.json     # Consolidated export
│
└── package.json, node_modules/, etc.
```

---

## Key Concepts Explained

### "Build Prompts" = Edit Source Files

When I say "build prompts", I mean:
1. **Edit** `enterprise/test-data-generator.js` (for generic compliance)
2. **OR edit** `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js` (for ArionComply)
3. Add new prompt objects/templates to these files

**NOT:**
- Running a script
- Generating anything
- Building in the software engineering sense

**It's editing a JavaScript data structure.**

---

### "Regenerate Exports" = Update Snapshots

**What exports are:**
- Read-only copies of prompts in various formats
- JSON, CSV, Markdown versions
- Generated FROM source files
- Used by viewers and documentation

**Why regenerate:**
- When you edit source files (add/modify prompts)
- Exports become outdated
- Viewers show old data
- Need to refresh them

**How to regenerate:**
```bash
node export-prompts.js
```

**What happens:**
1. Script imports test-data-generator.js
2. Calls `generateAllTests()` → gets 84 prompts
3. Imports ai-backend-multi-tier-tests.js
4. Gets 50 prompts
5. Merges to 134 total prompts
6. Writes to:
   - `unified-prompt-database.json`
   - `reports/prompts/all-prompts-comprehensive.json`
   - `reports/prompts/compliance-prompts.csv`
   - `reports/prompts/compliance-prompts.md`

**When to skip regenerating:**
- If you just want to run tests (test runners read source files directly)
- If you're just viewing source files in editor

**When you MUST regenerate:**
- If you want to use prompt-viewer.html (reads JSON export)
- If you want updated CSV for Excel
- If you want updated Markdown docs

---

### "Test Runners" = Execute Tests

Test runners are scripts that:
1. Load prompts from source files
2. Start LLM models (local or cloud)
3. Send prompts to models
4. Capture responses
5. Measure performance/quality
6. Save results to `reports/` directories

**They do NOT:**
- Modify prompt source files
- Generate exports
- Edit anything

**They ONLY:**
- Read prompts
- Execute tests
- Save results

---

## Decision Tree: Which File Do I Need?

### I want to ADD a new prompt

**Question 1:** Is it generic compliance knowledge or ArionComply-specific?

**Generic (GDPR, ISO 27001 concepts, any company):**
→ Edit `enterprise/test-data-generator.js`
→ Find the right section: `TEST_TEMPLATES[STANDARD][KNOWLEDGE_TYPE][PERSONA]`
→ Add: `{ q: "question", expectedTopics: [...] }`

**ArionComply-specific (platform features, multi-tier):**
→ Edit `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js`
→ Add complete object to `AI_BACKEND_MULTI_TIER_TESTS`
→ Fill in ALL fields manually

---

### I want to VIEW existing prompts

**Interactive browsing:**
→ Run `node export-prompts.js` (if exports outdated)
→ Open `reports/prompts/prompt-viewer.html`

**Spreadsheet analysis:**
→ Run `node export-prompts.js`
→ Open `reports/prompts/compliance-prompts.csv` in Excel

**Human-readable docs:**
→ Run `node export-prompts.js`
→ Read `reports/prompts/compliance-prompts.md`

**Source code:**
→ Open `enterprise/test-data-generator.js` or
→ Open `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js`

---

### I want to RUN tests

**Speed/throughput testing:**
→ Run `node run-performance-tests.js`
→ Results in `reports/performance/{date}/`

**Compliance accuracy testing:**
→ Run `node run-enterprise-tests.js quick`
→ Results in `reports/compliance/{date}/`

**Multi-tier testing:**
→ Run `node run-multitier-performance.js`
→ Results in `reports/multitier/{date}/`

---

### I want to UNDERSTAND the structure

**Prompt format (input):**
→ Read `docs/PROMPT-SCHEMA.md`

**Result format (output):**
→ Read `TEST-RESULT-SCHEMA.md`

**Standards/personas/types:**
→ Read `docs/TAXONOMY-GUIDE.md`

**Quick lookup:**
→ Read `docs/SCHEMA-QUICK-REFERENCE.md`

**This guide:**
→ Read `FILE-RELATIONSHIPS-GUIDE.md` (this file!)

---

## Common Confusion Points

### "Why are there so many JSON files?"

**Source files** (JavaScript):
- `test-data-generator.js` - Editable prompt definitions
- `ai-backend-multi-tier-tests.js` - Editable prompt definitions

**Export files** (JSON - generated, read-only):
- `unified-prompt-database.json` - Snapshot for scripts
- `reports/prompts/all-prompts-comprehensive.json` - Snapshot for viewer

**Result files** (JSON - test outputs):
- `reports/performance/{date}/test-results-*.json` - Performance test results
- `reports/compliance/{date}/test-results-*.json` - Compliance test results

**Purpose of each:**
- Source: Where prompts are defined (edit these)
- Export: Snapshots for viewing (regenerate these)
- Results: Test execution outputs (created by test runs)

---

### "Which file has the 'real' prompts?"

**The SOURCE files are the "real" prompts:**
- `enterprise/test-data-generator.js` - 84 generic prompts
- `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js` - 50 ArionComply prompts

**Everything else is derived:**
- Exports are snapshots of source files
- Test results use source files to run tests
- Viewers display exports (which came from source files)

**ALWAYS edit source files, never edit exports.**

---

### "Do I need to regenerate exports after editing prompts?"

**Only if:**
- You want to use prompt-viewer.html (needs updated JSON)
- You want updated CSV for Excel
- You want updated Markdown docs

**You do NOT need to regenerate if:**
- You just want to run tests (test runners read source files directly)
- You're just editing and not viewing yet

**Best practice:** Regenerate exports before committing changes (keeps docs in sync)

---

## Summary Table

| File Type | Editable? | Purpose | How to Update |
|-----------|-----------|---------|---------------|
| `test-data-generator.js` | ✅ YES | Define generic compliance prompts | Edit TEST_TEMPLATES object |
| `ai-backend-multi-tier-tests.js` | ✅ YES | Define ArionComply prompts | Add to AI_BACKEND_MULTI_TIER_TESTS |
| `unified-prompt-database.json` | ❌ NO | JSON snapshot | Run `node export-prompts.js` |
| `reports/prompts/*.json` | ❌ NO | JSON exports | Run `node export-prompts.js` |
| `reports/prompts/*.csv` | ❌ NO | CSV export | Run `node export-prompts.js` |
| `reports/prompts/*.md` | ❌ NO | Markdown docs | Run `node export-prompts.js` |
| `reports/prompts/prompt-viewer.html` | ❌ NO | Viewer UI | No update needed (loads JSON) |
| `run-*.js` | ⚠️ RARE | Test runners | Only if changing test logic |
| `docs/*.md` | ⚠️ RARE | Documentation | Only if schema changes |
| `CLAUDE.md` | ⚠️ RARE | Project instructions | Only for project standards |

---

## Quick Start Guide

### I'm New - Where Do I Start?

**Step 1:** Understand the basics (10 minutes)
→ Read this file (FILE-RELATIONSHIPS-GUIDE.md)

**Step 2:** See what prompts exist (5 minutes)
```bash
node export-prompts.js
open reports/prompts/prompt-viewer.html
```

**Step 3:** View a source file (10 minutes)
```bash
cat enterprise/test-data-generator.js | less
```

**Step 4:** Add your first prompt (15 minutes)
→ Edit `enterprise/test-data-generator.js`
→ Add to appropriate TEST_TEMPLATES section
→ Test it loads: `node -e "import('./enterprise/test-data-generator.js').then(...)"`

**Step 5:** Run a test (10 minutes)
```bash
node run-enterprise-tests.js pilot
```

**Total time:** ~50 minutes to full understanding

---

## FAQ

**Q: I edited test-data-generator.js. Do I need to do anything else?**
A: No, if you just want to run tests. Yes, if you want updated exports/viewer (`node export-prompts.js`).

**Q: How do I know if my new prompt follows the schema?**
A: Check the examples in CLAUDE.md (now includes full schema requirements). All required fields must be present.

**Q: Can I edit the CSV or JSON exports directly?**
A: No! They're generated files. Edit source files instead, then regenerate exports.

**Q: What's the difference between test-data-generator.js and ai-backend-multi-tier-tests.js?**
A: test-data-generator = generic compliance (any company), ai-backend-multi-tier = ArionComply-specific (platform features, multi-tier prompts).

**Q: Where do test results go?**
A: `reports/{testType}/{date}/test-results-*.json`

**Q: How many prompt files are there total?**
A: **2 primary editable sources**, plus 12 derived/utility files.

---

**Status:** Complete guide to file relationships
**Last Updated:** 2026-03-26

Contact: libor@arionetworks.com
