// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/identify-best-worst-responses.js
// Description: Analyze all 150 responses to identify best 25 and worst 25 for deep expert review
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

console.log(`Analyzing ${allResponses.length} responses for quality indicators...\n`);

/**
 * Score each response based on objective quality indicators
 */
function scoreResponse(resp) {
    let score = 50; // Start at neutral
    const issues = [];
    const strengths = [];

    // CRITICAL FLAWS (major penalties)
    if (resp.response.includes('<think>') || resp.response.includes('</think>')) {
        score -= 20;
        issues.push('Exposed <think> tags');
    }

    if (resp.response.includes('[USER RESPONSE]') || resp.response.includes('[ASSISTANT RESPONSE]')) {
        score -= 25;
        issues.push('Hallucinated dialogue');
    }

    if (resp.response.includes('[ARIONCOMPLY AI]') && resp.response.includes('[USER RESPONSE]')) {
        score -= 30;
        issues.push('Severe hallucination - invented user dialogue');
    }

    // TRUNCATION (moderate penalty)
    const lastChars = resp.response.slice(-50).trim();
    if (lastChars.endsWith('```') === false &&
        (lastChars.length < 20 || !lastChars.match(/[.!?]$/))) {
        score -= 10;
        issues.push('Appears truncated or incomplete');
    }

    // ORGANIZATION CONTEXT USAGE (major strength)
    if (resp.orgContext.industry) {
        const industryLower = resp.orgContext.industry.toLowerCase();
        const responseLower = resp.response.toLowerCase();

        if (responseLower.includes(industryLower)) {
            score += 15;
            strengths.push('Uses industry context');
        } else {
            score -= 5;
            issues.push('Ignores industry context');
        }

        // Check for industry-specific terms
        const healthcareTerms = ['patient', 'medical', 'health data', 'clinical'];
        const financeTerms = ['financial data', 'payment', 'transaction', 'banking'];
        const educationTerms = ['student', 'educational', 'pupil', 'school'];
        const retailTerms = ['customer', 'purchase', 'consumer', 'shopping'];
        const techTerms = ['saas', 'api', 'cloud', 'software'];

        let relevantTerms = [];
        if (industryLower.includes('health')) relevantTerms = healthcareTerms;
        else if (industryLower.includes('financ')) relevantTerms = financeTerms;
        else if (industryLower.includes('educat')) relevantTerms = educationTerms;
        else if (industryLower.includes('retail')) relevantTerms = retailTerms;
        else if (industryLower.includes('tech')) relevantTerms = techTerms;

        const hasRelevantTerms = relevantTerms.some(term => responseLower.includes(term));
        if (hasRelevantTerms) {
            score += 10;
            strengths.push('Industry-specific terminology');
        }
    }

    // PERSONA APPROPRIATENESS
    const responseLength = resp.response.length;

    if (resp.persona === 'NOVICE') {
        if (responseLength > 1500) {
            score -= 5;
            issues.push('Too long for NOVICE');
        }
        if (resp.response.match(/Article \d+/g)?.length > 5) {
            score -= 5;
            issues.push('Too many article citations for NOVICE');
        } else {
            score += 5;
            strengths.push('Appropriate simplicity for NOVICE');
        }
    }

    if (resp.persona === 'EXECUTIVE') {
        if (responseLength < 300) {
            score -= 5;
            issues.push('Too brief for EXECUTIVE');
        }
        if (resp.response.toLowerCase().includes('strategic') ||
            resp.response.toLowerCase().includes('business')) {
            score += 5;
            strengths.push('Strategic language for EXECUTIVE');
        }
    }

    if (resp.persona === 'DEVELOPER') {
        if (!resp.response.toLowerCase().includes('implement') &&
            !resp.response.toLowerCase().includes('code') &&
            !resp.response.toLowerCase().includes('technical')) {
            score -= 5;
            issues.push('Lacks technical implementation detail for DEVELOPER');
        } else {
            score += 5;
            strengths.push('Technical detail appropriate for DEVELOPER');
        }
    }

    if (resp.persona === 'AUDITOR') {
        if (resp.response.toLowerCase().includes('evidence') ||
            resp.response.toLowerCase().includes('documentation')) {
            score += 5;
            strengths.push('Evidence focus appropriate for AUDITOR');
        }
    }

    // STRUCTURE AND FORMATTING
    const hasBullets = resp.response.includes('- ') || resp.response.includes('* ');
    const hasNumbers = resp.response.match(/^\d+\./gm);
    const hasHeadings = resp.response.match(/\*\*[^*]+\*\*/g);

    if (hasBullets || hasNumbers) {
        score += 5;
        strengths.push('Well-structured with lists');
    }

    if (hasHeadings && hasHeadings.length >= 2) {
        score += 5;
        strengths.push('Clear headings');
    }

    // GDPR/ISO ACCURACY (basic check)
    const mentionsGDPR = resp.response.toLowerCase().includes('gdpr');
    const mentionsISO = resp.response.toLowerCase().includes('iso');
    const hasArticleCitations = resp.response.match(/Article \d+/g);
    const hasControlCitations = resp.response.match(/A\.\d+/g);

    if (resp.promptId.includes('GDPR') && mentionsGDPR) {
        score += 5;
        strengths.push('Correctly references GDPR');
    }

    if (resp.promptId.includes('ISO27001') && mentionsISO) {
        score += 5;
        strengths.push('Correctly references ISO 27001');
    }

    if (hasArticleCitations || hasControlCitations) {
        score += 5;
        strengths.push('Cites specific articles/controls');
    }

    // LENGTH APPROPRIATENESS
    if (responseLength < 100) {
        score -= 15;
        issues.push('Response too short');
    } else if (responseLength < 200) {
        score -= 5;
        issues.push('Response quite brief');
    } else if (responseLength > 3000) {
        score -= 5;
        issues.push('Response very long');
    }

    return {
        score,
        issues,
        strengths,
        responseLength
    };
}

// Score all responses
const scoredResponses = allResponses.map(resp => {
    const scoring = scoreResponse(resp);
    return {
        ...resp,
        qualityScore: scoring.score,
        issues: scoring.issues,
        strengths: scoring.strengths,
        responseLength: scoring.responseLength
    };
});

// Sort by quality score
scoredResponses.sort((a, b) => b.qualityScore - a.qualityScore);

// Get best 25 and worst 25
const best25 = scoredResponses.slice(0, 25);
const worst25 = scoredResponses.slice(-25).reverse(); // Reverse so worst is first

console.log('='.repeat(80));
console.log('QUALITY ANALYSIS COMPLETE');
console.log('='.repeat(80));

// Statistics
const scores = scoredResponses.map(r => r.qualityScore);
const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
const maxScore = Math.max(...scores);
const minScore = Math.min(...scores);

console.log(`\nOverall Statistics:`);
console.log(`  Average Quality Score: ${avgScore.toFixed(1)}`);
console.log(`  Highest Score: ${maxScore}`);
console.log(`  Lowest Score: ${minScore}`);

// By model statistics (need to extract model from source file)
console.log(`\nDistribution of Issues:`);
const allIssues = scoredResponses.flatMap(r => r.issues);
const issueCounts = {};
allIssues.forEach(issue => {
    issueCounts[issue] = (issueCounts[issue] || 0) + 1;
});
Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).forEach(([issue, count]) => {
    console.log(`  ${issue}: ${count} responses`);
});

console.log(`\nDistribution of Strengths:`);
const allStrengths = scoredResponses.flatMap(r => r.strengths);
const strengthCounts = {};
allStrengths.forEach(strength => {
    strengthCounts[strength] = (strengthCounts[strength] || 0) + 1;
});
Object.entries(strengthCounts).sort((a, b) => b[1] - a[1]).forEach(([strength, count]) => {
    console.log(`  ${strength}: ${count} responses`);
});

// Save best and worst for expert review
fs.writeFileSync(
    path.join(__dirname, 'ratings/best-25-responses.json'),
    JSON.stringify(best25, null, 2)
);

fs.writeFileSync(
    path.join(__dirname, 'ratings/worst-25-responses.json'),
    JSON.stringify(worst25, null, 2)
);

fs.writeFileSync(
    path.join(__dirname, 'ratings/all-scored-responses.json'),
    JSON.stringify(scoredResponses, null, 2)
);

console.log(`\n${'='.repeat(80)}`);
console.log('BEST 25 RESPONSES');
console.log('='.repeat(80));
best25.forEach((resp, idx) => {
    console.log(`\n${idx + 1}. Response #${resp.responseNumber} - Score: ${resp.qualityScore}`);
    console.log(`   Model: ${resp.model || 'Unknown'} | Persona: ${resp.persona} | Industry: ${resp.orgContext.industry}`);
    console.log(`   Strengths: ${resp.strengths.join(', ') || 'None identified'}`);
    console.log(`   Issues: ${resp.issues.join(', ') || 'None identified'}`);
});

console.log(`\n\n${'='.repeat(80)}`);
console.log('WORST 25 RESPONSES');
console.log('='.repeat(80));
worst25.forEach((resp, idx) => {
    console.log(`\n${idx + 1}. Response #${resp.responseNumber} - Score: ${resp.qualityScore}`);
    console.log(`   Model: ${resp.model || 'Unknown'} | Persona: ${resp.persona} | Industry: ${resp.orgContext.industry}`);
    console.log(`   Issues: ${resp.issues.join(', ') || 'None identified'}`);
    console.log(`   Strengths: ${resp.strengths.join(', ') || 'None identified'}`);
});

console.log(`\n\n${'='.repeat(80)}`);
console.log('FILES SAVED');
console.log('='.repeat(80));
console.log(`Best 25: ratings/best-25-responses.json`);
console.log(`Worst 25: ratings/worst-25-responses.json`);
console.log(`All Scored: ratings/all-scored-responses.json`);
console.log(`\nReady for deep expert evaluation of best and worst performers.`);
