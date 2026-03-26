# LLM Test Suite - System Design

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/docs/DESIGN.md
**Description:** Comprehensive design documentation for LLM test prompts system
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-25

---

## 1. System Overview

### 1.1 Vision & Purpose

The LLM Test Suite is a **comprehensive enterprise LLM evaluation platform** for helping businesses answer the critical question:

**"Can we use local LLMs instead of expensive cloud APIs for our enterprise use cases?"**

**Primary Goals:**

1. **Enterprise Use Case Testing** - Test practical, real-world business tasks:
   - Compliance workflows (current focus)
   - Customer service automation
   - Document analysis and summarization
   - Email and communication drafting
   - Code generation and review
   - Data analysis and reporting
   - Meeting notes and action items
   - Research and information synthesis

2. **Local vs Cloud Comparison** - Enable informed decisions:
   - Which tasks work well with local models (Llama 3, Mistral, Qwen)?
   - Which tasks require cloud models (GPT-4, Claude)?
   - What's the accuracy/cost trade-off?
   - Can local models serve as agents for specific functions?

3. **Multi-Vendor Support** - Platform-agnostic testing:
   - Generic baseline tests (vendor-agnostic)
   - Customer-specific tests (ArionComply is first customer, not special case)
   - Scalable to unlimited customers/vendors
   - No hardcoded vendor assumptions

4. **Practical, Not Theoretical** - Focus on real business value:
   - Test what businesses actually need to do
   - Measure real-world accuracy and quality
   - Quantify cost savings potential
   - Guide model selection decisions

### 1.2 Design Philosophy

**Scalability:**
- Support unlimited vendors/customers without code changes
- Dynamic taxonomy that can grow beyond compliance
- No hardcoded vendor or use case assumptions

**Separation of Concerns:**
- Generic knowledge tests separate from vendor implementations
- Test data separate from test runner logic
- Routing configuration separate from test definitions
- Metrics separate from prompts

**Flexibility:**
- Support multiple routing backends (direct LLM, customer pipelines, local instances)
- Multiple retrieval strategies (RAG, vector DB, knowledge graph)
- Diverse user personas (novice to expert)
- Varying complexity levels
- Cross-vendor comparability

---

## 2. Architecture

### 2.1 Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Prompt Data                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Generic    │  │   Vendor A   │  │   Vendor B   │      │
│  │  Compliance  │  │    Custom    │  │    Custom    │      │
│  │    Tests     │  │    Tests     │  │    Tests     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Test Data Generator                        │
│  - Loads all test sources                                   │
│  - Applies taxonomy and metadata                            │
│  - Calculates complexity scores                             │
│  - Exports unified JSON/CSV                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Test Execution                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Enterprise   │  │   Pilot      │  │ Comprehensive│      │
│  │ Test Runner  │  │  Test Runner │  │  Test Suite  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Results & Analysis                         │
│  - JSON reports                                             │
│  - CSV exports                                              │
│  - Prompt viewer (HTML)                                     │
│  - Performance dashboards                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Routing System Architecture

The test suite supports **flexible routing** to different LLM backends, enabling comparison testing and real-world deployment simulation.

```
┌──────────────────────────────────────────────────────────────┐
│                      Test Definition                         │
│  - Prompt/Question                                           │
│  - Expected behavior                                         │
│  - Routing profile: "arioncomply_local" OR "direct_gpt4"   │
│                                   OR ["profile1", "profile2"]│
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                   Routing Adapter                            │
│  - Loads routing profile from config.routing.js             │
│  - Loads credentials from environment                        │
│  - Selects appropriate transformer                           │
└──────────────────────────────────────────────────────────────┘
              ↓                    ↓                    ↓
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │ Direct LLM      │  │ Customer        │  │ Local LLM       │
    │ (OpenAI/Claude) │  │ Pipeline        │  │ (llama.cpp)     │
    │                 │  │ (ArionComply)   │  │                 │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
              ↓                    ↓                    ↓
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │ Transformer     │  │ Transformer     │  │ Transformer     │
    │ - Request       │  │ - Request       │  │ - Request       │
    │ - Response      │  │ - Response      │  │ - Response      │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
              ↓                    ↓                    ↓
              └────────────────────┴────────────────────┘
                                   ↓
                    ┌───────────────────────────────┐
                    │   Normalized Response         │
                    │  - Text                       │
                    │  - Metadata                   │
                    │  - Timing                     │
                    │  - Usage stats                │
                    └───────────────────────────────┘
                                   ↓
                    ┌───────────────────────────────┐
                    │   Evaluation & Comparison     │
                    │  - Check expected topics      │
                    │  - Measure accuracy           │
                    │  - Compare across routes      │
                    │  - Generate reports           │
                    └───────────────────────────────┘
```

**Key Routing Capabilities:**

1. **Direct LLM Testing:**
   - Route directly to OpenAI, Anthropic, Cohere, etc.
   - Bypass customer pipelines
   - Test baseline LLM knowledge

2. **Customer Pipeline Testing:**
   - Route through customer edge functions (e.g., ArionComply)
   - Tests full production system (TIER construction, RAG, database context)
   - Validates customer-specific integrations

3. **Local LLM Testing:**
   - Route to local llama.cpp instances
   - Test cost-saving alternatives
   - Evaluate local model feasibility

4. **Multi-Route Comparison:**
   - Send same prompt to multiple backends
   - Compare responses side-by-side
   - Quantify accuracy differences
   - Measure value of customer enhancements (RAG, context injection)

**Routing Profiles:**
- Defined in `config.routing.js`
- Include: endpoint, auth, request/response transformers
- Environment-specific (local-dev, cloud-dev, production)
- Credentials managed via environment variables

### 2.3 Taxonomy Hierarchy

**Flexible Multi-Domain Classification:**

The test suite supports multiple taxonomies depending on test type:

**Taxonomy A: Compliance Testing** (Standard × KnowledgeType × Persona)

```
Level 1: Compliance Standard (29 standards)
  ├─ GDPR
  ├─ ISO 27001
  ├─ SOC 2
  ├─ HIPAA
  └─ ... (25 more)
      │
      └─ Level 2: Knowledge Type (5 types)
            ├─ FACTUAL: Definitions, requirements, facts
            ├─ RELATIONAL: Cross-references, dependencies
            ├─ PROCEDURAL: Step-by-step workflows
            ├─ EXACT_MATCH: Precise citations
            └─ SYNTHESIS: Multi-document comparison
                │
                └─ Level 3: User Persona (6 personas)
                      ├─ NOVICE: New to compliance
                      ├─ PRACTITIONER: Technical implementer
                      ├─ MANAGER: Strategic oversight
                      ├─ AUDITOR: Verification-focused
                      ├─ EXECUTIVE: Business-focused
                      └─ DEVELOPER: Code-focused
```

**Taxonomy B: Enterprise Task Testing** (TaskDomain × TaskType × BusinessFunction)

```
Level 1: Task Domain (extensible)
  ├─ Customer Service (email responses, chat support, ticket routing)
  ├─ Document Processing (analysis, summarization, extraction)
  ├─ Code & Development (generation, review, debugging)
  ├─ Data Analysis (reporting, insights, visualization)
  ├─ Communication (emails, memos, presentations)
  ├─ Project Management (planning, task breakdown, estimation)
  └─ Research & Synthesis (information gathering, comparison)
      │
      └─ Level 2: Task Type (domain-specific)
            ├─ Generate (create new content)
            ├─ Analyze (understand existing content)
            ├─ Transform (convert format/style)
            ├─ Classify (categorize/tag)
            └─ Extract (pull specific information)
                │
                └─ Level 3: Business Function (industry/dept specific)
                      ├─ Sales (CRM, proposals, outreach)
                      ├─ Support (tickets, FAQs, escalation)
                      ├─ Finance (analysis, reporting, forecasting)
                      ├─ HR (recruiting, onboarding, policies)
                      ├─ Engineering (code, architecture, docs)
                      └─ Operations (processes, optimization, monitoring)
```

**Taxonomy C: Customer Platform Features** (PlatformFeature × FeatureAction × UserContext)

```
Level 1: Platform Feature (customer-specific)
  ├─ Evidence Management (ArionComply)
  ├─ Assessment Workflows (ArionComply)
  ├─ Compliance Reporting (ArionComply)
  ├─ Shield Configuration (Salesforce)
  ├─ Audit Manager (AWS)
  └─ ... (customer-extensible)
      │
      └─ Level 2: Feature Action
            ├─ Upload/Create
            ├─ View/Read
            ├─ Update/Edit
            ├─ Delete/Remove
            └─ Configure/Manage
                │
                └─ Level 3: User Context
                      ├─ First-time user (needs guidance)
                      ├─ Power user (needs efficiency)
                      ├─ Admin (needs configuration)
                      └─ Auditor (needs verification)
```

**Orthogonal Classifications:**

1. **Vendor** (applies to all taxonomies):
   ```
   ├─ Generic: Vendor-agnostic baseline
   ├─ ArionComply: First customer
   ├─ Salesforce: Future customer
   └─ ... (extensible)
   ```

2. **Routing Profile** (applies to all taxonomies):
   ```
   ├─ direct_openai_gpt4: Direct cloud LLM
   ├─ local_llama3_70b: Local model
   ├─ arioncomply_cloud_dev: Customer pipeline
   └─ ... (extensible)
   ```

**Test Categorization Rules:**
- Every test MUST use AT LEAST ONE taxonomy (A, B, or C)
- Tests CAN use multiple taxonomies (e.g., Compliance + Platform)
- Vendor and Routing are orthogonal to all taxonomies

**Example Combinations:**

| Taxonomy | Example | Dimensions |
|----------|---------|------------|
| Compliance | "What is GDPR?" | GDPR × FACTUAL × NOVICE × Generic × direct_gpt4 |
| Enterprise Task | "Summarize this contract" | Document Processing × Analyze × Legal × Generic × local_llama |
| Platform Feature | "Upload evidence in ArionComply" | Evidence Management × Upload × First-time × ArionComply × arioncomply_local |
| Compliance + Platform | "Start GDPR assessment in ArionComply" | GDPR × PROCEDURAL × NOVICE × ArionComply × arioncomply_cloud_dev |

### 2.4 Thinking Mode vs Quick Answer Models

**Two fundamentally different LLM operation modes exist:**

**Thinking Mode Models** (o1, o3-mini):
- Use extended internal reasoning (optimized chain-of-thought)
- Take 15-120+ seconds to respond
- Much higher accuracy on complex reasoning, synthesis, and advanced code
- Cannot use tools or functions
- Lower cost per token, but expensive overall due to slow speed

**Quick Answer Models** (GPT-4o, Claude, local models):
- Respond in milliseconds to seconds
- Good accuracy for most tasks
- Can use tools/functions
- Suitable for real-time responses and high-volume workloads

**When to Use Each:**

| Task Type | Thinking Mode | Quick Answer | Notes |
|-----------|---------------|--------------|-------|
| **Simple compliance questions** | ❌ Overkill | ✅ Perfect | "What is GDPR Article 32?" |
| **Complex compliance synthesis** | ✅ Excellent | ⚠️ Good | "How do we implement GDPR controls?" |
| **Customer service** | ❌ Too slow | ✅ Perfect | Real-time responses needed |
| **Code generation** | ✅ Best for complex | ✅ Good for simple | Complex algorithms → thinking mode |
| **Tool calling** | ❌ Not supported | ✅ Required | No tool support in thinking mode |
| **Long context analysis** | ✅ Excellent | ✅ Good | Both handle well |
| **High-volume tasks** | ❌ Too expensive | ✅ Perfect | Batch processing |
| **Mathematical problems** | ✅ Best | ⚠️ Adequate | Complex math → thinking mode |

**Cost-Benefit Analysis:**
- Thinking mode: $60/1M tokens, 60s latency → only use for critical high-value decisions
- Quick answer: $0-18/1M tokens, <5s latency → use for 90% of tasks

**Design Implication:**
- Model profiles include `thinkingMode: true/false` capability
- Tests should specify model requirements (thinking needed or not)
- System can recommend appropriate models automatically

### 2.5 Model Capability System

The test suite includes **model capability profiles** that define what each LLM can and cannot do, enabling intelligent test filtering and model selection.

```
┌──────────────────────────────────────────────────────────────┐
│                      Test Definition                         │
│  - What we want to test                                      │
│  - Model requirements (toolCalling: true, contextWindow: 32k)│
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│              Model Capability Matching                       │
│  - Load model profiles                                       │
│  - Filter by required capabilities                           │
│  - Rank by suitability scores                                │
└──────────────────────────────────────────────────────────────┘
              ↓                                        ↓
    ┌─────────────────┐                    ┌─────────────────┐
    │ Compatible      │                    │ Incompatible    │
    │ Models          │                    │ Models          │
    │ ✅ gpt-4o       │                    │ ❌ llama3-70b   │
    │ ✅ claude-sonnet│                    │ ❌ mistral-7b   │
    │ ⚠️ qwen-72b     │                    │ (no tools)      │
    └─────────────────┘                    └─────────────────┘
              ↓                                        ↓
    Run tests on these                         Skip or warn
```

**Model Profile Structure:**

Each model has a capability profile defining:

1. **Technical Specs:**
   - Context window size (tokens)
   - Parameter count (1B, 7B, 70B, etc.)
   - Quantization level (Q4_K_M, Q5_K_S, etc.)
   - Memory requirements
   - Average latency (ms)

2. **Capabilities:**
   - Tool/function calling support (true/false)
   - Reasoning depth (low, medium, high, very_high)
   - Code generation quality (basic, intermediate, advanced)
   - Structured output (JSON mode support)
   - Multilingual support
   - Long context handling

3. **Suitability Scores:**
   - Which task types this model excels at
   - Which task types to avoid
   - Cost-benefit positioning (when to use vs alternatives)

**Example Model Profiles:**

```javascript
"gpt-4o": {
  capabilities: {
    toolCalling: true,           // ✅ Excellent tool support
    contextWindow: 128000,       // ✅ Very large context
    reasoningDepth: "very_high", // ✅ Best-in-class reasoning
    codeGeneration: "advanced"
  },
  suitableFor: ["all"],          // Generally capable
  costPerMillion: 15.00
}

"llama3-70b": {
  capabilities: {
    toolCalling: false,          // ❌ No tool support
    contextWindow: 8192,         // ⚠️ Limited context
    reasoningDepth: "high",      // ✅ Good reasoning
    codeGeneration: "medium"
  },
  suitableFor: ["compliance_knowledge", "document_analysis", "customer_service"],
  notSuitableFor: ["tool_calling", "long_context"],
  costPerMillion: 0              // ✅ Free (local)
}
```

**Capability Matching Logic:**

```javascript
// Test declares requirements
test.modelRequirements = {
  requiredCapabilities: {
    toolCalling: true,
    minimumContextWindow: 32000
  }
};

// System filters compatible models
compatibleModels = models.filter(m =>
  m.capabilities.toolCalling === true &&
  m.capabilities.contextWindow >= 32000
);
// Result: ["gpt-4o", "claude-3-5-sonnet", "gemini-pro-1.5"]
// Filtered out: ["llama3-70b", "mistral-7b"] (no tool support)

// Warn user if they try to use incompatible model
if (selectedModel.capabilities.toolCalling === false) {
  throw new Error("This test requires tool calling, but llama3-70b does not support it");
}
```

---

## 3. Vendor/Customer Handling Strategy

### 3.1 Design Principles

**Platform-Agnostic Foundation:**
- Generic tests form the baseline for all LLM evaluation
- Any business can use generic tests without vendor-specific dependencies
- Generic tests focus on universal knowledge and tasks

**Customer as Extension:**
- Customers (like ArionComply) are EXTENSIONS, not special cases
- Customer-specific tests augment generic tests
- ArionComply is the **first customer**, not a hardcoded entity
- Same schema and architecture for all customers

**Comparison & Benchmarking:**
- Enable side-by-side comparison: Generic baseline vs Customer enhancement
- Track whether customer customization (RAG, context injection) improves accuracy
- Measure ROI of customer-specific pipelines vs direct LLM
- Quantify cost savings: Local vs Cloud, Generic vs Enhanced

### 3.2 Vendor Field Values

**Reserved Values:**
- `"Generic"` - Vendor-agnostic baseline (compliance, enterprise tasks, universal knowledge)
- `null` - Legacy, treat as Generic (for backward compatibility)

**Customer/Vendor Values:**
- `"ArionComply"` - ArionComply compliance platform (first customer)
- `"Salesforce"` - Salesforce ecosystem (future customer)
- `"AWS"` - AWS services (future customer)
- `"ServiceNow"` - ServiceNow GRC (future customer)
- Custom customer names as needed

**Naming Convention:**
- PascalCase (e.g., `"ArionComply"`, not `"arioncomply"`)
- Use official brand/product name
- No abbreviations unless standard (e.g., "AWS" acceptable)

### 3.3 Test Organization by Vendor

**Directory Structure:**

```
enterprise/
├── test-data-generator.js          # Generic compliance tests (vendor: "Generic")
├── compliance-standards.js         # Standard taxonomy
├── user-personas.js               # Persona definitions
├── arioncomply-workflows/         # ArionComply-specific tests
│   ├── ui-tasks.js               # (vendor: "ArionComply")
│   ├── ai-backend-multi-tier-tests.js
│   ├── intent-classification-tests.js
│   └── next-action-tests.js
├── salesforce-compliance/         # Future: Salesforce tests
└── aws-compliance-tests/          # Future: AWS tests
```

### 3.4 Vendor Statistics & Comparison

**Stats Display Requirements:**

1. **Overall Stats:**
   - Total prompts: 173
   - Generic: 52
   - ArionComply: 121
   - Other vendors: 0

2. **Category Breakdown:**
   - Compliance Knowledge: 52 (Generic: 52, ArionComply: 0)
   - ArionComply Workflows: 31 (Generic: 0, ArionComply: 31)
   - AI Backend Multi-Tier: 50 (Generic: 0, ArionComply: 50)
   - Intent Classification: 10 (Generic: 0, ArionComply: 10)
   - Workflow Understanding: 30 (Generic: 0, ArionComply: 30)

3. **Vendor Comparison View:**
   ```
   Test Type                   Generic    ArionComply    Delta
   ─────────────────────────────────────────────────────────────
   GDPR Factual               10          5             +5
   ISO 27001 Procedural       8           12            -4
   Assessment Workflows       0           15            -15
   ```

**Filtering Requirements:**
- Filter by vendor: Show only Generic OR only ArionComply OR All
- Combined filters: Vendor + Standard + KnowledgeType + Persona
- Enable comparison mode: Side-by-side Generic vs Vendor

---

## 4. Routing Configuration System

### 4.1 Overview

The routing system provides a **flexible abstraction layer** for sending test prompts to different LLM backends. This enables:
- Testing the same prompt against multiple backends (comparison)
- Simulating real customer deployments
- Evaluating local vs cloud models
- Measuring value-add of customer enhancements (RAG, context)

### 4.2 Routing Profiles

**Routing profiles** define how to connect to and communicate with different LLM backends.

**Profile Types:**

1. **direct_llm** - Direct API calls to cloud LLM providers
   - OpenAI (GPT-3.5, GPT-4, GPT-4o)
   - Anthropic (Claude 3.5 Sonnet, Opus, Haiku)
   - Cohere (Command R+)
   - Google (Gemini Pro)

2. **local_llm** - Local model instances via llama.cpp
   - Llama 3 (8B, 70B)
   - Mistral (7B, 8x7B)
   - Qwen 2.5 (14B, 32B, 72B)
   - Phi-3 (3.8B, 14B)

3. **customer_pipeline** - Customer-specific edge functions/APIs
   - ArionComply (via Supabase edge function)
   - Salesforce (via Apex REST API - future)
   - AWS (via Lambda function - future)

**Profile Configuration Example:**

```javascript
// config.routing.js

{
  id: "arioncomply_cloud_dev",
  name: "ArionComply Cloud Development",
  type: "customer_pipeline",
  provider: "arioncomply",
  endpoint: "https://[project].supabase.co/functions/v1/ai-conversation-send",
  auth: {
    type: "jwt_and_anon",
    jwtEnvVar: "ARIONCOMPLY_CLOUDDEV_JWT",
    anonKeyEnvVar: "ARIONCOMPLY_CLOUDDEV_ANON_KEY"
  },
  headers: {
    "x-org-id": "auto",  // Extract from credentials
    "Content-Type": "application/json"
  },
  requestTransform: "arioncomply",  // Uses ArionComplyTransformer
  responseTransform: "arioncomply",
  timeout: 120000,
  retries: 2
}
```

### 4.3 Request/Response Transformation

**Problem:** Each backend has different API formats

**Solution:** Profile-specific transformers normalize requests and responses

**Transformer Responsibilities:**

1. **Request Transformation:**
   - Convert normalized test prompt → backend-specific API format
   - Add required headers/metadata
   - Handle authentication
   - Inject context (for customer pipelines)

2. **Response Transformation:**
   - Convert backend-specific response → normalized format
   - Extract text content
   - Parse metadata (model, tokens, timing)
   - Handle errors consistently

**Normalized Request Format:**
```javascript
{
  prompt: "User question",
  messages: [],  // Optional conversation history
  context: {     // Optional context
    framework: "gdpr",
    orgProfile: {...},
    sessionId: "uuid"
  },
  options: {     // Optional overrides
    temperature: 0.7,
    max_tokens: 2000
  }
}
```

**Normalized Response Format:**
```javascript
{
  success: true,
  response: "AI response text",
  metadata: {
    profileId: "arioncomply_cloud_dev",
    provider: "arioncomply",
    model: "gpt-4o",
    timing: { totalMs: 3450 },
    usage: { promptTokens: 2300, completionTokens: 450 },
    suggestions: [...],  // Customer-specific
    systemFlags: {...}   // Customer-specific
  }
}
```

### 4.4 Multi-Backend Comparison Testing

**Use Case:** Test same prompt against multiple backends to compare:
- Accuracy (which LLM gives better answers?)
- Cost (cloud vs local)
- Speed (response time)
- Value-add (does customer pipeline improve results?)

**Test Configuration:**

```javascript
{
  id: "GDPR_COMPARISON_001",
  question: "What are the legal bases for processing under GDPR Article 6?",

  // Test against multiple routing profiles
  routingProfiles: [
    "direct_openai_gpt4",           // Cloud LLM directly
    "local_llama3_70b",            // Local model
    "arioncomply_cloud_dev"        // Customer pipeline with RAG
  ],

  expectedTopics: ["consent", "contract", "legal obligation", "vital interests", "public task", "legitimate interests"],

  // Evaluation compares all 3 responses
  evaluationMode: "comparison"
}
```

**Comparison Report Output:**

```
Test: GDPR_COMPARISON_001
Question: "What are the legal bases for processing under GDPR Article 6?"

Results:
┌──────────────────────┬──────────┬──────────┬───────┬──────┐
│ Routing Profile      │ Accuracy │ Time (ms)│ Cost  │ Pass │
├──────────────────────┼──────────┼──────────┼───────┼──────┤
│ direct_openai_gpt4   │ 100%     │ 2,340    │ $0.03 │ ✓    │
│ local_llama3_70b     │ 83%      │ 4,120    │ $0.00 │ ✓    │
│ arioncomply_cloud    │ 100%     │ 3,890    │ $0.04 │ ✓    │
└──────────────────────┴──────────┴──────────┴───────┴──────┘

Analysis:
- Local model (Llama 3 70B): Missed "legitimate interests" and "public task"
- ArionComply pipeline: Added GDPR Article 6 citation (value-add from RAG)
- Cost savings: Local model = $0.00 vs Cloud = $0.03-0.04 per query
```

### 4.5 Routing Profile Selection

**Priority Order:**

1. **Test-level override:** `routingProfile` field in test definition
2. **Taxonomy default:** Different defaults for different test types
   - Compliance tests → `direct_openai_gpt4`
   - Platform tests → Customer pipeline (e.g., `arioncomply_local_dev`)
   - Enterprise tasks → `local_llama3_70b`
3. **Environment default:** Based on NODE_ENV (development, staging, production)
4. **System default:** Fallback to `direct_openai_gpt4`

**Configuration File:** `config.routing.js`

Contains all routing profile definitions, transformers, and selection logic.

### 4.6 Tool Calling Architecture

**Tool calling tests** validate LLM ability to correctly use functions/tools provided by the system.

**Design Overview:**

```
┌──────────────────────────────────────────────────────────────┐
│                   Tool Calling Test                          │
│  - Question requiring tool use                               │
│  - Tool definitions (OpenAI function calling format)         │
│  - Expected tool calls with parameters                       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│              Capability Check                                │
│  - Does selected model support tool calling?                 │
│  - If NO → Skip test or warn user                           │
│  - If YES → Proceed                                          │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│              Send to LLM with Tools                          │
│  - Format: OpenAI function calling standard                  │
│  - Include: question + tool definitions                      │
│  - Model responds with tool calls                            │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│              Validate Tool Calls                             │
│  - Correct tool selected?                                    │
│  - Parameters correct? (names, types, values)                │
│  - Sequence correct? (for chaining)                          │
│  - Error handling appropriate?                               │
└──────────────────────────────────────────────────────────────┘
```

**Tool Calling Taxonomy:**

| Complexity Level | Description | Example |
|-----------------|-------------|---------|
| **Single** | One tool, simple parameters | "Query database for GDPR controls" → `query_db(standard="GDPR")` |
| **Multi-Selection** | Choose correct tool from 5-10 options | "Send email to user" → Select `send_email` NOT `create_ticket` |
| **Complex Parameters** | Nested objects, arrays, optional fields | `create_report({filters: {standards: ["GDPR"], status: ["gap"]}, format: "PDF"})` |
| **Chaining** | Sequential tool use (output → input) | Query DB → Analyze results → Generate report |
| **Parallel** | Multiple simultaneous tool calls | Query users table + Query orgs table → Join results |

**Tool Domains:**

1. **Data Retrieval** - Database queries, API calls, search
2. **Transformation** - Format conversion, calculations, data manipulation
3. **External Actions** - Send email, create ticket, schedule event
4. **Code Execution** - Run code, compile, test, deploy
5. **Workflow** - Multi-step orchestration, approval chains

**Error Scenarios:**

Tests should cover both success and error cases:
- **Perfect:** All parameters present and valid
- **Missing Params:** Required parameters not provided (should ask for them)
- **Invalid Params:** Wrong type, out of range (should validate and reject)
- **Tool Unavailable:** Tool doesn't exist (should gracefully degrade)
- **Ambiguous Selection:** Multiple tools could work (should clarify intent)

**Tool Calling Test Example:**

```javascript
{
  id: "TOOL_MULTI_SELECT_COMPLIANCE_ACTION_1",
  category: "tool_calling_test",
  vendor: "Generic",

  toolCalling: {
    enabled: true,
    toolComplexity: "multi_selection",
    toolDomain: "data_retrieval",
    toolCount: 5,

    toolDefinitions: [
      { function: { name: "query_controls", description: "Search compliance controls" } },
      { function: { name: "query_assessments", description: "Search gap assessments" } },
      { function: { name: "query_evidence", description: "Search evidence repository" } },
      { function: { name: "create_report", description: "Generate compliance report" } },
      { function: { name: "send_email", description: "Send email notification" } }
    ],

    expectedToolCalls: [{
      tool: "query_controls",  // Should select this tool
      parameters: { standard: "GDPR", keyword: "encryption" }
    }]
  },

  question: "Find all GDPR controls related to encryption",

  modelRequirements: {
    requiredCapabilities: {
      toolCalling: true  // MUST support tools
    },
    recommendedModels: ["gpt-4o", "claude-3-5-sonnet"],
    unsuitableModels: ["llama3-70b", "mistral-7b", "qwen-14b"]
  },

  expectedTopics: ["GDPR", "encryption", "Article 32", "controls"],
  complexity: "intermediate"
}
```

---

## 5. ArionComply TIER System (First Customer Example)

### 5.1 Overview

**ArionComply** is the **first customer** of the LLM test suite, demonstrating how customer-specific pipelines can be integrated.

ArionComply uses a multi-tier prompt construction system that combines:
- **TIER 1:** Base system identity (always included)
- **TIER 2:** Situation-specific expertise (one selected)
- **TIER 3:** Organization context (customer-specific)
- **TIER 4:** AI-powered suggestions (optional)

### 5.2 TIER Definitions

**TIER 1: Base System Prompt**
- Purpose: Core ArionComply AI identity and capabilities
- Priority: 100 (highest)
- Selection: ALL tier 1 prompts concatenated
- Size: ~7,500 characters (~1,875 tokens)
- Components:
  - `base-system.md` - Core identity
  - `assessment-answer-parser.md` - JSON extraction
  - `assessment-conversation-guide.md` - Friendly tone
  - `clarification-instructions.md` - When to ask questions

**TIER 2: Situational Context**
- Purpose: Framework expertise or operational mode
- Priority: 70-90
- Selection: ONE tier 2 prompt chosen dynamically
- Size: ~4,000-62,000 characters (~1,000-15,500 tokens)
- Selection Logic (priority order):
  1. Assessment mode → `modes/assessment.md`
  2. Framework hint → `frameworks/{framework}.md`
  3. Value keywords → `product/value-proposition.md`
  4. Product keywords → `product/arioncomply-guide.md`
  5. General fallback → `modes/general.md`

**TIER 3: Context Enrichment**
- Purpose: Organization-specific personalization
- Priority: 50-60
- Selection: Conditional (if org profile available)
- Size: ~350 characters (~90 tokens)
- Template: `org-profile-context.md`
- Variables:
  - `{industry}` - Healthcare, Finance, Technology, etc.
  - `{org_size}` - 1-50, 51-250, 251-1000, 1000+
  - `{region}` - EU, US, UK, Global
  - `{frameworks}` - Licensed frameworks (GDPR, ISO 27001, etc.)
  - `{maturity_level}` - Initial, Developing, Defined, Managed, Optimizing

**TIER 4: AI-Powered Suggestions**
- Purpose: Suggest 5 follow-up actions
- Priority: Enhancement
- Selection: Optional (feature flag controlled)
- Size: ~500 characters (~125 tokens)
- Generated dynamically by `PromptBuilder.buildSuggestionsPrompt()`

### 5.3 Intent Classification System

**23 Intent Categories:**

**Core Intents:**
- `general_question` - Broad compliance questions
- `assessment` - Gap assessment workflows
- `implementation` - Control implementation guidance
- `documentation` - Documentation requirements
- `audit_preparation` - Audit readiness

**Framework-Specific Intents:**
- `gdpr_guidance` - GDPR-specific questions
- `iso27001_guidance` - ISO 27001-specific questions
- `soc2_guidance` - SOC 2-specific questions
- `euai_guidance` - EU AI Act-specific questions

**Feature-Specific Intents:**
- `evidence_management` - Evidence upload/organization
- `risk_management` - Risk assessment and treatment
- `policy_management` - Policy creation and maintenance
- `vendor_management` - Third-party risk assessment
- `incident_management` - Incident response
- `ai_governance` - AI system governance

**Data Operations Intents:**
- `data_subject_request` - GDPR data subject rights
- `privacy_operations` - Privacy program operations
- `data_classification` - Data categorization

**Reporting Intents:**
- `compliance_reporting` - Generate compliance reports
- `dashboard_navigation` - UI navigation help
- `report_generation` - Report creation

**Clarification Intents:**
- `needs_clarification` - Ambiguous request
- `needs_context` - Missing required context

### 5.4 Database Integration

**ArionComply Platform Tables:**

1. **`prompt_templates`** table:
   - Stores TIER 1, 2, 3 prompts
   - Fields: `id`, `tier`, `name`, `priority`, `content`, `variables`
   - Maps to test prompts via `tier2Mode` field

2. **`test_settings`** table:
   - Stores configuration per org/user
   - Fields: `retrieval_bypass_config`, `llm_routing_config`, `ai_backend_config`
   - Determines which LLM and retrieval strategy to use

3. **`organizations`** table:
   - Stores org profile for TIER 3 context
   - Fields: `org_id`, `org_settings` (JSONB with industry, size, region, etc.)

**Test Prompt Alignment:**
- Test prompts in llm-test-suite mirror production prompt construction
- `tier2Mode` field maps to TIER 2 prompt selection
- `orgProfile` field provides TIER 3 context variables
- Enables realistic testing of production prompt behavior

---

## 6. File Organization Principles

### 6.1 Directory Structure

**Current Organization:**

```
llm-test-suite/
├── README.md
├── docs/                          # Design documentation
│   ├── DESIGN.md
│   ├── PROMPT-SCHEMA.md
│   └── TAXONOMY-GUIDE.md
├── enterprise/                    # Enterprise test data
│   ├── test-data-generator.js   # Generic compliance (vendor: "Generic")
│   ├── compliance-standards.js  # Standard metadata
│   ├── user-personas.js        # Persona definitions
│   ├── enterprise-test-runner.js
│   └── arioncomply-workflows/  # ArionComply-specific (vendor: "ArionComply")
│       ├── ui-tasks.js
│       ├── ai-backend-multi-tier-tests.js
│       ├── intent-classification-tests.js
│       └── next-action-tests.js
├── reports/                      # Generated outputs
│   ├── prompts/
│   │   ├── prompt-viewer.html
│   │   ├── compliance-prompts.md
│   │   └── arioncomply-prompts.md
│   └── test-results-*.json
└── analysis-dashboard.html      # Results visualization
```

### 6.2 Naming Conventions

**File Naming:**
- Kebab-case for files: `ai-backend-multi-tier-tests.js`
- Descriptive names indicating content: `intent-classification-tests.js`
- Group related files in vendor directories: `arioncomply-workflows/`

**Test ID Naming:**
- Format: `{VENDOR}_{STANDARD}_{KNOWLEDGETYPE}_{PERSONA}_{INDEX}`
- Examples:
  - Generic: `GDPR_FACTUAL_NOVICE_1`
  - Vendor: `ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1`
- Vendor prefix optional for Generic tests
- Vendor prefix required for vendor-specific tests

**Constant Naming:**
- PascalCase for exported objects: `AI_BACKEND_MULTI_TIER_TESTS`
- SCREAMING_SNAKE_CASE for individual tests: `ASSESSMENT_START_GDPR_NOVICE_1`

### 6.3 Scalability Strategy

**Adding New Vendors:**

1. Create vendor directory: `enterprise/{vendor-name}-tests/`
2. Create test files following existing patterns
3. Use `vendor: "VendorName"` in all test objects
4. Export tests for consumption by test-data-generator.js
5. No changes needed to viewer or test runner (dynamic)

**Adding New Standards:**

1. Add standard to `compliance-standards.js`
2. Define metadata (category, jurisdiction, keyTopics, retrievalNeeds)
3. Generate prompts using test-data-generator.js
4. Standard appears automatically in viewer filters

**Adding New Personas:**

1. Add persona to `user-personas.js`
2. Define characteristics (expertise, queryStyle, expectedBehavior)
3. Generate prompts for new persona
4. Persona appears automatically in viewer filters

---

## 7. Integration Patterns

### 7.1 Test Runner Integration

**Test Execution Flow:**

```
1. Load test data (JSON/JS)
   ↓
2. Filter tests (vendor, standard, persona, complexity)
   ↓
3. For each test:
   a. Construct prompt (TIER 1+2+3+4 if ArionComply)
   b. Send to LLM API
   c. Capture response
   d. Evaluate against expectedTopics/expectedBehavior
   ↓
4. Generate report (JSON, CSV, HTML)
```

### 7.2 Viewer Integration

**Data Flow:**

```
Test Data (JS files)
   ↓
test-data-generator.js (generates unified JSON)
   ↓
prompt-viewer.html (embedded JSON const)
   ↓
User filters (vendor, standard, persona, etc.)
   ↓
Filtered display
```

**Viewer Requirements:**
- Display all test prompts with metadata
- Filter by: vendor, category, standard, knowledge type, persona, complexity
- Search by question text
- Show vendor statistics and comparison
- No vendor-specific UI hardcoding (dynamic from data)

### 7.3 ArionComply Database Sync

**Sync Strategy:**

- Test prompts in llm-test-suite are **test data**
- ArionComply `prompt_templates` table stores **production prompts**
- Keep separate but aligned:
  - Test: Validates prompt construction logic
  - Production: Serves actual customer requests
- Sync process:
  1. Update production prompts in database
  2. Mirror changes in test prompt TIER content
  3. Run tests to validate behavior

---

## 8. Design Rationale

### 8.1 Why Multi-Taxonomy Approach?

**Different test types require different classification systems:**

1. **Compliance tests** need: Standard × KnowledgeType × Persona
   - Domain coverage (29 standards)
   - Cognitive tasks (5 knowledge types)
   - Expertise levels (6 personas)
   - Potential combinations: 29 × 5 × 6 = **870 scenarios**

2. **Enterprise task tests** need: TaskDomain × TaskType × BusinessFunction
   - Real-world business tasks (7 domains)
   - Task operations (5 types)
   - Department context (6 functions)
   - Potential combinations: 7 × 5 × 6 = **210 scenarios**

3. **Platform feature tests** need: PlatformFeature × FeatureAction × UserContext
   - Customer-specific features (extensible per customer)
   - CRUD operations (5 actions)
   - User skill levels (4 contexts)
   - Combinations vary by customer platform

**Why not force all tests into one taxonomy?**
- Compliance questions are fundamentally different from "summarize this document"
- Platform navigation questions don't map to compliance standards
- Flexibility to add new use cases without forcing artificial mappings

### 8.2 Why Separate Vendor Field?

**Alternatives Considered:**

1. **Category namespace:** `arioncomply_workflow` (REJECTED)
   - Couples vendor to category
   - Can't have generic + vendor tests in same category
   - Not flexible

2. **Directory-only separation:** (REJECTED)
   - File organization isn't data taxonomy
   - Viewer can't filter without parsing paths
   - Tight coupling to file structure

3. **Separate vendor metadata field:** (CHOSEN)
   - Orthogonal to existing taxonomy
   - Enables filtering and comparison
   - Scales to unlimited vendors
   - No code changes for new vendors

### 8.3 Why Routing Abstraction Layer?

**Problem:** Each LLM backend has different APIs, authentication, request/response formats

**Solution:** Routing adapter with profile-specific transformers

- **Unified interface:** Tests don't care about backend details
- **Easy comparison:** Same test, multiple backends, normalized responses
- **Maintainability:** API changes isolated to transformers
- **Extensibility:** Add new backends without changing tests

### 8.4 Why TIER System for ArionComply?

**Problem:** Static prompts can't adapt to different user contexts

**Solution:** Multi-tier dynamic assembly

- TIER 1: Consistent identity across all requests
- TIER 2: Adapt to request type (assessment vs implementation)
- TIER 3: Personalize to organization profile
- TIER 4: Enhance with contextual suggestions

**Benefits:**
- Better accuracy (relevant expertise injected)
- Better UX (personalized guidance)
- Efficient token usage (only relevant context included)

---

## 9. Future Extensibility

### 9.1 Planned Extensions

**Additional Vendors:**
- Salesforce Compliance Cloud
- AWS Audit Manager
- Azure Compliance Manager
- ServiceNow GRC

**Additional Standards:**
- NIST 800-53 (rev 5)
- CIS Controls v8
- ISO 42001 (AI Management)
- State privacy laws (VCDPA, CPA, CTDPA)

**Additional Personas:**
- Data Protection Officer (DPO)
- Chief Information Security Officer (CISO)
- Legal Counsel
- Privacy Engineer

### 9.2 Backward Compatibility

**Schema Versioning:**
- Version field in metadata: `"version": "2.1.0"`
- Major version change: Breaking schema changes
- Minor version: New optional fields
- Patch version: Clarifications, no schema change

**Migration Strategy:**
- Old tests without `vendor` field: Treat as `vendor: "Generic"`
- New required fields: Provide defaults in test-data-generator
- Deprecated fields: Keep for 2 major versions before removal

---

## 10. Success Metrics

**Test Suite Health:**
- Coverage: % of [Standard × KnowledgeType × Persona] combinations tested
- Vendor balance: Ratio of Generic to Vendor-specific tests
- Taxonomy growth: New standards/personas added per quarter

**Test Quality:**
- Prompt clarity: Avg characters per question
- Expected topics: Avg topics per test (target: 3-5)
- Complexity distribution: % beginner/intermediate/advanced

**Platform Value:**
- Vendor adoption: Number of vendors with custom tests
- Comparison insights: Generic vs Vendor accuracy delta
- Execution frequency: Tests run per week

---

## 11. References

**Related Documentation:**
- PROMPT-SCHEMA.md - Formal schema specification
- TAXONOMY-GUIDE.md - Guidelines for extending taxonomy
- METRICS-DOCUMENTATION.md - Complexity scoring system
- README.md - Quick start and overview

**Code References:**
- `enterprise/test-data-generator.js` - Test generation logic
- `enterprise/arioncomply-workflows/prompt-schema-aligned.js` - TIER system implementation
- `reports/prompts/prompt-viewer.html` - Test visualization

---

Questions: libor@arionetworks.com
