// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/utils/cloud-llm-judge.js
// Description: Cloud LLM judge client - evaluates test results using Claude, GPT-4, or ensemble
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-24

export class CloudLLMJudge {
  constructor(config) {
    this.config = {
      anthropicApiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
      openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
      defaultJudge: config.defaultJudge || 'claude',
      ensembleMode: config.ensembleMode || false,
      judgeModel: config.judgeModel || {
        claude: 'claude-sonnet-4-20250514',
        openai: 'gpt-4-turbo-2024-04-09'
      }
    };
  }

  async evaluateTestResult(testResult, evaluationCriteria) {
    if (this.config.ensembleMode) {
      return await this.ensembleEvaluate(testResult, evaluationCriteria);
    }
    
    const judge = this.config.defaultJudge;
    return await this.singleJudgeEvaluate(testResult, evaluationCriteria, judge);
  }

  async singleJudgeEvaluate(testResult, criteria, judge) {
    const prompt = this.buildEvaluationPrompt(testResult, criteria);
    
    if (judge === 'claude') {
      return await this.evaluateWithClaude(prompt, testResult);
    } else if (judge === 'openai') {
      return await this.evaluateWithOpenAI(prompt, testResult);
    }
    
    throw new Error('Unknown judge: ' + judge);
  }

  async ensembleEvaluate(testResult, criteria) {
    const prompt = this.buildEvaluationPrompt(testResult, criteria);
    
    const [claudeResult, openaiResult] = await Promise.all([
      this.evaluateWithClaude(prompt, testResult).catch(e => ({ error: e.message })),
      this.evaluateWithOpenAI(prompt, testResult).catch(e => ({ error: e.message }))
    ]);

    // Aggregate results
    return this.aggregateJudgments([
      { judge: 'claude', result: claudeResult },
      { judge: 'openai', result: openaiResult }
    ]);
  }

  buildEvaluationPrompt(testResult, criteria) {
    return `You are an expert evaluator assessing the quality of an LLM's response to a compliance question.

**Original Question:**
${testResult.question || testResult.userQuery}

**Test Context:**
- Standard: ${testResult.standard || 'N/A'}
- Knowledge Type: ${testResult.knowledgeType || 'N/A'}
- User Persona: ${testResult.persona || 'N/A'}
- Expected Retrieval Strategy: ${testResult.retrievalStrategy || 'N/A'}

**LLM Response to Evaluate:**
${testResult.response}

**Evaluation Criteria:**

1. **Topic Coverage** - Are these expected topics present?
   Expected: ${(testResult.expectedTopics || []).join(', ')}

2. **Response Quality** - Assess:
   - Accuracy: Is the information factually correct?
   - Completeness: Does it fully answer the question?
   - Appropriateness: Is it suitable for the ${testResult.persona || 'user'} persona?

3. **Workflow Accuracy** (if applicable):
   ${testResult.expectedSteps ? '- Expected Steps: ' + testResult.expectedSteps.join(', ') : 'N/A'}
   ${testResult.expectedScreens ? '- Expected Screens: ' + testResult.expectedScreens.join(', ') : ''}
   ${testResult.expectedButtons ? '- Expected Buttons: ' + testResult.expectedButtons.join(', ') : ''}

4. **Hallucination Detection** - Check for:
   - Fabricated facts or statistics
   - Incorrect citations or article numbers
   - Made-up requirements not in the actual standard

**Provide your evaluation in this JSON format:**
\`\`\`json
{
  "overallPass": true/false,
  "confidence": 0-100,
  "scores": {
    "topicCoverage": 0-100,
    "accuracy": 0-100,
    "completeness": 0-100,
    "appropriateness": 0-100,
    "workflowAccuracy": 0-100
  },
  "topicsFound": ["topic1", "topic2"],
  "topicsMissing": ["topic3"],
  "hallucinationsDetected": [],
  "qualitativeAnalysis": {
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1"],
    "gaps": ["gap1"]
  },
  "reasoning": "Detailed explanation of your judgment",
  "recommendation": "Pass / Fail / Review"
}
\`\`\`

Be thorough but fair. Focus on substance over style.`;
  }

  async evaluateWithClaude(prompt, testResult) {
    if (!this.config.anthropicApiKey) {
      return { error: 'No Anthropic API key configured' };
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.judgeModel.claude,
          max_tokens: 2000,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('Claude API error: ' + response.status);
      }

      const data = await response.json();
      const content = data.content[0].text;
      
      // Extract JSON from response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      const evaluation = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(content);

      return {
        judge: 'claude',
        model: this.config.judgeModel.claude,
        evaluation,
        rawResponse: content
      };

    } catch (error) {
      return {
        judge: 'claude',
        error: error.message
      };
    }
  }

  async evaluateWithOpenAI(prompt, testResult) {
    if (!this.config.openaiApiKey) {
      return { error: 'No OpenAI API key configured' };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.config.openaiApiKey
        },
        body: JSON.stringify({
          model: this.config.judgeModel.openai,
          messages: [
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API error: ' + response.status);
      }

      const data = await response.json();
      const evaluation = JSON.parse(data.choices[0].message.content);

      return {
        judge: 'openai',
        model: this.config.judgeModel.openai,
        evaluation,
        rawResponse: data.choices[0].message.content
      };

    } catch (error) {
      return {
        judge: 'openai',
        error: error.message
      };
    }
  }

  aggregateJudgments(judgments) {
    const valid = judgments.filter(j => !j.result.error);
    
    if (valid.length === 0) {
      return {
        aggregated: true,
        error: 'All judges failed',
        judgments
      };
    }

    // Average scores
    const aggregated = {
      aggregated: true,
      judgeCount: valid.length,
      agreement: this.calculateAgreement(valid),
      scores: {},
      overallPass: false,
      confidence: 0,
      judgments
    };

    // Average all scores
    const scoreKeys = ['topicCoverage', 'accuracy', 'completeness', 'appropriateness', 'workflowAccuracy'];
    scoreKeys.forEach(key => {
      const scores = valid
        .map(j => j.result.evaluation?.scores?.[key])
        .filter(s => s !== undefined);
      
      if (scores.length > 0) {
        aggregated.scores[key] = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    });

    // Aggregate pass/fail
    const passCount = valid.filter(j => j.result.evaluation?.overallPass).length;
    aggregated.overallPass = passCount >= (valid.length / 2); // Majority vote

    // Average confidence
    const confidences = valid.map(j => j.result.evaluation?.confidence || 50);
    aggregated.confidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

    // Aggregate qualitative analysis
    aggregated.qualitativeAnalysis = {
      strengths: this.mergeArrays(valid.map(j => j.result.evaluation?.qualitativeAnalysis?.strengths || [])),
      weaknesses: this.mergeArrays(valid.map(j => j.result.evaluation?.qualitativeAnalysis?.weaknesses || [])),
      gaps: this.mergeArrays(valid.map(j => j.result.evaluation?.qualitativeAnalysis?.gaps || []))
    };

    return aggregated;
  }

  calculateAgreement(judgments) {
    // Check if judges agree on pass/fail
    const decisions = judgments.map(j => j.result.evaluation?.overallPass);
    const uniqueDecisions = new Set(decisions);
    
    if (uniqueDecisions.size === 1) {
      return 'full_agreement';
    } else {
      return 'disagreement';
    }
  }

  mergeArrays(arrays) {
    const merged = new Set();
    arrays.forEach(arr => {
      arr.forEach(item => merged.add(item));
    });
    return Array.from(merged);
  }
}

export function createJudge(config) {
  return new CloudLLMJudge(config);
}
