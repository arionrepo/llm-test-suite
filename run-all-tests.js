// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/run-all-tests.js
// Description: Master test runner - executes all test suites and generates comprehensive report
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { runSpeedTests } from './tests/speed-test.js';
import { runAccuracyTests } from './tests/accuracy-test.js';
import { runToolCallingTests } from './tests/tool-calling-test.js';
import { runContextWindowTests } from './tests/context-window-test.js';
import { saveReport } from './utils/test-helpers.js';

async function runAllTests() {
  console.log('\n' + '█'.repeat(60));
  console.log('  LLM COMPREHENSIVE TEST SUITE');
  console.log('  Server: http://localhost:8088');
  console.log('  Started: ' + new Date().toISOString());
  console.log('█'.repeat(60));
  
  const startTime = Date.now();
  const allResults = {
    timestamp: new Date().toISOString(),
    testSuites: {},
    summary: {},
  };
  
  try {
    // Run Speed Tests
    console.log('\n[1/4] Running Speed Tests...');
    allResults.testSuites.speed = await runSpeedTests();
    
    // Run Accuracy Tests
    console.log('\n[2/4] Running Accuracy Tests...');
    allResults.testSuites.accuracy = await runAccuracyTests();
    
    // Run Tool Calling Tests
    console.log('\n[3/4] Running Tool Calling Tests...');
    allResults.testSuites.toolCalling = await runToolCallingTests();
    
    // Run Context Window Tests
    console.log('\n[4/4] Running Context Window Tests...');
    allResults.testSuites.contextWindow = await runContextWindowTests();
    
  } catch (error) {
    console.error('\n❌ Error running tests:', error.message);
    allResults.error = error.message;
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
  
  // Save comprehensive report
  saveReport('comprehensive', allResults);
  
  return allResults;
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
