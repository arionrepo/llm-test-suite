// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/run-all-tests.js
// Description: Master test runner - executes all test suites and generates comprehensive report
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { runSpeedTests } from './tests/speed-test.js';
import { runAccuracyTests } from './tests/accuracy-test.js';
import { runToolCallingTests } from './tests/tool-calling-test.js';
import { runContextWindowTests } from './tests/context-window-test.js';
import { saveSchemaCompliantResults } from './utils/test-helpers.js';
import fs from 'fs';
import path from 'path';

async function runAllTests() {
  console.log('\n' + '█'.repeat(60));
  console.log('  LLM COMPREHENSIVE TEST SUITE');
  console.log('  Server: http://localhost:8088');
  console.log('  Started: ' + new Date().toISOString());
  console.log('█'.repeat(60));

  // MANDATORY: Initialize logger
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('Z', 'Z');
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.join(logDir, `test-run-all-tests-${timestamp}.log`);

  function logEvent(eventType, details = {}) {
    const now = new Date().toISOString();
    const entry = `[${now}] ${eventType} | ${JSON.stringify(details)}\n`;
    fs.appendFileSync(logFile, entry);
  }

  logEvent('TEST_START', { testType: 'comprehensive', timestamp: new Date().toISOString() });
  console.log(`📝 Logging to: ${logFile}\n`);

  const startTime = Date.now();
  const allResults = {
    timestamp: new Date().toISOString(),
    testSuites: {},
    summary: {},
  };
  
  try {
    // Run Speed Tests
    console.log('\n[1/4] Running Speed Tests...');
    logEvent('SUITE_START', { suite: 'speed' });
    allResults.testSuites.speed = await runSpeedTests();
    logEvent('SUITE_COMPLETE', { suite: 'speed', tests: allResults.testSuites.speed.tests.length });

    // Run Accuracy Tests
    console.log('\n[2/4] Running Accuracy Tests...');
    logEvent('SUITE_START', { suite: 'accuracy' });
    allResults.testSuites.accuracy = await runAccuracyTests();
    logEvent('SUITE_COMPLETE', { suite: 'accuracy', tests: allResults.testSuites.accuracy.tests.length });

    // Run Tool Calling Tests
    console.log('\n[3/4] Running Tool Calling Tests...');
    logEvent('SUITE_START', { suite: 'toolCalling' });
    allResults.testSuites.toolCalling = await runToolCallingTests();
    logEvent('SUITE_COMPLETE', { suite: 'toolCalling', tests: allResults.testSuites.toolCalling.tests.length });

    // Run Context Window Tests
    console.log('\n[4/4] Running Context Window Tests...');
    logEvent('SUITE_START', { suite: 'contextWindow' });
    allResults.testSuites.contextWindow = await runContextWindowTests();
    logEvent('SUITE_COMPLETE', { suite: 'contextWindow', tests: allResults.testSuites.contextWindow.tests.length });

  } catch (error) {
    console.error('\n❌ Error running tests:', error.message);
    allResults.error = error.message;
    logEvent('TEST_ERROR', { error: error.message });
  }
  
  const endTime = Date.now();
  const totalDuration = endTime - startTime;
  
  // Calculate summary statistics
  let totalTests = 0;
  let totalPassed = 0;
  
  for (const [suiteName, suiteResults] of Object.entries(allResults.testSuites)) {
    if (suiteResults && suiteResults.tests) {
      const passed = suiteResults.tests.filter(t => t.passed).length;
      const total = suiteResults.tests.length;
      totalTests += total;
      totalPassed += passed;
      
      allResults.summary[suiteName] = {
        passed,
        total,
        passRate: ((passed / total) * 100).toFixed(1) + '%',
      };
    }
  }
  
  allResults.summary.overall = {
    totalTests,
    totalPassed,
    totalFailed: totalTests - totalPassed,
    passRate: ((totalPassed / totalTests) * 100).toFixed(1) + '%',
    durationMs: totalDuration,
  };
  
  // Print final summary
  console.log('\n' + '█'.repeat(60));
  console.log('  FINAL SUMMARY');
  console.log('█'.repeat(60));
  console.log('\nResults by test suite:');
  
  for (const [suiteName, summary] of Object.entries(allResults.summary)) {
    if (suiteName !== 'overall') {
      console.log('  ' + suiteName.padEnd(20) + summary.passed + '/' + summary.total + 
                  ' (' + summary.passRate + ')');
    }
  }
  
  console.log('\nOverall Results:');
  console.log('  Total Tests:   ' + allResults.summary.overall.totalTests);
  console.log('  Passed:        ' + allResults.summary.overall.totalPassed + ' ✅');
  console.log('  Failed:        ' + allResults.summary.overall.totalFailed + ' ❌');
  console.log('  Pass Rate:     ' + allResults.summary.overall.passRate);
  console.log('  Duration:      ' + (totalDuration / 1000).toFixed(2) + 's');
  
  const grade = totalPassed === totalTests ? 'A+' :
                totalPassed / totalTests >= 0.9 ? 'A' :
                totalPassed / totalTests >= 0.8 ? 'B' :
                totalPassed / totalTests >= 0.7 ? 'C' :
                totalPassed / totalTests >= 0.6 ? 'D' : 'F';
  
  console.log('\n  Grade: ' + grade);
  console.log('█'.repeat(60));

  logEvent('TEST_COMPLETE', {
    totalTests: allResults.summary.overall.totalTests,
    passedCount: allResults.summary.overall.totalPassed,
    grade
  });

  // Convert to schema format and save
  const schemaResults = convertToSchema(allResults);
  try {
    saveSchemaCompliantResults(schemaResults, {
      testType: 'comprehensive',
      runName: 'all-tests-comprehensive'
    });
    console.log('\n✅ Results saved with schema validation');
  } catch (error) {
    console.error('❌ Failed to save schema-compliant results:', error.message);
  }

  return allResults;
}

/**
 * Convert run-all-tests results to unified schema format
 */
function convertToSchema(allResults) {
  const schemaResults = [];
  const now = new Date().toISOString();

  // Aggregate all test results from all suites
  Object.entries(allResults.testSuites).forEach(([suiteName, suiteResults]) => {
    if (suiteResults && suiteResults.tests) {
      suiteResults.tests.forEach((test, idx) => {
        schemaResults.push({
          metadata: {
            timestamp: now,
            testRunId: `all-tests-${suiteName}-${now.split('T')[0]}`,
            runNumber: idx + 1,
            runName: suiteName.toUpperCase(),
            runType: 'comprehensive'
          },
          input: {
            promptId: test.name.toUpperCase(),
            fullPromptText: `${suiteName} test: ${test.name}`,
            fullPromptTokens: 20
          },
          modelConfig: {
            modelName: 'legacy-server-8088'
          },
          output: {
            response: test.response || '',
            responseTokens: (test.response || '').split(' ').length
          },
          timing: {
            totalMs: test.timing?.totalMs || test.stats?.avg || 0,
            tokensPerSecond: test.tokensPerSec || test.timing?.tokensPerSec || 0
          },
          execution: {
            success: test.passed,
            responseValidated: !!test.response || test.passed,
            errors: test.error ? [test.error] : []
          },
          testSuite: {
            name: suiteName,
            testType: suiteName
          }
        });
      });
    }
  });

  return schemaResults;
}

// Run if executed directly
if (import.meta.url === 'file://' + process.argv[1]) {
  runAllTests()
    .then(() => {
      console.log('\n✅ All tests complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

export { runAllTests };
