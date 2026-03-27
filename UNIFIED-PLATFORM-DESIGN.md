# Unified LLM Test Suite Platform - Design & Requirements Document

**File:** `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/UNIFIED-PLATFORM-DESIGN.md`
**Description:** Design specification + requirements for unified benchmarking service platform consolidating 8 interfaces
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-27
**Status:** DESIGN & REQUIREMENTS PHASE

---

## Executive Summary

This document specifies the design and requirements for a new **LLM Benchmarking Service Platform** that consolidates functionality from 8 existing HTML interfaces into a single, cohesive system serving two customer segments:

1. **Internal Users** (Engineers, Researchers, Product Managers)
   - Design test benchmarks
   - Execute tests against LLM models
   - Analyze results and performance
   - Generate internal reports

2. **External Customers** (Enterprise buyers, Model evaluators, Researchers)
   - Access published benchmark results
   - Compare models across their use cases
   - Get model recommendations
   - Download reports and data exports
   - Subscribe to benchmark updates

The platform is designed to grow from internal tool → external benchmarking service with customer-facing dashboards and API access.

---

## PART 1: REQUIREMENTS

### Stakeholders

**Internal Stakeholders**
- **Test Engineers**: Design benchmarks, execute tests, monitor performance
- **Data Scientists**: Analyze results, identify patterns, generate insights
- **Product Managers**: Define benchmark standards, make model recommendations
- **Support Team**: Assist customers with benchmark interpretation

**External Stakeholders (Customers)**
- **Enterprise Customers**: Select best model for compliance/performance needs
- **Researchers**: Compare models for academic/research purposes
- **Model Developers**: Benchmark their models against competitors
- **Integration Partners**: Use API to embed benchmarks in their platforms

---

### User Stories

#### Internal Users

**As a Test Engineer, I want to...**
- Design new benchmark tests with configurable prompts, complexity levels, and evaluation criteria, so that benchmarks reflect real-world use cases
- Execute tests against 3-10 models in sequence without manual intervention, so that I can efficiently collect baseline data
- Monitor test execution with real-time logs showing progress, failures, and performance, so that I can quickly identify issues
- Save test designs with version control, so that I can rerun benchmarks consistently over time

**As a Data Scientist, I want to...**
- Load test results + ratings and see unified analysis across all dimensions (by model, by standard, by persona, by complexity), so that I can identify performance patterns
- Compare model performance across multiple test runs to detect regressions, so that I can monitor model stability
- Export analytics data in CSV/JSON format for external analysis, so that I can use R/Python for advanced statistical analysis
- See rating distribution and evaluator agreement, so that I can assess quality score reliability

**As a Product Manager, I want to...**
- Generate executive reports showing model comparisons and recommendations, so that I can present findings to stakeholders
- Define which benchmarks are "published" for customer access, so that I can control what data is public
- Set model recommendations based on use case matching, so that customers know which model fits their needs
- Track customer engagement with benchmarks (views, downloads, questions), so that I can improve benchmark relevance

#### External Customers

**As an Enterprise Buyer, I want to...**
- View published benchmark results comparing models across performance, cost, and quality dimensions, so that I can make informed purchasing decisions
- See which models work best for my specific use cases (compliance, performance, quality requirements), so that I can select the right model for my organization
- Download detailed reports with model comparisons and ROI analysis, so that I can share findings with my team
- Get alerts when new benchmarks are published or models are updated, so that I can stay current on model capabilities

**As a Researcher, I want to...**
- Access raw benchmark data and methodology, so that I can verify results and build on them
- Compare models using custom filters (standard, complexity, persona), so that I can analyze specific aspects
- Export datasets for analysis, so that I can publish research papers using the data
- See historical trends (model improvements over time), so that I can track model evolution

**As a Model Developer, I want to...**
- Submit my model for benchmarking against published tests, so that I can validate performance claims
- View how my model performs against competitors, so that I can identify improvement areas
- See detailed breakdown of performance (by complexity level, by standard), so that I can optimize for weak areas
- Understand evaluation methodology, so that I can replicate and verify results

---

### Functional Requirements

#### Test Design & Management
**FR-1.1**: System must support defining test benchmarks with:
- Multiple prompt templates (performance, compliance, task-specific)
- Configurable complexity levels (simple, medium, complex, very complex)
- Compliance standard categories (GDPR, ISO 27001, SOC 2, HIPAA, PCI DSS, etc.)
- User personas (novice, practitioner, manager, auditor, executive, developer)
- Expected evaluation criteria and quality metrics

**FR-1.2**: System must support versioning and history tracking for test designs, allowing reproducible test execution

**FR-1.3**: Test designs must be composable (combine prompt sets, complexity levels) without manual duplication

#### Test Execution
**FR-2.1**: System must execute tests against multiple LLM models (3-10) sequentially with:
- Real-time progress monitoring
- Per-model logging with timestamps
- Automatic failure recovery
- Incremental result saving (not all-at-end)

**FR-2.2**: System must capture complete test data:
- Input prompt (all tiers: base system, situational context, user query)
- Complete LLM response text (not truncated)
- Timing metrics (total time, prompt processing, generation, tokens/sec)
- Token counts (input, output, total)
- Model configuration (temperature, max_tokens, etc.)

**FR-2.3**: Test execution must support configurable model pools:
- Quick validation: First 3 models (1-2 hours)
- Standard: First 6 models (4-6 hours)
- Comprehensive: All 10 models (8-12 hours)

#### Result Analysis
**FR-3.1**: System must support unified analysis across dimensions:
- By model (performance ranking, capability comparison)
- By compliance standard (which models pass which requirements)
- By complexity level (how models scale with input size)
- By persona (suitability for different user skill levels)
- Over time (regression detection, improvement tracking)

**FR-3.2**: System must compute and display metrics:
- Performance: tokens/sec, latency, throughput by model
- Quality: rating distribution, average rating by model/standard/persona
- Reliability: response completeness, error rates, consistency
- Cost: estimated API cost per 1M tokens by model

**FR-3.3**: System must support rating/evaluation:
- Load third-party evaluations (Claude, human evaluators)
- Display rating distribution and agreement metrics
- Filter by rating status (unrated, rated, specific levels)
- Calculate quality scores by dimension

#### Report Generation
**FR-4.1**: System must generate reports for:
- **Executive Summary**: Top model recommendations, key metrics, ROI analysis
- **Detailed Comparison**: Side-by-side model comparison across all metrics
- **Technical Analysis**: Deep dive on specific benchmarks, methodology, limitations
- **Customer-Specific**: Filtered to their use cases and requirements

**FR-4.2**: Reports must be available in:
- Interactive web view (with filters and drill-down)
- PDF export (static, shareable)
- CSV/JSON export (for analysis)
- Dashboard embed (for partner sites)

#### Customer Access & Dashboards
**FR-5.1**: System must provide role-based access control:
- Public: Browse published benchmarks, view summaries
- Authenticated User: Download full reports, save custom comparisons
- Premium Subscriber: Early access, custom benchmarks, API access
- Internal: Full access to all data and controls

**FR-5.2**: Customer-facing dashboard must support:
- Browse published benchmarks by category
- Filter by use case, compliance standard, budget, performance requirements
- Compare 2-3 models side-by-side
- View model recommendations
- Download reports and data
- Save custom comparisons

**FR-5.3**: API access for authenticated customers must support:
- Query benchmark results programmatically
- Filter by model, standard, complexity, metric
- Get model recommendations
- Subscribe to updates

#### Data Management & Quality
**FR-6.1**: System must auto-detect and display file relationships:
- Which rating files correspond to which test result files
- Coverage indication (which prompts have evaluations)
- Timestamp alignment (test run dates vs evaluation dates)

**FR-6.2**: System must validate data quality:
- Response data is not empty/null
- Metrics make mathematical sense
- Ratings are within valid ranges
- File formats comply with schema

**FR-6.3**: System must support data versioning:
- Track which benchmark version each result belongs to
- Allow comparison across benchmark versions
- Archive old benchmark data

---

### Non-Functional Requirements

#### Performance
**NFR-1.1**: Initial data load (50 prompts + 300 responses) must complete in < 3 seconds

**NFR-1.2**: Filter application must update display in < 500ms

**NFR-1.3**: Chart rendering (10+ data series) must render in < 1 second

**NFR-1.4**: System must handle 1000+ prompt benchmark without noticeable lag

#### Scalability
**NFR-2.1**: Support concurrent access for 10+ internal users and 100+ customer concurrent views

**NFR-2.2**: Store and analyze 1000+ benchmark test results (10+ models × 100+ benchmarks)

**NFR-2.3**: API must support 1000s of customer queries per day

#### Reliability & Data Integrity
**NFR-3.1**: Test execution failures must not result in data loss (incremental saving required)

**NFR-3.2**: Data must persist across browser sessions

**NFR-3.3**: System must detect and prevent duplicate data loads

**NFR-3.4**: Backup/recovery procedures must exist for all customer-facing data

#### Compatibility
**NFR-4.1**: Must work on modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)

**NFR-4.2**: Responsive design: Works on 1200px+ width (desktop-first)

**NFR-4.3**: Mobile optimization: Read-only access on tablets (>768px width)

#### Security & Privacy
**NFR-5.1**: Customer data must be isolated (multi-tenant support for future)

**NFR-5.2**: API access must use authentication tokens

**NFR-5.3**: Downloaded reports must not contain internal metadata (evaluator notes, cost data)

**NFR-5.4**: Audit logging for: data access, report downloads, API usage

#### Compliance & Governance
**NFR-6.1**: Benchmark methodology must be transparent and documented

**NFR-6.2**: Results must be reproducible (version control for tests and data)

**NFR-6.3**: Support compliance attestation (benchmark methodology aligns with industry standards)

---

### Business Requirements

#### Benchmarking Service Model
**BR-1.1**: Platform must support multi-tiered access:
- **Free Tier**: View public benchmarks, limited report access
- **Premium Tier**: Full report downloads, API access, custom comparisons
- **Enterprise Tier**: Dedicated benchmark design, consultation, SLA support

**BR-1.2**: Benchmark publication workflow:
- Internal: Full access to raw data, all metrics
- Published: Filtered to comply with confidentiality, competitor considerations
- Public API: Approved datasets only, rate limiting enforced

#### Customer Value Propositions
**BR-2.1**: Help customers select the right model by:
- Answering: "Which model is best for my use case?"
- Providing: Clear performance + cost trade-offs
- Enabling: Side-by-side comparison with custom filters

**BR-2.2**: Support model ROI calculations:
- Cost per token vs performance quality
- Real-world latency vs throughput
- Suitability for compliance requirements

**BR-2.3**: Enable continuous optimization:
- Track model improvements over time
- Alert customers to new competitive models
- Provide upgrade recommendations

#### Competitive Positioning
**BR-3.1**: Differentiation from competitors:
- Transparent, reproducible methodology
- Real-world use case coverage (compliance, performance, quality)
- Multi-dimensional analysis (not just token/sec)
- Expert evaluation + automated metrics

**BR-3.2**: Build trust through:
- Published methodology documentation
- Third-party evaluation (Claude, human experts)
- Regular benchmark updates and maintenance
- Customer success stories

---

### Use Case Workflows

#### Workflow 1: Internal Benchmark Design & Execution

```
Test Engineer creates benchmark:
  1. Define prompts (compliance-focused, performance-focused, task-specific)
  2. Set complexity levels
  3. Assign personas and standards
  4. Save as reusable benchmark template
     ↓
Execute benchmark:
  1. Select benchmark template
  2. Select models to test (3/6/10)
  3. Configure execution (timing, retries)
  4. Start execution
  5. Monitor real-time progress (logs, metrics)
  6. Results auto-save incrementally
     ↓
Data Scientist analyzes:
  1. Load test results + ratings
  2. View analysis across all dimensions
  3. Detect patterns (model strength/weakness)
  4. Generate insights and recommendations
     ↓
Product Manager publishes:
  1. Review analysis and recommendations
  2. Determine publication scope (public/private/premium)
  3. Create executive summary
  4. Publish to customer portal
```

#### Workflow 2: Customer Finding Right Model

```
Enterprise customer accesses platform:
  1. Browse published benchmarks by category
  2. Enter requirements (compliance standard, performance needs, budget)
  3. View filtered model recommendations
     ↓
Compare options:
  1. Select 2-3 models to compare
  2. Apply custom filters (complexity level, persona)
  3. See side-by-side metrics
  4. View ROI analysis (cost vs performance)
     ↓
Make decision:
  1. Download detailed report
  2. Share with stakeholders
  3. Verify in internal proof-of-concept
  4. Select model and subscribe
     ↓
Receive updates:
  1. Get alerted when benchmarks update
  2. See if selected model ranking changes
  3. Receive recommendation if new better model appears
```

#### Workflow 3: Model Developer Validation

```
Model developer submits model:
  1. Request benchmarking against published tests
  2. Provide model API endpoint and credentials
  3. Accept confidentiality agreement
     ↓
System benchmarks:
  1. Run against latest published benchmarks
  2. Generate comparison vs existing models
     ↓
View results:
  1. See performance ranking
  2. Identify strength/weakness areas
  3. View detailed breakdown (by standard, complexity)
  4. Compare against top competitors
     ↓
Iterate & improve:
  1. Optimize weak areas
  2. Resubmit for benchmark
  3. Track improvement over versions
```

---

### Acceptance Criteria

#### Data Loading
- ✅ Load test result file with 25 prompts → System extracts all metadata within 1 second
- ✅ Load rating file with 30 evaluations → System parses and indexes within 500ms
- ✅ Load 3 test files + 2 rating files → System auto-detects relationships and shows "N related rating files"
- ✅ File relationships persist during session (not lost on tab switch)

#### Filtering & Analysis
- ✅ Apply persona filter → Prompts list updates, only selected persona visible
- ✅ Apply standard filter → Both Prompts and Results tabs respect filter
- ✅ Apply rating status filter → Only prompts with/without ratings shown
- ✅ Change filter in Prompts tab → Tests tab also updates (shared filter state)

#### Report Generation
- ✅ Generate executive report → Contains top 3 model recommendations with rationale
- ✅ Export detailed report → CSV includes all metrics, no internal annotations
- ✅ Download full dataset → JSON export contains all raw data, timestamps, evaluator info

#### Customer Access
- ✅ Public user views benchmark → Sees summary only, no detailed breakdowns
- ✅ Premium customer downloads report → Full details included, watermarked with customer name
- ✅ API call with customer token → Returns filtered results only (not internal data)

#### Performance
- ✅ Load 50 prompts + 300 responses → Display updates in < 3 seconds
- ✅ Filter + search 500 results → Filtered display updates in < 500ms
- ✅ Render 10-chart dashboard → All charts visible without scrolling, responsive

#### Reliability
- ✅ Close browser mid-analysis → Reload page → All loaded data and filters preserved
- ✅ Load same test file twice → System detects duplicate and prevents double-loading
- ✅ Export report → JSON valid, CSV imports into Excel without errors

---

## PART 2: DESIGN & ARCHITECTURE

### Core State Model

```javascript
platformState = {
  // Loaded files
  files: {
    testResults: [],      // Test result files loaded
    ratings: [],          // Rating files loaded
  },

  // Parsed data
  data: {
    prompts: [],          // All 214+ prompts
    responses: {},        // {runId: {promptId: {modelName: response}}}
    ratings: {},          // {promptId: {modelName: {rating, explanation, timestamp}}}
    fileRelationships: {}, // {testResultPath: [relatedRatingPaths]}
  },

  // Metadata
  metadata: {
    runGroups: {},        // Organize files by run
    models: [],           // Available models
    standards: [],        // Available standards
    personas: [],         // Available personas
    categories: [],       // Available categories
  },

  // Current view
  view: {
    activeTab: 'dashboard',    // Current active tab
    selectedPromptId: null,    // For detail views
    selectedModels: [],        // For comparisons
    selectedRuns: [],          // For run filtering
  },

  // Filters (applies across all tabs)
  filters: {
    persona: null,
    category: null,
    standard: null,
    ratingStatus: null,        // 'unrated', 'rated', 'rated_3_4_5', etc.
    searchText: '',
  },

  // Cache
  cache: {
    filteredPrompts: [],       // Cached filtered results
    analytics: {},             // Computed metrics
  }
};
```

### Tab Structure

#### **Tab 1: Dashboard** 📊
**Purpose:** Overview and summary

**Sections:**
- Summary metrics (total prompts, total tests, total evaluations)
- Model list with specs
- Recent test runs
- Quick status indicators

**Data Loaded From:**
- Metadata (models, standards, personas)
- Aggregated counts from loaded data
- File information

**Key Functions:**
- `renderDashboard()` - Render summary view
- `updateSummaryMetrics()` - Calculate counts

---

#### **Tab 2: Prompts** 📝
**Purpose:** Browse, explore, and understand test prompts

**Sections:**
- Prompt browser with unified filters
- Prompt detail view
- Search and filtering interface
- Link to view results for specific prompt

**Data Loaded From:**
- All prompts (from test result files)
- Filter options based on loaded data

**Features:**
- Filter by: persona, standard, complexity, category, vendor
- Search by text
- Display: full prompt, expected topics, category, vendor
- Click prompt → Show its results

**Key Functions:**
- `renderPromptsTab()` - Main tab renderer
- `renderPromptBrowser()` - File browser
- `applyFilters()` - Apply filters across prompts
- `displayPromptDetail(promptId)` - Show prompt details
- `linkToResults(promptId)` - Navigate to Tests tab with this prompt highlighted

---

#### **Tab 3: Tests** 🧪
**Purpose:** Load test data and view results

**Sub-sections:**

**A. Data Loading**
- File browser for test results
- File browser for rating files
- Load multiple files (Ctrl/Cmd+click)
- Show loaded files summary
- Auto-link related files

**B. File Relationships**
- Display which rating files go with which test results
- Show coverage (which prompts have ratings)
- Visual indicators of file relationships

**C. Response Viewer**
- Browse prompts loaded from test files
- Show responses across models
- Filter by loaded data
- Side-by-side comparison

**D. Model Comparison**
- Select 2-3 models
- Show responses for same prompt
- Display metrics (tokens/sec, latency)
- Show ratings if available

**Data Loaded From:**
- Test result files (via file browser)
- Rating files (via file browser)
- API: `/api/files`, `/api/file`, `/api/related-files` (new)

**Features:**
- Multi-file selection
- Run grouping (Run1, Run2, etc.)
- Unified filtering with Prompts tab
- Response comparison
- Metrics display

**Key Functions:**
- `renderTestsTab()` - Main tab renderer
- `loadTestFiles()` - Load selected test files
- `loadRatingFiles()` - Load selected rating files
- `displayFileRelationships()` - Show which rating files match which test results
- `mergeLoadedData()` - Combine test + rating data
- `displayResponseComparison()` - Show responses side-by-side
- `displayPromptForResults()` - Browse prompts from loaded results

---

#### **Tab 4: Analysis** 📈
**Purpose:** Deep-dive analytics and visualization

**Sub-sections:**

**A. Performance Analytics**
- Token/sec by model (bar chart)
- Latency trends (line chart)
- Model comparison scatter plot
- Throughput by complexity level
- Performance by standard

**B. Quality Analytics**
- Rating distribution (pie chart)
- Model quality comparison (bar chart)
- Quality by standard
- Quality by persona
- Rater agreement analysis

**C. Control Panel** (configurable)
- Select metrics to display
- Choose chart types
- Apply date filters
- Filter by model, standard, persona
- Aggregate options (by model, by standard, etc.)

**D. Trends & Historical**
- Model performance over runs (if multiple runs)
- Regression detection
- Best/worst performers
- Performance trends over time

**Data Loaded From:**
- Merged test results + ratings
- Computed analytics (tokens/sec, quality scores)

**Features:**
- Multiple chart types (bar, line, scatter, pie)
- Dynamic chart updates
- Configurable visualizations
- Export metrics

**Key Functions:**
- `renderAnalysisTab()` - Main tab renderer
- `renderPerformanceCharts()` - Performance visualization
- `renderQualityCharts()` - Quality visualization
- `computeAnalytics()` - Calculate metrics
- `updateCharts()` - Update visualizations on filter change

---

### Data Loading Flow

```
User selects files in Tests tab
    ↓
Parse test result files → Extract prompts, responses, metadata
    ↓
Parse rating files → Extract ratings, evaluators, timestamps
    ↓
Auto-detect file relationships → Link test results to ratings
    ↓
Merge data → Combine into unified structure
    ↓
Populate all tabs
    ↓
Initialize analytics
    ↓
Ready for exploration
```

---

## Key Patterns from Existing Interfaces

### From Response Viewer
✅ File browser with file selection
✅ Multi-file loading (Ctrl/Cmd+click)
✅ Run grouping (`runGroups` object)
✅ Filter system (persona, category, standard, rating)
✅ Response display with metrics
✅ Rating file loading
✅ Stats display

### From Performance Visualizations
✅ Chart.js integration
✅ Timing metrics (tokens/sec, latency)
✅ Model comparison
✅ Embedded performance data structure
✅ Multiple chart types

### From Analysis Dashboards
✅ File loading
✅ Configurable visualization
✅ Control panels
✅ Metric cards
✅ Filtering system

### From Prompt Viewer
✅ Prompt browser
✅ Prompt filtering
✅ Expected topics display
✅ Category/persona/standard organization

### From Test Management
✅ Model grid
✅ Model specs display
✅ Navigation hub concept

---

## API Enhancements Needed

### Existing Endpoints
```
GET /api/files
GET /api/file?path=...
```

### New Endpoints

**1. Auto-detect file relationships**
```
GET /api/related-files?testResultPath=/reports/.../test-results-...json
Response: {
  relatedRatings: [
    { path: '/ratings/claude-subjective-test-10.json',
      testSet: 'First 10 responses...',
      ratingCount: 30,
      runs: [1],
      prompts: ['ARION_...1', 'ARION_...2', ...]
    }
  ],
  metadata: { model, runNumber, promptCount }
}
```

**2. Get aggregated test data**
```
GET /api/test-data?includeRatings=true
Response: {
  prompts: [...all prompts],
  testResults: {
    run1: {
      promptId: {
        phi3: {...response data},
        mistral: {...}
      }
    }
  },
  ratings: {
    promptId: { modelName: {...rating} }
  }
}
```

**3. Get analytics**
```
GET /api/analytics?metrics=tokens_per_sec,accuracy,latency&groupBy=model
Response: {
  byModel: { phi3: {...}, mistral: {...} },
  byStandard: {...},
  byPersona: {...}
}
```

---

## UI/UX Patterns

### Consistent Elements Across All Tabs

**Header**
- Logo/Title
- Tab navigation
- User info (optional)

**Data Status Bar**
- Files loaded count
- Last update time
- Quick status icons

**Filter Panel** (unified across all tabs)
- Persona dropdown
- Category dropdown
- Standard dropdown
- Rating status dropdown
- Search box
- Apply/Clear buttons

**Footer**
- Help/Documentation
- Export options
- Settings

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  Header with unified nav                    │
├─────────────────────────────────────────────┤
│  Data Status & Quick Loader                 │
├─────────────────────────────────────────────┤
│  Unified Filter Panel (applies to all tabs) │
├─────────────────────────────────────────────┤
│  [Tab 1] [Tab 2] [Tab 3] [Tab 4]           │
├─────────────────────────────────────────────┤
│  Active Tab Content (Dynamic)               │
│  - Uses unified filters                     │
│  - Responds to data changes                 │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Color Scheme & Styling

**Baseline:** Use existing color scheme from Response Viewer
- Header: `#2c3e50` (dark blue-gray)
- Accents: `#3498db` (blue), `#27ae60` (green)
- Ratings: `#9b59b6` (purple)
- Background: `#f5f5f5`
- Cards: `#ffffff`

**Consistency:** All tabs use same:
- Font family (system fonts)
- Button styles
- Card styling
- Spacing and padding
- Border radius

---

## Data Flow Diagram

```
┌──────────────────┐
│  Test Result     │
│  Files (6)       │
└────────┬─────────┘
         │
         ├─ Extract prompts (214)
         ├─ Extract responses (300+)
         └─ Extract metadata (models, runs)
                 │
┌────────────────┴──────────┐
│  Rating Files (14)        │
└────────┬─────────────────┘
         │
         ├─ Extract ratings (150+)
         ├─ Extract evaluator info
         └─ Extract timestamps
                 │
         ┌───────┴──────────┐
         │                  │
    ┌────▼─────┐      ┌────▼─────┐
    │ Auto-link │      │  Merge   │
    │ files     │      │ data     │
    │           │      │          │
    └───────────┘      └────┬─────┘
                           │
                  ┌────────▼────────┐
                  │  Unified State  │
                  │  platformState  │
                  └────────┬────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
      ┌───▼───┐       ┌────▼────┐    ┌────▼────┐
      │Tab: D │       │Tab: P   │    │Tab: T   │
      │ashbrd │       │rompts   │    │ests     │
      └───────┘       └─────────┘    └─────────┘
                           │
                      ┌────▼────┐
                      │Tab: A   │
                      │nalysis  │
                      └─────────┘
```

---

## File Structure

**New Files to Create:**
```
/platform/
  ├── llm-test-suite-platform.html  (main unified interface)
  ├── README.md                      (usage documentation)
  └── migration.md                   (transition guide from old interfaces)
```

**Existing Files (No Changes):**
```
/viewer/response-viewer.html         (reference)
/reports/prompts/prompt-viewer.html  (reference)
/reports/performance-visualizations.html (reference)
/analysis-dashboard.html              (reference)
/test-management.html                (reference)
/review-interface.html               (reference)
/view-results.html                   (reference)
/analysis-dashboard-v2.html          (reference)
```

**Server:**
```
viewer-server.js                     (enhance with new endpoints)
```

---

## Implementation Phases

### Phase 1: Foundation (2-3 hours)
- Create HTML structure with tab layout
- Implement unified state management
- Add header and navigation
- Style consistent with existing design
- **Deliverable:** Empty tabs with navigation working

### Phase 2: Data Loading (2 hours)
- Implement file browser
- Load test result files
- Load rating files
- Auto-detect file relationships
- Merge data into unified state
- **Deliverable:** Data can be loaded and merged

### Phase 3: Dashboard Tab (1.5 hours)
- Display summary metrics
- Show model list
- Show recent test runs
- Quick status indicators
- **Deliverable:** Dashboard fully functional

### Phase 4: Prompts Tab (2 hours)
- Implement prompt browser
- Add unified filtering
- Show prompt details
- Link to results
- **Deliverable:** Prompts exploration working

### Phase 5: Tests Tab (2.5 hours)
- File browser for test/rating files
- Response viewer
- Model comparison
- Display file relationships
- **Deliverable:** Core test viewing functionality

### Phase 6: Analysis Tab (2.5 hours)
- Performance charts
- Quality charts
- Control panel
- Dynamic filtering
- **Deliverable:** Analytics fully functional

### Phase 7: Polish & Testing (1-2 hours)
- Responsive design
- Error handling
- Performance optimization
- Cross-tab consistency
- **Deliverable:** Production-ready platform

**Total Effort:** ~14-16 hours

---

## Success Criteria

✅ All 8 existing interfaces' features consolidated
✅ Single data load (parse test + rating files once)
✅ Unified filtering across all tabs
✅ File relationships automatically detected
✅ Consistent styling and UX
✅ Performance: Load and render under 3 seconds
✅ Can compare 3 models for any prompt
✅ Can view ratings across all loaded data
✅ Charts update on filter change
✅ No JavaScript errors in console

---

## Backward Compatibility

- Old interfaces remain at current URLs
- New platform at new `/platform/` URL
- Users can access either version
- Documented transition period (1-2 weeks)
- Clear guidance on migrating workflows

---

**Next Step:** Proceed with Phase 1 implementation of base HTML structure and state management.
