// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/tests/accuracy-test.js
// Description: Response quality tests - instruction following, factual accuracy, reasoning, code generation
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { LLMClient } from '../utils/llm-client.js';
import { config } from '../config.js';
import { printTestHeader, printTestResult, validateResponse, saveSchemaCompliantResults } from '../utils/test-helpers.js';
import fs from 'fs';
import path from 'path';

async function runAccuracyTests() {
  printTestHeader('ACCURACY & QUALITY TESTS');

  // MANDATORY: Initialize logger
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('Z', 'Z');
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.join(logDir, `test-run-accuracy-${timestamp}.log`);

  function logEvent(eventType, details = {}) {
    const now = new Date().toISOString();
    const entry = `[${now}] ${eventType} | ${JSON.stringify(details)}\n`;
    fs.appendFileSync(logFile, entry);
  }

  logEvent('TEST_START', { testType: 'accuracy', timestamp: new Date().toISOString() });
  console.log(`📝 Logging to: ${logFile}\n`);

  const client = new LLMClient();
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
  };
  
  // Test 1: Simple Instruction Following
  console.log('✏️  Test 1: Simple Instruction Following');
  console.log('  Prompt: "List exactly 3 programming languages, one per line, no numbers."');
  
  const test1 = await client.chatCompletion([
    { role: 'user', content: 'List exactly 3 programming languages, one per line, no numbers or bullets.' }
  ], { max_tokens: 100, temperature: 0.3 });
  
  if (test1.success) {
    console.log('  Response:\n' + test1.response.split('\n').map(l => '    ' + l).join('\n'));
    const lines = test1.response.trim().split('\n').filter(l => l.trim().length > 0);
    const passed = lines.length === 3 && !test1.response.match(/[0-9]\./);
    printTestResult('Instruction following', passed, 'Found ' + lines.length + ' items');
    
    results.tests.push({
      name: 'instruction_following',
      passed,
      response: test1.response,
    });
  }
  
  // Test 2: Factual Knowledge
  console.log('\n✏️  Test 2: Factual Knowledge');
  console.log('  Prompt: "What is the capital of France? Answer with just the city name."');
  
  const test2 = await client.chatCompletion([
    { role: 'user', content: 'What is the capital of France? Answer with just the city name, nothing else.' }
  ], { max_tokens: 20, temperature: 0.1 });
  
  if (test2.success) {
    console.log('  Response: ' + test2.response);
    const passed = test2.response.toLowerCase().includes('paris');
    printTestResult('Factual accuracy', passed);
    
    results.tests.push({
      name: 'factual_knowledge',
      passed,
      response: test2.response,
    });
  }
  
  // Test 3: Basic Math Reasoning
  console.log('\n✏️  Test 3: Basic Math Reasoning');
  console.log('  Prompt: "If I have 15 apples and give away 7, how many do I have left? Give only the number."');
  
  const test3 = await client.chatCompletion([
    { role: 'user', content: 'If I have 15 apples and give away 7, how many do I have left? Give only the number.' }
  ], { max_tokens: 20, temperature: 0.1 });
  
  if (test3.success) {
    console.log('  Response: ' + test3.response);
    const passed = test3.response.includes('8');
    printTestResult('Math reasoning', passed);
    
    results.tests.push({
      name: 'math_reasoning',
      passed,
      response: test3.response,
    });
  }
  
  // Test 4: Logic Puzzle
  console.log('\n✏️  Test 4: Logic Puzzle');
  console.log('  Prompt: "If all roses are flowers, and some flowers are red, are all roses red?"');
  
  const test4 = await client.chatCompletion([
    { role: 'user', content: 'If all roses are flowers, and some flowers are red, are all roses red? Answer yes or no and explain briefly.' }
  ], { max_tokens: 100, temperature: 0.3 });
  
  if (test4.success) {
    console.log('  Response: ' + test4.response);
    const passed = test4.response.toLowerCase().includes('no');
    printTestResult('Logic reasoning', passed);
    
    results.tests.push({
      name: 'logic_reasoning',
      passed,
      response: test4.response,
    });
  }
  
  // Test 5: Code Generation
  console.log('\n✏️  Test 5: Simple Code Generation');
  console.log('  Prompt: "Write a Python function that adds two numbers."');
  
  const test5 = await client.chatCompletion([
    { role: 'user', content: 'Write a Python function called add_numbers that takes two parameters and returns their sum. Just the code, no explanation.' }
  ], { max_tokens: 150, temperature: 0.3 });
  
  if (test5.success) {
    console.log('  Response:\n' + test5.response.split('\n').map(l => '    ' + l).join('\n'));
    const validation = validateResponse(test5.response, {
      contains: ['def', 'add_numbers', 'return'],
    });
    printTestResult('Code generation', validation.allPassed);
    
    results.tests.push({
      name: 'code_generation',
      passed: validation.allPassed,
      response: test5.response,
    });
  }
  
  // Test 6: Format Adherence (JSON)
  console.log('\n✏️  Test 6: Format Adherence (JSON)');
  console.log('  Prompt: "Return a JSON object with name and age fields."');
  
  const test6 = await client.chatCompletion([
    { role: 'user', content: 'Return a JSON object with two fields: "name" (string) and "age" (number). Only output valid JSON, nothing else.' }
  ], { max_tokens: 100, temperature: 0.2 });
  
  if (test6.success) {
    console.log('  Response: ' + test6.response);
    let passed = false;
    try {
      const cleanedResponse = test6.response.replace(/```json|```/g, '').trim();
      JSON.parse(cleanedResponse);
      passed = true;
    } catch (e) {
      // Not valid JSON
    }
    printTestResult('JSON format adherence', passed);
    
    results.tests.push({
      name: 'json_format',
      passed,
      response: test6.response,
    });
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  const passedCount = results.tests.filter(t => t.passed).length;
  const totalTests = results.tests.length;
  console.log('ACCURACY TESTS COMPLETE: ' + passedCount + '/' + totalTests + ' passed');
  console.log('='.repeat(60));

  logEvent('TEST_COMPLETE', { passedCount, totalTests, passRate: (passedCount/totalTests*100).toFixed(1) + '%' });

  // Convert to schema format and save
  const schemaResults = convertToSchema(results);
  try {
    saveSchemaCompliantResults(schemaResults, {
      testType: 'accuracy',
      runName: 'legacy-accuracy-tests'
    });
  } catch (error) {
    console.error('Failed to save schema-compliant results:', error.message);
  }

  return results;
}

/**
 * Convert legacy accuracy test results to unified schema format
 */
function convertToSchema(legacyResults) {
  const now = new Date().toISOString();
  return legacyResults.tests.map((test, idx) => ({
    metadata: {
      timestamp: now,
      testRunId: `legacy-accuracy-test-${now.split('T')[0]}`,
      runNumber: idx + 1,
      runName: 'LEGACY_ACCURACY',
      runType: 'accuracy'
    },
    input: {
      promptId: test.name.toUpperCase(),
      fullPromptText: `Accuracy test: ${test.name}`,
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
      totalMs: test.timing?.totalMs || 0,
      tokensPerSecond: test.timing?.tokensPerSec || 0
    },
    execution: {
      success: test.passed,
      responseValidated: !!test.response,
      errors: []
    },
    quality: {
      passed: test.passed,
      validation: test.validation || {}
    }
  }));
}

// Run if executed directly
if (import.meta.url === 'file://' + process.argv[1]) {
  runAccuracyTests().catch(console.error);
}

export { runAccuracyTests };
