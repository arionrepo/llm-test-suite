// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/evaluate-all-150-responses.js
// Description: Expert subjective evaluation of all 150 LLM responses for compliance quality
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test result files to evaluate (150 responses total)
const TEST_FILES = [
    'reports/performance/2026-03-26/test-results-multitier-phi3-split-25-run1-2026-03-26T153232299Z.json',
    'reports/performance/2026-03-26/test-results-multitier-phi3-split-25-run2-2026-03-26T154119506Z.json',
    'reports/performance/2026-03-26/test-results-multitier-smollm3-split-25-run1-2026-03-26T153432907Z.json',
    'reports/performance/2026-03-26/test-results-multitier-smollm3-split-25-run2-2026-03-26T154333186Z.json',
    'reports/performance/2026-03-26/test-results-multitier-mistral-split-25-run1-2026-03-26T153734424Z.json',
    'reports/performance/2026-03-26/test-results-multitier-mistral-split-25-run2-2026-03-26T154657787Z.json'
];

/**
 * Extract organizational context from TIER 3 prompt
 */
function extractOrgContext(fullPromptText) {
    const context = {
        industry: null,
        size: null,
        region: null,
        maturity: null
    };

    // Extract industry
    const industryMatch = fullPromptText.match(/Industry:\s*([^\n]+)/);
    if (industryMatch) context.industry = industryMatch[1].trim();

    // Extract organization size
    const sizeMatch = fullPromptText.match(/Organization Size:\s*([^\n]+)/);
    if (sizeMatch) context.size = sizeMatch[1].trim();

    // Extract region
    const regionMatch = fullPromptText.match(/Primary Region:\s*([^\n]+)/);
    if (regionMatch) context.region = regionMatch[1].trim();

    // Extract maturity
    const maturityMatch = fullPromptText.match(/Maturity Level:\s*([^\n]+)/);
    if (maturityMatch) context.maturity = maturityMatch[1].trim();

    return context;
}

/**
 * Extract persona from promptId
 */
function extractPersona(promptId) {
    if (promptId.includes('NOVICE')) return 'NOVICE';
    if (promptId.includes('PRACTITIONER')) return 'PRACTITIONER';
    if (promptId.includes('MANAGER')) return 'MANAGER';
    if (promptId.includes('AUDITOR')) return 'AUDITOR';
    if (promptId.includes('DEVELOPER')) return 'DEVELOPER';
    if (promptId.includes('EXECUTIVE')) return 'EXECUTIVE';
    return 'UNKNOWN';
}

/**
 * Extract user question from prompt
 */
function extractUserQuestion(fullPromptText) {
    const match = fullPromptText.match(/\[CURRENT USER MESSAGE\]\s*(.+?)(?:\n\n|$)/s);
    return match ? match[1].trim() : 'Question not found';
}

/**
 * Process all test files and extract responses for manual evaluation
 */
function extractAllResponses() {
    const allResponses = [];
    let responseNumber = 1;

    for (const filePath of TEST_FILES) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`Processing: ${path.basename(filePath)}`);
        console.log('='.repeat(80));

        const fullPath = path.join(__dirname, filePath);
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const testResults = JSON.parse(fileContent);

        const modelName = testResults.metadata.modelName;
        const results = testResults.results;

        console.log(`Model: ${modelName}`);
        console.log(`Responses in file: ${results.length}\n`);

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const orgContext = extractOrgContext(result.input.fullPromptText);
            const persona = extractPersona(result.input.promptId);
            const userQuestion = extractUserQuestion(result.input.fullPromptText);

            const responseData = {
                responseNumber,
                sourceFile: path.basename(filePath),
                model: modelName,
                promptId: result.input.promptId,
                persona,
                orgContext,
                userQuestion,
                fullPrompt: result.input.fullPromptText,
                response: result.output.response,
                timestamp: result.metadata.timestamp
            };

            allResponses.push(responseData);

            // Display for manual review
            console.log(`\n${'─'.repeat(80)}`);
            console.log(`RESPONSE #${responseNumber}`);
            console.log('─'.repeat(80));
            console.log(`Model: ${modelName}`);
            console.log(`Prompt ID: ${result.input.promptId}`);
            console.log(`Persona: ${persona}`);
            console.log(`Industry: ${orgContext.industry}`);
            console.log(`Size: ${orgContext.size}`);
            console.log(`Maturity: ${orgContext.maturity}`);
            console.log(`\nUser Question:`);
            console.log(userQuestion);
            console.log(`\nLLM Response:`);
            console.log(result.output.response);
            console.log('─'.repeat(80));

            responseNumber++;
        }
    }

    // Save extracted responses for reference
    const outputPath = path.join(__dirname, 'ratings/extracted-responses-for-evaluation.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(allResponses, null, 2));

    console.log(`\n\n${'='.repeat(80)}`);
    console.log(`EXTRACTION COMPLETE`);
    console.log('='.repeat(80));
    console.log(`Total responses extracted: ${allResponses.length}`);
    console.log(`Saved to: ${outputPath}`);
    console.log(`\nReady for expert evaluation.`);

    return allResponses;
}

// Run extraction
extractAllResponses();
