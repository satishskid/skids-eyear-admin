# 📱 SKIDS EYEAR Mobile Screening PWA

**Progressive Web App for Vision & Hearing Screening**

## 🚀 Quick Start

### 1. Start the App
```bash
cd /Users/spr/skidsgck/mobile-pwa
npm run dev
```

App runs on: **http://localhost:5175**

### 2. Test the App

#### Step 1: Import Sample Roster
1. Open http://localhost:5175
2. Click **"📥 Import Student Roster"**
3. Select `/mobile-pwa/public/sample-roster.json`
4. You'll see "✅ Imported 10 children"

#### Step 2: Enter Your Info
1. Enter your name (e.g., "Dr. Smith")
2. Enter school code (e.g., "SKIDS01")

#### Step 3: Start Screening
1. Click **"📷 Start Screening"**
2. You'll see the student selection screen
3. **Option A:** Click "Start Camera" (camera permission required)
4. **Option B:** Use manual search - type a name (e.g., "Emma")
5. Click on a student to select them
6. Click **"Start Vision Test →"**

---

## 🎯 Current Status

### ✅ What's Working NOW
- ✅ **Home Screen** - Full statistics and navigation
- ✅ **Database** - IndexedDB with student roster
- ✅ **QR Scanner** - Camera + manual search
- ✅ **Student Selection** - Search and select students
- ✅ **Sample Data** - 10 test students included

### 🔨 What's Next (Coming Soon)
- ⏳ **Vision Test Screen** - Interactive logMAR test
- ⏳ **Hearing Test Screen** - Pure tone audiometry
- ⏳ **Results Screen** - View all screening results
- ⏳ **Export Screen** - FHIR/HL7/CSV export

---

## 📱 Features

### Progressive Web App (PWA)
- ✅ Works on **any device** with a browser
- ✅ **Add to home screen** for app-like experience
- ✅ **Offline support** via IndexedDB
- ✅ **No app store** required
- ✅ **Automatic updates** when deployed

### Student Management
- Import rosters (JSON format)
- Search by name or ID
- QR code scanning (with camera permission)
- Manual selection fallback

### Data Storage
- IndexedDB for offline storage
- Automatic sync queue for pending uploads
- Track synced/unsynced results

---

## 🛠️ Development

### File Structure
```
mobile-pwa/
├── public/
│   └── sample-roster.json      # Test data (10 students)
├── src/
│   ├── App.jsx                 # Main app router
│   ├── App.css                 # Global styles
│   ├── main.jsx                # Entry point
│   ├── screens/
│   │   ├── HomeScreen.jsx      # ✅ Complete
│   │   ├── QRScannerScreen.jsx # ✅ Complete
│   │   ├── VisionScreen.jsx    # ⏳ Coming soon
│   │   ├── HearingScreen.jsx   # ⏳ Coming soon
│   │   ├── ResultsScreen.jsx   # ⏳ Coming soon
│   │   └── ExportScreen.jsx    # ⏳ Coming soon
│   ├── services/
│   │   ├── indexedDB.js        # ✅ Complete
│   │   ├── visionEngine.js     # ✅ Ready (from app/)
│   │   ├── hearingEngine.js    # ✅ Ready (from app/)
│   │   ├── fhirExport.js       # ✅ Ready (from app/)
│   │   └── types.js            # ✅ Ready (from app/)
│   └── components/
│       └── (reusable UI components)
└── package.json
```

### Build for Production
```bash
npm run build
```

Output: `dist/` folder ready to deploy

### Deploy to Netlify
```bash
# Option 1: Manual
netlify deploy --prod --dir=dist

# Option 2: Git-based (automatic)
# Push to GitHub → Netlify auto-deploys
```

---

## 📊 Sample Roster Format

```json
[
  {
    "id": "STU001",
    "name": "Emma Johnson",
    "grade": "K",
    "date_of_birth": "2019-05-15",
    "school_code": "SKIDS01"
  }
]
```

**Required Fields:**
- `id` - Unique student ID
- `name` - Full name
- `grade` - Grade level (K-12)
- `date_of_birth` - YYYY-MM-DD format
- `school_code` - School identifier

---

## 🔧 Troubleshooting

### Camera Not Working?
- **Chrome:** Allow camera permission when prompted
- **Safari:** Settings → Safari → Camera → Allow
- **Fallback:** Use manual search instead

### No Students Found?
- Import the sample roster first: `public/sample-roster.json`
- Or create your own JSON file with student data

### Database Not Loading?
- Check browser console (F12) for errors
- IndexedDB is supported in all modern browsers
- Try clearing browser data and reloading

---

## 🎨 Customization

### Change Colors
Edit `src/App.css`:
```css
:root {
  --primary: #2563eb;  /* Your brand color */
  --success: #10b981;
  --danger: #ef4444;
}
```

### Change App Name
Edit `package.json` and `vite.config.js`:
```json
{
  "name": "your-screening-app",
  "manifest": {
    "name": "Your Screening Tool"
  }
}
```

---

## 📦 Dependencies

- **React 18** - UI framework
- **Vite** - Build tool
- **IndexedDB** - Offline database
- **jsQR** - QR code scanning
- **vite-plugin-pwa** - PWA support

---

## 🚀 Deployment

### Option 1: Netlify (Recommended)
```bash
cd mobile-pwa
npm run build
netlify deploy --prod --dir=dist
```

### Option 2: Vercel
```bash
npm run build
vercel --prod
```

### Option 3: GitHub Pages
```bash
npm run build
# Upload dist/ folder to gh-pages branch
```

---

## 📝 Next Steps

1. **Test the Current App**
   - Import sample roster
   - Try manual search
   - Test camera (if available)

2. **Build Vision Test**
   - Implement VisionScreen.jsx
   - Display Tumbling E symbols
   - Use visionEngine.js for algorithm

3. **Build Hearing Test**
   - Implement HearingScreen.jsx
   - Use Web Audio API for tones
   - Use hearingEngine.js for logic

4. **Add Results & Export**
   - Show screening history
   - Export to FHIR/HL7/CSV
   - Sync with admin portal

---

## 🆘 Support

**Issues?** Check:
1. Browser console (F12) for errors
2. Network tab to see API calls
3. Application tab → IndexedDB to see data

**Questions?** Review:
- `/MOBILE_PWA_STRATEGY.md` - Full strategy document
- `/ARCHITECTURE.md` - System architecture
- `/app/services/` - Core screening logic

---

**Status:** 🟢 **WORKING PROTOTYPE**  
**Progress:** 40% Complete  
**Next:** Build Vision & Hearing Test Screens
