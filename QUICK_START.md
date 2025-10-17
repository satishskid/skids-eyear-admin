# 🚀 QUICK START GUIDE - SKIDS EYEAR Mobile PWA

## For Developers

### Installation
```bash
cd mobile-pwa
npm install
```

### Development
```bash
npm run dev
# Opens at http://localhost:5177
```

### Build
```bash
npm run build
# Output: dist/ folder
```

### Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

---

## For Users

### Access the App
Open the PWA in your mobile browser (when deployed)

### Quick Workflow
1. **Home** → Enter screener info + import roster
2. **QR Scan** → Scan student QR or search manually
3. **Vision Test** → Follow Tumbling E directions
4. **Hearing Test** → Point to dog/bird/bell sounds
5. **Results** → View all screenings
6. **Export** → Download FHIR/HL7/CSV

---

## Export Formats

### FHIR R4
- Healthcare standard
- JSON Bundle format
- Patient + Observation resources
- EHR-compatible

### HL7 v2.5
- Legacy systems
- Pipe-delimited text
- ORU^R01 messages
- Lab interface compatible

### CSV
- Excel/Google Sheets
- All data in tabular format
- Easy analysis

---

## Key Features

✅ **Offline-First** - Works without internet  
✅ **QR Scanner** - Camera-based student ID  
✅ **Vision Test** - Tumbling E, logMAR algorithm  
✅ **Hearing Test** - Kid-friendly pictures (🐕🐦🔔)  
✅ **Results** - Comprehensive screening records  
✅ **Export** - Standards-compliant data export  

---

## URLs

- **Dev Server:** http://localhost:5177
- **Admin Portal:** https://skids-eyear-admin.netlify.app
- **GitHub:** https://github.com/satishskid/skids-eyear-admin

---

## Documentation

- `MOBILE_PWA_QUICKSTART.md` - Detailed user guide
- `MOBILE_PWA_STRATEGY.md` - Architecture & decisions
- `HEARING_TEST_GUIDE.md` - Clinical documentation
- `MOBILE_PWA_COMPLETION_REPORT.md` - Full project report

---

## Need Help?

1. Check the documentation files
2. Review the code comments
3. See sample data in `public/sample-roster.json`

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** October 17, 2025
