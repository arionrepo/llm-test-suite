// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/export-prompts.js
// Description: Export all test prompts for review, analysis, and documentation
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { generateAllTests } from './enterprise/test-data-generator.js';
import { getAllArionComplyPrompts } from './enterprise/arioncomply-workflows/ui-tasks.js';
import { getIntentTests, getWorkflowTests } from './enterprise/arioncomply-workflows/intent-classification-tests.js';
import { PromptComplexityAnalyzer } from './utils/prompt-complexity-analyzer.js';
import { InputComplexityAnalyzer } from './utils/input-complexity-analyzer.js';
import { OutputComplexityAnalyzer } from './utils/output-complexity-analyzer.js';
import fs from 'fs';

const EXPORT_DIR = './reports/prompts';

// Helper functions for complexity calculations
function categorizePerformance(score) {
  if (score < 30) return 'fast';
  if (score < 50) return 'medium';
  if (score < 70) return 'slow';
  return 'very_slow';
}

function predictResponseTime(inputAnalysis, outputAnalysis) {
  const parseTime = inputAnalysis.estimatedTokens * 10;
  const baseGenTime = typeof outputAnalysis.expectedResponseTokens === 'string' ?
    parseInt(outputAnalysis.expectedResponseTokens.split('-')[0]) : 300;
  const genTime = baseGenTime * 35;
  return parseTime + genTime;
}

function exportToCSV(tests, filename) {
  // Create header
  const csv = [
    ['ID', 'Standard', 'Knowledge Type', 'Persona', 'Question', 'Expected Topics', 'Retrieval Strategy'].join(',')
  ];

  tests.forEach(test => {
    const row = [
      test.id,
      test.standard,
      test.knowledgeType,
      test.persona,
      '"' + test.question.replace(/"/g, '""') + '"',
      '"' + (test.expectedTopics || []).join('; ') + '"',
      test.retrievalStrategy
    ];
    csv.push(row.join(','));
  });

  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  fs.writeFileSync(EXPORT_DIR + '/' + filename, csv.join('\n'));
  console.log('✅ Exported to: ' + EXPORT_DIR + '/' + filename);
}

function exportToMarkdown(tests, filename) {
  let md = '# Enterprise Compliance Test Prompts\n\n';
  md += '**Generated:** ' + new Date().toISOString() + '\n';
  md += '**Total Tests:** ' + tests.length + '\n\n';

  // Group by standard
  const byStandard = {};
  tests.forEach(test => {
    if (!byStandard[test.standard]) {
      byStandard[test.standard] = [];
    }
    byStandard[test.standard].push(test);
  });

  for (const [standard, stdTests] of Object.entries(byStandard)) {
    md += '## ' + standard + ' (' + stdTests.length + ' tests)\n\n';

    // Group by knowledge type
    const byKT = {};
    stdTests.forEach(test => {
      if (!byKT[test.knowledgeType]) {
        byKT[test.knowledgeType] = [];
      }
      byKT[test.knowledgeType].push(test);
    });

    for (const [kt, ktTests] of Object.entries(byKT)) {
      md += '### ' + kt + '\n\n';

      ktTests.forEach(test => {
        md += '**Persona:** ' + test.persona + '  \n';
        md += '**Question:** ' + test.question + '  \n';
        md += '**Expected Topics:** ' + (test.expectedTopics || []).join(', ') + '  \n';
        md += '**Retrieval Strategy:** ' + test.retrievalStrategy + '  \n';
        md += '\n---\n\n';
      });
    }
  }

  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  fs.writeFileSync(EXPORT_DIR + '/' + filename, md);
  console.log('✅ Exported to: ' + EXPORT_DIR + '/' + filename);
}

function exportArionComplyPrompts(filename) {
  const prompts = getAllArionComplyPrompts();
  
  let md = '# ArionComply Application Prompts\n\n';
  md += '**Generated:** ' + new Date().toISOString() + '\n';
  md += '**Total Prompts:** ' + prompts.length + '\n\n';

  // Group by category
  const byCategory = {};
  prompts.forEach(p => {
    if (!byCategory[p.category]) {
      byCategory[p.category] = [];
    }
    byCategory[p.category].push(p);
  });

  for (const [category, catPrompts] of Object.entries(byCategory)) {
    md += '## ' + category.replace(/_/g, ' ').toUpperCase() + '\n\n';

    catPrompts.forEach(p => {
      md += '### ' + p.task + '\n\n';
      md += '**User Type:** ' + p.userType + '  \n';
      md += '**Context Level:** ' + p.contextLevel + '  \n\n';
      md += '**Prompt:**  \n';
      md += '> ' + p.prompt + '\n\n';
      
      if (p.expectedClarifications && p.expectedClarifications.length > 0) {
        md += '**Expected Clarifications:**  \n';
        p.expectedClarifications.forEach(c => {
          md += '- ' + c + '\n';
        });
        md += '\n';
      }

      if (p.expectedGuidance && p.expectedGuidance.length > 0) {
        md += '**Expected Guidance:**  \n';
        p.expectedGuidance.forEach((g, idx) => {
          md += (idx + 1) + '. ' + g + '\n';
        });
        md += '\n';
      }

      md += '---\n\n';
    });
  }

  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  fs.writeFileSync(EXPORT_DIR + '/' + filename, md);
  console.log('✅ Exported to: ' + EXPORT_DIR + '/' + filename);
}

function exportComprehensiveJSON() {
  console.log('\n📝 Generating Comprehensive JSON Export...\n');

  const legacyAnalyzer = new PromptComplexityAnalyzer(); // For backwards compatibility
  const inputAnalyzer = new InputComplexityAnalyzer();
  const outputAnalyzer = new OutputComplexityAnalyzer();

  const complianceTests = generateAllTests();
  const arioncomplyPrompts = getAllArionComplyPrompts();
  const intentTests = getIntentTests();
  const workflowTests = getWorkflowTests();

  const comprehensiveExport = {
    metadata: {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      description: 'Comprehensive LLM test prompts for enterprise compliance and ArionComply application',
      totalPrompts: complianceTests.length + arioncomplyPrompts.length + intentTests.length + workflowTests.length
    },

    complianceTests: {
      description: 'General compliance knowledge tests across standards, knowledge types, and personas',
      testingMode: 'baseline_llm_only',
      note: 'Tests LLM training data WITHOUT any retrieval systems (no RAG, no vector DB)',
      count: complianceTests.length,
      tests: complianceTests.map(t => {
        const legacyAnalysis = legacyAnalyzer.analyzePrompt(t.question);
        const inputAnalysis = inputAnalyzer.analyze(t.question);
        const outputAnalysis = outputAnalyzer.analyze(t);

        // Calculate weighted performance prediction
        const weightedComplexity = (inputAnalysis.inputComplexityScore * 0.25) + (outputAnalysis.outputComplexityScore * 0.75);

        return {
          id: t.id,
          category: 'compliance_knowledge',
          standard: t.standard,
          knowledgeType: t.knowledgeType,
          persona: t.persona,
          question: t.question,
          expectedTopics: t.expectedTopics,
          expectedCitation: t.expectedCitation,
          retrievalStrategy: t.retrievalStrategy,
          complexity: t.complexity,

          // 2D Complexity Model
          inputComplexity: {
            score: inputAnalysis.inputComplexityScore,
            level: inputAnalysis.inputComplexityLevel,
            tokens: inputAnalysis.estimatedTokens,
            technicalDensity: Math.round(inputAnalysis.technicalDensity * 10) / 10,
            specificityLevel: inputAnalysis.specificityLevel,
            isMultiPart: inputAnalysis.isMultiPart,
            hasConditional: inputAnalysis.hasConditional
          },

          outputComplexity: {
            score: outputAnalysis.outputComplexityScore,
            level: outputAnalysis.outputComplexityLevel,
            expectedTokens: outputAnalysis.expectedResponseTokens,
            responseType: outputAnalysis.responseType,
            knowledgeDepth: outputAnalysis.knowledgeDepth,
            requiresMultiSource: outputAnalysis.requiresMultiSource,
            requiresSynthesis: outputAnalysis.requiresSynthesis,
            retrievalHops: outputAnalysis.retrievalHops
          },

          performancePrediction: {
            weightedComplexityScore: Math.round(weightedComplexity),
            dominantFactor: outputAnalysis.outputComplexityScore > inputAnalysis.inputComplexityScore ? 'output' : 'input',
            estimatedResponseTimeMs: predictResponseTime(inputAnalysis, outputAnalysis),
            performanceClass: categorizePerformance(weightedComplexity)
          },

          // Legacy complexity (for backwards compatibility)
          promptComplexity: {
            level: legacyAnalysis.complexityLevel,
            score: legacyAnalysis.complexityScore,
            tokens: legacyAnalysis.estimatedTokens,
            technicalDensity: Math.round(legacyAnalysis.technicalDensity * 10) / 10,
            isMultiPart: legacyAnalysis.isMultiPart,
            hasComparison: legacyAnalysis.hasComparisonRequest,
            performanceClass: legacyAnalysis.performanceClass
          }
        };
      })
    },

    arioncomplyWorkflows: {
      description: 'ArionComply application-specific workflow and UI guidance prompts',
      count: arioncomplyPrompts.length,
      prompts: arioncomplyPrompts.map(p => {
        const complexityAnalysis = legacyAnalyzer.analyzePrompt(p.prompt);
        return {
          category: 'arioncomply_workflow',
          taskCategory: p.category,
          task: p.task,
          contextLevel: p.contextLevel,
          userType: p.userType,
          prompt: p.prompt,
          expectedClarifications: p.expectedClarifications,
          expectedGuidance: p.expectedGuidance,
          promptComplexity: {
            level: complexityAnalysis.complexityLevel,
            score: complexityAnalysis.complexityScore,
            tokens: complexityAnalysis.estimatedTokens,
            technicalDensity: Math.round(complexityAnalysis.technicalDensity * 10) / 10,
            performanceClass: complexityAnalysis.performanceClass
          }
        };
      })
    },

    intentClassification: {
      description: 'ArionComply intent classification accuracy tests',
      count: intentTests.length,
      tests: intentTests.map(t => {
        const complexityAnalysis = legacyAnalyzer.analyzePrompt(t.userQuery);
        return {
          category: 'intent_classification',
          userQuery: t.userQuery,
          expectedIntent: t.expectedIntent,
          intentCategory: t.intentCategory,
          confidence: t.confidence,
          contextClues: t.contextClues,
          ambiguity: t.ambiguity,
          possibleIntents: t.possibleIntents,
          expectedClarifications: t.expectedClarifications,
          requiredContext: t.requiredContext,
          promptComplexity: {
            level: complexityAnalysis.complexityLevel,
            score: complexityAnalysis.complexityScore,
            tokens: complexityAnalysis.estimatedTokens,
            performanceClass: complexityAnalysis.performanceClass
          }
        };
      })
    },

    workflowUnderstanding: {
      description: 'ArionComply workflow understanding and step accuracy tests',
      count: workflowTests.length,
      tests: workflowTests.map(t => {
        const complexityAnalysis = legacyAnalyzer.analyzePrompt(t.userQuery);
        return {
          category: 'workflow_understanding',
          task: t.task,
          userQuery: t.userQuery,
          expectedSteps: t.expectedSteps,
          expectedScreens: t.expectedScreens,
          expectedButtons: t.expectedButtons,
          expectedFeatures: t.expectedFeatures,
          expectedElements: t.expectedElements,
          expectedDeadlines: t.expectedDeadlines,
          mustMention: t.mustMention,
          scoringCriteria: t.scoringCriteria,
          promptComplexity: {
            level: complexityAnalysis.complexityLevel,
            score: complexityAnalysis.complexityScore,
            tokens: complexityAnalysis.estimatedTokens,
            performanceClass: complexityAnalysis.performanceClass
          }
        };
      })
    },

    summary: {
      byCategory: {
        compliance_knowledge: complianceTests.length,
        arioncomply_workflow: arioncomplyPrompts.length,
        intent_classification: intentTests.length,
        workflow_understanding: workflowTests.length
      },
      byStandard: {},
      byKnowledgeType: {},
      byPersona: {},
      byIntentCategory: {}
    }
  };

  // Calculate summary statistics
  complianceTests.forEach(t => {
    comprehensiveExport.summary.byStandard[t.standard] =
      (comprehensiveExport.summary.byStandard[t.standard] || 0) + 1;
    comprehensiveExport.summary.byKnowledgeType[t.knowledgeType] =
      (comprehensiveExport.summary.byKnowledgeType[t.knowledgeType] || 0) + 1;
    comprehensiveExport.summary.byPersona[t.persona] =
      (comprehensiveExport.summary.byPersona[t.persona] || 0) + 1;
  });

  intentTests.forEach(t => {
    comprehensiveExport.summary.byIntentCategory[t.intentCategory] =
      (comprehensiveExport.summary.byIntentCategory[t.intentCategory] || 0) + 1;
  });

  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  const filepath = EXPORT_DIR + '/all-prompts-comprehensive.json';
  fs.writeFileSync(filepath, JSON.stringify(comprehensiveExport, null, 2));

  console.log('✅ Comprehensive JSON exported: ' + filepath);
  console.log('\n📊 Contents:');
  console.log('  Compliance Tests: ' + comprehensiveExport.complianceTests.count);
  console.log('  ArionComply Workflows: ' + comprehensiveExport.arioncomplyWorkflows.count);
  console.log('  Intent Classification: ' + comprehensiveExport.intentClassification.count);
  console.log('  Workflow Understanding: ' + comprehensiveExport.workflowUnderstanding.count);
  console.log('  Total Prompts: ' + comprehensiveExport.metadata.totalPrompts);

  return filepath;
}

function main() {
  console.log('\n📝 Exporting Enterprise Test Prompts...\n');

  // Generate and export compliance tests
  const tests = generateAllTests();

  exportToCSV(tests, 'compliance-prompts.csv');
  exportToMarkdown(tests, 'compliance-prompts.md');

  // Export ArionComply-specific prompts
  exportArionComplyPrompts('arioncomply-prompts.md');

  // Export comprehensive JSON
  const jsonPath = exportComprehensiveJSON();

  console.log('\n✅ All formats exported to: ' + EXPORT_DIR);
  console.log('\n📄 Files created:');
  console.log('  - compliance-prompts.csv (spreadsheet format)');
  console.log('  - compliance-prompts.md (markdown format)');
  console.log('  - arioncomply-prompts.md (workflow documentation)');
  console.log('  - all-prompts-comprehensive.json (complete JSON for review)');
}

if (import.meta.url === 'file://' + process.argv[1]) {
  main();
}
