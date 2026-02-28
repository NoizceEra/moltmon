# Moltmon Deployment Guide

## ✅ Pre-Deployment Checklist

- ✅ Git repo initialized & commits pushed
- ✅ vercel.json configured
- ✅ .env.example created
- ✅ Supabase credentials set
- ✅ Build tested locally (`npm run build`)

**Status:** Ready for Vercel deployment

---

## 🚀 Deploy to Vercel (2 Minutes)

### Step 1: Go to Vercel Dashboard
https://vercel.com/dashboard

### Step 2: Create New Project

1. Click **"Add New..."** → **"Project"**
2. **Import Git Repository**
   - Select: `NoizceEra/Critter-Club` (this contains Moltmon)
   - Click **"Import"**

### Step 3: Configure Project

**Project Name:** `moltmon`

**Framework:** Vercel should auto-detect **Vite**

**Root Directory:** `.` (default)

**Build Command:** `npm run build` (auto-detected)

**Install Command:** `npm ci` (auto-detected)

### Step 4: Add Environment Variables

In the **Environment Variables** section, add these 3 variables:

```
VITE_SUPABASE_PROJECT_ID = vplyakumhiexlxzkbauv
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbHlha3VtaGlleGx4emtiYXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTM0ODIsImV4cCI6MjA3Nzg2OTQ4Mn0.rUMsdH7JySY2Xw6DBVTAX0rSDmNV_fLawQ3CvYIWby4
VITE_SUPABASE_URL = https://vplyakumhiexlxzkbauv.supabase.co
```

### Step 5: Deploy

Click **"Deploy"**

**That's it!** Vercel will:
- Clone the repo
- Install dependencies
- Run `npm run build`
- Deploy to `moltmon.vercel.app`

---

## 📊 Post-Deployment

### Live URLs

- **Production:** `https://moltmon.vercel.app`
- **Git Repo:** https://github.com/NoizceEra/Critter-Club (main branch)

### Next Steps

1. **Test the site:**
   - Visit https://moltmon.vercel.app
   - Sign up with test email
   - Adopt a Molt
   - Test battle/shop features

2. **Custom Domain (Optional):**
   - Settings → Domains
   - Add your custom domain
   - Update DNS records

3. **Continuous Deployment:**
   - Push changes to main branch
   - Vercel auto-deploys in ~2 minutes

4. **Logs & Monitoring:**
   - Dashboard → moltmon → Deployments
   - View build logs & runtime errors

---

## 🔄 Future: Separate Moltmon Repo

Currently deploying from `Critter-Club` repo. If you want a dedicated `moltmon` repo:

```bash
# Create new GitHub repo called "moltmon"
# Then locally:
cd ~/.openclaw/workspace/moltmon
git remote set-url origin https://github.com/NoizceEra/moltmon.git
git push origin main
```

Then reconnect Vercel to the new repo.

---

## 🐛 Troubleshooting

**Build fails:**
- Check `/dist` folder builds locally: `npm run build`
- Verify environment variables are set in Vercel dashboard

**Blank page:**
- Check browser console for errors (F12)
- Check Vercel deployment logs

**Auth not working:**
- Verify Supabase credentials are correct
- Check Supabase RLS policies allow anonymous signups

---

## ✉️ Deployed! 🎉

Your Molt game is now live on the internet.

Next: Agent skill wrapper (OpenClaw distribution)

---

**Deployment Date:** 2026-02-27
**Version:** 0.0.1-beta
**Status:** Live
