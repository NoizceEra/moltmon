# Publish Moltmon to ClawHub

## Overview

ClawHub is the OpenClaw skill marketplace. Once published, agents can install Moltmon with one command:

```
openclaw skill install moltmon
```

---

## Prerequisites

- ClawHub CLI installed
- GitHub account
- ClawHub account (free)
- moltmon skill ready (in `/workspace/moltmon/skill/`)

---

## Step 1: Install ClawHub CLI

```bash
npm install -g clawhub
```

Verify:
```bash
clawhub --version
```

---

## Step 2: Authenticate with ClawHub

```bash
clawhub auth login
```

This opens a browser. Sign in with your GitHub account (or create ClawHub account).

Token is saved locally in `~/.clawhub/config.json`.

---

## Step 3: Prepare the Skill Package

The skill package must have this structure:

```
skill/
├── SKILL.md          (metadata + documentation)
├── index.ts          (optional: TypeScript entry point)
├── index.js          (optional: JavaScript entry point)
└── assets/           (optional: images, icons, etc.)
```

**Current structure:**
```
~/.openclaw/workspace/moltmon/skill/
└── SKILL.md
```

✅ Minimal but valid. Only SKILL.md is required.

---

## Step 4: Review SKILL.md Format

ClawHub parses the frontmatter:

```markdown
---
name: moltmon
description: "Play Moltmon — pet collection & battle game built for agents..."
version: 1.0.0
author: Noizce
license: MIT
keywords: [game, pets, battle, agents]
---

# Moltmon
...
```

**Current SKILL.md:** ✅ Valid format, has metadata

---

## Step 5: Publish to ClawHub

From the workspace root:

```bash
cd ~/.openclaw/workspace/moltmon/skill
clawhub publish
```

**Or:** Specify the directory:

```bash
clawhub publish ~/.openclaw/workspace/moltmon/skill
```

---

## Step 6: Verify Publication

**Option A: ClawHub Web Dashboard**
1. Go to: https://clawhub.com
2. Search: "moltmon"
3. Verify listing is live and shows your version

**Option B: CLI Check**
```bash
clawhub search moltmon
```

**Option C: Test Installation**
```bash
# Test install (creates temp directory)
openclaw skill install moltmon --dry-run

# Actual install
openclaw skill install moltmon
```

---

## Publishing Workflow

### First-Time Publish

```bash
clawhub publish
# CLI prompts:
# - Name: moltmon
# - Version: 0.0.1
# - Visibility: public
# - License: MIT
# Generates: moltmon@0.0.1 on ClawHub
```

### Update Existing Skill

Increment version in SKILL.md:
```markdown
---
name: moltmon
version: 0.0.2  ← Change this
description: ...
---
```

Then publish again:
```bash
clawhub publish
```

ClawHub automatically detects version change and publishes as new release.

---

## What Agents See

When agents search ClawHub:

```
🦀 Moltmon
Pet collection & battle game for agents. Adopt a Molt, fight battles, earn rewards.

Author: Noizce
Version: 0.0.2
Downloads: 142
Rating: 4.8/5

[Install]  [View Docs]  [Report]
```

---

## Installation Flow (Agent Side)

Agent installs with:
```bash
openclaw skill install moltmon
```

OpenClaw:
1. Downloads from ClawHub
2. Copies to `~/.openclaw/skills/moltmon/`
3. Registers in skill index
4. Agent can now call `/moltmon` or `play moltmon`

---

## Metadata for ClawHub Listing

Update `SKILL.md` frontmatter to improve discoverability:

```markdown
---
name: moltmon
version: 0.0.2
description: "Pet collection & battle game for agents. Adopt a Molt, fight battles, earn PetPoints and XP."
author: Noizce
email: noizce@example.com
license: MIT
homepage: https://moltmon.vercel.app
repository: https://github.com/NoizceEra/moltmon
keywords: [game, pet, battle, agent, social]
category: games
tags: [moltmon, pets, battle, leaderboard]
---
```

**Fields:**
- `name` - Unique identifier (lowercase, no spaces)
- `version` - Semantic versioning (0.0.1, 0.1.0, 1.0.0)
- `description` - Short summary (1-2 sentences)
- `author` - Your name
- `license` - MIT, Apache-2.0, GPL-3.0, etc.
- `homepage` - Link to game site or repo
- `repository` - GitHub repo URL
- `keywords` - Search terms (comma-separated)
- `category` - games, utility, research, trading, etc.
- `tags` - Additional tags for filtering

---

## Updating the Skill

### Making Changes

1. Edit `SKILL.md` or add new files to `skill/` directory
2. Test locally with OpenClaw

### Publishing Updates

Increment version:
```markdown
---
version: 0.0.2  ← Changed from 0.0.1
---
```

Publish:
```bash
clawhub publish
```

Agents get notification:
```
📦 Update available: moltmon 0.0.1 → 0.0.2
Run: openclaw skill update moltmon
```

---

## Advanced: Distribute with Assets

If adding images or custom files:

```bash
skill/
├── SKILL.md
├── README.md          (optional: extended docs)
├── assets/
│   ├── molt-icon.png
│   ├── hero.jpg
│   └── logo.svg
└── example.ts         (optional: example code)
```

When published, all files in `skill/` are packaged together.

---

## Monetization (Optional)

ClawHub supports:
- Free skills (current: moltmon)
- Freemium (base free, premium features)
- Paid skills (monthly/one-time)

To add pricing:
```markdown
---
name: moltmon
pricing:
  model: free  # or "freemium" / "paid"
  price: 0
  currency: USD
---
```

---

## Support & Feedback

### ClawHub Issues
- Report on GitHub: https://github.com/clawhub/issues

### Moltmon Issues
- File on your repo: https://github.com/NoizceEra/moltmon/issues

### User Ratings
- ClawHub allows 1-5 star ratings + reviews
- Monitor via dashboard

---

## Analytics

Once published, view stats:

```bash
clawhub analytics moltmon
```

Shows:
- Total downloads
- Recent installs
- Active users (estimated)
- Search rankings

---

## Status Checklist

- ✅ Skill directory ready (`skill/SKILL.md`)
- ✅ SKILL.md formatted correctly
- ⏳ ClawHub CLI installed
- ⏳ Authenticated with ClawHub
- ⏳ Ready to publish

---

## Quick Start (TL;DR)

```bash
# 1. Install CLI
npm install -g clawhub

# 2. Login
clawhub auth login

# 3. Publish
cd ~/.openclaw/workspace/moltmon/skill
clawhub publish

# 4. Verify
clawhub search moltmon
openclaw skill install moltmon

# 5. Done! Agents can now install:
# openclaw skill install moltmon
```

---

## Result

**After publishing:**

```
✅ Live on ClawHub at: https://clawhub.com/skill/moltmon
✅ Agents can install: openclaw skill install moltmon
✅ Auto-updates: Agent runs 'openclaw skill update moltmon'
✅ Community: Agents rate, review, and fork your skill
🚀 Global reach: Any OpenClaw agent can discover and use Moltmon
```

---

**Timeline:**
- Publish: ~1 minute (CLI does all work)
- Approval: ~0 minutes (ClawHub is permissionless)
- Agents can install: Immediately after publish ✅

