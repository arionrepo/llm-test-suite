# LLM Test Suite - Ratings Schema Documentation

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/docs/RATINGS-SCHEMA.md
**Description:** Complete specification for subjective quality ratings format and storage
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-27
**Version:** 1.0.0

---

## Overview

This document specifies the format for storing subjective quality ratings of LLM responses. Ratings are produced by LLM judges (e.g., Claude Sonnet 4.5) evaluating model outputs against standardized criteria.

**Purpose:**
- Enable consistent quality evaluation across different models and test runs
- Provide structured feedback for model comparison and improvement
- Support integration with analysis tools and viewers
- Maintain historical evaluation records

**Scope:**
- Rating file structure and schema
- Required and optional fields
- Validation requirements
- Storage conventions
- Integration guidelines

---

## File Structure

### Root Object

```json
{
  "rater": "string",              // REQUIRED: Name/version of rating system/judge
  "evaluationDate": "YYYY-MM-DD", // REQUIRED: Date evaluation performed
  "totalRatings": number,         // REQUIRED: Count of ratings in file
  "evaluationCriteria": {         // REQUIRED: Dimensions evaluated
    "dimension1": "description",
    "dimension2": "description",
    ...
  },
  "ratings": [...]                // REQUIRED: Array of individual ratings
}
```

### Individual Rating Object

Each element in the `ratings` array follows this structure:

```json
{
  "promptId": "string",           // REQUIRED: ID of prompt from test data
  "modelName": "string",          // REQUIRED: Model that generated response
  "runNumber": number,            // REQUIRED: Test run number (1, 2, etc.)
  "rating": number,               // REQUIRED: Overall rating score (1-5)
  "explanation": "string",        // REQUIRED: Detailed justification
  "flags": {                      // REQUIRED: Quality indicators
    "hallucination": boolean,     // REQUIRED: Contains false information?
    "thinkTags": boolean,         // REQUIRED: Contains <think> tags?
    "contextUsed": boolean,       // REQUIRED: Used provided context?
    "majorIssues": [string]       // REQUIRED: List of critical problems
  },
  "timestamp": "ISO8601"          // REQUIRED: When rating was created
}
```

---

## Field Specifications

### Root Level Fields

#### `rater` (string, REQUIRED)

Identifies the rating system or judge that produced the evaluations.

**Format:** `"{System Name} - {Description}"`

**Examples:**
- `"Claude Sonnet 4.5 - Comprehensive Subjective Evaluation"`
- `"Human Expert Panel - Healthcare Compliance Review"`
- `"GPT-4 - Automated Quality Assessment"`

**Purpose:** Enables comparison between different rating systems and tracking evaluation provenance.

---

#### `evaluationDate` (string, REQUIRED)

Date when the evaluation was performed.

**Format:** `YYYY-MM-DD` (ISO 8601 date only)

**Example:** `"2026-03-27"`

**Purpose:** Track when evaluations occurred for temporal analysis and audit trails.

---

#### `totalRatings` (number, REQUIRED)

Total count of individual ratings in the file.

**Constraints:**
- Must be non-negative integer
- Must match actual count of elements in `ratings` array

**Example:** `150`

**Purpose:** Quick validation check and summary statistic.

---

#### `evaluationCriteria` (object, REQUIRED)

Describes the dimensions on which responses were evaluated.

**Structure:**
```json
{
  "dimensionName": "description of what this dimension measures"
}
```

**Standard Dimensions (recommended):**
- `readability`: Structure, formatting, clarity, professionalism
- `understandability`: Appropriate for target audience, clear concepts, appropriate jargon
- `accuracy`: Correctness of information, valid citations, factual soundness

**Purpose:** Documents what aspects were considered during rating, enabling consistent interpretation across analyses.

---

#### `ratings` (array, REQUIRED)

Array of individual rating objects, one per evaluated response.

**Constraints:**
- Length must match `totalRatings`
- Each element must follow Individual Rating Object schema
- Must not contain null or undefined elements

---

### Individual Rating Fields

#### `promptId` (string, REQUIRED)

Unique identifier for the prompt that generated the response being rated.

**Format:** Must match prompt IDs from test data (typically `{VENDOR}_{STANDARD}_{TYPE}_{PERSONA}_{N}`)

**Example:** `"ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1"`

**Purpose:** Links rating to specific test case for analysis and display.

**Constraints:**
- Must exist in corresponding test results file
- Case-sensitive
- No leading/trailing whitespace

---

#### `modelName` (string, REQUIRED)

Name of the LLM model that generated the response being rated.

**Format:** Lowercase model identifier

**Examples:**
- `"phi3"`
- `"smollm3"`
- `"mistral"`
- `"claude-sonnet-4-5"`

**Purpose:** Enables per-model aggregation and comparison.

**Constraints:**
- Must match model names in test results files
- Case-sensitive (use lowercase by convention)
- No version suffixes (use base model name)

---

#### `runNumber` (number, REQUIRED)

Identifies which test run this rating belongs to (for repeated tests).

**Format:** Positive integer starting at 1

**Examples:** `1`, `2`, `3`

**Purpose:** Distinguishes between multiple evaluations of same model on same prompts.

**Use Cases:**
- Test-retest reliability analysis
- Tracking performance across time
- Comparing evaluation consistency

---

#### `rating` (number, REQUIRED)

Overall quality score on standardized scale.

**Scale:** 1-5 (integer only)

**Interpretation:**
- `1` - Poor quality: Major issues, not useful
- `2` - Below average: Significant problems, limited value
- `3` - Acceptable: Meets minimum standards, some issues
- `4` - Good quality: Minor issues, generally useful
- `5` - Excellent: High quality, no significant issues

**Purpose:** Provides single quantitative metric for comparison and ranking.

**Constraints:**
- Must be integer in range [1, 5]
- No decimal values
- No null or missing values

---

#### `explanation` (string, REQUIRED)

Detailed justification for the rating, explaining strengths and weaknesses.

**Format:** Free-form text, typically 50-500 words

**Should Include:**
- Specific examples from the response
- Reference to evaluation criteria
- Explanation of score (why not higher/lower)
- Context-specific observations

**Example:**
```
"The response provides a clear 4-point assessment structure covering key
GDPR areas (lawfulness, consent, data subject rights, breach notification).
The YES/NO/PARTIAL format is appropriate for a novice user just starting
their compliance journey. However, it completely ignores the Healthcare
industry context provided - there's no mention of patient data or health-
specific GDPR requirements. While technically accurate and well-formatted,
the generic nature significantly limits its value to this specific organization."
```

**Purpose:** Provides qualitative insight that raw scores cannot capture, essential for understanding rating decisions.

**Constraints:**
- Minimum 20 characters (prevent empty explanations)
- Should reference specific aspects of response
- Should tie back to evaluation criteria

---

#### `flags` (object, REQUIRED)

Boolean indicators and lists for specific quality issues.

**Structure:**
```json
{
  "hallucination": boolean,
  "thinkTags": boolean,
  "contextUsed": boolean,
  "majorIssues": [string]
}
```

##### `flags.hallucination` (boolean, REQUIRED)

Indicates if response contains fabricated or false information.

**Values:**
- `true`: Response includes statements not supported by facts or provided context
- `false`: Response factually accurate or appropriately hedged

**Example Issues:**
- Made-up statistics or citations
- False claims about regulations
- Invented product features

---

##### `flags.thinkTags` (boolean, REQUIRED)

Indicates if response contains reasoning/thinking tags that should be hidden.

**Values:**
- `true`: Response includes `<think>`, `<thinking>`, or similar tags
- `false`: Response properly formatted without internal reasoning markers

**Purpose:** Identifies responses that exposed internal reasoning process to end user.

---

##### `flags.contextUsed` (boolean, REQUIRED)

Indicates if response appropriately used provided context (org profile, framework details, etc.).

**Values:**
- `true`: Response incorporated relevant context from multi-tier prompt
- `false`: Response generic, ignoring specific organizational/situational context

**Purpose:** Measures context-awareness, crucial for personalized responses.

---

##### `flags.majorIssues` (array of strings, REQUIRED)

List of critical problems that significantly impact response quality.

**Format:** Array of short descriptive strings

**Examples:**
```json
[
  "Completely ignored healthcare industry context",
  "Recommended non-existent GDPR article",
  "Unsafe advice that could cause compliance violations"
]
```

**Purpose:** Highlights severe problems that warrant attention regardless of overall rating.

**Constraints:**
- Empty array `[]` if no major issues
- Brief descriptions (under 100 characters each)
- Focus on actionable problems

---

#### `timestamp` (string, REQUIRED)

ISO 8601 timestamp when rating was created.

**Format:** `YYYY-MM-DDTHH:mm:ss.sssZ` or `YYYY-MM-DDTHH:mm:ssZ`

**Example:** `"2026-03-26T17:43:55Z"`

**Purpose:** Audit trail, ordering ratings chronologically, identifying stale evaluations.

**Constraints:**
- Must be valid ISO 8601 format
- Should use UTC timezone (Z suffix)
- Include time component (not just date)

---

## Storage Conventions

### Directory Structure

```
llm-test-suite/
├── ratings/
│   ├── claude-subjective-test-10.json          # Individual run files
│   ├── claude-subjective-prompts-11-20.json    # Organized by prompt ranges
│   ├── claude-subjective-prompts-21-25.json
│   ├── claude-subjective-run2-prompts-1-10.json
│   ├── claude-subjective-run2-prompts-11-20.json
│   ├── claude-subjective-run2-prompts-21-25.json
│   ├── claude-all-150-ratings.json              # MERGED master file
│   └── human-ratings-{date}.json                # Human evaluations (if any)
```

### File Naming Conventions

**Individual Rating Files:**
```
{rater-system}-{descriptor}-{content}.json

Examples:
- claude-subjective-test-10.json
- claude-subjective-prompts-1-10.json
- human-expert-healthcare-specialists.json
```

**Master/Merged Files:**
```
{rater-system}-all-{count}-ratings.json

Examples:
- claude-all-150-ratings.json
- human-all-75-ratings.json
```

**Purpose:** Enables discovery, prevents collisions, indicates content at a glance.

---

## Validation Requirements

### File-Level Validation

Ratings files MUST pass these checks before being considered valid:

1. ✅ **JSON well-formed** - Valid JSON syntax
2. ✅ **Root object complete** - All required root fields present
3. ✅ **Rating count match** - `totalRatings` equals `ratings.length`
4. ✅ **All ratings valid** - Each rating passes individual validation
5. ✅ **Unique combinations** - No duplicate (promptId, modelName, runNumber) tuples
6. ✅ **Date format correct** - `evaluationDate` is valid YYYY-MM-DD
7. ✅ **Rater identified** - `rater` is non-empty string

### Individual Rating Validation

Each rating object MUST pass these checks:

1. ✅ **All required fields present** - No missing fields
2. ✅ **promptId not empty** - Non-empty string
3. ✅ **modelName not empty** - Non-empty string
4. ✅ **runNumber valid** - Positive integer
5. ✅ **rating in range** - Integer 1-5
6. ✅ **explanation sufficient** - At least 20 characters
7. ✅ **flags object complete** - All 4 flag fields present
8. ✅ **majorIssues is array** - Even if empty
9. ✅ **timestamp valid ISO8601** - Parseable as date

### Recommended Validation Script

```javascript
function validateRatingsFile(data) {
  // Root validation
  if (!data.rater || !data.evaluationDate || !data.ratings) {
    throw new Error('Missing required root fields');
  }

  if (data.totalRatings !== data.ratings.length) {
    throw new Error(`totalRatings ${data.totalRatings} != actual ${data.ratings.length}`);
  }

  // Individual rating validation
  data.ratings.forEach((rating, idx) => {
    if (!rating.promptId || !rating.modelName) {
      throw new Error(`Rating ${idx}: missing promptId or modelName`);
    }

    if (rating.rating < 1 || rating.rating > 5 || !Number.isInteger(rating.rating)) {
      throw new Error(`Rating ${idx}: invalid rating value ${rating.rating}`);
    }

    if (!rating.explanation || rating.explanation.length < 20) {
      throw new Error(`Rating ${idx}: explanation too short`);
    }

    if (!rating.flags || typeof rating.flags.hallucination !== 'boolean') {
      throw new Error(`Rating ${idx}: invalid flags object`);
    }

    if (!Array.isArray(rating.flags.majorIssues)) {
      throw new Error(`Rating ${idx}: majorIssues must be array`);
    }
  });

  return true;
}
```

---

## Integration Guidelines

### Loading Ratings in Web Applications

```javascript
// Fetch and validate ratings
async function loadRatings(filePath) {
  const response = await fetch(filePath);
  const data = await response.json();

  // Validate before using
  if (!validateRatingsFile(data)) {
    throw new Error('Invalid ratings file');
  }

  return data;
}

// Index by promptId for quick lookup
function indexRatings(ratingsFile) {
  const index = new Map();

  ratingsFile.ratings.forEach(rating => {
    const key = `${rating.promptId}:${rating.modelName}:${rating.runNumber}`;
    index.set(key, rating);
  });

  return index;
}

// Get rating for specific response
function getRating(index, promptId, modelName, runNumber = 1) {
  const key = `${promptId}:${modelName}:${runNumber}`;
  return index.get(key) || null;
}
```

### Aggregating Statistics

```javascript
// Calculate average rating per model
function averageRatingByModel(ratingsFile) {
  const byModel = {};

  ratingsFile.ratings.forEach(r => {
    if (!byModel[r.modelName]) {
      byModel[r.modelName] = { sum: 0, count: 0 };
    }
    byModel[r.modelName].sum += r.rating;
    byModel[r.modelName].count += 1;
  });

  return Object.entries(byModel).map(([model, stats]) => ({
    model,
    average: (stats.sum / stats.count).toFixed(2),
    count: stats.count
  }));
}

// Count ratings by score
function ratingDistribution(ratingsFile) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  ratingsFile.ratings.forEach(r => {
    dist[r.rating]++;
  });

  return dist;
}
```

### Merging Multiple Rating Files

```javascript
import fs from 'fs';
import path from 'path';

function mergeRatingFiles(filePaths, outputPath) {
  const allRatings = [];

  // Load all files
  for (const file of filePaths) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));

    // Validate before merging
    if (!validateRatingsFile(data)) {
      console.error(`Invalid file: ${file}`);
      continue;
    }

    allRatings.push(...data.ratings);
  }

  // Create merged file
  const merged = {
    rater: "Claude Sonnet 4.5 - Comprehensive Subjective Evaluation",
    evaluationDate: new Date().toISOString().split('T')[0],
    totalRatings: allRatings.length,
    evaluationCriteria: {
      readability: "Structure, formatting, clarity, professionalism",
      understandability: "Appropriate for persona, clear concepts, jargon usage",
      accuracy: "Correct compliance info, valid citations, legally sound"
    },
    ratings: allRatings
  };

  // Validate merged result
  if (!validateRatingsFile(merged)) {
    throw new Error('Merged file invalid');
  }

  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));

  console.log(`✅ Merged ${allRatings.length} ratings to ${outputPath}`);
  return merged;
}
```

---

## Example Complete File

```json
{
  "rater": "Claude Sonnet 4.5 - Comprehensive Subjective Evaluation",
  "evaluationDate": "2026-03-26",
  "totalRatings": 3,
  "evaluationCriteria": {
    "readability": "Structure, formatting, clarity, professionalism",
    "understandability": "Appropriate for persona, clear concepts, jargon usage",
    "accuracy": "Correct compliance info, valid citations, legally sound"
  },
  "ratings": [
    {
      "promptId": "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",
      "modelName": "phi3",
      "runNumber": 1,
      "rating": 3,
      "explanation": "The response provides a clear 4-point assessment structure covering key GDPR areas. The YES/NO/PARTIAL format is appropriate for a novice user. However, it completely ignores the Healthcare industry context provided in TIER 3 - no mention of patient data or health-specific GDPR requirements. While technically accurate and well-formatted, the generic nature significantly limits its value.",
      "flags": {
        "hallucination": false,
        "thinkTags": false,
        "contextUsed": false,
        "majorIssues": [
          "Ignored healthcare industry context"
        ]
      },
      "timestamp": "2026-03-26T17:43:55Z"
    },
    {
      "promptId": "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",
      "modelName": "smollm3",
      "runNumber": 1,
      "rating": 2,
      "explanation": "The response asks clarifying questions which is good practice, but the questions are extremely basic and don't demonstrate GDPR knowledge. No actionable guidance provided. The 'start the assessment process' is vague. For a compliance platform, users expect more substantive initial guidance, not just a form to fill out. The complete lack of GDPR-specific context or preliminary recommendations makes this feel like a generic chatbot rather than a compliance expert.",
      "flags": {
        "hallucination": false,
        "thinkTags": false,
        "contextUsed": false,
        "majorIssues": []
      },
      "timestamp": "2026-03-26T17:45:12Z"
    },
    {
      "promptId": "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",
      "modelName": "mistral",
      "runNumber": 1,
      "rating": 4,
      "explanation": "Strong response with clear structure and concrete action steps. Provides a numbered framework that guides a novice through key GDPR assessment areas. Mentions specific requirements like consent mechanisms and DPO appointment. However, still somewhat generic - could have referenced healthcare context from TIER 3 (patient data, medical records). The action-oriented approach and specific examples make this valuable despite the context gap.",
      "flags": {
        "hallucination": false,
        "thinkTags": false,
        "contextUsed": false,
        "majorIssues": []
      },
      "timestamp": "2026-03-26T17:46:33Z"
    }
  ]
}
```

---

## Version History

### 1.0.0 (2026-03-27)
- Initial schema documentation
- Defined all required fields and constraints
- Provided validation requirements
- Added integration examples
- Established storage conventions

---

## Related Documentation

- **PROMPT-SCHEMA.md** - Test prompt format specification
- **TEST-RESULT-SCHEMA.md** - Performance test result format (TODO: verify filename)
- **ANALYSIS-API-GUIDE.md** - How to analyze ratings data
- **CLAUDE.md** - Project-specific testing standards

---

## Contact

Questions about this schema: libor@arionetworks.com
