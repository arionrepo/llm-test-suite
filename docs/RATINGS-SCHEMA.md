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

## Linking Ratings to Test Results

### Overview

Ratings evaluate **LLM responses** from performance tests. Each rating links to its corresponding test result through three identifiers:

1. **`promptId`** - Which test prompt was used
2. **`modelName`** - Which model generated the response
3. **`runNumber`** - Which test run (for repeated tests)

### Test Result File Location

Test results are stored in dated directories under `reports/performance/`:

```
reports/
└── performance/
    └── YYYY-MM-DD/
        ├── test-results-multitier-{modelName}-split-25-run1-{timestamp}.json
        ├── test-results-multitier-{modelName}-split-25-run2-{timestamp}.json
        └── ...
```

**File naming pattern:**
```
test-results-{testType}-{modelName}-{descriptor}-run{N}-{timestamp}.json

Examples:
- test-results-multitier-phi3-split-25-run1-2026-03-26T153232299Z.json
- test-results-multitier-smollm3-split-25-run2-2026-03-26T154333186Z.json
- test-results-multitier-mistral-split-25-run1-2026-03-26T153734424Z.json
```

### Test Result Structure

Each test result file contains an array of test executions:

```json
{
  "results": [
    {
      "metadata": {
        "timestamp": "2026-03-26T15:29:34.738Z",
        "testRunId": "test-run-1-phi3",
        "runNumber": 1                           // Matches rating.runNumber
      },
      "input": {
        "promptId": "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",  // Matches rating.promptId
        "fullPromptText": "[TIER 1]... [complete prompt]",
        "fullPromptTokens": 2300
      },
      "output": {
        "response": "Understood! Let's begin...",  // THIS is what was rated
        "responseTokens": 257,
        "completionFinishReason": "length"
      },
      "timing": {
        "totalMs": 5056,
        "tokensPerSecond": 57.11
      }
    }
  ]
}
```

**Key fields for linking:**
- `metadata.runNumber` → `rating.runNumber`
- `input.promptId` → `rating.promptId`
- Model name is in filename → `rating.modelName`
- `output.response` → The text that was rated

### Finding the Response for a Rating

**Step-by-step process:**

1. **Identify the test result file**
   ```javascript
   const date = "2026-03-26"; // From rating.timestamp or evaluationDate
   const filename = `test-results-multitier-${rating.modelName}-split-25-run${rating.runNumber}-*.json`;
   const filePath = `reports/performance/${date}/${filename}`;
   ```

2. **Load the test results**
   ```javascript
   const testResults = await fetch(filePath).then(r => r.json());
   ```

3. **Find the matching result**
   ```javascript
   const result = testResults.results.find(r =>
     r.input.promptId === rating.promptId &&
     r.metadata.runNumber === rating.runNumber
   );
   ```

4. **Access the rated response**
   ```javascript
   const ratedText = result.output.response;
   const ratedExplanation = rating.explanation;
   ```

### Complete Integration Example

```javascript
/**
 * Load a rating and its corresponding test result response
 */
async function loadRatingWithResponse(rating, date = "2026-03-26") {
  // 1. Construct test result file path
  const pattern = `test-results-multitier-${rating.modelName}-split-25-run${rating.runNumber}`;

  // 2. Find matching file (may need glob if timestamp unknown)
  const directory = `reports/performance/${date}`;
  const files = await fetchDirectoryListing(directory);
  const matchingFile = files.find(f => f.startsWith(pattern));

  if (!matchingFile) {
    throw new Error(`No test results found for ${rating.modelName} run ${rating.runNumber}`);
  }

  // 3. Load test results
  const testResults = await fetch(`${directory}/${matchingFile}`).then(r => r.json());

  // 4. Find specific result for this prompt
  const result = testResults.results.find(r =>
    r.input.promptId === rating.promptId &&
    r.metadata.runNumber === rating.runNumber
  );

  if (!result) {
    throw new Error(`No result found for promptId: ${rating.promptId}`);
  }

  // 5. Return combined object
  return {
    // Rating information
    rating: rating.rating,
    explanation: rating.explanation,
    flags: rating.flags,
    ratedAt: rating.timestamp,

    // Test result information
    prompt: result.input.fullPromptText,
    response: result.output.response,
    promptTokens: result.input.fullPromptTokens,
    responseTokens: result.output.responseTokens,
    tokensPerSecond: result.timing.tokensPerSecond,
    totalMs: result.timing.totalMs,

    // Metadata
    promptId: rating.promptId,
    modelName: rating.modelName,
    runNumber: rating.runNumber
  };
}

/**
 * Batch load all ratings with their responses
 */
async function loadAllRatingsWithResponses(ratingsFile, date = "2026-03-26") {
  const combined = [];

  for (const rating of ratingsFile.ratings) {
    try {
      const withResponse = await loadRatingWithResponse(rating, date);
      combined.push(withResponse);
    } catch (error) {
      console.error(`Failed to load response for ${rating.promptId}:`, error);
    }
  }

  return combined;
}
```

### Viewer Implementation - Active Linkage in Production

**File:** `viewer/response-viewer.html` (1,597 lines)

The response viewer is a **working, production implementation** of the rating-response linkage. It actively uses the three-key pattern to display ratings alongside responses.

#### How the Viewer Works

**Step 1: Load Test Result Files** (lines 1003-1033)

```javascript
function mergeLoadedFiles(loadedFiles) {
    const byPrompt = {};

    // For each loaded test result file
    loadedFiles.forEach(({ path, data }) => {
        // Extract model name from filename
        // "test-results-multitier-{model}-split-25-run{N}-*.json"
        const modelMatch = path.match(/multitier-(\w+)-/);
        const model = modelMatch ? modelMatch[1] : 'unknown';

        // Extract run number from filename
        // "run{N}"
        const runMatch = path.match(/run(\d)/);
        const run = runMatch ? parseInt(runMatch[1]) : 1;

        // Process results array
        const results = data.results || [];
        results.forEach((result) => {
            const id = result.input.promptId;  // ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1

            if (!byPrompt[id]) {
                byPrompt[id] = {
                    promptId: id,
                    run: run,
                    responses: {}
                };
            }

            // Store response keyed by model
            byPrompt[id].responses[model] = result;
        });
    });

    return Object.values(byPrompt);
}
```

**Key insight:** The viewer extracts `model` and `run` from the **filename**, not from the data. This is crucial for proper linkage.

---

**Step 2: Load Rating Files**

```javascript
async function loadRatingFile(filePath, event) {
    const response = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
    const { data: fileData } = await response.json();

    // Handle both { ratings: [...] } and direct array format
    const ratingsArray = fileData.ratings || (Array.isArray(fileData) ? fileData : []);

    // Create lookup key for each rating
    ratingsArray.forEach(rating => {
        // Key: promptId_modelName_run{N}
        const key = `${rating.promptId}_${rating.modelName}_run${rating.runNumber}`;
        ratings[key] = rating;
    });

    console.log(`✅ Loaded ${ratingsArray.length} ratings`);
}
```

---

**Step 3: Join and Display** (lines 1165-1215)

```javascript
function renderResponses(promptData) {
    const models = Object.keys(promptData.responses);

    for (const model of models) {
        const response = promptData.responses[model];

        // PERFORM THE JOIN using three-key pattern
        const currentRating = ratings[`${promptData.promptId}_${model}_run${promptData.run}`] || {};

        // Display response with rating UI
        html += `
            <div class="response-card">
                <div class="response-header">${model.toUpperCase()}</div>

                <!-- Show response metrics -->
                <div class="response-metrics">
                    <span>${response.output.responseTokens} tokens</span>
                    <span>${response.timing.tokensPerSecond.toFixed(1)} tok/s</span>
                </div>

                <!-- Show response text -->
                <div class="response-content">
                    ${response.output.response}
                </div>

                <!-- Show rating UI pre-populated with any existing rating -->
                <div class="rating-section">
                    <h4>Your Rating:</h4>
                    <div class="rating-buttons">
                        <button class="rating-btn ${currentRating.rating === 5 ? 'selected' : ''}"
                                onclick="setRating('${promptData.promptId}', '${model}', ${promptData.run}, 5)">
                            5 Excellent
                        </button>
                        <!-- ... more buttons ... -->
                    </div>

                    <!-- Pre-populate explanation textarea -->
                    <textarea class="rating-explanation"
                              placeholder="Explain your rating...">
                        ${currentRating.explanation || ''}
                    </textarea>

                    <!-- Save button shows status -->
                    <button class="save-rating-btn ${currentRating.rating !== undefined ? 'saved' : ''}"
                            onclick="saveRating('${promptData.promptId}', '${model}', ${promptData.run})">
                        ${currentRating.rating !== undefined ? '✓ Saved' : 'Save Rating'}
                    </button>
                </div>
            </div>
        `;
    }
}
```

---

#### What the Viewer Displays

When you load test results and ratings:

| Element | Source |
|---------|--------|
| **Prompt text** | `result.input.fullPromptText` |
| **Response text** | `result.output.response` (THIS is what was rated) |
| **Performance metrics** | `result.timing.tokensPerSecond`, `totalMs` |
| **Rating score** | `currentRating.rating` (1-5) |
| **Rating explanation** | `currentRating.explanation` (detailed feedback) |
| **Quality flags** | `currentRating.flags` (hallucination, context usage, etc.) |
| **Save status** | Visual indicator if rating was already saved |

---

#### User Workflow

1. **Browse and select test result files** (e.g., `test-results-multitier-phi3-split-25-run1-*.json`)
2. **Browse and select rating files** (e.g., `claude-all-150-ratings.json`)
3. **View merged results** - One prompt at a time, all models side-by-side
4. **See pre-populated ratings** - If rating exists for this (promptId, model, run), it displays
5. **Edit ratings** - Can modify scores and explanations
6. **Save new ratings** - Stored in local ratings object
7. **Export ratings** - Download as JSON or CSV for external analysis

---

#### Key Implementation Details

**Filename Parsing for Linkage** (Critical for correctness)

```javascript
// Test result file naming: test-results-multitier-{model}-split-25-run{N}-{timestamp}.json
const modelMatch = path.match(/multitier-(\w+)-/);       // Extracts: phi3, mistral, smollm3
const runMatch = path.match(/run(\d)/);                   // Extracts: 1, 2

// These MUST match:
// - rating.modelName must equal extracted model
// - rating.runNumber must equal extracted run number
```

**Rating Key Format** (Must be consistent)

```javascript
// Format: "{promptId}_{modelName}_run{runNumber}"
const key = `${promptData.promptId}_${model}_run${promptData.run}`;

// Example:
// "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1_phi3_run1"

ratings[key] = rating;  // Store/retrieve using this key
```

**Default Fallback** (Handles missing ratings gracefully)

```javascript
// If no rating exists, use empty object (prevents errors)
const currentRating = ratings[key] || {};

// UI handles empty gracefully:
currentRating.rating          // undefined if not rated
currentRating.explanation     // '' if not explained
currentRating.flags           // undefined if not flagged
```

---

#### Testing the Viewer

**To verify the linkage works:**

1. Open: http://127.0.0.1:7500/viewer/response-viewer.html
2. Load test results: Select files from `reports/performance/2026-03-26/`
3. Load ratings: Select `ratings/claude-all-150-ratings.json`
4. Navigate through prompts - Ratings should be pre-populated
5. Check browser console - Shows loaded count and any errors

**Expected output:**
```
✅ Loaded 25 results from test-results-multitier-phi3-split-25-run1-*.json
✅ Loaded 150 ratings from claude-all-150-ratings.json
```

---

#### Common Integration Points

**From Viewer to Schema:**
- When viewing a rating, the explanation references response quality across three dimensions:
  - `readability` - Is response well-structured?
  - `understandability` - Is it clear to the target audience?
  - `accuracy` - Is the information correct?

**From Schema to Viewer:**
- Ratings stored with `flags` object allows viewer to highlight specific issues:
  - `hallucination: true` → Show warning badge
  - `contextUsed: false` → Show "Ignored context" warning
  - `majorIssues: [...]` → Show critical issues list

---

#### Extending the Viewer

To add new features that depend on this linkage:

1. **Side-by-side model comparison** - Join responses on `promptId`, display all models
2. **Rating aggregate statistics** - Group ratings by `modelName`, calculate averages
3. **Prompt difficulty analysis** - Correlate ratings to prompt complexity
4. **Quality heat maps** - Visualize ratings across prompts and models

All these require the documented linkage to work correctly.

### Data Integrity Checks

**Before integration, validate:**

1. ✅ **All ratings have matching results**
   ```javascript
   const orphanedRatings = ratings.filter(rating =>
     !testResults.some(r =>
       r.input.promptId === rating.promptId &&
       r.metadata.runNumber === rating.runNumber
     )
   );

   if (orphanedRatings.length > 0) {
     console.warn(`${orphanedRatings.length} ratings have no matching results`);
   }
   ```

2. ✅ **All results have ratings** (if expected)
   ```javascript
   const unratedResults = testResults.filter(result =>
     !ratings.some(r =>
       r.promptId === result.input.promptId &&
       r.runNumber === result.metadata.runNumber
     )
   );

   if (unratedResults.length > 0) {
     console.warn(`${unratedResults.length} results not yet rated`);
   }
   ```

3. ✅ **Timestamps align** (ratings after test execution)
   ```javascript
   const invalidTimestamps = ratings.filter(rating => {
     const result = findMatchingResult(rating);
     return new Date(rating.timestamp) < new Date(result.metadata.timestamp);
   });

   if (invalidTimestamps.length > 0) {
     console.error('Some ratings predate their test results!');
   }
   ```

### Common Linkage Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Rating with no result | Test result file missing or moved | Check file exists in expected location |
| Result with no rating | Rating not yet created | Normal - ratings created after tests |
| Wrong response loaded | `runNumber` mismatch | Ensure `runNumber` used consistently |
| Multiple matches found | Duplicate test executions | Filter by timestamp to get latest |
| Model name mismatch | Inconsistent casing (Phi3 vs phi3) | Normalize to lowercase |

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

### 1.2.0 (2026-03-27)
- Added comprehensive "Viewer Implementation - Active Linkage in Production" section
- Documented actual working implementation in response-viewer.html
- Showed step-by-step how viewer loads test results and ratings
- Explained filename parsing for extracting model and run number
- Documented rating key format and join mechanism
- Added user workflow and testing instructions
- Documented extension points for future features
- 245 lines of viewer implementation documentation

### 1.1.0 (2026-03-27)
- Added comprehensive "Linking Ratings to Test Results" section
- Documented test result file structure and location
- Provided complete integration examples with code
- Added data integrity validation checks
- Documented common linkage issues and solutions
- Clarified the three-key join pattern (promptId, modelName, runNumber)

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
