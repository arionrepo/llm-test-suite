# Test Metadata Inconsistency Analysis

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/TEST-METADATA-INCONSISTENCY-ANALYSIS.md
**Description:** Analysis of metadata inconsistencies between different test types and standardization plan
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-25

---

## Identified Inconsistency

### My Original Tests (test-data-generator.js)

**Structure:**
```javascript
{
  id: "GDPR_FACTUAL_NOVICE_1",
  standard: "GDPR",
  knowledgeType: "FACTUAL",
  persona: "NOVICE",
  question: "What is GDPR?",
  expectedTopics: ["regulation", "privacy", "EU", "data protection"],
  expectedCitation: null,
  retrievalStrategy: "vector_db",
  complexity: "beginner"
}
```

**Fields:** 9 total
- id, standard, knowledgeType, persona, question
- expectedTopics, expectedCitation, retrievalStrategy, complexity

---

### User's Multi-Tier Tests (ai-backend-multi-tier-tests.js)

**Structure:**
```javascript
{
  id: "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",
  category: "ai_backend_multitier",
  standard: "GDPR",
  knowledgeType: "PROCEDURAL",
  persona: "NOVICE",
  tier2Mode: "assessment",
  question: "I want to assess my GDPR compliance",
  tier1Content: TIER1_BASE_SYSTEM,           // NEW
  tier2Content: TIER2_PROMPTS.ASSESSMENT,    // NEW
  tier3Context: buildTier3Context(...),      // NEW
  orgProfile: ORG_PROFILES.HEALTHTECH_STARTUP, // NEW
  conversationHistory: [],                    // NEW
  fullPrompt: assembleFullPrompt(...),        // NEW
  expectedTopics: [...],
  expectedBehavior: "...",                    // NEW
  complexity: "beginner",
  estimatedTokens: 2300                       // NEW
}
```

**Fields:** 17 total
- All my original fields PLUS:
- category, tier2Mode, tier1Content, tier2Content, tier3Context
- orgProfile, conversationHistory, fullPrompt
- expectedBehavior, estimatedTokens

---

## Missing Fields Per Test Type

### My Tests Missing:
- ❌ `category` - Test category classification
- ❌ `tier1Content` - TIER 1 system prompt
- ❌ `tier2Content` - TIER 2 situational prompt
- ❌ `tier3Context` - TIER 3 org context
- ❌ `tier2Mode` - Which mode (assessment/general/etc.)
- ❌ `orgProfile` - Organization profile data
- ❌ `conversationHistory` - Multi-turn context
- ❌ `fullPrompt` - Complete assembled prompt
- ❌ `expectedBehavior` - Detailed behavior expectation
- ❌ `estimatedTokens` - Actual token count estimate

### User's Tests Missing:
- ❌ `expectedCitation` - For exact match tests
- ❌ `retrievalStrategy` - What retrieval layer needed

---

## Impact of Inconsistency

### 1. Cannot Merge Test Sets
```javascript
const allTests = [
  ...generateAllTests(),  // My 52 tests
  ...Object.values(AI_BACKEND_MULTI_TIER_TESTS)  // User's 50 tests
]
// PROBLEM: Different schemas, can't process uniformly
```

### 2. Export Breaks
```javascript
// export-prompts.js expects certain fields
tests.map(t => ({
  inputComplexity: analyzeInput(t.question),  // Works
  tier1Content: t.tier1Content  // undefined for my tests!
}))
```

### 3. Test Runner Confusion
```javascript
// Which format to use?
if (test.fullPrompt) {
  // Send multi-message array
} else {
  // Send single user message
}
```

### 4. Viewer Display Issues
- Some prompts show tier information
- Some don't
- Filtering by tier/mode not possible for inconsistent tests

---

## Standardized Metadata Schema (Proposal)

### Required Fields (ALL tests must have):

```javascript
{
  // Identification
  id: string,                    // Unique identifier
  category: string,              // Test category

  // Classification
  standard: string,              // GDPR, ISO_27001, etc.
  knowledgeType: string,         // FACTUAL, RELATIONAL, etc.
  persona: string,               // NOVICE, PRACTITIONER, etc.

  // Prompt Content
  question: string,              // User query (short form)
  messages: Array,               // Full message array (system + user)

  // Multi-Tier Structure (if applicable)
  tiers: {
    tier1: string | null,        // Base system (or null if not used)
    tier2: string | null,        // Situational (or null)
    tier3: string | null,        // Org context (or null)
    tier2Mode: string | null     // assessment/general/etc.
  },

  // Context
  orgProfile: Object | null,     // Organization profile (or null)
  conversationHistory: Array,    // Previous messages (or [])

  // Expectations
  expectedTopics: Array,         // Keywords to look for
  expectedBehavior: string,      // Detailed expectation
  expectedCitation: string | null, // For exact match tests

  // Complexity
  inputComplexity: Object,       // From analyzer
  outputComplexity: Object,      // From analyzer
  estimatedInputTokens: number,  // Calculated

  // Retrieval
  retrievalStrategy: string,     // vector_db, knowledge_graph, etc.

  // Legacy
  complexity: string             // beginner/intermediate/advanced
}
```

---

## Standardization Plan

### Phase 1: Backward-Compatible Enhancement

**Update my 52 tests to include new fields:**
```javascript
{
  // Existing fields stay
  id: "GDPR_FACTUAL_NOVICE_1",
  standard: "GDPR",
  //...

  // ADD new fields with defaults
  category: "compliance_knowledge",
  tiers: {
    tier1: null,  // Simple tests don't use tiers
    tier2: null,
    tier3: null,
    tier2Mode: null
  },
  messages: [{role: 'user', content: question}],  // Convert question to messages array
  orgProfile: null,
  conversationHistory: [],
  expectedBehavior: `Should provide factual answer covering: ${expectedTopics.join(', ')}`,
  estimatedInputTokens: calculateTokens(question)
}
```

### Phase 2: Ensure User's Tests Have All Fields

**Check if user's 50 tests need:**
```javascript
// Add if missing:
expectedCitation: null,
retrievalStrategy: determineStrategy(knowledgeType),
```

### Phase 3: Create Unified Schema Validator

```javascript
function validateTestMetadata(test) {
  const required = [
    'id', 'category', 'standard', 'knowledgeType', 'persona',
    'question', 'messages', 'tiers', 'expectedTopics', 'expectedBehavior',
    'inputComplexity', 'outputComplexity', 'retrievalStrategy'
  ];

  for (const field of required) {
    if (!(field in test)) {
      throw new Error(`Test ${test.id} missing required field: ${field}`);
    }
  }

  return true;
}
```

### Phase 4: Update Export to Handle Both

```javascript
// In export-prompts.js
function normalizeTest(test) {
  return {
    ...test,
    // Ensure all fields exist
    category: test.category || 'legacy',
    tiers: test.tiers || {tier1: null, tier2: null, tier3: null},
    messages: test.messages || [{role: 'user', content: test.question}],
    orgProfile: test.orgProfile || null,
    conversationHistory: test.conversationHistory || [],
    expectedBehavior: test.expectedBehavior || generateBehavior(test),
    expectedCitation: test.expectedCitation || null,
    retrievalStrategy: test.retrievalStrategy || inferStrategy(test)
  };
}
```

---

## Count of User's New Tests

**From ai-backend-multi-tier-tests.js:**
```bash
export const AI_BACKEND_MULTI_TIER_TESTS = {
  // Approximately 50 test objects
}
```

**Need to verify:**
- Exact count of tests
- Which standards covered
- Which personas covered
- Avoid duplication with my 52 tests

---

## Action Items

1. **Count user's multi-tier tests**
   - Parse AI_BACKEND_MULTI_TIER_TESTS
   - List all test IDs
   - Check for overlap with my tests

2. **Define canonical schema**
   - Document required vs optional fields
   - Create TypeScript/JSDoc definitions
   - Validate all tests against schema

3. **Backfill missing metadata**
   - Add tier fields to my simple tests (as null)
   - Add retrievalStrategy to user's tests if missing
   - Ensure all have complexity analysis

4. **Update export/viewer**
   - Handle both schemas gracefully
   - Normalize before processing
   - Display all metadata consistently

5. **Update test runner**
   - Support both single-message and multi-tier formats
   - Use `test.messages` if exists, else build from `test.question`

---

Questions: libor@arionetworks.com
