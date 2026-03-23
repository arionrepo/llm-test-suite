// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/config.js
// Description: Configuration file for LLM test suite - server URL, test parameters, model settings
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

export const config = {
  // LLM Server Configuration
  llmServer: {
    baseUrl: 'http://localhost:8088',
    timeout: 60000, // 60 seconds
  },

  // Model Parameters
  modelParams: {
    temperature: 0.7,
    max_tokens: 500,
    top_p: 0.9,
    top_k: 40,
  },

  // Test Configuration
  tests: {
    speed: {
      repetitions: 5, // Run each test 5 times for average
      prompts: {
        short: 'Hello',
        medium: 'Explain quantum computing in simple terms.',
        long: 'Write a detailed analysis of the economic impact of artificial intelligence on the job market over the next decade, including specific industries that will be affected.',
      },
      concurrentRequests: 3,
    },
    accuracy: {
      timeout: 120000, // 2 minutes for complex tasks
    },
    toolCalling: {
      timeout: 30000, // 30 seconds
    },
    contextWindow: {
      maxTurns: 10,
      longContextTokens: 5000,
    },
  },
};
