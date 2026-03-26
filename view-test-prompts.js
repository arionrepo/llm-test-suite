import fs from 'fs';

// Read the performance test results from today
const run6Results = JSON.parse(fs.readFileSync('reports/performance-run-6-multitier.json', 'utf8'));

// Get unique prompt IDs
const promptIds = [...new Set(run6Results.results.map(r => r.promptId))];

console.log('\n═══════════════════════════════════════════════════════════════════════════════');
console.log('RUN 6 (TODAY) - MULTI-TIER TEST PROMPTS');
console.log('═══════════════════════════════════════════════════════════════════════════════\n');

console.log('Total unique prompts used: ' + promptIds.length);
console.log('Total tests executed: ' + run6Results.results.length + ' (' + promptIds.length + ' prompts × 10 models)\n');

console.log('PROMPTS USED IN TODAY\'S TESTING:');
console.log('─────────────────────────────────────────────────────────────────────────────\n');

promptIds.forEach((promptId, idx) => {
    const results = run6Results.results.filter(r => r.promptId === promptId);
    const avgInputTokens = results[0].inputTokens;
    const avgOutputTokens = (results.reduce((sum, r) => sum + r.outputTokens, 0) / results.length).toFixed(0);

    console.log((idx + 1) + '. ' + promptId);
    console.log('   Input Tokens: ' + avgInputTokens);
    console.log('   Output Tokens (avg): ' + avgOutputTokens);
    console.log('   Total Prompt Size: ' + (parseInt(avgInputTokens) + parseInt(avgOutputTokens)) + ' tokens');
    console.log();
});
