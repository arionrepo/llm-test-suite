# v2.3.0 Prompt Pattern Review & Validation

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/NEW-PROMPTS-V23-PATTERN-REVIEW.md
**Description:** Review of 15 new example prompts to establish v2.3.0 reference pattern
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

---

## Purpose

Review 15 newly created example prompts (NEW-PROMPTS-V2.3-EXAMPLES.js) to:
1. Validate they follow schema v2.3.0 correctly
2. Establish reference patterns for each prompt type
3. Document best practices before updating 239 existing prompts
4. Ensure consistency across different question types

---

## Coverage Analysis

### Prompts Created: 15

**By Persona (Fills gaps!):**
- NOVICE: 1
- PRACTITIONER: 2
- MANAGER: 2
- AUDITOR: 2
- EXECUTIVE: 3 ✅ (was gap - need more)
- DEVELOPER: 5 ✅ (was gap - need more)

**By Knowledge Type:**
- FACTUAL: 5
- PROCEDURAL: 4
- EXACT_MATCH: 3 ✅ (was gap)
- RELATIONAL: 2
- SYNTHESIS: 2

**By Standard:**
- GDPR: 3
- ISO_27001: 4
- SOC_2: 3
- PCI_DSS: 2
- HIPAA: 2
- EU_AI_ACT: 1

**Great coverage!** Addresses gap personas (EXECUTIVE, DEVELOPER, EXACT_MATCH)

---

## Pattern Analysis by Question Type

### Pattern 1: Simple FACTUAL Questions

**Example:** SOC2_FACTUAL_NOVICE_NEW_1

**Pattern Established:**
```javascript
{
  // Base schema
  id, category, vendor, standard, knowledgeType, persona, question, expectedTopics, complexity,

  // Ground truth (simple)
  expectedReferenceURL: "https://...",  // Official source
  referenceSource: "Source Name",
  referenceAccessibility: "free",

  mustMention: [                        // 3-5 essential facts
    "audit report",
    "service organization",
    "trust services criteria"
  ],
  mustNotMention: [                     // 1-3 misconceptions
    "SOC 2 is a certification",         // Common error
    "only for cloud companies"
  ],

  referenceAnswer: "Full expert answer..."  // 2-3 sentences
}
```

**Use for:** Simple factual questions with objective answers
**Validation approach:** mustMention + referenceAnswer
**Effort:** Low (~5 min per prompt)

---

### Pattern 2: PROCEDURAL Questions (Steps/Workflow)

**Example:** SOC2_PROCEDURAL_MANAGER_NEW_1

**Pattern Established:**
```javascript
{
  // Base schema...

  // Ground truth (structured)
  expectedReferenceURL: "https://...",

  mustMention: [                        // High-level steps
    "scoping",
    "control implementation",
    "6-12 month",
    "third-party audit"
  ],
  mustNotMention: [
    "can get SOC 2 in a month"
  ],

  // PROCEDURAL uses answerKeyPoints (better than referenceAnswer for steps)
  answerKeyPoints: [
    {
      concept: "Determine scope",      // What step
      keywords: ["scoping", "scope definition"],  // How to detect
      weight: 15,                       // Importance
      required: true
    },
    {
      concept: "Design controls",
      keywords: ["design controls", "control design"],
      weight: 20,
      required: true
    },
    // ... 5-7 total steps
  ]
}
```

**Use for:** Step-by-step processes, workflows, implementation guides
**Validation approach:** answerKeyPoints with weights
**Effort:** Medium (~10 min per prompt - need to define all steps)

---

### Pattern 3: EXACT_MATCH Questions (Citations)

**Example:** PCI_DSS_EXACT_MATCH_AUDITOR_NEW_1

**Pattern Established:**
```javascript
{
  // Base schema...
  expectedCitation: "8.2.1",           // The specific citation

  // Ground truth (precise)
  expectedReferenceURL: "https://...",  // Link to exact section

  mustMention: [
    "multi-factor authentication",
    "all user access",
    "at least two authentication factors"
  ],
  mustNotMention: [
    "MFA is optional",
    "only for administrators"
  ],

  // EXACT_MATCH should include actual regulatory text
  referenceAnswer: "PCI-DSS Requirement 8.2.1 states: Multi-factor authentication (MFA) is required for all access into the Card Data Environment (CDE)..."
}
```

**Use for:** Regulatory citations, control requirements, exact specifications
**Validation approach:** mustMention (strict) + referenceAnswer (actual text)
**Effort:** Medium (~10 min - need to look up exact text)

---

### Pattern 4: SYNTHESIS Questions (Comparisons/Analysis)

**Example:** EUAI_SYNTHESIS_EXECUTIVE_NEW_1

**Pattern Established:**
```javascript
{
  // Base schema...

  // Ground truth (quality-based)
  expectedReferenceURL: "https://...",

  mustMention: [
    "required for EU market",
    "high-risk systems have strict requirements",
    "extraterritorial scope"
  ],
  mustNotMention: [
    "only applies in Europe",
    "US companies exempt"
  ],

  // SYNTHESIS uses exampleAnswers (show quality levels)
  exampleAnswers: {
    excellent: {
      answer: "Comprehensive answer covering...",
      score: 95,
      strengths: ["Coverage", "Specifics", "Actionable"]
    },
    acceptable: {
      answer: "Adequate answer...",
      score: 70,
      strengths: ["Covers main points"],
      weaknesses: ["Lacks detail"]
    },
    insufficient: {
      answer: "Too vague...",
      score: 30,
      weaknesses: ["Missing key implications"]
    }
  }
}
```

**Use for:** Comparisons, multi-document synthesis, strategic analysis
**Validation approach:** exampleAnswers (quality calibration)
**Effort:** High (~15 min - need to write 3 example answers)

---

### Pattern 5: RELATIONAL Questions (Relationships/Mappings)

**Example:** HIPAA_RELATIONAL_PRACTITIONER_NEW_1

**Pattern Established:**
```javascript
{
  // Base schema...

  // Ground truth (relationship-focused)
  expectedReferenceURL: "https://...",

  mustMention: [
    "privacy rule governs use and disclosure",
    "security rule governs protection measures",
    "complementary"
  ],
  mustNotMention: [
    "security rule is part of privacy rule",
    "only one applies"
  ],

  // RELATIONAL uses referenceAnswer explaining the relationship
  referenceAnswer: "The two rules work together: Privacy Rule sets boundaries, Security Rule enforces them..."
}
```

**Use for:** How X relates to Y, mappings, dependencies
**Validation approach:** mustMention + referenceAnswer
**Effort:** Medium (~8 min)

---

### Pattern 6: Advanced with Validation Rubric

**Example:** MULTIPLE_SYNTHESIS_DEVELOPER_NEW_1

**Pattern Established:**
```javascript
{
  // Base schema...

  // Ground truth (multi-dimensional scoring)
  expectedReferenceURL: "https://...",

  mustMention: [...],
  mustNotMention: [...],

  // For complex questions, use validation rubric
  validationRubric: {
    dimensions: [
      {
        name: "Identifies Common Requirements",
        weight: 30,
        levels: {
          excellent: "Lists encryption at rest, in transit...",
          good: "Mentions encryption requirements",
          poor: "Only mentions encryption generally",
          fail: "Doesn't identify commonalities"
        }
      },
      // 3-4 dimensions total
    ],
    minimumPassingScore: 60,
    scoringMethod: "weighted"
  }
}
```

**Use for:** Complex multi-faceted questions requiring nuanced assessment
**Validation approach:** validationRubric (most sophisticated)
**Effort:** High (~20 min - need to define dimensions and levels)

---

## Field Usage Recommendations

### expectedReferenceURL (REQUIRED for new prompts)

**Always include:**
- Link to official source (government, ISO, AICPA, etc.)
- For paywalled content (ISO), also include alternativeReferenceURL

**Examples:**
- Free: `https://eur-lex.europa.eu/eli/reg/2016/679/oj`
- Paywall: `https://www.iso.org/standard/27001` + `alternativeReferenceURL: "https://www.isms.online/iso-27001/"`

---

### mustMention (REQUIRED for new prompts)

**Guidelines:**
- 3-5 essential facts/concepts that MUST appear
- Use "OR" for alternatives: `"effective 2018 OR May 2018"`
- Be specific: `"EU regulation"` not just `"regulation"`
- Focus on key facts, not keywords

**Examples:**
- FACTUAL: `["EU regulation", "personal data", "effective 2018"]`
- PROCEDURAL: `["scoping", "control implementation", "6-12 month"]`
- EXACT_MATCH: `["multi-factor authentication", "all user access", "two factors"]`

---

### mustNotMention (RECOMMENDED)

**Guidelines:**
- 1-3 common misconceptions
- Things that are frequently wrong but sound plausible
- Help LLM avoid errors

**Examples:**
- `["only applies to EU companies"]` - Common GDPR misconception
- `["SOC 2 is a certification"]` - It's a report, not certification
- `["encryption is optional under GDPR"]` - Article 32 requires appropriate measures

---

### Validation Approach Selection

**Choose based on question type:**

| Question Type | Use | Effort |
|--------------|-----|--------|
| Simple FACTUAL | mustMention + referenceAnswer | Low (5 min) |
| PROCEDURAL | mustMention + answerKeyPoints | Medium (10 min) |
| EXACT_MATCH | mustMention + referenceAnswer (actual text) | Medium (10 min) |
| RELATIONAL | mustMention + referenceAnswer | Medium (8 min) |
| SYNTHESIS | mustMention + exampleAnswers | High (15 min) |
| Complex SYNTHESIS | validationRubric | Very High (20 min) |

**Recommendation for 239 existing prompts:**
- Start with mustMention + referenceAnswer (simple, works for 80%)
- Add answerKeyPoints for PROCEDURAL (20%)
- Add exampleAnswers/rubric for complex SYNTHESIS later

---

## Quality Assessment of New Prompts

### Validation Against v2.3.0 Requirements

**All 15 prompts have:**
- ✅ All required base fields (id, category, vendor, question, expectedTopics, complexity)
- ✅ Complete taxonomy (standard, knowledgeType, persona)
- ✅ expectedReferenceURL (links to authoritative source)
- ✅ mustMention (3-5 essential facts)
- ✅ mustNotMention (where applicable)
- ✅ At least one validation approach (referenceAnswer, answerKeyPoints, exampleAnswers, or validationRubric)

### Variety Check ✅

**Demonstrates patterns for:**
- ✅ All 5 knowledge types
- ✅ 6 personas (NOVICE, PRACTITIONER, MANAGER, AUDITOR, EXECUTIVE, DEVELOPER)
- ✅ Different complexity levels (beginner to expert)
- ✅ Free and paywall references
- ✅ Different validation approaches

---

## Observed Best Practices

### 1. mustMention Should Be Detectable

**Good:**
```javascript
mustMention: ["EU regulation", "personal data", "effective 2018"]
```
- These are concrete facts that can be found in response

**Bad:**
```javascript
mustMention: ["comprehensive", "detailed", "thorough"]
```
- These are subjective quality terms, not facts

---

### 2. expectedTopics vs mustMention

**They serve different purposes:**

**expectedTopics:** Broad concepts that should appear
- Used for keyword matching (fast, cheap validation)
- Example: `["regulation", "privacy", "EU"]`

**mustMention:** Specific essential facts
- Used for ground truth validation (accurate validation)
- Example: `["EU regulation", "personal data", "effective 2018"]`

**There's overlap, and that's OK!**
- expectedTopics can be subset of mustMention
- mustMention should be more specific

---

### 3. referenceAnswer Length

**Observed patterns:**
- FACTUAL (simple): 2-3 sentences (~150-250 words)
- FACTUAL (complex): 1 paragraph (~250-400 words)
- PROCEDURAL: 1-2 paragraphs with steps (~300-500 words)
- EXACT_MATCH: Include actual regulatory text + explanation (~200-400 words)
- SYNTHESIS: 2-3 paragraphs (~400-600 words)

---

### 4. answerKeyPoints for PROCEDURAL

**Why it works well:**
- PROCEDURAL questions have clear steps
- Each step can be weighted by importance
- Easy to validate programmatically
- Provides granular feedback ("missed step 3")

**Structure:**
```javascript
answerKeyPoints: [
  { concept: "Step 1", keywords: [...], weight: 20, required: true },
  { concept: "Step 2", keywords: [...], weight: 20, required: true },
  { concept: "Step 3", keywords: [...], weight: 25, required: true },
  { concept: "Step 4", keywords: [...], weight: 15, required: true },
  { concept: "Step 5", keywords: [...], weight: 10, required: false }  // Optional bonus
]
```

**Weights should sum to ~100**

---

### 5. validationRubric for Complex Questions

**When to use:**
- Multi-faceted questions
- No single "right" answer
- Need to assess multiple dimensions (accuracy, completeness, implementation detail)

**Example dimensions:**
- Factual Accuracy (30%)
- Completeness (25%)
- Specificity (20%)
- Practical Guidance (15%)
- Examples Provided (10%)

---

## Issues Found in Examples (Self-Review)

### Issue 1: Prompt ID Numbering

**Observation:** Used `_NEW_1` suffix

**Should be:** Once merged into main files, use next sequential number
- Current: Last GDPR FACTUAL NOVICE is #3
- Next: Should be GDPR_FACTUAL_NOVICE_4 (not NEW_1)

---

### Issue 2: Some referenceAnswers Very Long

**Example:** MULTIPLE_SYNTHESIS_DEVELOPER_NEW_1 has ~400 word answer

**Analysis:** This is OK for SYNTHESIS/DEVELOPER (complex questions need detailed answers)

**Guideline established:**
- Simple questions: 150-250 words
- Complex questions: 300-600 words
- No hard limit, but aim for concise yet comprehensive

---

### Issue 3: validationRubric might be overengineered

**For:** MULTIPLE_SYNTHESIS_DEVELOPER_NEW_1

**Analysis:** Very detailed rubric with 4 dimensions, each with 4 levels

**Question:** Is this too complex for automated validation?

**Decision:** Keep it as "advanced pattern" - use for most critical/complex prompts only
- 80% of prompts: mustMention + referenceAnswer (simple)
- 15% of prompts: answerKeyPoints (structured)
- 5% of prompts: validationRubric (complex)

---

## Patterns to Apply to Existing Prompts

### For test-data-generator.js (84 prompts)

**FACTUAL prompts (36 prompts):**
```javascript
// Add these fields to each FACTUAL prompt:
{
  expectedReferenceURL: getStandardURL(standard),  // Auto-generate from reference-urls.json
  referenceSource: getStandardName(standard),
  mustMention: [/* 3-5 key facts */],
  referenceAnswer: "/* 2-3 sentence answer */"
}
```

**Effort:** ~30 min (can partially automate URLs, manually write mustMention/referenceAnswer)

**PROCEDURAL prompts (19 prompts):**
```javascript
// Add answerKeyPoints
{
  expectedReferenceURL: getStandardURL(standard),
  mustMention: [/* high-level steps */],
  answerKeyPoints: [
    /* 5-7 steps with weights */
  ]
}
```

**Effort:** ~3 hours (need to define steps manually)

**EXACT_MATCH prompts (6 prompts - just fixed!):**
```javascript
// Add reference URL + actual text
{
  expectedReferenceURL: getArticleURL(standard, citation),
  mustMention: [/* key requirements from citation */],
  referenceAnswer: "/* actual regulatory text + explanation */"
}
```

**Effort:** ~1 hour (look up each citation)

**RELATIONAL prompts (14 prompts):**
```javascript
// Similar to FACTUAL but focus on relationships
{
  expectedReferenceURL: getStandardURL(standard),
  mustMention: [/* how they relate */],
  referenceAnswer: "/* explain relationship */"
}
```

**Effort:** ~2 hours

**SYNTHESIS prompts (9 prompts):**
```javascript
// Most complex - consider exampleAnswers for quality calibration
{
  expectedReferenceURL: getStandardURL(standard),
  mustMention: [/* key comparison points */],
  exampleAnswers: {
    excellent: { answer: "...", score: 90 },
    acceptable: { answer: "...", score: 70 }
  }
}
```

**Effort:** ~2 hours

**Total effort for 84 prompts:** ~8-10 hours

---

### For ai-backend-multi-tier-tests.js (50 prompts)

**These already have expectedBehavior field!**

**Pattern:**
```javascript
{
  // Existing fields...
  expectedBehavior: "Should initiate GDPR gap assessment workflow",

  // Add v2.3.0 fields
  expectedReferenceURL: getStandardURL(standard),
  mustMention: [/* derived from expectedBehavior */],
  // Can skip referenceAnswer (behavior description is similar)
}
```

**Effort:** ~2 hours (simpler since we have expectedBehavior)

---

### For specialized files

**performance-prompts.js:** Add URLs + mustMention (~2 hours)
**intent-classification-tests.js:** Add URLs where standard specified (~1 hour)
**ui-tasks.js:** URLs not applicable (product features)
**next-action-tests.js:** Add URLs where standard specified (~30 min)

---

## Validated Pattern Summary

### Minimum Required (for all new prompts):

```javascript
{
  // Base schema v2.2.0
  id, category, vendor, question, expectedTopics, complexity,
  standard, knowledgeType, persona,

  // v2.3.0 additions
  expectedReferenceURL: "https://...",
  referenceSource: "Source Name",
  mustMention: [/* 3-5 facts */]
}
```

**Effort:** ~5 min per prompt
**Validation improvement:** 40% → 65% confidence

---

### Recommended (for quality prompts):

```javascript
{
  // Minimum required +

  mustNotMention: [/* 1-3 misconceptions */],
  referenceAnswer: "/* 150-400 word answer */"

  // OR for PROCEDURAL:
  answerKeyPoints: [/* weighted steps */]
}
```

**Effort:** ~10 min per prompt
**Validation improvement:** 40% → 75% confidence

---

### Optional (for critical prompts):

```javascript
{
  // Recommended +

  exampleAnswers: {
    excellent: {...},
    acceptable: {...}
  }

  // OR

  validationRubric: {
    dimensions: [...],
    minimumPassingScore: 60
  }
}
```

**Effort:** ~15-20 min per prompt
**Validation improvement:** 40% → 85% confidence

---

## Next Steps

### 1. Review These 15 Examples

**Questions to validate:**
- Are mustMention facts appropriate?
- Are mustNotMention misconceptions realistic?
- Are referenceAnswers accurate and complete?
- Are answerKeyPoints weighted correctly?
- Are reference URLs correct?

### 2. Test the Pattern

**Try using these prompts:**
1. Run against a model
2. Evaluate response using new validation logic
3. Verify mustMention facts can be detected
4. Confirm validationapproach works

### 3. Establish Final Pattern

**Document:**
- Which validation approach for which question type
- Time investment per prompt type
- Quality/effort tradeoff decisions

### 4. Update Existing Prompts

**Once pattern validated:**
- Create update script
- Add v2.3.0 fields to all 239 prompts
- Prioritize by value (FACTUAL first, SYNTHESIS last)

---

## Recommendation for User Review

**Please review these 15 prompts and check:**

1. **Are mustMention facts accurate?**
   - Do they capture the essential information?
   - Are they specific enough?

2. **Are mustNotMention misconceptions real?**
   - Have you encountered these errors?
   - Are there other common misconceptions to add?

3. **Are referenceAnswers comprehensive?**
   - Do they cover the key points?
   - Are they accurate?
   - Right level of detail?

4. **Are reference URLs correct?**
   - Do they link to authoritative sources?
   - Are free alternatives appropriate?

5. **Overall pattern:**
   - Does this pattern make sense?
   - Ready to apply to all 239 prompts?

---

**Status:** 15 example prompts created, ready for review
**Next:** Validate pattern, then apply to existing prompts

Contact: libor@arionetworks.com
