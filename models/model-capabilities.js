// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/models/model-capabilities.js
// Description: Model capability profiles for all supported LLMs - defines specs, capabilities, and suitability
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-25

/**
 * Model Capability Profiles
 *
 * Defines technical specifications, capabilities, and task suitability for each LLM.
 * Used for:
 * - Automatic model filtering (skip incompatible models)
 * - Model selection recommendations
 * - Suitability warnings
 * - Performance expectations
 * - Cost-benefit analysis
 */

export const MODEL_PROFILES = {

  // ============================================================================
  // CLOUD LLMS - THINKING MODE MODELS (o1/o3 family)
  // ============================================================================
  // These models use extended thinking to solve complex problems.
  // Tradeoff: Much slower but higher accuracy on reasoning tasks.

  "o1": {
    modelId: "o1",
    provider: "OpenAI",
    name: "O1",
    type: "cloud",

    specs: {
      contextWindow: 128000,
      parameters: "unknown",
      quantization: null,
      speed: "very_slow",          // ❌ Takes 30-120+ seconds
      localRunnable: false
    },

    capabilities: {
      toolCalling: false,          // ❌ No tool calling in thinking mode
      reasoningDepth: "very_high", // ✅ Expert-level reasoning
      codeGeneration: "advanced",  // ✅ Excellent for complex code
      structuredOutput: false,     // ❌ Limited format control
      multilingualSupport: true,
      conversationTracking: true,
      longContext: true,
      visionSupport: false,
      thinkingMode: true           // ✅ Dedicated thinking model
    },

    suitableFor: [
      "complex_reasoning",         // ✅ Designed for this
      "advanced_code_generation",  // ✅ Excellent
      "mathematical_problems",
      "logical_puzzles",
      "compliance_synthesis"       // ✅ Complex synthesis
    ],

    notSuitableFor: [
      "speed_critical_tasks",      // ❌ Too slow
      "tool_calling",              // ❌ No tools in thinking mode
      "high_volume_tasks",         // ❌ Cost prohibitive
      "real_time_responses"        // ❌ Too slow
    ],

    performance: {
      avgLatency: 45000,           // ⚠️ 45+ seconds average
      tokensPerSecond: null,
      costPerMillion: 60.00,       // ❌ Very expensive
      ramRequired: null
    },

    suitabilityScores: {
      compliance_factual: 92,
      compliance_relational: 96,
      compliance_procedural: 94,
      compliance_synthesis: 99,    // ✅ Best-in-class
      tool_calling_single: 0,      // ❌ No tools
      tool_calling_multi_selection: 0,
      tool_calling_complex_params: 0,
      tool_calling_chaining: 0,
      tool_calling_parallel: 0,
      document_analysis: 95,
      code_generation: 98,         // ✅ Excellent
      customer_service: 88,        // ⚠️ Overkill, too slow
      data_analysis: 92,
      long_context: 95
    },

    recommendations: "Use ONLY for complex reasoning tasks requiring deep analysis. Synthesis, complex code, mathematical problems. NOT for simple tasks or high-volume workloads.",
    limitations: "Very slow (45-120s+), expensive ($60/1M tokens), no tool calling, not suitable for real-time responses"
  },

  "o3-mini": {
    modelId: "o3-mini",
    provider: "OpenAI",
    name: "O3 Mini",
    type: "cloud",

    specs: {
      contextWindow: 200000,
      parameters: "unknown",
      quantization: null,
      speed: "slow",               // ⚠️ 15-30 seconds
      localRunnable: false
    },

    capabilities: {
      toolCalling: false,
      reasoningDepth: "very_high",
      codeGeneration: "advanced",
      structuredOutput: false,
      multilingualSupport: true,
      conversationTracking: true,
      longContext: true,
      visionSupport: false,
      thinkingMode: true           // ✅ Thinking mode with efficiency levels
    },

    suitableFor: [
      "complex_reasoning",
      "code_generation",
      "compliance_synthesis",
      "moderate_context_tasks"     // Good balance
    ],

    notSuitableFor: [
      "speed_critical_tasks",
      "tool_calling",
      "high_volume_tasks",
      "real_time_responses"
    ],

    performance: {
      avgLatency: 18000,           // ⚠️ 18 seconds average
      tokensPerSecond: null,
      costPerMillion: 20.00,       // Less expensive than o1
      ramRequired: null
    },

    suitabilityScores: {
      compliance_factual: 94,
      compliance_relational: 96,
      compliance_procedural: 95,
      compliance_synthesis: 98,    // ✅ Excellent
      tool_calling_single: 0,
      tool_calling_multi_selection: 0,
      tool_calling_complex_params: 0,
      tool_calling_chaining: 0,
      tool_calling_parallel: 0,
      document_analysis: 96,
      code_generation: 97,         // ✅ Very good
      customer_service: 90,        // ⚠️ Still slow for simple tasks
      data_analysis: 94,
      long_context: 96
    },

    recommendations: "Good balance between reasoning power and speed. Use for complex tasks that need deep thinking but can tolerate 15-30s latency.",
    limitations: "Still slow for real-time use, expensive, no tool calling, overkill for simple tasks"
  },

  // ============================================================================
  // CLOUD LLMS (Direct API Access) - Standard Fast Models
  // ============================================================================

  "gpt-4o": {
    modelId: "gpt-4o",
    provider: "OpenAI",
    name: "GPT-4o",
    type: "cloud",

    specs: {
      contextWindow: 128000,
      parameters: "unknown",  // OpenAI doesn't disclose
      quantization: null,
      speed: "fast",
      localRunnable: false
    },

    capabilities: {
      toolCalling: true,           // ✅ Excellent native tool support
      reasoningDepth: "very_high", // ✅ Best-in-class reasoning
      codeGeneration: "advanced",  // ✅ Excellent code generation
      structuredOutput: true,      // ✅ JSON mode support
      multilingualSupport: true,
      conversationTracking: true,
      longContext: true,           // 128k context
      visionSupport: true,         // Can process images
      thinkingMode: false          // Standard fast response mode
    },

    suitableFor: [
      "all"  // GPT-4o is generally capable across all task types
    ],

    notSuitableFor: [],  // No significant limitations

    performance: {
      avgLatency: 2300,            // ms for typical request
      tokensPerSecond: null,       // API doesn't expose
      costPerMillion: 15.00,       // $15 per 1M tokens (combined input/output average)
      ramRequired: null            // Cloud API
    },

    suitabilityScores: {
      compliance_factual: 98,
      compliance_relational: 96,
      compliance_procedural: 97,
      compliance_synthesis: 98,
      tool_calling_single: 98,
      tool_calling_multi_selection: 97,
      tool_calling_complex_params: 96,
      tool_calling_chaining: 95,
      tool_calling_parallel: 93,
      document_analysis: 96,
      code_generation: 97,
      customer_service: 95,
      data_analysis: 96,
      long_context: 97
    },

    recommendations: "Use for accuracy-critical tasks, complex reasoning, tool calling, and when cost is not primary concern",
    limitations: "Cost can be prohibitive for high-volume use cases"
  },

  "claude-3-5-sonnet-20241022": {
    modelId: "claude-3-5-sonnet-20241022",
    provider: "Anthropic",
    name: "Claude 3.5 Sonnet",
    type: "cloud",

    specs: {
      contextWindow: 200000,
      parameters: "unknown",
      quantization: null,
      speed: "medium",
      localRunnable: false
    },

    capabilities: {
      toolCalling: true,           // ✅ Excellent tool support
      reasoningDepth: "very_high", // ✅ Exceptional reasoning
      codeGeneration: "advanced",  // ✅ Excellent code
      structuredOutput: true,
      multilingualSupport: true,
      conversationTracking: true,
      longContext: true,           // 200k context (larger than GPT-4o)
      visionSupport: true,
      thinkingMode: false          // Standard fast response mode
    },

    suitableFor: [
      "all",
      "long_context_tasks",        // Especially good for long context
      "complex_reasoning"          // Exceptional reasoning
    ],

    notSuitableFor: [],

    performance: {
      avgLatency: 3200,            // Slightly slower than GPT-4o
      tokensPerSecond: null,
      costPerMillion: 18.00,       // $18 per 1M tokens
      ramRequired: null
    },

    suitabilityScores: {
      compliance_factual: 96,
      compliance_relational: 98,   // Excellent at relationships
      compliance_procedural: 96,
      compliance_synthesis: 99,    // Best-in-class synthesis
      tool_calling_single: 97,
      tool_calling_multi_selection: 98,
      tool_calling_complex_params: 97,
      tool_calling_chaining: 96,
      tool_calling_parallel: 94,
      document_analysis: 98,       // Excellent document understanding
      code_generation: 96,
      customer_service: 97,
      data_analysis: 95,
      long_context: 99             // Best-in-class long context
    },

    recommendations: "Excellent for complex reasoning, document analysis, long context tasks, and when accuracy is paramount",
    limitations: "Higher cost than GPT-4o, slightly slower response times"
  },

  "gemini-pro-1.5": {
    modelId: "gemini-pro-1.5",
    provider: "Google",
    name: "Gemini Pro 1.5",
    type: "cloud",

    specs: {
      contextWindow: 1000000,      // 1M tokens!
      parameters: "unknown",
      quantization: null,
      speed: "medium",
      localRunnable: false
    },

    capabilities: {
      toolCalling: true,
      reasoningDepth: "high",
      codeGeneration: "intermediate",
      structuredOutput: true,
      multilingualSupport: true,
      conversationTracking: true,
      longContext: true,           // Massive context window
      visionSupport: true,
      multiModalSupport: true,     // Video, audio
      thinkingMode: false
    },

    suitableFor: [
      "long_context_tasks",        // Unparalleled context window
      "multi_modal",               // Video/audio processing
      "document_analysis"
    ],

    notSuitableFor: [],

    performance: {
      avgLatency: 4500,            // Slower due to large context processing
      tokensPerSecond: null,
      costPerMillion: 7.00,        // Cheaper than GPT-4o/Claude
      ramRequired: null
    },

    suitabilityScores: {
      compliance_factual: 88,
      compliance_relational: 90,
      compliance_procedural: 87,
      compliance_synthesis: 92,
      tool_calling_single: 85,
      tool_calling_multi_selection: 83,
      tool_calling_complex_params: 82,
      tool_calling_chaining: 80,
      tool_calling_parallel: 78,
      document_analysis: 94,       // Excellent for documents
      code_generation: 85,
      customer_service: 88,
      data_analysis: 90,
      long_context: 100            // Best-in-class
    },

    recommendations: "Best for extremely long context tasks (100k+ tokens), multi-modal processing, cost-sensitive workloads",
    limitations: "Tool calling slightly less reliable than GPT-4o/Claude, slower response times"
  },

  "command-r-plus": {
    modelId: "command-r-plus",
    provider: "Cohere",
    name: "Command R+",
    type: "cloud",

    specs: {
      contextWindow: 128000,
      parameters: "104B",
      quantization: null,
      speed: "fast",
      localRunnable: false
    },

    capabilities: {
      toolCalling: true,
      reasoningDepth: "high",
      codeGeneration: "intermediate",
      structuredOutput: true,
      multilingualSupport: true,
      conversationTracking: true,
      longContext: true,
      retrievalAugmented: true,    // Native RAG support
      thinkingMode: false
    },

    suitableFor: [
      "information_retrieval",     // Built for RAG
      "document_analysis",
      "customer_service"
    ],

    notSuitableFor: [
      "advanced_code_generation"
    ],

    performance: {
      avgLatency: 2800,
      tokensPerSecond: null,
      costPerMillion: 10.00,
      ramRequired: null
    },

    suitabilityScores: {
      compliance_factual: 90,
      compliance_relational: 88,
      compliance_procedural: 85,
      compliance_synthesis: 87,
      tool_calling_single: 88,
      tool_calling_multi_selection: 86,
      tool_calling_complex_params: 83,
      tool_calling_chaining: 82,
      tool_calling_parallel: 80,
      document_analysis: 92,
      code_generation: 78,
      customer_service: 91,
      data_analysis: 88,
      long_context: 90
    },

    recommendations: "Good for RAG-heavy workloads, document retrieval, customer service; cost-effective alternative to GPT-4o",
    limitations: "Code generation weaker than GPT-4o/Claude"
  },

  // ============================================================================
  // LOCAL LLMS (Via llama.cpp)
  // ============================================================================

  "llama3-70b-instruct": {
    modelId: "llama3-70b-instruct",
    provider: "Meta",
    name: "Llama 3 70B Instruct",
    type: "local",

    specs: {
      contextWindow: 8192,
      parameters: "70B",
      quantization: "Q4_K_M",
      speed: "medium",
      localRunnable: true
    },

    capabilities: {
      toolCalling: false,          // ❌ No native tool calling
      reasoningDepth: "high",      // ✅ Strong reasoning
      codeGeneration: "medium",    // ⚠️ Okay but not great
      structuredOutput: false,     // ❌ No JSON mode
      multilingualSupport: true,
      conversationTracking: true,
      longContext: false,          // 8k is limited
      visionSupport: false,
      thinkingMode: false
    },

    suitableFor: [
      "compliance_knowledge",      // ✅ Good for compliance Q&A
      "document_analysis",         // ✅ Good summarization
      "customer_service",          // ✅ Good email responses
      "general_reasoning"
    ],

    notSuitableFor: [
      "tool_calling",              // ❌ No tool support
      "long_context_tasks",        // ❌ 8k limit
      "advanced_code_generation",  // ❌ Weaker than specialized models
      "structured_json_output"     // ❌ No JSON mode
    ],

    performance: {
      avgLatency: 4200,            // ms
      tokensPerSecond: 12,
      costPerMillion: 0,           // ✅ Free (local)
      ramRequired: "42GB"          // Q4 quantization
    },

    suitabilityScores: {
      compliance_factual: 82,
      compliance_relational: 78,
      compliance_procedural: 80,
      compliance_synthesis: 75,
      tool_calling_single: 0,      // ❌ Not supported
      tool_calling_multi_selection: 0,
      tool_calling_complex_params: 0,
      tool_calling_chaining: 0,
      tool_calling_parallel: 0,
      document_analysis: 84,
      code_generation: 68,
      customer_service: 86,
      data_analysis: 77,
      long_context: 45             // Limited by 8k window
    },

    recommendations: "Best cost-free option for compliance knowledge, customer service, and document analysis (up to 8k tokens). Use when accuracy requirements are moderate and tool calling not needed.",
    limitations: "No tool calling, limited context window (8k), weaker code generation, no structured output"
  },

  "qwen2.5-72b-instruct": {
    modelId: "qwen2.5-72b-instruct",
    provider: "Alibaba",
    name: "Qwen 2.5 72B Instruct",
    type: "local",

    specs: {
      contextWindow: 32768,        // 32k - much better than Llama 3
      parameters: "72B",
      quantization: "Q4_K_M",
      speed: "medium",
      localRunnable: true
    },

    capabilities: {
      toolCalling: false,          // ❌ No native tool calling
      reasoningDepth: "high",
      codeGeneration: "advanced",  // ✅ Strong code generation
      structuredOutput: false,
      multilingualSupport: true,   // ✅ Excellent multilingual
      conversationTracking: true,
      longContext: true,           // 32k is good
      visionSupport: false,
      thinkingMode: false
    },

    suitableFor: [
      "compliance_knowledge",
      "code_generation",           // ✅ Excellent for code
      "document_analysis",
      "multilingual_tasks",
      "moderate_context_tasks"     // Up to 32k
    ],

    notSuitableFor: [
      "tool_calling",
      "very_long_context",         // 32k limit (vs Gemini's 1M)
      "structured_json_output"
    ],

    performance: {
      avgLatency: 4800,
      tokensPerSecond: 10,
      costPerMillion: 0,
      ramRequired: "46GB"
    },

    suitabilityScores: {
      compliance_factual: 85,
      compliance_relational: 82,
      compliance_procedural: 83,
      compliance_synthesis: 80,
      tool_calling_single: 0,
      tool_calling_multi_selection: 0,
      tool_calling_complex_params: 0,
      tool_calling_chaining: 0,
      tool_calling_parallel: 0,
      document_analysis: 88,
      code_generation: 92,         // ✅ Excellent
      customer_service: 84,
      data_analysis: 82,
      long_context: 75             // Good up to 32k
    },

    recommendations: "Best local model for code generation and multilingual tasks. Good compliance knowledge. 32k context enables longer documents than Llama 3.",
    limitations: "No tool calling, no JSON mode, still limited vs cloud models for very long context"
  },

  "qwen2.5-32b-instruct": {
    modelId: "qwen2.5-32b-instruct",
    provider: "Alibaba",
    name: "Qwen 2.5 32B Instruct",
    type: "local",

    specs: {
      contextWindow: 32768,
      parameters: "32B",
      quantization: "Q4_K_M",
      speed: "fast",              // Smaller = faster
      localRunnable: true
    },

    capabilities: {
      toolCalling: false,
      reasoningDepth: "medium",    // Lower than 72B
      codeGeneration: "intermediate",
      structuredOutput: false,
      multilingualSupport: true,
      conversationTracking: true,
      longContext: true,
      visionSupport: false,
      thinkingMode: false
    },

    suitableFor: [
      "compliance_knowledge",
      "document_analysis",
      "customer_service",
      "speed_critical_tasks"       // Faster than 70B models
    ],

    notSuitableFor: [
      "tool_calling",
      "complex_reasoning",         // Use 72B for better reasoning
      "advanced_code_generation"
    ],

    performance: {
      avgLatency: 3200,            // Faster than 70B models
      tokensPerSecond: 16,
      costPerMillion: 0,
      ramRequired: "22GB"          // Lower RAM requirements
    },

    suitabilityScores: {
      compliance_factual: 80,
      compliance_relational: 75,
      compliance_procedural: 77,
      compliance_synthesis: 72,
      tool_calling_single: 0,
      tool_calling_multi_selection: 0,
      tool_calling_complex_params: 0,
      tool_calling_chaining: 0,
      tool_calling_parallel: 0,
      document_analysis: 82,
      code_generation: 78,
      customer_service: 83,
      data_analysis: 76,
      long_context: 72
    },

    recommendations: "Good balance of speed and accuracy for compliance knowledge and customer service. Lower RAM requirements than 70B models.",
    limitations: "No tool calling, weaker reasoning than 72B, not suitable for complex tasks"
  },

  "qwen2.5-14b-instruct": {
    modelId: "qwen2.5-14b-instruct",
    provider: "Alibaba",
    name: "Qwen 2.5 14B Instruct",
    type: "local",

    specs: {
      contextWindow: 32768,
      parameters: "14B",
      quantization: "Q4_K_M",
      speed: "fast",
      localRunnable: true
    },

    capabilities: {
      toolCalling: false,
      reasoningDepth: "medium",
      codeGeneration: "basic",
      structuredOutput: false,
      multilingualSupport: true,
      conversationTracking: true,
      longContext: true,
      visionSupport: false,
      thinkingMode: false
    },

    suitableFor: [
      "simple_compliance_questions",
      "customer_service",
      "document_summarization",
      "speed_critical_tasks"
    ],

    notSuitableFor: [
      "tool_calling",
      "complex_reasoning",
      "code_generation",
      "synthesis_tasks"
    ],

    performance: {
      avgLatency: 1800,            // Fast
      tokensPerSecond: 24,
      costPerMillion: 0,
      ramRequired: "10GB"          // Low RAM
    },

    suitabilityScores: {
      compliance_factual: 75,
      compliance_relational: 68,
      compliance_procedural: 70,
      compliance_synthesis: 62,
      tool_calling_single: 0,
      tool_calling_multi_selection: 0,
      tool_calling_complex_params: 0,
      tool_calling_chaining: 0,
      tool_calling_parallel: 0,
      document_analysis: 76,
      code_generation: 58,
      customer_service: 78,
      data_analysis: 68,
      long_context: 68
    },

    recommendations: "Use for simple tasks where speed matters more than accuracy. Good for high-volume, low-complexity workloads.",
    limitations: "Weaker reasoning and accuracy than larger models, not suitable for complex tasks"
  },

  "mistral-8x7b-instruct-v0.1": {
    modelId: "mistral-8x7b-instruct-v0.1",
    provider: "Mistral AI",
    name: "Mixtral 8x7B Instruct",
    type: "local",

    specs: {
      contextWindow: 32768,
      parameters: "8x7B",          // Mixture of Experts
      quantization: "Q4_K_M",
      speed: "fast",
      localRunnable: true
    },

    capabilities: {
      toolCalling: true,           // ✅ Basic tool support
      reasoningDepth: "high",
      codeGeneration: "intermediate",
      structuredOutput: false,
      multilingualSupport: true,
      conversationTracking: true,
      longContext: true,
      visionSupport: false,
      thinkingMode: false
    },

    suitableFor: [
      "compliance_knowledge",
      "tool_calling_simple",       // Basic tool support
      "document_analysis",
      "customer_service",
      "moderate_code_generation"
    ],

    notSuitableFor: [
      "tool_calling_chaining",     // Struggles with complex tool use
      "tool_calling_parallel",
      "advanced_code_generation"
    ],

    performance: {
      avgLatency: 3600,
      tokensPerSecond: 14,
      costPerMillion: 0,
      ramRequired: "32GB"
    },

    suitabilityScores: {
      compliance_factual: 83,
      compliance_relational: 80,
      compliance_procedural: 81,
      compliance_synthesis: 76,
      tool_calling_single: 72,     // ⚠️ Basic support
      tool_calling_multi_selection: 68,
      tool_calling_complex_params: 55,
      tool_calling_chaining: 42,   // Poor
      tool_calling_parallel: 38,   // Poor
      document_analysis: 82,
      code_generation: 74,
      customer_service: 84,
      data_analysis: 78,
      long_context: 76
    },

    recommendations: "Good local alternative with basic tool calling support. Use for simple tool tasks where GPT-4/Claude not available.",
    limitations: "Tool calling less reliable than cloud models, struggles with complex/chained tool use"
  },

  "mistral-7b-instruct-v0.2": {
    modelId: "mistral-7b-instruct-v0.2",
    provider: "Mistral AI",
    name: "Mistral 7B Instruct v0.2",
    type: "local",

    specs: {
      contextWindow: 32768,
      parameters: "7B",
      quantization: "Q4_K_M",
      speed: "very_fast",
      localRunnable: true
    },

    capabilities: {
      toolCalling: false,          // ❌ No tool support
      reasoningDepth: "medium",
      codeGeneration: "basic",
      structuredOutput: false,
      multilingualSupport: true,
      conversationTracking: true,
      longContext: false,          // 32k but poor quality at length
      visionSupport: false,
      thinkingMode: false
    },

    suitableFor: [
      "simple_questions",
      "customer_service_basic",
      "speed_critical_tasks"
    ],

    notSuitableFor: [
      "tool_calling",
      "complex_reasoning",
      "code_generation",
      "compliance_synthesis",
      "long_context"
    ],

    performance: {
      avgLatency: 1400,            // Very fast
      tokensPerSecond: 32,
      costPerMillion: 0,
      ramRequired: "6GB"           // Lowest RAM
    },

    suitabilityScores: {
      compliance_factual: 68,
      compliance_relational: 60,
      compliance_procedural: 65,
      compliance_synthesis: 52,
      tool_calling_single: 0,
      tool_calling_multi_selection: 0,
      tool_calling_complex_params: 0,
      tool_calling_chaining: 0,
      tool_calling_parallel: 0,
      document_analysis: 70,
      code_generation: 55,
      customer_service: 74,
      data_analysis: 62,
      long_context: 48
    },

    recommendations: "Use for high-volume, low-complexity tasks where speed is critical and accuracy requirements are moderate. Good for basic customer service.",
    limitations: "No tool calling, weak reasoning, poor code generation, limited accuracy on complex topics"
  },

  "phi-3-medium-128k-instruct": {
    modelId: "phi-3-medium-128k-instruct",
    provider: "Microsoft",
    name: "Phi-3 Medium 14B (128k)",
    type: "local",

    specs: {
      contextWindow: 128000,       // ✅ Excellent context
      parameters: "14B",
      quantization: "Q4_K_M",
      speed: "fast",
      localRunnable: true
    },

    capabilities: {
      toolCalling: false,
      reasoningDepth: "medium",
      codeGeneration: "intermediate",
      structuredOutput: false,
      multilingualSupport: false,  // ❌ Primarily English
      conversationTracking: true,
      longContext: true,           // ✅ 128k context
      visionSupport: false,
      thinkingMode: false
    },

    suitableFor: [
      "long_context_tasks",        // ✅ 128k context in small model
      "document_analysis",
      "compliance_knowledge",
      "moderate_code_generation"
    ],

    notSuitableFor: [
      "tool_calling",
      "multilingual",
      "complex_synthesis",
      "advanced_reasoning"
    ],

    performance: {
      avgLatency: 2200,
      tokensPerSecond: 20,
      costPerMillion: 0,
      ramRequired: "12GB"          // Efficient for 14B
    },

    suitabilityScores: {
      compliance_factual: 76,
      compliance_relational: 72,
      compliance_procedural: 74,
      compliance_synthesis: 68,
      tool_calling_single: 0,
      tool_calling_multi_selection: 0,
      tool_calling_complex_params: 0,
      tool_calling_chaining: 0,
      tool_calling_parallel: 0,
      document_analysis: 82,       // Good with long docs
      code_generation: 75,
      customer_service: 76,
      data_analysis: 72,
      long_context: 88             // ✅ Excellent for size
    },

    recommendations: "Best local option for long context tasks (up to 128k). Good balance of context window and efficiency. Use when dealing with long documents on constrained hardware.",
    limitations: "No tool calling, English-only, moderate reasoning ability"
  },

  "smollm3-1.7b-instruct": {
    modelId: "smollm3-1.7b-instruct",
    provider: "HuggingFace",
    name: "SmolLM3 1.7B Instruct",
    type: "local",

    specs: {
      contextWindow: 8192,
      parameters: "1.7B",          // Very small
      quantization: "Q4_K_M",
      speed: "very_fast",
      localRunnable: true
    },

    capabilities: {
      toolCalling: false,
      reasoningDepth: "low",
      codeGeneration: "basic",
      structuredOutput: false,
      multilingualSupport: false,
      conversationTracking: false, // Limited ability
      longContext: false,
      visionSupport: false,
      thinkingMode: false
    },

    suitableFor: [
      "simple_factual_questions",
      "basic_customer_service",
      "ultra_fast_responses",
      "resource_constrained_environments"
    ],

    notSuitableFor: [
      "tool_calling",
      "complex_reasoning",
      "code_generation",
      "compliance_synthesis",
      "long_context",
      "multilingual"
    ],

    performance: {
      avgLatency: 480,             // ✅ Extremely fast
      tokensPerSecond: 65,
      costPerMillion: 0,
      ramRequired: "2GB"           // ✅ Minimal RAM
    },

    suitabilityScores: {
      compliance_factual: 58,
      compliance_relational: 45,
      compliance_procedural: 52,
      compliance_synthesis: 38,
      tool_calling_single: 0,
      tool_calling_multi_selection: 0,
      tool_calling_complex_params: 0,
      tool_calling_chaining: 0,
      tool_calling_parallel: 0,
      document_analysis: 62,
      code_generation: 42,
      customer_service: 68,
      data_analysis: 48,
      long_context: 35
    },

    recommendations: "Use only when extreme speed and minimal resources are requirements. Suitable for simple, high-volume tasks with low accuracy needs.",
    limitations: "Very limited capabilities, poor accuracy on complex tasks, use only for simple factual questions"
  }

};

/**
 * Model Capability Helpers
 */

/**
 * Filter models by required capabilities
 * @param {Object} requirements - Capability requirements from test
 * @returns {Array} Compatible model IDs
 */
export function filterModelsByCapabilities(requirements) {
  const compatible = [];

  for (const [modelId, profile] of Object.entries(MODEL_PROFILES)) {
    let isCompatible = true;

    // Check each required capability
    if (requirements.toolCalling && !profile.capabilities.toolCalling) {
      isCompatible = false;
    }

    if (requirements.minimumContextWindow &&
        profile.specs.contextWindow < requirements.minimumContextWindow) {
      isCompatible = false;
    }

    if (requirements.minimumReasoningDepth) {
      const depthLevels = { low: 1, medium: 2, high: 3, very_high: 4 };
      const required = depthLevels[requirements.minimumReasoningDepth];
      const actual = depthLevels[profile.capabilities.reasoningDepth];
      if (actual < required) {
        isCompatible = false;
      }
    }

    if (requirements.structuredOutput && !profile.capabilities.structuredOutput) {
      isCompatible = false;
    }

    if (isCompatible) {
      compatible.push(modelId);
    }
  }

  return compatible;
}

/**
 * Get recommended models for a task type
 * @param {string} taskType - Task type (e.g., "compliance_factual", "tool_calling_single")
 * @param {number} minScore - Minimum suitability score (0-100)
 * @returns {Array} Model IDs sorted by suitability score (descending)
 */
export function getRecommendedModels(taskType, minScore = 70) {
  const recommendations = [];

  for (const [modelId, profile] of Object.entries(MODEL_PROFILES)) {
    const score = profile.suitabilityScores?.[taskType];
    if (score && score >= minScore) {
      recommendations.push({ modelId, score });
    }
  }

  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations.map(r => r.modelId);
}

/**
 * Check if model is suitable for test
 * @param {string} modelId - Model ID
 * @param {Object} test - Test object with modelRequirements
 * @returns {Object} { suitable: boolean, warnings: string[], errors: string[] }
 */
export function checkModelSuitability(modelId, test) {
  const profile = MODEL_PROFILES[modelId];
  if (!profile) {
    return { suitable: false, errors: [`Model profile not found: ${modelId}`], warnings: [] };
  }

  const errors = [];
  const warnings = [];

  // Check required capabilities
  if (test.modelRequirements?.requiredCapabilities) {
    const required = test.modelRequirements.requiredCapabilities;

    if (required.toolCalling && !profile.capabilities.toolCalling) {
      errors.push(`Model ${modelId} does not support tool calling (required by this test)`);
    }

    if (required.minimumContextWindow &&
        profile.specs.contextWindow < required.minimumContextWindow) {
      errors.push(`Model ${modelId} context window (${profile.specs.contextWindow}) is less than required (${required.minimumContextWindow})`);
    }

    if (required.structuredOutput && !profile.capabilities.structuredOutput) {
      errors.push(`Model ${modelId} does not support structured output (JSON mode)`);
    }
  }

  // Check unsuitable models list
  if (test.modelRequirements?.unsuitableModels?.includes(modelId)) {
    errors.push(`Model ${modelId} is listed as unsuitable for this test`);
  }

  // Check suitability scores
  if (test.category && profile.suitabilityScores) {
    const score = profile.suitabilityScores[test.category];
    if (score && score < 60) {
      warnings.push(`Model ${modelId} has low suitability score for ${test.category} (${score}/100)`);
    }
  }

  const suitable = errors.length === 0;

  return { suitable, errors, warnings };
}

/**
 * Get model profile by ID
 */
export function getModelProfile(modelId) {
  return MODEL_PROFILES[modelId];
}

/**
 * List all available models
 */
export function listAllModels() {
  return Object.keys(MODEL_PROFILES);
}

/**
 * Get models by type (cloud or local)
 */
export function getModelsByType(type) {
  return Object.entries(MODEL_PROFILES)
    .filter(([_, profile]) => profile.type === type)
    .map(([modelId, _]) => modelId);
}
