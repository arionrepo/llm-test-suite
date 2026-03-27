// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/create-evaluation-sample.js
// Description: Create stratified sample of 30 responses for expert evaluation
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-26

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load all extracted responses
const responsesFile = path.join(__dirname, 'ratings/extracted-responses-for-evaluation.json');
const allResponses = JSON.parse(fs.readFileSync(responsesFile, 'utf8'));

console.log(`Total responses available: ${allResponses.length}\n`);

// Group by model
const byModel = {};
allResponses.forEach(r => {
    if (!byModel[r.model]) byModel[r.model] = [];
    byModel[r.model].push(r);
});

// Display model distribution
console.log('Responses per model:');
Object.keys(byModel).forEach(model => {
    console.log(`  ${model}: ${byModel[model].length} responses`);
});

// Select 10 responses per model (stratified by persona if possible)
const sample = [];

Object.keys(byModel).forEach(model => {
    const modelResponses = byModel[model];

    // Group by persona
    const byPersona = {};
    modelResponses.forEach(r => {
        if (!byPersona[r.persona]) byPersona[r.persona] = [];
        byPersona[r.persona].push(r);
    });

    const personas = Object.keys(byPersona);
    const responsesPerPersona = Math.floor(10 / personas.length);
    const extras = 10 % personas.length;

    let selected = 0;
    personas.forEach((persona, idx) => {
        const count = responsesPerPersona + (idx < extras ? 1 : 0);
        const personaResponses = byPersona[persona];

        // Select evenly distributed across this persona's responses
        const step = Math.floor(personaResponses.length / count);
        for (let i = 0; i < count && i * step < personaResponses.length; i++) {
            sample.push(personaResponses[i * step]);
            selected++;
        }
    });

    console.log(`\n${model}:`);
    console.log(`  Selected ${selected} responses across ${personas.length} personas`);
    Object.keys(byPersona).forEach(p => {
        const selectedCount = sample.filter(s => s.model === model && s.persona === p).length;
        console.log(`    ${p}: ${selectedCount} selected from ${byPersona[p].length} available`);
    });
});

// Sort sample by response number for easier review
sample.sort((a, b) => a.responseNumber - b.responseNumber);

console.log(`\n${'='.repeat(80)}`);
console.log(`SAMPLE SELECTION COMPLETE`);
console.log('='.repeat(80));
console.log(`Total sample size: ${sample.length} responses`);
console.log(`Sample response numbers: ${sample.map(s => s.responseNumber).join(', ')}`);

// Save sample
const samplePath = path.join(__dirname, 'ratings/evaluation-sample-30.json');
fs.writeFileSync(samplePath, JSON.stringify(sample, null, 2));

console.log(`\nSaved to: ${samplePath}`);

// Create detailed display for manual review
console.log(`\n\n${'#'.repeat(100)}`);
console.log(`SAMPLE RESPONSES FOR EXPERT EVALUATION`);
console.log('#'.repeat(100));

sample.forEach((resp, idx) => {
    console.log(`\n${'='.repeat(100)}`);
    console.log(`SAMPLE ${idx + 1}/${sample.length} - RESPONSE #${resp.responseNumber}`);
    console.log('='.repeat(100));
    console.log(`Model: ${resp.model}`);
    console.log(`Prompt ID: ${resp.promptId}`);
    console.log(`Persona: ${resp.persona}`);
    console.log(`Org Context: ${resp.orgContext.industry || 'N/A'} | ${resp.orgContext.size || 'N/A'} | Maturity: ${resp.orgContext.maturity || 'N/A'}`);
    console.log(`\nUser Question:`);
    console.log(resp.userQuestion);
    console.log(`\nLLM Response:`);
    console.log(resp.response);
    console.log(`\n${'-'.repeat(100)}`);

    // Quick flags
    const hasThinkTags = resp.response.includes('<think>') || resp.response.includes('</think>');
    const hasHallucination = resp.response.includes('[USER RESPONSE]') || resp.response.includes('[ASSISTANT RESPONSE]');
    const mentionsIndustry = resp.orgContext.industry &&
        resp.response.toLowerCase().includes(resp.orgContext.industry.toLowerCase());

    console.log(`Flags: Think Tags=${hasThinkTags ? 'YES ⚠️' : 'No'} | Hallucination=${hasHallucination ? 'YES ⚠️' : 'No'} | Uses Industry=${mentionsIndustry ? 'YES ✓' : 'No'}`);
    console.log('='.repeat(100));
});

console.log(`\n\n${'#'.repeat(100)}`);
console.log(`READY FOR EXPERT EVALUATION`);
console.log('#'.repeat(100));
console.log(`Review the ${sample.length} responses above`);
console.log(`Provide ratings (1-5) for readability, understandability, accuracy`);
console.log(`Assign overall rating (-1 to 5)`);
console.log(`Write 4-6 sentence detailed explanation for each`);
