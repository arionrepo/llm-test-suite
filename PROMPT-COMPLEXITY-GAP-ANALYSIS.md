# Prompt Complexity Gap Analysis

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/PROMPT-COMPLEXITY-GAP-ANALYSIS.md
**Description:** Analysis of missing prompt complexity in current test suite and plan to add realistic multi-tier tests
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-25

---

## Gap Identified

### What We Built

**2D Complexity Analyzers:** ✅ Implemented
- InputComplexityAnalyzer - measures question parsing difficulty
- OutputComplexityAnalyzer - measures answer generation difficulty
- Exported in JSON for all 123 prompts

**Current Test Prompts:** ❌ All Simple
```javascript
// Example current test:
{
    messages: [{role: 'user', content: 'What is GDPR?'}],
    // Input complexity: ~10 tokens, simple structure
    // Not realistic for production
}
```

### What ArionComply Actually Does

**Production Prompt Structure:** Multi-tier system

```javascript
messages: [
    // TIER 1: Base System Prompt (~500-1000 tokens)
    {
        role: 'system',
        content: `You are ArionComply AI Assistant, a specialized compliance
                  and regulatory guidance system.

                  **Your Core Purpose:**
                  - Help organizations achieve and maintain compliance
                  - Provide actionable, practical guidance
                  ... (500+ more tokens)`
    },

    // TIER 2: Framework-Specific Prompt (~300-800 tokens)
    {
        role: 'system',
        content: `**Framework Context: GDPR**

                  You are providing guidance on GDPR compliance.

                  **Core GDPR Principles:**
                  1. Lawfulness, Fairness, Transparency (Art. 5.1.a)
                  2. Purpose Limitation (Art. 5.1.b)
                  ... (400+ more tokens with all GDPR articles)`
    },

    // TIER 3: Organization Context (~200-400 tokens)
    {
        role: 'system',
        content: `**Organization Context:**
                  - Industry: SaaS
                  - Organization Size: SMB (50-500 employees)
                  - Region: EU
                  - Licensed Frameworks: GDPR, ISO 27001
                  - Maturity Level: developing
                  ... (200+ more tokens with org-specific context)`
    },

    // RAG Context (variable, 0-5000 tokens)
    {
        role: 'system',
        content: `**Retrieved Context:**

                  [GDPR Article 30 full text...]
                  [Related policy documents...]
                  [Previous assessment results...]
                  ... (could be 1000-5000 tokens)`
    },

    // User Query (~10-100 tokens)
    {
        role: 'user',
        content: 'What are our GDPR compliance gaps for data retention?'
    }
]

// TOTAL INPUT: 1500-7000 tokens!
// Our tests: 10-20 tokens
```

---

## Input Complexity Spectrum (Currently Missing)

### What We SHOULD Be Testing

**Low Input Complexity (10-50 tokens):**
- Simple factual questions
- Single-tier prompts
- No context
- Example: "What is GDPR?"
- **Current coverage: 100% of our tests** ❌

**Medium Input Complexity (100-500 tokens):**
- TIER 1 + TIER 2 prompts
- Basic org context
- Example: Base system + framework prompt + simple question
- **Current coverage: 0%** ❌

**High Input Complexity (500-2000 tokens):**
- TIER 1 + TIER 2 + TIER 3
- Full org context with variables
- Multi-part questions
- Example: All three tiers + complex question
- **Current coverage: 0%** ❌

**Very High Input Complexity (2000-7000 tokens):**
- All tiers + RAG context
- Multiple retrieved documents
- Long-form questions
- Example: Full production ArionComply prompt
- **Current coverage: 0%** ❌

---

## Why This Matters

### 1. Can't Validate Input Complexity Metric

**We measure input complexity but never test it:**
- All our tests score 8-25 on input complexity (all "simple")
- Never test if higher input complexity correlates with slower parsing
- Can't validate our formula: `weightedScore = (input × 0.25) + (output × 0.75)`

### 2. Not Testing Production Reality

**Production queries include:**
- 1000-2000 token system prompts
- RAG context chunks
- Variable substitution
- Multi-message conversations

**Our tests:**
- 10-20 token simple questions
- No system prompts
- No RAG context
- Single-turn only

**Result:** We're testing toy examples, not real workloads

### 3. Can't Identify Large Context Issues

**Large models advertise:**
- qwen2.5-32b: 131,072 token context
- But we never test with >50 tokens input

**Can't validate:**
- Does large context actually help?
- How does performance degrade with context length?
- Which models handle long prompts better?

---

## Required Test Additions

### Category 1: Multi-Tier Prompt Tests (Need 30 tests)

**Structure each test with ArionComply's tier system:**

```javascript
{
    id: 'MULTI_TIER_GDPR_ASSESSMENT_1',
    tier1Prompt: TIER1_BASE_SYSTEM,  // ~800 tokens
    tier2Prompt: TIER2_FRAMEWORK_GDPR,  // ~600 tokens
    tier3Variables: {
        industry: 'SaaS',
        org_size: 'SMB',
        frameworks: ['gdpr', 'iso27001'],
        maturity: 'developing'
    },
    tier3Prompt: buildTier3(tier3Variables),  // ~300 tokens
    userQuery: 'What are our data retention compliance gaps?',

    totalInputTokens: ~1710 tokens,  // HIGH input complexity
    inputComplexity: {
        score: 75,  // High due to length + technical density + tiers
        level: 'complex'
    },
    outputComplexity: {
        score: 60,  // Synthesis required
        level: 'complex'
    }
}
```

### Category 2: RAG-Enhanced Prompts (Need 25 tests)

**Test with varying amounts of RAG context:**

```javascript
{
    id: 'RAG_GDPR_ARTICLE_LOOKUP_1',
    systemPrompts: [TIER1, TIER2_GDPR],
    ragContext: {
        documents: [
            {source: 'GDPR Article 30', tokens: 400, text: '...'},
            {source: 'GDPR Article 5', tokens: 350, text: '...'}
        ],
        totalTokens: 750
    },
    userQuery: 'How does Article 30 support Article 5?',

    totalInputTokens: ~2250 tokens,
    inputComplexity: {
        score: 80,  // Very high - long context + technical
        level: 'very_complex'
    }
}
```

### Category 3: Input Complexity Spectrum Tests (Need 40 tests)

**Deliberately vary input complexity to test correlation:**

| Input Complexity | Token Range | Test Count | Examples |
|-----------------|-------------|------------|----------|
| Simple (0-30) | 10-50 | 10 | Current tests (keep as baseline) |
| Moderate (30-50) | 100-500 | 10 | TIER 1 + TIER 2 only |
| Complex (50-75) | 500-2000 | 10 | All 3 tiers + variables |
| Very Complex (75-100) | 2000-7000 | 10 | All tiers + RAG context |

### Category 4: Variable Substitution Tests (Need 15 tests)

**Test if org context variables affect responses:**

```javascript
{
    id: 'VARIABLE_ORG_CONTEXT_1',
    tier3Variables: {
        industry: 'Healthcare',  // vs SaaS vs Financial
        org_size: 'Enterprise',  // vs Startup vs SMB
        maturity: 'mature'       // vs developing vs minimal
    },
    userQuery: 'What should we prioritize for compliance?',

    // Verify response mentions healthcare-specific concerns
    expectedResponseCharacteristics: [
        'mentions HIPAA',
        'addresses patient data',
        'appropriate for enterprise scale',
        'assumes mature processes exist'
    ]
}
```

---

## Implementation Plan

### Phase 1: Extract ArionComply Prompts from Database

**Read actual TIER 1/2/3 prompts:**
```sql
-- Get real prompts from ArionComply database
SELECT template_key, tier, content, variables
FROM prompt_templates
WHERE active = true AND deleted_at IS NULL
ORDER BY tier, priority DESC;
```

**Create test templates using real production prompts**

### Phase 2: Create Tier Builders

**File:** `enterprise/arioncomply-workflows/tier-prompt-builder.js`

```javascript
export class TierPromptBuilder {
    buildTier1() {
        // Return actual TIER 1 base system prompt
    }

    buildTier2(framework) {
        // Return framework-specific prompt (gdpr, iso27001, etc.)
    }

    buildTier3(variables) {
        // Substitute variables into org context template
        // variables: {industry, org_size, region, frameworks, maturity}
    }

    buildRAGContext(documents) {
        // Format retrieved documents as context
    }

    buildCompletePrompt(config) {
        // Combine all tiers + RAG + user query
        return {
            messages: [
                {role: 'system', content: this.buildTier1()},
                {role: 'system', content: this.buildTier2(config.framework)},
                {role: 'system', content: this.buildTier3(config.orgContext)},
                {role: 'system', content: this.buildRAGContext(config.ragDocs)},
                {role: 'user', content: config.userQuery}
            ],
            totalInputTokens: calculateTokens(messages),
            inputComplexity: analyzeInputComplexity(messages)
        };
    }
}
```

### Phase 3: Generate Test Set

**Create 110 new tests:**
- 30 multi-tier (varying tiers used)
- 25 RAG-enhanced (varying context length)
- 40 input complexity spectrum (deliberate variation)
- 15 variable substitution (different org types)

**Total test suite: 123 + 110 = 233 tests**

### Phase 4: Update Test Runner

**Support multi-message prompts:**
```javascript
// Current (simple):
await client.chatCompletion([
    {role: 'user', content: test.question}
]);

// New (multi-tier):
await client.chatCompletion(test.messages);  // Array of system + user messages
```

### Phase 5: Validate Metrics

**With new tests, verify:**
- Input complexity actually correlates with parse time
- High input complexity tests show longer prompt processing
- Formula `(input × 0.25) + (output × 0.75)` is accurate
- RAG context affects performance as expected

---

## Expected Outcomes

### Distribution After Adding Tests

**Input Complexity Distribution:**
- Simple (0-30): 30% of tests (~70 tests)
- Moderate (30-50): 30% of tests (~70 tests)
- Complex (50-75): 25% of tests (~58 tests)
- Very Complex (75-100): 15% of tests (~35 tests)

**Prompt Types:**
- Single-message: 40% (simple factual)
- Multi-tier (no RAG): 30% (realistic system prompts)
- Multi-tier + RAG: 20% (full production complexity)
- Variable substitution: 10% (org-context testing)

### Performance Insights We'll Gain

1. **Parse time correlation with input complexity**
   - Measure prompt processing time vs input token count
   - Validate 0.25 weight in performance formula

2. **Large context model advantage**
   - Does qwen2.5-32b (131k context) handle long prompts better?
   - At what input length do small models degrade?

3. **RAG impact**
   - How much does 1k vs 3k vs 5k RAG context affect speed?
   - Does accuracy improve with more context?

4. **Tier optimization**
   - Is TIER 3 necessary for all queries or only complex ones?
   - Can we skip tiers for simple questions to save tokens?

---

## Next Steps

1. Read ArionComply prompt_templates from database
2. Create tier-prompt-builder.js with real prompts
3. Generate 110 new multi-tier tests
4. Update test runner to support multi-message prompts
5. Re-run tests with realistic complexity distribution
6. Validate input/output complexity correlation

---

Questions: libor@arionetworks.com
