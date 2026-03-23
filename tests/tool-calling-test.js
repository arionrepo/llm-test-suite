// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/tests/tool-calling-test.js
// Description: Function calling tests - simple functions, parameter accuracy, multi-tool selection, error handling
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-03-23

import { LLMClient } from '../utils/llm-client.js';
import { config } from '../config.js';
import { printTestHeader, printTestResult, saveReport } from '../utils/test-helpers.js';

// Define test tools
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get the current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA',
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: 'The temperature unit',
          },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Perform a mathematical calculation',
      parameters: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: ['add', 'subtract', 'multiply', 'divide'],
            description: 'The mathematical operation to perform',
          },
          a: {
            type: 'number',
            description: 'First number',
          },
          b: {
            type: 'number',
            description: 'Second number',
          },
        },
        required: ['operation', 'a', 'b'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_database',
      description: 'Search a database for records',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query',
          },
          filters: {
            type: 'object',
            description: 'Optional filters for the search',
          },
        },
        required: ['query'],
      },
    },
  },
];

async function runToolCallingTests() {
  printTestHeader('TOOL/FUNCTION CALLING TESTS');
  
  const client = new LLMClient();
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
  };
  
  // Test 1: Simple Function Call
  console.log('🔧 Test 1: Simple Function Call');
  console.log('  Prompt: "What is the weather in San Francisco?"');
  
  const test1 = await client.chatCompletion([
    { role: 'user', content: 'What is the weather in San Francisco?' }
  ], { 
    tools: [tools[0]], 
    tool_choice: 'auto',
    max_tokens: 150,
  });
  
  if (test1.success) {
    const toolCalls = test1.fullResponse.choices[0].message.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      const call = toolCalls[0];
      console.log('  Function called: ' + call.function.name);
      console.log('  Arguments: ' + call.function.arguments);
      
      try {
        const args = JSON.parse(call.function.arguments);
        const passed = call.function.name === 'get_weather' && 
                      args.location && 
                      args.location.toLowerCase().includes('san francisco');
        printTestResult('Simple function call', passed);
        
        results.tests.push({
          name: 'simple_function_call',
          passed,
          functionName: call.function.name,
          arguments: args,
        });
      } catch (e) {
        printTestResult('Simple function call', false, 'Invalid JSON arguments');
        results.tests.push({
          name: 'simple_function_call',
          passed: false,
          error: 'Invalid JSON',
        });
      }
    } else {
      console.log('  Response: ' + test1.response);
      console.log('  ⚠️  No tool call made - model may not support function calling');
      printTestResult('Simple function call', false, 'No tool call made');
      
      results.tests.push({
        name: 'simple_function_call',
        passed: false,
        error: 'No tool call made',
        response: test1.response,
      });
    }
  }
  
  // Test 2: Function Selection from Multiple Tools
  console.log('\n🔧 Test 2: Correct Function Selection');
  console.log('  Prompt: "Calculate 15 times 8"');
  
  const test2 = await client.chatCompletion([
    { role: 'user', content: 'Calculate 15 times 8' }
  ], { 
    tools: tools, 
    tool_choice: 'auto',
    max_tokens: 150,
  });
  
  if (test2.success) {
    const toolCalls = test2.fullResponse.choices[0].message.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      const call = toolCalls[0];
      console.log('  Function called: ' + call.function.name);
      console.log('  Arguments: ' + call.function.arguments);
      
      try {
        const args = JSON.parse(call.function.arguments);
        const passed = call.function.name === 'calculate' && 
                      args.operation === 'multiply' &&
                      args.a === 15 && args.b === 8;
        printTestResult('Correct function selection', passed);
        
        results.tests.push({
          name: 'function_selection',
          passed,
          functionName: call.function.name,
          arguments: args,
        });
      } catch (e) {
        printTestResult('Correct function selection', false, 'Invalid JSON');
        results.tests.push({
          name: 'function_selection',
          passed: false,
          error: 'Invalid JSON',
        });
      }
    } else {
      console.log('  Response: ' + test2.response);
      printTestResult('Correct function selection', false, 'No tool call made');
      
      results.tests.push({
        name: 'function_selection',
        passed: false,
        error: 'No tool call made',
      });
    }
  }
  
  // Test 3: Parameter Accuracy
  console.log('\n🔧 Test 3: Parameter Accuracy');
  console.log('  Prompt: "Get weather in Tokyo in celsius"');
  
  const test3 = await client.chatCompletion([
    { role: 'user', content: 'Get the weather in Tokyo in celsius' }
  ], { 
    tools: [tools[0]], 
    tool_choice: 'auto',
    max_tokens: 150,
  });
  
  if (test3.success) {
    const toolCalls = test3.fullResponse.choices[0].message.tool_calls;
    if (toolCalls && toolCalls.length > 0) {
      const call = toolCalls[0];
      console.log('  Function called: ' + call.function.name);
      console.log('  Arguments: ' + call.function.arguments);
      
      try {
        const args = JSON.parse(call.function.arguments);
        const passed = args.location && 
                      args.location.toLowerCase().includes('tokyo') &&
                      args.unit === 'celsius';
        printTestResult('Parameter accuracy', passed);
        
        results.tests.push({
          name: 'parameter_accuracy',
          passed,
          arguments: args,
        });
      } catch (e) {
        printTestResult('Parameter accuracy', false, 'Invalid JSON');
        results.tests.push({
          name: 'parameter_accuracy',
          passed: false,
          error: 'Invalid JSON',
        });
      }
    } else {
      printTestResult('Parameter accuracy', false, 'No tool call made');
      results.tests.push({
        name: 'parameter_accuracy',
        passed: false,
        error: 'No tool call made',
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  const passedCount = results.tests.filter(t => t.passed).length;
  const totalTests = results.tests.length;
  console.log('TOOL CALLING TESTS COMPLETE: ' + passedCount + '/' + totalTests + ' passed');
  
  if (results.tests.some(t => !t.passed && t.error === 'No tool call made')) {
    console.log('\n⚠️  Note: This model may not support function calling,');
    console.log('   or llama-server may not be configured for it.');
  }
  
  console.log('='.repeat(60));
  
  saveReport('tool-calling', results);
  return results;
}

// Run if executed directly
if (import.meta.url === 'file://' + process.argv[1]) {
  runToolCallingTests().catch(console.error);
}

export { runToolCallingTests };
