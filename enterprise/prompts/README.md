# Centralized Multi-Tier Prompts

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/prompts/README.md
**Description:** Documentation for centralized multi-tier prompt modules
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

---

## Overview

This directory contains centralized multi-tier prompt modules used across all ArionComply AI tests and production systems.

**Single Source of Truth:** Modify prompts once here, changes apply everywhere.

---

## Module Structure

```
prompts/
├── tier1-base-system.js     # TIER 1: Base system prompt (always included)
├── tier2-prompts.js          # TIER 2: Situational prompts (one selected)
├── org-profiles.js           # Organization profiles for TIER 3 context
├── helpers.js                # Utilities (assembly, intent classification)
└── README.md                 # This file
```

---

## Quick Start

### Option 1: Explicit TIER 2 Selection (Test-Specific)

Use when you want to test a specific TIER 2 prompt directly:

```javascript
import { TIER1_BASE_SYSTEM } from '../prompts/tier1-base-system.js';
import { TIER2_PROMPTS } from '../prompts/tier2-prompts.js';
import { ORG_PROFILES, buildTier3Context } from '../prompts/org-profiles.js';
import { assembleFullPrompt } from '../prompts/helpers.js';

// Explicitly choose TIER 2 prompt
const tier2 = TIER2_PROMPTS.ASSESSMENT + '\n\n' + TIER2_PROMPTS.GDPR_FRAMEWORK;

// Build TIER 3
const tier3 = buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP);

// Assemble complete prompt
const fullPrompt = assembleFullPrompt(
  TIER1_BASE_SYSTEM,
  tier2,
  tier3,
  [], // conversation history
  "I want to assess my GDPR compliance"
);
```

### Option 2: Intent Classification (Production-Like)

Use when you want realistic intent-based TIER 2 selection:

```javascript
import { TIER1_BASE_SYSTEM } from '../prompts/tier1-base-system.js';
import { TIER2_PROMPTS } from '../prompts/tier2-prompts.js';
import { ORG_PROFILES, buildTier3Context } from '../prompts/org-profiles.js';
import { assembleFullPrompt, selectTier2Prompt } from '../prompts/helpers.js';

const userMessage = "Why should we use ArionComply instead of spreadsheets?";

// Let intent classification choose TIER 2
const tier2Selection = selectTier2Prompt(
  {
    assessmentMode: false,
    frameworkHint: null,
    currentMessage: userMessage
  },
  TIER2_PROMPTS
);

console.log(`Selected: ${tier2Selection.reason}`);
// Output: "Selected: value_keywords"

// Build TIER 3
const tier3 = buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP);

// Assemble complete prompt
const fullPrompt = assembleFullPrompt(
  TIER1_BASE_SYSTEM,
  tier2Selection.prompt,  // Use selected prompt
  tier3,
  [],
  userMessage
);
```

---

## Intent Classification

### How It Works

The `selectTier2Prompt()` function uses priority-based keyword matching:

**Priority 1: Assessment Mode**
```javascript
{ assessmentMode: true } → TIER2_PROMPTS.ASSESSMENT
```

**Priority 2: Framework Hint**
```javascript
{ frameworkHint: 'GDPR' } → TIER2_PROMPTS.GDPR_FRAMEWORK
{ frameworkHint: 'ISO_27001' } → TIER2_PROMPTS.ISO27001_FRAMEWORK
```

**Priority 3: Product Value Keywords**
```javascript
"Why should I use ArionComply?" → TIER2_PROMPTS.PRODUCT_VALUE
"What are the benefits?" → TIER2_PROMPTS.PRODUCT_VALUE
```

**Priority 4: Product Functional Keywords**
```javascript
"How do I upload evidence?" → TIER2_PROMPTS.PRODUCT_FEATURES
"Where is the dashboard?" → TIER2_PROMPTS.PRODUCT_FEATURES
```

**Priority 5: General Fallback**
```javascript
"What is compliance?" → TIER2_PROMPTS.GENERAL
```

### Keywords Reference

**Value Keywords:**
- `why arioncomply`, `why should i`, `benefits of`, `roi`, `compared to`

**Product Keywords:**
- `arioncomply`, `how do i`, `where is`, `what features`, `navigate to`

---

## Usage Examples

### Example 1: Assessment Test (Explicit)

```javascript
// Testing assessment mode with GDPR
const tier2 = TIER2_PROMPTS.ASSESSMENT + '\n\n' + TIER2_PROMPTS.GDPR_FRAMEWORK;

const prompt = assembleFullPrompt(
  TIER1_BASE_SYSTEM,
  tier2,
  buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
  [],
  "I want to assess GDPR compliance"
);
```

### Example 2: Assessment Test (Intent Classification)

```javascript
// Let intent classification detect assessment + GDPR
const message = "I want to assess GDPR compliance";

const tier2Selection = selectTier2Prompt(
  {
    assessmentMode: true,  // Detected or explicitly set
    frameworkHint: 'GDPR', // Detected from message
    currentMessage: message
  },
  TIER2_PROMPTS
);

// For assessment + framework, you may want to combine:
const tier2Combined = TIER2_PROMPTS.ASSESSMENT + '\n\n' + TIER2_PROMPTS.GDPR_FRAMEWORK;

const prompt = assembleFullPrompt(
  TIER1_BASE_SYSTEM,
  tier2Combined,
  buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
  [],
  message
);
```

### Example 3: Product Value Test (Intent Classification)

```javascript
const message = "Why should we use ArionComply instead of spreadsheets?";

const tier2Selection = selectTier2Prompt(
  { currentMessage: message },
  TIER2_PROMPTS
);

console.log(tier2Selection.reason); // "value_keywords"
console.log(tier2Selection.keywordsMatched); // ["why should", "arioncomply"]

const prompt = assembleFullPrompt(
  TIER1_BASE_SYSTEM,
  tier2Selection.prompt,
  buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP),
  [],
  message
);
```

### Example 4: Framework Knowledge Test (Explicit)

```javascript
// Testing ISO 27001 knowledge without assessment mode
const tier2 = TIER2_PROMPTS.ISO27001_FRAMEWORK;

const prompt = assembleFullPrompt(
  TIER1_BASE_SYSTEM,
  tier2,
  buildTier3Context(ORG_PROFILES.FINANCE_MEDIUM),
  [],
  "What are the requirements for ISO 27001 control A.8.2?"
);
```

---

## Organization Profiles

Pre-defined organization profiles for consistent testing:

```javascript
import { ORG_PROFILES } from './org-profiles.js';

ORG_PROFILES.HEALTHTECH_STARTUP  // Healthcare, 1-50 employees, EU, Initial maturity
ORG_PROFILES.FINANCE_MEDIUM      // Financial Services, 51-250, UK, Developing
ORG_PROFILES.ENTERPRISE_SAAS     // Technology, 251-1000, US, Managed
ORG_PROFILES.RETAIL_CHAIN        // Retail, 1000+, Global, Defined
ORG_PROFILES.EDTECH_NONPROFIT    // Education, 1-50, EU, Initial
```

---

## Helper Functions

### assembleFullPrompt()

Combines TIER 1, 2, 3 into complete prompt with Phase 2 optimizations.

```javascript
assembleFullPrompt(tier1, tier2, tier3, conversationHistory, userQuery)
```

**Returns:** Complete prompt string ready for LLM

### selectTier2Prompt()

Intent classification to select appropriate TIER 2 prompt.

```javascript
const result = selectTier2Prompt(context, TIER2_PROMPTS);
// result = { prompt, reason, keywordsMatched }
```

### buildTier3Context()

Generate organization-specific context from profile.

```javascript
const tier3 = buildTier3Context(ORG_PROFILES.HEALTHTECH_STARTUP);
```

### estimateTokens()

Estimate token count for a prompt (rough heuristic).

```javascript
const tokens = estimateTokens(fullPrompt);
```

### validatePromptStructure()

Validate that prompt contains all required tiers.

```javascript
const validation = validatePromptStructure(fullPrompt);
// { valid: true/false, errors: [] }
```

---

## Modifying Prompts

### To update TIER 1 (affects ALL tests):

Edit: `tier1-base-system.js`

```javascript
export const TIER1_BASE_SYSTEM = `You are ArionComply AI...`;
```

### To update TIER 2 prompts:

Edit: `tier2-prompts.js`

```javascript
export const TIER2_PROMPTS = {
  ASSESSMENT: `Assessment Mode Active...`,
  GDPR_FRAMEWORK: `GDPR Expert Mode...`,
  // ... etc
};
```

### To update organization profiles:

Edit: `org-profiles.js`

```javascript
export const ORG_PROFILES = {
  HEALTHTECH_STARTUP: {
    industry: "Healthcare",
    // ... etc
  }
};
```

### To update intent classification:

Edit: `helpers.js` - Update `VALUE_KEYWORDS` or `PRODUCT_KEYWORDS` arrays

---

## Testing Approach Decision

**When to use explicit TIER 2 selection:**
- Testing specific prompt content
- Validating prompt quality for a particular mode
- A/B testing different TIER 2 variations
- Controlled test scenarios

**When to use intent classification:**
- End-to-end system testing
- Validating production-like behavior
- Testing intent detection accuracy
- Realistic user scenarios

**Both approaches are valid** - choose based on test goals.

---

## Version History

- **v2.0** (2026-03-26): Added intent classification, Phase 1 & 2 optimizations
- **v1.0** (2026-03-25): Initial multi-tier prompt structure

---

## Questions

Contact: libor@arionetworks.com
