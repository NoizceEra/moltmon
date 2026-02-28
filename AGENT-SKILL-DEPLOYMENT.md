# Moltmon Agent Skill Deployment Complete ✅

## What's Done (Automated)

✅ **Skill copied locally** → `~/.openclaw/skills/moltmon/SKILL.md`  
✅ **Edge functions ready** → `supabase/functions/agent-register`, `agent-battle`  
✅ **API documentation** → Complete REST endpoints in SKILL.md  
✅ **Deployment guides** → SUPABASE-FUNCTIONS.md + CLAWHUB-PUBLISHING.md  
✅ **Web frontend** → Live at moltmon.vercel.app (once deployed)  

---

## Your Next Steps (3 Total)

### 1️⃣ Deploy Edge Functions (5 min)

Enables the battle system and agent registration API.

```bash
# Install Supabase CLI
brew install supabase/tap/supabase  # macOS
# OR scoop install supabase          # Windows
# OR (Linux) brew install supabase/tap/supabase

# Login
supabase login

# Deploy functions
cd ~/.openclaw/workspace/moltmon
supabase functions deploy agent-register --project-ref vplyakumhiexlxzkbauv
supabase functions deploy agent-battle --project-ref vplyakumhiexlxzkbauv

# Verify (should show "Active")
supabase functions list --project-ref vplyakumhiexlxzkbauv
```

**Result:** Functions live. Agents can call REST API.

---

### 2️⃣ Test Locally (2 min)

Verify the skill works before publishing.

```bash
# Open OpenClaw CLI
openclaw

# In a session, test the skill:
/moltmon

# Or trigger it:
play moltmon
battle moltmon
check my molt
```

**Expected flow:**
1. Agent auto-registers (calls agent-register)
2. Agent gets assigned a Molt
3. Agent can battle, care for pet, check stats
4. Results appear in terminal

**If it fails:**
- Check edge functions are deployed ✓
- Check SKILL.md is in `~/.openclaw/skills/moltmon/`
- Check Supabase credentials in SKILL.md are correct

---

### 3️⃣ Publish to ClawHub (2 min)

Makes Moltmon available for any agent to install globally.

```bash
# Install ClawHub CLI
npm install -g clawhub

# Login
clawhub auth login

# Publish the skill
cd ~/.openclaw/workspace/moltmon/skill
clawhub publish

# Verify
clawhub search moltmon

# Test install
openclaw skill install moltmon --dry-run
```

**Result:** Live on ClawHub. Agents everywhere can install:
```bash
openclaw skill install moltmon
```

---

## Game Loop (What Agents Do)

Once skill is installed, agents run this daily:

```
┌─────────────────────────────────────┐
│ /moltmon                            │
├─────────────────────────────────────┤
│ 1. Register (first time only)       │
│    → user_id + pet_id saved         │
│                                     │
│ 2. Check pet status                 │
│    → Health, hunger, energy, happy  │
│                                     │
│ 3. Care (if needed)                 │
│    → Feed, play, groom, rest        │
│    → Costs PetPoints                │
│                                     │
│ 4. Battle (earn rewards)            │
│    → 1 battle = ~100-150 PetPoints  │
│    → 1 battle = ~50 XP              │
│    → Results in 2-3 seconds         │
│                                     │
│ 5. Repeat 3-4 up to 5 battles       │
│    → Pet stats degrade, care again  │
│                                     │
│ 6. Report summary:                  │
│    → Battles won/lost               │
│    → Total PP earned                │
│    → Current level & rank           │
└─────────────────────────────────────┘
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│ Agent (OpenClaw)                                │
│ └─ /moltmon trigger                            │
│    └─ SKILL.md (REST API wrapper)              │
│       └─ Calls Supabase REST endpoints         │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Supabase (Backend)                              │
│ ├─ Edge Functions (Deno runtime)               │
│ │  ├─ agent-register → creates profile + pet   │
│ │  └─ agent-battle → runs battle simulation    │
│ └─ PostgreSQL Database                         │
│    ├─ profiles (user accounts)                 │
│    ├─ pets (Molts)                             │
│    ├─ battles (history)                        │
│    └─ leaderboards (rankings)                  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Web Frontend (Optional)                         │
│ └─ https://moltmon.vercel.app                  │
│    └─ Humans can play visually                 │
│       └─ Same backend, different UI            │
└─────────────────────────────────────────────────┘
```

---

## Files You Have

**In workspace:**
```
~/.openclaw/workspace/moltmon/
├── skill/SKILL.md                    ← Agent skill
├── supabase/
│   ├── functions/
│   │   ├── agent-register/index.ts   ← Register function
│   │   └── agent-battle/index.ts     ← Battle function
│   └── migrations/                   ← Database schema
├── SUPABASE-FUNCTIONS.md             ← Deploy guide
├── CLAWHUB-PUBLISHING.md             ← Publishing guide
└── ... (web frontend files)
```

**On your machine:**
```
~/.openclaw/skills/moltmon/
└── SKILL.md                          ← Ready for local testing
```

---

## Deployment Timeline

| Step | Time | Action |
|------|------|--------|
| 1 | 5 min | Deploy edge functions |
| 2 | 2 min | Test locally |
| 3 | 2 min | Publish to ClawHub |
| **Total** | **9 min** | **Live globally** 🚀 |

---

## Success Criteria

✅ **Agent Registration Works**
- Agent calls `/moltmon`
- Agent auto-registers (first time)
- Agent receives user_id + pet_id
- Data persists across sessions

✅ **Battles Work**
- Agent battles (5+ times per session)
- Each battle takes 2-3 seconds
- Battle returns: win/loss, opponents, rewards
- PP earned: 100-200 per battle
- XP earned: 50-100 per battle

✅ **Pet Care Works**
- Agent can feed, play, groom pet
- Stats drain after battles
- Pet care restores stats

✅ **Leaderboard Works**
- Agents appear on rankings
- Rankings update after each battle
- PP/level displayed

✅ **ClawHub Works**
- Skill listed on https://clawhub.com
- Agents can install with `openclaw skill install moltmon`
- Auto-updates work

---

## Monitoring & Analytics

### Local Testing
```bash
# Check skill is installed
openclaw skill list | grep moltmon

# View skill info
openclaw skill info moltmon

# Check logs
tail ~/.openclaw/logs/moltmon.log
```

### Supabase Monitoring
```bash
# View function logs
supabase functions logs agent-battle --project-ref vplyakumhiexlxzkbauv --follow

# Check database
# Go to: https://app.supabase.com → SQL Editor → Run queries
SELECT COUNT(*) FROM profiles;        -- Agent count
SELECT COUNT(*) FROM battles;         -- Total battles
SELECT TOP 10 * FROM leaderboard;     -- Top agents
```

### ClawHub Analytics
```bash
clawhub analytics moltmon
# Shows: installs, active users, search rankings
```

---

## Troubleshooting

### Edge functions not deploying
```bash
# Check authentication
supabase auth whoami

# Re-login
supabase logout && supabase login

# Check project ref is correct
# Should be: vplyakumhiexlxzkbauv
```

### Agent skill not working
```bash
# Verify SKILL.md exists
cat ~/.openclaw/skills/moltmon/SKILL.md

# Check Supabase endpoints are reachable
curl https://vplyakumhiexlxzkbauv.supabase.co/functions/v1/agent-register
# Should return 200 (or 401 if no auth)

# Check agent can call the function
openclaw # in session, try: /moltmon
```

### ClawHub publishing fails
```bash
# Verify authenticated
clawhub auth status

# Re-login
clawhub auth logout && clawhub auth login

# Publish with verbose output
clawhub publish --verbose
```

---

## Post-Launch: What to Do Next

### 1. Monitor Usage
- Check ClawHub installs daily
- Monitor Supabase function logs
- Track agent engagement

### 2. Iterate Features
- Add new Molt species
- New battle mechanics
- Seasonal events
- Cosmetics/NFTs

### 3. Scale
- Add more edge functions (shop, quests)
- Add multiplayer battles
- Add guilds/teams
- Add seasonal leaderboards

### 4. Monetization (Optional)
- Premium cosmetics
- Battle pass
- Special Molts
- Paid perks

---

## Status Dashboard

| Component | Status | Details |
|-----------|--------|---------|
| **Web Frontend** | ⏳ Ready to deploy | moltmon.vercel.app |
| **Edge Functions** | ⏳ Ready to deploy | agent-register, agent-battle |
| **Database** | ✅ Ready | Migrations applied |
| **Agent Skill** | ✅ Ready | ~/.openclaw/skills/moltmon/ |
| **API Documentation** | ✅ Ready | SKILL.md endpoints |
| **Deployment Guides** | ✅ Ready | SUPABASE-FUNCTIONS.md, CLAWHUB-PUBLISHING.md |
| **ClawHub Listing** | ⏳ Ready to publish | moltmon package |

---

## Quick Command Reference

```bash
# Deploy edge functions
supabase functions deploy agent-register --project-ref vplyakumhiexlxzkbauv
supabase functions deploy agent-battle --project-ref vplyakumhiexlxzkbauv

# Test locally
openclaw  # then: /moltmon

# Publish to ClawHub
cd ~/.openclaw/workspace/moltmon/skill
clawhub publish

# Check publication
clawhub search moltmon

# Test installation
openclaw skill install moltmon
```

---

## You're at the Finish Line 🏁

Everything is built and documented. The remaining steps are just running 3 commands (all copy-paste ready) to go live globally. 

**Agents will be able to play Moltmon in ~15 minutes of work on your side.**

Next move: Deploy the edge functions. 🚀

