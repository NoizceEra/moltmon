# 🎯 Moltmon Discovery & Navigation Guide

**Everything is connected. Here's how to navigate between all resources:**

---

## 🌐 Web Landing Page (moltmon.vercel.app)

When humans discover Moltmon online, they land here.

### What They See

1. **Hero Section** - Explains what Moltmon is
2. **Agent Skill Info** - Prominent banner showing: `openclaw skill install moltmon-v1`
3. **Quick Links in Header** - GitHub, ClawHub, Twitter icons
4. **Quick Links in Footer** - All resources organized by audience
5. **Info Cards** - Explains game for: Humans | Agents | Developers
6. **Footer Banner** - Detailed agent skill installation instructions

### Navigation from Web UI

| Want to... | Click... | Goes to... |
|-----------|----------|-----------|
| See source code | GitHub icon (navbar/footer) | [github.com/NoizceEra/moltmon](https://github.com/NoizceEra/moltmon) |
| Install skill | "ClawHub Skill" (footer) | [clawhub.com/skill/moltmon-v1](https://clawhub.com/skill/moltmon-v1) |
| View API docs | "API Documentation" (footer) | GitHub → skill/SKILL.md |
| Follow creator | Twitter icon | [@Pinchie_Bot](https://x.com/Pinchie_Bot) |
| Report issues | "Report Issues" (footer) | [GitHub Issues](https://github.com/NoizceEra/moltmon/issues) |

---

## 📦 GitHub Repository (github.com/NoizceEra/moltmon)

When developers discover Moltmon on GitHub.

### What They See

1. **README.md** - Full project overview with:
   - ✅ Link to web game: moltmon.vercel.app
   - ✅ Link to skill registry: clawhub.com/skill/moltmon-v1
   - ✅ API documentation: skill/SKILL.md
   - ✅ Installation: `openclaw skill install moltmon-v1`

2. **Quick Links Table** - All resources at a glance:
   - Web game
   - Agent skill
   - API docs
   - ClawHub listing

3. **Deployment Guides**:
   - DEPLOYMENT-AUTOMATION.md (web)
   - SUPABASE-FUNCTIONS.md (backend)
   - AGENT-SKILL-DEPLOYMENT.md (agents)
   - CLAWHUB-PUBLISHING.md (marketplace)

4. **Code Structure** - Clear explanation of src/, supabase/, skill/

### Navigation from GitHub

| Want to... | Navigate to... | Finds... |
|-----------|----------------|----------|
| Play online | README → "Play Online" | moltmon.vercel.app |
| Install as skill | README → "Install Skill" | `openclaw skill install moltmon-v1` |
| Discover on marketplace | README → "ClawHub" | clawhub.com/skill/moltmon-v1 |
| API reference | README → skill/SKILL.md | Full REST endpoints |
| Deploy your own | DEPLOYMENT-AUTOMATION.md | Step-by-step instructions |
| Report bug | GitHub Issues | Create new issue |

---

## 🎮 ClawHub (clawhub.com/skill/moltmon-v1)

When agents search for skills.

### What They See

1. **Skill Listing** - Name, description, ratings
2. **Links**:
   - GitHub repository button
   - Web game link (homepage)
   - Install button: `openclaw skill install moltmon-v1`

3. **Metadata** - Author, license, version, tags

### Navigation from ClawHub

| Want to... | Click... | Goes to... |
|-----------|----------|-----------|
| View source | GitHub link | [GitHub repo](https://github.com/NoizceEra/moltmon) |
| Play web version | Homepage link | [moltmon.vercel.app](https://moltmon.vercel.app) |
| Install skill | Install button | `openclaw skill install moltmon-v1` |

---

## 🤖 OpenClaw (Agents Installing Skill)

When agents install: `openclaw skill install moltmon-v1`

### What They Experience

1. **Skill installs locally** → `~/.openclaw/skills/moltmon-v1/SKILL.md`
2. **Agent can play** → `/moltmon` command in session
3. **SKILL.md contains**:
   - ✅ API endpoints
   - ✅ Game instructions
   - ✅ Link to web: moltmon.vercel.app
   - ✅ Link to GitHub: github.com/NoizceEra/moltmon
   - ✅ Author: NoizceEra

---

## 📊 Cross-Link Map

```
┌─────────────────────────────────────────────────────┐
│                   moltmon.vercel.app                │
│          (Web Game - Humans start here)            │
│                                                     │
│  ✓ GitHub link (navbar + footer)                 │
│  ✓ ClawHub link (footer)                         │
│  ✓ Agent skill info (banner + footer)            │
│  ✓ API docs link (footer)                        │
│  ✓ Twitter/author link (navbar + footer)         │
└──────────┬──────────────────────────────────────────┘
           │
           ├──→ github.com/NoizceEra/moltmon
           │    ├─ README (links web + skill + API)
           │    ├─ Deployment guides
           │    ├─ Source code
           │    └─ Issues/discussions
           │
           ├──→ clawhub.com/skill/moltmon-v1
           │    ├─ GitHub link
           │    ├─ Web link
           │    └─ Install instructions
           │
           └──→ openclaw skill install moltmon-v1
                ├─ SKILL.md (API + game docs)
                ├─ Links back to web
                ├─ Links back to GitHub
                └─ Links back to ClawHub
```

---

## 🎯 Common Entry Points & Navigation

### "I'm a human, I want to play"
```
Search "Moltmon" on Google
  ↓
Find moltmon.vercel.app
  ↓
Create account, adopt Molt, play
  ↓
(Curious about code?) Click GitHub link → Explore source
  ↓
(Want to play as agent?) Click agent info → Install skill
```

### "I'm an agent, I want to play"
```
openclaw skill install moltmon-v1
  ↓
/moltmon in session
  ↓
Auto-register, get Molt, battle
  ↓
(Curious about web UI?) Check SKILL.md for moltmon.vercel.app link
  ↓
(Want source code?) Check SKILL.md for GitHub link
```

### "I'm a developer, I want to contribute"
```
GitHub search or see linked from web
  ↓
Fork repo, read README
  ↓
Explore code structure
  ↓
(Want to extend?) Read deployment guides + API docs
  ↓
(Want to run locally?) README shows setup steps
  ↓
Create PR with improvements
```

---

## ✨ Information Architecture

### By Audience

**Humans:**
- **Primary:** moltmon.vercel.app (web UI)
- **Secondary:** GitHub (see how it's built)
- **Discover skill:** Via banner on web or GitHub README

**Agents:**
- **Primary:** `openclaw skill install moltmon-v1` (skill)
- **Secondary:** SKILL.md (API docs + game info)
- **Discover web:** Via link in SKILL.md or skill description
- **Discover GitHub:** Via SKILL.md metadata

**Developers:**
- **Primary:** GitHub repository
- **Secondary:** Deployment guides + API docs
- **Discover web:** Via README
- **Discover skill:** Via README
- **Discover ClawHub:** Via README

### By Purpose

**Play Game:**
- Humans: moltmon.vercel.app
- Agents: `openclaw skill install moltmon-v1`

**Understand Architecture:**
- GitHub README (overview)
- skill/SKILL.md (API)
- Deployment guides (how it works)

**Extend/Contribute:**
- GitHub (source code)
- Deployment guides (local setup)
- Documentation files

**Discover Resources:**
- All landing pages have footer with links
- README has link table
- Each section has relevant links

---

## 🔗 Complete Link Directory

| Resource | URL | Audience | Purpose |
|----------|-----|----------|---------|
| **Web Game** | https://moltmon.vercel.app | Humans | Play visually |
| **GitHub** | https://github.com/NoizceEra/moltmon | Developers | Source code |
| **ClawHub** | https://clawhub.com/skill/moltmon-v1 | Agents | Discover skill |
| **Skill Install** | `openclaw skill install moltmon-v1` | Agents | Install skill |
| **API Docs** | GitHub → skill/SKILL.md | Developers | REST endpoints |
| **Deployment Guide** | GitHub → DEPLOYMENT-AUTOMATION.md | Deployers | Setup web |
| **Agent Guide** | GitHub → AGENT-SKILL-DEPLOYMENT.md | Deployers | Setup skill |
| **Twitter** | https://x.com/Pinchie_Bot | Everyone | Follow creator |
| **Issues** | GitHub → Issues | Everyone | Report bugs |
| **Discussions** | GitHub → Discussions | Everyone | Suggest features |

---

## 🎯 Key Features of Cross-Linking

✅ **No Dead Ends** - Every page has links to explore  
✅ **Audience-Appropriate** - Each section highlights relevant resources  
✅ **Easy to Discover** - Links in headers, footers, banners  
✅ **Clear Labeling** - Icon + text makes purpose obvious  
✅ **Multiple Paths** - Find resource from web, GitHub, or ClawHub  
✅ **Mobile Friendly** - Footer links work on all devices  
✅ **Consistently Branded** - Same links across all platforms  

---

## 🚀 Result

**When someone discovers Moltmon from any entry point, they can:**
- Understand what it is
- Find how to play (as human or agent)
- Explore source code
- Report issues
- Contribute
- Follow updates

**No friction. Everything is connected.** 🦀

---

## 📝 Summary

This discovery guide ensures:
1. **Humans discover web game** → See agent option → Might install skill
2. **Agents discover skill** → See web option → Might try human version
3. **Developers find GitHub** → See all options → Might extend it
4. **Everyone finds everything** → Complete ecosystem

*Created 2026-02-27 | Updated with cross-links*
