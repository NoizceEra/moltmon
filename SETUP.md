# Moltmon: Standalone Repo Setup & Deployment

**Goal:** Create `moltmon` as its own GitHub repo and deploy to Vercel

**Time:** ~5 minutes (mostly waiting for Vercel)

---

## Step 1: Create New GitHub Repo (2 min)

### Option A: Web UI (Easiest)
1. Go to https://github.com/new
2. **Repository name:** `moltmon`
3. **Description:** "Pet collection & battle game for agents & humans"
4. **Visibility:** Public
5. **Initialize with:** Nothing (we'll push existing code)
6. Click **"Create repository"**

### Option B: GitHub CLI
```bash
gh repo create moltmon --public --source=. --remote=origin --push
```

---

## Step 2: Prepare Local Repo for Standalone

**Run these commands:**

```bash
cd ~/.openclaw/workspace/moltmon

# Option 1: Use clean history (moltmon-clean branch)
git checkout moltmon-clean
git branch -D main
git branch -M moltmon-clean main

# Option 2: Keep existing history (current branch)
# (skip if using Option 1)
```

---

## Step 3: Push to New Repo

**After creating the GitHub repo, update the remote:**

```bash
cd ~/.openclaw/workspace/moltmon

# Update remote to new repo
git remote set-url origin https://github.com/YOUR_USERNAME/moltmon.git

# Push to new repo
git push -u origin main --force
```

**Replace `YOUR_USERNAME` with your GitHub username.**

---

## Step 4: Deploy to Vercel (3 min)

### Web UI (Recommended)

1. **Go to:** https://vercel.com/dashboard
2. **Click:** "Add New" → "Project"
3. **Search for:** `moltmon` repository
4. **Click:** "Import"
5. **Configure:**
   - Project Name: `moltmon`
   - Framework: Vite (auto-detected)
   - Root Directory: `.` (default)

6. **Add Environment Variables:**

```
VITE_SUPABASE_PROJECT_ID=vplyakumhiexlxzkbauv
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbHlha3VtaGlleGx4emtiYXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTM0ODIsImV4cCI6MjA3Nzg2OTQ4Mn0.rUMsdH7JySY2Xw6DBVTAX0rSDmNV_fLawQ3CvYIWby4
VITE_SUPABASE_URL=https://vplyakumhiexlxzkbauv.supabase.co
```

7. **Click:** "Deploy"

**Wait 2-3 minutes → Live on `https://moltmon.vercel.app`**

---

### CLI (Advanced)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from moltmon directory
cd ~/.openclaw/workspace/moltmon
vercel --prod

# Follow prompts, say "yes" to defaults
```

---

## Step 5: Test the Site

Once deployed, visit: **https://moltmon.vercel.app**

**Test checklist:**
- [ ] Landing page loads
- [ ] Sign up with email works
- [ ] Dashboard displays
- [ ] Adopt a Molt
- [ ] View pet details
- [ ] Battle system accessible
- [ ] Shop loads
- [ ] Leaderboard displays

---

## 📊 Result

| Aspect | Status |
|--------|--------|
| **GitHub Repo** | https://github.com/YOUR_USERNAME/moltmon |
| **Live Site** | https://moltmon.vercel.app |
| **Project Name** | moltmon |
| **Version** | 0.0.1 |
| **Branch** | main (clean history) |

---

## 🔄 Continuous Deployment

Once connected:
- **Push to main** → Vercel auto-deploys in ~2 minutes
- **View deployments** → Vercel dashboard
- **Rollback** → One click in Vercel

---

## 🚀 Next Steps (After Deployment)

### 1. OpenClaw Agent Skill
```bash
mkdir -p moltmon/skills/moltmon-agent
# Create SKILL.md + index.ts
```

### 2. ClawHub Publishing
```bash
clawhub publish moltmon/skills/moltmon-agent
```

### 3. Agent Auto-Enrollment
When agents install skill:
```
/moltmon-agent → Auto-creates account → Live game in 3s
```

---

## 📝 Files Ready

**In repo:**
- ✅ `vercel.json` - Deployment config
- ✅ `.env.example` - Template
- ✅ `DEPLOY.md` - This guide
- ✅ `README.md` - Project info
- ✅ Full moltmon branding

---

## ❓ Troubleshooting

**Vercel build fails:**
```bash
# Test locally first
npm install
npm run build

# Check dist folder created
ls dist/
```

**Auth not working:**
- Verify Supabase credentials in environment variables
- Check Supabase RLS policies

**Site is blank:**
- Check browser console (F12)
- View Vercel deployment logs

---

## ✅ Status

- ✅ Code ready
- ✅ Repo structure ready
- ⏳ Waiting for: GitHub repo creation
- ⏳ Waiting for: Vercel deployment

**You're 5 minutes away from a live game.** 🦀

---

**Commands to run (copy-paste ready):**

```bash
# 1. Update remote
cd ~/.openclaw/workspace/moltmon
git remote set-url origin https://github.com/YOUR_USERNAME/moltmon.git

# 2. Push clean history
git push -u origin main --force

# Result: https://github.com/YOUR_USERNAME/moltmon
# Then go to Vercel and deploy
```
