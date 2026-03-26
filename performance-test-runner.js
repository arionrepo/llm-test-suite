// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/performance-test-runner.js
// Description: Resilient performance test runner - active verification, recovery strategies, complete all tests
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-25

import { LLMClient } from './utils/llm-client.js';
import { LlamaCppManagerClient } from './utils/llamacpp-manager-client.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class ResilientPerformanceTestRunner {
  constructor() {
    this.managerClient = new LlamaCppManagerClient();
    this.issueLog = [];
    this.eventLog = [];
    this.MAX_RECOVERY_ATTEMPTS = 5;
    this.logFile = null;
  }

  /**
   * Initialize logger for this test run
   * Creates timestamped log file and sets up event logging
   */
  initializeLogger(testName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('Z', 'Z');
    const logDir = path.join(process.cwd(), 'logs');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logFile = path.join(logDir, `test-run-${testName}-${timestamp}.log`);
    this.logEvent('TEST_START', { testName });
    return this.logFile;
  }

  /**
   * Log timestamped event
   * Writes to both console and log file
   */
  logEvent(eventType, details = {}) {
    const now = new Date().toISOString();
    const logEntry = {
      timestamp: now,
      eventType,
      ...details
    };

    this.eventLog.push(logEntry);

    // Format for display
    const formattedEntry = `[${now}] ${eventType} | ${JSON.stringify(details)}`;

    // Console output
    if (eventType.includes('ERROR') || eventType.includes('ISSUE')) {
      console.error(formattedEntry);
    } else {
      console.log(formattedEntry);
    }

    // File output
    if (this.logFile) {
      fs.appendFileSync(this.logFile, formattedEntry + '\n');
    }
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

  async runPerformanceTests(prompts, runNumber, onModelComplete = null, modelFilter = null) {
    // MANDATORY: Logger MUST be initialized before running tests
    if (!this.logFile) {
      throw new Error('FATAL: Logger not initialized. Call initializeLogger() before runPerformanceTests()');
    }

    // MANDATORY: onModelComplete callback MUST be provided for incremental saving
    if (!onModelComplete) {
      throw new Error('FATAL: onModelComplete callback is REQUIRED for incremental result saving. No exceptions.');
    }

    // Get all models, optionally filter to subset
    let models = this.managerClient.getAllModels();
    if (modelFilter && Array.isArray(modelFilter) && modelFilter.length > 0) {
      models = models.filter(m => modelFilter.includes(m));
      if (models.length === 0) {
        throw new Error(`FATAL: No models found matching filter: ${modelFilter.join(', ')}`);
      }
    }
    const results = [];

    this.logEvent('PERFORMANCE_RUN_START', {
      runNumber,
      totalPrompts: prompts.length,
      totalModels: models.length,
      totalExecutions: prompts.length * models.length,
      loggingEnabled: true,
      incrementalSavingEnabled: true
    });

    console.log(`\n${'='.repeat(80)}`);
    console.log(`PERFORMANCE RUN ${runNumber}: ${prompts.length} prompts × ${models.length} models`);
    console.log('='.repeat(80));

    for (let i = 0; i < models.length; i++) {
      const modelName = models[i];
      const modelStartTime = new Date();

      this.logEvent('MODEL_START', {
        modelNumber: i + 1,
        totalModels: models.length,
        modelName
      });

      console.log(`\n${'='.repeat(70)}`);
      console.log(`MODEL ${i+1}/${models.length}: ${modelName.toUpperCase()}`);
      console.log('='.repeat(70));

      // CRITICAL: Verify clean state
      await this.forceStopAllModels();
      await this.managerClient.verifyCleanState();

      // Start with retry
      const started = await this.startModelWithRetry(modelName);
      if (!started) {
        this.logEvent('MODEL_SKIP', { modelName, reason: 'Failed to start' });
        console.log(`❌ Skipping ${modelName} - could not start`);
        continue; // Skip this model, continue to next
      }

      // Run tests for this model
      const port = this.managerClient.getModelPort(modelName);
      const client = new LLMClient(`http://127.0.0.1:${port}`);
      const modelResults = [];

      this.logEvent('TESTS_START', {
        modelName,
        totalPrompts: prompts.length
      });

      for (let testNum = 0; testNum < prompts.length; testNum++) {
        const prompt = prompts[testNum];
        const result = await this.runSingleTest(client, modelName, prompt, runNumber, testNum + 1, prompts.length);
        if (result) {
          modelResults.push(result);
          results.push(result);
        }
      }

      this.logEvent('TESTS_COMPLETE', {
        modelName,
        testsRun: modelResults.length,
        duration: new Date() - modelStartTime
      });

      // Stop with retry
      await this.stopModelWithRetry(modelName);

      this.logEvent('MODEL_COMPLETE', {
        modelName,
        testsExecuted: modelResults.length,
        duration: new Date() - modelStartTime
      });

      console.log(`\n✅ Completed ${modelName} - ${modelResults.length} tests executed`);

      // Call callback if provided (for incremental result saving)
      if (onModelComplete) {
        try {
          await onModelComplete(modelName, modelResults);
        } catch (error) {
          this.logEvent('CALLBACK_ERROR', {
            modelName,
            error: error.message
          });
        }
      }
    }

    this.logEvent('PERFORMANCE_RUN_COMPLETE', {
      runNumber,
      totalResults: results.length,
      logFile: this.logFile
    });

    return results;
  }

  async runSingleTest(client, modelName, prompt, runNumber, testNumber = 0, totalTests = 0) {
    const testStartTime = Date.now();
    const testLabel = totalTests > 0 ? `${testNumber}/${totalTests}` : '?/?';

    try {
      this.logEvent('TEST_PROMPT_START', {
        modelName,
        promptId: prompt.id,
        testNumber: testLabel
      });

      const result = await client.chatCompletion([
        { role: 'user', content: prompt.question || prompt.input } // Support both new (question) and legacy (input) fields
      ], { max_tokens: 500, temperature: 0.3 });

      if (!result.success) {
        this.logEvent('TEST_PROMPT_ERROR', {
          modelName,
          promptId: prompt.id,
          testNumber: testLabel,
          error: result.error
        });
        this.logIssue(modelName, 'test_execution', `Test ${prompt.id} failed`, result.error);
        return null;
      }

      // CRITICAL: Capture actual response text (not just metrics)
      if (!result.response || result.response.trim() === '') {
        this.logEvent('TEST_PROMPT_ERROR', {
          modelName,
          promptId: prompt.id,
          testNumber: testLabel,
          error: 'Response is empty'
        });
        this.logIssue(modelName, 'test_execution', `Test ${prompt.id} - response is empty`, 'Invalid test result');
        return null;
      }

      const testDuration = Date.now() - testStartTime;
      const outputTokPerSec = result.timing.tokensPerSec;

      this.logEvent('TEST_PROMPT_COMPLETE', {
        modelName,
        promptId: prompt.id,
        testNumber: testLabel,
        inputTokens: result.timing.promptTokens,
        outputTokens: result.timing.completionTokens,
        durationMs: testDuration,
        outputTokensPerSec: outputTokPerSec.toFixed(2)
      });

      return {
        runNumber,
        modelName,
        promptId: prompt.id,
        response: result.response,
        responseLength: result.response.length,
        responseTokens: result.timing.completionTokens,
        inputTokens: result.timing.promptTokens,
        outputTokens: result.timing.completionTokens,
        totalTokens: result.timing.promptTokens + result.timing.completionTokens,
        totalTimeMs: result.timing.totalMs,
        promptProcessingMs: result.timing.promptMs,
        generationMs: result.timing.predictedMs,
        inputTokPerSec: result.timing.promptTokens / (result.timing.promptMs / 1000),
        outputTokPerSec: result.timing.tokensPerSec,
        timestamp: new Date().toISOString(),
        testNumber,
        totalTests
      };
    } catch (error) {
      this.logEvent('TEST_PROMPT_EXCEPTION', {
        modelName,
        promptId: prompt.id,
        testNumber: testLabel,
        error: error.message
      });
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
