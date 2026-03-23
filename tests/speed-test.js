// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/tests/speed-test.js
// Description: Performance benchmark tests - latency, throughput, tokens/sec, concurrent request handling
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { LLMClient } from '../utils/llm-client.js';
import { config } from '../config.js';
import { printTestHeader, printTestResult, calculateStats, formatDuration, saveReport } from '../utils/test-helpers.js';

async function runSpeedTests() {
  printTestHeader('SPEED & PERFORMANCE TESTS');
  
  const client = new LLMClient();
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
  };
  
  // Test 1: Server Health Check
  console.log('⏱️  Test 1: Server Health Check');
  const isHealthy = await client.health();
  printTestResult('Server health check', isHealthy);
  results.tests.push({ name: 'health', passed: isHealthy });
  
  if (!isHealthy) {
    console.log('\n❌ Server is not responding. Please check llama-server is running on port 8088.');
    return results;
  }
  
  // Test 2: Latency - Short Prompt
  console.log('\n⏱️  Test 2: Latency Test (Short Prompt)');
  const shortPromptTimes = [];
  for (let i = 0; i < config.tests.speed.repetitions; i++) {
    const result = await client.chatCompletion([
      { role: 'user', content: config.tests.speed.prompts.short }
    ], { max_tokens: 10 });
    
    if (result.success) {
      shortPromptTimes.push(result.timing.totalMs);
      console.log('  Run ' + (i+1) + ': ' + formatDuration(result.timing.totalMs) + 
                  ' (' + result.timing.tokensPerSec.toFixed(1) + ' tok/s)');
    }
  }
  
  const shortStats = calculateStats(shortPromptTimes);
  console.log('\n  📊 Statistics:');
  console.log('     Average: ' + formatDuration(shortStats.avg));
  console.log('     Median:  ' + formatDuration(shortStats.median));
  console.log('     Min:     ' + formatDuration(shortStats.min));
  console.log('     Max:     ' + formatDuration(shortStats.max));
  
  results.tests.push({
    name: 'latency_short',
    passed: shortStats.avg < 2000,
    stats: shortStats,
  });
  
  // Test 3: Throughput - Medium Prompt
  console.log('\n⏱️  Test 3: Throughput Test (Medium Prompt)');
  const mediumResult = await client.chatCompletion([
    { role: 'user', content: config.tests.speed.prompts.medium }
  ], { max_tokens: 200 });
  
  if (mediumResult.success) {
    console.log('  Total time: ' + formatDuration(mediumResult.timing.totalMs));
    console.log('  Prompt processing: ' + formatDuration(mediumResult.timing.promptMs));
    console.log('  Response generation: ' + formatDuration(mediumResult.timing.predictedMs));
    console.log('  Tokens generated: ' + mediumResult.timing.completionTokens);
    console.log('  Throughput: ' + mediumResult.timing.tokensPerSec.toFixed(1) + ' tokens/sec');
    
    printTestResult('Medium prompt throughput', mediumResult.timing.tokensPerSec > 20, 
                    mediumResult.timing.tokensPerSec.toFixed(1) + ' tok/s');
    
    results.tests.push({
      name: 'throughput_medium',
      passed: mediumResult.timing.tokensPerSec > 20,
      tokensPerSec: mediumResult.timing.tokensPerSec,
      timing: mediumResult.timing,
    });
  }
  
  // Test 4: Long Prompt Processing
  console.log('\n⏱️  Test 4: Long Prompt Processing');
  const longResult = await client.chatCompletion([
    { role: 'user', content: config.tests.speed.prompts.long }
  ], { max_tokens: 300 });
  
  if (longResult.success) {
    console.log('  Total time: ' + formatDuration(longResult.timing.totalMs));
    console.log('  Prompt tokens: ' + longResult.timing.promptTokens);
    console.log('  Prompt processing speed: ' + 
                (longResult.timing.promptTokens / (longResult.timing.promptMs / 1000)).toFixed(1) + ' tok/s');
    console.log('  Generation speed: ' + longResult.timing.tokensPerSec.toFixed(1) + ' tok/s');
    
    results.tests.push({
      name: 'long_prompt',
      passed: longResult.timing.totalMs < 30000,
      timing: longResult.timing,
    });
  }
  
  // Test 5: Concurrent Requests
  console.log('\n⏱️  Test 5: Concurrent Request Handling');
  console.log('  Sending ' + config.tests.speed.concurrentRequests + ' requests simultaneously...');
  
  const concurrentStart = Date.now();
  const promises = [];
  for (let i = 0; i < config.tests.speed.concurrentRequests; i++) {
    promises.push(
      client.chatCompletion([
        { role: 'user', content: 'Count to ' + (i + 3) }
      ], { max_tokens: 50 })
    );
  }
  
  const concurrentResults = await Promise.all(promises);
  const concurrentEnd = Date.now();
  const concurrentTime = concurrentEnd - concurrentStart;
  
  const successCount = concurrentResults.filter(r => r.success).length;
  console.log('  All requests completed in: ' + formatDuration(concurrentTime));
  console.log('  Successful requests: ' + successCount + '/' + config.tests.speed.concurrentRequests);
  
  printTestResult('Concurrent requests', successCount === config.tests.speed.concurrentRequests);
  
  results.tests.push({
    name: 'concurrent',
    passed: successCount === config.tests.speed.concurrentRequests,
    totalTimeMs: concurrentTime,
    successCount,
    totalRequests: config.tests.speed.concurrentRequests,
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  const passedCount = results.tests.filter(t => t.passed).length;
  const totalTests = results.tests.length;
  console.log('SPEED TESTS COMPLETE: ' + passedCount + '/' + totalTests + ' passed');
  console.log('='.repeat(60));
  
  saveReport('speed', results);
  return results;
}

// Run if executed directly
if (import.meta.url === 'file://' + process.argv[1]) {
  runSpeedTests().catch(console.error);
}

export { runSpeedTests };
