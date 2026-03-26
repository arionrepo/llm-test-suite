// Analyze performance test results and generate visualizations
import fs from 'fs';

function analyzePerformanceResults() {
  const aggregate = JSON.parse(fs.readFileSync('./reports/performance-aggregate.json', 'utf8'));

  const analysis = {
    overview: {
      totalExecutions: aggregate.totalExecutions,
      completionRate: aggregate.completionRate,
      issuesEncountered: aggregate.issues.length
    },

    byModel: analyzeByModel(aggregate.results),
    byInputRange: analyzeByInputRange(aggregate.results),
    correlations: analyzeCorrelations(aggregate.results),
    recommendations: generateRecommendations(aggregate.results)
  };

  fs.writeFileSync('./reports/performance-analysis.json', JSON.stringify(analysis, null, 2));

  generateHTML(analysis);
  generateCSV(aggregate.results);

  console.log('Performance analysis complete!');
  console.log('- performance-analysis.json');
  console.log('- performance-visualizations.html');
  console.log('- performance-data.csv');
}

function analyzeByModel(results) {
  const byModel = {};

  results.forEach(r => {
    if (!byModel[r.modelName]) {
      byModel[r.modelName] = {
        tests: [],
        avgInputSpeed: 0,
        avgOutputSpeed: 0,
        avgTotalTime: 0
      };
    }
    byModel[r.modelName].tests.push(r);
  });

  Object.keys(byModel).forEach(model => {
    const tests = byModel[model].tests;
    byModel[model].avgInputSpeed = tests.reduce((sum, t) => sum + (t.inputTokPerSec || 0), 0) / tests.length;
    byModel[model].avgOutputSpeed = tests.reduce((sum, t) => sum + (t.outputTokPerSec || 0), 0) / tests.length;
    byModel[model].avgTotalTime = tests.reduce((sum, t) => sum + (t.totalTimeMs || 0), 0) / tests.length;
  });

  return byModel;
}

function analyzeByInputRange(results) {
  const ranges = {
    tiny: results.filter(r => r.inputTokens < 20),
    short: results.filter(r => r.inputTokens >= 20 && r.inputTokens < 50),
    medium: results.filter(r => r.inputTokens >= 50 && r.inputTokens < 200),
    long: results.filter(r => r.inputTokens >= 200 && r.inputTokens < 1000),
    veryLong: results.filter(r => r.inputTokens >= 1000)
  };

  return ranges;
}

function analyzeCorrelations(results) {
  return {
    inputTokensVsSpeed: calculateCorrelation(
      results.map(r => r.inputTokens),
      results.map(r => r.inputTokPerSec)
    ),
    outputTokensVsSpeed: calculateCorrelation(
      results.map(r => r.outputTokens),
      results.map(r => r.outputTokPerSec)
    )
  };
}

function calculateCorrelation(x, y) {
  const n = x.length;
  const sumX = x.reduce((a,b) => a+b, 0);
  const sumY = y.reduce((a,b) => a+b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
}

function generateRecommendations(results) {
  const byModel = {};

  results.forEach(r => {
    if (!byModel[r.modelName]) byModel[r.modelName] = [];
    byModel[r.modelName].push(r.outputTokPerSec);
  });

  const fastest = Object.entries(byModel)
    .map(([model, speeds]) => ({
      model,
      avgSpeed: speeds.reduce((a,b) => a+b, 0) / speeds.length
    }))
    .sort((a,b) => b.avgSpeed - a.avgSpeed)[0];

  return {
    fastestModel: fastest.model,
    fastestSpeed: fastest.avgSpeed
  };
}

function generateHTML(analysis) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Performance Analysis</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
  <h1>Performance Test Results</h1>
  <div id="charts"></div>
  <script>
    const analysis = ${JSON.stringify(analysis)};
    // Chart rendering code would go here
  </script>
</body>
</html>`;

  fs.writeFileSync('./reports/performance-visualizations.html', html);
}

function generateCSV(results) {
  const csv = [
    ['model', 'run', 'prompt', 'input_tokens', 'output_tokens', 'total_tokens', 'total_time_ms', 'output_tok_per_sec'].join(',')
  ];

  results.forEach(r => {
    csv.push([
      r.modelName,
      r.runNumber,
      r.promptId,
      r.inputTokens,
      r.outputTokens,
      r.totalTokens,
      r.totalTimeMs,
      r.outputTokPerSec
    ].join(','));
  });

  fs.writeFileSync('./reports/performance-data.csv', csv.join('\n'));
}

analyzePerformanceResults();
