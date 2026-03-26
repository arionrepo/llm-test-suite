# Test Prompts Used in Performance Testing
**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/PROMPTS-USED-IN-TESTING.md
**Description:** Complete reference of all prompts used across all 6 performance test runs
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

---

## Quick Access Guide

All prompt definitions are located in:
- **Simple prompts (Run 1-4):** `performance-prompts.js`
- **Multi-tier prompts (Run 5-6):** `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js`

---

## Run 1: TINY (10 tokens per prompt)

**File:** `performance-prompts.js` → `PERFORMANCE_PROMPTS.RUN_1_TINY`

```
1. TINY_01: "What is GDPR?"
2. TINY_02: "What is ISO 27001?"
3. TINY_03: "What is SOC 2?"
4. TINY_04: "What is HIPAA?"
5. TINY_05: "What is PCI-DSS?"
6. TINY_06: "What is the EU AI Act?"
7. TINY_07: "What is FedRAMP?"
8. TINY_08: "What is NIST CSF?"
9. TINY_09: "What is ISO 27701?"
10. TINY_10: "What is CMMC?"
```

**Focus:** Baseline performance with minimal input

---

## Run 2: SMALL (50 tokens per prompt)

**File:** `performance-prompts.js` → `PERFORMANCE_PROMPTS.RUN_2_SHORT`

```
1. SHORT_01: "What are the main principles of GDPR?"
2. SHORT_02: "What are the key requirements of ISO 27001 certification?"
3. SHORT_03: "What are the Trust Services Criteria in SOC 2?"
4. SHORT_04: "What are the main HIPAA privacy rule requirements?"
5. SHORT_05: "What are the 12 requirements of PCI-DSS?"
6. SHORT_06: "What are the risk levels in the EU AI Act?"
7. SHORT_07: "What are the FedRAMP impact levels?"
8. SHORT_08: "What are the 6 functions of NIST CSF?"
9. SHORT_09: "How does ISO 27701 extend ISO 27001?"
10. SHORT_10: "What are the CMMC 2.0 certification levels?"
```

**Focus:** Short form compliance questions across multiple frameworks

---

## Run 3: MEDIUM (100 tokens per prompt)

**File:** `performance-prompts.js` → `PERFORMANCE_PROMPTS.RUN_3_MEDIUM`

Example:
```
MED_01: "For a small healthcare organization processing patient data, what are
the key HIPAA Security Rule requirements for protecting electronic protected
health information?"

MED_02: "What are the specific documentation requirements needed to demonstrate
GDPR accountability, including records of processing activities and data protection
impact assessments?"

MED_03: "How do ISO 27001 Annex A controls relate to SOC 2 Trust Services Criteria,
and what are the main overlaps?"
```

**Focus:** Medium complexity compliance assessment questions

---

## Run 4: LONG (150 tokens per prompt)

**File:** `performance-prompts.js` → `PERFORMANCE_PROMPTS.RUN_4_LONG`

Example:
```
LONG_01: "For a SaaS company with 100 employees operating globally, what is the
complete workflow needed to achieve SOC 2 Type II certification, including scoping
decisions, control implementation, evidence collection, and audit preparation,
with estimated timeframes for each phase?"

LONG_02: "A multinational corporation processes personal data of EU citizens,
California residents, and Canadian customers. What are the overlapping requirements
between GDPR, CCPA/CPRA, and PIPEDA that can be addressed with unified privacy
controls, and what are the unique requirements for each regulation?"
```

**Focus:** Complex, multi-framework compliance workflows

---

## Run 5: VERYLONG (190 tokens per prompt)

**File:** `performance-prompts.js` → `PERFORMANCE_PROMPTS.RUN_5_VERYLONG`

These are the first multi-tier prompts with context. Example:

```
VLONG_01 (ID: ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1):

[TIER 1: You are ArionComply AI, expert compliance advisor]
[TIER 2: GDPR Assessment Mode - helping with gap assessment]
[TIER 3: Industry: Healthcare, Size: SMB (50-250), Region: EU,
         Frameworks: GDPR+HIPAA, Maturity: Developing]
[CONTEXT: Organization is healthcare provider with EU and US patients]

[QUESTION: We need to conduct a comprehensive data protection gap assessment
covering both GDPR requirements for EU patient data and HIPAA requirements for
US patient health information. What is the systematic workflow to assess our
current state, identify gaps, prioritize remediation, and track implementation
progress for both regulations simultaneously while avoiding duplicate work where
requirements overlap?]
```

**Key Tier Components:**

**TIER 1 - Base System (Always Same):**
- ArionComply AI identity and capabilities
- Communication style guidelines
- Assessment parsing instructions
- Clarification protocol

**TIER 2 - Assessment Mode Examples:**
```
"You are guiding the user through a compliance gap assessment. Your goal is to:
1. Ask clear, focused questions about current compliance status
2. Parse responses to extract compliance status and evidence
3. Guide through all applicable controls systematically
4. Provide encouraging feedback and next steps"
```

**TIER 3 - Organization Context (Example):**
```
"Organization Context:
- Industry: Healthcare
- Organization Size: 50-250 employees
- Region: EU
- Licensed Frameworks: GDPR, HIPAA
- Compliance Maturity: Developing
- Profile Completion: 60%

Tailor your responses to this organization's industry, size, and maturity level."
```

---

## Run 6: MULTITIER (2000+ tokens per prompt) - TODAY'S TESTS

**File:** `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js`

### The 10 Prompts Used in Today's Test:

**1. ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1**
- Input: 951 tokens
- Org Profile: Healthcare Startup (EU, Initial Maturity)
- Mode: GDPR Assessment
- Persona: Novice
- User Query: "I want to assess my GDPR compliance"

**2. ARION_MULTITIER_ASSESSMENT_ISO27001_PRACTITIONER_1**
- Input: 1066 tokens
- Org Profile: Financial Services (UK, Developing Maturity)
- Mode: ISO 27001 Assessment
- Persona: Practitioner
- User Query: "Yes, we have implemented encryption for data at rest using AES-256, and we maintain encryption key management procedures in our security policy document"

**3. ARION_MULTITIER_ASSESSMENT_GDPR_MANAGER_1**
- Input: 951 tokens
- Org Profile: Education Nonprofit (EU, Initial Maturity)
- Mode: GDPR Assessment
- Persona: Manager
- User Query: "What are my biggest GDPR compliance gaps?"

**4. ARION_MULTITIER_ASSESSMENT_ISO27001_PRACTITIONER_2**
- Input: 1051 tokens
- Org Profile: Enterprise SaaS (US, Managed Maturity)
- Mode: ISO 27001 Assessment
- Persona: Practitioner
- User Query: "What kind of evidence do you need for access control?"
- Context: Previous conversation history included

**5. ARION_MULTITIER_ASSESSMENT_GDPR_PRACTITIONER_1**
- Input: 1029 tokens
- Org Profile: Retail Chain (Global, Defined Maturity)
- Mode: GDPR Assessment
- Persona: Practitioner
- User Query: "We have a privacy policy but it's not up to date with GDPR requirements, and we haven't implemented all the required information disclosures"

**6. ARION_MULTITIER_ASSESSMENT_ISO27001_MANAGER_1**
- Input: 1044 tokens
- Org Profile: Financial Services (UK, Developing Maturity)
- Mode: ISO 27001 Assessment
- Persona: Manager
- User Query: "Can you summarize our assessment results?"
- Context: Conversation history with previous assessment progress

**7. ARION_MULTITIER_ASSESSMENT_GDPR_PRACTITIONER_2**
- Input: 1004 tokens
- Org Profile: Healthcare Startup (EU, Initial Maturity)
- Mode: GDPR Assessment
- Persona: Practitioner
- User Query: "This doesn't apply to us - we don't make automated decisions"

**8. ARION_MULTITIER_ASSESSMENT_MULTI_FRAMEWORK_MANAGER_1**
- Input: 975 tokens
- Org Profile: Financial Services (UK, Developing Maturity)
- Mode: Multi-Framework Assessment
- Persona: Manager
- User Query: "Should I assess GDPR and ISO 27001 together or separately?"

**9. ARION_MULTITIER_ASSESSMENT_ISO27001_NOVICE_1**
- Input: 1064 tokens
- Org Profile: Education Nonprofit (EU, Initial Maturity)
- Mode: ISO 27001 Assessment
- Persona: Novice
- User Query: "Can I start the assessment over? I made some mistakes"

**10. ARION_MULTITIER_ASSESSMENT_GDPR_MANAGER_2**
- Input: 991 tokens
- Org Profile: Retail Chain (Global, Defined Maturity)
- Mode: GDPR Assessment
- Persona: Manager
- User Query: "How much of the assessment have we completed?"

---

## Understanding the Prompt Structure

Each Run 6 prompt is constructed as follows:

```
[TIER 1 - Base System Prompt]
(~1,875 tokens of system instructions)

[TIER 2 - Mode Context]
(Assessment guidance + Framework expertise)

[TIER 3 - Organization Context]
(Industry, size, region, frameworks, maturity level, guidance)

[OPTIONAL: CONVERSATION HISTORY]
(Previous messages in conversation)

[USER MESSAGE]
(Current user query)
```

**Total Prompt Size:** 1000-2300 tokens (input)
**Output Size:** 150-430 tokens (generated by models)

---

## Why This Matters for Performance Testing

### Run 1-4 Purpose:
- **Simple, focused measurement** of model throughput
- **Input scaling** from 10 → 150 tokens
- **Baseline comparisons** across different input sizes

### Run 5 Purpose:
- **Introduction of realistic complexity**
- **Multi-tier prompt system** that matches ArionComply architecture
- **Transition** from simple to production-like prompts

### Run 6 Purpose:
- **Production reality** - actual multi-tier system prompts
- **Real organization contexts** with various maturity levels
- **Actual conversation patterns** with history
- **True measure** of model performance under ArionComply conditions

---

## How to View the Full Prompts

### For Simple Prompts (Runs 1-5):
```bash
# View the performance-prompts.js file directly
cat performance-prompts.js

# Search for specific prompt
grep -A 5 "TINY_01" performance-prompts.js
```

### For Multi-Tier Prompts (Run 6):
```bash
# View the multi-tier test definitions
cat enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js

# Search for specific prompt
grep -A 50 "ASSESSMENT_START_GDPR_NOVICE_1" enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js
```

### View Test Results with Prompts:
```bash
# Shows all prompt IDs and their token counts
node view-test-prompts.js

# View raw test data
cat reports/performance-run-6-multitier.json | jq '.results[] | {promptId, inputTokens, outputTokens}'
```

---

## Key Observations

1. **Input tokens nearly double from Run 1 → Run 6**
   - Run 1: 10 tokens average
   - Run 6: 1000+ tokens average (100x increase)

2. **Multi-tier system adds significant context**
   - TIER 1: ~1,875 tokens (system identity + guidelines)
   - TIER 2: ~400 tokens (framework expertise)
   - TIER 3: ~300 tokens (organization context)
   - User query: ~100 tokens
   - **Total: 2500+ tokens in system message alone**

3. **Models handle scaling differently**
   - smollm3: Only 4% degradation
   - 8B models: 0-2% degradation (ultra-stable)
   - 24B-32B models: 9-22% degradation (poor scaling)

4. **Organization context is critical**
   - Same framework (GDPR) tested with 4 different orgs
   - Maturity levels: Initial → Managed
   - Industries: Healthcare, Finance, Retail, Education
   - Sizes: 1-50 → 1000+ employees

---

## Quick Reference

| Run | Type | Input Size | File | Use Case |
|-----|------|-----------|------|----------|
| 1 | Simple | 10 tok | performance-prompts.js | Baseline |
| 2 | Simple | 50 tok | performance-prompts.js | Small |
| 3 | Simple | 100 tok | performance-prompts.js | Medium |
| 4 | Simple | 150 tok | performance-prompts.js | Long |
| 5 | Multi-Tier | 190 tok | performance-prompts.js | Transition |
| 6 | Multi-Tier | 2000+ tok | ai-backend-multi-tier-tests.js | **Production** |

---

**Contact:** libor@arionetworks.com
