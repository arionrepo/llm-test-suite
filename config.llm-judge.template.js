// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/config.llm-judge.template.js
// Description: Configuration template for LLM judge API keys (copy to config.llm-judge.js and add your keys)
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-24

/**
 * LLM Judge Configuration
 * 
 * INSTRUCTIONS:
 * 1. Copy this file: cp config.llm-judge.template.js config.llm-judge.js
 * 2. Add your API keys to config.llm-judge.js
 * 3. Add config.llm-judge.js to .gitignore (NEVER commit API keys!)
 * 
 * OR use environment variables (recommended):
 * export ANTHROPIC_API_KEY="your-key"
 * export OPENAI_API_KEY="your-key"
 */

export const llmJudgeConfig = {
  // API Keys (use environment variables or set here)
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',  // Get from: https://console.anthropic.com/
  openaiApiKey: process.env.OPENAI_API_KEY || '',        // Get from: https://platform.openai.com/

  // Default judge selection
  defaultJudge: 'claude',  // Options: 'claude', 'openai'
  
  // Ensemble mode (use multiple judges and aggregate)
  ensembleMode: false,  // Set to true to use both Claude and OpenAI
  
  // Model selection
  judgeModel: {
    claude: 'claude-sonnet-4-20250514',  // Or claude-opus-4-20250514 for highest quality
    openai: 'gpt-4-turbo-2024-04-09'     // Or gpt-4o for faster responses
  },
  
  // Evaluation settings
  evaluation: {
    temperature: 0.3,  // Lower = more consistent scoring
    maxTokens: 2000,   // Max tokens for judge response
    timeout: 30000     // 30 second timeout
  },
  
  // Human review thresholds
  humanReview: {
    // Trigger human review when:
    confidenceThreshold: 70,     // Judge confidence < 70%
    scoreDiscrepancy: 30,        // Difference between automated and judge score > 30
    alwaysReviewFailures: true,  // All failures go to human review
    sampleRate: 0.1              // Random 10% spot-check
  }
};
