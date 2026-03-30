# 🔧 BQ-PLAY "Failed to load match" Troubleshooting Guide

## ✅ What We've Verified So Far
- ✅ Backend server is running
- ✅ API endpoint responds with Status 200
- ✅ Match data exists in database
- ✅ Frontend routing is configured correctly
- ✅ Environment variables are correct
- ✅ Socket.io setup is correct

## 🎯 The Problem
The error "Failed to load match" appears when trying to access: 
`http://localhost:3000/admin/live/699d77312feb6f9a366155ac`

## 🔍 Diagnostic Steps (In Order)

### **Step 1: Check Browser Console for Actual Error**
1. Go to `http://localhost:3000/admin/live/699d77312feb6f9a366155ac`
2. Press `F12` to open Developer Tools
3. Click on **Console** tab
4. Look for **red error messages** (not warnings)
5. Take a screenshot and note the error

**Common errors to look for:**
- `Cannot read property X of undefined`
- `TypeError: ...is not a function`
- `ReferenceError: ...is not defined`
- CORS errors

### **Step 2: Run the Diagnostic Script**
1. Copy the contents of `DIAGNOSTIC_SCRIPT.js`
2. In DevTools Console, paste and press Enter
3. This will test the API directly from your browser
4. Share the console output

### **Step 3: Check Network Tab**
1. In DevTools, go to **Network** tab
2. Refresh the page
3. Look for requests to `/api/matches/699d77312feb6f9a366155ac`
4. Click on it and check:
   - **Status:** Should be 200 ✅
   - **Response:** Should show match JSON
   - **Size:** Should not be 0
   - **Preview:** Click Preview tab to see formatted data

### **Step 4: Check If Other Matches Load**
Try navigating to a different live match (if one exists):
```
http://localhost:3000/admin/live/[different-match-id]
```

If other matches load but this one doesn't:
- The match data might be corrupted
- There might be specific data in this match causing the error

### **Step 5: Hard Refresh Browser**
Sometimes cached files cause issues:
1. Press `Ctrl + Shift + R` (Windows)
2. Or `Cmd + Shift + R` (Mac)
3. This clears cache and reloads

### **Step 6: Check Match Data Integrity**
The API returns the match, but maybe with incomplete data. Check if:
- `innings` array exists and is not empty
- `teams` array has 2 teams
- `currentInnings` is defined

Use MongoDB Compass or Atlas to check the match document:
```
Database: bqplay
Collection: matches
Find: { _id: ObjectId("699d77312feb6f9a366155ac") }
```

## 🛠️ Quick Fixes to Try

### **Fix 1: Clear Authentication Cache**
```javascript
// Run in browser console
localStorage.removeItem("token");
localStorage.removeItem("bq_user");
localStorage.clear();
// Then refresh the page
```

### **Fix 2: Verify the API is Actually Called**
In Livematchview.jsx, the error is caught here (around line 43):
```javascript
} catch (err) {
  console.error("Failed to load match:", err);
  console.error("Error details:", err.response?.data || err.message);
  setLoading(false);
}
```

The error message in console should tell you what went wrong.

### **Fix 3: Add Error Boundary**
If the component is throwing a render error, add an Error Boundary around it in App.jsx. But first, check the console error.

## 📋 Most Likely Causes (In Order of Probability)

1. **Component Render Error** (80%)
   - A child component (MatchEditor, InningsDashboard, etc.) is breaking
   - Usually due to undefined property access

2. **Token/Authentication Issue** (10%)
   - Token missing or invalid
   - Fix: Clear localStorage and re-login

3. **Corrupted Match Data** (5%)
   - Match document has invalid nested data
   - Fix: Delete and recreate the match

4. **Socket.io Connection Issue** (3%)
   - Real-time updates failing
   - Non-blocking (shouldn't cause initial load to fail)

5. **CORS or Network Issue** (2%)
   - Rare if API health check works

## 📞 Next Step: Share Error Details

Please run the diagnostic script and share:
1. The **red error message** from the console
2. The output of the **diagnostic script**
3. The **Network tab** response for the match API call

Once I see the actual error, I can provide a targeted fix!

## 🚀 Emergency Alternative: Direct Database Check

If you have MongoDB access, verify the match directly:
```javascript
// MongoDB query
db.matches.findOne({ _id: ObjectId("699d77312feb6f9a366155ac") })
  .then(doc => console.log(JSON.stringify(doc, null, 2)))
```

---

**Status:** API is healthy ✅ | Issue is in frontend loading ⚠️

Once you share the console error, I can provide a specific fix!
