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

    console.log('Starting ' + modelName + '...');
    try {
      await execAsync('llamacpp-manager start ' + modelName, { timeout: 10000 });
      
      // Wait for model to be ready
      const maxWait = 60000; // 60 seconds
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const status = await this.getStatus();
        if (status && status[modelName] && status[modelName].running) {
          // Check if health endpoint responds
          const port = this.models[modelName].port;
          try {
            const response = await fetch('http://127.0.0.1:' + port + '/health');
            const data = await response.json();
            if (data.status === 'ok') {
              console.log('✅ ' + modelName + ' ready on port ' + port);
              return true;
            }
          } catch (e) {
            // Still loading, continue waiting
          }
        }
      }
      
      throw new Error('Model did not become ready within timeout');
    } catch (error) {
      console.error('Error starting model:', error.message);
      return false;
    }
  }

  async stopModel(modelName) {
    if (!this.models[modelName]) {
      throw new Error('Unknown model: ' + modelName);
    }

    console.log('Stopping ' + modelName + '...');
    try {
      await execAsync('llamacpp-manager stop ' + modelName);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } catch (error) {
      console.error('Error stopping model:', error.message);
      return false;
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
}
