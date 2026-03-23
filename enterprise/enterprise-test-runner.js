// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/enterprise/enterprise-test-runner.js
// Description: Main enterprise compliance test runner - orchestrates tests across models, standards, personas, and company types
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { LLMClient } from '../utils/llm-client.js';
import { LlamaCppManagerClient } from '../utils/llamacpp-manager-client.js';
import { generateAllTests, getTestStats } from './test-data-generator.js';
import { COMPLIANCE_FUNCTIONS } from './functions/compliance-functions.js';
import { printTestHeader } from '../utils/test-helpers.js';

export class EnterpriseTestRunner {
  constructor() {
    this.managerClient = new LlamaCppManagerClient();
    this.currentModel = null;
    this.results = {
      timestamp: new Date().toISOString(),
      modelResults: {},
      diagnostics: {}
    };
  }

  async runTest(test, modelName) {
    const port = this.managerClient.getModelPort(modelName);
    if (!port) {
      return { success: false, error: 'Model port not found' };
    }

    const client = new LLMClient('http://127.0.0.1:' + port);
    const startTime = Date.now();

    try {
      const result = await client.chatCompletion([
        { role: 'user', content: test.question }
      ], { 
        max_tokens: 500, 
        temperature: 0.3,
        timeout: 30000
      });

      if (!result.success) {
        return { ...result, testId: test.id };
      }

      // Evaluate response quality
      const evaluation = this.evaluateResponse(result.response, test);

      return {
        success: true,
        testId: test.id,
        question: test.question,
        response: result.response,
        evaluation,
        timing: result.timing,
        standard: test.standard,
        knowledgeType: test.knowledgeType,
        persona: test.persona,
        retrievalStrategy: test.retrievalStrategy
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        testId: test.id,
        timing: { totalMs: Date.now() - startTime }
      };
    }
  }

  evaluateResponse(response, test) {
    const evaluation = {
      containsExpectedTopics: 0,
      totalExpectedTopics: test.expectedTopics.length,
      foundTopics: [],
      missingTopics: [],
      responseLength: response.length,
      passed: false
    };

    // Check if response contains expected topics
    test.expectedTopics.forEach(topic => {
      if (response.toLowerCase().includes(topic.toLowerCase())) {
        evaluation.containsExpectedTopics++;
        evaluation.foundTopics.push(topic);
      } else {
        evaluation.missingTopics.push(topic);
      }
    });

    // Pass if at least 50% of expected topics are present
    const passThreshold = test.expectedTopics.length > 0 ? 
      (evaluation.containsExpectedTopics / test.expectedTopics.length) >= 0.5 : true;
    
    evaluation.passed = passThreshold && response.length > 20;
    evaluation.score = test.expectedTopics.length > 0 ?
      (evaluation.containsExpectedTopics / test.expectedTopics.length) * 100 : 50;

    return evaluation;
  }

  async runModelTests(modelName, tests, maxTests) {
    console.log('\n' + '='.repeat(70));
    console.log('Testing Model: ' + modelName.toUpperCase());
    console.log('='.repeat(70));

    // Ensure model is running
    const status = await this.managerClient.getStatus();
    if (!status || !status[modelName] || !status[modelName].running) {
      console.log('Starting model ' + modelName + '...');
      const started = await this.managerClient.startModel(modelName);
      if (!started) {
        console.error('Failed to start model ' + modelName);
        return [];
      }
    }

    const testsToRun = maxTests ? tests.slice(0, maxTests) : tests;
    const results = [];

    for (let i = 0; i < testsToRun.length; i++) {
      const test = testsToRun[i];
      console.log('\n[' + (i + 1) + '/' + testsToRun.length + '] ' + 
                  test.standard + ' | ' + test.knowledgeType + ' | ' + test.persona);
      console.log('Q: ' + test.question);

      const result = await this.runTest(test, modelName);
      
      if (result.success) {
        const status = result.evaluation.passed ? '✅' : '❌';
        console.log(status + ' Score: ' + result.evaluation.score.toFixed(0) + '% ' +
                   '(' + result.evaluation.containsExpectedTopics + '/' + 
                   result.evaluation.totalExpectedTopics + ' topics)');
        console.log('Response: ' + result.response.substring(0, 150) + '...');
      } else {
        console.log('❌ Error: ' + result.error);
      }

      results.push(result);
    }

    return results;
  }

  async runComparisonTest(models, testSubset) {
    printTestHeader('ENTERPRISE COMPLIANCE MULTI-MODEL COMPARISON');

    const allTests = generateAllTests();
    const testsToRun = testSubset || allTests.slice(0, 20); // Default to 20 tests

    console.log('\nTest Suite Statistics:');
    console.log('  Total tests available: ' + allTests.length);
    console.log('  Running: ' + testsToRun.length + ' tests');
    console.log('  Across: ' + models.length + ' models');
    console.log('  Total test executions: ' + (testsToRun.length * models.length));

    for (const modelName of models) {
      const modelResults = await this.runModelTests(modelName, testsToRun);
      this.results.modelResults[modelName] = modelResults;
    }

    // Generate diagnostics
    this.generateDiagnostics();

    return this.results;
  }

  generateDiagnostics() {
    console.log('\n' + '='.repeat(70));
    console.log('GENERATING RETRIEVAL PIPELINE DIAGNOSTICS');
    console.log('='.repeat(70));

    const diagnostics = {
      byStandard: {},
      byKnowledgeType: {},
      byPersona: {},
      byModel: {},
      retrievalRecommendations: []
    };

    // Analyze results by knowledge type to identify retrieval needs
    for (const [modelName, results] of Object.entries(this.results.modelResults)) {
      diagnostics.byModel[modelName] = {
        totalTests: results.length,
        passed: results.filter(r => r.success && r.evaluation && r.evaluation.passed).length,
        failed: results.filter(r => !r.success || (r.evaluation && !r.evaluation.passed)).length,
        avgScore: 0
      };

      const scores = results
        .filter(r => r.success && r.evaluation)
        .map(r => r.evaluation.score);
      
      if (scores.length > 0) {
        diagnostics.byModel[modelName].avgScore = 
          scores.reduce((a, b) => a + b, 0) / scores.length;
      }

      // Analyze by knowledge type
      results.forEach(result => {
        if (!result.success || !result.evaluation) return;

        const kt = result.knowledgeType;
        if (!diagnostics.byKnowledgeType[kt]) {
          diagnostics.byKnowledgeType[kt] = {
            total: 0,
            passed: 0,
            failed: 0,
            avgScore: 0,
            scores: []
          };
        }

        diagnostics.byKnowledgeType[kt].total++;
        if (result.evaluation.passed) {
          diagnostics.byKnowledgeType[kt].passed++;
        } else {
          diagnostics.byKnowledgeType[kt].failed++;
        }
        diagnostics.byKnowledgeType[kt].scores.push(result.evaluation.score);
      });
    }

    // Calculate averages and generate recommendations
    for (const [kt, stats] of Object.entries(diagnostics.byKnowledgeType)) {
      if (stats.scores.length > 0) {
        stats.avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
      }

      // Generate retrieval recommendations based on performance
      if (stats.avgScore < 60) {
        const recommendation = this.generateRetrievalRecommendation(kt, stats);
        diagnostics.retrievalRecommendations.push(recommendation);
      }
    }

    this.results.diagnostics = diagnostics;
    this.printDiagnostics(diagnostics);
  }

  generateRetrievalRecommendation(knowledgeType, stats) {
    const recommendations = {
      'FACTUAL': {
        strategy: 'vector_db',
        actions: [
          'Improve semantic embeddings for factual content',
          'Add more training examples for definitions and key facts',
          'Consider fine-tuning embeddings on compliance vocabulary'
        ]
      },
      'RELATIONAL': {
        strategy: 'knowledge_graph',
        actions: [
          'Build knowledge graph of regulatory entity relationships',
          'Map cross-references between regulations',
          'Implement graph traversal for multi-hop queries'
        ]
      },
      'PROCEDURAL': {
        strategy: 'structured_retrieval',
        actions: [
          'Create process flow diagrams and step-by-step guides',
          'Structure procedural knowledge with sequential relationships',
          'Add implementation checklists and workflows'
        ]
      },
      'EXACT_MATCH': {
        strategy: 'meilisearch',
        actions: [
          'Optimize full-text search for exact citations',
          'Index regulation numbers and article references',
          'Implement precise string matching for legal text'
        ]
      },
      'SYNTHESIS': {
        strategy: 'rag_synthesis',
        actions: [
          'Improve multi-document retrieval',
          'Add framework comparison matrices',
          'Enhance cross-standard analysis capabilities'
        ]
      }
    };

    const rec = recommendations[knowledgeType] || {};
    return {
      knowledgeType,
      currentScore: stats.avgScore.toFixed(1) + '%',
      passRate: ((stats.passed / stats.total) * 100).toFixed(1) + '%',
      priority: stats.avgScore < 40 ? 'HIGH' : stats.avgScore < 60 ? 'MEDIUM' : 'LOW',
      recommendedStrategy: rec.strategy,
      actions: rec.actions || []
    };
  }

  printDiagnostics(diagnostics) {
    console.log('\n📊 Model Performance Summary:');
    for (const [model, stats] of Object.entries(diagnostics.byModel)) {
      console.log('  ' + model.padEnd(25) + 
                  stats.passed + '/' + stats.totalTests + ' passed ' +
                  '(avg score: ' + stats.avgScore.toFixed(1) + '%)');
    }

    console.log('\n📊 Knowledge Type Performance:');
    for (const [kt, stats] of Object.entries(diagnostics.byKnowledgeType)) {
      console.log('  ' + kt.padEnd(15) + 
                  stats.passed + '/' + stats.total + ' passed ' +
                  '(avg score: ' + stats.avgScore.toFixed(1) + '%)');
    }

    if (diagnostics.retrievalRecommendations.length > 0) {
      console.log('\n🔍 RETRIEVAL PIPELINE RECOMMENDATIONS:');
      diagnostics.retrievalRecommendations.forEach((rec, idx) => {
        console.log('\n' + (idx + 1) + '. ' + rec.knowledgeType + ' Knowledge');
        console.log('   Current Performance: ' + rec.currentScore + ' (Pass Rate: ' + rec.passRate + ')');
        console.log('   Priority: ' + rec.priority);
        console.log('   Recommended Strategy: ' + rec.recommendedStrategy);
        console.log('   Actions:');
        rec.actions.forEach(action => console.log('     - ' + action));
      });
    }
  }

  async testFunctionCalling(modelName) {
    printTestHeader('ENTERPRISE FUNCTION CALLING TEST: ' + modelName.toUpperCase());

    // Test with Hermes model (trained for function calling)
    const port = this.managerClient.getModelPort(modelName);
    const client = new LLMClient('http://127.0.0.1:' + port);

    const testCases = [
      {
        name: 'PII Detection',
        prompt: 'Analyze this text for PII under GDPR: "John Smith, john.smith@email.com, SSN 123-45-6789"',
        expectedFunction: 'identify_pii'
      },
      {
        name: 'AI Risk Assessment',
        prompt: 'Assess the EU AI Act risk level for an AI system used in hiring decisions',
        expectedFunction: 'assess_ai_risk_level'
      },
      {
        name: 'Compliance Check',
        prompt: 'Check if our encryption implementation meets ISO 27001 control A.8.24',
        expectedFunction: 'check_compliance_requirement'
      }
    ];

    const results = [];

    for (const testCase of testCases) {
      console.log('\nTest: ' + testCase.name);
      console.log('Prompt: ' + testCase.prompt);

      const result = await client.chatCompletion([
        { role: 'user', content: testCase.prompt }
      ], {
        tools: COMPLIANCE_FUNCTIONS,
        tool_choice: 'auto',
        max_tokens: 200
      });

      if (result.success) {
        const toolCalls = result.fullResponse.choices[0].message.tool_calls;
        if (toolCalls && toolCalls.length > 0) {
          console.log('✅ Function called: ' + toolCalls[0].function.name);
          console.log('   Arguments: ' + toolCalls[0].function.arguments);
          results.push({ testCase: testCase.name, success: true, functionCalled: toolCalls[0].function.name });
        } else {
          console.log('⚠️  No function call made');
          console.log('   Response: ' + result.response.substring(0, 100));
          results.push({ testCase: testCase.name, success: false, reason: 'No function call' });
        }
      } else {
        console.log('❌ Error: ' + result.error);
        results.push({ testCase: testCase.name, success: false, error: result.error });
      }
    }

    return results;
  }
}
