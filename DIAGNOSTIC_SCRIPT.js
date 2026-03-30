// Run this in your browser console (F12) to debug the match loading issue
// Copy and paste the entire script

(async function diagnoseMatchLoading() {
  console.log("🔍 Diagnosing Match Loading Issue...\n");
  
  const matchId = "699d77312feb6f9a366155ac";
  const apiUrl = `http://localhost:5000/api/matches/${matchId}`;
  
  console.log("1️⃣  Checking API Response...");
  try {
    const response = await fetch(apiUrl);
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("   ✅ API Response Received:");
      console.log("   - Match Title:", data.title);
      console.log("   - Match Status:", data.status);
      console.log("   - Teams:", data.teams && data.teams.length > 0 ? `${data.teams[0].name} vs ${data.teams[1].name}` : "None");
      console.log("   - Innings Data:", data.innings && data.innings.length > 0 ? `${data.innings.length} innings` : "No innings");
      
      // Check for problematic data
      console.log("\n2️⃣  Checking Data Integrity...");
      let issues = [];
      
      if (!data.teams || data.teams.length < 2) {
        issues.push("   ⚠️  Missing teams data");
      }
      if (!data.innings || data.innings.length === 0) {
        issues.push("   ⚠️  No innings data");
      }
      if (!data.currentInnings && data.currentInnings !== 0) {
        issues.push("   ⚠️  Missing currentInnings");
      }
      
      if (issues.length === 0) {
        console.log("   ✅ Data structure looks good!");
      } else {
        console.log(issues.join("\n"));
      }
    } else {
      console.log(`   ❌ API Error: ${response.status} ${response.statusText}`);
      const errorData = await response.json();
      console.log("   Error Details:", errorData);
    }
  } catch (error) {
    console.log("   ❌ Network Error:", error.message);
  }
  
  console.log("\n3️⃣  Checking Frontend Setup...");
  // Check if socket is initialized
  if (window.localStorage) {
    const token = localStorage.getItem("token");
    console.log(`   🔐 Auth Token: ${token ? "Present" : "MISSING"}`);
  }
  
  console.log("\n4️⃣  SUGGESTED NEXT STEPS:");
  console.log("   1. Open DevTools (F12)");
  console.log("   2. Go to 'Console' tab");
  console.log("   3. Check for any red error messages");
  console.log("   4. Check 'Network' tab for failed requests");
  console.log("   5. Hard refresh page: Ctrl+Shift+R");
  console.log("\n✅ Diagnostic Complete!");
})();
