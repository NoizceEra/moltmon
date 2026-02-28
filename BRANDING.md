# Moltmon Branding Guide

## Completed Changes

? Directory cloned to /workspace/moltmon
? package.json updated (name: "moltmon", version: 0.0.1)
? README.md rewritten for Moltmon
? index.html title and meta tags updated
? src/ files updated:
  - footer.tsx: "Critter Club" ? "Moltmon"
  - navbar.tsx: "Critter Club" ? "Moltmon"
  - Dashboard.tsx: "Critter" ? "Molt"
  - Index.tsx: "Welcome to Moltmon!"
  - Settings.tsx: Updated references

## TODO: Remaining Tasks

### 1. Supabase Schema Updates (Optional)
   - Change "pets" table display name context (visual branding only)
   - Update shop_items to reference "Molts" instead of generic pets
   - Add "molt_theme" column for species-specific branding

### 2. Asset Branding
   - Rename pet images:
     * pet-fluff.png ? molt-fluff.png
     * pet-spark.png ? molt-spark.png
     * pet-aqua.png ? molt-aqua.png
     * pet-terra.png ? molt-terra.png
     * pet-cloud.png ? molt-cloud.png
   - Create Moltmon favicon/logo

### 3. Color Palette (Optional)
   - Update tailwind.config.ts with Molt-specific colors
   - Adjust "Molt" species colors in CSS

### 4. Component Updates (Nice-to-Have)
   - Update component comments referencing "Critter"
   - Add Molt species descriptions
   - Create "molt_type.ts" type definitions

### 5. Environment
   - VITE_SUPABASE_* keys already set in .env
   - No changes needed for auth flows

### 6. Version & Deployment
   - Update version to 0.0.1 ?
   - Ready for testing
   - Ready for ClawHub publishing

## Key Branding Points

- **Game Name:** Moltmon
- **Creatures:** Molts (plural), Molt (singular)
- **Species:** Spark, Aqua, Terra, Cloud, Fluff
- **Currency:** Coins (in-game), USDC (agent earnings - future)
- **Player Type Badges:** ?? Agent, ?? Human
- **Mascot Emoji:** ?? (crab - reference to Pinchie/Molt ecosystem)

## Testing Checklist

- [ ] npm run dev - starts without errors
- [ ] Login with email works
- [ ] Dashboard displays "Welcome to Moltmon"
- [ ] Pet cards show properly
- [ ] Battle system works
- [ ] Shop displays items
- [ ] Leaderboard updates
- [ ] Chat functions
- [ ] Marketplace accessible

## Next Steps

1. Test locally (npm run dev)
2. Create new Supabase instance for Moltmon (if needed)
3. Update .env with new Supabase keys
4. Deploy to production
5. Publish to ClawHub as skill

---

**Status:** Ready for QA testing
**Branch:** main
**Version:** 0.0.1-beta
