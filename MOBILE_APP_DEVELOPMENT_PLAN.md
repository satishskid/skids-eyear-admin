# 📱 SKIDS EYEAR Mobile App - Complete Development Plan

**Status:** Ready to Build  
**Platform:** React Native (Expo)  
**Target:** iOS + Android  
**Current State:** Service layer code exists, needs full Expo app structure

---

## 🎯 What We're Building

A **professional mobile screening app** for healthcare workers to:
1. ✅ Scan QR codes to identify children
2. 👁️ Conduct **vision acuity tests** (logMAR staircase method)
3. 👂 Conduct **hearing tests** (play audiometry at 1k, 2k, 4k Hz)
4. 💾 Save results offline (SQLite database)
5. 📊 Sync data to admin portal
6. 📤 Export to FHIR/HL7 formats

---

## 📋 Current Status Assessment

### ✅ What We Have
```
app/
├── services/           # Core logic (90% complete)
│   ├── visionEngine.js     ✅ logMAR staircase algorithm
│   ├── hearingEngine.js    ✅ Audiometry tone generation
│   ├── offlineDB.js        ✅ SQLite database layer
│   ├── fhirExport.js       ✅ FHIR R4 bundle generation
│   ├── qrService.js        ✅ QR code decoding
│   └── types.js            ✅ TypeScript definitions
│
├── screens/           # UI components (50% complete)
│   ├── VisionScreen.js     ⚠️ Needs Expo components
│   ├── HearingScreen.js    ⚠️ Needs Web Audio API
│   ├── HomeScreen.js       ⚠️ Needs navigation setup
│   ├── QRScannerScreen.js  ⚠️ Needs expo-camera
│   ├── ResultsScreen.js    ⚠️ Needs final polish
│   └── ExportScreen.js     ⚠️ Needs file system access
│
└── __tests__/         # Unit tests (100% coverage)
    └── *.test.js           ✅ All services tested
```

### ❌ What We Need to Build

1. **Expo App Structure**
   - `App.js` - Main entry point
   - `app.json` - Expo configuration
   - Navigation setup (React Navigation)
   - Global state management

2. **Missing Dependencies**
   - `expo-camera` - QR code scanning
   - `expo-av` - Audio playback for hearing tests
   - `react-navigation` - Screen navigation
   - `expo-file-system` - File export
   - `expo-splash-screen` - Professional launch screen

3. **Complete Screens**
   - Update all screens to use Expo APIs
   - Add proper error handling
   - Implement loading states
   - Add accessibility features

4. **Build & Distribution**
   - EAS Build configuration
   - App store assets (icons, screenshots)
   - TestFlight/Play Store setup

---

## 🚀 Development Phases

### **Phase 1: Expo App Foundation** (2-3 hours)
```
Tasks:
1. Create app.json configuration
2. Create App.js with navigation
3. Install all Expo dependencies
4. Setup navigation structure
5. Add splash screen & app icon
6. Test basic navigation flow
```

**Deliverables:**
- ✅ Running Expo app with navigation
- ✅ All screens accessible
- ✅ Proper app branding

---

### **Phase 2: QR Scanner Implementation** (1-2 hours)
```
Tasks:
1. Implement expo-camera for QR scanning
2. Add camera permissions handling
3. Real-time QR code detection
4. Manual child selection fallback
5. Child info display after scan
```

**Deliverables:**
- ✅ Working QR scanner
- ✅ Child data loaded from database
- ✅ Manual search interface

---

### **Phase 3: Vision Testing Screen** (2-3 hours)
```
Tasks:
1. Update VisionScreen to use React Native components
2. Implement optotype display (Tumbling E or Lea Symbols)
3. Add direction input buttons
4. Calculate symbol size based on viewing distance
5. Implement logMAR staircase algorithm UI
6. Show real-time feedback
7. Display final results
```

**Deliverables:**
- ✅ Interactive vision test
- ✅ Accurate symbol sizing
- ✅ Pass/fail determination
- ✅ Results saved to database

---

### **Phase 4: Hearing Testing Screen** (2-3 hours)
```
Tasks:
1. Implement expo-av for pure tone generation
2. Calibrate headphone volume levels
3. Play 1000 Hz, 2000 Hz, 4000 Hz @ 30 dB HL
4. Add "Yes/No" response buttons
5. Implement timeout logic
6. Show frequency progress
7. Display final results
```

**Deliverables:**
- ✅ Pure tone audiometry
- ✅ Proper timing/sequencing
- ✅ Pass/fail determination
- ✅ Headphone calibration

---

### **Phase 5: Data Management** (1-2 hours)
```
Tasks:
1. Complete ResultsScreen with all data
2. Implement edit/review functionality
3. Add referral reason selection
4. Show screening history
5. Bulk actions (delete, export)
```

**Deliverables:**
- ✅ Full results management
- ✅ Data review interface
- ✅ Referral tracking

---

### **Phase 6: Export & Sync** (2-3 hours)
```
Tasks:
1. Implement FHIR export to file
2. Implement HL7 export to file
3. Add CSV/Excel export
4. File sharing (email, USB, cloud)
5. Sync to admin portal API (future)
```

**Deliverables:**
- ✅ Multi-format exports
- ✅ File sharing capabilities
- ✅ Data portability

---

### **Phase 7: Build & Distribution** (2-3 hours)
```
Tasks:
1. Configure EAS Build
2. Create app icons (iOS + Android)
3. Create splash screens
4. Build APK/IPA
5. Test on physical devices
6. Submit to TestFlight/Play Store
```

**Deliverables:**
- ✅ Production-ready builds
- ✅ App store submissions
- ✅ Beta testing access

---

## 🛠️ Required Dependencies

### Install Command
```bash
cd /Users/spr/skidsgck/app
npx expo install expo-camera expo-av expo-file-system expo-sqlite
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install expo-splash-screen expo-status-bar
npm install zustand # State management
```

### Full Dependencies List
```json
{
  "dependencies": {
    "expo": "~50.0.14",
    "expo-camera": "latest",
    "expo-av": "latest", 
    "expo-file-system": "latest",
    "expo-sqlite": "^16.0.8",
    "expo-splash-screen": "latest",
    "expo-status-bar": "latest",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "react-native-screens": "latest",
    "react-native-safe-area-context": "latest",
    "react": "18.2.0",
    "react-native": "0.73.6",
    "jsqr": "^1.4.0",
    "uuid": "^9.0.1",
    "xlsx": "^0.18.5",
    "zustand": "^4.4.7"
  }
}
```

---

## 📐 App Architecture

### File Structure (Complete)
```
app/
├── App.js                    # Main entry point
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build config
│
├── assets/                   # App assets
│   ├── icon.png             # App icon (1024x1024)
│   ├── splash.png           # Splash screen
│   ├── adaptive-icon.png    # Android adaptive icon
│   └── optotypes/           # Vision test symbols
│       ├── tumbling-e/
│       └── lea-symbols/
│
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js  # Navigation setup
│   │
│   ├── screens/             # All UI screens
│   │   ├── HomeScreen.js
│   │   ├── QRScannerScreen.js
│   │   ├── VisionScreen.js
│   │   ├── HearingScreen.js
│   │   ├── ResultsScreen.js
│   │   └── ExportScreen.js
│   │
│   ├── services/            # Business logic (existing)
│   │   ├── visionEngine.js
│   │   ├── hearingEngine.js
│   │   ├── offlineDB.js
│   │   ├── fhirExport.js
│   │   ├── qrService.js
│   │   └── types.js
│   │
│   ├── components/          # Reusable components
│   │   ├── Button.js
│   │   ├── ChildCard.js
│   │   ├── ProgressBar.js
│   │   └── ResultCard.js
│   │
│   ├── store/               # State management
│   │   └── useScreeningStore.js
│   │
│   └── utils/               # Helper functions
│       ├── permissions.js
│       ├── calibration.js
│       └── validators.js
│
├── __tests__/               # Existing tests
└── package.json
```

---

## 🎨 Key Features

### 1. QR Code Scanning
- Real-time camera QR detection
- Decodes child roster data
- Falls back to manual search if QR fails
- Validates child data before proceeding

### 2. Vision Acuity Testing
- **Method:** logMAR staircase (QUEST algorithm)
- **Optotypes:** Tumbling E or Lea Symbols
- **Distance:** 4 meters (calibrated)
- **Pass Criteria:** logMAR ≤ 0.3 (20/40 Snellen)
- **Features:**
  - Adaptive symbol sizing
  - Crowding bars for younger children
  - Real-time feedback
  - Reversal tracking for accuracy

### 3. Hearing Screening
- **Method:** Play audiometry (pure tones)
- **Frequencies:** 1000 Hz, 2000 Hz, 4000 Hz
- **Intensity:** 30 dB HL
- **Pass Criteria:** Detects all 3 frequencies
- **Features:**
  - Headphone calibration database
  - Timeout detection (10s per tone)
  - Random presentation order
  - Ambient noise warnings

### 4. Offline Operation
- Full SQLite database
- Queue screening results
- Sync when network available
- No data loss

### 5. Data Export
- **FHIR R4:** Patient + Observations
- **HL7 v2.5:** MSH|PID|OBR|OBX format
- **CSV/Excel:** Bulk data export
- **PDF Reports:** Individual results (future)

---

## 📊 Testing Strategy

### Unit Tests (Existing)
- ✅ All service layer tested (Jest)
- ✅ Vision algorithm accuracy validated
- ✅ Hearing tone generation verified
- ✅ Database CRUD operations tested
- ✅ FHIR/HL7 export validated

### Integration Tests (New)
- Screen navigation flows
- Camera → QR → Vision → Hearing → Results
- Data persistence across app restarts
- Export functionality

### Device Testing
- iOS (iPhone 12+, iPad)
- Android (Samsung, Pixel)
- Tablet support
- Accessibility features (VoiceOver, TalkBack)

---

## 🚢 Deployment Process

### 1. EAS Build Setup
```bash
npm install -g eas-cli
eas login
eas build:configure
```

### 2. Build Commands
```bash
# iOS Development Build
eas build --platform ios --profile development

# Android Development Build  
eas build --platform android --profile development

# Production Builds
eas build --platform all --profile production
```

### 3. App Store Submission
- **iOS:** Submit via App Store Connect
- **Android:** Submit via Google Play Console
- **Required:** Privacy policy, screenshots, description

---

## 🎯 Success Criteria

✅ **Functional Requirements**
- [ ] App installs and launches on iOS/Android
- [ ] QR scanner identifies children accurately
- [ ] Vision test produces valid logMAR scores
- [ ] Hearing test detects tone responses
- [ ] Results save to SQLite database
- [ ] Data exports to FHIR/HL7 formats
- [ ] Offline mode works without network

✅ **Performance Requirements**
- [ ] App launch < 3 seconds
- [ ] QR scan response < 1 second
- [ ] Vision test completion < 2 minutes
- [ ] Hearing test completion < 3 minutes
- [ ] Database operations < 100ms

✅ **Quality Requirements**
- [ ] No crashes during normal operation
- [ ] All screens accessible (WCAG 2.1 AA)
- [ ] Works on 4-year-old devices
- [ ] Battery usage < 5%/hour
- [ ] < 100 MB app size

---

## 💰 Cost Estimates

### Development Time
- **Phase 1-7:** ~15-20 hours total
- **Testing & QA:** ~5 hours
- **App Store Prep:** ~3 hours
- **Total:** ~25-30 hours

### Costs
- **Expo EAS Build:** $29/month (optional, can use free tier)
- **Apple Developer:** $99/year (required for iOS)
- **Google Play:** $25 one-time (required for Android)

---

## 🚀 Next Steps - YOUR DECISION

### Option A: Build Complete Expo App Now
**Timeline:** 2-3 days  
**Deliverable:** Fully functional mobile app ready for app stores

**Tasks:**
1. Create Expo app structure
2. Implement all screens with Expo APIs
3. Add navigation and state management
4. Build and test on physical devices
5. Submit to app stores

### Option B: Enhance Admin Portal First
**Timeline:** 1-2 days  
**Deliverable:** Admin portal with more features

**Tasks:**
1. Add real-time dashboard
2. Implement reporting features
3. Build PDF export
4. Add user authentication
5. Deploy updates

### Option C: Focus on Data Integration
**Timeline:** 1 day  
**Deliverable:** Admin portal ↔ Mobile app sync

**Tasks:**
1. Build API for data sync
2. Implement conflict resolution
3. Test bidirectional sync
4. Deploy sync service

---

## 🤔 Recommended Approach

**I recommend Option A** - Build the complete mobile app because:

1. ✅ **Service layer is 90% done** - Core algorithms already work
2. ✅ **Clear requirements** - We know exactly what to build
3. ✅ **High value** - This is where the actual screening happens
4. ✅ **Independent** - Can be built/tested standalone
5. ✅ **Real-world ready** - Can start pilot testing immediately

The admin portal is already deployed and functional. Now we need the **actual screening tool** that healthcare workers will use in the field.

---

## 📝 Action Items

**Ready to proceed? Tell me:**

1. **Which option do you want?** (A, B, or C)
2. **Do you have:**
   - Physical iOS/Android device for testing?
   - Apple Developer account?
   - Google Play Developer account?
3. **Any specific requirements?**
   - Custom branding/logos?
   - Specific optotype symbols?
   - Language preferences?
   - Additional tests (color vision, stereopsis)?

**I'm ready to start building as soon as you give the green light! 🚀**
