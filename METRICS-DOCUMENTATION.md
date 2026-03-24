# LLM Test Suite - Metrics Documentation

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/METRICS-DOCUMENTATION.md
**Description:** Complete reference for all test metrics - what they measure, how they're calculated, why they matter
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-24

---

## Overview

This document explains every metric used in the LLM test suite, organized by category.

---

## Prompt Complexity Metrics

### 1. Character Count

**What it measures:** Total number of characters in the prompt (including spaces, punctuation)

**How it's calculated:**
```javascript
characterCount = promptText.length
```

**Example:**
```
Prompt: "What is GDPR?"
Character Count: 14
```

**Why it matters:** 
- Longer prompts take more time to process
- Indicates prompt verbosity
- Some models have character limits

**Typical ranges:**
- Short: < 50 characters
- Medium: 50-200 characters
- Long: 200-500 characters
- Very Long: > 500 characters

---

### 2. Word Count

**What it measures:** Total number of words in the prompt

**How it's calculated:**
```javascript
wordCount = promptText.trim().split(/\s+/).filter(w => w.length > 0).length
```

**Example:**
```
Prompt: "What are the main principles of GDPR?"
Words: ["What", "are", "the", "main", "principles", "of", "GDPR"]
Word Count: 7
```

**Why it matters:**
- More words = more complex question
- Correlates with processing time
- Indicates question scope

**Typical ranges:**
- Short: 1-10 words
- Medium: 10-25 words
- Long: 25-50 words
- Very Long: > 50 words

---

### 3. Estimated Tokens

**What it measures:** Approximate number of tokens the LLM will process

**How it's calculated:**
```javascript
estimatedTokens = Math.ceil(characterCount / 4)
```

**Calculation basis:** English text averages ~4 characters per token

**Example:**
```
Prompt: "What is GDPR?" (14 characters)
Estimated Tokens: Math.ceil(14 / 4) = 4 tokens
```

**Why it matters:**
- **Direct cost impact** - Most LLM APIs charge per token
- **Processing time** - More tokens = longer processing
- **Context window** - Tokens count against model's context limit

**Typical ranges:**
- Tiny: 1-5 tokens
- Small: 5-20 tokens
- Medium: 20-50 tokens
- Large: 50-100 tokens
- Very Large: > 100 tokens

**Accuracy note:** This is an estimate. Actual tokenization depends on the model's tokenizer (GPT uses BPE, others may differ).

---

### 4. Sentence Count

**What it measures:** Number of sentences in the prompt

**How it's calculated:**
```javascript
sentenceCount = promptText.split(/[.!?]+/).filter(s => s.trim().length > 0).length
```

**Example:**
```
Prompt: "What is GDPR? Why does it matter?"
Sentences: ["What is GDPR", "Why does it matter"]
Sentence Count: 2
```

**Why it matters:**
- Multiple sentences = multi-part question
- Indicates complexity of request
- May require compound response

**Typical ranges:**
- Simple: 1 sentence
- Moderate: 2-3 sentences
- Complex: 4+ sentences

---

### 5. Question Count

**What it measures:** Number of question marks in the prompt

**How it's calculated:**
```javascript
questionCount = (promptText.match(/\?/g) || []).length
```

**Example:**
```
Prompt: "What is GDPR? What are its principles?"
Question Count: 2
```

**Why it matters:**
- Multiple questions = expects multiple answers
- Increases response complexity
- May require structured response

---

### 6. Technical Term Count

**What it measures:** Number of compliance/technical terms in the prompt

**How it's calculated:**
```javascript
// Check prompt against dictionary of 40+ technical terms
TECHNICAL_TERMS = ['gdpr', 'iso', 'compliance', 'audit', 'encryption', ...]

technicalTermCount = 0
for each term in TECHNICAL_TERMS:
    count matches in promptText (case-insensitive, word boundaries)
    technicalTermCount += matches
```

**Example:**
```
Prompt: "What GDPR compliance requirements apply to ISO 27001 encryption controls?"
Technical Terms Found: "GDPR", "compliance", "requirements", "ISO", "encryption", "controls"
Technical Term Count: 6
```

**Why it matters:**
- Higher technical density = more specialized knowledge required
- Indicates domain expertise level needed
- May trigger framework-specific prompts (TIER 2)

**Term categories:**
- **Regulations:** GDPR, CCPA, HIPAA, ISO, SOC, PCI-DSS, etc.
- **Compliance terms:** audit, assessment, control, requirement, certification
- **Security terms:** encryption, authentication, authorization, access control
- **Privacy terms:** PII, PHI, data subject, processor, controller
- **AI terms:** AI Act, high-risk AI, fundamental rights

---

### 7. Technical Density (%)

**What it measures:** Percentage of words that are technical terms

**How it's calculated:**
```javascript
technicalDensity = (technicalTermCount / wordCount) * 100
```

**Example:**
```
Prompt: "What GDPR compliance requirements apply to ISO 27001 encryption?"
Word Count: 9
Technical Term Count: 5 (GDPR, compliance, requirements, ISO, encryption)
Technical Density: (5 / 9) * 100 = 55.6%
```

**Why it matters:**
- High density = expert-level question
- Low density = general question
- Helps determine appropriate persona response level

**Typical ranges:**
- Low: 0-20% (general questions)
- Medium: 20-40% (technical questions)
- High: 40-60% (expert questions)
- Very High: > 60% (specialist questions)

---

### 8. Is Multi-Part Question

**What it measures:** Whether the prompt contains multiple related questions or requests

**How it's detected:**
```javascript
Indicators:
- " and " conjunction
- " or " conjunction
- "also", "additionally", "furthermore"
- "first...second" patterns
- "both...and" patterns
```

**Examples:**
```
Multi-Part: TRUE
- "What is GDPR and how does it apply to cloud services?"
- "Explain ISO 27001 controls and also their implementation"

Multi-Part: FALSE
- "What is GDPR?"
- "How does ISO 27001 apply?"
```

**Why it matters:**
- Multi-part questions require compound responses
- Longer processing time
- May need structured formatting
- Tests model's ability to handle complex requests

---

### 9. Has List Request

**What it measures:** Whether the prompt asks for a list or enumeration

**How it's detected:**
```javascript
Indicators:
- "list"
- "what are"
- "which are"
- "enumerate"
- "identify all"
- "name all"
- "steps"
- "requirements"
```

**Examples:**
```
Has List: TRUE
- "List the GDPR principles"
- "What are the requirements for SOC 2?"
- "What steps are needed for ISO 27001 certification?"

Has List: FALSE
- "Explain GDPR"
- "How does encryption work?"
```

**Why it matters:**
- List responses tend to be structured/formatted
- Predictable response pattern
- May need bullet points or numbered lists
- Tests model's ability to organize information

---

### 10. Has Comparison Request

**What it measures:** Whether the prompt asks to compare multiple things

**How it's detected:**
```javascript
Indicators:
- "compare"
- "difference between"
- "similarities"
- "versus" or "vs"
- "contrast"
- "distinguish"
```

**Examples:**
```
Has Comparison: TRUE
- "Compare GDPR and CCPA"
- "What's the difference between ISO 27001 and SOC 2?"
- "GDPR vs HIPAA privacy requirements"

Has Comparison: FALSE
- "Explain GDPR"
- "What is SOC 2?"
```

**Why it matters:**
- **Most complex query type** - requires multi-document knowledge
- **Tests synthesis capability** (knowledge type: SYNTHESIS)
- **High retrieval demand** - needs RAG or knowledge graph
- Typically longer responses
- Baseline LLM score: 0% (needs retrieval infrastructure)

---

### 11. Complexity Score (0-100)

**What it measures:** Overall prompt complexity on 0-100 scale

**How it's calculated:**

```javascript
complexityScore = 0

// 1. Token count contribution (0-25 points)
if (tokens < 10) score += 5
else if (tokens < 20) score += 10
else if (tokens < 40) score += 15
else score += 25

// 2. Sentence count contribution (0-15 points)
score += min(sentenceCount * 5, 15)

// 3. Technical density contribution (0-20 points)
score += min(technicalDensity * 4, 20)

// 4. Question type contribution (0-40 points)
if (hasComparisonRequest) score += 20
if (hasListRequest) score += 10
if (isMultiPart) score += 10
if (questionCount > 1) score += 10

complexityScore = min(score, 100)
```

**Example Calculation:**

```
Prompt: "Compare GDPR and CCPA consumer rights - what are the key differences?"

1. Token count: 15 tokens → 10 points
2. Sentences: 1 sentence → 5 points
3. Technical density: 26.7% → 10.7 points
4. Question types:
   - Has comparison: +20 points
   - Has list ("what are"): +10 points
   - Is multi-part (and, -): +10 points
   - 1 question: +0 points

Total: 10 + 5 + 10.7 + 40 = 65.7 → Complexity Score: 66/100
```

**Why it matters:**
- **Performance prediction** - Higher score = slower response
- **Cost estimation** - Complex prompts cost more to process
- **Model selection** - Some models better at complex queries
- **Retrieval needs** - High complexity may need enhanced retrieval

---

### 12. Complexity Level (Categorical)

**What it measures:** Human-readable complexity classification

**How it's determined:**
```javascript
if (complexityScore < 30) → "simple"
if (complexityScore < 50) → "moderate"
if (complexityScore < 70) → "complex"
if (complexityScore >= 70) → "very_complex"
```

**Distribution in current test set:**
- Simple: ~30% of prompts
- Moderate: ~45% of prompts
- Complex: ~20% of prompts
- Very Complex: ~5% of prompts

**Why it matters:**
- **Quick filtering** in viewer
- **Batch selection** for testing similar complexity
- **Performance benchmarking** - group by complexity

---

### 13. Performance Class

**What it measures:** Expected processing speed category

**How it's determined:**
```javascript
Same as complexity level (aligned):
- simple → "fast" (< 30 complexity)
- moderate → "medium" (30-50 complexity)
- complex → "slow" (50-70 complexity)
- very_complex → "very_slow" (> 70 complexity)
```

**Why it matters:**
- **Performance testing** - group prompts by expected speed
- **Timeout configuration** - adjust timeouts based on class
- **User experience** - set expectations for response time
- **Cost optimization** - balance complexity vs performance needs

**Observed correlation (from pilot test):**
- Fast prompts: ~300-500ms response
- Medium prompts: ~500-1500ms response
- Slow prompts: ~1500-3000ms response
- Very Slow prompts: > 3000ms response

---

## Knowledge Type Metrics

### Factual Knowledge Score

**What it measures:** Model's ability to recall facts, definitions, requirements from training data

**How it's calculated:**
```javascript
Test: "What is GDPR?"
Expected Topics: ["regulation", "privacy", "EU", "data protection"]

Response analysis:
- Check if each expected topic appears in response
- Score = (topics found / total topics) * 100
```

**Baseline performance:** 71.3% (without retrieval)

**What this tells you:**
- **71.3% = Decent** - LLM knows basic facts from training
- **Target with Vector DB: 90%+** - Semantic search improves recall
- **Retrieval strategy:** Vector embeddings for fact retrieval

**Why it matters:**
- Foundation for all other knowledge types
- Quick answers need high factual accuracy
- Shows if training data includes compliance knowledge

---

### Relational Knowledge Score

**What it measures:** Model's ability to understand relationships between entities, cross-references, dependencies

**How it's calculated:**
```javascript
Test: "How does GDPR Article 30 relate to Article 5?"
Expected Topics: ["accountability", "demonstrate compliance", "transparency"]

Response analysis:
- Does response explain relationship?
- Does it mention key connection points?
- Score = (relationship concepts found / expected) * 100
```

**Baseline performance:** 44.4% (without retrieval)

**What this tells you:**
- **44.4% = CRITICAL GAP** - LLM struggles with relationships
- **Recommendation: BUILD knowledge graph**
- **Retrieval strategy:** Graph database with entity relationships

**Why it matters:**
- Compliance is relational (Article X implements Principle Y)
- Cross-framework mapping needs this
- Shows need for graph database over pure vector search

**Example relationships:**
- GDPR Article 30 → supports → Article 5 (accountability)
- ISO 27001 A.8.2 → implements → SOC 2 CC6.1
- EU AI Act high-risk → requires → GDPR DPIA

---

### Procedural Knowledge Score

**What it measures:** Model's ability to provide step-by-step workflows, implementation processes

**How it's calculated:**
```javascript
Test: "What are the steps to conduct a GDPR DPIA?"
Expected Steps: ["describe processing", "assess necessity", "identify risks", "mitigation"]

Response analysis:
- Does response include step-by-step instructions?
- Are steps in logical order?
- Score = (steps mentioned / steps required) * 100
```

**Baseline performance:** 12.5% (without retrieval)

**What this tells you:**
- **12.5% = CRITICAL FAILURE** - LLM doesn't know procedures
- **Recommendation: BUILD structured workflow documents**
- **Retrieval strategy:** Process flows, checklists, sequential guides

**Why it matters:**
- Users need "how to" guidance
- Compliance requires specific procedures
- Shows need for structured documentation (not just facts)

**What to build:**
- Process flow diagrams
- Step-by-step implementation guides
- Checklists and templates
- Sequential dependency chains

---

### Exact Match Knowledge Score

**What it measures:** Model's ability to cite exact regulation text, article numbers, specific clauses

**How it's calculated:**
```javascript
Test: "What does GDPR Article 17 state?"
Expected: Article 17 citation or exact text

Response analysis:
- Does response cite Article 17?
- Does it provide accurate text/summary?
- Score = 100% if found, 50% if partially correct, 0% if wrong
```

**Baseline performance:** 50.0% (without retrieval)

**What this tells you:**
- **50% = NEEDS IMPROVEMENT** - LLM sometimes recalls exact text
- **Recommendation: Optimize Meilisearch for citations**
- **Retrieval strategy:** Full-text search with exact matching

**Why it matters:**
- Legal compliance requires precise citations
- Auditors need exact regulation text
- Paraphrasing can introduce errors

**What to build:**
- Full-text search index of all regulations
- Article/section number indexing
- Exact text retrieval (not semantic)

---

### Synthesis Knowledge Score

**What it measures:** Model's ability to compare frameworks, analyze gaps, synthesize across documents

**How it's calculated:**
```javascript
Test: "Compare GDPR and CCPA consumer rights"
Expected Topics: ["territorial scope", "rights differences", "enforcement"]

Response analysis:
- Does response compare both frameworks?
- Does it identify similarities and differences?
- Does it synthesize insights?
- Score = (synthesis elements present / expected) * 100
```

**Baseline performance:** 0% (without retrieval)

**What this tells you:**
- **0% = COMPLETE FAILURE** - LLM cannot synthesize without retrieval
- **Recommendation: BUILD RAG multi-document retrieval**
- **Retrieval strategy:** Retrieve from multiple sources, synthesize with LLM

**Why it matters:**
- **Most valuable capability** for compliance professionals
- Gap analysis, framework mapping, comparison all need this
- Shows RAG is not optional - it's critical

**What to build:**
- Multi-document retrieval pipeline
- Framework comparison matrices
- Cross-reference mapping
- Synthesis prompt engineering

---

## Performance Metrics (From Test Results)

### Response Time (totalMs)

**What it measures:** Total time from request to complete response

**How it's calculated:**
```javascript
startTime = Date.now()
// Make API call
response = await fetch(...)
endTime = Date.now()
totalMs = endTime - startTime
```

**Example from pilot test:**
```
Simple prompt: 357-555ms
Medium prompt: 7,280ms
Long prompt: 13,690ms
```

**Why it matters:**
- **User experience** - Affects perceived responsiveness
- **SLA planning** - Set realistic response time expectations
- **Timeout configuration** - Set appropriate timeouts
- **Cost** - Longer processing = higher compute cost

**Correlation with complexity:**
```
Complexity Score → Response Time
0-30 (simple) → 300-1000ms
30-50 (moderate) → 1000-3000ms
50-70 (complex) → 3000-8000ms
70-100 (very complex) → 8000-20000ms+
```

---

### Prompt Processing Time (promptMs)

**What it measures:** Time spent processing input prompt (encoding, attention)

**Source:** Returned by llama.cpp in response.timings.prompt_ms

**Example:**
```
Prompt: "What are the legal bases for processing under GDPR Article 6?"
Prompt Tokens: 18
Prompt Processing: 183.73ms
Prompt Speed: 98 tokens/sec
```

**Why it matters:**
- Shows model's input processing efficiency
- Independent of response generation
- Helps identify prompt encoding bottlenecks

---

### Response Generation Time (predictedMs)

**What it measures:** Time spent generating the response tokens

**Source:** Returned by llama.cpp in response.timings.predicted_ms

**Example:**
```
Response Tokens: 500
Generation Time: 16,592ms
Generation Speed: 30.1 tokens/sec
```

**Why it matters:**
- Main component of response time
- Shows model's generation speed
- Varies by model size and quantization

---

### Prompt Tokens

**What it measures:** Actual number of tokens in the input prompt (from tokenizer)

**Source:** Returned by llama.cpp in response.usage.prompt_tokens

**Example:**
```
Prompt: "What are the main principles of GDPR?"
Estimated Tokens: 9 (our calculation)
Actual Tokens: 18 (from tokenizer)
```

**Why it matters:**
- **Accurate cost calculation** (not estimate)
- **Context window tracking** - counts against model's limit
- **Validates our estimation formula**

**Note:** Often 2x our estimate because tokenizer includes system prompts

---

### Completion Tokens

**What it measures:** Actual number of tokens in the generated response

**Source:** Returned by llama.cpp in response.usage.completion_tokens

**Example:**
```
Response Tokens: 500
Max Tokens Setting: 500
```

**Why it matters:**
- **Billing** - Most APIs charge per completion token
- **Response length** - Indicates answer completeness
- **Cutoff detection** - If equals max_tokens, response may be truncated

---

### Tokens Per Second

**What it measures:** Response generation throughput

**Source:** Returned by llama.cpp in response.timings.predicted_per_second

**Example:**
```
Model: llama-4-scout-17b
Generation Speed: 28.2 tokens/sec

Model: hermes-3-llama-8b  
Generation Speed: 31.2 tokens/sec
```

**Why it matters:**
- **Model comparison** - Smaller models often faster
- **Hardware utilization** - Shows GPU/CPU efficiency
- **User experience** - Affects streaming speed

**Typical ranges:**
- Slow: < 20 tok/s
- Medium: 20-40 tok/s
- Fast: 40-60 tok/s
- Very Fast: > 60 tok/s

**Observed rates (pilot test):**
- llama-4-scout-17b: 22.7-31.3 tok/s (17B params, Q6_K)
- hermes-3-llama-8b: 30-35 tok/s (8B params, Q8_0)

---

## Test Result Metrics

### Pass/Fail Status

**What it measures:** Whether the response met minimum quality criteria

**How it's determined:**
```javascript
Pass if:
- At least 50% of expected topics present
- Response length > 20 characters
- No error occurred

Fail if:
- < 50% of expected topics
- Response too short
- Timeout or error
```

**Why it matters:**
- Binary success indicator
- Calculate pass rate per knowledge type
- Identify systematic failures

---

### Topic Coverage Score (%)

**What it measures:** Percentage of expected topics found in response

**How it's calculated:**
```javascript
topicsFound = 0
for each expectedTopic:
    if response.toLowerCase().includes(topic.toLowerCase()):
        topicsFound++

score = (topicsFound / totalExpectedTopics) * 100
```

**Example:**
```
Expected Topics: ["regulation", "privacy", "EU", "data protection"]
Response includes: "regulation", "EU", "data protection"
Missing: "privacy"

Topic Coverage: 3/4 = 75%
```

**Why it matters:**
- **Granular accuracy measure** - better than pass/fail
- **Identifies gaps** - which topics are missed
- **Guides retrieval** - add missing topics to knowledge base

---

### Pass Rate (%)

**What it measures:** Percentage of tests passed for a category

**How it's calculated:**
```javascript
passRate = (testsPassed / totalTests) * 100
```

**Example from pilot test:**
```
FACTUAL: 17/20 passed = 85% pass rate
RELATIONAL: 2/6 passed = 33% pass rate
PROCEDURAL: 0/8 passed = 0% pass rate
```

**Why it matters:**
- **Category performance** - which knowledge types work
- **Retrieval priority** - fix lowest pass rates first
- **Model comparison** - which models excel at what

---

## Retrieval Strategy Recommendations

### When Each Strategy Is Recommended:

**Vector DB** - Recommended when:
- Knowledge Type: FACTUAL
- Score: < 90%
- Use case: Semantic search for facts, definitions, requirements

**Knowledge Graph** - Recommended when:
- Knowledge Type: RELATIONAL
- Score: < 70%
- Use case: Cross-references, dependencies, entity relationships

**Structured Retrieval** - Recommended when:
- Knowledge Type: PROCEDURAL
- Score: < 70%
- Use case: Step-by-step workflows, checklists, processes

**Meilisearch (Full-Text)** - Recommended when:
- Knowledge Type: EXACT_MATCH
- Score: < 90%
- Use case: Precise citations, regulation text, article numbers

**RAG Synthesis** - Recommended when:
- Knowledge Type: SYNTHESIS
- Score: < 50%
- Use case: Multi-document comparison, gap analysis, framework mapping

---

## Performance Correlation Analysis

### Complexity vs Response Time

**From pilot test data:**

| Complexity Range | Avg Response Time | Tokens/Sec |
|-----------------|-------------------|------------|
| 0-30 (Simple) | 357-555ms | 31.2 tok/s |
| 30-50 (Moderate) | 1000-2000ms | 28-30 tok/s |
| 50-70 (Complex) | 3000-8000ms | 25-28 tok/s |
| 70-100 (Very Complex) | 8000ms+ | 20-25 tok/s |

**Observations:**
1. Response time increases non-linearly with complexity
2. Token generation slows slightly for complex queries
3. Multi-part questions add 2-3x processing time
4. Comparison requests (synthesis) slowest

---

## How to Use These Metrics

### For Test Design:
```javascript
// Balance test set across complexity levels
Simple prompts: 30% (quick validation)
Moderate prompts: 40% (typical usage)
Complex prompts: 20% (edge cases)
Very Complex: 10% (stress testing)
```

### For Model Selection:
```javascript
// Match model to complexity
Simple queries → smollm3, phi3 (fast, cheap)
Moderate queries → llama-3.1-8b, mistral (balanced)
Complex queries → llama-4-scout-17b, qwen2.5-32b (large, capable)
Very Complex → deepseek-r1-qwen-32b (reasoning specialist)
```

### For Performance Optimization:
```javascript
// Set timeouts based on complexity
fast: 5000ms timeout
medium: 15000ms timeout
slow: 30000ms timeout
very_slow: 60000ms timeout
```

### For Cost Estimation:
```javascript
// Estimate cost based on complexity + tokens
Simple: ~10-20 tokens → $0.0001 per query
Moderate: ~20-50 tokens → $0.0003 per query
Complex: ~50-100 tokens → $0.0008 per query
Very Complex: ~100-300 tokens → $0.002 per query
```

---

## Metric Export Formats

### JSON Export
**Location:** `reports/prompts/all-prompts-comprehensive.json`

**Structure:**
```json
{
  "question": "What is GDPR?",
  "promptComplexity": {
    "level": "moderate",
    "score": 30,
    "tokens": 4,
    "technicalDensity": 33.3,
    "isMultiPart": false,
    "hasComparison": false,
    "performanceClass": "medium"
  }
}
```

### CSV Export
**Location:** `reports/prompts/compliance-prompts.csv`

**Columns:**
```
ID, Standard, Knowledge Type, Persona, Question, Expected Topics, Retrieval Strategy
```

### Interactive Viewer
**Location:** `reports/prompts/prompt-viewer.html`

**Filters available:**
- Standard (GDPR, ISO 27001, etc.)
- Knowledge Type (Factual, Relational, etc.)
- Persona (Novice, Practitioner, etc.)
- Complexity Level (Simple, Moderate, Complex, Very Complex)
- Performance Class (Fast, Medium, Slow, Very Slow)

---

## Questions or Need Clarification?

Contact: libor@arionetworks.com

See also:
- `utils/prompt-complexity-analyzer.js` - Implementation code
- `export-prompts.js` - Export logic
- `enterprise/enterprise-test-runner.js` - Performance measurement
