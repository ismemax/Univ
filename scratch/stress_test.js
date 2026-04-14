
/**
 * UAQS Stress Test Utility
 * Run this in your browser console while a Live Session is active
 * to simulate 50+ students joining and submitting responses.
 */

async function simulateUsers(count = 60) {
  const accessCode = prompt("Enter the active 4-digit Access Code:");
  if (!accessCode) return;

  console.log(`🚀 Initializing stress test for ${count} users...`);
  
  // We'll use the Firebase instance already in the window if available, 
  // or fetch the database URL from the app config.
  // For simplicity, we'll use a script that manually pushes to the REST API 
  // or uses the global firebase if the user has it.
  
  // Alternative: Just use the existing Firebase logic if we can hook into it.
  // But a safer way is to provide a standalone Node script.
  
  console.log("Simulating joins and responses...");
  const dbUrl = "https://univ-633d8-default-rtdb.asia-southeast1.firebasedatabase.app";
  
  // 1. Get current session state
  const sessionRes = await fetch(`${dbUrl}/active_session.json`);
  const session = await sessionRes.json();
  
  if (!session) {
    console.error("❌ No active session found to answer questions for.");
    return;
  }

  const qIdx = session.currentQuestionIndex || 0;
  const activeQ = session.questions?.[qIdx];
  
  for (let i = 1; i <= count; i++) {
    const name = `Test Student ${i}`;
    const nameKey = name.replace(/[.$#[\]/]/g, '_');
    
    try {
      // Register Identity
      await fetch(`${dbUrl}/attendance/${accessCode}/${nameKey}.json`, {
        method: 'PUT',
        body: JSON.stringify(name)
      });

      // Submit Response based on type
      if (activeQ) {
        if (activeQ.type === 'MULTIPLE_CHOICE' || activeQ.type === 'TRUE_FALSE' || activeQ.type === 'RATING_SCALE') {
          const optionIdx = Math.floor(Math.random() * (activeQ.options?.length || 2));
          const responseBody = {};
          responseBody[optionIdx] = { ".sv": { "increment": 1 } };
          
          await fetch(`${dbUrl}/active_session/allResponses/${qIdx}.json`, {
             method: 'PATCH',
             body: JSON.stringify(responseBody)
          });
        } else {
          // Push text response to the array
          await fetch(`${dbUrl}/active_session/allResponses/${qIdx}/text.json`, {
            method: 'POST', // Use POST for auto-incrementing list simulation
            body: JSON.stringify("Automated research feedback response.")
          });
        }
      }

      if (i % 10 === 0) console.log(`✅ ${i} users processed...`);
    } catch (e) {
      console.error(`❌ Error in user ${i}:`, e);
    }
  }
  
  console.log("⭐ Stress test complete. Check your Faculty Dashboard!");
}

// simulateUsers(60);
