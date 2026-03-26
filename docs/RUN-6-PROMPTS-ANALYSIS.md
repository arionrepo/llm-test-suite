# Run 6 MULTITIER Prompts - Complete Analysis

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/docs/RUN-6-PROMPTS-ANALYSIS.md
**Description:** Detailed analysis of the 10 prompts used in Run 6 (MULTITIER) test execution
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

---

## Overview

Run 6 tested 10 distinct multi-tier prompts, each with an average input size of **1000+ tokens**. These prompts represent production-grade ArionComply prompts with:

- **TIER 1:** Base system prompt (~1,875 tokens) - ArionComply AI identity
- **TIER 2:** Framework expertise (~400 tokens) - Assessment mode guidance
- **TIER 3:** Organization context (~300 tokens) - Org-specific variables
- **User query:** (~100 tokens) - The actual user message
- **Optional:** Conversation history (50-200 tokens)

---

## Quick Reference: The 10 Prompts

| # | ID | Standard | Persona | Org | Input | Output | Total |
|---|---|----------|---------|-----|-------|--------|-------|
| 1 | GDPR_NOVICE_1 | GDPR | Novice | Healthcare Startup (EU) | 951 | 307 | 1,258 |
| 2 | ISO27001_PRAC_1 | ISO 27001 | Practitioner | Finance Medium (UK) | 1,066 | 274 | 1,340 |
| 3 | GDPR_MGR_1 | GDPR | Manager | Education Nonprofit (EU) | 951 | 384 | 1,335 |
| 4 | ISO27001_PRAC_2 | ISO 27001 | Practitioner | Enterprise SaaS (US) | 1,051 | 280 | 1,331 |
| 5 | GDPR_PRAC_1 | GDPR | Practitioner | Retail Chain (Global) | 1,029 | 423 | 1,452 |
| 6 | ISO27001_MGR_1 | ISO 27001 | Manager | Finance Medium (UK) | 1,044 | 415 | 1,459 |
| 7 | GDPR_PRAC_2 | GDPR | Practitioner | Healthcare Startup (EU) | 1,004 | 228 | 1,232 |
| 8 | MULTI_FW_MGR_1 | Multi-FW | Manager | Finance Medium (UK) | 975 | 400 | 1,375 |
| 9 | ISO27001_NOV_1 | ISO 27001 | Novice | Education Nonprofit (EU) | 1,064 | 151 | 1,215 |
| 10 | GDPR_MGR_2 | GDPR | Manager | Retail Chain (Global) | 991 | 222 | 1,213 |

**Totals:**
- Average input: 1,021 tokens
- Average output: 306 tokens
- Average total: 1,327 tokens
- Min input: 951 tokens (GDPR prompts)
- Max input: 1,066 tokens (ISO 27001 prompts)

---

## Prompt Structure

Each Run 6 prompt follows this architecture:

### Assembly Order

```
[TIER 1: Base System Prompt]
  ↓
[TIER 2: Framework + Mode Context]
  ↓
[TIER 3: Organization Profile]
  ↓
[OPTIONAL: Conversation History]
  ↓
[USER MESSAGE]
```

### TIER 1: Base System Prompt (~1,875 tokens)

**Content Examples:**

```
"You are ArionComply AI, an expert compliance advisor specializing in
data protection, privacy regulations, and information security standards.

Core Capabilities:
- Provide accurate, actionable compliance guidance
- Explain complex regulatory requirements in simple terms
- Help users conduct gap assessments and identify compliance requirements
- Guide evidence collection and documentation
- Answer questions about specific controls and requirements

Communication Style:
- Professional yet approachable
- Use clear, jargon-free language when possible
- Provide step-by-step guidance for implementation questions
- Cite specific articles, controls, or requirements when relevant
- Ask clarifying questions when user intent is ambiguous

When helping with assessments:
- Parse natural language responses into structured data
- Extract YES/NO/PARTIAL compliance status from user descriptions
- Identify evidence and implementation details from narrative responses
- Format extracted data as JSON when appropriate"
```

**Purpose:**
- Establishes ArionComply AI identity
- Defines core capabilities and communication style
- Instructs on assessment parsing and extraction
- Same for all 10 prompts (consistent baseline)

### TIER 2: Framework + Mode (~400 tokens)

**TIER 2A - Assessment Mode:**
```
"You are guiding the user through a compliance gap assessment. Your goal is to:

1. Ask clear, focused questions about current compliance status
2. Parse responses to extract compliance status and evidence
3. Guide through all applicable controls systematically
4. Provide encouraging feedback and next steps
5. Keep track of assessment progress

For each control or requirement:
- Ask whether the organization has implemented it
- Request brief description of current state
- Identify any gaps or improvements needed
- Suggest next steps for remediation"
```

**TIER 2B - Framework Expertise (GDPR Example):**
```
"GDPR Assessment Focus:

Key Requirements to Assess:
- Lawful basis for processing (Article 6)
- Consent management (Article 7)
- Data subject rights (Articles 12-22)
- Data protection by design (Article 25)
- Data protection impact assessment (Article 35)
- Data breach notification (Article 33)
- Records of processing (Article 30)
- International transfers (Chapter 5)

Compliance Indicators:
- Privacy policy aligned with GDPR
- Consent mechanisms implemented
- Data subject rights available
- Incident response plan documented
- DPA agreement in place (if applicable)
- Regular compliance training conducted"
```

**TIER 2B - Framework Expertise (ISO 27001 Example):**
```
"ISO 27001 Assessment Focus:

Core Control Areas:
- A.5: Policies (3 controls)
- A.6: Organization (3 controls)
- A.7: Human resources (2 controls)
- A.8: Asset management (6 controls)
- A.9: Access control (7 controls)
- A.10: Cryptography (2 controls)
- A.11: Physical/environmental (2 controls)
- A.12: Operations (6 controls)
- A.13: Communications security (3 controls)
- A.14: System acquisition/development (4 controls)
- A.15: Supplier relationships (2 controls)
- A.16: Information security incident (3 controls)
- A.17: Business continuity (3 controls)
- A.18: Compliance (2 controls)"
```

### TIER 3: Organization Profile (~300 tokens)

**TIER 3 - Healthcare Startup (EU):**
```
"Organization Context:
- Industry: Healthcare / Medical Technology
- Organization Size: 1-50 employees
- Region: European Union
- Licensed Frameworks: GDPR, HIPAA
- Compliance Maturity: Initial
- Profile Completion: 60%

Guidance for Responses:
- This is a startup with foundational compliance work
- Focus on getting fundamentals right first
- Acknowledge resource constraints for small team
- Recommend phased implementation approach
- Prioritize high-risk controls
- Use GDPR+HIPAA overlap where possible"
```

**TIER 3 - Finance Services (UK, Developing):**
```
"Organization Context:
- Industry: Financial Services / Banking
- Organization Size: 50-250 employees
- Region: United Kingdom
- Licensed Frameworks: GDPR, ISO 27001, SOC 2
- Compliance Maturity: Developing
- Profile Completion: 75%

Guidance for Responses:
- Organization has implemented basic controls
- Has dedicated compliance/security personnel
- Can handle moderate complexity assessment
- Should focus on evidence documentation
- Consider regulatory interaction points
- Address interconnected framework requirements"
```

---

## The 10 Prompts in Detail

### Prompt 1: GDPR_NOVICE_1 (951 tokens input)

**Organization:** Healthcare Startup, EU, Initial Maturity
**Persona:** Novice (decision-maker, limited compliance knowledge)
**Mode:** GDPR Gap Assessment
**Query:** "I want to assess my GDPR compliance"

**What the Model Sees:**
- TIER 1: Base ArionComply system prompt (1,875 tokens)
- TIER 2: Assessment mode + GDPR framework (400 tokens)
- TIER 3: Healthcare startup context (300 tokens)
- User query: "I want to assess my GDPR compliance" (5 tokens)

**Expected Response Type:** Introductory GDPR assessment question
**Average Output:** 307 tokens
**Expected Topics:** GDPR gap assessment, questionnaire start, first question

---

### Prompt 2: ISO27001_PRAC_1 (1,066 tokens input)

**Organization:** Finance Services (Medium), UK, Developing Maturity
**Persona:** Practitioner (hands-on, compliance experience)
**Mode:** ISO 27001 Assessment
**Query:** "Yes, we have implemented encryption for data at rest using AES-256, and we maintain encryption key management procedures in our security policy document"

**What's Different:**
- User is responding to a previous assessment question (practitioner follow-up)
- More technical language expected
- Requires parsing compliance evidence from narrative
- Assessment is mid-stream (conversation history included)

**Expected Response Type:** Parse evidence, assess control status, ask follow-up
**Average Output:** 274 tokens
**Expected Topics:** Encryption assessment, control validation, next question

---

### Prompt 3: GDPR_MGR_1 (951 tokens input)

**Organization:** Education Nonprofit, EU, Initial Maturity
**Persona:** Manager (strategic perspective)
**Mode:** GDPR Gap Assessment
**Query:** "What are my biggest GDPR compliance gaps?"

**What's Different:**
- Different org context (nonprofit education)
- Manager seeks strategic overview, not step-by-step
- Query implies they want summary/prioritization
- Still uses same GDPR framework as Prompt 1

**Expected Response Type:** Gap summary with prioritized action items
**Average Output:** 384 tokens (longest in test)
**Expected Topics:** Key GDPR gaps, prioritization, remediation roadmap

---

### Prompt 4: ISO27001_PRAC_2 (1,051 tokens input)

**Organization:** Enterprise SaaS, US, Managed Maturity
**Persona:** Practitioner (hands-on, experienced)
**Mode:** ISO 27001 Assessment
**Query:** "What kind of evidence do you need for access control?"

**What's Different:**
- Large enterprise (1000+ employees)
- US-based (different regulatory context)
- Managed maturity (mature compliance program)
- Conversation history included (mid-stream)
- Practitioner asking specific control question

**Expected Response Type:** Access control evidence requirements
**Average Output:** 280 tokens
**Expected Topics:** Access control evidence, documentation types, audit trails

---

### Prompt 5: GDPR_PRAC_1 (1,029 tokens input)

**Organization:** Retail Chain (Global), Defined Maturity
**Persona:** Practitioner (hands-on)
**Mode:** GDPR Assessment
**Query:** "We have a privacy policy but it's not up to date with GDPR requirements, and we haven't implemented all the required information disclosures"

**What's Different:**
- Global retail operation (complex data flows)
- Defined maturity level (well-developed compliance)
- Self-identified gap (privacy policy outdated)
- Looking for guidance on remediation

**Expected Response Type:** Privacy policy remediation guidance
**Average Output:** 423 tokens (second longest)
**Expected Topics:** Privacy policy updates, disclosure requirements, implementation steps

---

### Prompt 6: ISO27001_MGR_1 (1,044 tokens input)

**Organization:** Finance Services (Medium), UK, Developing Maturity
**Persona:** Manager (strategic)
**Mode:** ISO 27001 Assessment
**Query:** "Can you summarize our assessment results?"

**What's Different:**
- Manager perspective (wants overview, not details)
- Assessment in advanced stage (previous conversation history)
- Requires synthesis of prior assessment progress
- Different from novice request (has context)

**Expected Response Type:** Assessment summary and progress report
**Average Output:** 415 tokens (second longest)
**Expected Topics:** Compliance summary, implementation status, next priorities

---

### Prompt 7: GDPR_PRAC_2 (1,004 tokens input)

**Organization:** Healthcare Startup, EU, Initial Maturity
**Persona:** Practitioner (hands-on)
**Mode:** GDPR Assessment
**Query:** "This doesn't apply to us - we don't make automated decisions"

**What's Different:**
- Practitioner objecting to assessment path
- Claims non-applicability of a control
- Requires judgement call from AI
- Should validate claim or challenge with questions

**Expected Response Type:** Validation or challenge of claimed non-applicability
**Average Output:** 228 tokens (shorter response)
**Expected Topics:** Automated decision assessment, GDPR article 22 applicability

---

### Prompt 8: MULTI_FW_MGR_1 (975 tokens input)

**Organization:** Finance Services (Medium), UK, Developing Maturity
**Persona:** Manager (strategic)
**Mode:** Multi-Framework Assessment
**Query:** "Should I assess GDPR and ISO 27001 together or separately?"

**What's Different:**
- Multi-framework context (GDPR + ISO 27001)
- Strategic question about assessment approach
- Manager asking for guidance on process
- Unique assessment mode (not framework-specific)

**Expected Response Type:** Framework combination guidance
**Average Output:** 400 tokens
**Expected Topics:** Framework overlap, assessment strategy, efficiency

---

### Prompt 9: ISO27001_NOV_1 (1,064 tokens input)

**Organization:** Education Nonprofit, EU, Initial Maturity
**Persona:** Novice (decision-maker)
**Mode:** ISO 27001 Assessment
**Query:** "Can I start the assessment over? I made some mistakes"

**What's Different:**
- Novice in technical area (ISO 27001)
- Assessment recovery/reset request
- Should reassure and redirect
- Requires different response than assessment question

**Expected Response Type:** Reassurance, guidance on recovery, restart of assessment
**Average Output:** 151 tokens (shortest)
**Expected Topics:** Assessment reset, error correction, restart guidance

---

### Prompt 10: GDPR_MGR_2 (991 tokens input)

**Organization:** Retail Chain (Global), Defined Maturity
**Persona:** Manager (strategic)
**Mode:** GDPR Assessment
**Query:** "How much of the assessment have we completed?"

**What's Different:**
- Global retail (same as Prompt 5)
- Manager tracking progress
- Requires synthesis of assessment state
- Different from Prompt 5 (now asking for progress)

**Expected Response Type:** Progress summary and next assessment steps
**Average Output:** 222 tokens
**Expected Topics:** Assessment progress, completion percentage, next steps

---

## Key Characteristics

### Framework Distribution
- **GDPR:** 5 prompts (1, 3, 5, 7, 10)
- **ISO 27001:** 4 prompts (2, 4, 6, 9)
- **Multi-Framework:** 1 prompt (8)

### Persona Distribution
- **Novice:** 2 prompts (1, 9)
- **Practitioner:** 4 prompts (2, 4, 5, 7)
- **Manager:** 4 prompts (3, 6, 8, 10)

### Organization Types
- **Healthcare:** 2 (Healthcare Startup - appears twice)
- **Finance:** 3 (Finance Medium - appears 3 times)
- **Education:** 2 (Education Nonprofit - appears twice)
- **Retail:** 2 (Retail Chain - appears twice)
- **SaaS:** 1 (Enterprise SaaS)

### Maturity Levels Represented
- **Initial:** 3 orgs (Healthcare, Education)
- **Developing:** 2 orgs (Finance Medium)
- **Managed:** 1 org (Enterprise SaaS)
- **Defined:** 1 org (Retail Chain)

### Assessment Stage
- **Initiation:** 2 prompts (1, 9) - starting assessment
- **Mid-Stream:** 4 prompts (2, 4, 6, 8) - in progress
- **Mid-Stream:** 4 prompts (3, 5, 7, 10) - various stages

### Response Complexity
- **Shortest:** 151 tokens (Prompt 9 - novice reset)
- **Longest:** 423 tokens (Prompt 5 - remediation guidance)
- **Average:** 306 tokens

---

## What This Tests

### Model Capabilities Required

1. **Contextual Awareness**
   - Track organization profile across TIER 3
   - Understand compliance maturity level
   - Adapt tone to persona level

2. **Framework Knowledge**
   - GDPR requirements and structure
   - ISO 27001 controls and assessment
   - Framework overlaps and relationships

3. **Conversational Skill**
   - Multi-turn assessment dialogue
   - Extracting evidence from narrative
   - Asking follow-up questions
   - Providing strategic guidance

4. **Judgement Calls**
   - Validating compliance claims
   - Prioritizing gaps
   - Assessing control applicability
   - Recommending approaches

5. **Response Adaptation**
   - Longer responses for managers seeking strategy
   - Shorter responses for clarifications
   - Different depth for novice vs practitioner

---

## Performance Observations

From Run 6 test results, models showed:

| Model | Avg Speed | Response Variance | Best For |
|-------|-----------|-------------------|----------|
| smollm3 | 44.2 tok/s | 4% | Consistent, balanced |
| Neural-Chat | 45.1 tok/s | 6% | Fast, reliable |
| Mixtral | 42.3 tok/s | 8% | Detailed responses |
| phi3 | 38.7 tok/s | 9% | Context awareness |

**Key Finding:** All models handled the 1000+ token prompts without major degradation, but response consistency varied significantly.

---

## Using These Prompts for Analysis

### Load from Test Results

```javascript
import { loadResultsFromFile } from './utils/analysis-loader.js';
import { filterByStandard, aggregateByModel } from './utils/analysis-filter.js';

// Load Run 6 results
const run6 = loadResultsFromFile('reports/performance-run-6-multitier.json');

// Analyze GDPR prompts only
const gdprResults = filterByStandard(run6, 'GDPR');

// See which models handled GDPR best
const byModel = aggregateByModel(gdprResults);
byModel.forEach(m => {
  console.log(`${m.model}: ${m.metrics.speed.mean} tok/s (${m.metrics.responseLength.mean} token responses)`);
});
```

### Compare Response Lengths by Persona

```javascript
const noviceResults = run6.filter(r => r.input.promptId.includes('NOVICE'));
const practitionerResults = run6.filter(r => r.input.promptId.includes('PRAC'));
const managerResults = run6.filter(r => r.input.promptId.includes('MGR'));

const noviceLength = noviceResults.reduce((sum, r) => sum + r.output.responseTokens, 0) / noviceResults.length;
const practitionerLength = practitionerResults.reduce((sum, r) => sum + r.output.responseTokens, 0) / practitionerResults.length;
const managerLength = managerResults.reduce((sum, r) => sum + r.output.responseTokens, 0) / managerResults.length;

console.log(`Novice avg response: ${noviceLength} tokens`);
console.log(`Practitioner avg response: ${practitionerLength} tokens`);
console.log(`Manager avg response: ${managerLength} tokens`);
```

---

## Summary

Run 6 used **10 carefully designed prompts** representing:
- 2 compliance frameworks (GDPR, ISO 27001)
- 3 user personas (Novice, Practitioner, Manager)
- 5 distinct organization types across 4 maturity levels
- Real-world ArionComply assessment workflows
- Production-grade prompt complexity (1000+ tokens input)

This provides a realistic test of how models perform on **actual production workloads** rather than simplified baselines.

---

**For detailed prompt viewing, run:** `node view-test-prompts.js`

**For programmatic access, see:** [ANALYSIS-API-GUIDE.md](./ANALYSIS-API-GUIDE.md)

