// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/llm-client.js
// Description: HTTP client wrapper for LLM server API - handles chat completions, streaming, error handling
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { config } from '../config.js';

export class LLMClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || config.llmServer.baseUrl;
  }

  async chatCompletion(messages, options) {
    const startTime = Date.now();
    const opts = options || {};
    
    const payload = {
      messages,
      temperature: opts.temperature !== undefined ? opts.temperature : config.modelParams.temperature,
      max_tokens: opts.max_tokens !== undefined ? opts.max_tokens : config.modelParams.max_tokens,
      top_p: opts.top_p !== undefined ? opts.top_p : config.modelParams.top_p,
    };

    // Add any additional options
    Object.keys(opts).forEach(key => {
      if (!['temperature', 'max_tokens', 'top_p', 'timeout'].includes(key)) {
        payload[key] = opts[key];
      }
    });

    try {
      const timeoutMs = opts.timeout || config.llmServer.timeout;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(this.baseUrl + '/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        throw new Error('HTTP ' + response.status + ': ' + text);
      }

      const data = await response.json();
      const endTime = Date.now();

      return {
        success: true,
        response: data.choices[0].message.content,
        fullResponse: data,
        timing: {
          totalMs: endTime - startTime,
          promptMs: data.timings ? data.timings.prompt_ms : null,
          predictedMs: data.timings ? data.timings.predicted_ms : null,
          promptTokens: data.usage ? data.usage.prompt_tokens : null,
          completionTokens: data.usage ? data.usage.completion_tokens : null,
          tokensPerSec: data.timings ? data.timings.predicted_per_second : null,
        },
      };
    } catch (error) {
      const endTime = Date.now();
      return {
        success: false,
        error: error.message,
        timing: { totalMs: endTime - startTime },
      };
    }
  }

  async health() {
    try {
      const response = await fetch(this.baseUrl + '/health');
      return response.ok;
    } catch {
      return false;
    }
  }
}
