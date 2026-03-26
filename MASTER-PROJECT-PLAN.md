# LLM Test Suite - Master Project Plan
**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/MASTER-PROJECT-PLAN.md
**Description:** Comprehensive tracking of all active and planned work streams
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26
**Last Updated:** 2026-03-26

---

## Project Status Overview

**Current Phase:** Testing & Quality Evaluation
**Last Completed:** 150-test multi-tier performance run with full response capture
**Active Work:** Building response viewer & rating system
**Blocked:** None

---

## Work Stream 1: Multi-Tier Performance Testing ✅ COMPLETED

### Status: COMPLETE (2026-03-26)

**Completed Tasks:**
- ✅ Fixed response saving bug in `run-multitier-split-25.js`
  - Changed enrichment to use `convertRunnerResultToSchema()`
  - Now saves full LLM responses in schema-compliant format
  - File: `run-multitier-split-25.js:87-94`

- ✅ Executed full test suite (150 tests)
  - 3 models: smollm3, phi3, mistral
  - 50 prompts (all >2000 tokens, range: 2300-2550)
  - 2 runs for statistical confidence
  - Runtime: 36 minutes total
  - Status: All tests passed, all results saved

**Results:**
- Location: `reports/performance/2026-03-26/`
- Files: 6 result files (906KB total)
- Data: Full prompts, complete responses, performance metrics
- Validation: 150/150 results schema-compliant

**Performance Findings:**
- smollm3: 110 tok/s average (FASTEST)
- phi3: 56 tok/s average
- mistral: 54 tok/s average
- All models show low variance (<3% coefficient of variation)

---

## Work Stream 2: Response Quality Evaluation ✅ 80% COMPLETE

### Status: IN PROGRESS

**Completed:**
- ✅ Manual subjective evaluation of 15+ responses
- ✅ Identified critical issues:
  - phi3: Fabricates fake user dialogues (dealbreaker)
  - smollm3: Includes `<think>` tags (fixable)
  - mistral: Excellent quality, no critical issues
- ✅ Created quality evaluation documents:
  - `/tmp/QUALITATIVE-RESPONSE-EVALUATION.md`
  - `/tmp/COMPREHENSIVE-QUALITY-EVALUATION.md`

**In Progress:**
- 🔨 Build interactive viewer for comprehensive rating
- 🔨 Create rating persistence system
- 🔨 Review all 150 responses systematically

**Findings So Far:**
- **mistral**: Best for production (5/5 quality, 90% context usage)
- **smollm3**: Best for education (4/5 quality, needs filtering)
- **phi3**: Not recommended (hallucination risk, inconsistent)

**Remaining:**
- [ ] Fix viewer to properly load and display responses
- [ ] Rate all 150 responses using viewer
- [ ] Export ratings for analysis
- [ ] Create final model recommendation report

---

## Work Stream 3: Prompt Optimization 📋 PLANNED

### Status: PLANNED (Design Complete, Implementation Pending)

**Analysis Complete:**
- ✅ Identified root causes of quality issues
- ✅ Created optimization recommendations document
  - File: `/tmp/PROMPT-OPTIMIZATION-RECOMMENDATIONS.md`
  - Recommendations: 4 specific prompt modifications
  - Expected impact: Eliminate hallucination, improve context usage

**Recommended Changes:**

**Phase 1: Critical Fixes (HIGH PRIORITY)**
1. Add Output Format Rules to TIER 1 (+80 tokens)
   - Prevents think tags
   - Prevents fabricated dialogues
   - Ensures clean output

2. Clarify Assessment Mode instructions in TIER 2 (+60 tokens)
   - Explicit "WAIT for user" instructions
   - "Never create [USER RESPONSE]" rule
   - Prevents phi3 hallucination

3. Add post-processing filter for think tags
   - Simple regex: `.replace(/<think>.*?<\/think>/gs, '')`
   - Backup for smollm3 formatting

**Phase 2: Context Optimization (MEDIUM PRIORITY)**
1. Strengthen TIER 3 context mandate (+40 tokens)
   - Make context usage mandatory
   - Provide concrete checkboxes

2. Add post-message context reminder (+25 tokens)
   - Leverages recency bias
   - Reinforces importance

**Implementation Tasks:**
- [ ] Modify `enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js`
  - Update TIER1_BASE_SYSTEM constant (add output format rules)
  - Update TIER2_PROMPTS.ASSESSMENT (clarify instructions)
  - Update buildTier3Context() (strengthen mandate)
  - Update assembleFullPrompt() (add post-message reminder)

- [ ] Create validation test (15 prompts)
  - 5 assessment prompts (test hallucination fix)
  - 5 factual prompts (test overall quality)
  - 5 context-heavy prompts (test context usage)

- [ ] Run before/after comparison
  - Measure hallucination rate (target: 0%)
  - Measure think tag frequency (target: 0% after filtering)
  - Measure context usage score (target: 30%+ improvement)

- [ ] Full 50-prompt re-test with optimized prompts
  - Compare quality scores
  - Verify improvements
  - Update recommendations

**Estimated Effort:** 2-3 hours
**Expected Impact:** HIGH (eliminates critical issues)

---

## Work Stream 4: Interactive Viewer & Rating System 🔨 IN PROGRESS

### Status: IN PROGRESS (UI Built, Debugging Needed)

**Completed:**
- ✅ Created viewer directory structure
- ✅ Built HTML viewer (`viewer/response-viewer.html`)
  - Side-by-side comparison UI
  - Rating system (-1 to 5 scale)
  - Auto-detection of issues
  - Export functionality

**Current Issue:**
- ❌ Viewer not displaying prompts or responses
- ❌ Rating system not functional
- 🔍 Needs debugging

**Root Cause (Likely):**
- Browser security blocking local file access
- Relative path issues from viewer/ subdirectory
- JavaScript errors preventing data load

**Next Steps:**
- [ ] Debug viewer (check browser console)
- [ ] Fix file loading (may need local server or data bundling)
- [ ] Test with actual result files
- [ ] Verify rating save/load works
- [ ] Add keyboard shortcuts and navigation polish

**Alternative Approaches if Browser Blocking:**
1. **Node.js viewer** - Terminal-based review tool
2. **Bundle data** - Include result JSON in HTML file
3. **Local server** - Run `npx http-server` to serve files
4. **Jupyter notebook** - Use Python for interactive review

---

## Work Stream 5: llama-bench Integration 📋 PLANNED

### Status: PLANNED (Not Started)

**Goal:** Add hardware-level performance benchmarking to complement application-level testing

**Context:**
- `llama-bench` installed at `/opt/homebrew/bin/llama-bench`
- Detects M4 Max GPU with Metal support
- Can benchmark models with different prompt/generation token counts

**Planned Capabilities:**

**1. Baseline Performance Benchmarking**
```bash
llama-bench -m ~/llms/model.gguf -p 512,1024,2048 -n 128,256,512 -r 5
```
Measures:
- Raw prompt processing speed (tok/s)
- Raw generation speed (tok/s)
- GPU vs CPU performance
- Memory usage

**2. Integration with Test Suite**

Create: `run-llama-bench-baseline.js`
- Run llama-bench on all 3 models
- Test with prompt sizes: 512, 1024, 2048, 3072 tokens
- Test with generation sizes: 128, 256, 512 tokens
- Save results in unified schema format

**3. Comparison Analysis**

Compare:
- llama-bench baseline (raw hardware performance)
- Application performance (our multi-tier tests)
- Calculate overhead of our prompt construction

**Example Analysis:**
```
mistral baseline:        65 tok/s (llama-bench, 2048 prompt, 512 gen)
mistral application:     54 tok/s (our multi-tier tests, 2300 token prompts)
Overhead:                17% slower (multi-tier prompt construction, API calls)
```

**Implementation Tasks:**
- [ ] Create llama-bench wrapper script
- [ ] Run benchmarks on all 3 models
- [ ] Save results in test result schema format
- [ ] Create comparison report (baseline vs application)
- [ ] Identify if overhead is acceptable or needs optimization

**Estimated Effort:** 3-4 hours
**Expected Value:** MEDIUM (helps understand performance characteristics)

---

## Work Stream 6: ArionComply Production Comparison 📋 PLANNED

### Status: PLANNED (Not Started)

**Goal:** Compare test suite prompt construction with ArionComply production implementation

**User Request:** Analyze edge functions and database to understand production prompt assembly

**Investigation Needed:**

**1. Supabase Edge Functions**
- Location: ArionComply Supabase project
- Functions to analyze:
  - Prompt construction logic
  - TIER 1/2/3 assembly
  - RAG context injection
  - Intent classification

**2. Database Schema**
- Tables to check:
  - TIER 1/2/3 prompt templates
  - Organization profiles
  - Framework content
  - User conversation history

**3. Comparison Points**
- TIER 1 content: Test vs Production
- TIER 2 selection logic: Test vs Production
- TIER 3 variable substitution: Test vs Production
- RAG integration: Test (none) vs Production (active)

**Tasks:**
- [ ] Connect to ArionComply Supabase (local or cloud-dev)
- [ ] Read edge function code (prompt assembly)
- [ ] Query database for TIER 1/2/3 templates
- [ ] Compare with test suite implementation
- [ ] Document differences
- [ ] Identify improvements to incorporate

**Questions to Answer:**
1. Are test suite prompts accurate representations of production?
2. What's missing from tests? (RAG context, specific prompt variants)
3. Should we update test prompts to match production exactly?
4. Are there production prompt patterns that improve quality?

**Estimated Effort:** 2-3 hours
**Expected Value:** HIGH (ensures test realism)

---

## Work Stream 7: Response Viewer Completion 🔨 URGENT

### Status: BLOCKED (Viewer Not Working)

**Current Issue:**
- Viewer displays UI but no data loads
- Prompts section empty
- Responses section empty
- Cannot rate anything

**Debugging Needed:**
- [ ] Check browser console for JavaScript errors
- [ ] Verify file paths are correct
- [ ] Test if browser blocks local file access
- [ ] Confirm JSON files are being fetched

**Likely Solutions:**

**Solution A: Use Local Server (RECOMMENDED)**
```bash
cd /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/viewer
npx http-server -p 8000
# Open http://localhost:8000/response-viewer.html
```
Fixes CORS issues with local file:// protocol

**Solution B: Bundle Data in HTML**
- Generate viewer with data embedded
- No external file loading needed
- Single self-contained HTML file

**Solution C: Node.js Terminal Viewer**
- Interactive CLI tool
- No browser security issues
- Still allows rating and export

**Next Steps:**
- [ ] Try Solution A (local server) first
- [ ] If that works, viewer is complete
- [ ] If not, implement Solution B (bundled data)
- [ ] Test rating save/load functionality
- [ ] Verify export works (JSON and CSV)

**Priority:** HIGH (needed for quality evaluation workflow)

---

## Work Stream 8: Documentation & Reports 📝 ONGOING

### Status: ONGOING

**Created Documents:**
- ✅ `/tmp/QUALITATIVE-RESPONSE-EVALUATION.md` - Initial quality analysis
- ✅ `/tmp/COMPREHENSIVE-QUALITY-EVALUATION.md` - Detailed 15+ response analysis
- ✅ `/tmp/PROMPT-OPTIMIZATION-RECOMMENDATIONS.md` - Optimization guide
- ✅ `/tmp/MASTER-PROJECT-PLAN.md` - This document

**Still Needed:**
- [ ] Final model recommendation report
- [ ] Prompt optimization implementation guide
- [ ] Testing standards compliance verification
- [ ] Production readiness assessment

---

## Priority Queue (What to Do Next)

### 🔴 URGENT (Do First)
1. **Fix Response Viewer** (Work Stream 7)
   - Debug why data isn't loading
   - Try local server approach
   - Get viewer functional for rating workflow

### 🟡 HIGH PRIORITY (Do Soon)
2. **Complete Quality Evaluation** (Work Stream 2)
   - Use fixed viewer to rate all 150 responses
   - Build comprehensive rating dataset
   - Create final model recommendation

3. **ArionComply Production Comparison** (Work Stream 6)
   - Analyze edge functions
   - Compare test vs production prompts
   - Ensure test realism

4. **Implement Prompt Optimizations** (Work Stream 3)
   - Apply Phase 1 critical fixes
   - Test hallucination elimination
   - Run validation test suite

### 🟢 MEDIUM PRIORITY (Do Later)
5. **llama-bench Integration** (Work Stream 5)
   - Baseline performance benchmarking
   - Hardware metrics collection
   - Overhead analysis

6. **Documentation Finalization** (Work Stream 8)
   - Model recommendation report
   - Optimization implementation guide
   - Production deployment checklist

---

## Dependencies & Blockers

**Current Blocker:**
- 🚫 Viewer not working → Blocks comprehensive quality evaluation
- 🚫 Must fix before continuing rating workflow

**Sequential Dependencies:**
1. Fix viewer → Rate responses → Final model recommendation
2. ArionComply analysis → Prompt realism verification → Test updates
3. Prompt optimization → Validation testing → Full re-test

**Parallel Work Possible:**
- llama-bench integration (independent)
- Documentation writing (independent)
- ArionComply analysis (can do while viewer being fixed)

---

## Critical Decisions Needed

### Decision 1: Viewer Approach
**Question:** How should we fix the viewer?
**Options:**
  - A) Run local HTTP server (npx http-server)
  - B) Bundle data into HTML file
  - C) Build Node.js CLI viewer instead

**Recommendation:** Try A first (simplest), fall back to B if needed

---

### Decision 2: Prompt Optimization Timing
**Question:** When should we implement prompt improvements?
**Options:**
  - A) After completing quality evaluation (rating all 150)
  - B) Before rating (so we rate optimized prompts)
  - C) Run both (rate current, then rate optimized, compare)

**Recommendation:** Option A (complete rating of current prompts first, then optimize)

**Rationale:**
- Establishes baseline quality scores
- Can measure improvement after optimization
- Avoids re-rating if optimization doesn't help

---

### Decision 3: Production Comparison Scope
**Question:** How deep should ArionComply analysis go?
**Options:**
  - A) Quick comparison (read edge functions, compare prompts)
  - B) Deep analysis (analyze DB schema, RAG integration, full flow)
  - C) Implementation parity (update tests to exactly match production)

**Recommendation:** Start with A, expand to B if discrepancies found

---

## Success Criteria by Work Stream

### Work Stream 2 (Quality Evaluation)
**Complete when:**
- ✅ All 150 responses rated (-1 to 5 scale)
- ✅ Ratings saved to `ratings/human-ratings-{date}.json`
- ✅ Final model recommendation document created
- ✅ Clear production deployment decision made

---

### Work Stream 3 (Prompt Optimization)
**Complete when:**
- ✅ All 4 prompt sections modified
- ✅ Validation test shows 0% hallucination rate
- ✅ Context usage improves by 30%+
- ✅ Quality scores improve or stay same
- ✅ Optimized prompts documented

---

### Work Stream 5 (llama-bench)
**Complete when:**
- ✅ Baseline benchmarks run on all 3 models
- ✅ Results in unified schema format
- ✅ Comparison report (baseline vs application)
- ✅ Overhead analysis complete

---

### Work Stream 6 (ArionComply Comparison)
**Complete when:**
- ✅ Production prompt structure documented
- ✅ Test vs production differences identified
- ✅ Gaps documented
- ✅ Recommendations for test improvements made

---

### Work Stream 7 (Viewer)
**Complete when:**
- ✅ Viewer loads all 150 responses correctly
- ✅ Side-by-side comparison works
- ✅ Rating system functional
- ✅ Save/export works
- ✅ Auto-detection flags visible
- ✅ Navigation smooth

---

## Timeline Estimates

### If Working Sequentially

**Week 1 (Current):**
- Day 1 (Today): Fix viewer, begin rating responses
- Day 2-3: Complete rating all 150 responses
- Day 4: ArionComply production analysis
- Day 5: Create final recommendations

**Week 2:**
- Day 1-2: Implement prompt optimizations
- Day 3: Run validation tests
- Day 4: llama-bench integration
- Day 5: Full re-test with optimized prompts

### If Working in Parallel

**Immediate (Today):**
- Fix viewer (1 hour)
- Start rating responses (ongoing)
- ArionComply analysis (2 hours, can do in parallel)

**This Week:**
- Complete rating (2-3 days, as you have time)
- Implement prompt optimizations (1 day)
- Run validation test (few hours)

**Next Week:**
- llama-bench integration (1 day)
- Final comprehensive test (1 day)
- Documentation and recommendations (1 day)

---

## Risks & Mitigation

### Risk 1: Viewer Doesn't Work
**Impact:** Cannot efficiently rate 150 responses
**Probability:** MEDIUM
**Mitigation:**
- Have 3 backup approaches ready (local server, bundled data, CLI tool)
- Can manually review JSON files if needed (slower but workable)

---

### Risk 2: Prompt Optimizations Don't Help
**Impact:** phi3 still hallucinates, quality doesn't improve
**Probability:** LOW
**Mitigation:**
- Test on small sample first (15 prompts)
- Can revert to original prompts
- May need to abandon phi3 entirely

---

### Risk 3: Production Prompts Significantly Different
**Impact:** Test results not representative of production
**Probability:** MEDIUM
**Mitigation:**
- Early production comparison (Work Stream 6)
- Can update test prompts to match production
- May need to re-run tests with production-matched prompts

---

## Resource Requirements

**Time (Total Estimated):**
- Work Stream 2 (Quality Evaluation): 8-12 hours (including all 150 ratings)
- Work Stream 3 (Prompt Optimization): 2-3 hours
- Work Stream 5 (llama-bench): 3-4 hours
- Work Stream 6 (ArionComply Analysis): 2-3 hours
- Work Stream 7 (Viewer Fix): 1-2 hours

**Total:** 16-24 hours of work

**Compute Resources:**
- Test runs: ~20-40 minutes per full suite
- Models running sequentially (no parallel GPU needed)
- Disk space: ~1-2GB for all result files

**Dependencies:**
- llamacpp-manager (installed ✓)
- llama-bench (installed ✓)
- ArionComply Supabase access (need to verify)
- Test data (all present ✓)

---

## Open Questions

1. **Viewer approach**: Local server, bundled data, or CLI tool?
2. **Rating scope**: Rate all 150, or sample of 50?
3. **Prompt optimization**: Implement before or after rating?
4. **Production comparison**: Quick check or deep analysis?
5. **llama-bench priority**: Do now or defer?

---

## Next Immediate Action

**DEBUG AND FIX RESPONSE VIEWER** (highest priority)

**Steps:**
1. Open browser console and check for errors
2. Try running local HTTP server
3. Test if data loads
4. Verify rating functionality works
5. Once working, begin systematic rating

**After viewer works:**
- Start rating responses systematically
- Can do ArionComply analysis in parallel
- Make decision on prompt optimization timing

---

## Notes & Context

**What We've Learned:**
- ALL 50 multi-tier prompts exceed 2000 tokens (requirement met)
- phi3 has critical hallucination issue (cannot be used for assessments)
- mistral is production-ready (best quality/reliability)
- smollm3 excellent for education (with think tag filtering)
- Tokenization differences (22%) are normal and expected

**What We've Built:**
- Fixed test runner (saves responses)
- Performance analysis tools
- Quality evaluation methodology
- Prompt optimization recommendations
- Response viewer (needs debugging)

**What's Next:**
- Fix viewer and complete rating
- Compare with production implementation
- Implement prompt improvements
- Final model selection decision

---

## Contact & Questions

Libor Ballaty <libor@arionetworks.com>

**Current blocking issue:** Response viewer not loading data
**Next action:** Debug viewer and get it functional
