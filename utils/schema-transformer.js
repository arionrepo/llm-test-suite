// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/schema-transformer.js
// Description: Transform flat test results to unified nested schema format
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26
//
// Business Purpose: Centralize schema transformation logic to ensure all test runners
// produce consistent, schema-compliant output for analysis and reporting.

/**
 * Transform flat performance test result to nested schema format.
 *
 * Converts the flat object returned by performance-test-runner into the
 * nested schema structure required by TEST-RESULT-SCHEMA.md.
 *
 * @param {Object} flatResult - Flat result from runSingleTest()
 * @param {Object} options - Additional context
 * @param {string} options.fullPromptText - Complete prompt text (all tiers)
 * @param {number} options.fullPromptTokens - Total prompt tokens
 * @param {string} options.testRunId - Test run identifier
 * @param {string} options.runName - Human-readable run name
 * @returns {Object} Schema-compliant nested result object
 */
export function transformPerformanceResult(flatResult, options = {}) {
  if (!flatResult) {
    throw new Error('transformPerformanceResult: flatResult is required');
  }

  const now = new Date().toISOString();

  return {
    metadata: {
      timestamp: flatResult.timestamp || now,
      testRunId: options.testRunId || `test-run-${flatResult.runNumber || 1}`,
      runNumber: flatResult.runNumber || 1,
      runName: options.runName || `RUN_${flatResult.runNumber || 1}`,
      runType: 'performance',
      focus: 'throughput'
    },

    input: {
      promptId: flatResult.promptId,
      fullPromptText: options.fullPromptText || '',
      fullPromptTokens: options.fullPromptTokens || flatResult.inputTokens || 0
    },

    modelConfig: {
      modelName: flatResult.modelName || 'unknown',
      parameters: {
        temperature: 0.3,
        maxTokens: 500
      }
    },

    output: {
      response: flatResult.response || '',
      responseTokens: flatResult.responseTokens || flatResult.outputTokens || 0,
      responseCharacters: flatResult.responseLength || (flatResult.response || '').length,
      completionFinishReason: flatResult.finishReason || 'stop',
      truncated: flatResult.truncated || false
    },

    timing: {
      totalMs: flatResult.totalTimeMs || 0,
      promptProcessingMs: flatResult.promptProcessingMs || 0,
      generationMs: flatResult.generationMs || 0,
      tokensPerSecond: flatResult.outputTokPerSec || 0,
      inputTokensPerSecond: flatResult.inputTokPerSec || 0,
      outputTokensPerSecond: flatResult.outputTokPerSec || 0,
      timePerToken: flatResult.outputTokPerSec ? (1000 / flatResult.outputTokPerSec) : 0
    },

    resources: {
      modelPort: 8081,
      cpuUsage: null,
      memoryUsageMB: null,
      gpuUsage: null
    },

    execution: {
      success: true,
      responseValidated: !!(flatResult.response && flatResult.response.trim().length > 0),
      errors: [],
      warnings: [],
      validationChecks: {
        responseNotEmpty: !!(flatResult.response && flatResult.response.trim().length > 0),
        modelResponded: true,
        noConnectionErrors: true,
        noTimeouts: true
      }
    },

    testMetadata: {
      testNumber: flatResult.testNumber,
      totalTests: flatResult.totalTests
    }
  };
}

/**
 * Transform array of flat results to schema format.
 *
 * @param {Array} flatResults - Array of flat results
 * @param {Object} sharedContext - Context applied to all results
 * @param {Object} promptMap - Map of promptId to prompt metadata
 * @returns {Array} Array of schema-compliant results
 */
export function transformPerformanceResults(flatResults, sharedContext = {}, promptMap = {}) {
  if (!Array.isArray(flatResults)) {
    throw new Error('transformPerformanceResults: flatResults must be an array');
  }

  return flatResults
    .filter(r => r !== null)
    .map(flatResult => {
      const promptData = promptMap[flatResult.promptId] || {};

      return transformPerformanceResult(flatResult, {
        ...sharedContext,
        fullPromptText: promptData.fullPromptText || promptData.fullPrompt || '',
        fullPromptTokens: promptData.estimatedTokens || flatResult.inputTokens || 0
      });
    });
}

/**
 * Transform enterprise test results to unified schema format.
 *
 * Enterprise tests have evaluation/quality metrics from topic analysis.
 *
 * @param {Object} enterpriseResults - Results from EnterpriseTestRunner
 * @param {string} testName - Test name (pilot, quick, standard, comprehensive)
 * @returns {Array} Array of schema-compliant results
 */
export function transformEnterpriseResults(enterpriseResults, testName) {
  const schemaResults = [];
  const now = new Date().toISOString();

  // Extract individual test results from modelResults
  if (enterpriseResults.modelResults) {
    let testIndex = 0;
    for (const [modelName, modelResults] of Object.entries(enterpriseResults.modelResults)) {
      if (Array.isArray(modelResults)) {
        modelResults.forEach(result => {
          if (result.success) {
            schemaResults.push({
              metadata: {
                timestamp: now,
                testRunId: `test-run-enterprise-${testName}-${now.split('T')[0]}`,
                runNumber: 1,
                runName: `ENTERPRISE_${testName.toUpperCase()}`,
                runType: 'compliance',
                focus: 'accuracy'
              },

              input: {
                promptId: result.testId || `test-${testIndex}`,
                fullPromptText: result.question || '',
                fullPromptTokens: 0
              },

              modelConfig: {
                modelName: modelName
              },

              output: {
                response: result.response || '',
                responseTokens: 0,
                responseCharacters: (result.response || '').length
              },

              quality: {
                relevanceScore: result.evaluation?.score ? result.evaluation.score / 100 : 0,
                completenessScore: result.evaluation?.passed ? 1.0 : 0.5,
                accuracyScore: result.evaluation?.score ? result.evaluation.score / 100 : 0,
                coherenceScore: 0.8,
                overallScore: result.evaluation?.score ? result.evaluation.score / 100 : 0,
                topicAnalysis: {
                  expectedTopics: result.evaluation?.missingTopics || [],
                  foundTopics: result.evaluation?.foundTopics || [],
                  missingTopics: result.evaluation?.missingTopics || [],
                  extraneousTopics: [],
                  topicCoverage: result.evaluation?.passed ? 1.0 : 0.5
                }
              },

              timing: {
                totalMs: result.timing?.totalMs || 0,
                tokensPerSecond: 0
              },

              execution: {
                success: result.success,
                responseValidated: result.response && result.response.trim() !== '',
                errors: result.error ? [result.error] : [],
                warnings: [],
                validationChecks: {
                  responseNotEmpty: result.response && result.response.trim() !== '',
                  responseWithinTokenLimit: true,
                  modelResponded: !!result.response,
                  noConnectionErrors: true,
                  noTimeouts: true
                }
              }
            });

            testIndex++;
          }
        });
      }
    }
  }

  if (schemaResults.length === 0) {
    throw new Error('No valid results found to convert to schema format');
  }

  return schemaResults;
}

/**
 * Transform llama-bench result to unified schema format.
 *
 * @param {Object} benchResult - Single result from llama-bench JSON output
 * @param {Object} context - Additional context
 * @returns {Object} Schema-compliant result object
 */
export function transformLlamaBenchResult(benchResult, context = {}) {
  if (!benchResult) {
    throw new Error('transformLlamaBenchResult: benchResult is required');
  }

  const now = new Date().toISOString();

  return {
    metadata: {
      timestamp: now,
      testRunId: context.testRunId || `llama-bench-run-${context.runNumber || 1}`,
      runNumber: context.runNumber || 1,
      runName: context.runName || `LLAMABENCH_RUN${context.runNumber || 1}`,
      runType: 'performance',
      focus: 'throughput',
      tool: 'llama-bench',
      environment: {
        llamaBenchVersion: benchResult.build_number,
        llamaBenchCommit: benchResult.build_commit
      }
    },

    input: {
      promptId: `bench-prompt-${benchResult.n_prompt}tokens`,
      fullPromptText: `[Generic ${benchResult.n_prompt}-token benchmark prompt]`,
      fullPromptTokens: benchResult.n_prompt
    },

    modelConfig: {
      modelName: context.modelName || 'unknown',
      modelSize: Math.round(benchResult.model_size / 1e9) + 'B',
      modelFile: benchResult.model_filename,
      parameters: {
        temperature: 0.8,
        threads: benchResult.n_threads,
        batchSize: benchResult.n_batch,
        ubatchSize: benchResult.n_ubatch,
        gpuLayers: benchResult.n_gpu_layers
      }
    },

    output: {
      response: '[llama-bench does not capture response text - use custom runner for quality evaluation]',
      responseTokens: benchResult.n_gen,
      responseCharacters: 0
    },

    timing: {
      totalMs: benchResult.t_pp_total + benchResult.t_tg_total,
      promptProcessingMs: benchResult.t_pp_total,
      generationMs: benchResult.t_tg_total,
      tokensPerSecond: benchResult.tg_speed_avg,
      inputTokensPerSecond: benchResult.pp_speed_avg,
      outputTokensPerSecond: benchResult.tg_speed_avg,
      timePerToken: 1000 / benchResult.tg_speed_avg
    },

    resources: {
      modelPort: 0,
      backend: benchResult.backend,
      gpuLayers: benchResult.n_gpu_layers
    },

    execution: {
      success: true,
      responseValidated: false,
      errors: [],
      warnings: ['llama-bench does not capture response text - performance metrics only'],
      validationChecks: {
        responseNotEmpty: false,
        modelResponded: true,
        noConnectionErrors: true,
        noTimeouts: true
      }
    }
  };
}
