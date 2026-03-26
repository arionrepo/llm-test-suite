# Multi-Tier Prompt Optimization Recommendations
**File:** /tmp/PROMPT-OPTIMIZATION-RECOMMENDATIONS.md
**Description:** Analysis and recommendations for improving multi-tier prompt structure based on observed model behaviors
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26
**Based On:** Quality analysis of 150 test responses from phi3, smollm3, and mistral

---

## Executive Summary

**Current Issues Observed:**
1. 🚨 **phi3 hallucination** - Fabricates fake user dialogues in assessment mode (CRITICAL)
2. ⚠️ **smollm3 formatting** - Outputs `<think>` tags in every response (MODERATE)
3. 📊 **Context usage varies** - mistral uses TIER 3 immediately, phi3 often ignores it (MODERATE)

**Root Causes:**
1. **Ambiguous assessment instructions** - "Parse their responses" triggers phi3 to create example responses
2. **No output format constraints** - Models not told what NOT to include
3. **Context buried at end** - TIER 3 appears after 1800+ tokens, may get diluted attention

**Recommendations:**
- Add explicit output format rules (fixes smollm3, helps phi3)
- Clarify assessment flow instructions (fixes phi3 hallucination)
- Strengthen context emphasis (improves all models)
- Consider model-specific prompt variations (optional advanced)

---

## Current Prompt Structure Analysis

### Token Distribution
```
[TIER 1 - Base System]           ~875 tokens  (0-875)
[TIER 2 - Situational]           ~650 tokens  (875-1525)
[TIER 3 - Organization Context]  ~150 tokens  (1525-1675)
[CONVERSATION HISTORY]           Variable     (1675-?)
[CURRENT USER MESSAGE]           ~20 tokens   (end)

Total: ~2300 tokens (varies by prompt)
```

### Information Flow
```
Identity → Capabilities → Style → Assessment Parser → Framework Expertise → Org Context → Question
```

**Issue:** Organization context comes LAST, after model has processed 1500+ tokens of general instructions.

---

## Problem 1: phi3 Hallucination (CRITICAL)

### What's Happening

**phi3 creates fabricated dialogues:**
```
[USER RESPONSE]
We have consent forms for users, but we don't have a clear mechanism
for users to withdraw their consent...

[ARIONCOMPLY AI]
Thank you for sharing that information. Based on your response...
```

**This never happened.** User only asked "What are my biggest GDPR compliance gaps?"

### Root Cause Analysis

**Current Assessment Mode instructions (TIER 2, lines 93-108):**
```
You are guiding the user through a compliance gap assessment. Your goal is to:
1. Ask clear, focused questions about their current compliance status
2. Parse their responses to extract compliance status and evidence
3. Guide them through all applicable controls systematically
...

Assessment Flow:
- Present one control or requirement at a time
- Ask if they have implemented it (YES/NO/PARTIAL/NOT_APPLICABLE)
- Request evidence or documentation if they claim implementation
- Record gaps and provide guidance on remediation
```

**Problem:**
- "Parse their responses" - phi3 interprets as "show an example of parsing"
- No explicit instruction to WAIT for actual user input
- Reads like a roleplay scenario description

**Why phi3 fails here:**
- Tries to be "helpful" by showing what the flow looks like
- Interprets instructions as "demonstrate the assessment process"
- Creates example dialogue to illustrate the pattern

### Recommended Fix

**Add explicit constraints to Assessment Mode (TIER 2):**

```diff
Assessment Mode Active

You are guiding the user through a compliance gap assessment. Your goal is to:
1. Ask clear, focused questions about their current compliance status
2. Parse their responses to extract compliance status and evidence
3. Guide them through all applicable controls systematically
4. Provide encouraging feedback and next steps

+ CRITICAL INSTRUCTION: Do NOT create fictional user responses or example dialogues.
+ You must WAIT for the actual user to provide their answers. Never invent what
+ the user might say or create [USER RESPONSE] sections in your output.

Assessment Flow:
- Present one control or requirement at a time
- Ask if they have implemented it (YES/NO/PARTIAL/NOT_APPLICABLE)
+ - WAIT for the user's actual response (do not invent an answer)
- Request evidence or documentation if they claim implementation
- Record gaps and provide guidance on remediation
- Track progress and show completion percentage

+ Output Format:
+ - Provide ONLY your questions or guidance
+ - Do NOT include [USER RESPONSE] or similar labels
+ - Do NOT create example dialogues showing what the user might say
+ - Respond only to actual user messages, never to imagined ones

Keep the conversation flowing naturally while ensuring comprehensive coverage of all requirements.
```

**Expected Impact:**
- ✅ Eliminates hallucinated dialogues
- ✅ Makes waiting behavior explicit
- ✅ Prevents "example" interpretation

---

## Problem 2: smollm3 Think Tags (MODERATE)

### What's Happening

**Every smollm3 response starts with:**
```
<think>

</think>
Actual response content here...
```

### Root Cause

**Model training:** smollm3 was likely trained with chain-of-thought reasoning that includes thinking tags. Without explicit output constraints, it naturally includes them.

### Recommended Fix

**Option A: Add Output Format Section to TIER 1**

Add after "Communication Style" section:

```diff
Communication Style:
- Professional yet approachable
- Use clear, jargon-free language when possible
- Provide step-by-step guidance for implementation questions
- Cite specific articles, controls, or requirements when relevant
- Ask clarifying questions when user intent is ambiguous

+ Output Format Rules:
+ - Output only your response text
+ - Do NOT include reasoning tags (like <think>, <reasoning>, etc.)
+ - Do NOT include meta-commentary about your thought process
+ - Do NOT include XML-style tags in your output
+ - Provide clean, professional text without markup or annotations
```

**Option B: Post-Processing Filter (Easier)**

Add to result processing pipeline:
```javascript
response = response.replace(/<think>.*?<\/think>/gs, '').trim();
```

**Recommendation:** Use BOTH
- Add output format rules (helps future models too)
- Add post-processing filter as safety net
- Total cost: ~30 tokens to prompt, negligible processing time

---

## Problem 3: Context Usage Inconsistency (MODERATE)

### What's Happening

**mistral (GOOD):**
```
"Given that your organization is in the Healthcare industry,
is EU-based, and has 1-50 employees, I'll tailor my guidance
to your specific context."
```

**phi3 (BAD):**
```
"Understood! Let's begin by assessing your GDPR compliance..."
[No mention of Healthcare, size, or maturity]
```

### Root Cause

**TIER 3 placement:** Organization context appears at position 1525/2300 tokens (~66% through prompt).

**Attention theory:**
- Models pay more attention to beginning and end of prompts
- Middle sections can get "diluted" in long contexts
- First impression (TIER 1) and last impression (user message) dominate

**Current TIER 3:**
```
[TIER 3 - Organization Context]
Organization Context:
- Industry: Healthcare
- Organization Size: 1-50 employees
- Region: EU
- Licensed Frameworks: GDPR
- Compliance Maturity: Initial
- Profile Completion: 30%

Your organization is just beginning its compliance journey. Focus on
understanding requirements and building foundational policies.

Tailor your responses to this organization's industry, size, and maturity
level. Use relevant examples from the Healthcare industry when possible.
```

**Issue:** Asks model to "tailor responses" but doesn't emphasize HOW CRITICAL this is.

### Recommended Fix

**Option A: Move TIER 3 Earlier (Structural Change)**

Reorder to: TIER 1 → TIER 3 → TIER 2 → Message

**Pros:**
- Context appears early when model attention is high
- Model "knows the audience" before getting detailed instructions
- Follows pattern: Who am I? → Who are you? → What should I do?

**Cons:**
- Requires restructuring prompt assembly
- Changes established pattern

---

**Option B: Strengthen Context Emphasis (Tactical Change)**

**B1: Add context reminder to TIER 1 (at the very beginning):**

```diff
+ CRITICAL: You are currently advising a {industry} organization with {size}
+ employees in the {region} region. They are at {maturity} compliance maturity.
+ EVERY response MUST be tailored to this specific organizational context.
+ Use industry-specific examples relevant to {industry}.

You are ArionComply AI, an expert compliance advisor specializing in
data protection, privacy regulations, and information security standards...
```

**B2: Add context reminder at the very end (after user message):**

```diff
[CURRENT USER MESSAGE]
{user question}

+ CONTEXT REMINDER: This user is from a {industry} organization ({size} employees)
+ in the {region} region at {maturity} maturity level. Tailor your response accordingly.
```

**Recommendation:** Use **Option B2** (add reminder after user message)
- Minimal token cost (~40 tokens)
- Leverages recency bias (last thing model reads)
- Doesn't disrupt existing structure
- Easy to implement

---

**Option C: Hybrid Approach (RECOMMENDED)**

1. Add brief context mention in TIER 1 opening
2. Keep TIER 3 in current position (provides full detail)
3. Add reminder after user message (emphasizes importance)

**Structure:**
```
[TIER 1 - Base System Prompt]
ADDRESSING: {industry} org, {size} employees, {region}, {maturity} maturity
You are ArionComply AI, an expert compliance advisor...
[rest of TIER 1]

[TIER 2 - Situational Context]
[Assessment mode + Framework expertise]

[TIER 3 - Organization Context]
[Full org profile details]

[CONVERSATION HISTORY]
[Previous messages if any]

[CURRENT USER MESSAGE]
{question}

IMPORTANT: Tailor your response to this {industry} organization at {maturity} maturity level.
```

**Token cost:** ~50 tokens total
**Effectiveness:** High - context appears 3 times (beginning, middle, end)

---

## Problem 4: Assessment Instructions Ambiguity

### Current Wording Issues

**Line 95-96 (TIER 2 Assessment Mode):**
```
1. Ask clear, focused questions about their current compliance status
2. Parse their responses to extract compliance status and evidence
```

**Ambiguity:** "Parse their responses" could mean:
- ❌ "Show an example of what parsing looks like" (phi3 interpretation)
- ✅ "When they answer, extract the data" (intended meaning)

### Recommended Fix

**Make temporal sequence explicit:**

```diff
You are guiding the user through a compliance gap assessment. Your goal is to:
- 1. Ask clear, focused questions about their current compliance status
- 2. Parse their responses to extract compliance status and evidence
+ 1. Ask clear, focused questions about their current compliance status
+ 2. WAIT for the user to provide their actual answer
+ 3. Parse the user's actual response (not a fabricated example) to extract compliance status and evidence
- 3. Guide them through all applicable controls systematically
- 4. Provide encouraging feedback and next steps
+ 4. Guide them through all applicable controls systematically
+ 5. Provide encouraging feedback and next steps
```

**Add after Assessment Flow section:**

```diff
Keep the conversation flowing naturally while ensuring comprehensive coverage of all requirements.

+ CRITICAL RULES FOR ASSESSMENT MODE:
+ - NEVER create fictional user responses or example dialogues
+ - NEVER add [USER RESPONSE] labels or simulate user input
+ - ONLY respond to actual messages from the user
+ - If asking questions, STOP and wait for user to answer
+ - Do not "demonstrate" the assessment process with fake examples
```

---

## Proposed Optimized Prompt Structure

### TIER 1 Changes (Base System)

**Add at the very beginning:**

```
CONTEXT: Advising a {industry} organization ({size} employees, {region} region, {maturity} maturity)

You are ArionComply AI, an expert compliance advisor...

[Rest of existing TIER 1 content]

Output Format Rules:
- Provide only your response text
- Do NOT include reasoning tags (e.g., <think>, <reasoning>)
- Do NOT create fictional dialogues or example user responses
- Do NOT add [USER RESPONSE], [ASSISTANT], or similar labels
- Output clean, professional text without meta-commentary or markup
```

**Token cost:** +80 tokens
**Fixes:** smollm3 think tags, phi3 dialogue fabrication, improves context awareness

---

### TIER 2 Changes (Assessment Mode)

**Clarify assessment instructions:**

```diff
Assessment Mode Active

You are guiding the user through a compliance gap assessment. Your goal is to:
- 1. Ask clear, focused questions about their current compliance status
- 2. Parse their responses to extract compliance status and evidence
- 3. Guide them through all applicable controls systematically
- 4. Provide encouraging feedback and next steps
+ 1. Ask clear, focused questions about their current compliance status
+ 2. WAIT for the user to respond (do not invent responses)
+ 3. When user provides their actual answer, parse it to extract status and evidence
+ 4. Guide them systematically through all applicable controls
+ 5. Provide encouraging feedback and next steps

Assessment Flow:
- Present one control or requirement at a time
- Ask if they have implemented it (YES/NO/PARTIAL/NOT_APPLICABLE)
+ - WAIT for user's actual response before proceeding
- Request evidence or documentation if they claim implementation
- Record gaps and provide guidance on remediation
- Track progress and show completion percentage

+ CRITICAL: Never create [USER RESPONSE] sections or fictional dialogues.
+ Only respond to actual user messages. If asking questions, STOP and wait.

Keep the conversation flowing naturally while ensuring comprehensive coverage of all requirements.
```

**Token cost:** +60 tokens
**Fixes:** phi3 hallucination issue

---

### TIER 3 Changes (Organization Context)

**Strengthen emphasis:**

```diff
[TIER 3 - Organization Context]
Organization Context:
- Industry: {industry}
- Organization Size: {size} employees
- Region: {region}
- Licensed Frameworks: {frameworks}
- Compliance Maturity: {maturity}
- Profile Completion: {completion}%

{maturity_guidance}

- Tailor your responses to this organization's industry, size, and maturity level. Use relevant examples from the {industry} industry when possible.
+ MANDATORY: Every response MUST be tailored to this specific organizational context.
+ - Reference the {industry} industry in your examples
+ - Consider the {size} employee organization size in your recommendations
+ - Match guidance to {maturity} maturity level
+ - Use {region}-relevant regulatory context when applicable
```

**Token cost:** +40 tokens
**Fixes:** Improves context awareness across all models

---

### Post-Message Context Reminder (NEW)

**Add after [CURRENT USER MESSAGE]:**

```
CONTEXT REMINDER: {industry} organization, {size} employees, {region}, {maturity} maturity.
Tailor your response to this specific context.
```

**Token cost:** +25 tokens
**Rationale:** Leverages recency bias - last thing model reads before responding

---

## Complete Optimized Prompt Structure

### Recommended Order

```
[TIER 1 - Base System Prompt]
├─ CONTEXT LINE: "Advising {industry} org, {size} employees, {maturity} maturity"
├─ Identity & Capabilities
├─ Communication Style
├─ OUTPUT FORMAT RULES (NEW - prevents hallucination & think tags)
├─ Assessment Parser Instructions
└─ Clarification Protocol

[TIER 2 - Situational Context]
├─ Assessment Mode (CLARIFIED - explicit wait instructions)
└─ Framework Expertise (GDPR/ISO 27001)

[TIER 3 - Organization Context]
├─ Org Profile (industry, size, region, frameworks, maturity)
├─ Maturity Guidance
└─ Context Usage Mandate (STRENGTHENED)

[CONVERSATION HISTORY]
└─ Previous messages (if any)

[CURRENT USER MESSAGE]
└─ User question

[CONTEXT REMINDER] (NEW)
└─ Brief context restatement
```

**Total token increase:** ~205 tokens (from ~2300 to ~2505 avg)
**Still well under** 3000-token comfortable range for most models

---

## Specific Text Additions

### TIER 1: Output Format Section (NEW - Insert after Communication Style)

```
Output Format Rules:
- Provide only your direct response to the user
- Do NOT include reasoning tags (such as <think>, <reasoning>, <reflection>)
- Do NOT create fictional dialogues or example conversations
- Do NOT add labels like [USER RESPONSE], [ASSISTANT], [ARIONCOMPLY AI]
- Do NOT simulate multi-turn conversations in a single response
- Output clean, professional text without meta-commentary or XML markup

If you need to structure information, use standard markdown formatting:
- Bullet points (- or *)
- Numbered lists (1., 2., 3.)
- Bold (**text**) for emphasis
- Code blocks (```) for JSON or technical content
```

**Addresses:**
- ✅ smollm3 think tags ("Do NOT include reasoning tags")
- ✅ phi3 fabricated dialogues ("Do NOT create fictional dialogues")
- ✅ Professional output format ("clean, professional text")

---

### TIER 2: Assessment Mode Clarification (MODIFY existing)

**Current (problematic):**
```
Assessment Flow:
- Present one control or requirement at a time
- Ask if they have implemented it (YES/NO/PARTIAL/NOT_APPLICABLE)
- Request evidence or documentation if they claim implementation
- Record gaps and provide guidance on remediation
```

**Optimized:**
```
Assessment Flow (Follow this sequence):
1. Present ONE control or requirement
2. Ask if they have implemented it (YES/NO/PARTIAL/NOT_APPLICABLE)
3. STOP and WAIT for the user's actual response
4. When user responds, parse their ACTUAL answer (never invent responses)
5. Request evidence if they claim implementation
6. Provide gap analysis and remediation guidance
7. Move to next control

CRITICAL RULES:
- NEVER create [USER RESPONSE] sections in your output
- NEVER invent what the user might say
- NEVER simulate a back-and-forth dialogue in one response
- ONLY respond to actual user messages
- If you ask a question, your response ends there - wait for user
```

**Addresses:**
- ✅ phi3 hallucination (explicit "never invent")
- ✅ Temporal sequencing (numbered steps with STOP/WAIT)
- ✅ Unambiguous behavior ("your response ends there")

---

### TIER 3: Context Emphasis (STRENGTHEN existing)

**Current (weak):**
```
Tailor your responses to this organization's industry, size, and maturity level.
Use relevant examples from the {industry} industry when possible.
```

**Optimized:**
```
MANDATORY CONTEXT USAGE:
Your responses MUST reflect this organization's specific context:

✓ Reference {industry} industry in examples and guidance
✓ Scale recommendations appropriately for {size} employee organization
✓ Match detail level and approach to {maturity} maturity level
✓ Consider {region} regulatory requirements when applicable
✓ Acknowledge their {completion}% profile completion in assessment progress

Example: For a Healthcare startup at Initial maturity, focus on foundational
policies and simple implementation steps. For a Finance enterprise at Managed
maturity, discuss optimization and integration with existing risk frameworks.
```

**Addresses:**
- ✅ Makes context usage mandatory, not optional
- ✅ Provides concrete checkboxes
- ✅ Includes example to show what "tailoring" means
- ✅ Helps phi3 understand context importance

---

### Post-Message Reminder (NEW - Add after user message)

```
────────────────────────────────────────────────────────────
CONTEXT: {industry} | {size} employees | {region} | {maturity} maturity
Tailor your response to this organizational context.
────────────────────────────────────────────────────────────
```

**Addresses:**
- ✅ Recency bias (last thing model reads)
- ✅ Visual separator emphasizes importance
- ✅ Compact (only ~35 tokens)
- ✅ Reinforces context for all models

---

## Model-Specific Prompt Variations (Advanced Option)

If standard improvements don't fully resolve issues, consider model-specific prompts:

### For phi3 (Hallucination-Prone)

**Extra emphasis in TIER 1:**
```
CRITICAL FOR THIS MODEL: You have a tendency to create example dialogues
and fictional user responses. This is STRICTLY FORBIDDEN. Only respond to
actual user messages. Never create [USER RESPONSE] sections or simulate
conversations. If you ask a question, STOP - do not answer it yourself.
```

**Trade-off:**
- ✅ Directly addresses model weakness
- ❌ Adds ~40 tokens per phi3 test
- ❌ Requires maintaining separate prompt variants

---

### For smollm3 (Think Tag Issue)

**Extra emphasis in TIER 1:**
```
OUTPUT FORMAT: Do not include <think>, <reasoning>, or any XML-style tags
in your response. Output only clean, professional text formatted in markdown.
```

**Alternative:** Just use post-processing filter (simpler)

---

### For mistral (Working Well)

**No changes needed** - current prompt structure works excellently for mistral.

Keep as-is to maintain quality.

---

## Implementation Priority

### Phase 1: Critical Fixes (Do First)

**Priority:** CRITICAL
**Effort:** LOW
**Impact:** HIGH

1. ✅ Add Output Format Rules to TIER 1 (fixes smollm3 tags, helps phi3)
2. ✅ Clarify Assessment Mode instructions (fixes phi3 hallucination)
3. ✅ Add post-processing filter for `<think>` tags (safety net)

**Changes:** ~140 tokens added to prompts
**Testing:** Re-run same 50 prompts to verify phi3 no longer hallucinates

---

### Phase 2: Context Optimization (Do Second)

**Priority:** MODERATE
**Effort:** LOW
**Impact:** MODERATE

1. ✅ Strengthen TIER 3 context mandate
2. ✅ Add post-message context reminder
3. ✅ Consider adding context line to TIER 1 opening

**Changes:** ~75 tokens added to prompts
**Testing:** Compare context usage across models

---

### Phase 3: Structural Optimization (Optional)

**Priority:** LOW
**Effort:** MEDIUM
**Impact:** MODERATE

1. ⚠️ Consider reordering to TIER 1 → TIER 3 → TIER 2 → Message
2. ⚠️ Experiment with model-specific prompt variants
3. ⚠️ A/B test different context placement strategies

**Changes:** Structural refactoring
**Testing:** Comprehensive comparison tests

---

## Expected Outcomes by Model

### After Phase 1 (Critical Fixes)

**phi3:**
- ✅ Should eliminate fabricated dialogues
- ✅ Clearer about waiting for user responses
- 📊 Expected: hallucination rate 100% → 0%

**smollm3:**
- ✅ May reduce think tags (explicit instruction)
- ✅ Post-processing ensures clean output regardless
- 📊 Expected: think tags filtered to 0%

**mistral:**
- ✅ Already compliant, maintains current quality
- ✅ May become even more consistent
- 📊 Expected: quality remains at 5/5

---

### After Phase 2 (Context Optimization)

**All models:**
- ✅ Increased context awareness and tailoring
- ✅ More industry-specific examples
- ✅ Better maturity-appropriate guidance
- 📊 Expected: phi3 context usage improves from 30% → 70%+

---

## Testing Validation Plan

### Test Set for Validation

**Create mini test suite (15 prompts × 3 models = 45 tests):**
- 5 assessment mode prompts (test phi3 hallucination fix)
- 5 factual knowledge prompts (test overall quality)
- 5 context-heavy prompts (test context usage improvement)

**Run with:**
1. Current prompts (baseline)
2. Phase 1 optimized prompts
3. Phase 2 optimized prompts

**Compare:**
- Hallucination rate (phi3)
- Think tag frequency (smollm3)
- Context usage score (all models)
- Overall response quality ratings

---

## Concrete Next Steps

**Immediate (Do Today):**

1. **Modify TIER 1** - Add Output Format Rules section
2. **Modify TIER 2** - Clarify Assessment Mode with explicit wait instructions
3. **Modify assembleFullPrompt()** - Add post-message context reminder
4. **Add post-processing** - Filter `<think>` tags from smollm3 responses
5. **Test with 5 prompts** - Verify phi3 no longer hallucinates

**Short-term (This Week):**

1. **Full re-test** - Run all 50 prompts with optimized structure
2. **Compare results** - Original vs optimized quality scores
3. **Measure improvement** - Hallucination rate, context usage, think tags
4. **Document findings** - Update quality evaluation with new results

**Long-term (Optional):**

1. **Structural experiments** - Test TIER 3 repositioning
2. **Model-specific variants** - If standard fixes insufficient
3. **RAG context integration** - Add retrieved document simulation

---

## Token Budget Analysis

### Current Prompts
```
TIER 1: ~875 tokens
TIER 2: ~650 tokens
TIER 3: ~150 tokens
Message: ~20 tokens
───────────────────
Total: ~1695 tokens (before user message)
       ~2300 tokens (with assembled conversation history in some prompts)
```

### After Phase 1 + Phase 2 Optimizations
```
TIER 1: ~955 tokens (+80 for output rules, +15 for context line)
TIER 2: ~710 tokens (+60 for clarified instructions)
TIER 3: ~190 tokens (+40 for strengthened mandate)
Reminder: ~25 tokens (new post-message reminder)
Message: ~20 tokens
───────────────────
Total: ~1900 tokens (before user message)
       ~2500 tokens (full prompt)
```

**Token increase:** +200 tokens (~9% increase)
**Acceptable:** Yes - still well under 3000-token budget
**Worth it:** Yes - fixes critical hallucination issue

---

## Risk Analysis

### Risks of NOT Optimizing

**phi3 hallucination (CRITICAL):**
- ❌ Compliance assessments based on fake data
- ❌ Users trusting fabricated gap analysis
- ❌ Reputation damage if deployed to production
- ❌ Legal liability (incorrect compliance advice)

**smollm3 think tags (MODERATE):**
- ⚠️ Unprofessional output format
- ⚠️ Token waste (~5-10 tokens per response)
- ⚠️ Confusing for end users

**Inconsistent context usage (MODERATE):**
- ⚠️ Generic advice not helpful for specific orgs
- ⚠️ Missed opportunity to add value through personalization
- ⚠️ Users may feel advice is "boilerplate"

### Risks of Optimizing

**Minimal risks:**
- ✅ Token increase is acceptable (+9%)
- ✅ Changes are additive (don't break existing behavior)
- ✅ Can A/B test before full deployment
- ⚠️ Need to re-test all prompts to verify improvement

**Mitigation:**
- Test on subset first (15 prompts)
- Compare before/after quality scores
- Rollback if quality degrades (unlikely)

---

## Recommendation Summary

**Implement Phases 1 & 2 immediately:**

1. Add Output Format Rules (TIER 1) - 80 tokens
2. Clarify Assessment Mode (TIER 2) - 60 tokens
3. Strengthen Context Mandate (TIER 3) - 40 tokens
4. Add Post-Message Reminder - 25 tokens
5. Add post-processing filter for think tags

**Total cost:** ~205 tokens, 1 hour of testing

**Expected results:**
- ✅ phi3 hallucination: 100% → 0%
- ✅ smollm3 think tags: 100% → 0%
- ✅ Context usage: All models improve
- ✅ Overall quality: Significant improvement across board

**ROI:** High - fixes critical production blocker with minimal cost

---

## Specific Code Changes Required

### File: `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js`

**Change 1: Update TIER1_BASE_SYSTEM (line 61)**

Insert after line 87 (after Communication Style section):

```javascript
const TIER1_BASE_SYSTEM = `You are ArionComply AI, an expert compliance advisor...

Communication Style:
- Professional yet approachable
- Use clear, jargon-free language when possible
- Provide step-by-step guidance for implementation questions
- Cite specific articles, controls, or requirements when relevant
- Ask clarifying questions when user intent is ambiguous

Output Format Rules:
- Provide only your direct response to the user
- Do NOT include reasoning tags (such as <think>, <reasoning>, <reflection>)
- Do NOT create fictional dialogues or example user responses
- Do NOT add labels like [USER RESPONSE], [ASSISTANT], or [ARIONCOMPLY AI]
- Do NOT simulate multi-turn conversations in a single response
- Output clean, professional text formatted in markdown without meta-commentary

When helping with assessments:
- Parse natural language responses into structured data
...
```

---

**Change 2: Update TIER2_PROMPTS.ASSESSMENT (line 93)**

```javascript
ASSESSMENT: `Assessment Mode Active

You are guiding the user through a compliance gap assessment. Your goal is to:
1. Ask clear, focused questions about their current compliance status
2. WAIT for the user to respond (do not invent or assume their answers)
3. When user provides their actual answer, parse it to extract status and evidence
4. Guide them systematically through all applicable controls
5. Provide encouraging feedback and next steps

Assessment Flow (Follow This Sequence):
- Present ONE control or requirement at a time
- Ask if they have implemented it (YES/NO/PARTIAL/NOT_APPLICABLE)
- STOP and WAIT for user's actual response
- When user answers, parse their actual response (never fabricate examples)
- Request evidence or documentation if they claim implementation
- Record gaps and provide guidance on remediation
- Track progress and show completion percentage

CRITICAL ASSESSMENT RULES:
- NEVER create [USER RESPONSE] sections or fictional user answers
- NEVER simulate multi-turn dialogues in one response
- ONLY respond to actual messages from the user
- If you ask questions, your response ENDS there - wait for user input
- Do not "demonstrate" the process with fake examples

Keep the conversation flowing naturally while ensuring comprehensive coverage of all requirements.`,
```

---

**Change 3: Update buildTier3Context() (line 249)**

```javascript
function buildTier3Context(orgProfile) {
  const maturityGuidance = {
    'Initial': 'Your organization is just beginning its compliance journey. Focus on understanding requirements and building foundational policies.',
    'Developing': 'Your organization has basic compliance practices in place. Focus on systematizing processes and filling gaps.',
    'Defined': 'Your organization has documented compliance processes. Focus on optimization and continuous improvement.',
    'Managed': 'Your organization has mature compliance practices. Focus on efficiency and integration with business processes.',
    'Optimizing': 'Your organization has advanced compliance maturity. Focus on innovation and thought leadership.'
  };

  const frameworkList = orgProfile.frameworks.join(', ');
  const guidance = maturityGuidance[orgProfile.maturity_level];

  return `Organization Context:
- Industry: ${orgProfile.industry}
- Organization Size: ${orgProfile.org_size} employees
- Region: ${orgProfile.region}
- Licensed Frameworks: ${frameworkList}
- Compliance Maturity: ${orgProfile.maturity_level}
- Profile Completion: ${orgProfile.profile_completion}%

${guidance}

MANDATORY CONTEXT USAGE:
Your responses MUST be tailored to this specific organizational context:
- Reference ${orgProfile.industry} industry in your examples
- Scale recommendations for ${orgProfile.org_size} employee organization
- Match guidance to ${orgProfile.maturity_level} maturity level
- Use ${orgProfile.region}-relevant regulatory context when applicable

Every response should demonstrate understanding of this organization's unique situation.`;
}
```

---

**Change 4: Update assembleFullPrompt() (line 277)**

Add context reminder after user message:

```javascript
function assembleFullPrompt(tier1, tier2, tier3, conversationHistory, userQuery) {
  let prompt = `[TIER 1 - Base System Prompt]\n${tier1}\n\n`;
  prompt += `[TIER 2 - Situational Context]\n${tier2}\n\n`;
  prompt += `[TIER 3 - Organization Context]\n${tier3}\n\n`;

  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `[CONVERSATION HISTORY]\n`;
    conversationHistory.forEach((msg, idx) => {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    prompt += `\n`;
  }

  prompt += `[CURRENT USER MESSAGE]\n${userQuery}`;

  // NEW: Add context reminder after user message
  const contextMatch = tier3.match(/Industry: (\w+).*?Size: ([\d\-+]+).*?Maturity: (\w+)/s);
  if (contextMatch) {
    const [_, industry, size, maturity] = contextMatch;
    prompt += `\n\n────────────────────────────────────────────────────────────\n`;
    prompt += `CONTEXT: ${industry} | ${size} employees | ${maturity} maturity\n`;
    prompt += `Tailor your response to this organizational context.\n`;
    prompt += `────────────────────────────────────────────────────────────`;
  }

  return prompt;
}
```

---

## Validation Test Plan

### Before/After Comparison Test

**Test Set:** 15 prompts (5 assessment + 5 factual + 5 context-heavy)

**Metrics to measure:**
1. **Hallucination Rate** (phi3):
   - Count prompts with [USER RESPONSE] sections
   - Target: 100% → 0%

2. **Think Tag Frequency** (smollm3):
   - Count responses with `<think>` tags
   - Target: 100% → 0% (with post-processing)

3. **Context Usage Score** (all models):
   - Does response mention industry? (1 point)
   - Does response mention org size? (1 point)
   - Does response adjust for maturity level? (1 point)
   - Does response use industry-specific examples? (2 points)
   - Target: 3+ points per response (60%+)

4. **Overall Quality Rating** (subjective):
   - 1-5 stars per response
   - Target: Average 4+ stars for all models

### Success Criteria

**Phase 1 successful if:**
- ✅ Zero phi3 hallucinations on all 15 test prompts
- ✅ Zero think tags in cleaned smollm3 output
- ✅ No quality degradation on mistral

**Phase 2 successful if:**
- ✅ Context usage score improves by 30%+ (all models)
- ✅ More industry-specific examples observed
- ✅ Maturity-appropriate detail levels

---

## Conclusion

**Current multi-tier prompts are good but have fixable issues:**

1. **Missing output format constraints** → Add explicit rules
2. **Ambiguous assessment instructions** → Clarify wait/parse sequence
3. **Weak context emphasis** → Strengthen mandate and add reminders

**Proposed changes are:**
- ✅ Low effort (~4 sections to modify)
- ✅ Low risk (additive, not destructive)
- ✅ High impact (fixes critical hallucination issue)
- ✅ Testable (clear before/after metrics)

**Recommended approach:**
1. Implement Phase 1 changes (critical fixes)
2. Run validation test (15 prompts)
3. If successful, implement Phase 2 (context optimization)
4. Run full 50-prompt test suite
5. Compare quality scores before/after

**Timeline:** 2-3 hours of work for significant quality improvement.
