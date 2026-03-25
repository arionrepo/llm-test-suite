// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/performance-test-runner.js
// Description: Resilient performance test runner - active verification, recovery strategies, complete all tests
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-25

import { LLMClient } from './utils/llm-client.js';
import { LlamaCppManagerClient } from './utils/llamacpp-manager-client.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

class ResilientPerformanceTestRunner {
  constructor() {
    this.managerClient = new LlamaCppManagerClient();
    this.issueLog = [];
    this.MAX_RECOVERY_ATTEMPTS = 5;
  }

  async forceStopAllModels() {
    console.log('\n🔧 FORCE STOPPING ALL MODELS...');

    const status = await this.managerClient.getStatus();
    const running = Object.entries(status || {})
      .filter(([name, s]) => s && s.running)
      .map(([name]) => name);

    if (running.length > 0) {
      console.log(`   Found ${running.length} running: ${running.join(', ')}`);

      for (const model of running) {
        await this.forceStopModel(model);
      }
    }

    // Also check process list
    const processes = await execAsync('ps aux | grep llama-server | grep -v grep').catch(() => ({stdout: ''}));
    if (processes.stdout.trim() !== '') {
      console.log('   Killing remaining llama-server processes...');
      await execAsync('pkill -9 -f llama-server').catch(() => {});
    }

    console.log('✅ All models force-stopped');
  }

  async forceStopModel(modelName) {
    const port = this.managerClient.getModelPort(modelName);
    console.log(`\n🛑 Force-stopping ${modelName} (port ${port})...`);

    // Try 1: Normal stop
    try {
      await execAsync(`llamacpp-manager stop ${modelName}`);
      await this.sleep(2000);

      if (await this.isEndpointDead(port)) {
        console.log('   ✓ Stopped via llamacpp-manager');
        return true;
      }
    } catch (e) {
      this.logIssue(modelName, 'force_stop', `llamacpp-manager stop failed: ${e.message}`, 'Trying pkill');
    }

    // Try 2: pkill
    try {
      await execAsync(`pkill -f "llama-server.*${port}"`);
      await this.sleep(2000);

      if (await this.isEndpointDead(port)) {
        console.log('   ✓ Stopped via pkill');
        return true;
      }
    } catch (e) {
      this.logIssue(modelName, 'force_stop', 'pkill failed', 'Trying pkill -9');
    }

    // Try 3: Force kill
    try {
      await execAsync(`pkill -9 -f "llama-server.*${port}"`);
      await this.sleep(3000);

      if (await this.isEndpointDead(port)) {
        console.log('   ✓ Stopped via pkill -9');
        return true;
      }
    } catch (e) {
      this.logIssue(modelName, 'force_stop', 'pkill -9 failed', 'CRITICAL');
    }

    this.logIssue(modelName, 'force_stop', 'ALL STOP ATTEMPTS FAILED', 'CRITICAL');
    return false;
  }

  async isEndpointDead(port) {
    try {
      await fetch(`http://127.0.0.1:${port}/health`, {
        signal: AbortSignal.timeout(1000)
      });
      return false; // Still responding
    } catch (error) {
      return true; // Connection refused = dead
    }
  }

  async startModelWithRetry(modelName) {
    console.log(`\n▶️  Starting ${modelName} with retry logic...`);

    for (let attempt = 1; attempt <= this.MAX_RECOVERY_ATTEMPTS; attempt++) {
      console.log(`   Attempt ${attempt}/${this.MAX_RECOVERY_ATTEMPTS}`);

      try {
        const success = await this.managerClient.startModel(modelName);
        if (success) {
          console.log(`✅ ${modelName} started successfully`);
          return true;
        }
      } catch (error) {
        this.logIssue(modelName, 'start', `Attempt ${attempt} failed: ${error.message}`, `Retrying (${attempt}/${this.MAX_RECOVERY_ATTEMPTS})`);

        if (attempt < this.MAX_RECOVERY_ATTEMPTS) {
          console.log(`   Waiting 5s before retry...`);
          await this.sleep(5000);

          // Try stopping anything that might be interfering
          await this.forceStopAllModels();
        }
      }
    }

    this.logIssue(modelName, 'start', `Failed after ${this.MAX_RECOVERY_ATTEMPTS} attempts`, 'SKIPPING MODEL');
    return false;
  }

  async stopModelWithRetry(modelName) {
    console.log(`\n🛑 Stopping ${modelName} with retry logic...`);

    for (let attempt = 1; attempt <= this.MAX_RECOVERY_ATTEMPTS; attempt++) {
      console.log(`   Attempt ${attempt}/${this.MAX_RECOVERY_ATTEMPTS}`);

      try {
        await this.managerClient.stopModel(modelName);
        console.log(`✅ ${modelName} stopped successfully`);
        return true;
      } catch (error) {
        this.logIssue(modelName, 'stop', `Attempt ${attempt} failed: ${error.message}`, `Trying recovery`);

        if (attempt < this.MAX_RECOVERY_ATTEMPTS) {
          // Force stop with pkill
          const port = this.managerClient.getModelPort(modelName);
          await execAsync(`pkill -f "llama-server.*${port}"`).catch(() => {});
          await this.sleep(3000);

          // Verify it's dead
          if (await this.isEndpointDead(port)) {
            console.log(`   ✓ Stopped via pkill recovery`);
            return true;
          }
        }
      }
    }

    this.logIssue(modelName, 'stop', `Failed after ${this.MAX_RECOVERY_ATTEMPTS} attempts`, 'CONTINUING ANYWAY');
    return false;
  }

  async runPerformanceTests(prompts, runNumber) {
    const models = this.managerClient.getAllModels();
    const results = [];

    console.log(`\n${'='.repeat(80)}`);
    console.log(`PERFORMANCE RUN ${runNumber}: ${prompts.length} prompts × ${models.length} models`);
    console.log('='.repeat(80));

    for (let i = 0; i < models.length; i++) {
      const modelName = models[i];

      console.log(`\n${'='.repeat(70)}`);
      console.log(`MODEL ${i+1}/${models.length}: ${modelName.toUpperCase()}`);
      console.log('='.repeat(70));

      // CRITICAL: Verify clean state
      await this.forceStopAllModels();
      await this.managerClient.verifyCleanState();

      // Start with retry
      const started = await this.startModelWithRetry(modelName);
      if (!started) {
        console.log(`❌ Skipping ${modelName} - could not start`);
        continue; // Skip this model, continue to next
      }

      // Run tests
      const port = this.managerClient.getModelPort(modelName);
      const client = new LLMClient(`http://127.0.0.1:${port}`);

      for (const prompt of prompts) {
        const result = await this.runSingleTest(client, modelName, prompt, runNumber);
        if (result) results.push(result);
      }

      // Stop with retry
      await this.stopModelWithRetry(modelName);

      console.log(`\n✅ Completed ${modelName} - ${results.filter(r => r.modelName === modelName).length} tests executed`);
    }

    return results;
  }

  async runSingleTest(client, modelName, prompt, runNumber) {
    try {
      const result = await client.chatCompletion([
        { role: 'user', content: prompt.input }
      ], { max_tokens: 500, temperature: 0.3 });

      if (!result.success) {
        this.logIssue(modelName, 'test_execution', `Test ${prompt.id} failed`, result.error);
        return null;
      }

      return {
        runNumber,
        modelName,
        promptId: prompt.id,
        inputTokens: result.timing.promptTokens,
        outputTokens: result.timing.completionTokens,
        totalTokens: result.timing.promptTokens + result.timing.completionTokens,
        totalTimeMs: result.timing.totalMs,
        promptProcessingMs: result.timing.promptMs,
        generationMs: result.timing.predictedMs,
        inputTokPerSec: result.timing.promptTokens / (result.timing.promptMs / 1000),
        outputTokPerSec: result.timing.tokensPerSec
      };
    } catch (error) {
      this.logIssue(modelName, 'test_execution', `Exception on ${prompt.id}`, error.message);
      return null;
    }
  }

  logIssue(modelName, step, issue, recovery) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      modelName,
      step,
      issue,
      recovery
    };
    this.issueLog.push(logEntry);
    console.log(`   ⚠️  Issue logged: ${issue} → ${recovery}`);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Test prompts for each run will be defined separately
export { ResilientPerformanceTestRunner };
