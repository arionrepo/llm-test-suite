// Test the new start/stop verification logic
import { LlamaCppManagerClient } from './utils/llamacpp-manager-client.js';

async function testVerification() {
    const client = new LlamaCppManagerClient();

    console.log('Testing new verification logic...\n');

    try {
        // TEST 1: Verify clean state (should pass - no models running)
        console.log('TEST 1: Verify clean state');
        await client.verifyCleanState();
        console.log('✅ Clean state verification works\n');

        // TEST 2: Start phi3 with full verification
        console.log('TEST 2: Start phi3 with verification');
        await client.startModel('phi3');
        console.log('✅ Start verification works (including test query)\n');

        // TEST 3: Verify clean state should FAIL now (phi3 running)
        console.log('TEST 3: Verify clean state (should fail - phi3 running)');
        try {
            await client.verifyCleanState();
            console.log('❌ PROBLEM: Clean state check should have failed!');
        } catch (error) {
            console.log('✅ Clean state check correctly detected running model');
            console.log('   Error message: ' + error.message + '\n');
        }

        // TEST 4: Stop phi3 with full verification
        console.log('TEST 4: Stop phi3 with verification');
        await client.stopModel('phi3');
        console.log('✅ Stop verification works (endpoint unreachable, port released)\n');

        // TEST 5: Verify clean state again (should pass - phi3 stopped)
        console.log('TEST 5: Verify clean state after stop');
        await client.verifyCleanState();
        console.log('✅ Clean state restored\n');

        console.log('='.repeat(70));
        console.log('ALL VERIFICATION TESTS PASSED ✅');
        console.log('='.repeat(70));
        console.log('\nVerification logic is working correctly.');
        console.log('Ready to run pilot test with 2 models.');

    } catch (error) {
        console.error('\n❌ VERIFICATION TEST FAILED:', error.message);
        console.error('\nDo not proceed with pilot test until this is fixed.');
        process.exit(1);
    }
}

testVerification();
