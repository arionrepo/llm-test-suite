# Deterministic Test Execution - Fix Plan

**Problem:** Models not properly isolated during sequential testing

## Root Cause Analysis

### What Went Wrong:

1. **Insufficient stop verification**
   - Code called `llamacpp-manager stop` 
   - Waited only 2 seconds
   - Assumed it worked
   - Started next model while previous still shutting down

2. **Timeout too short for large models**
   - 60 seconds insufficient for 17B/24B models
   - Need 2-3 minutes for large models

3. **No memory cleanup time**
   - Even when model stops, memory/cache lingers
   - Starting next model immediately causes contention

4. **No verification of clean state**
   - Never checked process list before starting next
   - Never verified port released
   - Never checked memory availability

## Solution: Deterministic Sequential Execution

### Step 1: Proper Stop Verification

```javascript
async stopModelProperly(modelName) {
  // 1. Issue stop command
  await execAsync('llamacpp-manager stop ' + modelName);
  
  // 2. VERIFY via status (poll until stopped)
  for (let i = 0; i < 15; i++) { // 30 seconds max
    await sleep(2000);
    const status = await this.getStatus();
    if (!status[modelName]?.running) {
      console.log('✅ Model stopped via status');
      break;
    }
  }
  
  // 3. VERIFY via process list (belt and suspenders)
  const port = this.models[modelName].port;
  for (let i = 0; i < 10; i++) { // 20 seconds max
    await sleep(2000);
    const portCheck = await execAsync('lsof -i :' + port);
    if (portCheck.stdout.trim() === '') {
      console.log('✅ Port released');
      break;
    }
  }
  
  // 4. Wait for memory cleanup
  console.log('Waiting for memory cleanup...');
  await sleep(10000); // 10 seconds for cache/swap to settle
  
  return true;
}
```

### Step 2: Proper Start Verification

```javascript
async startModelProperly(modelName) {
  const size = parseInt(this.models[modelName].size);
  const timeout = size >= 17 ? 180000 : // 3 min for 17B+
                 size >= 10 ? 120000 : // 2 min for 10-16B
                 90000; // 90 sec for smaller

  // 1. Issue start command
  await execAsync('llamacpp-manager start ' + modelName);
  
  // 2. Wait for status to show running
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    await sleep(3000);
    const status = await this.getStatus();
    
    if (status[modelName]?.running) {
      // 3. VERIFY health endpoint responds
      const port = this.models[modelName].port;
      try {
        const health = await fetch(`http://127.0.0.1:${port}/health`);
        const data = await health.json();
        
        if (data.status === 'ok') {
          console.log('✅ Model ready and healthy');
          
          // 4. Test with actual query to be sure
          const test = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 5
            })
          });
          
          if (test.ok) {
            console.log('✅ Model actually responding to queries');
            return true;
          }
        }
      } catch (e) {
        // Still loading
      }
    }
  }
  
  throw new Error('Model failed to become ready');
}
```

### Step 3: Between-Model Safety Checks

```javascript
async runModelsSequentially(models, tests) {
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const prevModel = i > 0 ? models[i-1] : null;
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Model ${i+1}/${models.length}: ${model}`);
    console.log('='.repeat(70));
    
    // SAFETY CHECK 1: Ensure no models running
    const allStatus = await this.getStatus();
    const runningModels = Object.entries(allStatus)
      .filter(([name, status]) => status.running)
      .map(([name]) => name);
    
    if (runningModels.length > 0) {
      console.log(`⚠️ WARNING: Found ${runningModels.length} models still running!`);
      console.log('   Stopping all: ' + runningModels.join(', '));
      
      for (const m of runningModels) {
        await this.stopModelProperly(m);
      }
    }
    
    // SAFETY CHECK 2: Verify memory availability
    // (Could check available RAM here if needed)
    
    // Start this model
    console.log(`Starting ${model}...`);
    await this.startModelProperly(model);
    
    // Run tests
    const results = await this.runTests(model, tests);
    
    // Stop this model  
    console.log(`\nStopping ${model}...`);
    await this.stopModelProperly(model);
    
    // SAFETY CHECK 3: Verify clean state before next
    console.log('Verifying clean state...');
    const postStatus = await this.getStatus();
    const stillRunning = Object.entries(postStatus)
      .filter(([name, s]) => s.running);
    
    if (stillRunning.length > 0) {
      throw new Error('CRITICAL: Models still running after stop!');
    }
    
    console.log('✅ Clean state verified. Ready for next model.\n');
  }
}
```

## Implementation Priority

1. ✅ Fix stopModel to verify via status + port check
2. ✅ Add 10-second memory cleanup wait
3. ✅ Increase start timeout (90s small, 120s medium, 180s large)
4. ✅ Add between-model safety checks
5. ✅ Test with 2 models to verify proper isolation
6. ⏳ Re-run comprehensive test properly

## Verification Test Plan

Before running comprehensive:
1. Run pilot with 2 models
2. Manually verify only 1 process at a time via: `watch -n 2 'ps aux | grep llama-server | grep -v grep'`
3. Monitor RAM usage via: `watch -n 2 'top -l 1 | grep PhysMem'`
4. Confirm each model fully stops before next starts
5. Only then run comprehensive

