# LLM Test Suite - Platform Consolidation Plan

**File:** `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/PLATFORM-CONSOLIDATION-PLAN.md`
**Description:** Strategic plan for consolidating 8 fragmented HTML interfaces into unified platform
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-27
**Status:** PLANNING PHASE

---

## Executive Summary

You currently have **8 separate HTML interfaces** with **significant overlap and fragmentation**. This plan consolidates them into a **single, unified LLM Test Suite Platform** accessible through a modern, multi-tab dashboard.

**Current State:** Scattered, requires users to jump between different URLs to access different functionality.

**Target State:** Single platform at `http://localhost:7500/platform/` with unified navigation, shared state, and seamless workflow.

---

## Current Interfaces Analysis

### **1. Prompt Viewer** (`reports/prompts/prompt-viewer.html`)
**Purpose:** Browse test prompts with filters
**Features:**
- Filter by standard, persona, complexity, vendor
- Display prompt metadata (category, expected topics, etc.)
- Show stats (total prompts, distribution by category)
- Display full prompt text

**Data Source:** Hardcoded JSON in file (embedded)
**Current Role:** Read-only prompt exploration

---

### **2. Response Viewer** (`viewer/response-viewer.html`) ✨
**Purpose:** View test results and evaluations
**Features:**
- Multi-file selection with run grouping
- Browse prompts and their responses across models
- Filter by persona, category, standard, rating
- Load rating files and view Claude's evaluations
- Side-by-side model comparison

**Data Source:** Backend API (`/api/files`, `/api/file`)
**Current Role:** PRIMARY - Most feature-rich interface for data exploration

**Status:** Actively used, recently enhanced with rating file support

---

### **3. Performance Visualizations** (`reports/performance-visualizations.html`)
**Purpose:** Visualize performance metrics
**Features:**
- Token/sec by model (bar chart)
- Latency curves (line chart)
- Model comparison (scatter plot)
- Performance trends

**Data Source:** Hardcoded test data + file upload
**Current Role:** Performance-focused analytics

**Issue:** 258KB file size (probably includes large datasets)

---

### **4. Test Management** (`test-management.html`)
**Purpose:** Model selection and test control
**Features:**
- Grid of available models with specs
- Select models for testing
- Links to other interfaces
- Test configuration options

**Data Source:** Hardcoded model list
**Current Role:** Navigation/orchestration hub

---

### **5. View Results** (`view-results.html`)
**Purpose:** Load and analyze test results
**Features:**
- File upload for test results
- Display summary statistics
- Model comparison bars
- Charts for result visualization

**Data Source:** File upload or local file load
**Current Role:** Simple results analyzer

---

### **6. Review Interface** (`review-interface.html`)
**Purpose:** Review test results with tabs
**Features:**
- Tab-based navigation (Overview, Details, Analysis, Trends)
- Metric cards (tests run, avg tokens/sec, etc.)
- Charts for each metric
- Model comparison

**Data Source:** File upload
**Current Role:** Comprehensive review dashboard

---

### **7. Analysis Dashboard** (`analysis-dashboard.html`)
**Purpose:** Configurable visualization dashboard
**Features:**
- Control panel for filtering and configuration
- Multiple chart types (bar, line, scatter, radar)
- Metric cards with stats
- Dynamic chart updates

**Data Source:** File upload or embedded data
**Current Role:** Advanced analytics customization

---

### **8. Analysis Dashboard v2** (`analysis-dashboard-v2.html`)
**Purpose:** Alternative analysis dashboard (seems to be improved version)
**Features:**
- Similar to v1 but likely with improvements
- Configurable visualizations

**Data Source:** File upload
**Current Role:** Alternative analytics view

**Note:** Unclear why v2 exists - should consolidate with v1

---

## Redundancy & Fragmentation Issues

### **Data Loading Problems**
- ❌ **8 different file upload mechanisms** (should be 1 centralized loader)
- ❌ **Multiple hardcoded data sources** (should be API-driven)
- ❌ **No shared state** between interfaces (users have to reload data multiple times)
- ❌ **Inconsistent data format handling** (some expect file upload, some expect API)

### **UI/UX Issues**
- ❌ **Users must jump between 8 URLs** to complete analysis workflow
- ❌ **No consistent navigation** across interfaces
- ❌ **Different styling/themes** per interface
- ❌ **Duplicate feature implementations** (e.g., multiple filter systems)
- ❌ **No cross-linking** between related data (click prompt → see its results)

### **Feature Overlap**
- **Filters:** Response Viewer, Prompt Viewer, both dashboards (4x implementation)
- **File Loading:** View Results, Review Interface, both Dashboards, Response Viewer (5x)
- **Model Comparison:** Test Management, View Results, Response Viewer (3x)
- **Charts:** Performance Viz, Review Interface, both Dashboards (4x)

### **Backend Issues**
- ❌ **Limited API** - Only `/api/files` and `/api/file` (no filtering, no aggregation)
- ❌ **No data processing** - Frontend loads raw data and processes it
- ❌ **File relationship mapping missing** - Can't automatically link test results to ratings

---

## Proposed Unified Platform Architecture

### **Single Platform URL**
```
http://localhost:7500/platform/
```

### **Platform Structure**

```
┌─────────────────────────────────────────────────────┐
│      LLM Test Suite Platform - Header/Nav           │
├─────────────────────────────────────────────────────┤
│  📊 Dashboard │ 📝 Prompts │ 🧪 Tests │ 📈 Analysis │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Active Tab Content (Dynamic)                       │
│  - Unified data loading across all sections         │
│  - Shared state management                          │
│  - Consistent filtering/search                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### **Core Modules** (Tabs)

#### **1. Dashboard Tab** 📊
**Purpose:** Overview of all test data
**Consolidates:** Test Management + Review Interface (Overview tab)
**Features:**
- Summary metrics (total prompts, total tests, total evaluations)
- Model summary (count, average performance)
- Recent test runs (list with timestamps)
- Data loading status
- Quick links to other sections

**Data Elements:**
- Test run count and dates
- Model performance summary
- Rating distribution overview

---

#### **2. Prompts Tab** 📝
**Purpose:** Browse and understand test prompts
**Consolidates:** Prompt Viewer
**Features:**
- Unified prompt browser with filters
- Filter by: standard, knowledge type, persona, complexity, vendor, category
- Search by text
- Display: full prompt text, expected topics, complexity, category
- Click → Show related test results button

**Data Elements:**
- All 214+ prompts from source files
- Dynamic prompt generation from test runners

**Enhanced Capability:**
- Link from prompt → results tab (show this prompt's responses across models)

---

#### **3. Tests Tab** 🧪
**Purpose:** Manage, run, and view test execution
**Consolidates:** Test Management + None (NEW CAPABILITY)
**Features:**
- **Sub-section A: Run Tests**
  - Model selection (checkbox grid, not card-based)
  - Test type selection (Performance, Compliance, Multi-tier)
  - Prompt selection (which tests to run)
  - Execute button → launches test runner
  - Real-time execution log

- **Sub-section B: Test Results**
  - File browser (currently works in Response Viewer)
  - Show test file metadata
  - Display: model, run number, prompt count, timestamp
  - Link related rating files automatically

- **Sub-section C: Model Comparison**
  - Side-by-side response viewer
  - Same prompt across different models
  - Show metrics (tokens/sec, latency, etc.)

**Data Elements:**
- Available models (from config)
- Test result files
- Rating files
- Related file mapping

---

#### **4. Analysis Tab** 📈
**Purpose:** Deep-dive analytics and visualization
**Consolidates:** Performance Visualizations + Review Interface (Details/Analysis/Trends tabs) + both Dashboards
**Features:**
- **Sub-section A: Performance Analytics**
  - Token/sec by model (bar chart)
  - Latency by complexity (line chart)
  - Model scatter plot (tokens/sec vs accuracy)
  - Trends over time (if multiple runs exist)

- **Sub-section B: Quality Analytics**
  - Rating distribution (pie chart)
  - Model quality comparison (bar chart)
  - Standard compliance scores
  - Persona-based analysis

- **Sub-section C: Control Panel**
  - Dynamic filter selection
  - Metric selection (which to display)
  - Chart type selection
  - Date range selection

- **Sub-section D: Trends & Historical**
  - Model performance over runs
  - Regression detection
  - Best/worst performers
  - Category performance breakdown

**Data Elements:**
- Test results with timing metrics
- Rating data (Claude's evaluations)
- Performance trends (if multiple runs)

---

### **Unified Data Loading**

**Single Data Loading Area** (Top of platform):
```
┌─────────────────────────────────────────────────┐
│  Load Test Data                                 │
├─────────────────────────────────────────────────┤
│  [Browse] [Browse Rating Files]  [Clear All]    │
│  Status: 6 test files, 4 rating files loaded    │
│  Run Groups: Run1 (3 models), Run2 (3 models)   │
└─────────────────────────────────────────────────┘
```

**What Happens When Files are Loaded:**
1. Parse test result files and rating files
2. Extract metadata (model names, run numbers, prompt counts)
3. **Auto-link related files** (Run1 tests → Run1 ratings)
4. **Detect available data** (which prompts have responses, which have ratings)
5. **Populate all tabs** with data
6. Enable filters based on loaded data
7. Update statistics/summaries

**Centralized State Management:**
```javascript
platformState = {
  testFiles: [],           // Loaded test result files
  ratingFiles: [],         // Loaded rating files
  runGroups: {},           // Organize by run
  prompts: [],             // All prompts (from API or source)
  mergedData: {},          // Combined prompt + response + rating data
  filters: {},             // Current filter selections
  selectedPromptId: null,  // For detail views
  selectedModels: [],      // For comparisons
}
```

---

## Implementation Strategy

### **Phase 1: Backend Enhancement**
**Goal:** Extend `viewer-server.js` to support the platform's needs

**New API Endpoints:**

```javascript
// Get all test data combined with ratings
GET /api/test-data
Response: {
  prompts: [],
  testResults: { runId: { modelName: { promptId: result } } },
  ratings: { runId: { promptId: { modelName: rating } } },
  fileMetadata: { path: { model, runNumber, promptCount } }
}

// Get related files for a specific test result
GET /api/related-files?testResultPath=/reports/...
Response: {
  relatedRatings: [{ path, testSet, ratingCount }],
  metadata: { model, runNumber, promptCount }
}

// Get aggregated analytics
GET /api/analytics?metrics=tokens_per_sec,accuracy,latency&models=phi3,mistral
Response: { metrics by model, by standard, by persona }

// Get prompt details with its results
GET /api/prompt/:promptId?testRunId=xxx
Response: {
  prompt: { ...full prompt details },
  results: { phi3: {...}, mistral: {...}, smollm3: {...} },
  ratings: { ... }
}
```

**Backend Work:**
- Add data aggregation endpoints
- Implement file relationship detection
- Add filtering/grouping logic on backend
- Cache merged data structures

---

### **Phase 2: Frontend - Single HTML File**

**Strategy:** Create single `llm-test-suite-platform.html` with modular sections

**Structure:**
```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Unified styles -->
    <style>...</style>
  </head>
  <body>
    <!-- Header with unified nav -->
    <header>...</header>

    <!-- Data loader panel (always visible) -->
    <div id="dataLoaderPanel">...</div>

    <!-- Tab navigation -->
    <nav class="platform-tabs">...</nav>

    <!-- Tab contents -->
    <section id="dashboardTab">...</section>
    <section id="promptsTab">...</section>
    <section id="testsTab">...</section>
    <section id="analysisTab">...</section>

    <!-- Unified JavaScript -->
    <script>
      // State management
      class PlatformState { ... }

      // Data loading
      class DataLoader { ... }

      // Individual modules
      class DashboardModule { ... }
      class PromptsModule { ... }
      class TestsModule { ... }
      class AnalysisModule { ... }

      // Initialize platform
      document.addEventListener('DOMContentLoaded', initPlatform);
    </script>
  </body>
</html>
```

**Size Estimate:** 15-20KB HTML + JS (much smaller than current 8 files)

---

### **Phase 3: Migration Path**

1. **Keep old interfaces running** (don't delete)
2. Create new unified platform alongside them
3. Add disclaimer in header: "Old interfaces available at /viewer/, /analysis/, etc."
4. Phase out old interfaces over time
5. Update documentation to point to new platform

---

## What Gets Deleted vs Kept

### **❌ DELETE (Consolidated)**
- `analysis-dashboard-v2.html` (duplicate of v1, features will be in unified platform)

### **⚠️ CONSOLIDATE INTO PLATFORM** (Keep as archives)
- `review-interface.html` → Dashboard + Analysis tabs
- `view-results.html` → Tests tab
- `analysis-dashboard.html` → Analysis tab
- `test-management.html` → Tests tab
- `prompt-viewer.html` → Prompts tab
- `response-viewer.html` → Tests tab (multi-file, model comparison)
- `performance-visualizations.html` → Analysis tab (Performance sub-section)

### **✅ KEEP RUNNING**
- `reports/prompts/prompt-viewer.html` → as legacy read-only interface
- `viewer/response-viewer.html` → as legacy read-only interface
- Archive old dashboards in `archive/` folder

---

## Data Model for Unified Platform

### **Key Data Structure**

```javascript
// After loading test results + ratings
mergedData = {
  // Indexed by runId
  run1: {
    // Indexed by promptId
    ARION_MULTITIER_ASSESSMENT_GDPR_NOVICE_1: {
      // Indexed by modelName
      phi3: {
        // From test result file
        response: "The General Data Protection Regulation (GDPR)...",
        timing: { totalMs: 5234, tokensPerSecond: 38.87 },
        tokens: { input: 2585, output: 187 },

        // From rating file
        rating: 4,
        explanation: "Good understanding of GDPR fundamentals...",
        raterModel: "Claude Sonnet 4.5"
      },
      mistral: { ... },
      smollm3: { ... }
    },
    // Next prompt...
  },
  run2: { ... }
}
```

### **Filtering Logic**

All filters work on the merged data:

```javascript
applyFilters({
  selectedModels: ['phi3', 'mistral'],
  selectedRuns: ['run1'],
  filterPersona: 'NOVICE',
  filterStandard: 'GDPR',
  filterCategory: 'ai_backend_multitier',
  filterRating: 'rated_4_5',
  searchText: 'privacy'
})

// Returns: List of prompts + responses that match ALL criteria
```

---

## Benefits of Consolidation

### **For Users**
✅ Single dashboard instead of jumping between 8 URLs
✅ Unified file loading (load once, use everywhere)
✅ Consistent filtering and search
✅ Cross-linked data (prompt → results → analysis)
✅ Better discoverability of insights
✅ Faster workflow from exploration to analysis

### **For Developers**
✅ Single codebase instead of maintaining 8 files
✅ Shared state management (no duplicate data)
✅ Consistent styling and interactions
✅ Easier to add new features
✅ Reduced debugging complexity
✅ Better separation of concerns (modular design)

### **For Data Quality**
✅ File relationship mapping (automatic linking)
✅ Single source of truth for loaded data
✅ Consistent filtering across all views
✅ Validation at single point
✅ Cache efficiency (parse files once)

---

## Implementation Sequence

### **Sprint 1: Backend (1-2 hours)**
1. Add `/api/related-files` endpoint to viewer-server.js
2. Add `/api/test-data` aggregation endpoint
3. Implement file relationship detection logic
4. Test API responses

### **Sprint 2: Frontend Structure (2-3 hours)**
1. Create base HTML with tab structure
2. Implement unified data loader
3. Implement PlatformState class
4. Add header and navigation

### **Sprint 3: Dashboard Module (1 hour)**
1. Implement summary metrics
2. Display recent test runs
3. Add quick links

### **Sprint 4: Prompts Module (1.5 hours)**
1. Implement prompt browser
2. Add filters
3. Add search
4. Link to test results

### **Sprint 5: Tests Module (2 hours)**
1. Implement file browser
2. Add model comparison
3. Implement result viewer
4. Link to prompts

### **Sprint 6: Analysis Module (2-3 hours)**
1. Implement performance charts
2. Implement quality charts
3. Add control panel
4. Add trends visualization

### **Sprint 7: Polish & Testing (1-2 hours)**
1. Responsive design
2. Error handling
3. Performance optimization
4. Testing all workflows

---

## Questions for Design Review

1. **Should platform file loading show related files automatically?**
   - YES: Auto-detect which rating files match which test results
   - This reduces user confusion about file relationships

2. **Should prompt click navigate to test results or just highlight?**
   - RECOMMEND: Navigate + show results for that prompt only (filtered)
   - Allows quick drill-down from prompt exploration

3. **Should we keep old interfaces or fully migrate?**
   - RECOMMEND: Keep for 1 week during transition, then archive
   - Gives users time to learn new platform

4. **What's the priority order for modules?**
   - Phase 1: Dashboard + Tests (core functionality)
   - Phase 2: Prompts (exploration)
   - Phase 3: Analysis (advanced)

---

## Success Criteria

- ✅ All 8 current interfaces' features consolidated into platform
- ✅ No duplication of data loading
- ✅ Unified navigation and styling
- ✅ File relationships detected automatically
- ✅ Performance: Load all data in < 5 seconds
- ✅ All filters work consistently
- ✅ Can compare 3 models side-by-side for any prompt
- ✅ Can see rating distribution across all loaded data
- ✅ Can analyze trends (if multiple runs loaded)

---

## File Locations

**Current Scattered Interfaces:**
- `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/review-interface.html`
- `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/view-results.html`
- `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/analysis-dashboard.html`
- `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/analysis-dashboard-v2.html`
- `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/test-management.html`
- `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/reports/performance-visualizations.html`
- `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/reports/prompts/prompt-viewer.html`
- `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/viewer/response-viewer.html`

**New Unified Platform Location:**
- `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/platform/llm-test-suite-platform.html`

**Backend Enhancement:**
- `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/viewer-server.js` (extend with new endpoints)

**Archive (after migration):**
- `/Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/archive/` (keep old files for reference)

---

**Next Step:** Review this plan and approve Phase 1 (backend enhancement) to proceed with implementation.
