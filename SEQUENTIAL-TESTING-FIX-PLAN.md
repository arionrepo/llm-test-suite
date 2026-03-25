# Sequential Testing Fix Plan

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/llm-test-suite/SEQUENTIAL-TESTING-FIX-PLAN.md
**Description:** Detailed plan for fixing sequential model testing to ensure only one model runs at a time
**Author:** Libor Ballaty <libor@arionetworks.com>
**Created:** 2026-03-25

---

## Problem Statement

**Previous comprehensive test (2026-03-24) was INVALID due to:**
- Multiple models running simultaneously
- RAM maxed out (full memory + swap)
- Resource contention between models
- Degraded performance for all models
- Results cannot be trusted

**User requirement:** Models must run ONE AT A TIME with proper isolation

---

## Root Cause Analysis

### Investigation Findings

**1. llamacpp-manager stop DOES work properly:**
- Source: `llamaCPPManager/src/llamacpp_manager/process.py:120`
- Sends SIGTERM, waits 5s, then SIGKILL if needed
- When called manually from UI, models stop and stay stopped
- **The tool itself is reliable**

**2. My code didn't verify stop completion:**
```javascript
// Current implementation (WRONG):
async stopModel(modelName) {
    await execAsync('llamacpp-manager stop ' + modelName);
    await sleep(2000);  // Just wait 2s
    return true;        // Assume success - NEVER VERIFY!
}
```

**What actually happened:**
```
Time 0s:   Stop phi3 command sent
Time 0-5s: phi3 shutting down (SIGTERM/SIGKILL)
Time 2s:   My code returns "success" (phi3 still shutting down!)
Time 2.5s: Start smollm3 command sent
Time 5s:   phi3 process finally dies
Time 8s:   smollm3 finishes loading

Result: Both models were in memory from 2.5s-5s (overlap!)
```

**Multiply by 10 models:** All accumulated in memory

**3. Gap between models was too short:**
- Log shows only 6 lines (~0.5s) between "Stopping" and "Starting"
- No time for memory cleanup
- Cached model weights remained in RAM

**4. No verification that model actually responds:**
- Checked health endpoint
- Never sent test query to verify functional
- Model might report "ok" but not actually work

---

## The Fix - Verification-Based Approach

### Principle: Test, Don't Trust

**Don't rely on:**
- ❌ Status output (can be stale)
- ❌ Return codes (can be misleading)
- ❌ Arbitrary timeouts (not proof)

**Do rely on:**
- ✅ Actual endpoint tests (try to connect - should fail when stopped)
- ✅ Actual query tests (send message - should succeed when started)
- ✅ Multiple verification layers
- ✅ Hard failures if verification fails

---

## Implementation Plan

### Fix 1: Stop Verification (5 verification layers)

```javascript
async stopModelWithVerification(modelName) {
    const port = this.models[modelName].port;

    console.log(`\n🛑 Stopping ${modelName}...`);

    // LAYER 1: Issue stop command
    await execAsync(`llamacpp-manager stop ${modelName}`);
    console.log('   Command sent');

    // LAYER 2: Verify endpoint becomes unreachable
    console.log('   Verifying endpoint shutdown...');
    let endpointDown = false;
    for (let i = 0; i < 15; i++) {  // 30 seconds max
        try {
            await fetch(`http://127.0.0.1:${port}/health`, {
                signal: AbortSignal.timeout(1000)
            });
            // Still responding!
            console.log(`   Attempt ${i+1}/15: Still responding, waiting...`);
            await sleep(2000);
        } catch (error) {
            // Connection refused = DOWN
            console.log(`   Attempt ${i+1}/15: Connection refused ✓`);
            endpointDown = true;
            break;
        }
    }

    if (!endpointDown) {
        throw new Error(`CRITICAL: ${modelName} still responding after 30s!`);
    }

    // LAYER 3: Verify port not listening
    console.log('   Verifying port released...');
    await sleep(2000);
    const portCheck = await execAsync(`lsof -i :${port}`).catch(() => ({stdout: ''}));

    if (portCheck.stdout.includes('LISTEN')) {
        throw new Error(`CRITICAL: Port ${port} still listening!`);
    }
    console.log('   Port released ✓');

    // LAYER 4: Verify status shows stopped
    console.log('   Verifying status...');
    const status = await this.getStatus();
    if (status && status[modelName] && status[modelName].running) {
        throw new Error(`CRITICAL: Status still shows ${modelName} running!`);
    }
    console.log('   Status confirmed stopped ✓');

    // LAYER 5: Memory cleanup wait
    console.log('   Waiting for memory cleanup (10s)...');
    await sleep(10000);

    // FINAL VERIFICATION: Endpoint still down
    try {
        await fetch(`http://127.0.0.1:${port}/health`, {
            signal: AbortSignal.timeout(1000)
        });
        throw new Error(`CRITICAL: ${modelName} came back up during cleanup!`);
    } catch (error) {
        if (error.message.includes('CRITICAL')) throw error;
        // Connection refused = good
    }

    console.log(`✅ ${modelName} VERIFIED STOPPED\n`);
    return true;
}
```

**Time to stop: ~15-20 seconds (with full verification)**

---

### Fix 2: Start Verification (4 verification layers)

```javascript
async startModelWithVerification(modelName) {
    const port = this.models[modelName].port;
    const size = parseInt(this.models[modelName].size);

    // Determine timeout based on size
    const timeout = size >= 17 ? 300000 :  // 5 minutes for 17B+
                   size >= 10 ? 180000 :  // 3 minutes for 10-16B
                   120000;                // 2 minutes for smaller

    console.log(`\n▶️  Starting ${modelName} (${this.models[modelName].size})`);
    console.log(`   Timeout: ${timeout/60000} minutes`);

    // LAYER 1: Issue start command
    await execAsync(`llamacpp-manager start ${modelName}`);
    console.log('   Command sent');

    // LAYER 2: Wait for health endpoint
    console.log('   Waiting for health endpoint...');
    const startTime = Date.now();
    let healthOk = false;

    while (Date.now() - startTime < timeout) {
        await sleep(3000);

        try {
            const response = await fetch(`http://127.0.0.1:${port}/health`, {
                signal: AbortSignal.timeout(2000)
            });
            const data = await response.json();

            if (data.status === 'ok') {
                console.log('   Health endpoint responding ✓');
                healthOk = true;
                break;
            } else if (data.error?.code === 503) {
                console.log('   Model loading... (503)');
            }
        } catch (error) {
            // Still loading
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            console.log(`   Loading... (${elapsed}s / ${timeout/1000}s)`);
        }
    }

    if (!healthOk) {
        throw new Error(`${modelName} failed to load within ${timeout/1000}s`);
    }

    // LAYER 3: Send test query to verify functional
    console.log('   Sending test query to verify functionality...');
    const testQuery = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            messages: [{role: 'user', content: 'Test message - respond with OK'}],
            max_tokens: 10,
            temperature: 0.5
        }),
        signal: AbortSignal.timeout(30000)  // 30s for test query
    });

    if (!testQuery.ok) {
        throw new Error(`${modelName} health OK but query failed: ${testQuery.status}`);
    }

    const testResult = await testQuery.json();

    // LAYER 4: Verify response structure
    if (!testResult.choices ||
        !testResult.choices[0] ||
        !testResult.choices[0].message ||
        !testResult.choices[0].message.content) {
        throw new Error(`${modelName} returned invalid response structure`);
    }

    console.log(`   Test query succeeded: "${testResult.choices[0].message.content.substring(0, 50)}..."`);
    console.log(`✅ ${modelName} VERIFIED READY AND FUNCTIONAL\n`);

    return true;
}
```

**Time to start and verify: 2-5 minutes depending on model size**

---

### Fix 3: Pre-Flight Safety Check

```javascript
async verifyCompletelyClean() {
    console.log('\n🔍 PRE-FLIGHT CHECK: Verifying no models running...');

    // Check 1: llamacpp-manager status
    const status = await this.getStatus();
    const runningInStatus = Object.entries(status || {})
        .filter(([name, s]) => s && s.running)
        .map(([name]) => name);

    if (runningInStatus.length > 0) {
        throw new Error(`ABORT: ${runningInStatus.length} models running in status: ${runningInStatus.join(', ')}`);
    }
    console.log('   ✓ Status check: All models stopped');

    // Check 2: Process list
    const processes = await execAsync('ps aux | grep llama-server | grep -v grep').catch(() => ({stdout: ''}));
    if (processes.stdout.trim() !== '') {
        throw new Error(`ABORT: llama-server processes still exist:\n${processes.stdout}`);
    }
    console.log('   ✓ Process check: No llama-server running');

    // Check 3: Test all ports
    const ports = [8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089, 8092];
    console.log('   Testing all 10 ports...');

    for (const port of ports) {
        try {
            await fetch(`http://127.0.0.1:${port}/health`, {
                signal: AbortSignal.timeout(1000)
            });
            throw new Error(`ABORT: Port ${port} is responding! Not clean state.`);
        } catch (error) {
            if (error.message.includes('ABORT')) throw error;
            // Connection refused = good
        }
    }
    console.log('   ✓ Port check: All ports unreachable');

    console.log('✅ PRE-FLIGHT COMPLETE: System is clean\n');
    return true;
}
```

---

### Fix 4: Complete Test Sequence

```javascript
async runSequentialTests(models, tests) {
    console.log('='.repeat(80));
    console.log('SEQUENTIAL EXECUTION WITH FULL VERIFICATION');
    console.log('='.repeat(80));
    console.log(`\nModels to test: ${models.length}`);
    console.log(`Tests per model: ${tests.length}`);
    console.log(`Total executions: ${models.length * tests.length}`);
    console.log(`Estimated time: ${Math.ceil(models.length * 45)} minutes\n`);

    const auditLog = [];

    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const timestamp = new Date().toISOString();

        console.log('='.repeat(80));
        console.log(`MODEL ${i+1}/${models.length}: ${model.toUpperCase()}`);
        console.log(`Time: ${timestamp}`);
        console.log('='.repeat(80));

        // STEP 1: Verify clean state before starting
        await this.verifyCompletelyClean();
        auditLog.push({timestamp, action: 'CLEAN_STATE_VERIFIED', model});

        // STEP 2: Start model with full verification
        const startTime = Date.now();
        await this.startModelWithVerification(model);
        const startDuration = Date.now() - startTime;
        auditLog.push({timestamp: new Date().toISOString(), action: 'MODEL_STARTED_VERIFIED', model, durationMs: startDuration});

        // STEP 3: Run actual test suite
        console.log(`\n📝 Running ${tests.length} tests on ${model}...\n`);
        const testStart = Date.now();
        const results = await this.runTests(model, tests);
        const testDuration = Date.now() - testStart;
        auditLog.push({timestamp: new Date().toISOString(), action: 'TESTS_COMPLETED', model, durationMs: testDuration, testsRun: tests.length});

        // STEP 4: Stop model with full verification
        const stopTime = Date.now();
        await this.stopModelWithVerification(model);
        const stopDuration = Date.now() - stopTime;
        auditLog.push({timestamp: new Date().toISOString(), action: 'MODEL_STOPPED_VERIFIED', model, durationMs: stopDuration});

        // STEP 5: Verify clean state after stopping
        await this.verifyCompletelyClean();
        auditLog.push({timestamp: new Date().toISOString(), action: 'POST_STOP_CLEAN_VERIFIED', model});

        const passed = results.filter(r => r.success && r.evaluation?.passed).length;
        console.log(`\n✅ ${model} COMPLETE: ${passed}/${results.length} passed`);
        console.log(`   Start time: ${(startDuration/1000).toFixed(1)}s`);
        console.log(`   Test time: ${(testDuration/1000).toFixed(1)}s`);
        console.log(`   Stop time: ${(stopDuration/1000).toFixed(1)}s`);
    }

    // Save audit log with results
    return {results: this.results, auditLog};
}
```

---

## Verification Layers

### For Stop (5 layers):
1. ✅ Send stop command
2. ✅ Endpoint becomes unreachable (connection refused)
3. ✅ Port no longer listening (lsof check)
4. ✅ Status shows "stopped"
5. ✅ Wait 10s for memory cleanup + verify still down

### For Start (4 layers):
1. ✅ Send start command
2. ✅ Health endpoint returns `{"status": "ok"}`
3. ✅ **Send test query and get valid response**
4. ✅ Verify response structure is correct

### Pre-Flight (3 checks):
1. ✅ Status shows all stopped
2. ✅ No llama-server processes exist
3. ✅ All 10 ports unreachable

---

## Expected Timing

**Per Model:**
```
Pre-flight check:     ~5 seconds
Start model:          ~2-5 minutes (size dependent)
Test query verify:    ~5 seconds
Run 52 tests:         ~30-40 minutes
Stop model:           ~15-20 seconds (with verification)
Post-stop verify:     ~5 seconds
Memory cleanup:       ~10 seconds

TOTAL PER MODEL:      ~40-50 minutes
```

**Full 10-Model Run:**
- Minimum: 400 minutes (6.5 hours)
- Maximum: 500 minutes (8.3 hours)
- **With proper isolation and verification**

---

## Code Changes Required

### File: `utils/llamacpp-manager-client.js`

**Changes:**
1. Replace `stopModel()` with `stopModelWithVerification()` (as described above)
2. Replace `startModel()` with `startModelWithVerification()` (as described above)
3. Add `verifyCompletelyClean()` method
4. Add `sendTestQuery()` helper method
5. Increase timeouts: 2-5 minutes based on model size

### File: `enterprise/enterprise-test-runner.js`

**Changes:**
1. Add pre-flight check before loop
2. Add clean state verification between models
3. Add audit logging
4. Add timing measurements
5. Save audit log with results

---

## Validation Plan

### Before Full Run - Test With 2 Models:

```bash
# Test sequential execution with just 2 models
node run-enterprise-tests.js pilot --models phi3,smollm3
```

**Manual verification during pilot test:**

**Terminal 1:** Run test

**Terminal 2:** Monitor processes
```bash
watch -n 1 'ps aux | grep llama-server | grep -v grep | wc -l'
# Should show: 0 → 1 (phi3) → 0 → 1 (smollm3) → 0
# NEVER 2 or more!
```

**Terminal 3:** Monitor memory
```bash
watch -n 5 'top -l 1 | grep PhysMem'
# Should NOT continuously grow
# Should release memory between models
```

**Terminal 4:** Monitor ports
```bash
watch -n 2 'lsof -i :8081,:8082 | grep LISTEN'
# Should show: nothing → 8081 → nothing → 8082 → nothing
# NEVER both ports simultaneously!
```

### Success Criteria for Pilot:

1. ✅ Process count never exceeds 1
2. ✅ Memory releases between models
3. ✅ Each model's test query succeeds
4. ✅ Audit log shows all verifications passed
5. ✅ No overlapping port listeners

**Only if pilot test passes all criteria → proceed to comprehensive test**

---

## Files to Modify

1. `utils/llamacpp-manager-client.js`
   - stopModel() → stopModelWithVerification()
   - startModel() → startModelWithVerification()
   - Add verifyCompletelyClean()
   - Add sendTestQuery()

2. `enterprise/enterprise-test-runner.js`
   - Add pre-flight verification
   - Add audit logging
   - Save audit log with results

3. Create new file: `utils/test-verification.js`
   - Centralize all verification logic
   - Reusable verification functions

---

## Rollout Plan

### Step 1: Implement Fixes
- Modify files as specified above
- Add comprehensive logging
- Add audit trail

### Step 2: Test with 2 Models (Pilot)
- Run with phi3 + smollm3 only
- Manually monitor all 4 terminals
- Verify clean execution
- Review audit log

### Step 3: If Pilot Succeeds
- Run comprehensive with all 10 models
- Monitor first 3 models manually
- If stable, let it complete

### Step 4: Results Validation
- Check audit log for any verification failures
- Confirm timing shows proper gaps between models
- Verify no warnings in logs

---

## Success Metrics

**Test is VALID only if:**
1. ✅ Audit log shows 0 verification failures
2. ✅ Process count never exceeded 1 (manual verification)
3. ✅ All test queries succeeded before suite ran
4. ✅ Memory was released between models
5. ✅ All models completed (no timeouts)

**If any metric fails → test is INVALID, fix and re-run**

---

## Questions Before Implementation

1. Should I implement all fixes before testing?
2. Should I run pilot test with manual monitoring first?
3. Should audit log be saved separately from test results?
4. Any other verification steps you want included?

---

Contact: libor@arionetworks.com
