// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/tests/context-window-test.js
// Description: Context window tests - multi-turn conversations, information retention, long context handling
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { LLMClient } from '../utils/llm-client.js';
import { config } from '../config.js';
import { printTestHeader, printTestResult, saveSchemaCompliantResults } from '../utils/test-helpers.js';
import fs from 'fs';
import path from 'path';

async function runContextWindowTests() {
  printTestHeader('CONTEXT WINDOW TESTS');

  // MANDATORY: Initialize logger
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('Z', 'Z');
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.join(logDir, `test-run-context-window-${timestamp}.log`);

  function logEvent(eventType, details = {}) {
    const now = new Date().toISOString();
    const entry = `[${now}] ${eventType} | ${JSON.stringify(details)}\n`;
    fs.appendFileSync(logFile, entry);
  }

  logEvent('TEST_START', { testType: 'context-window', timestamp: new Date().toISOString() });
  console.log(`📝 Logging to: ${logFile}\n`);

  const client = new LLMClient();
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
  };
  
  // Test 1: Simple Multi-Turn Conversation
  console.log('💬 Test 1: Multi-Turn Conversation (Short Context)');
  
  const messages1 = [
    { role: 'user', content: 'My name is Alice.' },
  ];
  
  const turn1 = await client.chatCompletion(messages1, { max_tokens: 50 });
  console.log('  Turn 1:');
  console.log('    User: My name is Alice.');
  console.log('    Assistant: ' + turn1.response);
  
  messages1.push({ role: 'assistant', content: turn1.response });
  messages1.push({ role: 'user', content: 'What is my name?' });
  
  const turn2 = await client.chatCompletion(messages1, { max_tokens: 50 });
  console.log('  Turn 2:');
  console.log('    User: What is my name?');
  console.log('    Assistant: ' + turn2.response);
  
  const passed1 = turn2.success && turn2.response.toLowerCase().includes('alice');
  printTestResult('Short context retention', passed1);
  
  results.tests.push({
    name: 'short_context',
    passed: passed1,
    conversation: messages1,
  });
  
  // Test 2: Information Retention Over Multiple Turns
  console.log('\n💬 Test 2: Information Retention (Multiple Facts)');
  
  const messages2 = [
    { role: 'user', content: 'Remember these three facts: 1) My favorite color is blue. 2) I live in Tokyo. 3) I am a software engineer.' },
  ];
  
  const factTurn1 = await client.chatCompletion(messages2, { max_tokens: 100 });
  console.log('  User: Remember these three facts...');
  console.log('  Assistant: ' + factTurn1.response);
  
  messages2.push({ role: 'assistant', content: factTurn1.response });
  messages2.push({ role: 'user', content: 'What is my favorite color?' });
  
  const factTurn2 = await client.chatCompletion(messages2, { max_tokens: 50 });
  console.log('\n  User: What is my favorite color?');
  console.log('  Assistant: ' + factTurn2.response);
  
  const remembersColor = factTurn2.success && factTurn2.response.toLowerCase().includes('blue');
  
  messages2.push({ role: 'assistant', content: factTurn2.response });
  messages2.push({ role: 'user', content: 'Where do I live?' });
  
  const factTurn3 = await client.chatCompletion(messages2, { max_tokens: 50 });
  console.log('\n  User: Where do I live?');
  console.log('  Assistant: ' + factTurn3.response);
  
  const remembersLocation = factTurn3.success && factTurn3.response.toLowerCase().includes('tokyo');
  
  const passed2 = remembersColor && remembersLocation;
  printTestResult('Multi-fact retention', passed2, 
                  'Color: ' + (remembersColor ? 'OK' : 'Failed') + 
                  ', Location: ' + (remembersLocation ? 'OK' : 'Failed'));
  
  results.tests.push({
    name: 'multi_fact_retention',
    passed: passed2,
    rememberedColor: remembersColor,
    rememberedLocation: remembersLocation,
  });
  
  // Test 3: Long Context Handling
  console.log('\n💬 Test 3: Long Context Handling');
  
  const longStory = 'Here is a story with a hidden code. ' + 
    'Once upon a time, there was a programmer named Sarah who worked at a tech company. ' +
    'She loved solving complex problems and often stayed late at the office. ' +
    'One day, she discovered a mysterious pattern in the database logs. ' +
    'The pattern revealed a secret code: ALPHA-2026. ' +
    'She investigated further and found that this code was the key to unlocking a new feature. ' +
    'After weeks of research, Sarah finally understood the purpose of the code. ' +
    'It was designed to improve system performance by 40%. ' +
    'The company celebrated her discovery and promoted her to senior engineer. ' +
    'Sarah continued to mentor junior developers and share her knowledge with the team. ' +
    'She believed that collaboration and learning were essential for success. ' +
    'The team grew stronger, and together they built amazing products. ' +
    'Years later, Sarah became the CTO of the company. ' +
    'She never forgot the lessons she learned along the way. ' +
    'And she always remembered that secret code that started it all.';
  
  const messages3 = [
    { role: 'user', content: longStory },
  ];
  
  const longTurn1 = await client.chatCompletion(messages3, { max_tokens: 100 });
  console.log('  User provided a long story (approx ' + (longStory.split(' ').length) + ' words)');
  console.log('  Assistant acknowledged: ' + longTurn1.response.substring(0, 80) + '...');
  
  messages3.push({ role: 'assistant', content: longTurn1.response });
  messages3.push({ role: 'user', content: 'What was the secret code mentioned in the story?' });
  
  const longTurn2 = await client.chatCompletion(messages3, { max_tokens: 50 });
  console.log('\n  User: What was the secret code mentioned in the story?');
  console.log('  Assistant: ' + longTurn2.response);
  
  const passed3 = longTurn2.success && longTurn2.response.includes('ALPHA-2026');
  printTestResult('Long context recall', passed3);
  
  results.tests.push({
    name: 'long_context',
    passed: passed3,
    storyWordCount: longStory.split(' ').length,
  });
  
  // Test 4: Extended Conversation
  console.log('\n💬 Test 4: Extended Conversation (' + config.tests.contextWindow.maxTurns + ' turns)');
  
  const messages4 = [];
  let turnsPassed = 0;
  
  for (let i = 0; i < config.tests.contextWindow.maxTurns; i++) {
    const userMsg = 'Turn ' + (i + 1) + ': Count to ' + (i + 3);
    messages4.push({ role: 'user', content: userMsg });
    
    const response = await client.chatCompletion(messages4, { max_tokens: 100 });
    
    if (response.success) {
      messages4.push({ role: 'assistant', content: response.response });
      turnsPassed++;
      console.log('  Turn ' + (i + 1) + ': Success (' + response.timing.totalMs + 'ms)');
    } else {
      console.log('  Turn ' + (i + 1) + ': Failed - ' + response.error);
      break;
    }
  }
  
  const passed4 = turnsPassed === config.tests.contextWindow.maxTurns;
  printTestResult('Extended conversation', passed4, turnsPassed + '/' + config.tests.contextWindow.maxTurns + ' turns');
  
  results.tests.push({
    name: 'extended_conversation',
    passed: passed4,
    completedTurns: turnsPassed,
    maxTurns: config.tests.contextWindow.maxTurns,
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  const passedCount = results.tests.filter(t => t.passed).length;
  const totalTests = results.tests.length;
  console.log('CONTEXT WINDOW TESTS COMPLETE: ' + passedCount + '/' + totalTests + ' passed');
  console.log('='.repeat(60));

  logEvent('TEST_COMPLETE', { passedCount, totalTests, passRate: (passedCount/totalTests*100).toFixed(1) + '%' });

  // Convert to schema format and save
  const schemaResults = convertToSchema(results);
  try {
    saveSchemaCompliantResults(schemaResults, {
      testType: 'context-window',
      runName: 'legacy-context-window-tests'
    });
  } catch (error) {
    console.error('Failed to save schema-compliant results:', error.message);
  }

  return results;
}

/**
 * Convert legacy context-window test results to unified schema format
 */
function convertToSchema(legacyResults) {
  const now = new Date().toISOString();
  return legacyResults.tests.map((test, idx) => ({
    metadata: {
      timestamp: now,
      testRunId: `legacy-context-window-test-${now.split('T')[0]}`,
      runNumber: idx + 1,
      runName: 'LEGACY_CONTEXT_WINDOW',
      runType: 'context-window'
    },
    input: {
      promptId: test.name.toUpperCase(),
      fullPromptText: `Context window test: ${test.name}`,
      fullPromptTokens: test.storyWordCount || 50
    },
    modelConfig: {
      modelName: 'legacy-server-8088'
    },
    output: {
      response: test.conversation ? 'Multi-turn conversation' : '',
      responseTokens: 100
    },
    timing: {
      totalMs: 0,
      tokensPerSecond: 0
    },
    execution: {
      success: test.passed,
      responseValidated: true,
      errors: []
    },
    contextWindow: {
      turns: test.completedTurns || test.maxTurns || 1,
      maxTurns: test.maxTurns,
      rememberedFacts: test.rememberedColor !== undefined ?
        (test.rememberedColor && test.rememberedLocation ? 2 : 1) : 1
    }
  }));
}

// Run if executed directly
if (import.meta.url === 'file://' + process.argv[1]) {
  runContextWindowTests().catch(console.error);
}

export { runContextWindowTests };
