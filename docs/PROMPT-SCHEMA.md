# Test Prompt Schema Specification

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/docs/PROMPT-SCHEMA.md
**Description:** Formal JSON schema specification for LLM test prompts
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-25

---

## 1. Schema Overview

### 1.1 Format

All test prompts follow a consistent JSON schema supporting:
- **Generic enterprise task testing** (vendor-agnostic business use cases)
- **Compliance knowledge testing** (regulatory frameworks and standards)
- **Customer platform testing** (customer-specific features and workflows)
- **Multi-backend routing** (direct LLM, customer pipelines, local models)
- **Multi-dimensional filtering** (vendor, domain, complexity, persona)
- **Performance benchmarking** (accuracy, speed, cost comparison)

### 1.2 Schema Version

**Current Version:** `2.3.0`

**What's New in 2.3.0:**
- Added ground truth validation fields (`mustMention`, `mustNotMention`, `referenceAnswer`, `answerKeyPoints`)
- Added authoritative reference fields (`expectedReferenceURL`, `alternativeReferenceURL`, `referenceSource`)
- Added validation rubric support (`validationRubric`, `exampleAnswers`)
- Enables fact-checking and quality assessment beyond keyword matching

**What's New in 2.2.0:**
- Added routing configuration fields (`routingProfile`, `routingProfiles`)
- Added enterprise task taxonomy fields (`taskDomain`, `taskType`, `businessFunction`)
- Added platform feature taxonomy fields (`platformFeature`, `featureAction`, `userContext`)
- Changed categorization requirements: AT LEAST ONE taxonomy required (compliance OR enterprise OR platform)

**Versioning:**
- Major version: Breaking changes (e.g., required field added)
- Minor version: New optional fields
- Patch version: Clarifications, no structural changes

---

## 2. Base Schema (All Test Types)

### 2.1 Required Fields

```typescript
interface TestPromptBase {
  // Unique identifier
  id: string;                    // Format: {VENDOR}_{STANDARD}_{TYPE}_{PERSONA}_{N}

  // Categorization
  category: string;              // Test category (see taxonomy)
  vendor: string | null;         // "Generic" | "ArionComply" | "VendorName" | null

  // The actual test question
  question: string;              // The prompt sent to LLM

  // Expected behavior
  expectedTopics: string[];      // Topics that should appear in response

  // Complexity
  complexity: "beginner" | "intermediate" | "advanced" | "expert";
}
```

### 2.2 Taxonomy Fields (At Least ONE Taxonomy Required)

```typescript
interface TestPromptTaxonomy {
  // TAXONOMY A: Compliance Testing (for regulatory/framework tests)
  standard?: string;             // "GDPR" | "ISO_27001" | "SOC_2" | etc.
  knowledgeType?: "FACTUAL" | "RELATIONAL" | "PROCEDURAL" | "EXACT_MATCH" | "SYNTHESIS";
  persona?: "NOVICE" | "PRACTITIONER" | "MANAGER" | "AUDITOR" | "EXECUTIVE" | "DEVELOPER";

  // TAXONOMY B: Enterprise Task Testing (for business use case tests)
  taskDomain?: string;           // "customer_service" | "document_processing" | "code_development" | etc.
  taskType?: "generate" | "analyze" | "transform" | "classify" | "extract";
  businessFunction?: string;     // "sales" | "support" | "finance" | "hr" | "engineering" | "operations";

  // TAXONOMY C: Platform Feature Testing (for customer platform tests)
  platformFeature?: string;      // "evidence_management" | "assessment_workflows" | etc.
  featureAction?: "upload" | "view" | "update" | "delete" | "configure";
  userContext?: "first_time" | "power_user" | "admin" | "auditor";
}

// VALIDATION RULE: At least ONE of the following must be present:
// - Compliance: (standard AND knowledgeType) OR persona
// - Enterprise: (taskDomain AND taskType) OR businessFunction
// - Platform: (platformFeature AND featureAction) OR userContext
```

### 2.3 Routing Configuration Fields

```typescript
interface TestPromptRouting {
  // Single routing profile
  routingProfile?: string;       // "arioncomply_local_dev" | "direct_openai_gpt4" | "local_llama3_70b"

  // Multi-route comparison testing
  routingProfiles?: string[];    // ["arioncomply_cloud_dev", "direct_gpt4", "local_llama"]

  // Routing context (for customer pipelines)
  routingContext?: {
    framework?: string;          // Framework hint for TIER 2 selection
    assessmentMode?: boolean;    // Enable assessment mode
    orgProfile?: OrganizationProfile;  // Organization context for TIER 3
    sessionId?: string;          // Conversation session ID
  };
}
```

### 2.4 Validation & Metadata Fields

```typescript
interface TestPromptValidation {
  // Validation criteria
  expectedCitation?: string | null;     // Exact citation required (e.g., "Article 6")
  expectedBehavior?: string;            // Expected LLM behavior description
  expectedGuidance?: string[];          // Step-by-step guidance expected
  expectedSteps?: string[];             // Workflow steps expected
  expectedClarifications?: string[];    // Clarifying questions LLM should ask

  // Retrieval strategy
  retrievalStrategy?: "vector_db" | "knowledge_graph" | "structured_retrieval" |
                      "meilisearch" | "rag_synthesis" | "hybrid";

  // Performance metadata
  promptComplexity?: PromptComplexity;  // Auto-calculated complexity scores
  estimatedTokens?: number;             // Estimated prompt size in tokens
}
```

### 2.5 Ground Truth & Reference Fields (NEW in v2.3.0)

```typescript
interface TestPromptGroundTruth {
  // Authoritative references
  expectedReferenceURL?: string;        // Primary authoritative source URL
  alternativeReferenceURL?: string;     // Free alternative if primary is paywall
  referenceSource?: string;             // Human-readable source name (e.g., "EUR-Lex GDPR Article 17")
  referenceAccessibility?: "free" | "paywall" | "free-with-registration";
  referenceNote?: string;               // Instructions for accessing reference

  // Ground truth validation
  mustMention?: string[];               // Essential facts/concepts that MUST appear in response
  mustNotMention?: string[];            // Common misconceptions that must NOT appear
  referenceAnswer?: string;             // Expert-written full reference answer
  answerKeyPoints?: AnswerKeyPoint[];   // Structured key points with weights
  validationRubric?: ValidationRubric;  // Multi-dimensional scoring rubric
  exampleAnswers?: ExampleAnswers;      // Example answers at different quality levels
}

interface AnswerKeyPoint {
  concept: string;                      // What must be explained
  keywords: string[];                   // Acceptable variations/synonyms
  weight: number;                       // Importance score (0-100)
  required: boolean;                    // Must be present for passing score
  alternatives?: string[];              // Alternative phrasings that satisfy this point
}

interface ValidationRubric {
  dimensions: RubricDimension[];        // Scoring dimensions (e.g., accuracy, completeness)
  minimumPassingScore: number;          // Minimum score to pass (0-100)
  scoringMethod?: "weighted" | "average" | "minimum";
}

interface RubricDimension {
  name: string;                         // Dimension name (e.g., "Factual Accuracy")
  weight: number;                       // Weight in overall score (0-100)
  levels: {                             // Quality levels for this dimension
    excellent: string;                  // Description of excellent performance
    good: string;                       // Description of good performance
    poor: string;                       // Description of poor performance
    fail: string;                       // Description of failing performance
  };
}

interface ExampleAnswers {
  excellent?: {                         // Comprehensive, accurate answer
    answer: string;
    score: number;
    strengths: string[];
  };
  acceptable?: {                        // Adequate, correct answer
    answer: string;
    score: number;
    strengths: string[];
    weaknesses?: string[];
  };
  insufficient?: {                      // Incomplete or incorrect answer
    answer: string;
    score: number;
    weaknesses: string[];
  };
}
```

### 2.5 Customer-Specific Extensions

#### ArionComply Multi-Tier Tests (First Customer Example)

```typescript
interface ArionComplyMultiTierTest extends TestPromptBase {
  vendor: "ArionComply";
  category: "ai_backend_multitier";

  // TIER configuration
  tier2Mode: "assessment" | "framework-gdpr" | "framework-iso27001" |
             "product-value" | "product-features" | "general";
  tier1Content: string;           // TIER 1 base system prompt
  tier2Content: string;           // TIER 2 situational prompt
  tier3Context: OrganizationProfile;  // TIER 3 org context

  // Organization profile for TIER 3
  orgProfile: OrganizationProfile;

  // Conversation history (for mid-conversation tests)
  conversationHistory: ConversationMessage[];

  // Full assembled prompt
  fullPrompt: string;             // TIER1 + TIER2 + TIER3 + user message
}

interface OrganizationProfile {
  industry: string;               // "Healthcare" | "Finance" | "Technology" | etc.
  org_size: string;              // "1-50" | "51-250" | "251-1000" | "1000+"
  region: string;                // "EU" | "US" | "UK" | "Global"
  frameworks: string[];          // ["GDPR", "ISO_27001", ...]
  maturity_level: string;        // "Initial" | "Developing" | "Defined" | "Managed" | "Optimizing"
  profile_completion: number;    // 0-100
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}
```

#### ArionComply Workflow Tests

```typescript
interface ArionComplyWorkflowTest extends TestPromptBase {
  vendor: "ArionComply";
  category: "arioncomply_workflow";

  // Workflow metadata
  taskCategory: string;          // "evidence_management" | "assessment" | etc.
  task: string;                  // Task description
  contextLevel: "complete_context" | "missing_standard" | "minimal_context";
  userType: "NOVICE" | "PRACTITIONER" | "MANAGER" | "AUDITOR";

  // Prompt variations
  prompts: {
    complete_context: string;
    missing_standard?: string;
    missing_control?: string;
    minimal_context?: string;
  };

  // Expected behavior
  expectedGuidance: string[];
  expectedClarifications?: string[];
}
```

### 2.6 Tool Calling Fields

```typescript
interface ToolCallingTest extends TestPromptBase {
  // Tool calling configuration
  toolCalling: {
    enabled: true;                                    // Tool calling required

    toolComplexity: "single" |                        // One tool, simple params
                    "multi_selection" |               // Choose from multiple tools
                    "complex_params" |                // Nested objects, arrays
                    "chaining" |                      // Sequential tool use
                    "parallel";                       // Multiple tools simultaneously

    toolDomain: "data_retrieval" |                    // Database queries, API calls
                "transformation" |                    // Format conversion, calculation
                "external_action" |                   // Send email, create ticket
                "code_execution" |                    // Run code, compile, test
                "workflow";                           // Multi-step orchestration

    toolCount: number;                                // Number of tools available

    toolDefinitions: Array<{                          // Actual tool schemas (OpenAI format)
      type: "function";
      function: {
        name: string;                                 // Tool name
        description: string;                          // What it does
        parameters: {                                 // JSON Schema for parameters
          type: "object";
          properties: Record<string, any>;
          required: string[];
        };
      };
    }>;

    expectedToolCalls: Array<{                        // Expected behavior
      tool: string;                                   // Tool name
      parameters: Record<string, any>;                // Expected parameters
      sequence?: number;                              // For chaining (1, 2, 3...)
      optional?: boolean;                             // Is this call optional?
    }>;

    errorScenario?: "perfect" |                       // All params present and valid
                    "missing_params" |                // Required params missing
                    "invalid_params" |                // Type mismatch, out of range
                    "tool_unavailable" |              // Tool doesn't exist
                    "ambiguous_selection";            // Multiple tools could work
  };
}
```

**Example Tool Calling Test:**

```typescript
{
  id: "TOOL_DATABASE_QUERY_GDPR_CONTROLS_1",
  category: "tool_calling_test",
  vendor: "Generic",
  question: "Find all GDPR controls related to encryption in the database",

  toolCalling: {
    enabled: true,
    toolComplexity: "single",
    toolDomain: "data_retrieval",
    toolCount: 1,

    toolDefinitions: [{
      type: "function",
      function: {
        name: "query_database",
        description: "Query the compliance database for controls",
        parameters: {
          type: "object",
          properties: {
            standard: { type: "string", enum: ["GDPR", "ISO_27001", "SOC_2"] },
            keyword: { type: "string" },
            limit: { type: "number", default: 10 }
          },
          required: ["standard"]
        }
      }
    }],

    expectedToolCalls: [{
      tool: "query_database",
      parameters: {
        standard: "GDPR",
        keyword: "encryption"
      }
    }],

    errorScenario: "perfect"
  },

  expectedTopics: ["database query", "GDPR", "encryption", "Article 32"],
  complexity: "intermediate"
}
```

### 2.7 Model Requirement Fields

```typescript
interface ModelRequirements {
  // Capability requirements
  requiredCapabilities?: {
    toolCalling?: boolean;                            // Model MUST support function calling
    minimumContextWindow?: number;                    // Minimum tokens (e.g., 8192, 32000, 128000)
    minimumReasoningDepth?: "low" | "medium" | "high" | "very_high";
    structuredOutput?: boolean;                       // Model MUST support JSON mode
    codeGeneration?: "basic" | "intermediate" | "advanced";
    multilingualSupport?: boolean;
    conversationTracking?: boolean;                   // Can maintain multi-turn context
  };

  // Model recommendations
  recommendedModels?: string[];                       // Models known to work well for this test
  unsuitableModels?: string[];                        // Models that will fail/perform poorly

  // Performance expectations
  minimumModelSize?: "1B" | "7B" | "14B" | "70B";    // For local models
  maxAcceptableLatency?: number;                      // ms (for time-sensitive tasks)

  // Cost considerations
  costSensitive?: boolean;                            // Prefer local/cheap models if possible
  accuracyCritical?: boolean;                         // Must use best model regardless of cost
}
```

**Example with Model Requirements:**

```typescript
{
  id: "COMPLEX_TOOL_CHAIN_ISO27001_RISK_1",
  question: "Query the risk database, analyze findings, and generate a remediation plan",

  toolCalling: {
    enabled: true,
    toolComplexity: "chaining",
    toolCount: 3,
    toolDefinitions: [/* query_db, analyze_risk, generate_plan */],
    expectedToolCalls: [
      { tool: "query_db", parameters: {...}, sequence: 1 },
      { tool: "analyze_risk", parameters: {...}, sequence: 2 },
      { tool: "generate_plan", parameters: {...}, sequence: 3 }
    ]
  },

  modelRequirements: {
    requiredCapabilities: {
      toolCalling: true,                              // ✅ MUST support tools
      minimumContextWindow: 32000,                    // Need space for multi-turn
      minimumReasoningDepth: "high"                   // Complex reasoning required
    },
    recommendedModels: ["gpt-4o", "claude-3-5-sonnet"],
    unsuitableModels: ["llama3-70b", "mistral-7b"],   // No tool support
    accuracyCritical: true                            // Use best models
  },

  expectedTopics: ["risk analysis", "remediation", "prioritization"],
  complexity: "advanced"
}
```

---

## 3. Field Definitions

### 3.1 Core Fields

#### `id` (required)

**Type:** `string`

**Format:** `{VENDOR}_{STANDARD}_{KNOWLEDGETYPE}_{PERSONA}_{INDEX}`

**Examples:**
- Generic test: `GDPR_FACTUAL_NOVICE_1`
- Vendor test: `ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1`

**Rules:**
- Must be unique across all tests
- SCREAMING_SNAKE_CASE
- Vendor prefix optional for Generic tests
- Vendor prefix required for vendor tests (use abbreviation if needed)
- Index starts at 1

#### `category` (required)

**Type:** `string`

**Allowed Values:**
- `"compliance_knowledge"` - Generic compliance tests
- `"arioncomply_workflow"` - ArionComply UI/workflow tests
- `"ai_backend_multitier"` - ArionComply multi-tier prompt tests
- `"intent_classification"` - Intent detection tests
- `"workflow_understanding"` - Step accuracy tests
- `"{vendor}_custom"` - Vendor-specific custom category

**Rules:**
- Use snake_case
- Should describe test purpose, not vendor
- Vendor-specific categories must include vendor prefix

#### `vendor` (required)

**Type:** `string | null`

**Allowed Values:**
- `"Generic"` - Vendor-agnostic compliance knowledge
- `"ArionComply"` - ArionComply platform-specific
- `null` - Legacy, treated as Generic
- Custom vendor names (PascalCase)

**Rules:**
- Use official brand name capitalization
- No abbreviations (except standard ones like "AWS")
- PascalCase format
- Cannot be empty string

**Examples:**
```json
{ "vendor": "Generic" }
{ "vendor": "ArionComply" }
{ "vendor": "Salesforce" }
{ "vendor": "AWS" }
{ "vendor": null }  // Legacy, treat as Generic
```

#### `question` (required)

**Type:** `string`

**Format:** Natural language question or statement

**Rules:**
- Must be clear and unambiguous
- Should be realistic (something a user would actually ask)
- Length: 5-500 characters recommended
- Should not include instructions to LLM (those go in system prompt)

**Examples:**
- ✅ "What is GDPR?"
- ✅ "How do I implement encryption for personal data?"
- ❌ "Explain GDPR. Be brief." (instruction included)
- ❌ "gdpr?" (too vague)

#### `expectedTopics` (required)

**Type:** `string[]`

**Format:** Array of keywords/phrases that should appear in response

**Rules:**
- Minimum 2 topics
- Maximum 10 topics recommended
- Use lowercase
- Be specific but not too narrow
- Include synonyms if multiple valid terms exist

**Examples:**
```json
{
  "question": "What is GDPR?",
  "expectedTopics": ["regulation", "privacy", "EU", "data protection", "personal data"]
}
```

#### `complexity` (required)

**Type:** `enum`

**Allowed Values:**
- `"beginner"` - Basic factual questions, simple concepts
- `"intermediate"` - Implementation details, moderate complexity
- `"advanced"` - Complex scenarios, multi-step processes
- `"expert"` - Synthesis, edge cases, deep technical knowledge

**Guidelines:**

| Level | Characteristics | Example |
|-------|----------------|---------|
| beginner | Single concept, factual recall | "What is GDPR?" |
| intermediate | Multiple concepts, practical application | "How do I implement consent management?" |
| advanced | Complex scenarios, trade-offs | "How should we handle cross-border transfers post-Schrems II?" |
| expert | Synthesis, edge cases, optimization | "Design a privacy-by-design architecture for a multi-tenant SaaS with EU and US customers" |

### 3.2 Compliance Taxonomy Fields

#### `standard` (optional)

**Type:** `string`

**Allowed Values:** See TAXONOMY-GUIDE.md for complete list (29 standards)

**Common Values:**
- `"GDPR"` - General Data Protection Regulation
- `"ISO_27001"` - Information Security Management
- `"SOC_2"` - Service Organization Control 2
- `"HIPAA"` - Health Insurance Portability and Accountability Act
- `"CCPA"` - California Consumer Privacy Act

**Rules:**
- Use SCREAMING_SNAKE_CASE for multi-word standards
- Use official acronyms where applicable
- `null` for non-compliance tests

#### `knowledgeType` (optional)

**Type:** `enum`

**Allowed Values:**
- `"FACTUAL"` - Definitions, requirements, facts
- `"RELATIONAL"` - Cross-references, mappings, relationships
- `"PROCEDURAL"` - Step-by-step processes, workflows
- `"EXACT_MATCH"` - Precise citations, exact regulatory text
- `"SYNTHESIS"` - Multi-document analysis, comparisons

**Guidelines:**

| Type | Question Characteristics | Example |
|------|-------------------------|---------|
| FACTUAL | "What is...", "Define...", "List..." | "What is personal data under GDPR?" |
| RELATIONAL | "How does X relate to Y?", "Map..." | "How does GDPR map to ISO 27701?" |
| PROCEDURAL | "How do I...", "What are the steps..." | "How do I conduct a DPIA?" |
| EXACT_MATCH | "What does Article X say?", "Quote..." | "What is the exact text of GDPR Article 6?" |
| SYNTHESIS | "Compare...", "Analyze...", "Synthesize..." | "Compare GDPR, CCPA, and PIPEDA breach notification requirements" |

#### `persona` (optional)

**Type:** `enum`

**Allowed Values:**
- `"NOVICE"` - New to compliance, needs explanations
- `"PRACTITIONER"` - Technical implementer, needs implementation details
- `"MANAGER"` - Strategic oversight, needs workflows and priorities
- `"AUDITOR"` - Verification-focused, needs evidence criteria
- `"EXECUTIVE"` - Business-focused, needs risk and ROI
- `"DEVELOPER"` - Code-focused, needs technical implementation

**Guidelines:**

| Persona | Characteristics | Expected Response Style |
|---------|----------------|------------------------|
| NOVICE | New to topic, needs context | Educational, explanatory, simple language |
| PRACTITIONER | Knows concepts, needs "how to" | Technical, step-by-step, practical |
| MANAGER | Strategic, needs workflows | Process-oriented, prioritization, delegation |
| AUDITOR | Verification-focused | Evidence-based, criteria, validation |
| EXECUTIVE | Business impact-focused | Risk, ROI, strategic value |
| DEVELOPER | Technical implementation | Code examples, architecture, APIs |

### 3.3 Validation Fields

#### `expectedCitation` (optional)

**Type:** `string | null`

**Format:** Specific article, section, or control reference

**When to Use:** Only for EXACT_MATCH knowledge type

**Examples:**
```json
{ "expectedCitation": "Article 6" }
{ "expectedCitation": "ISO 27001 Control A.8.2" }
{ "expectedCitation": "SOC 2 CC6.1" }
{ "expectedCitation": null }  // Not an exact citation test
```

#### `expectedBehavior` (optional)

**Type:** `string`

**Format:** Natural language description of expected LLM behavior

**Examples:**
```json
{
  "expectedBehavior": "Should initiate GDPR gap assessment workflow and ask first assessment question"
}
{
  "expectedBehavior": "Should parse the affirmative response, extract compliance status (YES) and evidence, then proceed to next control"
}
```

#### `expectedGuidance` (optional)

**Type:** `string[]`

**Format:** Array of expected step-by-step guidance

**When to Use:** For procedural questions or workflow tests

**Example:**
```json
{
  "question": "How do I upload evidence for a control?",
  "expectedGuidance": [
    "Navigate to the control detail page",
    "Click the Add Evidence button",
    "Select evidence type",
    "Upload file or provide link",
    "Add description and tags"
  ]
}
```

#### `expectedSteps` (optional)

**Type:** `string[]`

**Format:** Array of workflow steps

**When to Use:** For workflow understanding tests

**Example:**
```json
{
  "expectedSteps": [
    "Describe the processing activity",
    "Assess necessity and proportionality",
    "Identify risks to data subjects",
    "Determine mitigation measures",
    "Document in DPIA report"
  ]
}
```

#### `expectedClarifications` (optional)

**Type:** `string[]`

**Format:** Array of clarifying questions LLM should ask

**When to Use:** For ambiguous queries or incomplete context

**Example:**
```json
{
  "question": "How do I upload evidence?",
  "expectedClarifications": [
    "Which compliance standard are you working with?",
    "Which specific control do you need to provide evidence for?",
    "What type of evidence do you have? (document, screenshot, policy, etc.)"
  ]
}
```

### 3.4 Performance Metadata

#### `promptComplexity` (optional, auto-generated)

**Type:** `object`

**Format:**
```typescript
interface PromptComplexity {
  level: "simple" | "moderate" | "complex" | "very_complex";
  score: number;              // 0-100
  tokens: number;             // Estimated token count
  technicalDensity: number;   // Percentage of technical terms
  isMultiPart: boolean;       // Has multiple sub-questions
  hasComparison: boolean;     // Requires comparison
  performanceClass: "fast" | "medium" | "slow" | "very_slow";
}
```

**Auto-Calculated By:** test-data-generator.js

**Do Not Manually Set:** This field is computed automatically

#### `estimatedTokens` (optional)

**Type:** `number`

**Format:** Integer representing approximate token count

**When to Use:** For multi-tier tests where full prompt is assembled

**Example:**
```json
{ "estimatedTokens": 2300 }  // TIER1 + TIER2 + TIER3 + user message
```

#### `retrievalStrategy` (optional)

**Type:** `enum`

**Allowed Values:**
- `"vector_db"` - Semantic search via vector database
- `"knowledge_graph"` - Graph traversal for relationships
- `"structured_retrieval"` - SQL/database queries
- `"meilisearch"` - Fast text search
- `"rag_synthesis"` - Multi-document RAG synthesis
- `"hybrid"` - Combination of strategies

**Guidelines:**

| Strategy | Best For | Example |
|----------|---------|---------|
| vector_db | Semantic similarity, factual recall | "What is GDPR?" |
| knowledge_graph | Relationships, mappings | "How does GDPR relate to ISO 27001?" |
| structured_retrieval | Precise lookups, citations | "What does Article 6 say?" |
| meilisearch | Fast keyword search | "Find all controls about encryption" |
| rag_synthesis | Multi-document synthesis | "Compare GDPR and CCPA" |
| hybrid | Complex queries needing multiple strategies | "Explain GDPR data retention and show relevant controls" |

---

## 4. Categorization Requirements

### 4.1 Core Principle

**Every test MUST use AT LEAST ONE taxonomy system:**
- Taxonomy A: Compliance (standard, knowledgeType, persona)
- Taxonomy B: Enterprise Task (taskDomain, taskType, businessFunction)
- Taxonomy C: Platform Feature (platformFeature, featureAction, userContext)

Tests MAY use multiple taxonomies if applicable.

### 4.2 Required Field Combinations

**ALL Tests (regardless of taxonomy):**
```typescript
// ALWAYS REQUIRED:
id, category, vendor, question, expectedTopics, complexity
```

**Compliance Test (Taxonomy A):**
```typescript
// MUST have (in addition to base):
standard, knowledgeType
// OR at minimum:
standard, persona

// RECOMMENDED:
standard, knowledgeType, persona  // Full compliance taxonomy

// OPTIONAL:
expectedCitation, retrievalStrategy
```

**Enterprise Task Test (Taxonomy B):**
```typescript
// MUST have (in addition to base):
taskDomain, taskType
// OR at minimum:
taskDomain, businessFunction

// RECOMMENDED:
taskDomain, taskType, businessFunction  // Full enterprise taxonomy

// OPTIONAL:
expectedSteps, retrievalStrategy
```

**Platform Feature Test (Taxonomy C):**
```typescript
// MUST have (in addition to base):
platformFeature, featureAction, vendor: "CustomerName"
// OR at minimum:
platformFeature, userContext, vendor: "CustomerName"

// RECOMMENDED:
platformFeature, featureAction, userContext, vendor  // Full platform taxonomy

// OPTIONAL:
expectedGuidance, expectedClarifications, routingProfile
```

**Customer Pipeline Multi-Tier Test (ArionComply Example):**
```typescript
// MUST have (in addition to base):
vendor: "ArionComply",
category: "ai_backend_multitier",
tier2Mode, tier1Content, tier2Content, tier3Context, orgProfile, fullPrompt,
routingProfile: "arioncomply_*"  // Must route through customer pipeline

// RECOMMENDED:
estimatedTokens, conversationHistory

// OPTIONAL:
standard, knowledgeType, persona  // Can also use compliance taxonomy
```

### 4.3 Routing Profile Requirements

**Direct LLM Testing:**
```typescript
// Can omit routingProfile (defaults to direct_openai_gpt4)
{
  routingProfile: "direct_openai_gpt4"  // or "local_llama3_70b"
}
```

**Customer Pipeline Testing:**
```typescript
// MUST specify customer pipeline routing profile
{
  vendor: "ArionComply",
  routingProfile: "arioncomply_local_dev" | "arioncomply_cloud_dev" | "arioncomply_production"
}
```

**Multi-Route Comparison:**
```typescript
// Specify multiple profiles for comparison testing
{
  routingProfiles: [
    "direct_openai_gpt4",      // Cloud LLM baseline
    "local_llama3_70b",        // Local alternative
    "arioncomply_cloud_dev"    // Customer pipeline with RAG
  ]
}
```

### 4.4 Field Validation Rules

**`id` validation:**
- Must be unique
- Must match pattern: `^[A-Z][A-Z0-9_]+$`
- Must not exceed 100 characters

**`vendor` validation:**
- Cannot be empty string (use `null` or `"Generic"`)
- Must be PascalCase if not null

**`question` validation:**
- Minimum length: 5 characters
- Maximum length: 1000 characters
- Must not be only whitespace

**`expectedTopics` validation:**
- Minimum array length: 2
- Maximum array length: 20
- Each topic: 1-100 characters
- Should be lowercase (recommended, not enforced)

**`complexity` validation:**
- Must be one of: `"beginner"`, `"intermediate"`, `"advanced"`, `"expert"`

**`standard` validation:**
- Must be in allowed standards list (see TAXONOMY-GUIDE.md)
- Use SCREAMING_SNAKE_CASE

**`knowledgeType` validation:**
- Must be one of: `"FACTUAL"`, `"RELATIONAL"`, `"PROCEDURAL"`, `"EXACT_MATCH"`, `"SYNTHESIS"`

**`persona` validation:**
- Must be one of: `"NOVICE"`, `"PRACTITIONER"`, `"MANAGER"`, `"AUDITOR"`, `"EXECUTIVE"`, `"DEVELOPER"`

---

## 5. Examples

### 5.1 Generic Compliance Test (with Ground Truth - NEW in v2.3.0)

```json
{
  "id": "GDPR_FACTUAL_NOVICE_1",
  "category": "compliance_knowledge",
  "vendor": "Generic",
  "standard": "GDPR",
  "knowledgeType": "FACTUAL",
  "persona": "NOVICE",
  "question": "What is GDPR?",
  "expectedTopics": ["regulation", "privacy", "EU", "data protection"],
  "expectedCitation": null,
  "retrievalStrategy": "vector_db",
  "complexity": "beginner",

  "expectedReferenceURL": "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
  "referenceSource": "EUR-Lex (Official EU GDPR Text)",
  "referenceAccessibility": "free",

  "mustMention": [
    "EU regulation",
    "personal data",
    "effective 2018 OR May 2018"
  ],
  "mustNotMention": [
    "only applies to EU companies",
    "GDPR is optional"
  ],
  "referenceAnswer": "GDPR (General Data Protection Regulation) is a comprehensive EU privacy regulation that came into effect on May 25, 2018. It governs how organizations collect, process, and store personal data of EU residents. It applies globally to any organization processing EU personal data, regardless of where the organization is located.",

  "promptComplexity": {
    "level": "simple",
    "score": 30,
    "tokens": 4,
    "technicalDensity": 33.3,
    "isMultiPart": false,
    "hasComparison": false,
    "performanceClass": "fast"
  }
}
```

### 5.2 ArionComply Workflow Test

```json
{
  "id": "ARION_WORKFLOW_EVIDENCE_UPLOAD_1",
  "category": "arioncomply_workflow",
  "vendor": "ArionComply",
  "taskCategory": "evidence_management",
  "task": "Upload evidence for a control",
  "contextLevel": "complete_context",
  "userType": "PRACTITIONER",
  "question": "How do I upload evidence for ISO 27001 control A.8.2 in ArionComply?",
  "expectedTopics": ["navigate", "control detail", "add evidence", "upload"],
  "expectedGuidance": [
    "Navigate to the control detail page",
    "Click the Add Evidence button",
    "Select evidence type",
    "Upload file or provide link"
  ],
  "complexity": "beginner",
  "promptComplexity": {
    "level": "moderate",
    "score": 45,
    "tokens": 17,
    "technicalDensity": 25,
    "performanceClass": "medium"
  }
}
```

### 5.3 ArionComply Multi-Tier Test

```json
{
  "id": "ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1",
  "category": "ai_backend_multitier",
  "vendor": "ArionComply",
  "standard": "GDPR",
  "knowledgeType": "PROCEDURAL",
  "persona": "NOVICE",
  "tier2Mode": "assessment",
  "question": "I want to assess my GDPR compliance",
  "tier1Content": "You are ArionComply AI assistant...",
  "tier2Content": "Assessment mode system prompt...",
  "tier3Context": {
    "industry": "Healthcare",
    "org_size": "1-50",
    "region": "EU",
    "frameworks": ["GDPR"],
    "maturity_level": "Initial",
    "profile_completion": 30
  },
  "orgProfile": {
    "industry": "Healthcare",
    "org_size": "1-50",
    "region": "EU",
    "frameworks": ["GDPR"],
    "maturity_level": "Initial",
    "profile_completion": 30
  },
  "conversationHistory": [],
  "fullPrompt": "[TIER 1]...[TIER 2]...[TIER 3]...[USER]...",
  "expectedTopics": ["gap assessment", "questionnaire", "controls", "evidence"],
  "expectedBehavior": "Should initiate GDPR gap assessment workflow",
  "complexity": "beginner",
  "estimatedTokens": 2300,
  "promptComplexity": {
    "level": "high",
    "score": 92,
    "tokens": 2300,
    "technicalDensity": 50,
    "performanceClass": "slow"
  }
}
```

### 5.4 Enterprise Task Test

```json
{
  "id": "DOCUMENT_ANALYSIS_CONTRACT_SUMMARY_1",
  "category": "enterprise_task",
  "vendor": "Generic",
  "taskDomain": "document_processing",
  "taskType": "analyze",
  "businessFunction": "legal",
  "question": "Summarize this vendor contract and identify key risks and obligations",
  "expectedTopics": ["contract summary", "risk identification", "obligations", "key terms", "deadlines"],
  "expectedBehavior": "Should provide concise summary highlighting risks, obligations, payment terms, and important dates",
  "complexity": "intermediate",
  "routingProfile": "local_llama3_70b",
  "promptComplexity": {
    "level": "moderate",
    "score": 55,
    "tokens": 15,
    "technicalDensity": 25,
    "performanceClass": "medium"
  }
}
```

### 5.5 Platform Feature Test

```json
{
  "id": "ARION_PLATFORM_EVIDENCE_UPLOAD_1",
  "category": "platform_feature",
  "vendor": "ArionComply",
  "platformFeature": "evidence_management",
  "featureAction": "upload",
  "userContext": "first_time",
  "question": "How do I upload evidence for ISO 27001 control A.8.2 in ArionComply?",
  "expectedTopics": ["navigate to control", "add evidence button", "file upload", "link control"],
  "expectedGuidance": [
    "Navigate to Frameworks > ISO 27001 > Control A.8.2",
    "Click the Add Evidence button",
    "Choose upload file or link URL",
    "Add description and tags",
    "Save to link evidence to control"
  ],
  "complexity": "beginner",
  "routingProfile": "arioncomply_local_dev",
  "routingContext": {
    "framework": "iso27001"
  },
  "promptComplexity": {
    "level": "simple",
    "score": 35,
    "tokens": 18,
    "technicalDensity": 20,
    "performanceClass": "fast"
  }
}
```

### 5.6 Multi-Route Comparison Test

```json
{
  "id": "GDPR_ARTICLE6_MULTI_ROUTE_COMPARISON_1",
  "category": "comparison_test",
  "vendor": "Generic",
  "standard": "GDPR",
  "knowledgeType": "FACTUAL",
  "persona": "PRACTITIONER",
  "question": "What are the legal bases for processing personal data under GDPR Article 6?",
  "routingProfiles": [
    "direct_openai_gpt4",
    "local_llama3_70b",
    "arioncomply_cloud_dev"
  ],
  "expectedTopics": ["consent", "contract", "legal obligation", "vital interests", "public task", "legitimate interests"],
  "expectedBehavior": "Should list all 6 legal bases and explain each with examples",
  "complexity": "intermediate",
  "evaluationMode": "comparison",
  "comparisonCriteria": {
    "accuracy": "All 6 legal bases mentioned",
    "completeness": "Brief explanation of each",
    "citations": "Article 6 referenced",
    "examples": "At least one practical example per basis"
  }
}
```

---

## 6. Schema Versioning

### 6.1 Version History

**v2.2.0 (2026-03-25):**
- Added routing configuration fields (`routingProfile`, `routingProfiles`, `routingContext`)
- Added enterprise task taxonomy (`taskDomain`, `taskType`, `businessFunction`)
- Added platform feature taxonomy (`platformFeature`, `featureAction`, `userContext`)
- Changed categorization requirements: AT LEAST ONE taxonomy required
- Added multi-route comparison support
- Added `evaluationMode` and `comparisonCriteria` fields

**v2.1.0 (2026-03-25):**
- Added `vendor` field (required)
- Added ArionComply multi-tier test schema
- Added `tier2Mode`, `tier1Content`, `tier2Content`, `tier3Context`, `orgProfile`, `fullPrompt` fields
- Added `estimatedTokens` field

**v2.0.0 (2026-03-24):**
- Initial formal schema definition
- Migrated from implicit code-based schema

### 6.2 Migration Guide

**From v2.0.0 to v2.1.0:**

```javascript
// Old format (v2.0.0)
{
  "id": "GDPR_FACTUAL_NOVICE_1",
  "category": "compliance_knowledge",
  // No vendor field
}

// New format (v2.1.0)
{
  "id": "GDPR_FACTUAL_NOVICE_1",
  "category": "compliance_knowledge",
  "vendor": "Generic"  // ← Added
}
```

**Auto-migration rule:** If `vendor` field is missing, set to `"Generic"` for backward compatibility.

---

## 7. Best Practices

### 7.1 Writing Good Test Prompts

**DO:**
- ✅ Use realistic user questions
- ✅ Include diverse complexity levels
- ✅ Cover edge cases and common scenarios
- ✅ Provide 3-5 expectedTopics (not too many, not too few)
- ✅ Be specific about expected behavior

**DON'T:**
- ❌ Include LLM instructions in `question` field
- ❌ Use overly generic expectedTopics ("information", "data")
- ❌ Make questions too complex (split into multiple tests)
- ❌ Duplicate tests across vendors (use inheritance/variation instead)

### 7.2 Vendor-Specific Test Guidelines

**When to create vendor-specific tests:**
- ✅ Testing vendor platform features (UI workflows, APIs)
- ✅ Testing vendor-specific terminology or concepts
- ✅ Testing integrations unique to vendor

**When to use generic tests:**
- ✅ Standard compliance knowledge (GDPR articles, ISO controls)
- ✅ Industry-standard concepts
- ✅ Regulatory requirements

### 7.3 Complexity Assignment

**Assign complexity based on:**
- Number of concepts involved (1 = beginner, 3+ = advanced)
- Cognitive load required (recall < apply < analyze < create)
- Domain expertise needed (novice < practitioner < expert)
- Expected response length (short = beginner, multi-paragraph = advanced)

**Example progression:**
```
beginner:     "What is GDPR?"
intermediate: "How do I implement GDPR consent management?"
advanced:     "Design a GDPR-compliant data architecture for multi-tenant SaaS"
expert:       "Analyze GDPR-CCPA-PIPEDA alignment for a global data platform with cross-border transfers"
```

---

## 8. Schema Extensions

### 8.1 Adding Custom Vendor Fields

**Process:**
1. Define new fields in vendor-specific interface
2. Extend base schema
3. Document in this file
4. Add validation rules
5. Update test-data-generator.js to recognize new fields

**Example:**
```typescript
interface SalesforceComplianceTest extends TestPromptBase {
  vendor: "Salesforce";
  category: "salesforce_shield";

  // Salesforce-specific fields
  salesforceModule: "Shield" | "PrivacyCenter" | "ConsentManagement";
  objectTypes: string[];  // ["Account", "Contact", "Case"]
  apexRequired: boolean;
}
```

### 8.2 Deprecation Policy

**When deprecating fields:**
1. Mark as `@deprecated` in this document
2. Provide migration path
3. Maintain backward compatibility for 2 major versions
4. Remove in 3rd major version

**Example:**
```typescript
interface TestPrompt {
  // @deprecated v2.2.0 - Use vendor field instead
  // Will be removed in v4.0.0
  isVendorSpecific?: boolean;
}
```

---

Questions: libor@arionetworks.com
