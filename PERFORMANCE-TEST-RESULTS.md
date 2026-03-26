# Performance Test Results - Final Report

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/PERFORMANCE-TEST-RESULTS.md
**Test Date:** 2026-03-25 21:56 - 2026-03-26 01:28
**Duration:** 3 hours 32 minutes
**Author:** Libor Ballaty <libor@arionetworks.com>

---

## Test Summary

**Execution:**
- 5 runs × 10 prompts × 10 models = 500 total executions
- Completion rate: 500/500 (100%)
- Issues encountered: 0
- All models tested successfully with proper sequential isolation

**Verification:**
- Active endpoint testing (no timeout assumptions)
- 5-attempt recovery strategies (not needed - all succeeded)
- Clean sequential execution confirmed

---

## Performance Rankings

### By Output Speed (tokens/sec)

| Rank | Model | Tokens/Sec | Avg Time | Model Size |
|------|-------|------------|----------|------------|
| 1 🥇 | **smollm3** | 114.3 | 4.0s | 1B |
| 2 🥈 | **phi3** | 58.0 | 8.4s | 4B |
| 3 🥉 | **mistral** | 57.9 | 7.4s | 7B |
| 4 | llama-3.1-8b | 55.5 | 8.6s | 8B |
| 5 | hermes-3-llama-8b | 55.3 | 7.5s | 8B |
| 6 | qwen-coder-7b | 55.2 | 5.2s | 7B |
| 7 | llama-4-scout-17b | 28.4 | 17.1s | 17B |
| 8 | qwen2.5-32b | 19.3 | 23.6s | 32B |
| 9 | deepseek-r1-qwen-32b | 18.9 | 26.0s | 32B |
| 10 | mistral-small-24b | 18.4 | 27.0s | 24B |

---

## Key Findings

### 1. Small Models Dominate Speed

**smollm3 (1B) is 6x faster than large models!**
- smollm3: 114.3 tok/s
- qwen2.5-32b: 19.3 tok/s
- Ratio: 5.9x faster

**Sweet spot: 4-8B models**
- phi3, mistral, llama-3.1, hermes, qwen-coder: All ~55-58 tok/s
- Fast enough for real-time
- Good quality balance

### 2. Large Models Are Slow

**17B+ models all <30 tok/s**
- Takes 2-3x longer to generate responses
- Not suitable for interactive use
- Better for batch processing

### 3. Model Size Inversely Correlates with Speed

Clear pattern: Larger models = slower generation
- 1B: 114 tok/s
- 4-8B: 55-58 tok/s
- 17B: 28 tok/s
- 24-32B: 18-19 tok/s

### 4. All Models Handled All Input Ranges

- No failures across tiny (10 tok) to very long (2500 tok) inputs
- No degradation with longer inputs observed
- Large context window (qwen 131k) didn't provide speed advantage

---

## Recommendations

### For Production ArionComply:

**Interactive queries:** Use smollm3 or phi3
- Fastest response (4-8s average)
- Good enough quality for simple questions
- Best user experience

**Complex analysis:** Use qwen2.5-32b or hermes-3
- Higher quality despite slower speed
- Worth the wait for complex questions
- Use for synthesis/analysis tasks

**Batch processing:** Any model acceptable
- Speed less critical
- Can use large models for quality

**Cost optimization:** Use smollm3
- Fastest AND smallest
- Lowest resource usage
- Best tokens/sec per watt

---

## Files Generated

- `performance-run-1.json` through `performance-run-5.json`
- `performance-aggregate.json` (all 500 executions)
- `performance-test-full-run.log` (complete execution log)
- `performance-data.csv` (spreadsheet format)
- `performance-analysis.json` (statistical analysis)
- `performance-visualizations.html` (charts)

---

Contact: libor@arionetworks.com
