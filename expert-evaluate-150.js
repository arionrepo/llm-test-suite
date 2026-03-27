// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/expert-evaluate-150.js
// Description: Senior compliance expert subjective evaluation of all 150 LLM responses
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Expert evaluation criteria for LLM compliance responses
 * This evaluates responses as a senior compliance advisor would
 */

// Load all extracted responses
const responsesFile = path.join(__dirname, 'ratings/extracted-responses-for-evaluation.json');
const allResponses = JSON.parse(fs.readFileSync(responsesFile, 'utf8'));

console.log(`Total responses to evaluate: ${allResponses.length}`);
console.log(`Starting expert evaluation process...\n`);

/**
 * Evaluate a single response with expert judgment
 */
function evaluateResponse(responseData) {
    const {
        responseNumber,
        model,
        promptId,
        persona,
        orgContext,
        userQuestion,
        response
    } = responseData;

    // Initialize evaluation object
    const evaluation = {
        responseNumber,
        model,
        promptId,
        persona,
        industry: orgContext.industry,
        size: orgContext.size,
        maturity: orgContext.maturity,
        userQuestion,
        response,

        // Evaluation metrics (to be filled by expert)
        readability: null,
        understandability: null,
        accuracy: null,
        overallRating: null,
        explanation: "",

        // Issue flags
        hasThinkTags: response.includes('<think>') || response.includes('</think>'),
        hasHallucination: false,
        usesOrgContext: false,
        majorIssues: []
    };

    // Check for org context usage
    if (orgContext.industry) {
        const industryMentioned = response.toLowerCase().includes(orgContext.industry.toLowerCase());
        evaluation.usesOrgContext = industryMentioned;
    }

    // Check for hallucinated dialogues
    if (response.includes('[USER RESPONSE]') || response.includes('[ASSISTANT RESPONSE]')) {
        evaluation.hasHallucination = true;
        evaluation.majorIssues.push('Hallucinated dialogue');
    }

    // Display for manual evaluation
    console.log(`\n${'='.repeat(100)}`);
    console.log(`RESPONSE #${responseNumber} - ${model.toUpperCase()}`);
    console.log('='.repeat(100));
    console.log(`Prompt ID: ${promptId}`);
    console.log(`Persona: ${persona} | Industry: ${orgContext.industry} | Size: ${orgContext.size} | Maturity: ${orgContext.maturity}`);
    console.log(`\nUser Question: ${userQuestion}`);
    console.log(`\nLLM Response:`);
    console.log(response);
    console.log(`\n${'-'.repeat(100)}`);
    console.log(`Think tags: ${evaluation.hasThinkTags ? 'YES ⚠️' : 'No'}`);
    console.log(`Hallucination: ${evaluation.hasHallucination ? 'YES ⚠️' : 'No'}`);
    console.log(`Uses org context: ${evaluation.usesOrgContext ? 'YES ✓' : 'No'}`);
    console.log('='.repeat(100));

    return evaluation;
}

/**
 * Process responses in batches for manageable expert review
 */
function processBatch(startIdx, endIdx) {
    console.log(`\n\n${'#'.repeat(100)}`);
    console.log(`PROCESSING BATCH: Responses ${startIdx + 1} to ${endIdx}`);
    console.log('#'.repeat(100));

    const evaluations = [];

    for (let i = startIdx; i < endIdx && i < allResponses.length; i++) {
        const evaluation = evaluateResponse(allResponses[i]);
        evaluations.push(evaluation);
    }

    return evaluations;
}

// Process in batches of 10 for expert review
const BATCH_SIZE = 150; // All at once for full display
const allEvaluations = [];

for (let i = 0; i < allResponses.length; i += BATCH_SIZE) {
    const endIdx = Math.min(i + BATCH_SIZE, allResponses.length);
    const batchEvals = processBatch(i, endIdx);
    allEvaluations.push(...batchEvals);
}

// Save template for manual completion
const outputPath = path.join(__dirname, 'ratings/claude-subjective-all-150-TEMPLATE.json');
fs.writeFileSync(outputPath, JSON.stringify(allEvaluations, null, 2));

console.log(`\n\n${'#'.repeat(100)}`);
console.log(`EVALUATION TEMPLATE CREATED`);
console.log('#'.repeat(100));
console.log(`Total responses displayed: ${allEvaluations.length}`);
console.log(`Template saved to: ${outputPath}`);
console.log(`\nNEXT STEPS:`);
console.log(`1. Review each response above as a senior compliance expert`);
console.log(`2. Fill in readability, understandability, accuracy (1-5 scale)`);
console.log(`3. Assign overallRating (-1 to 5)`);
console.log(`4. Write detailed 4-6 sentence explanation for each`);
console.log(`5. Flag any additional major issues`);
console.log('#'.repeat(100));
