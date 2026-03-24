// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/output-complexity-analyzer.js
// Description: Analyze OUTPUT complexity - how hard is the expected answer to generate?
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-24

export class OutputComplexityAnalyzer {
  
  analyze(test) {
    const analysis = {
      // Response scope
      expectedResponseTokens: this.estimateResponseLength(test),
      responseType: this.determineResponseType(test),
      knowledgeDepth: this.determineKnowledgeDepth(test),
      
      // Processing requirements
      knowledgeType: test.knowledgeType || 'FACTUAL',
      requiresMultiSource: this.requiresMultiSource(test),
      requiresSynthesis: this.requiresSynthesis(test),
      requiresReasoning: this.requiresReasoning(test),
      
      // Structure requirements
      needsFormatting: this.needsFormatting(test),
      needsExamples: this.needsExamples(test),
      needsCitations: this.needsCitations(test),
      
      // Retrieval complexity
      retrievalStrategy: test.retrievalStrategy || 'vector_db',
      retrievalHops: this.estimateRetrievalHops(test),
      
      // Overall output complexity
      outputComplexityScore: 0,
      outputComplexityLevel: 'simple'
    };

    analysis.outputComplexityScore = this.calculateOutputComplexity(analysis);
    analysis.outputComplexityLevel = this.categorizeLevel(analysis.outputComplexityScore);

    return analysis;
  }

  estimateResponseLength(test) {
    // Base on knowledge type and question type
    if (test.knowledgeType === 'SYNTHESIS') return 400-800;
    if (test.knowledgeType === 'PROCEDURAL') return 300-600;
    if (test.knowledgeType === 'RELATIONAL') return 250-500;
    if (test.knowledgeType === 'EXACT_MATCH') return 100-200;
    
    // Factual - depends on persona
    if (test.persona === 'NOVICE') return 200-400;
    if (test.persona === 'PRACTITIONER') return 300-500;
    if (test.persona === 'EXECUTIVE') return 100-200;
    
    return 200-400; // default
  }

  determineResponseType(test) {
    const question = (test.question || test.userQuery || '').toLowerCase();
    
    if (question.includes('compare') || question.includes('difference')) {
      return 'comparison_table';
    }
    if (question.includes('list') || question.includes('what are')) {
      return 'structured_list';
    }
    if (question.includes('step') || question.includes('how to') || question.includes('process')) {
      return 'sequential_steps';
    }
    if (question.includes('explain') || question.includes('what is')) {
      return 'explanation';
    }
    if (question.match(/article\s+\d+|section\s+\d+|requirement\s+\d+/i)) {
      return 'citation_lookup';
    }
    
    return 'plain_text';
  }

  determineKnowledgeDepth(test) {
    if (test.persona === 'NOVICE') return 'introductory';
    if (test.persona === 'EXECUTIVE') return 'high_level';
    if (test.persona === 'PRACTITIONER') return 'detailed';
    if (test.persona === 'AUDITOR') return 'comprehensive';
    if (test.persona === 'DEVELOPER') return 'technical';
    return 'moderate';
  }

  requiresMultiSource(test) {
    // Does answering require pulling from multiple documents/sources?
    if (test.knowledgeType === 'SYNTHESIS') return true;
    if (test.knowledgeType === 'RELATIONAL') return true;
    
    const question = (test.question || test.userQuery || '').toLowerCase();
    if (question.includes('compare') || question.includes('map') || question.includes('cross')) {
      return true;
    }
    
    return false;
  }

  requiresSynthesis(test) {
    return test.knowledgeType === 'SYNTHESIS' || this.requiresMultiSource(test);
  }

  requiresReasoning(test) {
    const question = (test.question || test.userQuery || '').toLowerCase();
    
    const reasoningIndicators = [
      'why', 'how does', 'relationship', 'impact', 'affect',
      'should', 'recommend', 'best practice', 'appropriate'
    ];
    
    return reasoningIndicators.some(indicator => question.includes(indicator));
  }

  needsFormatting(test) {
    const responseType = this.determineResponseType(test);
    return ['comparison_table', 'structured_list', 'sequential_steps'].includes(responseType);
  }

  needsExamples(test) {
    if (test.persona === 'NOVICE') return true;
    if (test.persona === 'DEVELOPER') return true;
    if (test.knowledgeType === 'PROCEDURAL') return true;
    return false;
  }

  needsCitations(test) {
    if (test.persona === 'AUDITOR') return true;
    if (test.knowledgeType === 'EXACT_MATCH') return true;
    
    const question = (test.question || test.userQuery || '').toLowerCase();
    if (question.includes('exact') || question.includes('find') || question.includes('cite')) {
      return true;
    }
    
    return false;
  }

  estimateRetrievalHops(test) {
    // How many retrieval operations needed?
    if (test.knowledgeType === 'SYNTHESIS') return 3-5; // Multiple docs
    if (test.knowledgeType === 'RELATIONAL') return 2-3; // Follow relationships
    if (test.knowledgeType === 'PROCEDURAL') return 1-2; // Process docs
    return 1; // Single lookup
  }

  calculateOutputComplexity(analysis) {
    let score = 0;

    // Response length contribution (0-20 points)
    const avgExpectedTokens = typeof analysis.expectedResponseTokens === 'string' ?
      parseInt(analysis.expectedResponseTokens.split('-')[0]) : 300;
    
    if (avgExpectedTokens < 100) score += 5;
    else if (avgExpectedTokens < 200) score += 10;
    else if (avgExpectedTokens < 400) score += 15;
    else score += 20;

    // Response type contribution (0-20 points)
    const responseTypeScores = {
      'plain_text': 5,
      'citation_lookup': 8,
      'explanation': 10,
      'structured_list': 12,
      'sequential_steps': 15,
      'comparison_table': 20
    };
    score += responseTypeScores[analysis.responseType] || 10;

    // Knowledge type contribution (0-30 points)
    const knowledgeTypeScores = {
      'FACTUAL': 5,
      'EXACT_MATCH': 8,
      'PROCEDURAL': 15,
      'RELATIONAL': 20,
      'SYNTHESIS': 30
    };
    score += knowledgeTypeScores[analysis.knowledgeType] || 10;

    // Processing requirements (0-20 points)
    if (analysis.requiresMultiSource) score += 10;
    if (analysis.requiresSynthesis) score += 5;
    if (analysis.requiresReasoning) score += 5;

    // Formatting requirements (0-10 points)
    if (analysis.needsFormatting) score += 4;
    if (analysis.needsExamples) score += 3;
    if (analysis.needsCitations) score += 3;

    return Math.min(score, 100);
  }

  categorizeLevel(score) {
    if (score < 25) return 'simple';
    if (score < 50) return 'moderate';
    if (score < 75) return 'complex';
    return 'very_complex';
  }
}
