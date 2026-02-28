#!/bin/bash

# Moltmon Standalone Deployment Script (macOS/Linux)
# Run this AFTER creating a new GitHub repo called "moltmon"

echo "🦀 Moltmon Deployment Automation"
echo "================================"
echo ""

# Check if in moltmon directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in moltmon directory"
    echo "Run this from: ~/.openclaw/workspace/moltmon"
    exit 1
fi

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

echo ""
echo "📋 Configuration:"
echo "  Username: $GITHUB_USERNAME"
echo "  Repo: https://github.com/$GITHUB_USERNAME/moltmon"
echo ""

read -p "Continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🔧 Step 1: Update Git Remote"

NEW_REMOTE="https://github.com/$GITHUB_USERNAME/moltmon.git"
git remote set-url origin "$NEW_REMOTE"
echo "✓ Remote updated to: $NEW_REMOTE"

echo ""
echo "📦 Step 2: Push to GitHub"

git push -u origin main --force
echo "✓ Pushed to GitHub"

echo ""
echo "✅ GitHub Setup Complete!"
echo "   Repo: https://github.com/$GITHUB_USERNAME/moltmon"
echo ""

echo "🚀 Next Steps:"
echo "  1. Go to: https://vercel.com/dashboard"
echo "  2. Click: 'Add New' → 'Project'"
echo "  3. Select: $GITHUB_USERNAME/moltmon"
echo "  4. Add Environment Variables:"
echo "     VITE_SUPABASE_PROJECT_ID=vplyakumhiexlxzkbauv"
echo "     VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbHlha3VtaGlleGx4emtiYXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTM0ODIsImV4cCI6MjA3Nzg2OTQ4Mn0.rUMsdH7JySY2Xw6DBVTAX0rSDmNV_fLawQ3CvYIWby4"
echo "     VITE_SUPABASE_URL=https://vplyakumhiexlxzkbauv.supabase.co"
echo "  5. Click: 'Deploy'"
echo ""
echo "  Site will be live in ~2 minutes: https://moltmon.vercel.app"
echo ""

read -p "Deploy to Vercel CLI now? (requires 'vercel' installed) (y/n): " DEPLOY_NOW
if [ "$DEPLOY_NOW" = "y" ]; then
    echo ""
    echo "🚀 Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        echo "⚠️  Vercel CLI not found. Install with: npm i -g vercel"
        echo "   Then run: vercel --prod"
    else
        vercel --prod
        echo "✓ Deployment initiated!"
    fi
fi

echo ""
echo "🎉 Setup Complete!"
echo "   GitHub: https://github.com/$GITHUB_USERNAME/moltmon"
echo "   Vercel: https://moltmon.vercel.app"
echo ""
