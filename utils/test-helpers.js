// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/test-helpers.js
// Description: Shared utility functions for test suites - formatting, statistics, reporting, validation
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import fs from 'fs';
import path from 'path';

export function formatDuration(ms) {
  if (ms < 1000) return ms.toFixed(0) + 'ms';
  return (ms / 1000).toFixed(2) + 's';
}

export function calculateStats(numbers) {
  if (numbers.length === 0) return null;
  
  const sorted = numbers.slice().sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const avg = sum / sorted.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  return { avg, median, min, max, count: numbers.length };
}

export function printTestHeader(testName) {
  console.log('\n' + '='.repeat(60));
  console.log('  ' + testName);
  console.log('='.repeat(60) + '\n');
}

export function printTestResult(testName, passed, details) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(status + ': ' + testName);
  if (details) console.log('  ' + details);
}

export function saveReport(testName, results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = 'test-results-' + testName + '-' + timestamp + '.json';
  const filepath = path.join(process.cwd(), 'reports', filename);
  
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
  
  console.log('\n📊 Report saved: ' + filepath);
  return filepath;
}

export function validateResponse(response, criteria) {
  const results = [];
  
  if (criteria.minLength && response.length < criteria.minLength) {
    results.push({ 
      passed: false, 
      test: 'minLength', 
      expected: criteria.minLength, 
      actual: response.length 
    });
  }
  
  if (criteria.contains) {
    for (const text of criteria.contains) {
      const passed = response.toLowerCase().includes(text.toLowerCase());
      results.push({ passed, test: 'contains', expected: text });
    }
  }
  
  if (criteria.notContains) {
    for (const text of criteria.notContains) {
      const passed = !response.toLowerCase().includes(text.toLowerCase());
      results.push({ passed, test: 'notContains', expected: text });
    }
  }
  
  return {
    allPassed: results.every(r => r.passed),
    results,
  };
}
