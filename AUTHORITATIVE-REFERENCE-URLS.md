# Authoritative Reference URLs for Compliance Standards

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/AUTHORITATIVE-REFERENCE-URLS.md
**Description:** Official URLs for all compliance standards, regulations, and frameworks
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26

---

## Purpose

This document defines authoritative online references for each compliance standard.
These URLs should be added to prompts as `expectedReferenceURL` field for:
- Ground truth validation against official sources
- User education (link to primary source)
- Automated fact-checking capabilities
- Citation verification

---

## Privacy Regulations

### GDPR - General Data Protection Regulation

**Official Source:** EUR-Lex (EU Official Journal)
**Base URL:** `https://eur-lex.europa.eu/eli/reg/2016/679/oj`

**Article-Specific URLs:**
- Article 6 (Lawful basis): `https://gdpr-info.eu/art-6-gdpr/`
- Article 17 (Right to erasure): `https://gdpr-info.eu/art-17-gdpr/`
- Article 25 (Privacy by design): `https://gdpr-info.eu/art-25-gdpr/`
- Article 30 (Records of processing): `https://gdpr-info.eu/art-30-gdpr/`
- Article 32 (Security): `https://gdpr-info.eu/art-32-gdpr/`
- Article 35 (DPIA): `https://gdpr-info.eu/art-35-gdpr/`

**Alternative (Official EU):**
- Full text: `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679`

---

### CCPA - California Consumer Privacy Act

**Official Source:** California Legislative Information
**URL:** `https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?division=3.&part=4.&lawCode=CIV&title=1.81.5`

**Guidance:**
- California AG CCPA Page: `https://oag.ca.gov/privacy/ccpa`

---

### CPRA - California Privacy Rights Act

**Official Source:** California Secretary of State
**URL:** `https://oag.ca.gov/system/files/initiatives/pdfs/19-0021A1%20%28Consumer%20Privacy%20-%20Version%203%29_1.pdf`

---

### UK GDPR

**Official Source:** UK Legislation
**URL:** `https://www.legislation.gov.uk/uksi/2019/419/contents`

**ICO Guidance:** `https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/`

---

### PIPEDA - Personal Information Protection and Electronic Documents Act (Canada)

**Official Source:** Justice Laws Website
**URL:** `https://laws-lois.justice.gc.ca/eng/acts/P-8.6/`

**Office of the Privacy Commissioner:** `https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/`

---

## Security Frameworks

### ISO 27001 - Information Security Management

**Official Source:** ISO.org
**Standard Purchase:** `https://www.iso.org/standard/27001`

**Free Resources:**
- ISO 27001 Controls List: `https://www.isms.online/iso-27001/annex-a-controls/`
- PECB ISO 27001 Toolkit: `https://pecb.com/article/iso-iec-27001-annex-a-controls`

**Control-Specific:**
- Annex A Overview: `https://www.iso.org/obp/ui#iso:std:iso-iec:27001:ed-3:v1:en:sec:A`
- Individual controls require ISO purchase for official text

---

### ISO 27002 - Information Security Controls

**Official:** `https://www.iso.org/standard/75652.html`

---

### ISO 27017 - Cloud Security Controls

**Official:** `https://www.iso.org/standard/43757.html`

---

### ISO 27018 - Cloud Privacy Controls

**Official:** `https://www.iso.org/standard/76559.html`

---

### ISO 27701 - Privacy Information Management

**Official:** `https://www.iso.org/standard/71670.html`

**Extension Mapping:** `https://www.isms.online/iso-27701/`

---

### ISO 42001 - AI Management System

**Official:** `https://www.iso.org/standard/81230.html`

**Overview:** `https://www.bsigroup.com/en-GB/ISO-42001-Artificial-Intelligence-Management-System/`

---

### NIST Cybersecurity Framework (CSF)

**Official Source:** NIST
**URL:** `https://www.nist.gov/cyberframework`

**Version 2.0:** `https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf`

**Functions:**
- Govern: `https://www.nist.gov/cyberframework/govern`
- Identify: `https://www.nist.gov/cyberframework/identify`
- Protect: `https://www.nist.gov/cyberframework/protect`
- Detect: `https://www.nist.gov/cyberframework/detect`
- Respond: `https://www.nist.gov/cyberframework/respond`
- Recover: `https://www.nist.gov/cyberframework/recover`

---

### NIST 800-53 - Security and Privacy Controls

**Official:** `https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final`

**Control Catalog:** `https://nvd.nist.gov/800-53`

---

### NIST 800-171 - Protecting CUI

**Official:** `https://csrc.nist.gov/publications/detail/sp/800-171/rev-2/final`

---

## Compliance Standards

### SOC 2 - Service Organization Control 2

**Official Source:** AICPA
**Overview:** `https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2`

**Trust Services Criteria:** `https://us.aicpa.org/content/dam/aicpa/interestareas/frc/assuranceadvisoryservices/downloadabledocuments/trust-services-criteria.pdf`

---

### PCI DSS - Payment Card Industry Data Security Standard

**Official Source:** PCI Security Standards Council
**Base URL:** `https://www.pcisecuritystandards.org/`

**Current Standard:** `https://docs-prv.pcisecuritystandards.org/PCI%20DSS/Standard/PCI-DSS-v4_0.pdf`

**Requirement-Specific:**
- Requirement 3 (Data Protection): `https://www.pcisecuritystandards.org/document_library/`

---

### HIPAA - Health Insurance Portability and Accountability Act

**Official Source:** HHS.gov
**Base URL:** `https://www.hhs.gov/hipaa/index.html`

**Privacy Rule:** `https://www.hhs.gov/hipaa/for-professionals/privacy/index.html`

**Security Rule:** `https://www.hhs.gov/hipaa/for-professionals/security/index.html`

**Specific Provisions:**
- Administrative Safeguards: `https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html`

---

### FedRAMP - Federal Risk and Authorization Management Program

**Official:** `https://www.fedramp.gov/`

**Documentation:** `https://www.fedramp.gov/documents/`

**NIST 800-53 Baselines:**
- Low: `https://www.fedramp.gov/assets/resources/documents/FedRAMP_Security_Controls_Baseline.xlsx`
- Moderate: (same)
- High: (same)

---

### CMMC 2.0 - Cybersecurity Maturity Model Certification

**Official:** `https://www.acq.osd.mil/cmmc/`

**Model Overview:** `https://dodcio.defense.gov/CMMC/Model/`

**NIST 800-171 (basis):** `https://csrc.nist.gov/publications/detail/sp/800-171/rev-2/final`

---

## AI & Emerging Standards

### EU AI Act - European Union Artificial Intelligence Act

**Official:** EUR-Lex
**URL:** `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52021PC0206`

**Final Adopted Text (2024):** `https://artificialintelligenceact.eu/`

**Risk Classification:** `https://artificialintelligenceact.eu/high-risk-ai-systems/`

---

### California SB 1047 - AI Regulation

**Official:** California Legislature
**URL:** `https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB1047`

---

### ISO 27035 - Information Security Incident Management

**Official:** `https://www.iso.org/standard/78973.html`

---

### ISO 20000 - IT Service Management

**Official:** `https://www.iso.org/standard/70636.html`

---

## How to Use These URLs

### In Prompt Definitions

```javascript
{
  id: "GDPR_FACTUAL_NOVICE_1",
  question: "What is GDPR?",
  expectedTopics: ["regulation", "privacy", "EU"],

  // NEW: Add reference URL
  expectedReferenceURL: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
  referenceSource: "EUR-Lex (Official EU Journal)",

  // For article-specific questions
  expectedReferenceURL: "https://gdpr-info.eu/art-6-gdpr/",
  referenceSource: "GDPR-info.eu (Article 6)"
}
```

### For EXACT_MATCH Citations

```javascript
{
  id: "GDPR_EXACT_MATCH_AUDITOR_1",
  question: "What does GDPR Article 17 state about the right to erasure?",
  expectedCitation: "Article 17",
  expectedTopics: ["Article 17", "right to erasure", "deletion"],

  // Direct link to the article
  expectedReferenceURL: "https://gdpr-info.eu/art-17-gdpr/",
  referenceSource: "GDPR Article 17 (Official)",

  // Could also fetch and compare against official text
  officialText: "1. The data subject shall have the right to obtain..."  // Fetched from URL
}
```

### For ISO Standards (Paywall Issue)

```javascript
{
  id: "ISO27001_EXACT_MATCH_AUDITOR_1",
  question: "What is the exact requirement of ISO 27001 control A.8.1?",
  expectedCitation: "A.8.1",

  // Official source (requires purchase)
  expectedReferenceURL: "https://www.iso.org/standard/27001",
  referenceSource: "ISO.org (Official Standard)",

  // Free alternative (unofficial but accurate)
  alternativeReferenceURL: "https://www.isms.online/iso-27001/annex-a-8-asset-management/",
  alternativeSource: "ISMS.online (Unofficial Summary)",

  // For validation, could use free summary as proxy
  validationStrategy: "Use unofficial source for automated checking, require manual verification for official"
}
```

---

## Benefits of expectedReferenceURL

### 1. Ground Truth Validation

**Automated fact-checking:**
```javascript
async function validateAgainstOfficial(response, prompt) {
  // Fetch official text from expectedReferenceURL
  const officialContent = await fetch(prompt.expectedReferenceURL);

  // Extract key facts from official source
  const officialFacts = extractKeyFacts(officialContent);

  // Compare response against official facts
  const accuracy = compareAgainstSource(response, officialFacts);

  return accuracy;
}
```

### 2. User Education

**In test results, show reference:**
```javascript
{
  promptId: "GDPR_FACTUAL_NOVICE_1",
  response: "...",
  score: 85,
  reference: {
    source: "EUR-Lex Official GDPR Text",
    url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    message: "See official source for complete details"
  }
}
```

### 3. Continuous Validation

**Check if standards have been updated:**
```javascript
// Periodically fetch official source
// Compare against our expectedTopics and referenceAnswer
// Alert if standard has changed
```

---

## Implementation Plan

### Phase 1: Define URL Mapping (1 hour)

Create `ground-truth/reference-urls.json`:
```json
{
  "standards": {
    "GDPR": {
      "baseURL": "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
      "articleURL": "https://gdpr-info.eu/art-{article}-gdpr/",
      "type": "regulation",
      "publisher": "European Union",
      "accessibility": "free"
    },
    "ISO_27001": {
      "baseURL": "https://www.iso.org/standard/27001",
      "type": "standard",
      "publisher": "ISO",
      "accessibility": "paywall",
      "freeAlternative": "https://www.isms.online/iso-27001/"
    },
    "SOC_2": {
      "baseURL": "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2",
      "criteriaURL": "https://us.aicpa.org/content/dam/aicpa/interestareas/frc/assuranceadvisoryservices/downloadabledocuments/trust-services-criteria.pdf",
      "type": "audit-standard",
      "publisher": "AICPA",
      "accessibility": "free"
    }
    // ... all 29 standards
  }
}
```

### Phase 2: Add to Existing Prompts (2-3 hours)

**Add expectedReferenceURL to test-data-generator.js:**
```javascript
TEST_TEMPLATES = {
  GDPR: {
    FACTUAL: {
      NOVICE: [
        {
          q: 'What is GDPR?',
          expectedTopics: ['regulation', 'privacy', 'EU'],
          expectedReferenceURL: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj',
          referenceSource: 'EUR-Lex (Official EU GDPR Text)'
        }
      ]
    },
    EXACT_MATCH: {
      AUDITOR: [
        {
          q: 'What does GDPR Article 17 state about the right to erasure?',
          expectedCitation: 'Article 17',
          expectedTopics: ['Article 17', 'right to erasure', 'deletion'],
          expectedReferenceURL: 'https://gdpr-info.eu/art-17-gdpr/',
          referenceSource: 'GDPR Article 17 (Official Text)'
        }
      ]
    }
  },
  ISO_27001: {
    EXACT_MATCH: {
      AUDITOR: [
        {
          q: 'What is the exact requirement of ISO 27001 control A.8.1?',
          expectedCitation: 'A.8.1',
          expectedTopics: ['A.8.1', 'inventory of assets'],
          expectedReferenceURL: 'https://www.iso.org/standard/27001',
          alternativeURL: 'https://www.isms.online/iso-27001/annex-a-8-asset-management/',
          referenceSource: 'ISO 27001:2022 Annex A',
          referenceNote: 'Official standard requires purchase; free summary available'
        }
      ]
    }
  }
}
```

### Phase 3: Update Schema to v2.3.0 (30 minutes)

**Add to PROMPT-SCHEMA.md:**
```typescript
interface TestPrompt {
  // Existing fields...
  expectedTopics: string[];
  expectedCitation?: string | null;

  // NEW in v2.3.0
  expectedReferenceURL?: string;      // Primary authoritative source URL
  alternativeURL?: string;             // Free alternative if primary is paywall
  referenceSource?: string;            // Human-readable source name
  referenceNote?: string;              // Notes about accessing the reference
}
```

---

## Reference URL Strategy by Standard Type

### Free Access Standards (Use Official)

**GDPR, CCPA, HIPAA, FedRAMP, NIST:**
- Direct link to official government/regulatory source
- Free and publicly accessible
- Most authoritative

**Example:**
```javascript
{
  expectedReferenceURL: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
  referenceSource: "EUR-Lex (Official EU GDPR Text)",
  accessibility: "free"
}
```

---

### Paywall Standards (Use Official + Alternative)

**ISO standards (27001, 27701, 42001, 20000, etc.):**
- Official URL (requires purchase)
- Free alternative URL (unofficial but accurate)
- Note about official vs alternative

**Example:**
```javascript
{
  expectedReferenceURL: "https://www.iso.org/standard/27001",
  referenceSource: "ISO 27001:2022 (Official Standard)",
  accessibility: "paywall",
  alternativeURL: "https://www.isms.online/iso-27001/",
  alternativeSource: "ISMS.online (Free Summary)",
  referenceNote: "Official standard requires purchase; free summary provides accurate overview"
}
```

---

### Industry Standards (Mix)

**PCI-DSS:**
- Free to download (registration required)
- Official and accessible

**SOC 2:**
- Framework is free
- Trust Services Criteria PDF is free

**Example:**
```javascript
{
  expectedReferenceURL: "https://docs-prv.pcisecuritystandards.org/PCI%20DSS/Standard/PCI-DSS-v4_0.pdf",
  referenceSource: "PCI DSS v4.0 (Official Standard)",
  accessibility: "free-with-registration"
}
```

---

## Automated Validation Use Cases

### Use Case 1: Fact Checking EXACT_MATCH Prompts

```javascript
async function validateExactMatch(response, prompt) {
  if (!prompt.expectedReferenceURL) {
    return { method: 'keyword', confidence: 'low' };
  }

  // Fetch official text from URL
  const officialText = await fetchReference(prompt.expectedReferenceURL);

  // Extract the specific citation (e.g., Article 17)
  const citationText = extractCitation(officialText, prompt.expectedCitation);

  // Compare response against official citation text
  const similarity = calculateSemanticSimilarity(response, citationText);

  return {
    method: 'ground-truth',
    confidence: 'high',
    similarity,
    passed: similarity > 0.7,
    officialText: citationText.substring(0, 200) + '...'
  };
}
```

### Use Case 2: Detect Outdated Information

```javascript
// Periodically check if standards have been updated
async function checkForUpdates() {
  for (const prompt of prompts) {
    if (prompt.expectedReferenceURL) {
      const current = await fetch(prompt.expectedReferenceURL);
      const hash = hashContent(current);

      if (hash !== prompt.referenceContentHash) {
        console.warn(`⚠️ ${prompt.id}: Reference source may have updated`);
        // Flag for human review
      }
    }
  }
}
```

### Use Case 3: Enhanced User Experience

**In prompt viewer, show reference link:**
```html
<div class="prompt-card">
  <h3>What is GDPR?</h3>
  <p class="expected-topics">Expected: regulation, privacy, EU, data protection</p>
  <p class="reference">
    📚 Official Source:
    <a href="https://eur-lex.europa.eu/eli/reg/2016/679/oj" target="_blank">
      EUR-Lex GDPR Text
    </a>
  </p>
</div>
```

---

## Schema Extension Proposal

### Update PROMPT-SCHEMA to v2.3.0

**Add optional reference fields:**

```typescript
interface TestPrompt {
  // Existing required fields (v2.2.0)
  id: string;
  category: string;
  vendor: string | null;
  question: string;
  expectedTopics: string[];
  complexity: "beginner" | "intermediate" | "advanced" | "expert";

  // Existing optional fields
  standard?: string;
  knowledgeType?: string;
  persona?: string;
  expectedCitation?: string | null;
  expectedBehavior?: string;

  // NEW in v2.3.0: Reference & Ground Truth
  expectedReferenceURL?: string;           // Primary authoritative source
  alternativeReferenceURL?: string;        // Free alternative if primary is paywall
  referenceSource?: string;                // Human-readable source name
  referenceAccessibility?: "free" | "paywall" | "free-with-registration";
  referenceNote?: string;                  // Access instructions

  // NEW in v2.3.0: Ground Truth Validation
  mustMention?: string[];                  // Essential facts that must be in response
  mustNotMention?: string[];               // Common misconceptions to avoid
  referenceAnswer?: string;                // Full expert-written reference answer
  answerKeyPoints?: AnswerKeyPoint[];      // Structured key points with weights
}

interface AnswerKeyPoint {
  concept: string;                         // What must be explained
  keywords: string[];                      // Variations/synonyms
  weight: number;                          // Importance (0-100)
  required: boolean;                       // Must be present for passing score
}
```

---

## Quick Win: Add URLs to Existing Prompts

### Auto-Generation Strategy

Since many prompts follow patterns, we can auto-generate URLs:

```javascript
function getStandardReferenceURL(standard, citation = null) {
  const baseURLs = {
    'GDPR': citation ?
      `https://gdpr-info.eu/art-${citation.replace('Article ', '')}-gdpr/` :
      'https://eur-lex.europa.eu/eli/reg/2016/679/oj',

    'ISO_27001': citation ?
      `https://www.isms.online/iso-27001/annex-a-${citation.replace('A.', '').replace('.', '-')}/` :
      'https://www.iso.org/standard/27001',

    'SOC_2': 'https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2',

    'PCI_DSS': 'https://www.pcisecuritystandards.org/document_library/',

    'HIPAA': 'https://www.hhs.gov/hipaa/index.html',

    // ... etc
  };

  return baseURLs[standard] || null;
}

// Apply to all prompts
tests.forEach(test => {
  test.expectedReferenceURL = getStandardReferenceURL(test.standard, test.expectedCitation);
});
```

---

## Recommended Next Steps

### Option A: Add URLs Only (1-2 hours)
- Create reference-urls.json with mappings
- Add expectedReferenceURL to all prompts programmatically
- Update schema to v2.3.0

### Option B: Add URLs + mustMention (3-4 hours)
- Add URLs (as above)
- Add mustMention arrays to FACTUAL and EXACT_MATCH prompts
- Improves validation significantly

### Option C: Full Ground Truth (40-60 hours)
- Add URLs
- Add mustMention/mustNotMention
- Write full referenceAnswers for all prompts
- Create ground-truth validator
- Implement multi-layer evaluation

---

## Your Question Answered

**Q: "Do we have baseline usable answers for comparison?"**

**A: Currently NO, but here's what we should add:**

**Minimal (Quick):**
- `mustMention: ['EU regulation', 'personal data']`
- `expectedReferenceURL: 'https://eur-lex.europa.eu/...'`

**Better (Moderate):**
- `answerKeyPoints: [{ concept: 'EU regulation', weight: 30, required: true }, ...]`
- `referenceAnswer: "GDPR is a comprehensive EU privacy regulation..."`

**Best (Comprehensive):**
- Full reference answers for all prompts
- Validation rubrics with scoring dimensions
- Example answers at different quality levels
- Automated fact-checking against official sources

---

**Recommendation:**

**For building new prompts, include from the start:**
1. ✅ `expectedReferenceURL` - Link to official source
2. ✅ `mustMention` - 3-5 essential facts
3. ✅ `mustNotMention` - 2-3 common misconceptions
4. ⏳ `referenceAnswer` - Add later in batch

This gives us ~70% validation confidence (up from ~40% today) without massive upfront work.

---

**Should I:**
1. Update PROMPT-SCHEMA to v2.3.0 with these new fields?
2. Create reference-urls.json with all authoritative sources?
3. Add expectedReferenceURL to existing prompts?
4. Then build new prompts with all these fields included?

Contact: libor@arionetworks.com
