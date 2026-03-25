# LLM Test Suite Enhancement Plan

**File:** `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/ENHANCEMENT-PLAN.md`
**Description:** Comprehensive specification for transforming the test suite into a production-grade, configurable benchmarking platform
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-25
**Version:** 1.0.0

---

## Executive Summary

### Vision
Transform the LLM test suite from a compliance-focused diagnostic tool into a **configurable, multi-dimensional benchmarking platform** that enables enterprises to make data-driven decisions about local and cloud LLM deployments.

### Goals
1. **Measure all decision-relevant dimensions**: Quality, cost, speed, privacy/locality
2. **Support all model types**: Local (llamacpp) and cloud (Claude, GPT-4, Gemini)
3. **Multi-layer evaluation**: Keyword matching → ground truth → LLM-as-judge → human review
4. **Actionable outputs**: Decision matrices, cost/quality charts, detailed JSON, executive summaries
5. **Configurable testing**: Pre-configured profiles for different user goals
6. **Verifiable results**: Statistical rigor, reproducibility, transparency

### Current State
✅ **Strengths**:
- Solid 2D complexity model (input vs output)
- Comprehensive compliance test coverage (123+ scenarios)
- Well-documented, agent-ready execution
- Working llamacpp-manager integration

❌ **Critical Gaps**:
- No cost tracking (can't make cost/benefit decisions)
- Evaluation relies on keyword matching (unreliable quality assessment)
- No cloud model support (can't compare local vs cloud)
- No statistical rigor (single runs, no variance analysis)
- Limited output formats (JSON only, no decision guidance)

### Enhancement Scope
This plan specifies **~23 file changes** (15 new files, 8 modifications) across **4 implementation phases**:
- **Phase 1**: Core Infrastructure (evaluation + cost tracking)
- **Phase 2**: Cloud Integration & Statistics
- **Phase 3**: Output Formats & Decision Engine
- **Phase 4**: Automation & Self-Improvement

---

## Proposed Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    LLM Test Suite Platform                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐     ┌──────────────────────────────────┐
│   Test Orchestrator  │────▶│    Model Registry & Config       │
│  (orchestrator.js)   │     │  (config/model-registry.json)    │
└──────────────────────┘     └──────────────────────────────────┘
         │
         ├──────────────────────────────────────────────────────┐
         │                                                        │
         ▼                                                        ▼
┌──────────────────────┐                            ┌──────────────────────┐
│   Local Model Client │                            │  Cloud Model Client  │
│ (llamacpp-manager)   │                            │ (cloud-client.js)    │
└──────────────────────┘                            └──────────────────────┘
         │                                                        │
         └────────────────┬───────────────────────────────────────┘
                          │
                          ▼
                  ┌───────────────────┐
                  │   Test Executor   │
                  │  (test-runner.js) │
                  └───────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│ Token Counter & │ │   Response      │ │  Performance     │
│  Cost Tracker   │ │   Capture       │ │   Metrics        │
│  (cost-calc.js) │ │                 │ │  (timing, etc)   │
└─────────────────┘ └─────────────────┘ └──────────────────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
                          ▼
              ┌───────────────────────────┐
              │  Evaluation Orchestrator  │
              │  (evaluation-orch.js)     │
              └───────────────────────────┘
                          │
         ┌────────────────┼────────────────┬──────────────────┐
         │                │                │                  │
         ▼                ▼                ▼                  ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
│ Keyword Matcher │ │   Ground    │ │ LLM Judge   │ │   Human      │
│  (improved)     │ │   Truth     │ │ (Claude/    │ │   Review     │
│  Fast, cheap    │ │  Validator  │ │  GPT-4)     │ │   (sample)   │
│  Initial filter │ │  Factual    │ │  Semantic   │ │  Validation  │
└─────────────────┘ └─────────────┘ └─────────────┘ └──────────────┘
         │                │                │                  │
         └────────────────┼────────────────┴──────────────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │  Statistical        │
                │  Analyzer           │
                │  (stats-analyzer.js)│
                │  - Variance         │
                │  - Confidence       │
                │  - Significance     │
                └─────────────────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │  Result Aggregator  │
                │  (aggregator.js)    │
                └─────────────────────┘
                          │
         ┌────────────────┼────────────────┬──────────────────┐
         │                │                │                  │
         ▼                ▼                ▼                  ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
│ Decision Matrix │ │ Cost/Quality│ │   Detailed  │ │  Executive   │
│  Generator      │ │   Charts    │ │     JSON    │ │   Summary    │
│  "Use X for Y"  │ │  Visualize  │ │  Raw data   │ │  High-level  │
└─────────────────┘ └─────────────┘ └─────────────┘ └──────────────┘
```

### Key Architectural Principles

1. **Evaluation Pipeline**: Multi-stage funnel (fast → accurate → human-verified)
2. **Model Agnostic**: Abstract interface supports local + cloud seamlessly
3. **Configurable**: Test profiles define what to measure and how
4. **Reproducible**: All inputs/outputs versioned and logged
5. **Modular**: Components can be used independently

---

## Detailed Enhancement Specifications

### Enhancement Group 1: Cost Tracking & Economics

#### E1.1: Cost Calculator Utility

**File**: `utils/cost-calculator.js` (NEW - 350 lines estimated)

**Purpose**: Calculate token costs for all model types (local and cloud)

**Implementation**:
```javascript
/**
 * Cost Calculator for LLM Test Suite
 * Calculates costs for both local and cloud models
 */

export class CostCalculator {
  constructor(pricingConfig) {
    // Load pricing from config/pricing.json
    this.localModelCosts = pricingConfig.local;  // Power consumption, amortization
    this.cloudModelCosts = pricingConfig.cloud;  // Per-token pricing
  }

  /**
   * Calculate cost for a single query
   * @param {Object} result - Test result with token counts
   * @param {string} modelType - 'local' or 'cloud'
   * @param {string} modelName - Specific model identifier
   * @returns {Object} Cost breakdown
   */
  calculateQueryCost(result, modelType, modelName) {
    if (modelType === 'local') {
      return this.calculateLocalCost(result, modelName);
    } else {
      return this.calculateCloudCost(result, modelName);
    }
  }

  calculateLocalCost(result, modelName) {
    const modelInfo = this.localModelCosts[modelName];

    // Cost factors for local models:
    // 1. Power consumption (GPU/CPU watts × time)
    // 2. Hardware amortization ($/hour based on HW cost)
    // 3. Memory (RAM usage cost)

    const powerCostPerSec = modelInfo.watts * modelInfo.electricityRate / 3600;
    const hardwareCostPerSec = modelInfo.hardwareAmortization / 3600;
    const totalTimeSeconds = result.timing.totalTime / 1000;

    return {
      powerCost: powerCostPerSec * totalTimeSeconds,
      hardwareCost: hardwareCostPerSec * totalTimeSeconds,
      totalCost: (powerCostPerSec + hardwareCostPerSec) * totalTimeSeconds,
      costPerToken: this.calculateCostPerToken(result, totalTimeSeconds),
      breakdown: {
        watts: modelInfo.watts,
        electricityRate: modelInfo.electricityRate,
        hardwareAmortization: modelInfo.hardwareAmortization,
        duration: totalTimeSeconds
      }
    };
  }

  calculateCloudCost(result, modelName) {
    const pricing = this.cloudModelCosts[modelName];

    const inputCost = (result.timing.promptTokens / 1000000) * pricing.inputPer1M;
    const outputCost = (result.timing.completionTokens / 1000000) * pricing.outputPer1M;

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      costPerToken: (inputCost + outputCost) /
                    (result.timing.promptTokens + result.timing.completionTokens),
      breakdown: {
        inputTokens: result.timing.promptTokens,
        outputTokens: result.timing.completionTokens,
        inputPricePer1M: pricing.inputPer1M,
        outputPricePer1M: pricing.outputPer1M
      }
    };
  }

  /**
   * Calculate throughput cost (cost per hour at given tok/s)
   */
  calculateThroughputCost(tokensPerSec, modelType, modelName, avgQueryTokens) {
    const queriesPerHour = (tokensPerSec / avgQueryTokens) * 3600;
    const costPerQuery = this.calculateQueryCost(
      {timing: {promptTokens: avgQueryTokens * 0.3, completionTokens: avgQueryTokens * 0.7}},
      modelType,
      modelName
    ).totalCost;

    return {
      queriesPerHour,
      costPerHour: queriesPerHour * costPerQuery,
      costPerDay: queriesPerHour * costPerQuery * 24,
      costPerMonth: queriesPerHour * costPerQuery * 24 * 30
    };
  }

  /**
   * Compare costs across models
   */
  compareCosts(results) {
    return results.map(r => ({
      model: r.modelName,
      costPerQuery: r.economics.totalCost,
      qualityScore: r.evaluation.score,
      costEfficiency: r.evaluation.score / r.economics.totalCost, // Quality per dollar
      vsBaseline: {
        costDiff: r.economics.totalCost - results[0].economics.totalCost,
        qualityDiff: r.evaluation.score - results[0].evaluation.score
      }
    })).sort((a, b) => b.costEfficiency - a.costEfficiency);
  }
}
```

**Direct Impact**:
- Enables cost/benefit analysis for every test result
- Allows filtering models by cost constraints ("show models under $0.01/query")
- Enables ROI calculations for switching models

**Indirect Impact**:
- Drives decision engine recommendations (Phase 3)
- Enables cost/quality frontier visualization (Phase 3)
- Justifies local vs cloud deployment decisions
- Supports enterprise budget planning

**Dependencies**: Requires `config/pricing.json` (E1.2)

**Testing**:
```bash
# Unit test
npm test utils/cost-calculator.test.js

# Verify costs match known pricing
# Local: ~$0.001-0.005 per query (electricity + amortization)
# Cloud: $0.01-0.10 per query (Claude/GPT-4)
```

---

#### E1.2: Pricing Configuration

**File**: `config/pricing.json` (NEW - 150 lines)

**Purpose**: Centralized pricing database for all model types

**Implementation**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-03-25",
  "local": {
    "hermes-3-llama-8b": {
      "watts": 50,
      "electricityRate": 0.15,
      "hardwareAmortization": 2.50,
      "notes": "M3 Max, 8B model, ~50W GPU load",
      "estimatedCostPerQuery": 0.002
    },
    "llama-4-scout-17b": {
      "watts": 80,
      "electricityRate": 0.15,
      "hardwareAmortization": 2.50,
      "notes": "M3 Max, 17B model, ~80W GPU load",
      "estimatedCostPerQuery": 0.003
    },
    "deepseek-r1-qwen-32b": {
      "watts": 120,
      "electricityRate": 0.15,
      "hardwareAmortization": 2.50,
      "notes": "M3 Max, 32B model, full GPU load",
      "estimatedCostPerQuery": 0.005
    }
  },
  "cloud": {
    "claude-sonnet-4": {
      "provider": "Anthropic",
      "inputPer1M": 3.00,
      "outputPer1M": 15.00,
      "notes": "Claude Sonnet 4.0 pricing as of 2026-03",
      "estimatedCostPerQuery": 0.015
    },
    "claude-opus-4": {
      "provider": "Anthropic",
      "inputPer1M": 15.00,
      "outputPer1M": 75.00,
      "notes": "Claude Opus 4.0 pricing",
      "estimatedCostPerQuery": 0.070
    },
    "gpt-4-turbo": {
      "provider": "OpenAI",
      "inputPer1M": 10.00,
      "outputPer1M": 30.00,
      "notes": "GPT-4 Turbo pricing",
      "estimatedCostPerQuery": 0.025
    },
    "gpt-4o": {
      "provider": "OpenAI",
      "inputPer1M": 5.00,
      "outputPer1M": 15.00,
      "notes": "GPT-4o pricing",
      "estimatedCostPerQuery": 0.012
    },
    "gemini-1.5-pro": {
      "provider": "Google",
      "inputPer1M": 7.00,
      "outputPer1M": 21.00,
      "notes": "Gemini 1.5 Pro pricing",
      "estimatedCostPerQuery": 0.018
    }
  },
  "assumptions": {
    "electricityRate": "$0.15/kWh (US average)",
    "hardwareAmortization": "$2.50/hour (M3 Max MacBook Pro $4000 / 3 years / 16h daily use)",
    "avgQueryTokens": 500,
    "inputOutputRatio": "30% input, 70% output"
  }
}
```

**Direct Impact**:
- Single source of truth for all pricing
- Easy to update when providers change pricing
- Documents assumptions for transparency

**Indirect Impact**:
- Cost comparisons remain accurate over time
- Users can customize for their electricity rates/hardware
- Supports "what-if" scenario planning

---

#### E1.3: Integrate Cost Tracking into Test Runner

**File**: `enterprise-test-runner.js` (MODIFY - add ~50 lines)

**Changes**:
```javascript
// Add import at top
import { CostCalculator } from './utils/cost-calculator.js';
import pricingConfig from './config/pricing.json' assert { type: 'json' };

// In constructor
constructor(testProfile, models, options = {}) {
  // ... existing code ...
  this.costCalculator = new CostCalculator(pricingConfig);
}

// In runTest method - add after getting result
async runTest(test, modelName) {
  const result = await this.executeTest(test, modelName);

  // ADD: Calculate economics
  const modelType = this.isCloudModel(modelName) ? 'cloud' : 'local';
  result.economics = this.costCalculator.calculateQueryCost(
    result,
    modelType,
    modelName
  );

  // ADD: Throughput cost
  if (result.timing && result.timing.tokensPerSec) {
    result.economics.throughput = this.costCalculator.calculateThroughputCost(
      result.timing.tokensPerSec,
      modelType,
      modelName,
      result.timing.promptTokens + result.timing.completionTokens
    );
  }

  return result;
}

// ADD helper method
isCloudModel(modelName) {
  return ['claude', 'gpt', 'gemini'].some(prefix =>
    modelName.toLowerCase().includes(prefix)
  );
}

// In generateReport method - add cost summary
generateReport(allResults) {
  const report = {
    // ... existing fields ...

    // ADD: Economics summary
    economics: {
      totalCost: allResults.reduce((sum, r) => sum + r.economics.totalCost, 0),
      avgCostPerQuery: this.calculateAverage(allResults.map(r => r.economics.totalCost)),
      costByModel: this.groupByModel(allResults).map(group => ({
        model: group.model,
        totalCost: group.results.reduce((sum, r) => sum + r.economics.totalCost, 0),
        avgCost: this.calculateAverage(group.results.map(r => r.economics.totalCost)),
        costEfficiency: this.calculateAverage(group.results.map(r =>
          r.evaluation.score / r.economics.totalCost
        ))
      })),
      costComparison: this.costCalculator.compareCosts(allResults)
    }
  };

  return report;
}
```

**Direct Impact**:
- Every test result now includes cost data
- Reports show total testing cost
- Cost efficiency (quality/$) calculated automatically

**Indirect Impact**:
- Decision engine can filter by cost (Phase 3)
- Cost trends can be tracked over time
- Budget impact of model changes becomes visible

---

### Enhancement Group 2: Multi-Layer Evaluation System

#### E2.1: Evaluation Orchestrator

**File**: `utils/evaluation-orchestrator.js` (NEW - 500 lines)

**Purpose**: Coordinate multi-stage evaluation pipeline (keyword → ground truth → LLM judge → human)

**Implementation**:
```javascript
/**
 * Evaluation Orchestrator
 * Manages multi-layer evaluation pipeline with configurable stages
 */

import { ImprovedKeywordMatcher } from './improved-keyword-matcher.js';
import { GroundTruthValidator } from './ground-truth-validator.js';
import { CloudLLMJudge } from './cloud-llm-judge.js';
import evaluationConfig from '../config/evaluation-config.json' assert { type: 'json' };

export class EvaluationOrchestrator {
  constructor(config = evaluationConfig) {
    this.config = config;
    this.keywordMatcher = new ImprovedKeywordMatcher();
    this.groundTruthValidator = new GroundTruthValidator();
    this.llmJudge = new CloudLLMJudge();

    // Statistics
    this.stats = {
      evaluated: 0,
      byStage: {
        keyword: 0,
        groundTruth: 0,
        llmJudge: 0,
        human: 0
      },
      costs: {
        llmJudge: 0
      }
    };
  }

  /**
   * Evaluate a test result through the pipeline
   * @param {Object} test - Test definition
   * @param {Object} result - Model response
   * @returns {Object} Comprehensive evaluation
   */
  async evaluate(test, result) {
    const evaluation = {
      stages: [],
      finalScore: 0,
      finalVerdict: 'pending',
      confidence: 0,
      reasoning: [],
      needsHumanReview: false
    };

    // Stage 1: Keyword Matching (ALWAYS run - fast and cheap)
    if (this.config.stages.keyword.enabled) {
      const keywordResult = await this.runKeywordStage(test, result);
      evaluation.stages.push(keywordResult);
      this.stats.byStage.keyword++;

      // Early exit if clearly failing
      if (keywordResult.score < this.config.stages.keyword.failThreshold) {
        evaluation.finalScore = keywordResult.score;
        evaluation.finalVerdict = 'fail';
        evaluation.confidence = keywordResult.confidence;
        evaluation.reasoning.push('Failed keyword matching - likely irrelevant response');
        return evaluation;
      }
    }

    // Stage 2: Ground Truth Validation (run if available for this test)
    if (this.config.stages.groundTruth.enabled && test.groundTruth) {
      const gtResult = await this.runGroundTruthStage(test, result);
      evaluation.stages.push(gtResult);
      this.stats.byStage.groundTruth++;

      // High confidence result - can skip LLM judge
      if (gtResult.confidence > this.config.stages.groundTruth.skipJudgeThreshold) {
        evaluation.finalScore = gtResult.score;
        evaluation.finalVerdict = gtResult.verdict;
        evaluation.confidence = gtResult.confidence;
        evaluation.reasoning.push('Ground truth validation provides high-confidence result');
        return evaluation;
      }
    }

    // Stage 3: LLM Judge (run for ambiguous cases or when ground truth unavailable)
    const shouldRunJudge = this.shouldRunLLMJudge(evaluation, test);
    if (this.config.stages.llmJudge.enabled && shouldRunJudge) {
      const judgeResult = await this.runLLMJudgeStage(test, result);
      evaluation.stages.push(judgeResult);
      this.stats.byStage.llmJudge++;
      this.stats.costs.llmJudge += judgeResult.cost;

      // LLM judge is authoritative unless low confidence
      evaluation.finalScore = judgeResult.score;
      evaluation.finalVerdict = judgeResult.verdict;
      evaluation.confidence = judgeResult.confidence;
      evaluation.reasoning.push(judgeResult.reasoning);

      // Flag for human review if confidence still low
      if (judgeResult.confidence < this.config.stages.llmJudge.humanReviewThreshold) {
        evaluation.needsHumanReview = true;
        evaluation.reasoning.push('Low confidence - flagged for human review');
      }
    }

    // Stage 4: Human Review (flagged cases only)
    if (evaluation.needsHumanReview) {
      evaluation.stages.push({
        stage: 'human_review',
        status: 'pending',
        reviewUrl: this.generateReviewUrl(test, result, evaluation)
      });
      this.stats.byStage.human++;
    }

    this.stats.evaluated++;
    return evaluation;
  }

  async runKeywordStage(test, result) {
    const startTime = Date.now();
    const matchResult = this.keywordMatcher.match(
      result.response,
      test.expectedTopics || [],
      test.context
    );

    return {
      stage: 'keyword',
      score: matchResult.score,
      verdict: matchResult.score >= 50 ? 'pass' : 'fail',
      confidence: matchResult.confidence,
      details: matchResult.details,
      duration: Date.now() - startTime,
      cost: 0
    };
  }

  async runGroundTruthStage(test, result) {
    const startTime = Date.now();
    const validationResult = await this.groundTruthValidator.validate(
      result.response,
      test.groundTruth
    );

    return {
      stage: 'ground_truth',
      score: validationResult.score,
      verdict: validationResult.verdict,
      confidence: validationResult.confidence,
      details: {
        correctFacts: validationResult.correctFacts,
        incorrectFacts: validationResult.incorrectFacts,
        missingFacts: validationResult.missingFacts,
        hallucinations: validationResult.hallucinations
      },
      duration: Date.now() - startTime,
      cost: 0
    };
  }

  async runLLMJudgeStage(test, result) {
    const startTime = Date.now();
    const judgeResult = await this.llmJudge.evaluateTestResult({
      test,
      result,
      previousStages: evaluation.stages
    });

    return {
      stage: 'llm_judge',
      score: judgeResult.scores.overall,
      verdict: judgeResult.verdict,
      confidence: judgeResult.confidence,
      reasoning: judgeResult.reasoning,
      details: {
        scores: judgeResult.scores,
        modelUsed: judgeResult.judgeModel,
        promptTokens: judgeResult.usage.promptTokens,
        completionTokens: judgeResult.usage.completionTokens
      },
      duration: Date.now() - startTime,
      cost: judgeResult.cost
    };
  }

  shouldRunLLMJudge(evaluation, test) {
    // Run if no ground truth available
    if (!test.groundTruth) return true;

    // Run if previous stages have low confidence
    const latestStage = evaluation.stages[evaluation.stages.length - 1];
    if (latestStage && latestStage.confidence < 0.8) return true;

    // Run if scores are ambiguous (40-60 range)
    if (latestStage && latestStage.score >= 40 && latestStage.score <= 60) return true;

    return false;
  }

  generateReviewUrl(test, result, evaluation) {
    // Generate URL for human review interface
    const reviewId = `${test.id}_${Date.now()}`;
    return `/review/${reviewId}`;
  }

  getStats() {
    return {
      ...this.stats,
      costPerEvaluation: this.stats.costs.llmJudge / this.stats.evaluated,
      judgeUsageRate: this.stats.byStage.llmJudge / this.stats.evaluated,
      humanReviewRate: this.stats.byStage.human / this.stats.evaluated
    };
  }
}
```

**Direct Impact**:
- Reliable evaluation quality (combines multiple validation methods)
- Cost-optimized (only runs expensive LLM judge when needed)
- Confidence-scored results (know which results are trustworthy)
- Human review flagging (identifies ambiguous cases)

**Indirect Impact**:
- Enables publishing results with confidence (statistical rigor)
- Reduces false positives/negatives in model comparisons
- Provides audit trail for evaluation decisions
- Supports continuous improvement (learn which stages work best)

**Dependencies**:
- E2.2 (ImprovedKeywordMatcher)
- E2.3 (GroundTruthValidator)
- E2.4 (CloudLLMJudge integration)
- E2.5 (evaluation-config.json)

---

#### E2.2: Improved Keyword Matcher

**File**: `utils/improved-keyword-matcher.js` (NEW - 300 lines)

**Purpose**: Replace naive keyword matching with semantic similarity and context awareness

**Implementation**:
```javascript
/**
 * Improved Keyword Matcher
 * Uses semantic similarity and context-aware matching
 */

import Anthropic from '@anthropic-ai/sdk';

export class ImprovedKeywordMatcher {
  constructor() {
    // For semantic matching, we can use:
    // 1. String similarity algorithms (Levenshtein, Jaro-Winkler)
    // 2. Lightweight embeddings (if available)
    // 3. Synonym expansion
    this.synonyms = this.loadSynonyms();
  }

  /**
   * Match response against expected topics with confidence scoring
   */
  match(response, expectedTopics, context = {}) {
    const normalizedResponse = this.normalize(response);
    const matches = [];
    let totalScore = 0;
    let totalConfidence = 0;

    for (const topic of expectedTopics) {
      const matchResult = this.matchTopic(normalizedResponse, topic, context);
      matches.push(matchResult);
      totalScore += matchResult.matched ? 1 : 0;
      totalConfidence += matchResult.confidence;
    }

    const score = expectedTopics.length > 0
      ? (totalScore / expectedTopics.length) * 100
      : 0;

    const confidence = expectedTopics.length > 0
      ? totalConfidence / expectedTopics.length
      : 0;

    return {
      score,
      confidence,
      details: {
        expectedTopics: expectedTopics.length,
        foundTopics: totalScore,
        matches,
        responseLength: response.length,
        normalized: normalizedResponse.substring(0, 200)
      }
    };
  }

  matchTopic(normalizedResponse, topic, context) {
    const normalizedTopic = this.normalize(topic);

    // Strategy 1: Exact match (highest confidence)
    if (normalizedResponse.includes(normalizedTopic)) {
      return {
        topic,
        matched: true,
        confidence: 0.95,
        method: 'exact',
        position: normalizedResponse.indexOf(normalizedTopic)
      };
    }

    // Strategy 2: Synonym match (high confidence)
    const synonyms = this.getSynonyms(normalizedTopic);
    for (const synonym of synonyms) {
      if (normalizedResponse.includes(synonym)) {
        return {
          topic,
          matched: true,
          confidence: 0.85,
          method: 'synonym',
          matchedVariant: synonym
        };
      }
    }

    // Strategy 3: Partial match (medium confidence)
    const words = normalizedTopic.split(' ');
    const matchedWords = words.filter(w => normalizedResponse.includes(w));
    if (matchedWords.length >= words.length * 0.7) {
      return {
        topic,
        matched: true,
        confidence: 0.6,
        method: 'partial',
        matchedWords,
        coverage: matchedWords.length / words.length
      };
    }

    // Strategy 4: Fuzzy match for misspellings (low-medium confidence)
    const fuzzyMatch = this.findFuzzyMatch(normalizedResponse, normalizedTopic);
    if (fuzzyMatch.score > 0.8) {
      return {
        topic,
        matched: true,
        confidence: 0.7 * fuzzyMatch.score,
        method: 'fuzzy',
        matchedText: fuzzyMatch.text,
        similarity: fuzzyMatch.score
      };
    }

    // No match
    return {
      topic,
      matched: false,
      confidence: 1.0,  // High confidence in non-match
      method: 'none'
    };
  }

  normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Remove punctuation
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim();
  }

  getSynonyms(term) {
    // Compliance domain synonyms
    const synonymMap = {
      'gdpr': ['general data protection regulation', 'data protection regulation'],
      'pii': ['personally identifiable information', 'personal data', 'personal information'],
      'dpo': ['data protection officer', 'privacy officer'],
      'controller': ['data controller'],
      'processor': ['data processor'],
      'breach': ['data breach', 'security incident', 'privacy incident'],
      'consent': ['user consent', 'explicit consent'],
      // ... more domain-specific synonyms
    };

    return synonymMap[term] || [];
  }

  findFuzzyMatch(haystack, needle) {
    // Simple sliding window fuzzy matching
    const needleLen = needle.length;
    let bestScore = 0;
    let bestText = '';

    for (let i = 0; i <= haystack.length - needleLen; i++) {
      const window = haystack.substring(i, i + needleLen + 10);
      const score = this.calculateSimilarity(window, needle);
      if (score > bestScore) {
        bestScore = score;
        bestText = window;
      }
    }

    return { score: bestScore, text: bestText };
  }

  calculateSimilarity(str1, str2) {
    // Jaro-Winkler similarity
    const m = this.getMatchingCharacters(str1, str2);
    if (m === 0) return 0;

    const t = this.getTranspositions(str1, str2);
    const jaro = (m / str1.length + m / str2.length + (m - t) / m) / 3;

    // Apply Winkler modification
    const prefixLen = this.getCommonPrefixLength(str1, str2, 4);
    return jaro + (prefixLen * 0.1 * (1 - jaro));
  }

  getMatchingCharacters(str1, str2) {
    const maxDist = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
    let matches = 0;
    const str1Matches = new Array(str1.length).fill(false);
    const str2Matches = new Array(str2.length).fill(false);

    for (let i = 0; i < str1.length; i++) {
      const start = Math.max(0, i - maxDist);
      const end = Math.min(i + maxDist + 1, str2.length);

      for (let j = start; j < end; j++) {
        if (str2Matches[j] || str1[i] !== str2[j]) continue;
        str1Matches[i] = str2Matches[j] = true;
        matches++;
        break;
      }
    }

    return matches;
  }

  getTranspositions(str1, str2) {
    // Count transpositions in matching characters
    // (Simplified implementation)
    return 0;
  }

  getCommonPrefixLength(str1, str2, maxLength) {
    const n = Math.min(str1.length, str2.length, maxLength);
    for (let i = 0; i < n; i++) {
      if (str1[i] !== str2[i]) return i;
    }
    return n;
  }

  loadSynonyms() {
    // Load from config/synonyms.json in production
    return {};
  }
}
```

**Direct Impact**:
- More accurate keyword matching (catches synonyms, misspellings)
- Confidence scoring (know when results are reliable)
- Reduces false negatives (model uses different terminology)

**Indirect Impact**:
- Fewer tests requiring expensive LLM judge
- Better initial filtering in evaluation pipeline
- Can identify when judge is needed (low confidence)

---

#### E2.3: Ground Truth Validator

**File**: `utils/ground-truth-validator.js` (NEW - 400 lines)

**Purpose**: Validate factual accuracy against verified correct answers

**Implementation**:
```javascript
/**
 * Ground Truth Validator
 * Validates responses against verified facts from ground truth dataset
 */

import groundTruthData from '../ground-truth/compliance-facts.json' assert { type: 'json' };

export class GroundTruthValidator {
  constructor() {
    this.groundTruth = this.indexGroundTruth(groundTruthData);
  }

  /**
   * Validate response against ground truth facts
   * @param {string} response - Model's response text
   * @param {Object} groundTruthRef - Reference to ground truth for this test
   * @returns {Object} Validation result with score and details
   */
  async validate(response, groundTruthRef) {
    // Load specific ground truth facts for this test
    const facts = this.getGroundTruthFacts(groundTruthRef);
    if (!facts || facts.length === 0) {
      return {
        score: null,
        verdict: 'no_ground_truth',
        confidence: 0,
        message: 'No ground truth available for this test'
      };
    }

    // Extract claims from response
    const responseClaims = this.extractClaims(response);

    // Validate each fact
    const validation = {
      correctFacts: [],
      incorrectFacts: [],
      missingFacts: [],
      hallucinations: [],
      extraInfo: []
    };

    for (const fact of facts) {
      const claimCheck = this.checkFact(fact, responseClaims, response);
      if (claimCheck.present && claimCheck.correct) {
        validation.correctFacts.push({ fact, claim: claimCheck.matchedClaim });
      } else if (claimCheck.present && !claimCheck.correct) {
        validation.incorrectFacts.push({
          fact,
          claim: claimCheck.matchedClaim,
          error: claimCheck.error
        });
      } else {
        validation.missingFacts.push(fact);
      }
    }

    // Check for hallucinations (claims not in ground truth)
    validation.hallucinations = this.detectHallucinations(
      responseClaims,
      facts,
      groundTruthRef.domain
    );

    // Calculate score
    const score = this.calculateScore(validation, facts.length);
    const verdict = this.determineVerdict(score, validation);
    const confidence = this.calculateConfidence(validation, facts.length);

    return {
      score,
      verdict,
      confidence,
      correctFacts: validation.correctFacts,
      incorrectFacts: validation.incorrectFacts,
      missingFacts: validation.missingFacts,
      hallucinations: validation.hallucinations,
      metrics: {
        precision: validation.correctFacts.length /
                   (validation.correctFacts.length + validation.incorrectFacts.length + validation.hallucinations.length),
        recall: validation.correctFacts.length / facts.length,
        f1Score: this.calculateF1(validation, facts.length)
      }
    };
  }

  getGroundTruthFacts(groundTruthRef) {
    // groundTruthRef format: { id: 'gdpr_article_5', type: 'factual' }
    if (!groundTruthRef || !groundTruthRef.id) return [];
    return this.groundTruth[groundTruthRef.id] || [];
  }

  extractClaims(response) {
    // Extract factual claims from response
    // For now, split by sentences; could use NLP for better extraction
    const sentences = response
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);

    return sentences.map(sentence => ({
      text: sentence,
      normalized: this.normalizeForComparison(sentence)
    }));
  }

  checkFact(fact, claims, fullResponse) {
    // Check if fact is present and correctly stated in response
    const normalizedFact = this.normalizeForComparison(fact.statement);

    for (const claim of claims) {
      const similarity = this.calculateSemanticSimilarity(
        normalizedFact,
        claim.normalized
      );

      if (similarity > 0.85) {
        // Claim addresses this fact - check if correct
        const isCorrect = this.verifyFactCorrectness(fact, claim, fullResponse);
        return {
          present: true,
          correct: isCorrect,
          matchedClaim: claim.text,
          similarity,
          error: isCorrect ? null : 'Factually incorrect statement'
        };
      }
    }

    return { present: false, correct: false };
  }

  verifyFactCorrectness(fact, claim, fullResponse) {
    // Verify numerical values, dates, specifics
    if (fact.type === 'numerical') {
      return this.verifyNumerical(fact.value, claim.text);
    } else if (fact.type === 'date') {
      return this.verifyDate(fact.value, claim.text);
    } else if (fact.type === 'boolean') {
      return this.verifyBoolean(fact.value, claim.text);
    } else {
      // For general facts, high similarity = correct
      return true;
    }
  }

  verifyNumerical(expectedValue, claimText) {
    // Extract numbers from claim
    const numbers = claimText.match(/\d+/g);
    if (!numbers) return false;

    // Check if expected value is present
    return numbers.some(num => {
      const numValue = parseInt(num, 10);
      const expected = parseInt(expectedValue, 10);
      // Allow small margin of error
      return Math.abs(numValue - expected) / expected < 0.05;
    });
  }

  verifyDate(expectedDate, claimText) {
    // Parse and compare dates
    const datePattern = /\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/g;
    const dates = claimText.match(datePattern);
    if (!dates) return false;

    // Normalize and compare
    return dates.some(d => this.normalizeDate(d) === this.normalizeDate(expectedDate));
  }

  verifyBoolean(expectedValue, claimText) {
    // Check for affirmative/negative language
    const isAffirmative = /\b(yes|true|correct|must|required|mandatory)\b/i.test(claimText);
    const isNegative = /\b(no|false|incorrect|not|optional|prohibited)\b/i.test(claimText);

    if (expectedValue === true) return isAffirmative && !isNegative;
    if (expectedValue === false) return isNegative && !isAffirmative;
    return false;
  }

  detectHallucinations(claims, groundTruthFacts, domain) {
    // Identify claims not supported by ground truth
    const hallucinations = [];

    for (const claim of claims) {
      // Check if claim is about the domain
      if (!this.isRelevantToDomain(claim.text, domain)) continue;

      // Check if claim is supported by ground truth
      const isSupported = groundTruthFacts.some(fact => {
        const similarity = this.calculateSemanticSimilarity(
          this.normalizeForComparison(fact.statement),
          claim.normalized
        );
        return similarity > 0.7;
      });

      if (!isSupported) {
        hallucinations.push({
          claim: claim.text,
          severity: this.assessHallucinationSeverity(claim.text, domain)
        });
      }
    }

    return hallucinations;
  }

  calculateScore(validation, totalFacts) {
    // Scoring: correct facts add points, incorrect/hallucinations subtract
    const correctPoints = validation.correctFacts.length * 10;
    const incorrectPenalty = validation.incorrectFacts.length * 15;
    const missingPenalty = validation.missingFacts.length * 5;
    const hallucinationPenalty = validation.hallucinations.length * 10;

    const rawScore = correctPoints - incorrectPenalty - missingPenalty - hallucinationPenalty;
    const maxScore = totalFacts * 10;

    return Math.max(0, Math.min(100, (rawScore / maxScore) * 100));
  }

  determineVerdict(score, validation) {
    // Strict: any incorrect fact or hallucination = fail
    if (validation.incorrectFacts.length > 0) return 'fail';
    if (validation.hallucinations.filter(h => h.severity === 'high').length > 0) return 'fail';

    // Score-based
    if (score >= 80) return 'pass';
    if (score >= 60) return 'partial';
    return 'fail';
  }

  calculateConfidence(validation, totalFacts) {
    // High confidence if clear pass/fail
    if (validation.incorrectFacts.length > 0) return 0.95;
    if (validation.correctFacts.length === totalFacts) return 0.95;

    // Medium confidence if partial
    if (validation.missingFacts.length > 0 && validation.correctFacts.length > 0) return 0.7;

    // Low confidence if ambiguous
    return 0.5;
  }

  calculateF1(validation, totalFacts) {
    const precision = validation.correctFacts.length /
                     (validation.correctFacts.length + validation.incorrectFacts.length + validation.hallucinations.length);
    const recall = validation.correctFacts.length / totalFacts;

    if (precision + recall === 0) return 0;
    return 2 * (precision * recall) / (precision + recall);
  }

  calculateSemanticSimilarity(text1, text2) {
    // Simple word overlap similarity
    // In production, use embeddings or more sophisticated method
    const words1 = new Set(text1.split(' '));
    const words2 = new Set(text2.split(' '));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  normalizeForComparison(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  normalizeDate(dateStr) {
    // Convert to ISO format
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  }

  isRelevantToDomain(text, domain) {
    // Check if claim is about the domain (GDPR, ISO27001, etc.)
    const domainKeywords = {
      'gdpr': ['data', 'personal', 'privacy', 'consent', 'controller', 'processor'],
      'iso27001': ['security', 'information', 'risk', 'control', 'asset'],
      'soc2': ['security', 'availability', 'confidentiality', 'processing', 'integrity']
    };

    const keywords = domainKeywords[domain.toLowerCase()] || [];
    return keywords.some(kw => text.toLowerCase().includes(kw));
  }

  assessHallucinationSeverity(claim, domain) {
    // High severity if making specific factual claims
    if (/\b\d+\b/.test(claim)) return 'high';  // Contains numbers
    if (/article|section|clause/i.test(claim)) return 'high';  // Legal references

    return 'medium';
  }

  indexGroundTruth(data) {
    // Convert ground truth array to indexed lookup
    const index = {};
    for (const entry of data) {
      index[entry.id] = entry.facts;
    }
    return index;
  }
}
```

**Direct Impact**:
- Factual accuracy verification (detects incorrect facts)
- Hallucination detection (identifies fabricated information)
- Precision/recall metrics (quantify quality)
- High-confidence evaluation without expensive LLM judge

**Indirect Impact**:
- Builds trust in results (verified against facts)
- Reduces need for human review
- Enables compliance use cases (must be factually correct)
- Provides training data for improving models

**Dependencies**: Requires `ground-truth/compliance-facts.json` (E2.6)

---

#### E2.4: Cloud LLM Judge Integration

**File**: `utils/cloud-llm-judge.js` (MODIFY existing - add ~200 lines)

**Purpose**: Enhance existing LLM-as-judge to support ensemble mode and better prompts

**Current State**: File exists but not integrated into test runner

**Changes**:
```javascript
// Add to existing file
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export class CloudLLMJudge {
  constructor(config = {}) {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.config = config;
    this.defaultModel = config.defaultModel || 'claude-sonnet-4';
    this.ensembleMode = config.ensembleMode || false;
  }

  /**
   * Evaluate test result using LLM as judge
   * @param {Object} params - Test, result, and context
   * @returns {Object} Judge evaluation with scores and reasoning
   */
  async evaluateTestResult({ test, result, previousStages = [] }) {
    // Build comprehensive evaluation prompt
    const prompt = this.buildEvaluationPrompt(test, result, previousStages);

    if (this.ensembleMode) {
      // Get multiple judge opinions and ensemble
      const [claudeEval, gptEval] = await Promise.all([
        this.getJudgment(prompt, 'claude-sonnet-4'),
        this.getJudgment(prompt, 'gpt-4o')
      ]);

      return this.ensembleJudgments([claudeEval, gptEval]);
    } else {
      // Single judge
      return await this.getJudgment(prompt, this.defaultModel);
    }
  }

  buildEvaluationPrompt(test, result, previousStages) {
    return `You are an expert evaluator assessing an LLM's response to a compliance question.

**TEST CONTEXT:**
Standard: ${test.standard}
Knowledge Type: ${test.knowledgeType}
Question: ${test.question}
Expected Topics: ${JSON.stringify(test.expectedTopics)}

**MODEL RESPONSE:**
${result.response}

**PREVIOUS EVALUATION STAGES:**
${previousStages.map(s => `${s.stage}: ${s.verdict} (confidence: ${s.confidence})`).join('\n')}

**YOUR TASK:**
Evaluate the response on these dimensions (score 0-100 for each):

1. **Relevance**: Does it address the question asked?
2. **Accuracy**: Are the facts stated correct? (Check for hallucinations)
3. **Completeness**: Does it cover all expected topics?
4. **Clarity**: Is it well-organized and understandable?
5. **Specificity**: Does it provide specific details, not just generic statements?

**OUTPUT FORMAT (JSON):**
{
  "scores": {
    "relevance": <0-100>,
    "accuracy": <0-100>,
    "completeness": <0-100>,
    "clarity": <0-100>,
    "specificity": <0-100>,
    "overall": <0-100>
  },
  "verdict": "pass|partial|fail",
  "confidence": <0-1>,
  "reasoning": "<explain your assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "hallucinations": ["<any fabricated facts>"]
}

Be strict but fair. A partial answer is better than a wrong answer.`;
  }

  async getJudgment(prompt, modelId) {
    const startTime = Date.now();
    let response, usage;

    if (modelId.includes('claude')) {
      const message = await this.anthropic.messages.create({
        model: modelId,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });
      response = message.content[0].text;
      usage = {
        promptTokens: message.usage.input_tokens,
        completionTokens: message.usage.output_tokens
      };
    } else if (modelId.includes('gpt')) {
      const completion = await this.openai.chat.completions.create({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      });
      response = completion.choices[0].message.content;
      usage = {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens
      };
    }

    // Parse JSON response
    const evaluation = this.parseJudgmentResponse(response);

    // Calculate cost
    const cost = this.calculateJudgeCost(modelId, usage);

    return {
      ...evaluation,
      judgeModel: modelId,
      usage,
      cost,
      duration: Date.now() - startTime
    };
  }

  parseJudgmentResponse(response) {
    try {
      // Extract JSON from response (may have markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse judge response:', error);
      return {
        scores: { overall: 50 },
        verdict: 'unknown',
        confidence: 0.3,
        reasoning: 'Failed to parse judge response',
        strengths: [],
        weaknesses: ['Parse error'],
        hallucinations: []
      };
    }
  }

  ensembleJudgments(judgments) {
    // Combine multiple judge opinions
    // Use average scores and consensus verdict
    const avgScores = {};
    const scoreKeys = Object.keys(judgments[0].scores);

    for (const key of scoreKeys) {
      avgScores[key] = judgments.reduce((sum, j) => sum + j.scores[key], 0) / judgments.length;
    }

    // Consensus verdict (majority vote)
    const verdicts = judgments.map(j => j.verdict);
    const verdictCounts = {};
    for (const v of verdicts) {
      verdictCounts[v] = (verdictCounts[v] || 0) + 1;
    }
    const consensusVerdict = Object.keys(verdictCounts).reduce((a, b) =>
      verdictCounts[a] > verdictCounts[b] ? a : b
    );

    // Confidence: lower if judges disagree
    const agreement = Math.max(...Object.values(verdictCounts)) / judgments.length;
    const avgConfidence = judgments.reduce((sum, j) => sum + j.confidence, 0) / judgments.length;
    const ensembleConfidence = avgConfidence * agreement;

    // Combine reasoning
    const combinedReasoning = `Ensemble of ${judgments.length} judges:\n` +
      judgments.map((j, i) => `Judge ${i + 1} (${j.judgeModel}): ${j.reasoning}`).join('\n\n');

    return {
      scores: avgScores,
      verdict: consensusVerdict,
      confidence: ensembleConfidence,
      reasoning: combinedReasoning,
      strengths: [...new Set(judgments.flatMap(j => j.strengths))],
      weaknesses: [...new Set(judgments.flatMap(j => j.weaknesses))],
      hallucinations: [...new Set(judgments.flatMap(j => j.hallucinations))],
      judgeModel: `ensemble_${judgments.length}`,
      judges: judgments.map(j => ({ model: j.judgeModel, verdict: j.verdict, score: j.scores.overall })),
      usage: {
        promptTokens: judgments.reduce((sum, j) => sum + j.usage.promptTokens, 0),
        completionTokens: judgments.reduce((sum, j) => sum + j.usage.completionTokens, 0)
      },
      cost: judgments.reduce((sum, j) => sum + j.cost, 0)
    };
  }

  calculateJudgeCost(modelId, usage) {
    const pricing = {
      'claude-sonnet-4': { input: 3.00, output: 15.00 },
      'gpt-4o': { input: 5.00, output: 15.00 },
      'gpt-4-turbo': { input: 10.00, output: 30.00 }
    };

    const model = pricing[modelId] || pricing['claude-sonnet-4'];
    return (usage.promptTokens / 1000000 * model.input) +
           (usage.completionTokens / 1000000 * model.output);
  }
}
```

**Direct Impact**:
- Semantic evaluation (understands meaning, not just keywords)
- Multi-dimensional scoring (relevance, accuracy, completeness, clarity, specificity)
- Hallucination detection via expert judge
- Ensemble mode for higher confidence

**Indirect Impact**:
- Publishable results (LLM-as-judge is accepted methodology)
- Can handle complex/ambiguous cases
- Provides detailed reasoning for decisions
- Enables human review efficiency (judge pre-filters)

---

#### E2.5: Evaluation Configuration

**File**: `config/evaluation-config.json` (NEW - 100 lines)

**Purpose**: Centralized configuration for evaluation pipeline behavior

**Implementation**:
```json
{
  "version": "1.0.0",
  "stages": {
    "keyword": {
      "enabled": true,
      "failThreshold": 20,
      "notes": "Fast filter - if score < 20%, likely irrelevant"
    },
    "groundTruth": {
      "enabled": true,
      "skipJudgeThreshold": 0.9,
      "notes": "If confidence > 90%, trust ground truth and skip LLM judge"
    },
    "llmJudge": {
      "enabled": true,
      "defaultModel": "claude-sonnet-4",
      "ensembleMode": false,
      "humanReviewThreshold": 0.6,
      "notes": "Run judge for ambiguous cases; flag for human if confidence < 60%",
      "costLimit": {
        "perEvaluation": 0.05,
        "dailyBudget": 100.00
      }
    },
    "humanReview": {
      "enabled": true,
      "sampleRate": 0.1,
      "notes": "Always flag 10% random sample for validation"
    }
  },
  "testProfiles": {
    "fast": {
      "stages": {
        "keyword": { "enabled": true },
        "groundTruth": { "enabled": false },
        "llmJudge": { "enabled": false },
        "humanReview": { "enabled": false }
      },
      "notes": "Keyword only - fastest, least accurate"
    },
    "balanced": {
      "stages": {
        "keyword": { "enabled": true },
        "groundTruth": { "enabled": true },
        "llmJudge": { "enabled": true, "ensembleMode": false },
        "humanReview": { "enabled": true, "sampleRate": 0.05 }
      },
      "notes": "Good balance of speed and accuracy"
    },
    "rigorous": {
      "stages": {
        "keyword": { "enabled": true },
        "groundTruth": { "enabled": true },
        "llmJudge": { "enabled": true, "ensembleMode": true },
        "humanReview": { "enabled": true, "sampleRate": 0.2 }
      },
      "notes": "Highest accuracy - for publishable results"
    },
    "cost_optimized": {
      "stages": {
        "keyword": { "enabled": true },
        "groundTruth": { "enabled": true },
        "llmJudge": {
          "enabled": true,
          "ensembleMode": false,
          "costLimit": { "perEvaluation": 0.01 }
        },
        "humanReview": { "enabled": false }
      },
      "notes": "Minimize LLM judge usage to control costs"
    }
  }
}
```

**Direct Impact**:
- Easy configuration of evaluation behavior
- Pre-configured profiles for different goals
- Cost controls (budget limits)
- A/B testing different evaluation strategies

**Indirect Impact**:
- Users can customize for their needs
- Can optimize cost/accuracy tradeoffs
- Documents evaluation methodology
- Enables reproducible comparisons

---

#### E2.6: Ground Truth Dataset

**File**: `ground-truth/compliance-facts.json` (NEW - 1000+ lines)

**Purpose**: Verified correct answers for compliance questions

**Implementation Structure**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-03-25",
  "sources": [
    "Official GDPR text (EUR-Lex)",
    "ISO 27001:2022 standard",
    "NIST publications",
    "Official regulatory guidance"
  ],
  "facts": [
    {
      "id": "gdpr_article_5",
      "standard": "GDPR",
      "article": "Article 5",
      "topic": "Principles of data processing",
      "facts": [
        {
          "statement": "Personal data shall be processed lawfully, fairly and in a transparent manner",
          "type": "principle",
          "confidence": 1.0,
          "source": "GDPR Article 5(1)(a)"
        },
        {
          "statement": "Personal data shall be collected for specified, explicit and legitimate purposes",
          "type": "principle",
          "confidence": 1.0,
          "source": "GDPR Article 5(1)(b)"
        },
        {
          "statement": "Personal data shall be adequate, relevant and limited to what is necessary",
          "type": "principle",
          "confidence": 1.0,
          "source": "GDPR Article 5(1)(c)"
        }
      ]
    },
    {
      "id": "gdpr_article_17",
      "standard": "GDPR",
      "article": "Article 17",
      "topic": "Right to erasure",
      "facts": [
        {
          "statement": "Data subject has the right to obtain erasure of personal data",
          "type": "boolean",
          "value": true,
          "confidence": 1.0,
          "source": "GDPR Article 17(1)"
        },
        {
          "statement": "Right to erasure applies when data no longer necessary for purposes",
          "type": "condition",
          "confidence": 1.0,
          "source": "GDPR Article 17(1)(a)"
        }
      ]
    },
    {
      "id": "gdpr_fines",
      "standard": "GDPR",
      "article": "Article 83",
      "topic": "Administrative fines",
      "facts": [
        {
          "statement": "Maximum fine is 20 million EUR or 4% of annual worldwide turnover, whichever is higher",
          "type": "numerical",
          "value": 20000000,
          "valueUnit": "EUR",
          "alternativeValue": 0.04,
          "alternativeUnit": "percentage of turnover",
          "confidence": 1.0,
          "source": "GDPR Article 83(5)"
        }
      ]
    },
    {
      "id": "iso27001_clauses",
      "standard": "ISO 27001",
      "version": "2022",
      "topic": "Control categories",
      "facts": [
        {
          "statement": "ISO 27001:2022 has 93 controls across 4 themes",
          "type": "numerical",
          "value": 93,
          "confidence": 1.0,
          "source": "ISO/IEC 27001:2022 Annex A"
        },
        {
          "statement": "Four themes are: Organizational, People, Physical, and Technological",
          "type": "list",
          "values": ["Organizational", "People", "Physical", "Technological"],
          "confidence": 1.0,
          "source": "ISO/IEC 27001:2022 Annex A"
        }
      ]
    },
    {
      "id": "soc2_trust_principles",
      "standard": "SOC 2",
      "topic": "Trust Services Criteria",
      "facts": [
        {
          "statement": "Five Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, Privacy",
          "type": "list",
          "values": ["Security", "Availability", "Processing Integrity", "Confidentiality", "Privacy"],
          "confidence": 1.0,
          "source": "AICPA TSC 2020"
        },
        {
          "statement": "Security is required for all SOC 2 audits",
          "type": "boolean",
          "value": true,
          "confidence": 1.0,
          "source": "AICPA SOC 2 Guide"
        }
      ]
    }
  ]
}
```

**Creation Process**:
1. Extract key facts from official sources (GDPR text, ISO standards, etc.)
2. Structure as verifiable statements with types (principle, numerical, boolean, list)
3. Include confidence scores and source citations
4. Peer review for accuracy
5. Version control and update tracking

**Direct Impact**:
- High-confidence factual validation
- Hallucination detection
- No API costs (offline validation)
- Audit trail (source citations)

**Indirect Impact**:
- Builds credibility for published results
- Training data for fine-tuning models
- Can expand to other domains
- Community contribution opportunity

---

### Enhancement Group 3: Cloud Model Integration

#### E3.1: Cloud Model Client

**File**: `utils/cloud-model-client.js` (NEW - 600 lines)

**Purpose**: Unified interface for testing cloud API models (Claude, GPT, Gemini)

**Implementation**:
```javascript
/**
 * Cloud Model Client
 * Unified interface for testing cloud LLM APIs
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class CloudModelClient {
  constructor(config = {}) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.gemini = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    this.config = config;
    this.rateLimits = this.initializeRateLimits();
  }

  /**
   * Chat completion with unified interface across providers
   * @param {Object} params - Request parameters
   * @returns {Object} Standardized response
   */
  async chatCompletion({ model, prompt, temperature = 0.3, maxTokens = 2000 }) {
    const startTime = Date.now();
    const provider = this.detectProvider(model);

    // Check rate limits
    await this.checkRateLimit(provider);

    let response, usage;

    try {
      if (provider === 'anthropic') {
        const result = await this.anthropicCompletion(model, prompt, temperature, maxTokens);
        response = result.response;
        usage = result.usage;
      } else if (provider === 'openai') {
        const result = await this.openaiCompletion(model, prompt, temperature, maxTokens);
        response = result.response;
        usage = result.usage;
      } else if (provider === 'google') {
        const result = await this.geminiCompletion(model, prompt, temperature, maxTokens);
        response = result.response;
        usage = result.usage;
      } else {
        throw new Error(`Unknown provider for model: ${model}`);
      }

      const duration = Date.now() - startTime;

      return {
        response,
        timing: {
          totalTime: duration,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.promptTokens + usage.completionTokens,
          tokensPerSec: (usage.completionTokens / duration) * 1000
        },
        model,
        provider,
        success: true
      };

    } catch (error) {
      return {
        response: null,
        error: error.message,
        timing: {
          totalTime: Date.now() - startTime,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          tokensPerSec: 0
        },
        model,
        provider,
        success: false
      };
    }
  }

  async anthropicCompletion(model, prompt, temperature, maxTokens) {
    const message = await this.anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'user', content: prompt }]
    });

    return {
      response: message.content[0].text,
      usage: {
        promptTokens: message.usage.input_tokens,
        completionTokens: message.usage.output_tokens
      }
    };
  }

  async openaiCompletion(model, prompt, temperature, maxTokens) {
    const completion = await this.openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens
    });

    return {
      response: completion.choices[0].message.content,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens
      }
    };
  }

  async geminiCompletion(model, prompt, temperature, maxTokens) {
    const genModel = this.gemini.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    });

    const result = await genModel.generateContent(prompt);
    const response = result.response.text();

    // Gemini doesn't always provide usage data
    const promptTokens = this.estimateTokens(prompt);
    const completionTokens = this.estimateTokens(response);

    return {
      response,
      usage: {
        promptTokens,
        completionTokens
      }
    };
  }

  detectProvider(model) {
    if (model.includes('claude')) return 'anthropic';
    if (model.includes('gpt')) return 'openai';
    if (model.includes('gemini')) return 'google';
    throw new Error(`Cannot detect provider for model: ${model}`);
  }

  initializeRateLimits() {
    return {
      anthropic: { requestsPerMinute: 50, tokensPerMinute: 100000, lastRequest: 0, tokens: 0 },
      openai: { requestsPerMinute: 500, tokensPerMinute: 150000, lastRequest: 0, tokens: 0 },
      google: { requestsPerMinute: 60, tokensPerMinute: 120000, lastRequest: 0, tokens: 0 }
    };
  }

  async checkRateLimit(provider) {
    const limits = this.rateLimits[provider];
    const now = Date.now();
    const timeSinceLastRequest = now - limits.lastRequest;

    // Simple rate limiting: wait if too fast
    const minInterval = (60 * 1000) / limits.requestsPerMinute;
    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      await this.sleep(waitTime);
    }

    limits.lastRequest = Date.now();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  estimateTokens(text) {
    // Rough estimate: ~4 chars per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Test connection to all cloud providers
   */
  async healthCheck() {
    const results = {
      anthropic: await this.testProvider('anthropic', 'claude-sonnet-4'),
      openai: await this.testProvider('openai', 'gpt-4o'),
      google: await this.testProvider('google', 'gemini-1.5-pro')
    };

    return results;
  }

  async testProvider(provider, model) {
    try {
      const result = await this.chatCompletion({
        model,
        prompt: 'Say "OK" if you can read this.',
        maxTokens: 10
      });

      return {
        available: result.success,
        model,
        responseTime: result.timing.totalTime,
        error: result.error || null
      };
    } catch (error) {
      return {
        available: false,
        model,
        error: error.message
      };
    }
  }
}
```

**Direct Impact**:
- Test cloud models alongside local models
- Compare local vs cloud cost/quality tradeoffs
- Unified interface (same test code for all models)
- Rate limiting and error handling

**Indirect Impact**:
- Enables "should I use local or cloud?" decisions
- Proves ROI of local deployment
- Benchmark against SOTA models
- Validates local model quality

**Dependencies**:
- API keys in environment variables
- NPM packages: `@anthropic-ai/sdk`, `openai`, `@google/generative-ai`

---

#### E3.2: Model Registry

**File**: `config/model-registry.json` (NEW - 200 lines)

**Purpose**: Centralized registry of all testable models (local + cloud)

**Implementation**:
```json
{
  "version": "1.0.0",
  "models": {
    "local": [
      {
        "id": "hermes-3-llama-8b",
        "name": "Hermes 3 Llama 8B",
        "family": "llama",
        "size": "8B",
        "quantization": "Q6_K",
        "provider": "llamacpp",
        "capabilities": ["chat", "reasoning"],
        "contextWindow": 8192,
        "estimatedRAM": 10,
        "notes": "Fast, good general purpose"
      },
      {
        "id": "llama-4-scout-17b",
        "name": "Llama 4 Scout 17B",
        "family": "llama",
        "size": "17B",
        "quantization": "Q6_K",
        "provider": "llamacpp",
        "capabilities": ["chat", "reasoning", "code"],
        "contextWindow": 16384,
        "estimatedRAM": 20,
        "notes": "Balanced size/performance"
      },
      {
        "id": "deepseek-r1-qwen-32b",
        "name": "DeepSeek R1 Qwen 32B",
        "family": "qwen",
        "size": "32B",
        "quantization": "Q4_K_M",
        "provider": "llamacpp",
        "capabilities": ["chat", "reasoning", "code", "math"],
        "contextWindow": 32768,
        "estimatedRAM": 24,
        "notes": "Strong reasoning, requires more RAM"
      },
      {
        "id": "qwen-coder-7b",
        "name": "Qwen Coder 7B",
        "family": "qwen",
        "size": "7B",
        "quantization": "Q6_K",
        "provider": "llamacpp",
        "capabilities": ["code", "chat"],
        "contextWindow": 8192,
        "estimatedRAM": 9,
        "notes": "Specialized for code generation"
      }
    ],
    "cloud": [
      {
        "id": "claude-sonnet-4",
        "name": "Claude Sonnet 4",
        "family": "claude",
        "provider": "anthropic",
        "capabilities": ["chat", "reasoning", "code", "analysis", "vision"],
        "contextWindow": 200000,
        "pricing": {
          "inputPer1M": 3.00,
          "outputPer1M": 15.00
        },
        "notes": "Best balance of speed/quality"
      },
      {
        "id": "claude-opus-4",
        "name": "Claude Opus 4",
        "family": "claude",
        "provider": "anthropic",
        "capabilities": ["chat", "reasoning", "code", "analysis", "vision", "complex-tasks"],
        "contextWindow": 200000,
        "pricing": {
          "inputPer1M": 15.00,
          "outputPer1M": 75.00
        },
        "notes": "Most capable, highest cost"
      },
      {
        "id": "gpt-4o",
        "name": "GPT-4o",
        "family": "gpt",
        "provider": "openai",
        "capabilities": ["chat", "reasoning", "code", "vision"],
        "contextWindow": 128000,
        "pricing": {
          "inputPer1M": 5.00,
          "outputPer1M": 15.00
        },
        "notes": "Fast, cost-effective"
      },
      {
        "id": "gpt-4-turbo",
        "name": "GPT-4 Turbo",
        "family": "gpt",
        "provider": "openai",
        "capabilities": ["chat", "reasoning", "code", "vision"],
        "contextWindow": 128000,
        "pricing": {
          "inputPer1M": 10.00,
          "outputPer1M": 30.00
        },
        "notes": "Higher quality than GPT-4o"
      },
      {
        "id": "gemini-1.5-pro",
        "name": "Gemini 1.5 Pro",
        "family": "gemini",
        "provider": "google",
        "capabilities": ["chat", "reasoning", "code", "vision", "long-context"],
        "contextWindow": 2000000,
        "pricing": {
          "inputPer1M": 7.00,
          "outputPer1M": 21.00
        },
        "notes": "Massive context window"
      }
    ]
  },
  "testProfiles": {
    "local_only": {
      "models": ["hermes-3-llama-8b", "llama-4-scout-17b", "deepseek-r1-qwen-32b"],
      "notes": "Test local models only"
    },
    "cloud_only": {
      "models": ["claude-sonnet-4", "gpt-4o", "gemini-1.5-pro"],
      "notes": "Test cloud models only"
    },
    "comparison": {
      "models": [
        "hermes-3-llama-8b",
        "llama-4-scout-17b",
        "claude-sonnet-4",
        "gpt-4o"
      ],
      "notes": "Compare best local vs cloud"
    },
    "cost_optimized": {
      "models": ["hermes-3-llama-8b", "gpt-4o"],
      "notes": "Fastest/cheapest from each category"
    },
    "quality_first": {
      "models": ["deepseek-r1-qwen-32b", "claude-opus-4", "gpt-4-turbo"],
      "notes": "Highest quality regardless of cost"
    }
  }
}
```

**Direct Impact**:
- Single source of truth for model metadata
- Easy to add new models
- Pre-configured test profiles
- Documents model capabilities

**Indirect Impact**:
- Enables model filtering by capability
- Supports "show me all code generation models"
- Easy onboarding for new models
- Community can contribute model definitions

---

#### E3.3: Integrate Cloud Models into Test Runner

**File**: `enterprise-test-runner.js` (MODIFY - add ~100 lines)

**Changes**:
```javascript
// Add imports
import { CloudModelClient } from './utils/cloud-model-client.js';
import modelRegistry from './config/model-registry.json' assert { type: 'json' };

// In constructor
constructor(testProfile, modelIds, options = {}) {
  // ... existing code ...

  // ADD: Initialize cloud client
  this.cloudClient = new CloudModelClient();

  // ADD: Load model registry
  this.modelRegistry = modelRegistry;

  // ADD: Separate local and cloud models
  this.models = this.organizeModels(modelIds);
}

organizeModels(modelIds) {
  const models = {
    local: [],
    cloud: []
  };

  for (const modelId of modelIds) {
    const modelDef = this.findModelDefinition(modelId);
    if (!modelDef) {
      console.warn(`Model ${modelId} not found in registry, skipping`);
      continue;
    }

    if (modelDef.provider === 'llamacpp') {
      models.local.push(modelDef);
    } else {
      models.cloud.push(modelDef);
    }
  }

  return models;
}

findModelDefinition(modelId) {
  const allModels = [
    ...this.modelRegistry.models.local,
    ...this.modelRegistry.models.cloud
  ];
  return allModels.find(m => m.id === modelId);
}

// ADD: Method to run test on cloud model
async runTestOnCloudModel(test, modelDef) {
  const prompt = this.buildPrompt(test);

  const result = await this.cloudClient.chatCompletion({
    model: modelDef.id,
    prompt,
    temperature: 0.3,
    maxTokens: 2000
  });

  if (!result.success) {
    return {
      ...result,
      test: test.id,
      error: result.error
    };
  }

  // Evaluate response
  const evaluation = await this.evaluator.evaluate(test, result);

  // Calculate cost
  const economics = this.costCalculator.calculateQueryCost(
    result,
    'cloud',
    modelDef.id
  );

  return {
    ...result,
    test: test.id,
    evaluation,
    economics,
    modelInfo: {
      id: modelDef.id,
      name: modelDef.name,
      provider: modelDef.provider,
      family: modelDef.family
    }
  };
}

// MODIFY: Main run method to handle both local and cloud
async run() {
  console.log('\\n=== LLM Test Suite - Multi-Model Benchmark ===\\n');
  console.log(`Local models: ${this.models.local.length}`);
  console.log(`Cloud models: ${this.models.cloud.length}`);
  console.log(`Tests: ${this.tests.length}`);

  const allResults = [];

  // Run local models
  for (const modelDef of this.models.local) {
    console.log(`\\n--- Testing Local Model: ${modelDef.name} ---`);
    const results = await this.runTestsOnLocalModel(modelDef);
    allResults.push(...results);
  }

  // Run cloud models
  for (const modelDef of this.models.cloud) {
    console.log(`\\n--- Testing Cloud Model: ${modelDef.name} ---`);
    const results = await this.runTestsOnCloudModel(modelDef);
    allResults.push(...results);
  }

  // Generate comprehensive report
  const report = this.generateReport(allResults);
  await this.saveReport(report);

  return report;
}

async runTestsOnCloudModel(modelDef) {
  const results = [];

  for (const test of this.tests) {
    const result = await this.runTestOnCloudModel(test, modelDef);
    results.push(result);

    // Progress indicator
    console.log(`  ${test.id}: ${result.evaluation.finalVerdict} (${result.evaluation.finalScore.toFixed(1)}%)`);
  }

  return results;
}
```

**Direct Impact**:
- Test local and cloud models in same run
- Direct comparison of cost/quality
- Same evaluation pipeline for all models
- Unified reporting

**Indirect Impact**:
- Answer "is local deployment worth it?"
- Quantify cloud API costs vs local infrastructure
- Validate local model quality vs SOTA
- Support hybrid deployment decisions

---

### Enhancement Group 4: Statistical Analysis

#### E4.1: Statistical Analyzer

**File**: `utils/statistical-analyzer.js` (NEW - 500 lines)

**Purpose**: Calculate variance, confidence intervals, significance tests

**Implementation**:
```javascript
/**
 * Statistical Analyzer
 * Provides statistical rigor for benchmark results
 */

export class StatisticalAnalyzer {
  constructor() {
    this.alphaStat_level = 0.05;  // 95% confidence
  }

  /**
   * Analyze test results with variance and confidence intervals
   * @param {Array} multiRunResults - Results from multiple test runs
   * @returns {Object} Statistical analysis
   */
  analyzeMultipleRuns(multiRunResults) {
    // Group results by test and model
    const grouped = this.groupByTestAndModel(multiRunResults);

    const analysis = {};

    for (const [key, runs] of Object.entries(grouped)) {
      const scores = runs.map(r => r.evaluation.finalScore);
      const times = runs.map(r => r.timing.totalTime);
      const costs = runs.map(r => r.economics.totalCost);

      analysis[key] = {
        scores: this.analyzeMetric(scores),
        latency: this.analyzeMetric(times),
        cost: this.analyzeMetric(costs),
        runs: runs.length,
        consistency: this.calculateConsistency(scores)
      };
    }

    return analysis;
  }

  analyzeMetric(values) {
    if (values.length === 0) return null;
    if (values.length === 1) {
      return {
        mean: values[0],
        stdDev: 0,
        variance: 0,
        confidenceInterval: [values[0], values[0]],
        min: values[0],
        max: values[0],
        median: values[0]
      };
    }

    const mean = this.calculateMean(values);
    const stdDev = this.calculateStdDev(values, mean);
    const variance = stdDev * stdDev;
    const confidenceInterval = this.calculateConfidenceInterval(values, mean, stdDev);

    const sorted = [...values].sort((a, b) => a - b);

    return {
      mean,
      stdDev,
      variance,
      confidenceInterval,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: this.calculateMedian(sorted),
      percentiles: {
        p25: this.calculatePercentile(sorted, 25),
        p50: this.calculatePercentile(sorted, 50),
        p75: this.calculatePercentile(sorted, 75),
        p95: this.calculatePercentile(sorted, 95),
        p99: this.calculatePercentile(sorted, 99)
      }
    };
  }

  calculateMean(values) {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  calculateStdDev(values, mean) {
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  calculateMedian(sortedValues) {
    const mid = Math.floor(sortedValues.length / 2);
    if (sortedValues.length % 2 === 0) {
      return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
    }
    return sortedValues[mid];
  }

  calculatePercentile(sortedValues, percentile) {
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) return sortedValues[lower];
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  calculateConfidenceInterval(values, mean, stdDev) {
    // 95% confidence interval using t-distribution
    const n = values.length;
    const tValue = this.getTValue(n - 1, this.alphaLevel);
    const standardError = stdDev / Math.sqrt(n);
    const marginOfError = tValue * standardError;

    return [
      mean - marginOfError,
      mean + marginOfError
    ];
  }

  getTValue(degreesOfFreedom, alphaLevel) {
    // Approximate t-values for 95% confidence (two-tailed)
    // For production, use a statistical library
    const tTable = {
      1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
      10: 2.228, 20: 2.086, 30: 2.042, 50: 2.009, 100: 1.984
    };

    // Find closest df
    const dfs = Object.keys(tTable).map(Number).sort((a, b) => a - b);
    const closestDf = dfs.reduce((prev, curr) =>
      Math.abs(curr - degreesOfFreedom) < Math.abs(prev - degreesOfFreedom) ? curr : prev
    );

    return tTable[closestDf];
  }

  calculateConsistency(scores) {
    // Coefficient of variation (lower = more consistent)
    const mean = this.calculateMean(scores);
    const stdDev = this.calculateStdDev(scores, mean);
    const cv = (stdDev / mean) * 100;

    let rating;
    if (cv < 5) rating = 'excellent';
    else if (cv < 10) rating = 'good';
    else if (cv < 20) rating = 'fair';
    else rating = 'poor';

    return {
      coefficientOfVariation: cv,
      rating,
      interpretation: `${rating} consistency (CV: ${cv.toFixed(1)}%)`
    };
  }

  /**
   * Compare two models statistically
   * @param {Array} modelAResults - Results for model A
   * @param {Array} modelBResults - Results for model B
   * @returns {Object} Comparison with significance test
   */
  compareModels(modelAResults, modelBResults) {
    const scoresA = modelAResults.map(r => r.evaluation.finalScore);
    const scoresB = modelBResults.map(r => r.evaluation.finalScore);

    const statsA = this.analyzeMetric(scoresA);
    const statsB = this.analyzeMetric(scoresB);

    // Two-sample t-test
    const tTest = this.twoSampleTTest(scoresA, scoresB);

    // Effect size (Cohen's d)
    const effectSize = this.calculateCohenD(scoresA, scoresB);

    return {
      modelA: statsA,
      modelB: statsB,
      difference: {
        mean: statsA.mean - statsB.mean,
        percentage: ((statsA.mean - statsB.mean) / statsB.mean) * 100
      },
      significance: {
        tStatistic: tTest.tStatistic,
        pValue: tTest.pValue,
        isSignificant: tTest.pValue < this.alphaLevel,
        confidenceLevel: (1 - this.alphaLevel) * 100,
        interpretation: tTest.pValue < this.alphaLevel
          ? 'Difference is statistically significant'
          : 'Difference is not statistically significant'
      },
      effectSize: {
        cohenD: effectSize,
        interpretation: this.interpretEffectSize(effectSize)
      },
      recommendation: this.generateRecommendation(statsA, statsB, tTest, effectSize)
    };
  }

  twoSampleTTest(samplesA, samplesB) {
    const meanA = this.calculateMean(samplesA);
    const meanB = this.calculateMean(samplesB);
    const stdDevA = this.calculateStdDev(samplesA, meanA);
    const stdDevB = this.calculateStdDev(samplesB, meanB);
    const nA = samplesA.length;
    const nB = samplesB.length;

    // Pooled standard deviation
    const pooledStdDev = Math.sqrt(
      ((nA - 1) * stdDevA * stdDevA + (nB - 1) * stdDevB * stdDevB) / (nA + nB - 2)
    );

    // T-statistic
    const tStatistic = (meanA - meanB) / (pooledStdDev * Math.sqrt(1/nA + 1/nB));

    // Degrees of freedom
    const df = nA + nB - 2;

    // P-value (approximate)
    const pValue = this.tTestPValue(Math.abs(tStatistic), df);

    return { tStatistic, pValue, degreesOfFreedom: df };
  }

  tTestPValue(tStat, df) {
    // Approximate p-value calculation
    // For production, use a statistical library
    // This is a simplified approximation
    if (tStat < 1.96) return 0.05;
    if (tStat < 2.58) return 0.01;
    if (tStat < 3.29) return 0.001;
    return 0.0001;
  }

  calculateCohenD(samplesA, samplesB) {
    const meanA = this.calculateMean(samplesA);
    const meanB = this.calculateMean(samplesB);
    const stdDevA = this.calculateStdDev(samplesA, meanA);
    const stdDevB = this.calculateStdDev(samplesB, meanB);

    // Pooled standard deviation
    const pooledStdDev = Math.sqrt((stdDevA * stdDevA + stdDevB * stdDevB) / 2);

    return (meanA - meanB) / pooledStdDev;
  }

  interpretEffectSize(cohenD) {
    const absD = Math.abs(cohenD);
    if (absD < 0.2) return 'negligible';
    if (absD < 0.5) return 'small';
    if (absD < 0.8) return 'medium';
    return 'large';
  }

  generateRecommendation(statsA, statsB, tTest, effectSize) {
    const meanDiff = statsA.mean - statsB.mean;
    const isSignificant = tTest.pValue < this.alphaLevel;
    const effectSizeInterpretation = this.interpretEffectSize(effectSize);

    if (!isSignificant) {
      return 'No statistically significant difference - models perform similarly';
    }

    if (effectSizeInterpretation === 'negligible' || effectSizeInterpretation === 'small') {
      return `Statistically significant but small practical difference (${meanDiff.toFixed(1)}%)`;
    }

    const betterModel = meanDiff > 0 ? 'Model A' : 'Model B';
    return `${betterModel} is significantly better (p < ${this.alphaLevel}) with ${effectSizeInterpretation} effect size`;
  }

  groupByTestAndModel(results) {
    const grouped = {};

    for (const result of results) {
      const key = `${result.test}_${result.modelInfo.id}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(result);
    }

    return grouped;
  }
}
```

**Direct Impact**:
- Confidence intervals on all scores
- Statistical significance testing
- Variance analysis (consistency measurement)
- Effect size calculation (practical significance)

**Indirect Impact**:
- Publishable results (academic rigor)
- Confident model selection ("Model A is significantly better")
- Identify inconsistent models (high variance = unreliable)
- Power analysis for sample size determination

---

#### E4.2: Multi-Run Test Orchestrator

**File**: `utils/multi-run-orchestrator.js` (NEW - 300 lines)

**Purpose**: Run tests multiple times for variance analysis

**Implementation**:
```javascript
/**
 * Multi-Run Test Orchestrator
 * Runs tests multiple times to measure variance and consistency
 */

import { StatisticalAnalyzer } from './statistical-analyzer.js';

export class MultiRunOrchestrator {
  constructor(testRunner, options = {}) {
    this.testRunner = testRunner;
    this.runs = options.runs || 5;
    this.analyzer = new StatisticalAnalyzer();
    this.saveIntermediateResults = options.saveIntermediateResults !== false;
  }

  /**
   * Run test suite multiple times and analyze variance
   * @param {Object} config - Test configuration
   * @returns {Object} Aggregated results with statistics
   */
  async runMultiple(config) {
    console.log(`\n=== Multi-Run Test (${this.runs} iterations) ===\n`);

    const allRuns = [];
    const runResults = [];

    for (let i = 1; i <= this.runs; i++) {
      console.log(`\n--- Run ${i}/${this.runs} ---`);

      const runResult = await this.testRunner.run(config);
      runResults.push(runResult);

      // Flatten results for analysis
      for (const result of runResult.results) {
        allRuns.push({
          ...result,
          runNumber: i
        });
      }

      if (this.saveIntermediateResults) {
        await this.saveRunResult(runResult, i);
      }

      // Small delay between runs
      if (i < this.runs) {
        console.log('\nCooling down before next run...');
        await this.sleep(5000);
      }
    }

    // Statistical analysis
    console.log('\n=== Analyzing Statistical Significance ===\n');
    const statistics = this.analyzer.analyzeMultipleRuns(allRuns);

    // Generate comprehensive report
    const report = this.generateStatisticalReport(runResults, statistics);

    return report;
  }

  generateStatisticalReport(runResults, statistics) {
    return {
      overview: {
        totalRuns: this.runs,
        testsPerRun: runResults[0].results.length,
        totalTests: this.runs * runResults[0].results.length,
        startTime: runResults[0].startTime,
        endTime: runResults[this.runs - 1].endTime,
        totalDuration: runResults.reduce((sum, r) => sum + r.duration, 0)
      },
      statisticalAnalysis: statistics,
      modelComparisons: this.generateModelComparisons(statistics),
      consistencyRankings: this.generateConsistencyRankings(statistics),
      recommendations: this.generateRecommendations(statistics),
      rawRuns: runResults
    };
  }

  generateModelComparisons(statistics) {
    // Extract unique models
    const models = [...new Set(
      Object.keys(statistics).map(key => key.split('_').slice(1).join('_'))
    )];

    const comparisons = [];

    // Pairwise comparisons
    for (let i = 0; i < models.length; i++) {
      for (let j = i + 1; j < models.length; j++) {
        const modelA = models[i];
        const modelB = models[j];

        // Get all results for these models
        const resultsA = this.getModelResults(statistics, modelA);
        const resultsB = this.getModelResults(statistics, modelB);

        // Aggregate scores
        const scoresA = resultsA.flatMap(r => [r.scores.mean]);
        const scoresB = resultsB.flatMap(r => [r.scores.mean]);

        const comparison = this.analyzer.compareModels(
          scoresA.map((score, i) => ({
            evaluation: { finalScore: score },
            test: `test_${i}`
          })),
          scoresB.map((score, i) => ({
            evaluation: { finalScore: score },
            test: `test_${i}`
          }))
        );

        comparisons.push({
          modelA,
          modelB,
          ...comparison
        });
      }
    }

    return comparisons;
  }

  generateConsistencyRankings(statistics) {
    const modelConsistency = {};

    for (const [key, stats] of Object.entries(statistics)) {
      const model = key.split('_').slice(1).join('_');

      if (!modelConsistency[model]) {
        modelConsistency[model] = {
          model,
          cvScores: [],
          meanScore: 0,
          count: 0
        };
      }

      modelConsistency[model].cvScores.push(stats.consistency.coefficientOfVariation);
      modelConsistency[model].meanScore += stats.scores.mean;
      modelConsistency[model].count++;
    }

    // Calculate averages
    for (const model of Object.keys(modelConsistency)) {
      const data = modelConsistency[model];
      data.avgCV = data.cvScores.reduce((sum, cv) => sum + cv, 0) / data.cvScores.length;
      data.avgScore = data.meanScore / data.count;
    }

    // Rank by consistency (lower CV = better)
    const ranked = Object.values(modelConsistency).sort((a, b) => a.avgCV - b.avgCV);

    return ranked.map((r, i) => ({
      rank: i + 1,
      model: r.model,
      consistencyScore: 100 - r.avgCV,  // Invert so higher is better
      avgCV: r.avgCV,
      avgQuality: r.avgScore,
      rating: r.avgCV < 5 ? 'excellent' : r.avgCV < 10 ? 'good' : r.avgCV < 20 ? 'fair' : 'poor'
    }));
  }

  generateRecommendations(statistics) {
    const models = this.extractModels(statistics);
    const recommendations = [];

    for (const model of models) {
      const modelStats = this.getModelResults(statistics, model);
      const avgScore = modelStats.reduce((sum, s) => sum + s.scores.mean, 0) / modelStats.length;
      const avgCV = modelStats.reduce((sum, s) => sum + s.consistency.coefficientOfVariation, 0) / modelStats.length;

      let recommendation = '';

      if (avgScore >= 80 && avgCV < 10) {
        recommendation = 'Highly recommended - high quality and consistent';
      } else if (avgScore >= 70 && avgCV < 15) {
        recommendation = 'Recommended - good balance of quality and consistency';
      } else if (avgScore >= 60) {
        recommendation = 'Acceptable for non-critical use cases';
      } else if (avgCV > 20) {
        recommendation = 'Not recommended - too inconsistent for reliable results';
      } else {
        recommendation = 'Not recommended - insufficient quality';
      }

      recommendations.push({
        model,
        avgScore,
        avgCV,
        recommendation
      });
    }

    return recommendations.sort((a, b) => b.avgScore - a.avgScore);
  }

  getModelResults(statistics, model) {
    return Object.entries(statistics)
      .filter(([key, _]) => key.includes(model))
      .map(([_, stats]) => stats);
  }

  extractModels(statistics) {
    return [...new Set(
      Object.keys(statistics).map(key => key.split('_').slice(1).join('_'))
    )];
  }

  async saveRunResult(runResult, runNumber) {
    const filename = `reports/multi-run/run-${runNumber}-${Date.now()}.json`;
    // Save to file (implementation depends on file system access)
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**Direct Impact**:
- Run tests N times automatically
- Calculate variance and consistency
- Statistical comparison between models
- Confidence intervals on all metrics

**Indirect Impact**:
- Proves reliability (consistent results = trustworthy)
- Identifies flaky tests (high variance)
- Enables minimum sample size calculation
- Publishable results with statistical backing

---

### Enhancement Group 5: Decision Engine & Output Formats

#### E5.1: Decision Engine

**File**: `utils/decision-engine.js` (NEW - 700 lines)

**Purpose**: Generate actionable model recommendations based on user constraints

**Implementation**:
```javascript
/**
 * Decision Engine
 * Generates model recommendations based on test results and user constraints
 */

export class DecisionEngine {
  constructor(testResults, constraints = {}) {
    this.results = testResults;
    this.constraints = constraints;
  }

  /**
   * Get best model for use case with given constraints
   * @param {Object} params - Use case and constraints
   * @returns {Object} Recommendation with reasoning
   */
  recommend({ useCase, constraints = {} }) {
    // Merge with default constraints
    const effectiveConstraints = { ...this.constraints, ...constraints };

    // Filter models by constraints
    const candidates = this.filterByConstraints(this.results, effectiveConstraints);

    if (candidates.length === 0) {
      return {
        recommendation: null,
        reason: 'No models meet the specified constraints',
        relaxedSuggestions: this.suggestRelaxedConstraints(effectiveConstraints)
      };
    }

    // Score candidates based on use case
    const scored = this.scoreForUseCase(candidates, useCase, effectiveConstraints);

    // Rank and select top recommendation
    const ranked = scored.sort((a, b) => b.totalScore - a.totalScore);
    const top = ranked[0];
    const alternatives = ranked.slice(1, 4);

    return {
      recommendation: {
        model: top.model,
        provider: top.provider,
        qualityScore: top.quality,
        costPerQuery: top.cost,
        latency: top.latency,
        totalScore: top.totalScore,
        strengths: this.identifyStrengths(top),
        weaknesses: this.identifyWeaknesses(top)
      },
      reasoning: this.generateReasoning(top, effectiveConstraints, useCase),
      alternatives: alternatives.map(alt => ({
        model: alt.model,
        reason: this.explainAlternative(alt, top)
      })),
      tradeoffs: this.analyzeTradeoffs(ranked),
      costAnalysis: this.generateCostAnalysis(top, alternatives)
    };
  }

  filterByConstraints(results, constraints) {
    let filtered = results;

    // Cost constraint
    if (constraints.maxCostPerQuery) {
      filtered = filtered.filter(r =>
        r.economics.totalCost <= constraints.maxCostPerQuery
      );
    }

    // Quality constraint
    if (constraints.minQualityScore) {
      filtered = filtered.filter(r =>
        r.evaluation.finalScore >= constraints.minQualityScore
      );
    }

    // Latency constraint
    if (constraints.maxLatencyMs) {
      filtered = filtered.filter(r =>
        r.timing.totalTime <= constraints.maxLatencyMs
      );
    }

    // Privacy constraint (local only)
    if (constraints.localOnly) {
      filtered = filtered.filter(r => r.provider === 'llamacpp');
    }

    // Provider constraint
    if (constraints.provider) {
      filtered = filtered.filter(r => r.provider === constraints.provider);
    }

    return filtered;
  }

  scoreForUseCase(candidates, useCase, constraints) {
    return candidates.map(candidate => {
      // Base scores
      const qualityScore = candidate.evaluation.finalScore;
      const costScore = this.scoreCost(candidate.economics.totalCost, constraints);
      const latencyScore = this.scoreLatency(candidate.timing.totalTime, constraints);
      const consistencyScore = candidate.statistics?.consistency?.coefficientOfVariation
        ? (100 - candidate.statistics.consistency.coefficientOfVariation)
        : 50;

      // Weights based on use case
      const weights = this.getUseCaseWeights(useCase);

      // Calculate weighted total
      const totalScore =
        (qualityScore * weights.quality) +
        (costScore * weights.cost) +
        (latencyScore * weights.latency) +
        (consistencyScore * weights.consistency);

      return {
        ...candidate,
        scores: {
          quality: qualityScore,
          cost: costScore,
          latency: latencyScore,
          consistency: consistencyScore
        },
        weights,
        totalScore,
        model: candidate.modelInfo?.name || candidate.model,
        provider: candidate.modelInfo?.provider || 'unknown'
      };
    });
  }

  scoreCost(cost, constraints) {
    // Score 0-100 where lower cost = higher score
    const maxCost = constraints.maxCostPerQuery || 0.10;
    const minCost = 0.001;

    if (cost <= minCost) return 100;
    if (cost >= maxCost) return 0;

    // Logarithmic scale (cost differences matter more at low end)
    const logCost = Math.log10(cost);
    const logMin = Math.log10(minCost);
    const logMax = Math.log10(maxCost);

    return 100 * (1 - (logCost - logMin) / (logMax - logMin));
  }

  scoreLatency(latencyMs, constraints) {
    // Score 0-100 where lower latency = higher score
    const maxLatency = constraints.maxLatencyMs || 10000;
    const minLatency = 100;

    if (latencyMs <= minLatency) return 100;
    if (latencyMs >= maxLatency) return 0;

    return 100 * (1 - (latencyMs - minLatency) / (maxLatency - minLatency));
  }

  getUseCaseWeights(useCase) {
    const presets = {
      'compliance-qa': {
        quality: 0.50,      // Accuracy critical
        cost: 0.15,
        latency: 0.20,
        consistency: 0.15   // Must be reliable
      },
      'code-generation': {
        quality: 0.45,
        cost: 0.20,
        latency: 0.25,      // Developer experience
        consistency: 0.10
      },
      'data-analysis': {
        quality: 0.40,
        cost: 0.25,
        latency: 0.15,
        consistency: 0.20   // Results must be reproducible
      },
      'general-chat': {
        quality: 0.30,
        cost: 0.30,         // Cost-conscious
        latency: 0.30,      // User experience
        consistency: 0.10
      },
      'cost-optimized': {
        quality: 0.20,
        cost: 0.60,         // Cost is primary concern
        latency: 0.15,
        consistency: 0.05
      },
      'quality-first': {
        quality: 0.70,      // Quality above all
        cost: 0.05,
        latency: 0.15,
        consistency: 0.10
      }
    };

    return presets[useCase] || presets['general-chat'];
  }

  identifyStrengths(model) {
    const strengths = [];

    if (model.scores.quality >= 80) strengths.push('Excellent quality');
    if (model.scores.cost >= 80) strengths.push('Very cost-effective');
    if (model.scores.latency >= 80) strengths.push('Fast response times');
    if (model.scores.consistency >= 85) strengths.push('Highly consistent');
    if (model.provider === 'llamacpp') strengths.push('Local deployment (privacy-friendly)');

    return strengths;
  }

  identifyWeaknesses(model) {
    const weaknesses = [];

    if (model.scores.quality < 60) weaknesses.push('Lower quality scores');
    if (model.scores.cost < 50) weaknesses.push('Higher cost');
    if (model.scores.latency < 50) weaknesses.push('Slower response times');
    if (model.scores.consistency < 70) weaknesses.push('Inconsistent results');

    return weaknesses;
  }

  generateReasoning(top, constraints, useCase) {
    const parts = [];

    // Why this model
    parts.push(`${top.model} is recommended for ${useCase} because:`);

    // Quality reasoning
    if (top.scores.quality >= 70) {
      parts.push(`- Quality score of ${top.scores.quality.toFixed(1)}% meets or exceeds requirements`);
    }

    // Cost reasoning
    if (constraints.maxCostPerQuery && top.cost <= constraints.maxCostPerQuery) {
      parts.push(`- Cost of $${top.cost.toFixed(4)} per query is within budget ($${constraints.maxCostPerQuery})`);
    }

    // Latency reasoning
    if (constraints.maxLatencyMs && top.latency <= constraints.maxLatencyMs) {
      parts.push(`- Response time of ${top.latency}ms meets latency requirement`);
    }

    // Privacy reasoning
    if (constraints.localOnly && top.provider === 'llamacpp') {
      parts.push(`- Local deployment ensures data privacy`);
    }

    // Overall fit
    parts.push(`- Overall score: ${top.totalScore.toFixed(1)}/100 for this use case`);

    return parts.join('\n');
  }

  explainAlternative(alt, top) {
    if (alt.cost < top.cost * 0.7) {
      return `${((top.cost - alt.cost) / top.cost * 100).toFixed(0)}% cheaper, slightly lower quality`;
    }
    if (alt.scores.quality > top.scores.quality + 5) {
      return `Higher quality (+${(alt.scores.quality - top.scores.quality).toFixed(1)}%), but more expensive`;
    }
    if (alt.latency < top.latency * 0.7) {
      return `${((top.latency - alt.latency) / top.latency * 100).toFixed(0)}% faster response time`;
    }
    return `Different tradeoff: quality ${alt.scores.quality.toFixed(0)}%, cost $${alt.cost.toFixed(4)}`;
  }

  analyzeTradeoffs(ranked) {
    // Find Pareto frontier (models that are not dominated by others)
    const paretoFrontier = [];

    for (const model of ranked) {
      const isDominated = ranked.some(other =>
        other !== model &&
        other.scores.quality >= model.scores.quality &&
        other.scores.cost >= model.scores.cost &&
        (other.scores.quality > model.scores.quality || other.scores.cost > model.scores.cost)
      );

      if (!isDominated) {
        paretoFrontier.push(model);
      }
    }

    return {
      paretoOptimal: paretoFrontier.map(m => ({
        model: m.model,
        quality: m.scores.quality,
        cost: m.cost,
        latency: m.latency
      })),
      dominated: ranked.length - paretoFrontier.length,
      message: paretoFrontier.length === 1
        ? 'Clear winner - dominates all other options'
        : `${paretoFrontier.length} models on efficiency frontier - choice depends on priorities`
    };
  }

  generateCostAnalysis(top, alternatives) {
    const volumes = [100, 1000, 10000, 100000];  // Queries per month

    const costProjections = [top, ...alternatives].map(model => ({
      model: model.model,
      costPerQuery: model.cost,
      monthlyCosts: volumes.map(v => ({
        volume: v,
        cost: v * model.cost,
        vs TopChoice: v * (model.cost - top.cost)
      }))
    }));

    return {
      costProjections,
      breakEvenAnalysis: this.calculateBreakEven(top, alternatives[0]),
      recommendation: `At ${this.estimateBreakEvenVolume(top, alternatives[0])} queries/month, ${alternatives[0]?.model || 'alternative'} becomes more cost-effective`
    };
  }

  calculateBreakEven(modelA, modelB) {
    if (!modelB) return null;

    // Simplified: assumes no fixed costs, only per-query costs
    // In reality, consider infrastructure costs for local models
    const costDiff = Math.abs(modelA.cost - modelB.cost);
    if (costDiff < 0.0001) return { breakEven: 'never', reason: 'Costs are nearly identical' };

    return {
      cheaperModel: modelA.cost < modelB.cost ? modelA.model : modelB.model,
      expensiveModel: modelA.cost > modelB.cost ? modelA.model : modelB.model,
      costDifferencePerQuery: costDiff,
      note: 'Break-even depends on fixed infrastructure costs not measured in tests'
    };
  }

  estimateBreakEvenVolume(modelA, modelB) {
    if (!modelB) return 'N/A';
    const costDiff = Math.abs(modelA.cost - modelB.cost);
    if (costDiff < 0.0001) return 'N/A';

    // Assume $1000 infrastructure difference (local setup)
    const infrastructureCost = 1000;
    return Math.ceil(infrastructureCost / costDiff);
  }

  suggestRelaxedConstraints(constraints) {
    const suggestions = [];

    if (constraints.maxCostPerQuery) {
      suggestions.push({
        constraint: 'maxCostPerQuery',
        current: constraints.maxCostPerQuery,
        suggested: constraints.maxCostPerQuery * 2,
        reason: 'Doubling cost budget would enable higher-quality models'
      });
    }

    if (constraints.minQualityScore) {
      suggestions.push({
        constraint: 'minQualityScore',
        current: constraints.minQualityScore,
        suggested: constraints.minQualityScore - 10,
        reason: 'Lowering quality threshold by 10% would provide more options'
      });
    }

    if (constraints.localOnly) {
      suggestions.push({
        constraint: 'localOnly',
        current: true,
        suggested: false,
        reason: 'Allowing cloud models would significantly expand options'
      });
    }

    return suggestions;
  }

  /**
   * Generate decision matrix for all models
   * @returns {Array} Decision matrix with all models ranked for different use cases
   */
  generateDecisionMatrix() {
    const useCases = [
      'compliance-qa',
      'code-generation',
      'data-analysis',
      'general-chat',
      'cost-optimized',
      'quality-first'
    ];

    const matrix = [];

    for (const useCase of useCases) {
      const recommendation = this.recommend({ useCase });
      if (recommendation.recommendation) {
        matrix.push({
          useCase,
          bestModel: recommendation.recommendation.model,
          qualityScore: recommendation.recommendation.qualityScore,
          costPerQuery: recommendation.recommendation.costPerQuery,
          reasoning: recommendation.reasoning
        });
      }
    }

    return matrix;
  }
}
```

**Direct Impact**:
- Automated model recommendations
- Constraint-based filtering (cost, quality, latency)
- Use-case specific scoring
- Tradeoff analysis (Pareto frontier)

**Indirect Impact**:
- Reduces decision fatigue
- Justifiable recommendations (with reasoning)
- Break-even analysis for cost decisions
- Enables "what-if" scenario planning

---

#### E5.2: Decision Matrix Formatter

**File**: `results-formatter/decision-matrix.js` (NEW - 250 lines)

**Purpose**: Generate human-readable decision matrix ("Use model X for task Y")

**Implementation**:
```javascript
/**
 * Decision Matrix Formatter
 * Generates human-readable decision guidance
 */

import { DecisionEngine } from '../utils/decision-engine.js';

export class DecisionMatrixFormatter {
  constructor(testResults) {
    this.results = testResults;
    this.engine = new DecisionEngine(testResults);
  }

  /**
   * Generate markdown decision matrix
   * @returns {string} Markdown formatted decision guide
   */
  generateMarkdown() {
    const sections = [];

    sections.push(this.generateHeader());
    sections.push(this.generateExecutiveSummary());
    sections.push(this.generateUseCaseRecommendations());
    sections.push(this.generateConstraintScenarios());
    sections.push(this.generateCostComparison());
    sections.push(this.generateQualityRankings());
    sections.push(this.generateDecisionTree());

    return sections.join('\n\n---\n\n');
  }

  generateHeader() {
    return `# LLM Model Selection Guide

**Generated:** ${new Date().toISOString()}
**Test Results:** ${this.results.length} tests across ${this.getModelCount()} models
**Version:** ${this.results[0]?.version || '1.0.0'}

This guide helps you choose the best LLM model for your specific use case and constraints.`;
  }

  generateExecutiveSummary() {
    const topOverall = this.getTopModelOverall();
    const cheapest = this.getCheapestModel();
    const fastest = this.getFastestModel();
    const mostConsistent = this.getMostConsistentModel();

    return `## Executive Summary

- **Best Overall**: ${topOverall.model} (Quality: ${topOverall.quality.toFixed(1)}%, Cost: $${topOverall.cost.toFixed(4)}/query)
- **Most Cost-Effective**: ${cheapest.model} ($${cheapest.cost.toFixed(4)}/query)
- **Fastest**: ${fastest.model} (${fastest.latency}ms average)
- **Most Consistent**: ${mostConsistent.model} (CV: ${mostConsistent.cv.toFixed(1)}%)`;
  }

  generateUseCaseRecommendations() {
    const useCases = [
      { id: 'compliance-qa', name: 'Compliance & Legal Q&A', description: 'Answering regulatory questions, must be accurate' },
      { id: 'code-generation', name: 'Code Generation', description: 'Writing code, debugging, code review' },
      { id: 'data-analysis', name: 'Data Analysis', description: 'Analyzing data, generating insights' },
      { id: 'general-chat', name: 'General Chat', description: 'Customer support, general inquiries' },
      { id: 'cost-optimized', name: 'Cost-Optimized', description: 'Minimize cost while maintaining acceptable quality' },
      { id: 'quality-first', name: 'Quality-First', description: 'Maximum quality, cost is secondary' }
    ];

    let output = '## Recommended Models by Use Case\n\n';

    for (const useCase of useCases) {
      const rec = this.engine.recommend({ useCase: useCase.id });

      if (rec.recommendation) {
        output += `### ${useCase.name}\n\n`;
        output += `*${useCase.description}*\n\n`;
        output += `**Recommended: ${rec.recommendation.model}**\n\n`;
        output += `- Quality Score: ${rec.recommendation.qualityScore.toFixed(1)}%\n`;
        output += `- Cost per Query: $${rec.recommendation.costPerQuery.toFixed(4)}\n`;
        output += `- Average Latency: ${rec.recommendation.latency}ms\n\n`;
        output += `**Why this model:**\n${rec.reasoning}\n\n`;

        if (rec.alternatives.length > 0) {
          output += `**Alternatives:**\n`;
          for (const alt of rec.alternatives) {
            output += `- ${alt.model}: ${alt.reason}\n`;
          }
          output += '\n';
        }
      }
    }

    return output;
  }

  generateConstraintScenarios() {
    const scenarios = [
      { name: 'Budget Constrained', constraints: { maxCostPerQuery: 0.005 } },
      { name: 'Quality Required', constraints: { minQualityScore: 80 } },
      { name: 'Fast Response Required', constraints: { maxLatencyMs: 2000 } },
      { name: 'Privacy Critical (Local Only)', constraints: { localOnly: true } },
      { name: 'Balanced', constraints: { maxCostPerQuery: 0.02, minQualityScore: 70 } }
    ];

    let output = '## Model Selection by Constraints\n\n';

    for (const scenario of scenarios) {
      const rec = this.engine.recommend({
        useCase: 'general-chat',
        constraints: scenario.constraints
      });

      output += `### ${scenario.name}\n\n`;
      output += `**Constraints:** ${JSON.stringify(scenario.constraints)}\n\n`;

      if (rec.recommendation) {
        output += `**Recommended:** ${rec.recommendation.model}\n`;
        output += `- Meets all constraints\n`;
        output += `- Quality: ${rec.recommendation.qualityScore.toFixed(1)}%\n`;
        output += `- Cost: $${rec.recommendation.costPerQuery.toFixed(4)}/query\n\n`;
      } else {
        output += `**No models meet these constraints**\n\n`;
        output += `**Consider relaxing:**\n`;
        for (const suggestion of rec.relaxedSuggestions || []) {
          output += `- ${suggestion.constraint}: ${suggestion.reason}\n`;
        }
        output += '\n';
      }
    }

    return output;
  }

  generateCostComparison() {
    const models = this.aggregateByModel();
    const volumes = [100, 1000, 10000, 100000];

    let output = '## Cost Comparison\n\n';
    output += '| Model | Cost/Query | 100 queries/mo | 1K queries/mo | 10K queries/mo | 100K queries/mo |\n';
    output += '|-------|------------|----------------|---------------|----------------|------------------|\n';

    for (const model of models) {
      const costs = volumes.map(v => `$${(v * model.avgCost).toFixed(2)}`);
      output += `| ${model.name} | $${model.avgCost.toFixed(4)} | ${costs.join(' | ')} |\n`;
    }

    return output;
  }

  generateQualityRankings() {
    const models = this.aggregateByModel().sort((a, b) => b.avgQuality - a.avgQuality);

    let output = '## Quality Rankings\n\n';
    output += '| Rank | Model | Avg Quality | Consistency | Cost Efficiency |\n';
    output += '|------|-------|-------------|-------------|------------------|\n';

    models.forEach((model, i) => {
      const efficiency = (model.avgQuality / model.avgCost).toFixed(0);
      output += `| ${i + 1} | ${model.name} | ${model.avgQuality.toFixed(1)}% | ${model.consistency} | ${efficiency} pts/$ |\n`;
    });

    return output;
  }

  generateDecisionTree() {
    return `## Decision Tree

\`\`\`
Start: What's most important to you?

├─ Cost is critical (< $0.005/query)
│  └─ Use: ${this.getCheapestModel().model}
│
├─ Quality is critical (> 80% accuracy)
│  ├─ Can use cloud?
│  │  └─ Yes → ${this.getTopCloudModel().model}
│  └─ No (local only) → ${this.getTopLocalModel().model}
│
├─ Speed is critical (< 2s response)
│  └─ Use: ${this.getFastestModel().model}
│
├─ Privacy is critical (data stays local)
│  └─ Use: ${this.getTopLocalModel().model}
│
└─ Balanced (good enough at everything)
   └─ Use: ${this.getTopModelOverall().model}
\`\`\``;
  }

  // Helper methods
  getModelCount() {
    return new Set(this.results.map(r => r.modelInfo?.id || r.model)).size;
  }

  getTopModelOverall() {
    const rec = this.engine.recommend({ useCase: 'general-chat' });
    return {
      model: rec.recommendation.model,
      quality: rec.recommendation.qualityScore,
      cost: rec.recommendation.costPerQuery
    };
  }

  getCheapestModel() {
    const sorted = [...this.results].sort((a, b) => a.economics.totalCost - b.economics.totalCost);
    return {
      model: sorted[0].modelInfo?.name || sorted[0].model,
      cost: sorted[0].economics.totalCost
    };
  }

  getFastestModel() {
    const sorted = [...this.results].sort((a, b) => a.timing.totalTime - b.timing.totalTime);
    return {
      model: sorted[0].modelInfo?.name || sorted[0].model,
      latency: sorted[0].timing.totalTime
    };
  }

  getMostConsistentModel() {
    const models = this.aggregateByModel().sort((a, b) => a.cv - b.cv);
    return {
      model: models[0].name,
      cv: models[0].cv
    };
  }

  getTopCloudModel() {
    const cloudResults = this.results.filter(r => r.provider !== 'llamacpp');
    const rec = this.engine.recommend({
      useCase: 'quality-first',
      constraints: { provider: 'cloud' }
    });
    return {
      model: rec.recommendation?.model || 'N/A'
    };
  }

  getTopLocalModel() {
    const rec = this.engine.recommend({
      useCase: 'quality-first',
      constraints: { localOnly: true }
    });
    return {
      model: rec.recommendation?.model || 'N/A'
    };
  }

  aggregateByModel() {
    const byModel = {};

    for (const result of this.results) {
      const modelId = result.modelInfo?.id || result.model;
      if (!byModel[modelId]) {
        byModel[modelId] = {
          name: result.modelInfo?.name || modelId,
          qualities: [],
          costs: [],
          latencies: [],
          cvs: []
        };
      }

      byModel[modelId].qualities.push(result.evaluation.finalScore);
      byModel[modelId].costs.push(result.economics.totalCost);
      byModel[modelId].latencies.push(result.timing.totalTime);

      if (result.statistics?.consistency) {
        byModel[modelId].cvs.push(result.statistics.consistency.coefficientOfVariation);
      }
    }

    // Calculate averages
    return Object.values(byModel).map(m => ({
      name: m.name,
      avgQuality: m.qualities.reduce((sum, q) => sum + q, 0) / m.qualities.length,
      avgCost: m.costs.reduce((sum, c) => sum + c, 0) / m.costs.length,
      avgLatency: m.latencies.reduce((sum, l) => sum + l, 0) / m.latencies.length,
      cv: m.cvs.length > 0
        ? m.cvs.reduce((sum, cv) => sum + cv, 0) / m.cvs.length
        : 0,
      consistency: m.cvs.length > 0
        ? (m.cvs.reduce((sum, cv) => sum + cv, 0) / m.cvs.length < 10 ? 'Excellent' : 'Good')
        : 'Unknown'
    }));
  }
}
```

**Direct Impact**:
- Human-readable recommendations
- Use-case specific guidance
- Constraint-based scenarios
- Decision tree for quick selection

**Indirect Impact**:
- Non-technical users can make informed decisions
- Documents reasoning (audit trail)
- Shareable with stakeholders
- Marketing material for benchmarking service

---

#### E5.3: Cost/Quality Chart Generator

**File**: `results-formatter/cost-quality-charts.js` (NEW - 400 lines)

**Purpose**: Generate HTML/SVG charts showing cost vs quality tradeoffs

**Implementation Outline**:
```javascript
/**
 * Cost/Quality Chart Generator
 * Creates visual scatter plots and efficiency frontiers
 */

export class CostQualityChartGenerator {
  constructor(testResults) {
    this.results = testResults;
  }

  /**
   * Generate HTML page with interactive charts
   * @returns {string} HTML with embedded Chart.js or D3.js visualizations
   */
  generateHTML() {
    // Generate multiple charts:
    // 1. Cost vs Quality scatter plot
    // 2. Pareto efficiency frontier
    // 3. Quality distribution by model
    // 4. Cost distribution by model
    // 5. Latency vs Quality
    // 6. Consistency ratings

    return `<!DOCTYPE html>
<html>
<head>
  <title>LLM Benchmark - Cost/Quality Analysis</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .chart-container { width: 800px; height: 600px; margin: 40px auto; }
    h2 { text-align: center; }
  </style>
</head>
<body>
  <h1>LLM Benchmark Results</h1>

  <div class="chart-container">
    <h2>Cost vs Quality</h2>
    <canvas id="costQualityChart"></canvas>
  </div>

  <div class="chart-container">
    <h2>Efficiency Frontier</h2>
    <canvas id="paretoChart"></canvas>
  </div>

  <script>
    ${this.generateChartJS()}
  </script>
</body>
</html>`;
  }

  generateChartJS() {
    const data = this.aggregateData();

    return `
    // Cost vs Quality Scatter
    const costQualityCtx = document.getElementById('costQualityChart').getContext('2d');
    new Chart(costQualityCtx, {
      type: 'scatter',
      data: {
        datasets: ${JSON.stringify(data.costQualityDatasets)}
      },
      options: {
        scales: {
          x: {
            type: 'logarithmic',
            title: { display: true, text: 'Cost per Query ($)' }
          },
          y: {
            title: { display: true, text: 'Quality Score (%)' }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': $' + context.parsed.x.toFixed(4) + ', ' + context.parsed.y.toFixed(1) + '%';
              }
            }
          }
        }
      }
    });

    // Pareto Frontier
    const paretoCtx = document.getElementById('paretoChart').getContext('2d');
    new Chart(paretoCtx, {
      type: 'line',
      data: {
        datasets: ${JSON.stringify(data.paretoDatasets)}
      },
      options: {
        scales: {
          x: {
            title: { display: true, text: 'Cost per Query ($)' }
          },
          y: {
            title: { display: true, text: 'Quality Score (%)' }
          }
        }
      }
    });
    `;
  }

  aggregateData() {
    // Process results into chart-friendly format
    // ...implementation details...
    return {
      costQualityDatasets: [],
      paretoDatasets: []
    };
  }
}
```

**Direct Impact**:
- Visual understanding of tradeoffs
- Interactive exploration of results
- Identify efficiency frontier
- Compare multiple dimensions

**Indirect Impact**:
- Presentation-ready visualizations
- Stakeholder communication
- Publishable figures
- Blog post material

---

### Enhancement Group 6: Configuration & Profiles

#### E6.1: Test Profiles

**File**: `test-profiles/` directory with multiple JSON files

**Purpose**: Pre-configured test profiles for different goals

**Example**: `test-profiles/quick-comparison.json`
```json
{
  "name": "Quick Comparison",
  "description": "Fast comparison of top models (20 tests, ~10 minutes)",
  "models": [
    "hermes-3-llama-8b",
    "claude-sonnet-4",
    "gpt-4o"
  ],
  "tests": {
    "mode": "sample",
    "count": 20,
    "standards": ["GDPR", "ISO 27001"],
    "knowledgeTypes": ["factual", "relational", "procedural"]
  },
  "evaluation": {
    "profile": "balanced",
    "useLLMJudge": false,
    "runs": 1
  },
  "output": {
    "formats": ["json", "decision-matrix", "executive-summary"],
    "saveTo": "reports/quick-comparison/"
  }
}
```

**More profiles:**
- `rigorous-benchmark.json` - Full test suite, 5 runs, ensemble judge
- `cost-analysis.json` - Focus on cost metrics, all volume projections
- `local-only.json` - Test local models only, privacy-focused
- `cloud-comparison.json` - Compare cloud providers
- `regression-test.json` - Quick smoke test for CI/CD

**Direct Impact**:
- One-command test execution
- Consistent test configurations
- Easy to share test setups
- Reproducible benchmarks

---

## Implementation Roadmap: Dependencies & Execution Order

**Note:** Timeline is NOT specified - focus is on logical dependencies and parallel execution opportunities.

### Dependency Graph Overview

```
FOUNDATION LAYER (No dependencies - can start immediately)
├─ [A] Cost Calculator + Pricing Config
├─ [B] Improved Keyword Matcher
├─ [C] Cloud Model Client + Model Registry
├─ [D] Statistical Analyzer
└─ [E] Ground Truth Validator + Facts Dataset

INTEGRATION LAYER (Depends on Foundation)
├─ [F] Evaluation Orchestrator (depends on: A, B, E)
├─ [G] Multi-Run Orchestrator (depends on: D)
└─ [H] Test Runner Modifications (depends on: A, C, F)

OUTPUT LAYER (Depends on Integration)
├─ [I] Decision Engine (depends on: H - needs test results with all data)
├─ [J] Decision Matrix Formatter (depends on: I)
├─ [K] Cost/Quality Charts (depends on: H)
└─ [L] Executive Summary (depends on: I, J, K)

POLISH LAYER (Depends on Output)
└─ [M] Test Profiles + Documentation (depends on: all above)
```

---

### Sequential Execution: Critical Path

**This is the MINIMUM sequence that must be done in order (critical path):**

1. **Foundation → Integration → Output → Polish**

**Critical dependencies:**
- `Evaluation Orchestrator` needs `Keyword Matcher`, `Ground Truth Validator`, and `Cost Calculator`
- `Test Runner Modifications` need `Evaluation Orchestrator` to integrate
- `Decision Engine` needs `Test Runner Modifications` to have full results data
- Everything else builds on these

**Estimated Critical Path:** If done sequentially, this is the longest dependency chain that determines minimum completion time.

---

### Parallel Execution Opportunities

#### Stage 1: Foundation Layer (FULLY PARALLEL)

**Can work on ALL of these simultaneously - zero dependencies between them:**

```
┌─────────────────────────────────────────────────────────────┐
│ Stage 1: Foundation (All Independent - Full Parallelization) │
└─────────────────────────────────────────────────────────────┘

[Agent 1] Cost Calculator
  - Create utils/cost-calculator.js
  - Create config/pricing.json
  - Unit test cost calculations

[Agent 2] Improved Keyword Matcher
  - Create utils/improved-keyword-matcher.js
  - Implement semantic similarity
  - Unit test matching accuracy

[Agent 3] Cloud Model Client
  - Create utils/cloud-model-client.js
  - Create config/model-registry.json
  - Test connectivity to APIs

[Agent 4] Statistical Analyzer
  - Create utils/statistical-analyzer.js
  - Implement variance/confidence intervals
  - Unit test statistical methods

[Agent 5] Ground Truth Validator
  - Create utils/ground-truth-validator.js
  - Create ground-truth/compliance-facts.json
  - Unit test factual validation

[Agent 6] LLM Judge Enhancement
  - Modify utils/cloud-llm-judge.js
  - Add ensemble mode
  - Test judge accuracy

[Agent 7] Evaluation Config
  - Create config/evaluation-config.json
  - Document configuration options
  - Create config validation
```

**Timeline Impact:** With 7 parallel agents, Stage 1 completes as fast as the slowest component (instead of 7x longer if sequential).

---

#### Stage 2: Integration Layer (PARTIALLY PARALLEL)

**Dependencies resolved, some parallelization possible:**

```
┌───────────────────────────────────────────────────────┐
│ Stage 2: Integration (After Stage 1 Complete)         │
└───────────────────────────────────────────────────────┘

DEPENDENCY REQUIREMENT: Stage 1 must be 100% complete

[Agent 1] Evaluation Orchestrator
  - Create utils/evaluation-orchestrator.js
  - Integrate: Keyword Matcher, Ground Truth, LLM Judge
  - Depends on: Cost Calculator, Keyword Matcher, Ground Truth Validator
  - CAN START: As soon as those 3 are done

[Agent 2] Multi-Run Orchestrator
  - Create utils/multi-run-orchestrator.js
  - Integrate: Statistical Analyzer
  - Depends on: Statistical Analyzer only
  - CAN START: As soon as Statistical Analyzer is done

[Agent 3] Test Runner Modifications
  - Modify enterprise-test-runner.js
  - Integrate: Cost Calculator, Cloud Client, Evaluation Orchestrator
  - Depends on: Evaluation Orchestrator (BLOCKS on Agent 1)
  - CAN START: After Evaluation Orchestrator complete
```

**Parallelization:** Agents 1 and 2 can run in parallel. Agent 3 must wait for Agent 1.

---

#### Stage 3: Output Layer (PARTIALLY PARALLEL)

**Needs test runner producing full results, then can parallelize output formats:**

```
┌───────────────────────────────────────────────────────┐
│ Stage 3: Output Formats (After Stage 2 Complete)      │
└───────────────────────────────────────────────────────┘

DEPENDENCY REQUIREMENT: Test Runner must produce results with all new data

[Agent 1] Decision Engine
  - Create utils/decision-engine.js
  - Analyze test results
  - Generate recommendations
  - Depends on: Full test results from modified runner
  - CRITICAL PATH: Blocks downstream formatters

[These 3 can run in parallel AFTER Decision Engine completes:]

[Agent 2] Decision Matrix Formatter
  - Create results-formatter/decision-matrix.js
  - Generate markdown decision guide
  - Depends on: Decision Engine

[Agent 3] Cost/Quality Charts
  - Create results-formatter/cost-quality-charts.js
  - Generate HTML visualizations
  - Depends on: Test results (can start with raw results OR wait for Decision Engine)

[Agent 4] Executive Summary
  - Create results-formatter/executive-summary.js
  - High-level report generation
  - Depends on: Decision Engine, Decision Matrix
```

**Parallelization:** After Decision Engine completes, Agents 2-4 are fully parallel.

---

#### Stage 4: Polish Layer (MOSTLY PARALLEL)

**Final integration, documentation, and profiles:**

```
┌───────────────────────────────────────────────────────┐
│ Stage 4: Polish (After Stage 3 Complete)              │
└───────────────────────────────────────────────────────┘

DEPENDENCY REQUIREMENT: All core functionality must work end-to-end

[Agent 1] Test Profiles
  - Create test-profiles/*.json
  - Define: quick-comparison, rigorous-benchmark, cost-analysis, etc.
  - Depends on: All features working

[Agent 2] Documentation Updates
  - Update README.md
  - Update TEST-EXECUTION-GUIDE.md
  - Update METRICS-DOCUMENTATION.md
  - Depends on: All features finalized

[Agent 3] Integration Tests
  - Create integration test suite
  - End-to-end validation
  - Depends on: All features working

[Agent 4] Tutorial & Examples
  - Create step-by-step guides
  - Add usage examples
  - Depends on: Documentation updates
```

**Parallelization:** Agents 1-3 can run fully in parallel. Agent 4 depends on Agent 2.

---

### Execution Strategy Recommendations

#### Option 1: Maximum Parallelization (Fastest)

```
Stage 1: Launch 7 parallel agents → Wait for ALL to complete
Stage 2: Launch 2 parallel agents (Eval Orchestrator + Multi-Run) → Wait
         Launch 1 agent (Test Runner) → Wait
Stage 3: Launch 1 agent (Decision Engine) → Wait
         Launch 3 parallel agents (formatters) → Wait
Stage 4: Launch 3 parallel agents → Wait
         Launch 1 agent (Tutorial) → Done
```

**Pros:** Minimum total time
**Cons:** Requires coordination of multiple agents/developers

---

#### Option 2: Sequential with Dependencies (Safest)

```
Follow the critical path strictly:
1. Cost Calculator
2. Keyword Matcher
3. Ground Truth Validator
4. Evaluation Orchestrator
5. Test Runner Modifications
6. Decision Engine
7. Decision Matrix Formatter
8. Documentation

(Other components fill in around these as dependencies allow)
```

**Pros:** No coordination overhead, clear order
**Cons:** Takes longer than necessary

---

#### Option 3: Hybrid (Recommended)

```
Stage 1: Build foundation components sequentially OR in small parallel batches
         (e.g., Cost Calculator + Keyword Matcher together, then Ground Truth)
Stage 2: Build integration components sequentially
         (Evaluation Orchestrator is critical path)
Stage 3: Build output components in parallel
         (All formatters can be done simultaneously)
Stage 4: Polish in parallel
```

**Pros:** Balance of speed and coordination simplicity
**Cons:** Not maximally fast, but pragmatic

---

### Incremental Value Delivery

**You can deliver value BEFORE everything is done:**

**Milestone 1: Cost Tracking Live**
- Complete: [A] Cost Calculator + [H] Test Runner integration
- **Value:** All test results now show costs → Enables cost-aware decision making
- **Blocks:** Nothing else

**Milestone 2: Improved Evaluation Live**
- Complete: [B] Keyword Matcher + [E] Ground Truth + [F] Orchestrator + [H] Integration
- **Value:** More reliable quality scores → Trust results
- **Blocks:** Decision Engine needs this

**Milestone 3: Cloud Models Live**
- Complete: [C] Cloud Client + [H] Integration
- **Value:** Compare local vs cloud → Answer "is local worth it?"
- **Blocks:** Nothing else (can run in parallel with Milestone 2)

**Milestone 4: Statistical Rigor Live**
- Complete: [D] Statistical Analyzer + [G] Multi-Run Orchestrator
- **Value:** Confidence intervals, variance → Publishable results
- **Blocks:** Nothing else

**Milestone 5: Decision Guidance Live**
- Complete: [I] Decision Engine + [J] Decision Matrix
- **Value:** Actionable recommendations → "Use model X for task Y"
- **Blocks:** Depends on Milestones 1-2

**Milestone 6: Full Platform Live**
- Complete: All components + [M] Documentation
- **Value:** Production-ready benchmarking platform

---

### Critical Path Analysis

**The LONGEST dependency chain (cannot be parallelized):**

```
Cost Calculator (A)
    ↓
Keyword Matcher (B)
    ↓
Ground Truth Validator (E)
    ↓
Evaluation Orchestrator (F) ← INTEGRATES A, B, E
    ↓
Test Runner Modifications (H) ← INTEGRATES F, C
    ↓
Decision Engine (I) ← NEEDS H OUTPUT
    ↓
Decision Matrix (J) ← NEEDS I OUTPUT
    ↓
Documentation (M) ← NEEDS J OUTPUT
```

**This is the CRITICAL PATH - the minimum time to complete everything if all else is done in parallel.**

**Everything NOT on this path can be done in parallel:**
- Cloud Model Client (C) - can build anytime, integrates at step H
- Statistical Analyzer (D) - can build anytime, used independently
- Multi-Run Orchestrator (G) - can build after D
- Cost/Quality Charts (K) - can build after H
- Executive Summary (L) - can build after I

---

### Dependency Matrix

| Component | Depends On | Blocks |
|-----------|-----------|---------|
| **A: Cost Calculator** | None | F, H, I |
| **B: Keyword Matcher** | None | F, H |
| **C: Cloud Client** | None | H |
| **D: Statistical Analyzer** | None | G |
| **E: Ground Truth** | None | F, H |
| **F: Eval Orchestrator** | A, B, E | H |
| **G: Multi-Run Orchestrator** | D | None |
| **H: Test Runner Mods** | A, C, F | I, K |
| **I: Decision Engine** | H | J, L |
| **J: Decision Matrix** | I | M |
| **K: Cost/Quality Charts** | H | L |
| **L: Executive Summary** | I, J, K | M |
| **M: Documentation** | All | None |

**Read this as:**
- "Cost Calculator depends on nothing, but blocks Eval Orchestrator, Test Runner, and Decision Engine"
- "Test Runner Mods depends on Cost Calculator, Cloud Client, and Eval Orchestrator"

---

### Recommended Execution Order

**If building sequentially, follow this order for optimal dependencies:**

1. `config/pricing.json`
2. `utils/cost-calculator.js`
3. `utils/improved-keyword-matcher.js`
4. `utils/ground-truth-validator.js` + `ground-truth/compliance-facts.json`
5. `utils/cloud-llm-judge.js` (modify existing)
6. `config/evaluation-config.json`
7. `utils/evaluation-orchestrator.js`
8. `config/model-registry.json`
9. `utils/cloud-model-client.js`
10. `enterprise-test-runner.js` (modify - integrate cost, eval, cloud)
11. `utils/statistical-analyzer.js`
12. `utils/multi-run-orchestrator.js`
13. `utils/decision-engine.js`
14. `results-formatter/decision-matrix.js`
15. `results-formatter/cost-quality-charts.js`
16. `results-formatter/executive-summary.js`
17. `test-profiles/*.json`
18. Documentation updates (README, TEST-EXECUTION-GUIDE, METRICS-DOCUMENTATION)

**If building in parallel, follow the stage breakdowns above.**

---

## Testing Strategy

### Unit Tests

**For each new utility:**
```bash
# Example: Cost calculator
npm test utils/cost-calculator.test.js

# Should verify:
- Correct cost calculations for local models
- Correct cost calculations for cloud models
- Throughput cost projections
- Cost comparisons
```

### Integration Tests

**Test evaluation pipeline:**
```bash
npm test integration/evaluation-pipeline.test.js

# Should verify:
- Keyword stage works
- Ground truth stage works
- LLM judge stage works
- Stages integrate correctly
- Cost tracking works end-to-end
```

### End-to-End Tests

**Full test run:**
```bash
# Run quick comparison profile
npm run test:profile quick-comparison

# Should produce:
- Test results with all metrics
- Decision matrix
- Cost/quality charts
- Executive summary

# Verify manually:
- Results make sense
- Recommendations are reasonable
- Charts display correctly
```

---

## Configuration Guide

### Environment Variables Required

```bash
# Cloud API Keys (optional - only if testing cloud models)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Cost Calculation (optional - defaults provided)
ELECTRICITY_RATE=0.15  # $/kWh
HARDWARE_AMORTIZATION=2.50  # $/hour
```

### Custom Pricing Configuration

Edit `config/pricing.json`:
```json
{
  "local": {
    "your-custom-model": {
      "watts": 60,
      "electricityRate": 0.20,  // Your actual rate
      "hardwareAmortization": 3.00,  // Your HW cost
      "estimatedCostPerQuery": 0.0025
    }
  }
}
```

### Custom Evaluation Configuration

Edit `config/evaluation-config.json`:
```json
{
  "stages": {
    "llmJudge": {
      "enabled": true,
      "defaultModel": "claude-sonnet-4",
      "ensembleMode": true,  // Use multiple judges
      "costLimit": {
        "perEvaluation": 0.02,  // Max cost per evaluation
        "dailyBudget": 50.00  // Max spend per day
      }
    }
  }
}
```

### Creating Custom Test Profiles

Create `test-profiles/my-profile.json`:
```json
{
  "name": "My Custom Profile",
  "description": "Test setup for my specific needs",
  "models": ["model-1", "model-2"],
  "tests": {
    "mode": "sample",
    "count": 30
  },
  "evaluation": {
    "profile": "rigorous"
  },
  "output": {
    "formats": ["decision-matrix", "charts"]
  }
}
```

Run with:
```bash
npm run test:profile my-profile
```

---

## Impact Analysis Matrix

| Enhancement | Direct Impact | Indirect Impact | Risk | Effort |
|-------------|---------------|-----------------|------|--------|
| **E1: Cost Tracking** | Enable cost/benefit decisions | Drive all downstream cost analysis | Low | Low |
| **E2: Multi-Layer Evaluation** | Reliable quality assessment | Publishable results, trusted recommendations | Medium | High |
| **E3: Cloud Integration** | Local vs cloud comparison | Prove ROI of local deployment | Low | Medium |
| **E4: Statistical Analysis** | Confidence in results | Academic credibility | Low | Medium |
| **E5: Decision Engine** | Actionable recommendations | Reduced decision fatigue | Low | Medium |
| **E6: Ground Truth Dataset** | Factual accuracy validation | Community contribution, model training | Medium | High |

---

## Success Metrics

### Functional Metrics

- ✅ All tests produce cost data
- ✅ Evaluation confidence > 0.8 on average
- ✅ Cloud models test successfully
- ✅ 95% confidence intervals on all scores
- ✅ Decision engine produces recommendations for all use cases

### Quality Metrics

- ✅ < 5% false positive rate (wrong pass/fail)
- ✅ < 10% coefficient of variation (consistency)
- ✅ > 90% coverage of compliance standards
- ✅ Ground truth dataset: > 100 verified facts

### Usability Metrics

- ✅ New user can run test in < 5 minutes
- ✅ Results understandable without technical knowledge
- ✅ Decision matrix produces clear recommendations
- ✅ Visualizations are presentation-ready

---

## Conclusion

This enhancement plan transforms the LLM test suite from a compliance diagnostic tool into a **production-grade, configurable benchmarking platform** that enables enterprises to make data-driven decisions about LLM deployments.

**Key Differentiators:**
1. **Multi-dimensional measurement** - Quality, cost, speed, consistency
2. **Practical recommendations** - Not just scores, but actionable guidance
3. **Statistical rigor** - Publishable results with confidence intervals
4. **Flexible configuration** - Adapt to different testing goals
5. **Both local and cloud** - Compare all deployment options

**Next Steps:**
1. Review this plan with stakeholders
2. Prioritize phases based on business needs
3. Begin Phase 1 implementation
4. Iterate based on real-world usage feedback
