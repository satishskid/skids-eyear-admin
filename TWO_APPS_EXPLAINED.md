# 🏗️ Two-App System Explained

## Yes, there are TWO separate apps! 🎯

### 📱 **App 1: Mobile Screening PWA** (`mobile-pwa/`)
**Purpose:** Field screening application  
**Users:** School nurses, screeners  
**Status:** ✅ **DEPLOYED & LIVE** at https://skids-eyear-admin.netlify.app

**What it does:**
- Vision screening (Snellen, LEA charts)
- Hearing screening (audiometry tests)
- QR code student check-in
- Offline-first (works without internet)
- PWA (installable on phones/tablets)

---

### 🖥️ **App 2: Admin Portal** (`admin-portal/`)
**Purpose:** Central dashboard for data management  
**Users:** Administrators, health coordinators  
**Status:** ❌ **NOT DEPLOYED YET**

**What it does:**
- View all screening results
- Analytics & charts (Chart.js, Recharts)
- Student roster management
- Excel import/export
- Reports and insights

---

## 🔗 How They Connect

```
┌──────────────────┐          ┌──────────────────┐
│   Mobile PWA     │          │  Admin Portal    │
│  (Screening)     │          │  (Dashboard)     │
└────────┬─────────┘          └────────┬─────────┘
         │                             │
         │ 1. Store locally            │ 1. Store locally
         │    (IndexedDB)              │    (IndexedDB)
         │                             │
         │ 2. Sync when online         │ 2. Pull/Push data
         │                             │
         └────────────┬────────────────┘
                      │
                      ▼
              ┌──────────────────┐
              │  Backend API     │
              │  (Future/TBD)    │
              │  /api/sync/pull  │
              │  /api/sync/push  │
              └──────────────────┘
```

### Connection Flow:

**Screener → Admin:**
1. Screener conducts tests on **Mobile PWA**
2. Results saved to local **IndexedDB**
3. When online: **Sync to backend** via API
4. Admin Portal **pulls new results** from backend
5. Admin sees results in **dashboard**

**Admin → Screener:**
1. Admin imports student roster in **Admin Portal**
2. Roster saved and **pushed to backend**
3. Mobile PWA **pulls roster updates**
4. Screener sees new students for check-in

---

## ⚠️ Current Backend Status

**Problem:** The sync backend API **is NOT deployed yet!**

**What exists:**
- ✅ Mobile PWA has sync code (`indexedDB.js` with `sync_queue`)
- ✅ Admin Portal has sync service (`syncService.js`)
- ❌ No backend API to sync through

**What you need:**
- Deploy a backend API (Supabase, Firebase, or custom Node.js)
- Implement `/api/sync/pull` and `/api/sync/push` endpoints
- Connect both apps to the same backend

---

## 🚀 What's Actually Deployed?

**Currently LIVE:**
- ✅ **Mobile Screening PWA** at https://skids-eyear-admin.netlify.app
  - Works offline
  - Stores data locally
  - Cannot sync (no backend)

**Not Deployed:**
- ❌ **Admin Portal** - Needs separate Netlify site or configuration
- ❌ **Backend API** - No server yet for syncing data

---

## 💡 Quick Summary

| Feature | Mobile PWA | Admin Portal |
|---------|-----------|--------------|
| **Deployed?** | ✅ Yes | ❌ No |
| **URL** | https://skids-eyear-admin.netlify.app | None yet |
| **Purpose** | Conduct screenings | View analytics |
| **Users** | Nurses, screeners | Admins, coordinators |
| **Storage** | IndexedDB (local) | IndexedDB (local) |
| **Sync** | Ready (no backend) | Ready (no backend) |
| **Works Offline?** | ✅ Yes | ✅ Yes |

---

## 🎯 Next Steps to Connect Them

### 1. Deploy Admin Portal
```bash
# Create a second Netlify site for admin portal
cd admin-portal
npm install
npm run build
netlify deploy --prod
```

### 2. Set Up Backend (Recommended: Supabase)
```bash
# Create Supabase project
# Add tables: children, screening_results, sync_logs
# Create API endpoints: /api/sync/pull, /api/sync/push
```

### 3. Update Both Apps
```javascript
// In both mobile-pwa and admin-portal
const SYNC_API = 'https://your-backend.supabase.co/api/sync';
```

---

**Bottom Line:**  
Two separate apps, both working offline, ready to sync through a backend that doesn't exist yet! 🚀

---

**See also:**
- `DEPLOYMENT_SUCCESS.md` - Mobile PWA deployment details
- `ARCHITECTURE.md` - Full system architecture
- `netlify.toml` - Current deployment config (mobile-pwa only)
