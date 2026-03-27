// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/llama-bench-client.js
// Description: Modular wrapper for llama-bench utility - authoritative performance benchmarking
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26
//
// Business Purpose: Leverage official llama.cpp benchmarking tool for
// authoritative performance measurements without HTTP overhead.

import { exec } from 'child_process';
import { promisify } from 'util';
import { transformLlamaBenchResult } from './schema-transformer.js';

const execAsync = promisify(exec);

/**
 * Wrapper for llama-bench utility.
 *
 * Provides authoritative performance measurements using the official
 * llama.cpp benchmarking tool. Results are automatically transformed
 * to unified schema format.
 *
 * Example:
 *   const bench = new LlamaBenchClient();
 *   const results = await bench.benchmark('phi3', {
 *     promptSizes: [10, 100, 512, 2000],
 *     generations: [128],
 *     repetitions: 5
 *   });
 */
export class LlamaBenchClient {
  constructor() {
    this.llamaBenchPath = '/opt/homebrew/bin/llama-bench';
    this.modelBasePath = null;
  }

  /**
   * Find model file path for a given model name.
   *
   * Uses llamacpp-manager to locate the actual .gguf file.
   *
   * @param {string} modelName - Model name (e.g., 'phi3', 'mistral')
   * @returns {Promise<string>} Full path to .gguf file
   */
  async getModelPath(modelName) {
    try {
      const { stdout } = await execAsync('llamacpp-manager config list');

      // Parse config output to find model file
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.toLowerCase().includes(modelName.toLowerCase()) && line.includes('.gguf')) {
          const match = line.match(/([^\s]+\.gguf)/);
          if (match) {
            return match[1];
          }
        }
      }

      throw new Error(`Model file not found for: ${modelName}`);
    } catch (error) {
      throw new Error(`Failed to locate model: ${error.message}`);
    }
  }

  /**
   * Run llama-bench for a specific model.
   *
   * @param {string} modelName - Model name (e.g., 'phi3')
   * @param {Object} options - Benchmark options
   * @param {Array<number>} options.promptSizes - Prompt sizes to test (default: [512])
   * @param {Array<number>} options.generations - Generation lengths (default: [128])
   * @param {Array<number>} options.threads - Thread counts (default: [8])
   * @param {number} options.gpuLayers - GPU layers to offload (default: 35)
   * @param {number} options.repetitions - Number of repetitions (default: 5)
   * @param {number} options.batchSize - Batch size (default: 2048)
   * @param {number} options.runNumber - Test run number (for schema)
   * @returns {Promise<Array>} Array of schema-compliant benchmark results
   */
  async benchmark(modelName, options = {}) {
    const {
      promptSizes = [512],
      generations = [128],
      threads = [8],
      gpuLayers = 35,
      repetitions = 5,
      batchSize = 2048,
      runNumber = 1
    } = options;

    // Get model file path
    const modelPath = await this.getModelPath(modelName);

    // Build command
    const promptStr = promptSizes.join(',');
    const genStr = generations.join(',');
    const threadStr = threads.join(',');

    const cmd = `${this.llamaBenchPath} ` +
      `-m "${modelPath}" ` +
      `-p ${promptStr} ` +
      `-n ${genStr} ` +
      `-t ${threadStr} ` +
      `-ngl ${gpuLayers} ` +
      `-b ${batchSize} ` +
      `-r ${repetitions} ` +
      `-o json`;

    console.log(`\n🔧 Running llama-bench for ${modelName}...`);
    console.log(`   Prompts: ${promptStr} tokens`);
    console.log(`   Generations: ${genStr} tokens`);
    console.log(`   Repetitions: ${repetitions}`);

    try {
      // Run benchmark (redirect stderr to suppress Metal initialization messages)
      const { stdout } = await execAsync(cmd + ' 2>/dev/null');

      // Parse JSON output
      const rawResults = JSON.parse(stdout);

      console.log(`✅ Completed: ${rawResults.length} benchmark runs`);

      // Transform to schema format
      const schemaResults = rawResults.map(benchResult =>
        transformLlamaBenchResult(benchResult, {
          modelName,
          runNumber,
          testRunId: `llama-bench-run-${runNumber}-${modelName}`,
          runName: `LLAMABENCH_RUN${runNumber}_${modelName.toUpperCase()}`
        })
      );

      return schemaResults;

    } catch (error) {
      console.error(`❌ llama-bench failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Benchmark multiple models in sequence.
   *
   * @param {Array<string>} modelNames - Array of model names
   * @param {Object} options - Benchmark options (passed to benchmark())
   * @returns {Promise<Array>} Combined array of all results
   */
  async benchmarkMultiple(modelNames, options = {}) {
    const allResults = [];

    for (const modelName of modelNames) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Benchmarking: ${modelName}`);
      console.log('='.repeat(60));

      const results = await this.benchmark(modelName, options);
      allResults.push(...results);
    }

    return allResults;
  }

  /**
   * Check if llama-bench is available.
   *
   * @returns {Promise<boolean>} True if llama-bench is installed
   */
  async isAvailable() {
    try {
      await execAsync(`${this.llamaBenchPath} --help 2>/dev/null`);
      return true;
    } catch (error) {
      return false;
    }
  }
}
