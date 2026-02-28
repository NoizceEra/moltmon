# Moltmon Standalone Deployment Script
# Run this AFTER creating a new GitHub repo called "moltmon"

param(
    [string]$GitHubUsername = "",
    [switch]$CleanHistory = $false,
    [switch]$DeployVercel = $false
)

Write-Host "🦀 Moltmon Deployment Automation" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if in moltmon directory
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not in moltmon directory" -ForegroundColor Red
    Write-Host "Run this from: ~/.openclaw/workspace/moltmon" -ForegroundColor Yellow
    exit 1
}

# Get GitHub username if not provided
if (-not $GitHubUsername) {
    $GitHubUsername = Read-Host "Enter your GitHub username"
}

Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "  Username: $GitHubUsername"
Write-Host "  Repo: https://github.com/$GitHubUsername/moltmon"
Write-Host "  Clean History: $CleanHistory"
Write-Host ""

# Confirm
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔧 Step 1: Update Git Remote" -ForegroundColor Cyan

$newRemote = "https://github.com/$GitHubUsername/moltmon.git"
git remote set-url origin $newRemote
Write-Host "✓ Remote updated to: $newRemote" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Step 2: Prepare Repository" -ForegroundColor Cyan

if ($CleanHistory) {
    Write-Host "Using clean history (orphan branch)..."
    git checkout moltmon-clean
    git branch -D main -q
    git branch -M moltmon-clean main
    Write-Host "✓ Switched to clean history" -ForegroundColor Green
} else {
    Write-Host "Using existing history..."
    Write-Host "✓ Repository ready" -ForegroundColor Green
}

Write-Host ""
Write-Host "📤 Step 3: Push to GitHub" -ForegroundColor Cyan

git push -u origin main --force
Write-Host "✓ Pushed to GitHub" -ForegroundColor Green

Write-Host ""
Write-Host "✅ GitHub Setup Complete!" -ForegroundColor Green
Write-Host "   Repo: https://github.com/$GitHubUsername/moltmon" -ForegroundColor Cyan
Write-Host ""

# Vercel deployment prompt
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Go to: https://vercel.com/dashboard" -ForegroundColor Yellow
Write-Host "  2. Click: 'Add New' → 'Project'" -ForegroundColor Yellow
Write-Host "  3. Select: $GitHubUsername/moltmon" -ForegroundColor Yellow
Write-Host "  4. Add Environment Variables:" -ForegroundColor Yellow
Write-Host "     VITE_SUPABASE_PROJECT_ID=vplyakumhiexlxzkbauv" -ForegroundColor Yellow
Write-Host "     VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbHlha3VtaGlleGx4emtiYXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTM0ODIsImV4cCI6MjA3Nzg2OTQ4Mn0.rUMsdH7JySY2Xw6DBVTAX0rSDmNV_fLawQ3CvYIWby4" -ForegroundColor Yellow
Write-Host "     VITE_SUPABASE_URL=https://vplyakumhiexlxzkbauv.supabase.co" -ForegroundColor Yellow
Write-Host "  5. Click: 'Deploy'" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Site will be live in ~2 minutes: https://moltmon.vercel.app" -ForegroundColor Cyan
Write-Host ""

$deployNow = Read-Host "Deploy to Vercel CLI now? (requires 'vercel' installed) (y/n)"
if ($deployNow -eq "y") {
    Write-Host ""
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
    
    # Check if vercel CLI is installed
    $vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
    if (-not $vercelCmd) {
        Write-Host "⚠️  Vercel CLI not found. Install with: npm i -g vercel" -ForegroundColor Yellow
        Write-Host "   Then run: vercel --prod" -ForegroundColor Yellow
    } else {
        vercel --prod
        Write-Host "✓ Deployment initiated!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "   GitHub: https://github.com/$GitHubUsername/moltmon" -ForegroundColor Cyan
Write-Host "   Vercel: https://moltmon.vercel.app" -ForegroundColor Cyan
Write-Host ""
