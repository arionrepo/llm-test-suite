// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/input-complexity-analyzer.js
// Description: Analyze INPUT complexity - how hard is the question to parse and understand?
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

export class InputComplexityAnalyzer {
  
  analyze(questionText) {
    const analysis = {
      // Lexical metrics
      characterCount: questionText.length,
      wordCount: this.countWords(questionText),
      estimatedTokens: this.estimateTokens(questionText),
      avgWordLength: this.calculateAvgWordLength(questionText),
      
      // Structural metrics
      sentenceCount: this.countSentences(questionText),
      questionCount: this.countQuestions(questionText),
      clauseCount: this.countClauses(questionText),
      
      // Technical sophistication
      technicalTermCount: this.countTechnicalTerms(questionText),
      technicalDensity: 0, // calculated below
      
      // Structural patterns
      isMultiPart: this.isMultiPartQuestion(questionText),
      hasConditional: this.hasConditional(questionText),
      hasNegation: this.hasNegation(questionText),
      
      // Specificity
      hasCitation: this.hasCitation(questionText),
      hasContext: this.hasContextRequirement(questionText),
      specificityLevel: 'general', // calculated below
      
      // Overall input complexity
      inputComplexityScore: 0,
      inputComplexityLevel: 'simple'
    };

    // Calculate derived metrics
    analysis.technicalDensity = analysis.wordCount > 0 ? 
      (analysis.technicalTermCount / analysis.wordCount) * 100 : 0;
    
    analysis.specificityLevel = this.determineSpecificity(questionText, analysis);
    analysis.inputComplexityScore = this.calculateInputComplexity(analysis);
    analysis.inputComplexityLevel = this.categorizeLevel(analysis.inputComplexityScore);

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

  countClauses(text) {
    // Count clauses separated by commas, semicolons, or conjunctions
    const separators = text.match(/[,;]|\\band\\b|\\bor\\b|\\bbut\\b/gi) || [];
    return separators.length + 1;
  }

  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  calculateAvgWordLength(text) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 0;
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return totalLength / words.length;
  }

  countTechnicalTerms(text) {
    const lowerText = text.toLowerCase();
    let count = 0;
    
    TECHNICAL_TERMS.forEach(term => {
      const regex = new RegExp('\\\\b' + term.replace(/\s+/g, '\\\\s+') + '\\\\b', 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        count += matches.length;
      }
    });
    
    return count;
  }

  isMultiPartQuestion(text) {
    const patterns = [' and ', ' or ', 'also', 'additionally', 'furthermore', 'moreover'];
    const lowerText = text.toLowerCase();
    return patterns.some(p => lowerText.includes(p));
  }

  hasConditional(text) {
    const conditionals = ['if ', 'when ', 'unless ', 'provided that', 'assuming'];
    const lowerText = text.toLowerCase();
    return conditionals.some(c => lowerText.includes(c));
  }

  hasNegation(text) {
    const negations = [' not ', ' no ', "n't ", 'without', 'except'];
    const lowerText = text.toLowerCase();
    return negations.some(n => lowerText.includes(n));
  }

  hasCitation(text) {
    // Check for specific citations like "Article 17", "A.8.2", "CC6.1", "requirement 3.4"
    const citationPatterns = [
      /article\s+\d+/i,
      /section\s+\d+/i,
      /a\.\d+/i,
      /cc\d+\.\d+/i,
      /requirement\s+\d+/i,
      /clause\s+\d+/i
    ];
    
    return citationPatterns.some(pattern => pattern.test(text));
  }

  hasContextRequirement(text) {
    const contextIndicators = ['our', 'we', 'my', 'in our organization', 'for us'];
    const lowerText = text.toLowerCase();
    return contextIndicators.some(c => lowerText.includes(c));
  }

  determineSpecificity(text, analysis) {
    if (analysis.hasCitation) return 'precise';
    if (analysis.technicalDensity > 40) return 'specific';
    if (analysis.technicalDensity > 20) return 'moderate';
    return 'general';
  }

  calculateInputComplexity(analysis) {
    let score = 0;

    // Lexical contribution (0-20 points)
    if (analysis.estimatedTokens < 5) score += 3;
    else if (analysis.estimatedTokens < 10) score += 6;
    else if (analysis.estimatedTokens < 20) score += 10;
    else if (analysis.estimatedTokens < 40) score += 15;
    else score += 20;

    // Average word length (0-10 points)
    if (analysis.avgWordLength > 7) score += 10;
    else if (analysis.avgWordLength > 5) score += 5;

    // Structural contribution (0-20 points)
    score += Math.min(analysis.sentenceCount * 3, 10);
    score += Math.min(analysis.clauseCount * 2, 10);

    // Technical sophistication (0-25 points)
    score += Math.min(analysis.technicalDensity * 5, 25);

    // Pattern complexity (0-25 points)
    if (analysis.isMultiPart) score += 8;
    if (analysis.hasConditional) score += 7;
    if (analysis.hasNegation) score += 5;
    if (analysis.questionCount > 1) score += 5;

    // Specificity bonus (0-10 points)
    if (analysis.specificityLevel === 'precise') score += 10;
    else if (analysis.specificityLevel === 'specific') score += 7;
    else if (analysis.specificityLevel === 'moderate') score += 4;

    return Math.min(score, 100);
  }

  categorizeLevel(score) {
    if (score < 25) return 'simple';
    if (score < 50) return 'moderate';
    if (score < 75) return 'complex';
    return 'very_complex';
  }
}
