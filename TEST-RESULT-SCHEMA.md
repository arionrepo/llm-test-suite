# Unified Test Result Schema

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/TEST-RESULT-SCHEMA.md
**Description:** Complete, unified schema for ALL test results - ensures consistency and comprehensive data capture
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-26
**Status:** ARCHITECTURAL DESIGN - ALL test runners MUST follow this schema

---

## Philosophy

**EVERY test execution, regardless of focus (performance/accuracy/quality), MUST capture:**

1. **WHAT WAS SENT** - Complete input with all context
2. **WHAT WAS RECEIVED** - Complete output response
3. **HOW IT PERFORMED** - All measurable timing/throughput metrics
4. **HOW IT PERFORMED QUALITATIVELY** - All measurable quality metrics
5. **WHERE IT WAS RUN** - Environment, models, configuration
6. **WHEN IT WAS RUN** - Timestamps, run metadata

Different test runs can **focus analysis** on different aspects, but the underlying data ALWAYS contains everything.

---

## Core Schema Structure

```javascript
{
  // ========== METADATA ==========
  "metadata": {
    "timestamp": "2026-03-26T10:30:45.123Z",
    "testRunId": "test-run-6-multitier-2026-03-26-103045",
    "runNumber": 6,
    "runName": "MULTITIER",
    "runType": "performance|accuracy|compliance|quality|custom",
    "focus": "throughput",  // What this test run emphasizes
    "environment": {
      "machine": "M4 Max (64GB RAM)",
      "platform": "macOS 14.6",
      "llamacppManager": "v1.0.0"
    }
  },

  // ========== COMPLETE INPUT ==========
  "input": {
    "promptId": "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",
    "promptName": "GDPR Assessment - Healthcare Startup",

    "tier1SystemPrompt": "You are ArionComply AI, an expert compliance advisor...",
    "tier1TokenCount": 1875,

    "tier2ContextPrompt": "Assessment Mode Active: You are guiding the user...",
    "tier2TokenCount": 400,

    "tier3OrgContext": "Organization: Healthcare Startup | Industry: Healthcare...",
    "tier3TokenCount": 300,

    "userMessage": "I want to assess my GDPR compliance",
    "userMessageTokens": 10,

    "fullPromptText": "[TIER 1]...full text concatenation...",
    "fullPromptTokens": 2585,
    "fullPromptCharacters": 18934,

    "metadata": {
      "standard": "GDPR",
      "framework": "GDPR",
      "persona": "NOVICE",
      "knowledgeType": "PROCEDURAL",
      "industryContext": "Healthcare",
      "orgSize": "1-50",
      "region": "EU",
      "maturityLevel": "Initial"
    }
  },

  // ========== MODEL CONFIGURATION ==========
  "modelConfig": {
    "modelName": "phi3",
    "modelSize": "3.8B",
    "modelPath": "/path/to/model.gguf",
    "quantization": "Q4_K_M",
    "parameters": {
      "temperature": 0.3,
      "topP": 0.95,
      "maxTokens": 500,
      "repeatPenalty": 1.1,
      "topK": 40,
      "minP": 0.05
    },
    "engineSettings": {
      "threads": 8,
      "gpuLayers": 35,
      "contextSize": 2048
    }
  },

  // ========== COMPLETE OUTPUT ==========
  "output": {
    "response": "The General Data Protection Regulation (GDPR) is a comprehensive framework...",
    "responseTokens": 187,
    "responseCharacters": 2156,
    "completionFinishReason": "length|stop|stop_sequence",
    "truncated": false
  },

  // ========== TIMING & PERFORMANCE METRICS ==========
  "timing": {
    "totalMs": 5234,
    "promptProcessingMs": 423,
    "generationMs": 4811,
    "firstTokenMs": 450,
    "tokensPerSecond": 38.87,
    "inputTokensPerSecond": 6094,
    "outputTokensPerSecond": 38.87,
    "timePerToken": 25.7
  },

  // ========== RESOURCE METRICS ==========
  "resources": {
    "processId": 12345,
    "modelPort": 8081,
    "cpuUsagePercent": 82.5,
    "memoryUsedMb": 4821,
    "memoryPeakMb": 5234,
    "gpuMemoryUsedMb": 3890,
    "gpuMemoryAvailableMb": 12288,
    "gpuUtilizationPercent": 94
  },

  // ========== QUALITY EVALUATION METRICS ==========
  "quality": {
    "relevanceScore": 0.92,
    "completenessScore": 0.85,
    "accuracyScore": 0.88,
    "coherenceScore": 0.95,
    "overallScore": 0.90,

    "topicAnalysis": {
      "expectedTopics": ["regulation", "privacy", "EU", "data protection"],
      "foundTopics": ["regulation", "privacy", "EU", "data protection"],
      "missingTopics": [],
      "extraneousTopics": [],
      "topicCoverage": 1.0
    },

    "contentAnalysis": {
      "sentenceCount": 8,
      "wordCount": 456,
      "averageSentenceLength": 57,
      "readabilityScore": 0.78,
      "technicalDensity": 0.45,
      "jargonDetected": ["GDPR", "regulation", "compliance", "data protection"]
    },

    "complianceAnalysis": {
      "citesApplicableArticles": true,
      "articlesCited": ["Art. 1", "Art. 4", "Art. 6"],
      "completenessByStandard": {
        "GDPR": {
          "expectedControls": 12,
          "coveredControls": 11,
          "coveragePercent": 92
        }
      }
    },

    "evaluationMethod": "llm|heuristic|hybrid",
    "evaluationTimestamp": "2026-03-26T10:30:50.456Z"
  },

  // ========== EXECUTION STATUS & VALIDATION ==========
  "execution": {
    "success": true,
    "startTime": "2026-03-26T10:30:45.123Z",
    "endTime": "2026-03-26T10:30:50.357Z",
    "durationMs": 5234,

    "modelStartVerified": true,
    "modelStopVerified": true,
    "responseValidated": true,

    "errors": [],
    "warnings": [],

    "validationChecks": {
      "responseNotEmpty": true,
      "responseWithinTokenLimit": true,
      "allTiersIncludedInPrompt": true,
      "modelResponded": true,
      "noConnectionErrors": true,
      "noTimeouts": true
    }
  },

  // ========== COMPARISON & HISTORY ==========
  "comparison": {
    "previousRunId": "test-run-5-verylong-2026-03-25-180000",
    "changeFromPrevious": {
      "tokensPerSecond": {
        "previous": 35.2,
        "current": 38.87,
        "changePercent": 10.4,
        "trend": "up"
      },
      "qualityScore": {
        "previous": 0.87,
        "current": 0.90,
        "changePercent": 3.4,
        "trend": "up"
      }
    }
  }
}
```

---

## Mandatory Fields (ALWAYS Required)

**These fields MUST be present in every test result, no exceptions:**

```javascript
{
  "metadata": {
    "timestamp": "required",
    "testRunId": "required",
    "runNumber": "required"
  },
  "input": {
    "promptId": "required",
    "fullPromptText": "required - COMPLETE prompt, all tiers",
    "fullPromptTokens": "required"
  },
  "output": {
    "response": "required - COMPLETE response text",
    "responseTokens": "required"
  },
  "timing": {
    "totalMs": "required",
    "tokensPerSecond": "required"
  },
  "execution": {
    "success": "required",
    "responseValidated": "required"
  }
}
```

---

## Optional Fields (Context-Dependent)

These are included when applicable:

- **Quality metrics** - include when evaluating accuracy/relevance
- **Resource metrics** - include when measuring system impact
- **Compliance analysis** - include when testing compliance standards
- **Topic analysis** - include when evaluating knowledge coverage
- **Comparison data** - include when trending over time

---

## File Format & Storage

**All test results MUST be stored as:**

```
reports/{test-type}/{YYYY-MM-DD}/test-results-{run-name}-{timestamp}.json
```

**Examples:**
```
reports/performance/2026-03-26/test-results-multitier-2026-03-26T103045Z.json
reports/accuracy/2026-03-26/test-results-compliance-2026-03-26T140230Z.json
reports/quality/2026-03-26/test-results-enterprise-2026-03-26T160145Z.json
```

---

## Validation & Enforcement

**Every test result file MUST pass validation:**

```javascript
function validateTestResult(result) {
  const mandatoryFields = [
    'metadata.timestamp',
    'input.promptId',
    'input.fullPromptText',
    'output.response',
    'timing.totalMs',
    'execution.success'
  ];

  for (const field of mandatoryFields) {
    if (!getNestedValue(result, field)) {
      throw new Error(`VALIDATION FAILED: Missing mandatory field "${field}"`);
    }
  }

  if (!result.output.response || result.output.response.trim() === '') {
    throw new Error(`VALIDATION FAILED: Response is empty`);
  }

  if (!result.input.fullPromptText || result.input.fullPromptText.trim() === '') {
    throw new Error(`VALIDATION FAILED: Full prompt text is empty`);
  }

  return { valid: true };
}
```

---

## Query Interface

The unified schema enables powerful queries:

```javascript
// Get all GDPR compliance tests for phi3
SELECT * FROM test_results
WHERE input.metadata.standard = 'GDPR'
AND modelConfig.modelName = 'phi3'

// Get trends in tokens/second over time
SELECT metadata.timestamp, timing.tokensPerSecond
FROM test_results
WHERE metadata.runNumber = 6
ORDER BY metadata.timestamp

// Get all failed quality evaluations
SELECT * FROM test_results
WHERE quality.overallScore < 0.75
OR execution.success = false

// Compare model performance across all metrics
SELECT
  modelConfig.modelName,
  AVG(timing.tokensPerSecond) as avg_speed,
  AVG(quality.overallScore) as avg_quality,
  COUNT(*) as test_count
FROM test_results
GROUP BY modelConfig.modelName
```

---

## Migration Path

**For existing test runners:**

1. Update to capture all input (with tier breakdown)
2. Update to capture complete response text
3. Update to include quality evaluation if applicable
4. Validate against schema before writing to disk
5. Write to new file structure with timestamps

**Deprecated formats (to phase out):**
- ~~performance-run-*.json~~ → Use unified schema
- ~~test-results-enterprise-comprehensive-*.json~~ → Use unified schema
- ~~performance-aggregate.json~~ → Generate from unified results via query

---

## Benefits of This Design

✅ **Completeness** - All data always available
✅ **Consistency** - Same structure across all test types
✅ **Queryability** - Can analyze any aspect independently
✅ **Auditability** - Complete record of what was tested and results
✅ **Extensibility** - Can add new metrics without breaking existing queries
✅ **Traceability** - Always know exactly what was sent and received
✅ **Reproducibility** - Can re-test with exact same inputs/parameters

---

**Contact:** libor@arionetworks.com
