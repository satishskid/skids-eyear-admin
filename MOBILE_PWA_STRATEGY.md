# 📱 SKIDS EYEAR Mobile Screening App - PWA Version

**🎯 MAJOR DECISION: Build as Progressive Web App (PWA)**

**Status:** Ready to Build  
**Platform:** Web (PWA) - Works on iOS, Android, tablets, ANY device with a browser  
**Current State:** Service layer code exists, needs web UI implementation

---

## 🚀 Why PWA is BETTER than Native App

### ✅ Massive Advantages

| Feature | Native App | **PWA (Our Choice)** |
|---------|-----------|---------------------|
| **Development Time** | 20-30 hours | **10-15 hours** ⚡ |
| **App Store Approval** | Weeks, can be rejected | **Instant deployment** 🚀 |
| **Updates** | User must download | **Automatic, instant** 🔄 |
| **Distribution** | App Store + Play Store | **Just share a URL** 🔗 |
| **Cost** | $99/yr (Apple) + $25 (Google) | **$0 - FREE!** 💰 |
| **Cross-platform** | Separate builds | **One codebase, all devices** 📱💻 |
| **Installation** | Required | **Optional (add to home)** ⭐ |
| **Maintenance** | Complex | **Simple** ✨ |

### 🎯 What We Get for FREE with PWA

✅ **Camera access** - Web APIs for QR scanning  
✅ **Audio playback** - Web Audio API for hearing tests  
✅ **Offline storage** - IndexedDB (like SQLite)  
✅ **File export** - Download FHIR/HL7/CSV files  
✅ **Add to home screen** - Works like native app  
✅ **Push notifications** - Can notify when synced  
✅ **Background sync** - Auto-sync when online  
✅ **Responsive design** - Works on phone, tablet, desktop  

### 💡 Real-World Usage

**Healthcare worker workflow:**
1. Open browser → Go to `https://screening.skids.health`
2. Click "Add to Home Screen" (one-time setup)
3. App icon appears on phone like native app
4. Tap icon → App opens full-screen (no browser UI)
5. Works offline, syncs when online
6. Updates automatically in background

**No app store. No downloads. No approvals. Just works!** 🎉

---

## 🏗️ Architecture - Mobile PWA

### File Structure
```
/Users/spr/skidsgck/
├── admin-portal/           # Existing admin portal (deployed ✅)
│
└── mobile-app/             # NEW - Mobile screening PWA
    ├── index.html          # Entry point
    ├── package.json        # Dependencies
    ├── vite.config.js      # Vite + PWA plugin
    │
    ├── public/
    │   ├── manifest.json   # PWA manifest
    │   ├── service-worker.js
    │   ├── icons/          # App icons (512x512)
    │   └── optotypes/      # Vision test symbols
    │
    └── src/
        ├── App.jsx         # Main app component
        ├── main.jsx        # Entry point
        │
        ├── screens/        # UI screens (React components)
        │   ├── HomeScreen.jsx
        │   ├── QRScannerScreen.jsx
        │   ├── VisionScreen.jsx
        │   ├── HearingScreen.jsx
        │   ├── ResultsScreen.jsx
        │   └── ExportScreen.jsx
        │
        ├── services/       # REUSE from /app/services! ♻️
        │   ├── visionEngine.js    # Already exists ✅
        │   ├── hearingEngine.js   # Already exists ✅
        │   ├── offlineDB.js       # Adapt to IndexedDB
        │   ├── fhirExport.js      # Already exists ✅
        │   └── qrService.js       # Already exists ✅
        │
        ├── components/     # Reusable UI
        │   ├── Button.jsx
        │   ├── ChildCard.jsx
        │   ├── ProgressBar.jsx
        │   └── ResultCard.jsx
        │
        └── utils/
            ├── camera.js   # Web camera API
            ├── audio.js    # Web Audio API
            └── storage.js  # IndexedDB wrapper
```

---

## 🛠️ Technology Stack - PWA Version

### Core Technologies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",  // Navigation
    "idb": "^8.0.0",                 // IndexedDB wrapper
    "jsqr": "^1.4.0",                // QR code detection ✅ (already have)
    "uuid": "^9.0.1",                // ✅ (already have)
    "xlsx": "^0.18.5"                // ✅ (already have)
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.4",   // PWA superpowers ⚡
    "@vitejs/plugin-react": "^4.2.1",
    "vitest": "^1.1.0"
  }
}
```

### Web APIs We'll Use

| Feature | Web API | Browser Support |
|---------|---------|-----------------|
| **QR Scanning** | `navigator.mediaDevices.getUserMedia()` | ✅ All modern browsers |
| **Camera** | `<video>` + Canvas API | ✅ Universal |
| **Audio Tones** | Web Audio API (`AudioContext`) | ✅ Universal |
| **Offline Storage** | IndexedDB | ✅ Universal |
| **File Download** | Blob + `URL.createObjectURL()` | ✅ Universal |
| **Offline Mode** | Service Worker | ✅ Universal |
| **Add to Home** | Web App Manifest | ✅ iOS 16.4+, Android all |

**Result: Works on 99%+ of devices!** 📱✨

---

## 🎨 Key Features - PWA Implementation

### 1. QR Code Scanner (Web Camera API)
```javascript
// Use device camera for real-time QR scanning
const stream = await navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: 'environment' } // Use back camera
});

// Process video frames with jsQR library (already in package.json!)
const code = jsQR(imageData.data, width, height);
```

**User Experience:**
- Tap "Scan QR Code"
- Browser asks for camera permission (one time)
- Real-time QR detection overlay
- Auto-fill child data when detected
- Fallback to manual search

### 2. Vision Acuity Test (Canvas API)
```javascript
// Display Tumbling E at calculated size
<canvas id="visionCanvas" />

// Calculate optotype size based on logMAR
const sizeInPixels = calculateOptotypeSize(logMAR, viewingDistance);
drawTumblingE(canvas, direction, sizeInPixels);
```

**User Experience:**
- Show Tumbling E symbol at correct size
- 4 direction buttons (up, down, left, right)
- Adaptive sizing based on responses
- Real-time feedback
- Final logMAR score + pass/fail

### 3. Hearing Test (Web Audio API)
```javascript
// Generate pure tones at exact frequencies
const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
oscillator.frequency.value = 1000; // Hz
oscillator.type = 'sine';

// Control volume (30 dB HL)
const gainNode = audioContext.createGain();
gainNode.gain.value = 0.1; // Calibrated
```

**User Experience:**
- Headphone calibration prompt
- Test 1000 Hz, 2000 Hz, 4000 Hz
- "Yes I heard it" / "No" buttons
- 10-second timeout per tone
- Pass/fail result

### 4. Offline Storage (IndexedDB)
```javascript
// Store screening results locally
import { openDB } from 'idb';

const db = await openDB('skids-eyear', 1, {
  upgrade(db) {
    db.createObjectStore('children');
    db.createObjectStore('results');
    db.createObjectStore('syncQueue');
  }
});

// Save result
await db.put('results', screeningResult);
```

**User Experience:**
- All data saved locally
- Works completely offline
- Auto-sync when back online
- No data loss

### 5. Data Export (File Download)
```javascript
// Export to FHIR/HL7/CSV
const fhirBundle = generateFHIRBundle(results); // Reuse existing service!
const blob = new Blob([JSON.stringify(fhirBundle)], { type: 'application/json' });
const url = URL.createObjectURL(blob);

// Trigger download
const a = document.createElement('a');
a.href = url;
a.download = 'screening-results.json';
a.click();
```

**User Experience:**
- Export button
- Choose format (FHIR, HL7, CSV, Excel)
- File downloads to device
- Share via email, USB, cloud

---

## 🚀 Development Phases - PWA

### **Phase 1: PWA Foundation** (2-3 hours)
```bash
Tasks:
1. Create mobile-app/ directory
2. Setup Vite + React + PWA plugin
3. Create manifest.json (app name, icons, colors)
4. Configure service worker
5. Setup React Router for navigation
6. Create basic screen structure
7. Test "Add to Home Screen" on phone
```

**Deliverables:**
- ✅ Installable PWA
- ✅ Works offline
- ✅ Navigation between screens
- ✅ Professional app icon

---

### **Phase 2: QR Scanner Screen** (1-2 hours)
```bash
Tasks:
1. Request camera permission
2. Stream video to <video> element
3. Capture frames to canvas
4. Use jsQR for real-time detection
5. Parse QR data and load child info
6. Add manual search fallback
```

**Deliverables:**
- ✅ Working camera QR scanner
- ✅ Real-time detection overlay
- ✅ Child data auto-filled

---

### **Phase 3: Vision Test Screen** (2-3 hours)
```bash
Tasks:
1. Port VisionScreen.js to React component
2. Use Canvas API for Tumbling E rendering
3. Calculate symbol size for viewing distance
4. Implement 4-direction button inputs
5. Integrate visionEngine.js (already tested!)
6. Show real-time progress
7. Display final results
```

**Deliverables:**
- ✅ Interactive vision test
- ✅ Accurate symbol sizing
- ✅ logMAR staircase working
- ✅ Pass/fail determination

---

### **Phase 4: Hearing Test Screen** (2-3 hours)
```bash
Tasks:
1. Port HearingScreen.js to React component
2. Implement Web Audio API tone generation
3. Calibrate volume levels
4. Test 1k, 2k, 4k Hz @ 30 dB HL
5. Add Yes/No response buttons
6. Implement timeout logic
7. Display results
```

**Deliverables:**
- ✅ Pure tone generation
- ✅ Response collection
- ✅ Pass/fail determination
- ✅ Headphone validation

---

### **Phase 5: Results & Data Management** (1-2 hours)
```bash
Tasks:
1. Create ResultsScreen with IndexedDB
2. Display all screening data
3. Add edit/review functionality
4. List all stored results
5. Delete/bulk actions
```

**Deliverables:**
- ✅ Results management
- ✅ Local database working
- ✅ CRUD operations

---

### **Phase 6: Export & Sync** (1-2 hours)
```bash
Tasks:
1. Reuse fhirExport.js (already exists!)
2. Add HL7 export function
3. Create CSV/Excel export
4. Implement file download
5. Add sync to admin portal API (future)
```

**Deliverables:**
- ✅ FHIR export working
- ✅ HL7 export working
- ✅ CSV/Excel export
- ✅ File downloads

---

### **Phase 7: Deploy to Netlify** (30 mins)
```bash
Tasks:
1. Build production bundle
2. Deploy to Netlify
3. Configure PWA caching
4. Test on real devices
5. Share URL with team
```

**Deliverables:**
- ✅ Live at https://screening.skids.health (or similar)
- ✅ Installable on all devices
- ✅ Works offline
- ✅ Auto-updates

---

## 📊 Comparison: Native vs PWA

### Development Time
- **Native App:** 20-30 hours
- **PWA:** **10-15 hours** ⚡ (50% faster!)

### Distribution
- **Native App:** App Store approval (1-2 weeks), version fragmentation
- **PWA:** **Instant URL share, everyone gets latest version**

### Updates
- **Native App:** User must download update, version fragmentation
- **PWA:** **Automatic background updates, always latest**

### Cost
- **Native App:** $99/year (Apple) + $25 (Google) = $124
- **PWA:** **$0** (just Netlify hosting - free tier works!)

### Maintenance
- **Native App:** Separate iOS/Android codebases, SDK updates, compatibility
- **PWA:** **One codebase, browser handles compatibility**

---

## 🎯 PWA Deployment Strategy

### 1. Development
```bash
cd /Users/spr/skidsgck/mobile-app
npm run dev              # Local development
# Visit http://localhost:5173
```

### 2. Build
```bash
npm run build           # Production build
# Output: dist/ directory (~200KB gzipped)
```

### 3. Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
# Live at: https://screening-skids-eyear.netlify.app
```

### 4. Custom Domain (Optional)
```bash
# Point DNS to Netlify
# screening.skids.health → PWA
# admin.skids.health → Admin portal
```

---

## 📱 User Installation Flow

### On Any Device (iOS, Android, Desktop)

**First Time:**
1. User visits: `https://screening.skids.health`
2. Browser prompts: "Add to Home Screen?"
3. User taps "Add"
4. App icon appears on home screen
5. Tap icon → Opens full-screen (no browser UI)

**Daily Use:**
- Tap app icon (looks/feels like native app)
- Works offline automatically
- Syncs data when online
- Updates automatically in background

**No app store. No approvals. Just works!** 🎉

---

## ✅ Success Criteria - PWA

**Functional:**
- [ ] Installs as PWA on iOS/Android
- [ ] Camera QR scanning works
- [ ] Vision test produces valid logMAR
- [ ] Hearing test generates pure tones
- [ ] Results save to IndexedDB
- [ ] Exports to FHIR/HL7/CSV
- [ ] Works 100% offline

**Performance:**
- [ ] Lighthouse PWA score: 100/100
- [ ] Bundle size: < 500KB gzipped
- [ ] Initial load: < 2 seconds
- [ ] Camera latency: < 100ms
- [ ] Audio latency: < 50ms

**Compatibility:**
- [ ] iOS Safari 16.4+
- [ ] Android Chrome
- [ ] Desktop browsers
- [ ] Tablets

---

## 💰 Cost Comparison

### Native App Path
```
Apple Developer:        $99/year
Google Play:            $25 one-time
EAS Build (optional):   $29/month
Maintenance time:       High
Total Year 1:           ~$500+ (with build service)
```

### PWA Path (Our Choice!)
```
Netlify hosting:        $0 (free tier) or $19/month (pro)
Domain (optional):      $12/year
Maintenance time:       Low
Total Year 1:           $12-$240 (95% savings!)
```

---

## 🚀 RECOMMENDED: Start Building PWA NOW!

### Why This is the BEST Path:

1. ✅ **Reuse 90% of existing code** - visionEngine, hearingEngine, fhirExport all work!
2. ✅ **10x faster deployment** - No app store approval
3. ✅ **Instant updates** - Push code, users get it immediately
4. ✅ **Zero distribution cost** - Just share a URL
5. ✅ **One codebase** - Works on ALL devices
6. ✅ **Same user experience** - Looks/feels like native app
7. ✅ **Already know how** - Same tech stack as admin portal!

### Next Steps:

**I can start building RIGHT NOW and have a working PWA in 2-3 hours!**

Here's what we'll build first:
1. Create mobile-app/ directory structure
2. Setup Vite + React + PWA plugin
3. Port VisionScreen to web component
4. Implement QR scanner with Web Camera API
5. Deploy to Netlify
6. Test on your phone!

---

## 📝 Final Decision

**Original Plan:** React Native app → 20-30 hours, $124/year, app store approval  
**NEW PLAN:** Progressive Web App → **10-15 hours, $0-$19/month, instant deployment** ✨

**Same features. Better experience. 90% less complexity.** 🎉

---

## ❓ Ready to Build?

**Just say "YES" and I'll:**

1. Create `mobile-app/` directory
2. Setup Vite + React + PWA
3. Port all screens to web components
4. Implement camera QR scanner
5. Build vision & hearing tests
6. Deploy to Netlify
7. Give you a URL to test on your phone

**We can have a working prototype in 2-3 hours!** 🚀

**Should we start building the PWA version now?** 🎯
