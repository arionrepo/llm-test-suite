# Input vs Output Complexity - Performance Results

## Test Results by Input Token Range

| Run | Input Range | Avg Input | Avg Output | Speed (tok/s) | Observation |
|-----|-------------|-----------|------------|---------------|-------------|
| 1 | Tiny (5-15) | 13.6 | 339.6 | 48.5 | Baseline |
| 2 | Short (20-40) | 18.7 | 402.5 | 47.7 | Consistent |
| 3 | Medium (50-100) | 30.3 | 474.7 | 47.8 | No degradation |
| 4 | Long (200-500) | 56.2 | 493.7 | 48.4 | Still fast |
| 5 | Very Long (1000-2500) | 158.4 | 491.1 | 48.2 | Maintained speed |

**Finding:** Input complexity does NOT affect speed. All runs ~48 tok/s regardless of input length.

## Prompts Actually Used

**Run 1:** What is GDPR? What is ISO 27001? (10 simple questions)
**Run 2:** What are the main principles of GDPR? (10 detailed questions)
**Run 3:** Healthcare HIPAA questions, ISO/SOC2 mapping (10 context questions)
**Run 4:** Multi-paragraph scenarios (10 long questions)
**Run 5:** Multi-tier with TIER 1+2+3 system prompts (10 realistic ArionComply prompts)

Full prompts: performance-prompts.js

Questions: libor@arionetworks.com
