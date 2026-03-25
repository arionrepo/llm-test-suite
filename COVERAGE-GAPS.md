# Test Coverage Gaps Analysis

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/COVERAGE-GAPS.md
**Description:** Analysis of missing test coverage across 29 defined standards
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-25

---

## Current Coverage: 7 of 29 Standards (24%)

### Standards WITH Tests (7):

| Standard | Test Count | Coverage |
|----------|------------|----------|
| GDPR | 40 | Excellent |
| ISO 27001 | 24 | Good |
| EU AI Act | 8 | Moderate |
| SOC 2 | 7 | Basic |
| PCI-DSS | 3 | Minimal |
| CSA CCM | 3 | Minimal |
| ISO 27701 | 0-2 | Minimal (in multi-tier?) |

**Total tests for these 7: ~87-90**

### Standards WITHOUT Tests (22): ❌

**Privacy & Data Protection (3 missing):**
- CCPA - 0 tests
- CPRA - 0 tests
- PIPEDA (Canada) - 0 tests
- HIPAA - 0 tests

**AI Regulations (2 missing):**
- CA SB 1047 - 0 tests
- CA AB 2013 - 0 tests

**ISO Family (5 missing):**
- ISO 27002 (implementation guidance) - 0 tests
- ISO 27017 (cloud security) - 0 tests
- ISO 27018 (cloud PII) - 0 tests
- ISO 22301 (business continuity) - 0 tests
- ISO/IEC 27050 (eDiscovery) - 0 tests

**NIST Standards (3 missing):**
- NIST CSF - 0 tests
- NIST 800-53 - 0 tests
- NIST 800-171 - 0 tests

**Cloud Security (2 missing):**
- CSA STAR - 0 tests
- FedRAMP - 0 tests

**IT Governance & Audit (3 missing):**
- COBIT - 0 tests
- SSAE 18 - 0 tests
- CIS Controls - 0 tests

**Defense & Financial (4 missing):**
- CMMC 2.0 - 0 tests
- SOX - 0 tests
- GLBA - 0 tests

---

## Persona Coverage Gaps

**Current distribution:**
- Practitioner: 41 (24%)
- Manager: 29 (17%)
- Novice: 13 (8%)
- Auditor: 10 (6%)
- Developer: 3 (2%) ❌ **Severely underrepresented**
- Executive: 6 (3%)

**Missing:** Developer needs 15-20 more tests (technical implementation focus)

---

## Knowledge Type Balance

**Current:**
- Procedural: 37 (21%) ✅ Improved!
- Factual: 31 (18%)
- Relational: 15 (9%) ❌ **Need more**
- Synthesis: 14 (8%) ❌ **Need more**
- Exact Match: 5 (3%) ❌ **Severely underrepresented**

**Target distribution:**
- Each type should be 15-20% of total
- Need 10-15 more Relational
- Need 10-15 more Synthesis
- Need 15-20 more Exact Match

---

## Recommended Additions

### Priority 1: Fill Standard Gaps (80 tests)

**Add 3-5 tests per missing standard:**
- HIPAA: 5 tests (healthcare critical)
- CCPA/CPRA: 5 tests each (California)
- NIST CSF: 5 tests (widely used)
- NIST 800-53: 3 tests (federal)
- FedRAMP: 3 tests (cloud federal)
- ISO 27002: 3 tests (implementation)
- COBIT: 3 tests (IT governance)
- CMMC: 3 tests (defense)
- SOX: 3 tests (financial)
- Remaining 12 standards: 2 tests each = 24

**Total new tests: ~80**

### Priority 2: Balance Knowledge Types (30 tests)

- Relational: +15 tests (cross-framework mapping)
- Synthesis: +10 tests (gap analysis, comparisons)
- Exact Match: +5 tests (precise citations)

### Priority 3: Developer Persona (20 tests)

**Developer-specific tests:**
- Secure coding for GDPR compliance
- Implementing ISO 27001 technical controls
- API security for PCI-DSS
- Logging/monitoring for SOC 2
- Encryption implementation
- Access control code examples

### Priority 4: Company-Specific Scenarios (20 tests)

**Test each company profile:**
- Startup (cost-conscious): 3 tests
- SMB (resource-constrained): 3 tests
- Enterprise (comprehensive): 3 tests
- SaaS (cloud-specific): 3 tests
- Healthcare (HIPAA): 3 tests
- Financial (SOX/GLBA): 3 tests
- Public Sector (FedRAMP): 2 tests

---

## Total Additional Tests Needed: ~150

**Target: 173 + 150 = ~323 total tests**

### Coverage After Additions:

**By Standard:**
- All 29 standards: ✅ At least 2-5 tests each
- Critical standards (GDPR, ISO 27001, HIPAA): 10-40 tests

**By Knowledge Type:**
- Each type: 15-20% of total ✅ Balanced

**By Persona:**
- All 6 personas: 10-15% each ✅ Balanced
- Developer: adequate representation ✅

**By Input Complexity:**
- Simple: 30%
- Moderate: 20%
- Complex: 30%
- Very Complex (multi-tier): 20%

---

## Implementation Plan

1. **Create test templates** for 22 missing standards
2. **Generate developer-specific tests** (20)
3. **Add relational/synthesis tests** (25)
4. **Add exact match tests** (20)
5. **Add company-scenario tests** (20)
6. **Total: ~150 new tests**

**Timeline estimate:** 2-3 hours to generate all tests

---

Questions: libor@arionetworks.com
