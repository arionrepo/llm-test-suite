#!/usr/bin/env node

/**
 * File: prompt-viewer.js
 * Description: Interactive prompt viewer with filtering by test run, standard, persona, etc.
 * Author: Libor Ballaty <libor@arionetworks.com>
 * Created: 2026-03-26
 *
 * Usage:
 *   node prompt-viewer.js [options]
 *
 * Examples:
 *   node prompt-viewer.js --run 6                    # Show all Run 6 prompts
 *   node prompt-viewer.js --run 6 --standard GDPR   # Show GDPR prompts from Run 6
 *   node prompt-viewer.js --run 1-5                  # Show prompts from Runs 1-5
 *   node prompt-viewer.js --all                      # Show all prompts
 *   node prompt-viewer.js --help                     # Show help
 */

import fs from 'fs';
import path from 'path';
import { PERFORMANCE_PROMPTS } from './performance-prompts.js';
import { AI_BACKEND_MULTI_TIER_TESTS } from './enterprise/arioncomply-workflows/ai-backend-multi-tier-tests.js';

// Parse command line arguments
const args = process.argv.slice(2);
const options = parseArgs(args);

function parseArgs(args) {
    const opts = {
        run: null,
        standard: null,
        persona: null,
        knowledge: null,
        format: 'text', // text, json, csv
        details: false,
        help: false,
        all: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--run' && args[i + 1]) {
            opts.run = args[++i];
        } else if (arg === '--standard' && args[i + 1]) {
            opts.standard = args[++i].toUpperCase();
        } else if (arg === '--persona' && args[i + 1]) {
            opts.persona = args[++i].toUpperCase();
        } else if (arg === '--knowledge' && args[i + 1]) {
            opts.knowledge = args[++i].toUpperCase();
        } else if (arg === '--format' && args[i + 1]) {
            opts.format = args[++i].toLowerCase();
        } else if (arg === '--details' || arg === '-d') {
            opts.details = true;
        } else if (arg === '--all') {
            opts.all = true;
        } else if (arg === '--help' || arg === '-h') {
            opts.help = true;
        }
    }

    return opts;
}

function showHelp() {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                   PROMPT VIEWER - PERFORMANCE TEST SUITE                  ║
╚════════════════════════════════════════════════════════════════════════════╝

USAGE:
  node prompt-viewer.js [options]

OPTIONS:
  --run <N>         View prompts from specific run (1-6, or range like 1-3)
  --standard <S>    Filter by standard (GDPR, ISO_27001, etc)
  --persona <P>     Filter by persona (NOVICE, PRACTITIONER, MANAGER, etc)
  --knowledge <K>   Filter by knowledge type (FACTUAL, PROCEDURAL, SYNTHESIS, etc)
  --format <F>      Output format: text (default), json, csv
  --details, -d     Show full prompt details (not just summary)
  --all             Show all prompts from all runs
  --help, -h        Show this help message

EXAMPLES:
  # Show all prompts from Run 6 (today's multi-tier test)
  node prompt-viewer.js --run 6

  # Show GDPR prompts from Run 6 with full details
  node prompt-viewer.js --run 6 --standard GDPR --details

  # Show all MANAGER-level prompts
  node prompt-viewer.js --persona MANAGER

  # Compare prompts across Run 1 and Run 6
  node prompt-viewer.js --run 1-6

  # Export Run 6 prompts as JSON
  node prompt-viewer.js --run 6 --format json

  # Show procedural knowledge prompts from all runs
  node prompt-viewer.js --all --knowledge PROCEDURAL

RUN INFORMATION:
  Run 1:  TINY (10 tokens)         - Baseline simple questions
  Run 2:  SMALL (50 tokens)        - Short form questions
  Run 3:  MEDIUM (100 tokens)      - Medium complexity
  Run 4:  LONG (150 tokens)        - Long form questions
  Run 5:  VERYLONG (190 tokens)    - Extended context
  Run 6:  MULTITIER (2000+ tokens) - Production multi-tier prompts

STANDARDS:
  GDPR, ISO_27001, ISO_27701, SOC_2, HIPAA, PCI_DSS, EU_AI_ACT, NIST_CSF, etc.

PERSONAS:
  NOVICE, PRACTITIONER, MANAGER, AUDITOR, EXECUTIVE

KNOWLEDGE TYPES:
  FACTUAL, RELATIONAL, PROCEDURAL, EXACT_MATCH, SYNTHESIS

CONTACTS:
  libor@arionetworks.com
    `);
}

function getRunNumbers(runSpec) {
    if (!runSpec) return null;

    if (runSpec === 'all') {
        return [1, 2, 3, 4, 5, 6];
    }

    // Handle ranges like "1-3" or "1-6"
    if (runSpec.includes('-')) {
        const [start, end] = runSpec.split('-').map(Number);
        const runs = [];
        for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= 6) runs.push(i);
        }
        return runs;
    }

    // Single run
    const run = parseInt(runSpec);
    return (run >= 1 && run <= 6) ? [run] : null;
}

function getPromptsForRun(runNum) {
    const runMap = {
        1: { name: 'TINY', data: PERFORMANCE_PROMPTS.RUN_1_TINY },
        2: { name: 'SMALL', data: PERFORMANCE_PROMPTS.RUN_2_SHORT },
        3: { name: 'MEDIUM', data: PERFORMANCE_PROMPTS.RUN_3_MEDIUM },
        4: { name: 'LONG', data: PERFORMANCE_PROMPTS.RUN_4_LONG },
        5: { name: 'VERYLONG', data: PERFORMANCE_PROMPTS.RUN_5_VERYLONG },
        6: { name: 'MULTITIER', data: Object.values(AI_BACKEND_MULTI_TIER_TESTS) }
    };

    const runInfo = runMap[runNum];
    if (!runInfo) return null;

    // Enrich simple prompts with metadata for consistency
    const prompts = runInfo.data.map(p => {
        if (p.id && p.id.startsWith('ARION_MULTITIER')) {
            // Already has metadata (Run 6)
            return p;
        } else {
            // Simple prompts (Runs 1-5)
            return {
                id: p.id,
                runNumber: runNum,
                runName: runInfo.name,
                question: p.input || p.question,
                tokens: p.tokens,
                standard: extractStandard(p.input || p.question),
                persona: 'GENERAL',
                knowledgeType: 'FACTUAL'
            };
        }
    });

    return { runNum, runName: runInfo.name, prompts };
}

function extractStandard(question) {
    const standards = ['GDPR', 'ISO_27001', 'ISO_27701', 'SOC_2', 'HIPAA', 'PCI_DSS', 'EU_AI_ACT', 'NIST_CSF', 'FEDRAMP', 'CMMC'];
    for (const standard of standards) {
        if (question.toUpperCase().includes(standard.replace(/_/g, ' '))) {
            return standard;
        }
    }
    return 'GENERAL';
}

function filterPrompts(allPrompts, options) {
    let filtered = [...allPrompts];

    if (options.standard) {
        filtered = filtered.filter(p => {
            const std = p.standard || extractStandard(p.question);
            return std.includes(options.standard) || options.standard.includes(std);
        });
    }

    if (options.persona) {
        filtered = filtered.filter(p => {
            const persona = p.persona || 'GENERAL';
            return persona.includes(options.persona) || options.persona.includes(persona);
        });
    }

    if (options.knowledge) {
        filtered = filtered.filter(p => {
            const kt = p.knowledgeType || 'FACTUAL';
            return kt.includes(options.knowledge) || options.knowledge.includes(kt);
        });
    }

    return filtered;
}

function displayText(runs, options) {
    runs.forEach(run => {
        console.log(`\n${'═'.repeat(80)}`);
        console.log(`RUN ${run.runNum}: ${run.runName.toUpperCase()}`);
        console.log(`${'═'.repeat(80)}\n`);

        const filtered = filterPrompts(run.prompts, options);

        if (filtered.length === 0) {
            console.log('No prompts match the specified filters.\n');
            return;
        }

        console.log(`Found ${filtered.length} prompts:\n`);

        filtered.forEach((p, idx) => {
            const tokens = p.tokens || p.inputTokens || '?';
            const standard = p.standard || extractStandard(p.question);
            const persona = p.persona || 'GENERAL';
            const knowledge = p.knowledgeType || 'FACTUAL';

            console.log(`${idx + 1}. ${p.id}`);
            console.log(`   Standard: ${standard}`);
            console.log(`   Persona: ${persona}`);
            if (p.knowledgeType) {
                console.log(`   Knowledge: ${knowledge}`);
            }
            console.log(`   Tokens: ${tokens}`);

            if (options.details) {
                console.log(`   Question: ${(p.question || p.fullPrompt || '').substring(0, 200)}...`);
                if (p.expectedTopics) {
                    console.log(`   Expected Topics: ${p.expectedTopics.join(', ')}`);
                }
                if (p.tier2Mode) {
                    console.log(`   Mode: ${p.tier2Mode}`);
                    console.log(`   Org: ${p.orgProfile?.industry} (${p.orgProfile?.org_size})`);
                }
            }
            console.log();
        });

        console.log(`${'─'.repeat(80)}`);
        console.log(`Total for Run ${run.runNum}: ${filtered.length} prompts\n`);
    });
}

function displayJSON(runs, options) {
    const output = {
        timestamp: new Date().toISOString(),
        options,
        runs: runs.map(run => ({
            runNum: run.runNum,
            runName: run.runName,
            totalCount: run.prompts.length,
            filteredCount: filterPrompts(run.prompts, options).length,
            prompts: filterPrompts(run.prompts, options)
        }))
    };

    console.log(JSON.stringify(output, null, 2));
}

function displayCSV(runs, options) {
    const headers = ['Run', 'ID', 'Question', 'Tokens', 'Standard', 'Persona', 'Knowledge', 'Topics'];
    console.log(headers.join(','));

    runs.forEach(run => {
        filterPrompts(run.prompts, options).forEach(p => {
            const row = [
                run.runNum,
                p.id,
                `"${(p.question || p.id).replace(/"/g, '""').substring(0, 100)}"`,
                p.tokens || p.inputTokens || '?',
                p.standard || extractStandard(p.question),
                p.persona || 'GENERAL',
                p.knowledgeType || 'FACTUAL',
                p.expectedTopics ? `"${p.expectedTopics.join('; ')}"` : ''
            ];
            console.log(row.join(','));
        });
    });
}

function main() {
    if (options.help) {
        showHelp();
        return;
    }

    // Determine which runs to display
    const runNumbers = options.all ? [1, 2, 3, 4, 5, 6] : getRunNumbers(options.run);

    if (!runNumbers) {
        console.error('❌ Invalid run specification. Use --help for usage information.');
        process.exit(1);
    }

    // Load prompts for each run
    const runs = [];
    for (const runNum of runNumbers) {
        const runData = getPromptsForRun(runNum);
        if (runData) {
            runs.push(runData);
        }
    }

    if (runs.length === 0) {
        console.error('❌ No prompts found for specified runs.');
        process.exit(1);
    }

    // Display according to format
    console.log();
    switch (options.format.toLowerCase()) {
        case 'json':
            displayJSON(runs, options);
            break;
        case 'csv':
            displayCSV(runs, options);
            break;
        case 'text':
        default:
            displayText(runs, options);
    }
}

main();
