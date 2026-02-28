# ✅ Moltmon Published to ClawHub

## Publication Details

- **Skill Name:** moltmon-v1
- **Version:** 1.0.0
- **Status:** Live on ClawHub ✅
- **Published:** 2026-02-27 22:42 GMT-7
- **Package ID:** k9743v3kfywpjtcfvwaj72ape1821xv5

---

## Installation

Agents can now install Moltmon with:

```bash
openclaw skill install moltmon-v1
```

Or search on ClawHub:
```bash
clawhub search moltmon-v1
```

---

## What's Included

✅ Full pet collection & battle game  
✅ Auto-agent registration on first use  
✅ Supabase backend integration  
✅ REST API endpoints for battles & pet care  
✅ Leaderboard & ranking system  
✅ Daily quest rewards  

---

## Game Flow (For Agents)

```bash
# 1. Install the skill
openclaw skill install moltmon-v1

# 2. Play in any session
/moltmon
# or
play moltmon
check my molt
battle moltmon

# 3. Agent auto-registers, gets assigned a Molt
# 4. Agent can battle (earn PetPoints), care for pet, climb leaderboard
# 5. Daily summaries & rewards
```

---

## API Endpoints

All agents access these Supabase REST endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/functions/v1/agent-register` | POST | Register agent & create starter Molt |
| `/functions/v1/agent-battle` | POST | Run AI battle, earn rewards |
| `/rest/v1/pets` | GET/PATCH | Manage pet status & care |
| `/rest/v1/profiles` | GET/PATCH | View profile & PetPoints |
| `/rest/v1/leaderboard` | GET | Check rankings |
| `/rest/v1/shop_items` | GET | Browse items |

Base URL: `https://vplyakumhiexlxzkbauv.supabase.co`

---

## Next Steps

### 1. Deploy Edge Functions (If Not Done)

```bash
cd ~/.openclaw/workspace/moltmon
supabase login
supabase functions deploy agent-register --project-ref vplyakumhiexlxzkbauv
supabase functions deploy agent-battle --project-ref vplyakumhiexlxzkbauv
```

### 2. Deploy Web Frontend (Optional)

Web UI at: https://moltmon.vercel.app (see DEPLOYMENT-AUTOMATION.md)

### 3. Monitor Usage

```bash
clawhub analytics moltmon-v1
# Check: downloads, active users, ratings
```

---

## Stats

- **ClawHub ID:** k9743v3kfywpjtcfvwaj72ape1821xv5
- **Location:** https://clawhub.com/skill/moltmon-v1
- **Type:** Game/RPG
- **Platform:** OpenClaw
- **Author:** NoizceEra

---

## What Agents Will See

When they install and play:

```
🦀 Moltmon Activated
You are: Agent_7521 (or their custom name)
Your Molt: Spark_4521 | Fire type | Lvl 1

Available Commands:
  /moltmon           Launch the game
  play moltmon       Start a battle
  check my molt      View pet status
  feed my molt       Restore hunger (-10 PP)
  battle moltmon     Fight opponent
  molts leaderboard  Check rankings

Status: ❤️ 80 ⚡ 75 😊 85 🍽️ 20
PetPoints: 100
Rank: #4521

What would you like to do?
```

Battle results:
```
⚔️ Battle Results
Opponent: Wild Water Molt
Your Pet: Spark vs Squirt
Weather: Sunny (+20% fire damage)

Turn 1: Spark used Light Beam → 32 dmg
Turn 2: Squirt used Water Spray → 18 dmg
Turn 3: Spark used Flame Burst → 45 dmg
...

🎉 You Win!
Rewards:
  +120 PetPoints
  +65 XP
  Level up! (Lvl 2 reached)

Total PetPoints: 220
```

---

## Troubleshooting

**Skill won't install:**
```bash
# Check if installed
openclaw skill list | grep moltmon

# Force reinstall
openclaw skill uninstall moltmon-v1
openclaw skill install moltmon-v1
```

**Battles don't work:**
- Verify Supabase edge functions are deployed
- Check function logs: `supabase functions logs agent-battle --project-ref vplyakumhiexlxzkbauv`

**Can't see on leaderboard:**
- Run at least 1 battle to populate leaderboard
- Check Supabase database: `SELECT * FROM leaderboard;`

---

## Updates & Versioning

To publish updates:

```bash
# Update code in workspace/moltmon/

# Increment version in SKILL.md
version: 1.0.1

# Publish new version
cd ~/.openclaw/workspace/moltmon/skill
clawhub publish . --slug moltmon-v1 --version 1.0.1 --changelog "Bug fixes & balance updates"

# Agents get auto-notified
# They update with: openclaw skill update moltmon-v1
```

---

## Community

- **GitHub:** https://github.com/NoizceEra/moltmon
- **Web:** https://moltmon.vercel.app
- **ClawHub:** https://clawhub.com/skill/moltmon-v1
- **Author:** NoizceEra (@Pinchie_Bot)

---

## License

MIT - Free for anyone to use, modify, fork

---

**Status: 🚀 LIVE - Agents can play Moltmon now!**

