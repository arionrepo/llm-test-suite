// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/llamacpp-manager-client.js
// Description: Integration with llamacpp-manager - start/stop models, query status, switch between models
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class LlamaCppManagerClient {
  constructor() {
    this.models = {
      'phi3': { port: 8081, size: '4B', specialty: 'lightweight' },
      'smollm3': { port: 8082, size: '1B', specialty: 'tiny' },
      'mistral': { port: 8083, size: '7B', specialty: 'general' },
      'qwen2.5-32b': { port: 8084, size: '32B', specialty: 'large-context', contextWindow: 131072 },
      'qwen-coder-7b': { port: 8085, size: '7B', specialty: 'code' },
      'hermes-3-llama-8b': { port: 8086, size: '8B', specialty: 'function-calling' },
      'llama-3.1-8b': { port: 8087, size: '8B', specialty: 'general' },
      'llama-4-scout-17b': { port: 8088, size: '17B', specialty: 'reasoning' },
      'mistral-small-24b': { port: 8089, size: '24B', specialty: 'large' },
      'deepseek-r1-qwen-32b': { port: 8092, size: '32B', specialty: 'reasoning' }
    };
  }

  async getStatus() {
    try {
      const { stdout } = await execAsync('llamacpp-manager status');
      return this.parseStatus(stdout);
    } catch (error) {
      console.error('Error getting status:', error.message);
      return null;
    }
  }

  parseStatus(output) {
    const lines = output.split('\n');
    const modelStatus = {};
    let inModelsSection = false;

    for (const line of lines) {
      if (line.includes('Models:')) {
        inModelsSection = true;
        continue;
      }
      if (inModelsSection && line.trim()) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2 && this.models[parts[0]]) {
          const isRunning = parts.includes('True') || line.includes('direct');
          modelStatus[parts[0]] = {
            running: isRunning,
            port: this.models[parts[0]].port,
            pid: isRunning ? (parts[2] !== 'None' ? parts[2] : null) : null
          };
        }
      }
    }

    return modelStatus;
  }

  async startModel(modelName) {
    if (!this.models[modelName]) {
      throw new Error('Unknown model: ' + modelName);
    }

    const modelInfo = this.models[modelName];
    const port = modelInfo.port;
    const sizeNum = parseInt(modelInfo.size);

    // Size-based timeouts (large models need more time)
    const loadTimeout = sizeNum >= 17 ? 300000 : // 5 min for 17B+
                       sizeNum >= 10 ? 180000 : // 3 min for 10-16B
                       120000; // 2 min for smaller

    console.log('▶️  Starting ' + modelName + ' (' + modelInfo.size + ', port ' + port + ')');
    console.log('   Timeout: ' + (loadTimeout/60000).toFixed(1) + ' minutes');

    try {
      // STEP 1: Issue start command
      await execAsync('llamacpp-manager start ' + modelName, { timeout: 10000 });
      console.log('   Start command sent');

      // STEP 2: Wait for health endpoint
      console.log('   Waiting for health endpoint...');
      const startTime = Date.now();
      let healthOk = false;

      while (Date.now() - startTime < loadTimeout) {
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
          const response = await fetch('http://127.0.0.1:' + port + '/health', {
            signal: AbortSignal.timeout(2000)
          });
          const data = await response.json();

          if (data.status === 'ok') {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            console.log('   Health endpoint OK after ' + elapsed + 's ✓');
            healthOk = true;
            break;
          } else if (data.error && data.error.code === 503) {
            console.log('   Model loading... (503)');
          }
        } catch (error) {
          // Still loading
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          if (elapsed % 10 === 0) { // Log every 10 seconds
            console.log('   Loading... (' + elapsed + 's / ' + (loadTimeout/1000) + 's)');
          }
        }
      }

      if (!healthOk) {
        throw new Error(modelName + ' did not load within ' + (loadTimeout/1000) + 's');
      }

      // STEP 3: Send test query to verify model is ACTUALLY functional
      console.log('   Sending test query to verify functionality...');

      const testQuery = await fetch('http://127.0.0.1:' + port + '/v1/chat/completions', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          messages: [{role: 'user', content: 'Test message - respond with OK'}],
          max_tokens: 10,
          temperature: 0.5
        }),
        signal: AbortSignal.timeout(30000) // 30s for test query
      });

      if (!testQuery.ok) {
        throw new Error(modelName + ' health OK but query failed: HTTP ' + testQuery.status);
      }

      const testResult = await testQuery.json();

      // STEP 4: Verify response structure
      if (!testResult.choices ||
          !testResult.choices[0] ||
          !testResult.choices[0].message ||
          !testResult.choices[0].message.content) {
        throw new Error(modelName + ' returned invalid response structure');
      }

      const responsePreview = testResult.choices[0].message.content.substring(0, 50);
      console.log('   Test query succeeded: "' + responsePreview + '..."');
      console.log('✅ ' + modelName + ' VERIFIED READY AND FUNCTIONAL\n');

      return true;

    } catch (error) {
      console.error('❌ Error starting model:', error.message);
      throw error; // Throw instead of returning false - hard fail
    }
  }

  async stopModel(modelName) {
    if (!this.models[modelName]) {
      throw new Error('Unknown model: ' + modelName);
    }

    const port = this.models[modelName].port;
    console.log('🛑 Stopping ' + modelName + ' (port ' + port + ')...');

    try {
      // STEP 1: Issue stop command
      await execAsync('llamacpp-manager stop ' + modelName);
      console.log('   Stop command sent');

      // STEP 2: VERIFY endpoint becomes unreachable (connection must fail)
      console.log('   Verifying endpoint shutdown...');
      let endpointDown = false;

      for (let attempt = 1; attempt <= 15; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
          await fetch('http://127.0.0.1:' + port + '/health', {
            signal: AbortSignal.timeout(1000)
          });
          // Still responding!
          console.log('   Attempt ' + attempt + '/15: Still responding, waiting...');
        } catch (error) {
          // Connection refused = DOWN
          console.log('   Attempt ' + attempt + '/15: Connection refused ✓');
          endpointDown = true;
          break;
        }
      }

      if (!endpointDown) {
        throw new Error(modelName + ' endpoint still responding after 30 seconds!');
      }

      // STEP 3: Verify port not listening
      console.log('   Verifying port released...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const portCheck = await execAsync('lsof -i :' + port).catch(() => ({stdout: ''}));
      if (portCheck.stdout.includes('LISTEN')) {
        throw new Error('Port ' + port + ' still listening!');
      }
      console.log('   Port ' + port + ' released ✓');

      // STEP 4: Memory cleanup wait
      console.log('   Waiting for memory cleanup (10s)...');
      await new Promise(resolve => setTimeout(resolve, 10000));

      // STEP 5: Final verification - endpoint still unreachable
      try {
        await fetch('http://127.0.0.1:' + port + '/health', {
          signal: AbortSignal.timeout(1000)
        });
        throw new Error(modelName + ' came back up during cleanup!');
      } catch (error) {
        if (error.message && error.message.includes('came back up')) {
          throw error;
        }
        // Connection refused = still down, good
      }

      console.log('✅ ' + modelName + ' VERIFIED STOPPED (endpoint unreachable, port released, memory cleanup complete)\n');
      return true;

    } catch (error) {
      console.error('❌ Error stopping model:', error.message);
      throw error; // Throw instead of returning false - hard fail
    }
  }

  async switchModel(fromModel, toModel) {
    console.log('Switching from ' + fromModel + ' to ' + toModel + '...');
    
    if (fromModel) {
      await this.stopModel(fromModel);
    }
    
    return await this.startModel(toModel);
  }

  getModelPort(modelName) {
    return this.models[modelName] ? this.models[modelName].port : null;
  }

  getModelInfo(modelName) {
    return this.models[modelName] || null;
  }

  getAllModels() {
    return Object.keys(this.models);
  }

  getModelsBySpecialty(specialty) {
    return Object.entries(this.models)
      .filter(([name, info]) => info.specialty === specialty)
      .map(([name, info]) => name);
  }

  async verifyCleanState() {
    console.log('\n🔍 PRE-FLIGHT CHECK: Verifying no models running...');

    // CHECK 1: llamacpp-manager status
    const status = await this.getStatus();
    const runningInStatus = Object.entries(status || {})
      .filter(([name, s]) => s && s.running)
      .map(([name]) => name);

    if (runningInStatus.length > 0) {
      throw new Error('ABORT: ' + runningInStatus.length + ' models running in status: ' + runningInStatus.join(', '));
    }
    console.log('   ✓ Status check: All models stopped');

    // CHECK 2: Process list
    const processes = await execAsync('ps aux | grep llama-server | grep -v grep').catch(() => ({stdout: ''}));
    if (processes.stdout.trim() !== '') {
      console.error('   Processes found:\n' + processes.stdout);
      throw new Error('ABORT: llama-server processes still exist');
    }
    console.log('   ✓ Process check: No llama-server running');

    // CHECK 3: Test all ports (connection attempts should fail)
    console.log('   Testing all 10 ports...');
    const ports = Object.values(this.models).map(m => m.port);

    for (const port of ports) {
      try {
        await fetch('http://127.0.0.1:' + port + '/health', {
          signal: AbortSignal.timeout(1000)
        });
        throw new Error('ABORT: Port ' + port + ' is responding!');
      } catch (error) {
        if (error.message && error.message.includes('ABORT')) {
          throw error;
        }
        // Connection refused = good
      }
    }
    console.log('   ✓ Port check: All 10 ports unreachable');

    console.log('✅ PRE-FLIGHT COMPLETE: System is clean\n');
    return true;
  }
}
