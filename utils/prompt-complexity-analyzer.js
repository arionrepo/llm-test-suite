// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/prompt-complexity-analyzer.js
// Description: Analyze prompt complexity for performance correlation - token count, structure, technical density
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-24

const TECHNICAL_TERMS = [
  'gdpr', 'ccpa', 'cpra', 'hipaa', 'iso', 'soc', 'nist', 'pci', 'dss', 'fedramp',
  'compliance', 'audit', 'assessment', 'framework', 'control', 'requirement',
  'regulation', 'standard', 'certification', 'attestation', 'evidence',
  'policy', 'procedure', 'risk', 'vulnerability', 'threat', 'safeguard',
  'encryption', 'authentication', 'authorization', 'access control',
  'data subject', 'personal data', 'pii', 'phi', 'sensitive data',
  'processor', 'controller', 'data protection', 'privacy',
  'ai act', 'high-risk ai', 'fundamental rights', 'conformity assessment',
  'cloud security', 'shared responsibility', 'csa', 'ccm'
];

export class PromptComplexityAnalyzer {
  
  analyzePrompt(promptText) {
    const analysis = {
      characterCount: promptText.length,
      wordCount: this.countWords(promptText),
      estimatedTokens: this.estimateTokens(promptText),
      sentenceCount: this.countSentences(promptText),
      questionCount: this.countQuestions(promptText),
      technicalTermCount: this.countTechnicalTerms(promptText),
      technicalDensity: 0,
      isMultiPart: this.isMultiPartQuestion(promptText),
      hasListRequest: this.hasListRequest(promptText),
      hasComparisonRequest: this.hasComparisonRequest(promptText),
      complexityScore: 0,
      complexityLevel: 'simple',
      performanceClass: 'fast'
    };

    analysis.technicalDensity = analysis.wordCount > 0 ? 
      (analysis.technicalTermCount / analysis.wordCount) * 100 : 0;

    analysis.complexityScore = this.calculateComplexityScore(analysis);
    
    if (analysis.complexityScore < 30) {
      analysis.complexityLevel = 'simple';
      analysis.performanceClass = 'fast';
    } else if (analysis.complexityScore < 50) {
      analysis.complexityLevel = 'moderate';
      analysis.performanceClass = 'medium';
    } else if (analysis.complexityScore < 70) {
      analysis.complexityLevel = 'complex';
      analysis.performanceClass = 'slow';
    } else {
      analysis.complexityLevel = 'very_complex';
      analysis.performanceClass = 'very_slow';
    }

    return analysis;
  }

  countWords(text) {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  countSentences(text) {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  }

  countQuestions(text) {
    return (text.match(/\?/g) || []).length;
  }

  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  countTechnicalTerms(text) {
    const lowerText = text.toLowerCase();
    let count = 0;
    
    TECHNICAL_TERMS.forEach(term => {
      const regex = new RegExp('\\b' + term.replace(/\s+/g, '\\s+') + '\\b', 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        count += matches.length;
      }
    });
    
    return count;
  }

  isMultiPartQuestion(text) {
    const multiPartIndicators = [
      ' and ',
      ' or ',
      'also',
      'additionally',
      'furthermore'
    ];
    
    const lowerText = text.toLowerCase();
    return multiPartIndicators.some(indicator => lowerText.includes(indicator));
  }

  hasListRequest(text) {
    const listIndicators = [
      'list',
      'what are',
      'which are',
      'enumerate',
      'steps',
      'requirements'
    ];
    
    const lowerText = text.toLowerCase();
    return listIndicators.some(indicator => lowerText.includes(indicator));
  }

  hasComparisonRequest(text) {
    const comparisonIndicators = [
      'compare',
      'difference',
      'versus',
      'vs',
      'contrast'
    ];
    
    const lowerText = text.toLowerCase();
    return comparisonIndicators.some(indicator => lowerText.includes(indicator));
  }

  calculateComplexityScore(analysis) {
    let score = 0;

    if (analysis.estimatedTokens < 10) score += 5;
    else if (analysis.estimatedTokens < 20) score += 10;
    else if (analysis.estimatedTokens < 40) score += 15;
    else score += 25;

    score += Math.min(analysis.sentenceCount * 5, 15);
    score += Math.min(analysis.technicalDensity * 4, 20);

    if (analysis.hasComparisonRequest) score += 20;
    if (analysis.hasListRequest) score += 10;
    if (analysis.isMultiPart) score += 10;
    if (analysis.questionCount > 1) score += 10;

    return Math.min(score, 100);
  }

  analyzeTestSet(tests) {
    const complexityStats = {
      total: tests.length,
      byLevel: { simple: 0, moderate: 0, complex: 0, very_complex: 0 },
      avgComplexity: 0,
      avgTokens: 0,
      avgTechnicalDensity: 0,
      complexities: []
    };

    tests.forEach(test => {
      const question = test.question || test.userQuery || test.prompt || '';
      const complexity = this.analyzePrompt(question);
      
      complexityStats.byLevel[complexity.complexityLevel]++;
      complexityStats.complexities.push(complexity.complexityScore);
      complexityStats.avgTokens += complexity.estimatedTokens;
      complexityStats.avgTechnicalDensity += complexity.technicalDensity;
    });

    if (tests.length > 0) {
      complexityStats.avgComplexity = 
        complexityStats.complexities.reduce((a, b) => a + b, 0) / tests.length;
      complexityStats.avgTokens = complexityStats.avgTokens / tests.length;
      complexityStats.avgTechnicalDensity = complexityStats.avgTechnicalDensity / tests.length;
    }

    return complexityStats;
  }
}
