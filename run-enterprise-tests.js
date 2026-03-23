// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/run-enterprise-tests.js
// Description: Main entry point for enterprise compliance testing across models, standards, and personas
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { EnterpriseTestRunner } from './enterprise/enterprise-test-runner.js';
import { generateAllTests, getTestStats } from './enterprise/test-data-generator.js';
import { saveReport } from './utils/test-helpers.js';

const USAGE = `
Enterprise Compliance Test Suite
=================================

Usage:
  node run-enterprise-tests.js [command] [options]

Commands:
  pilot              Run quick pilot test (20 tests, 2 models)
  quick              Run quick test (50 tests, 3 models)
  standard           Run standard test (100 tests, 5 models)
  comprehensive      Run comprehensive test (all tests, all models)
  function-calling   Test function calling with Hermes model
  stats              Show test suite statistics

Options:
  --models           Comma-separated list of models
  --max-tests        Maximum number of tests to run
  --standard         Filter by standard (GDPR, ISO_27001, etc.)
  --persona          Filter by persona (NOVICE, PRACTITIONER, etc.)

Examples:
  node run-enterprise-tests.js pilot
  node run-enterprise-tests.js quick --models hermes-3-llama-8b,llama-4-scout-17b
  node run-enterprise-tests.js standard --standard GDPR --persona PRACTITIONER
  node run-enterprise-tests.js function-calling
`;

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(USAGE);
    return;
  }

  const command = args[0];
  const runner = new EnterpriseTestRunner();

  // Parse options
  const options = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1];
      options[key] = value;
      i++;
    }
  }

  try {
    switch (command) {
      case 'stats':
        showStats();
        break;

      case 'pilot':
        await runPilotTest(runner, options);
        break;

      case 'quick':
        await runQuickTest(runner, options);
        break;

      case 'standard':
        await runStandardTest(runner, options);
        break;

      case 'comprehensive':
        await runComprehensiveTest(runner, options);
        break;

      case 'function-calling':
        await runFunctionCallingTest(runner, options);
        break;

      default:
        console.log('Unknown command: ' + command);
        console.log(USAGE);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function showStats() {
  console.log('\n' + '='.repeat(70));
  console.log('ENTERPRISE COMPLIANCE TEST SUITE STATISTICS');
  console.log('='.repeat(70));

  const stats = getTestStats();
  
  console.log('\nTotal Tests: ' + stats.total);
  
  console.log('\nBy Standard:');
  Object.entries(stats.byStandard)
    .sort((a, b) => b[1] - a[1])
    .forEach(([std, count]) => {
      console.log('  ' + std.padEnd(25) + count + ' tests');
    });

  console.log('\nBy Knowledge Type:');
  Object.entries(stats.byKnowledgeType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([kt, count]) => {
      console.log('  ' + kt.padEnd(25) + count + ' tests');
    });

  console.log('\nBy User Persona:');
  Object.entries(stats.byPersona)
    .sort((a, b) => b[1] - a[1])
    .forEach(([persona, count]) => {
      console.log('  ' + persona.padEnd(25) + count + ' tests');
    });

  console.log('\nAvailable Models: 10');
  console.log('  phi3, smollm3, mistral, qwen2.5-32b, qwen-coder-7b,');
  console.log('  hermes-3-llama-8b, llama-3.1-8b, llama-4-scout-17b,');
  console.log('  mistral-small-24b, deepseek-r1-qwen-32b');
}

async function runPilotTest(runner, options) {
  console.log('\n🚀 Running PILOT TEST (Quick validation)');
  console.log('   Tests: 20 | Models: 2 | Duration: ~5 minutes\n');

  const models = options.models ? 
    options.models.split(',') : 
    ['llama-4-scout-17b', 'hermes-3-llama-8b'];

  const allTests = generateAllTests();
  const testSubset = allTests.slice(0, 20);

  const results = await runner.runComparisonTest(models, testSubset);
  
  const reportPath = saveReport('enterprise-pilot', results);
  console.log('\n✅ Pilot test complete! Report: ' + reportPath);
}

async function runQuickTest(runner, options) {
  console.log('\n🚀 Running QUICK TEST');
  console.log('   Tests: 50 | Models: 3 | Duration: ~15 minutes\n');

  const models = options.models ? 
    options.models.split(',') : 
    ['llama-4-scout-17b', 'hermes-3-llama-8b', 'qwen2.5-32b'];

  const allTests = generateAllTests();
  const testSubset = allTests.slice(0, 50);

  const results = await runner.runComparisonTest(models, testSubset);
  
  const reportPath = saveReport('enterprise-quick', results);
  console.log('\n✅ Quick test complete! Report: ' + reportPath);
}

async function runStandardTest(runner, options) {
  console.log('\n🚀 Running STANDARD TEST');
  console.log('   Tests: 100 | Models: 5 | Duration: ~45 minutes\n');

  const models = options.models ? 
    options.models.split(',') : 
    ['llama-4-scout-17b', 'hermes-3-llama-8b', 'qwen2.5-32b', 
     'mistral-small-24b', 'deepseek-r1-qwen-32b'];

  const allTests = generateAllTests();
  
  // Apply filters if specified
  let testSubset = allTests;
  if (options.standard) {
    testSubset = testSubset.filter(t => t.standard === options.standard);
  }
  if (options.persona) {
    testSubset = testSubset.filter(t => t.persona === options.persona);
  }
  
  testSubset = testSubset.slice(0, options['max-tests'] || 100);

  const results = await runner.runComparisonTest(models, testSubset);
  
  const reportPath = saveReport('enterprise-standard', results);
  console.log('\n✅ Standard test complete! Report: ' + reportPath);
}

async function runComprehensiveTest(runner, options) {
  console.log('\n🚀 Running COMPREHENSIVE TEST');
  console.log('   ⚠️  WARNING: This will take several hours!');
  console.log('   Tests: ALL | Models: ALL 10 | Duration: ~6-8 hours\n');

  const models = options.models ? 
    options.models.split(',') : 
    runner.managerClient.getAllModels();

  const allTests = generateAllTests();
  console.log('   Total tests to run: ' + allTests.length);
  console.log('   Total executions: ' + (allTests.length * models.length));

  const results = await runner.runComparisonTest(models, allTests);
  
  const reportPath = saveReport('enterprise-comprehensive', results);
  console.log('\n✅ Comprehensive test complete! Report: ' + reportPath);
}

async function runFunctionCallingTest(runner, options) {
  console.log('\n🚀 Running FUNCTION CALLING TEST');
  console.log('   Testing enterprise compliance functions\n');

  const model = options.models || 'hermes-3-llama-8b';
  
  const results = await runner.testFunctionCalling(model);
  
  const reportPath = saveReport('enterprise-functions', {
    timestamp: new Date().toISOString(),
    model,
    results
  });
  
  console.log('\n✅ Function calling test complete! Report: ' + reportPath);
}

// Run main
if (import.meta.url === 'file://' + process.argv[1]) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
