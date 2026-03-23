// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/export-prompts.js
// Description: Export all test prompts for review, analysis, and documentation
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { generateAllTests } from './enterprise/test-data-generator.js';
import { getAllArionComplyPrompts } from './enterprise/arioncomply-workflows/ui-tasks.js';
import fs from 'fs';

const EXPORT_DIR = './reports/prompts';

function exportToCSV(tests, filename) {
  // Create header
  const csv = [
    ['ID', 'Standard', 'Knowledge Type', 'Persona', 'Question', 'Expected Topics', 'Retrieval Strategy'].join(',')
  ];

  tests.forEach(test => {
    const row = [
      test.id,
      test.standard,
      test.knowledgeType,
      test.persona,
      '"' + test.question.replace(/"/g, '""') + '"',
      '"' + (test.expectedTopics || []).join('; ') + '"',
      test.retrievalStrategy
    ];
    csv.push(row.join(','));
  });

  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  fs.writeFileSync(EXPORT_DIR + '/' + filename, csv.join('\n'));
  console.log('✅ Exported to: ' + EXPORT_DIR + '/' + filename);
}

function exportToMarkdown(tests, filename) {
  let md = '# Enterprise Compliance Test Prompts\n\n';
  md += '**Generated:** ' + new Date().toISOString() + '\n';
  md += '**Total Tests:** ' + tests.length + '\n\n';

  // Group by standard
  const byStandard = {};
  tests.forEach(test => {
    if (!byStandard[test.standard]) {
      byStandard[test.standard] = [];
    }
    byStandard[test.standard].push(test);
  });

  for (const [standard, stdTests] of Object.entries(byStandard)) {
    md += '## ' + standard + ' (' + stdTests.length + ' tests)\n\n';

    // Group by knowledge type
    const byKT = {};
    stdTests.forEach(test => {
      if (!byKT[test.knowledgeType]) {
        byKT[test.knowledgeType] = [];
      }
      byKT[test.knowledgeType].push(test);
    });

    for (const [kt, ktTests] of Object.entries(byKT)) {
      md += '### ' + kt + '\n\n';

      ktTests.forEach(test => {
        md += '**Persona:** ' + test.persona + '  \n';
        md += '**Question:** ' + test.question + '  \n';
        md += '**Expected Topics:** ' + (test.expectedTopics || []).join(', ') + '  \n';
        md += '**Retrieval Strategy:** ' + test.retrievalStrategy + '  \n';
        md += '\n---\n\n';
      });
    }
  }

  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  fs.writeFileSync(EXPORT_DIR + '/' + filename, md);
  console.log('✅ Exported to: ' + EXPORT_DIR + '/' + filename);
}

function exportArionComplyPrompts(filename) {
  const prompts = getAllArionComplyPrompts();
  
  let md = '# ArionComply Application Prompts\n\n';
  md += '**Generated:** ' + new Date().toISOString() + '\n';
  md += '**Total Prompts:** ' + prompts.length + '\n\n';

  // Group by category
  const byCategory = {};
  prompts.forEach(p => {
    if (!byCategory[p.category]) {
      byCategory[p.category] = [];
    }
    byCategory[p.category].push(p);
  });

  for (const [category, catPrompts] of Object.entries(byCategory)) {
    md += '## ' + category.replace(/_/g, ' ').toUpperCase() + '\n\n';

    catPrompts.forEach(p => {
      md += '### ' + p.task + '\n\n';
      md += '**User Type:** ' + p.userType + '  \n';
      md += '**Context Level:** ' + p.contextLevel + '  \n\n';
      md += '**Prompt:**  \n';
      md += '> ' + p.prompt + '\n\n';
      
      if (p.expectedClarifications && p.expectedClarifications.length > 0) {
        md += '**Expected Clarifications:**  \n';
        p.expectedClarifications.forEach(c => {
          md += '- ' + c + '\n';
        });
        md += '\n';
      }

      if (p.expectedGuidance && p.expectedGuidance.length > 0) {
        md += '**Expected Guidance:**  \n';
        p.expectedGuidance.forEach((g, idx) => {
          md += (idx + 1) + '. ' + g + '\n';
        });
        md += '\n';
      }

      md += '---\n\n';
    });
  }

  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  fs.writeFileSync(EXPORT_DIR + '/' + filename, md);
  console.log('✅ Exported to: ' + EXPORT_DIR + '/' + filename);
}

function main() {
  console.log('\n📝 Exporting Enterprise Test Prompts...\n');

  // Generate and export compliance tests
  const tests = generateAllTests();
  
  exportToCSV(tests, 'compliance-prompts.csv');
  exportToMarkdown(tests, 'compliance-prompts.md');

  // Export ArionComply-specific prompts
  exportArionComplyPrompts('arioncomply-prompts.md');

  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    compliance_tests: tests.length,
    arioncomply_prompts: getAllArionComplyPrompts().length,
    total: tests.length + getAllArionComplyPrompts().length
  };

  fs.writeFileSync(EXPORT_DIR + '/summary.json', JSON.stringify(summary, null, 2));
  
  console.log('\n📊 Summary:');
  console.log('  Compliance Tests: ' + summary.compliance_tests);
  console.log('  ArionComply Prompts: ' + summary.arioncomply_prompts);
  console.log('  Total Prompts: ' + summary.total);
  console.log('\n✅ All prompts exported to: ' + EXPORT_DIR);
}

if (import.meta.url === 'file://' + process.argv[1]) {
  main();
}
