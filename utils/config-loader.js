// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/config-loader.js
// Description: Load Docker configuration profiles and generate runtime parameters for benchmarking
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load Docker configuration profiles and generate runtime parameters.
 *
 * Business Purpose: Enable testing models with different parameter
 * configurations while tracking which config was used with each test run.
 * Allows benchmarking the same model under conservative, balanced, and
 * aggressive resource allocations to measure performance/accuracy tradeoffs.
 */
export class DockerConfigLoader {
  constructor() {
    const configPath = path.join(
      path.dirname(__dirname),
      'docker-config-profiles.json'
    );

    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    this.configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    this.currentProfile = 'balanced'; // Default profile
  }

  /**
   * Get all available profile names
   *
   * Returns:
   *   Array of profile names: ['conservative', 'balanced', 'aggressive']
   */
  getAvailableProfiles() {
    return Object.keys(this.configData.profiles);
  }

  /**
   * Set current profile for test runs
   *
   * Args:
   *   profileName: Name of profile to use
   *
   * Throws:
   *   Error if profileName is unknown
   */
  setProfile(profileName) {
    if (!this.configData.profiles[profileName]) {
      const available = this.getAvailableProfiles().join(', ');
      throw new Error(
        `Unknown profile: "${profileName}". Available: ${available}`
      );
    }
    this.currentProfile = profileName;
  }

  /**
   * Get configuration for a specific model and profile
   *
   * Business Purpose: Returns all parameters needed to run a model under
   * a specific profile (for docker-compose.yml variable substitution).
   *
   * Args:
   *   modelName: Name of model (e.g., 'phi3', 'llama4-scout-17b')
   *   profileName: Profile to use (defaults to current profile)
   *
   * Returns:
   *   Object with keys:
   *     - modelName: Model identifier
   *     - profileName: Which profile was selected
   *     - threads: CPU thread count
   *     - n_batch: Batch size for processing
   *     - n_parallel: Number of parallel requests to handle
   *     - memory_gb: Memory allocation for this model/profile
   *     - memory_percent: Overhead percentage
   *     - model_size_b: Human-readable model size
   *     - profile_description: What this profile is for
   *     - profile_purpose: Use case description
   *
   * Example:
   *   const config = loader.getModelConfig('llama4-scout-17b', 'balanced');
   *   // Returns: {threads: 10, n_batch: 1024, n_parallel: 2, memory_gb: 21.6, ...}
   */
  getModelConfig(modelName, profileName = this.currentProfile) {
    const profile = this.configData.profiles[profileName];
    const memoryData = this.configData.memory_allocations[modelName];

    if (!profile) {
      throw new Error(`Unknown profile: ${profileName}`);
    }

    if (!memoryData) {
      const available = Object.keys(this.configData.memory_allocations).join(', ');
      throw new Error(
        `Unknown model: ${modelName}. Available: ${available}`
      );
    }

    return {
      modelName,
      profileName,
      threads: profile.threads,
      n_batch: profile.n_batch,
      n_parallel: profile.n_parallel,
      memory_gb: memoryData[profileName],
      memory_percent: profile.memory_overhead_percent,
      model_size_b: memoryData.model_size_b,
      profile_description: profile.description,
      profile_purpose: profile.purpose,
      concurrent_requests: profile.concurrent_requests,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get complete configuration metadata for results tracking
   *
   * Business Purpose: Returns all profile metadata to be stored with test
   * results, enabling later analysis of performance vs configuration.
   *
   * Returns:
   *   Object with keys:
   *     - profileName: Name of profile
   *     - description: Human-readable description
   *     - purpose: What this profile tests
   *     - threads: CPU threads
   *     - n_batch: Batch size
   *     - n_parallel: Parallel request count
   *     - memory_overhead_percent: Memory overhead
   *     - concurrent_requests: How many concurrent requests
   */
  getConfigMetadata(profileName = this.currentProfile) {
    const profile = this.configData.profiles[profileName];

    if (!profile) {
      throw new Error(`Unknown profile: ${profileName}`);
    }

    return {
      profileName,
      description: profile.description,
      purpose: profile.purpose,
      threads: profile.threads,
      n_batch: profile.n_batch,
      n_parallel: profile.n_parallel,
      memory_overhead_percent: profile.memory_overhead_percent,
      concurrent_requests: profile.concurrent_requests
    };
  }

  /**
   * Validate memory allocation against system capacity
   *
   * Business Purpose: Ensure selected profile won't exceed 59GB allocated
   * for LLM testing, protecting system stability.
   *
   * Args:
   *   profileName: Profile to validate (defaults to current)
   *
   * Returns:
   *   Object with keys:
   *     - valid: boolean
   *     - maxRequired: Maximum memory needed by largest model
   *     - availableGb: Available memory for tests
   *     - message: Human-readable validation result
   *
   * Throws:
   *   Error if profile would exceed 59GB
   */
  validateMemoryAllocation(profileName = this.currentProfile) {
    const allocatedGb = this.configData.system_limits.allocated_for_tests_gb;
    const models = Object.entries(this.configData.memory_allocations);

    let maxRequired = 0;
    let maxModel = '';

    for (const [modelName, memData] of models) {
      if (modelName === 'model_size_b') continue; // Skip metadata keys
      const needed = memData[profileName];
      if (needed > maxRequired) {
        maxRequired = needed;
        maxModel = modelName;
      }
    }

    const valid = maxRequired <= allocatedGb;
    const buffer = allocatedGb - maxRequired;

    return {
      valid,
      maxRequired,
      maxModel,
      availableGb: allocatedGb,
      bufferGb: buffer,
      message: valid
        ? `✅ Profile "${profileName}" fits: ${maxModel} needs ${maxRequired}GB (buffer: ${buffer.toFixed(1)}GB)`
        : `❌ Profile "${profileName}" exceeds limit: ${maxModel} needs ${maxRequired}GB (only ${allocatedGb}GB available)`
    };
  }

  /**
   * Get all models with their memory requirements for a profile
   *
   * Business Purpose: Display memory allocation summary for user visibility
   *
   * Args:
   *   profileName: Profile to show (defaults to current)
   *
   * Returns:
   *   Array of objects with model name, size, and allocated memory
   */
  getMemorySummary(profileName = this.currentProfile) {
    const summary = [];

    for (const [modelName, memData] of Object.entries(this.configData.memory_allocations)) {
      summary.push({
        modelName,
        modelSize: memData.model_size_b,
        allocatedGb: memData[profileName]
      });
    }

    return summary.sort((a, b) => {
      // Extract numeric size from string like "32B"
      const sizeA = parseInt(a.modelSize);
      const sizeB = parseInt(b.modelSize);
      return sizeB - sizeA; // Largest first
    });
  }

  /**
   * Print formatted summary of a profile
   *
   * Business Purpose: User-friendly display of profile configuration and impact
   */
  printProfileSummary(profileName = this.currentProfile) {
    const profile = this.configData.profiles[profileName];
    const validation = this.validateMemoryAllocation(profileName);
    const summary = this.getMemorySummary(profileName);

    console.log('\n' + '='.repeat(70));
    console.log(`DOCKER PROFILE: ${profileName.toUpperCase()}`);
    console.log('='.repeat(70));

    console.log(`\nDescription: ${profile.description}`);
    console.log(`Purpose:     ${profile.purpose}`);

    console.log(`\nResource Configuration:`);
    console.log(`  Threads:              ${profile.threads}`);
    console.log(`  Batch Size:           ${profile.n_batch}`);
    console.log(`  Parallel Requests:    ${profile.n_parallel}`);
    console.log(`  Concurrent Requests:  ${profile.concurrent_requests}`);
    console.log(`  Memory Overhead:      ${profile.memory_overhead_percent}%`);

    console.log(`\nMemory Allocation (all models):`);
    for (const model of summary) {
      console.log(`  ${model.modelName.padEnd(25)} ${model.modelSize.padEnd(6)}  →  ${model.allocatedGb.toFixed(1)}GB`);
    }

    console.log(`\nSystem Validation:`);
    console.log(`  ${validation.message}`);
    console.log(`  Available Buffer: ${validation.bufferGb.toFixed(1)}GB`);

    console.log('='.repeat(70) + '\n');
  }
}

/**
 * Factory function to create and initialize a config loader
 *
 * Example:
 *   const loader = createConfigLoader();
 *   loader.setProfile('aggressive');
 *   const config = loader.getModelConfig('llama4-scout-17b');
 */
export function createConfigLoader() {
  return new DockerConfigLoader();
}
