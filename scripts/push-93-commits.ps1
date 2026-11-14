# ---------------------------------------------------------------
# Push MockMate to GitHub – 93 tiny commits (simplified script)
# ---------------------------------------------------------------

# ==== USER CONFIGURATION ==========================================
$GitHubUser = "Devkeerthi-code"   # GitHub username / org
$RepoName = "mockmate"          # repository name
# <-- replace the placeholder with your actual PAT (starts with ghp_)
# Use an environment variable instead of embedding the token:
$PatToken = $Env:GITHUB_PAT
if ($PatToken -eq "YOUR_PERSONAL_ACCESS_TOKEN") {
    Write-Error "Please replace YOUR_PERSONAL_ACCESS_TOKEN with a real GitHub PAT (repo scope)."
    exit 1
}
$RemoteName = "origin"
$BranchName = "main"

# ==== INTERNAL HELPERS ===========================================
function Log($msg) { Write-Host "[LOG] $msg" }

# ==== STEP 0 – initialise repo if needed =========================
if (-not (Test-Path ".git")) {
    Log "Initialising new git repo"
    git init
    git add .
    git commit -m "Initial commit – project scaffold"
}
else {
    Log "Git repository already exists"
    git add .
    if (git status --porcelain) {
        git commit -m "Add project files"
    }
}

# ==== STEP 1 – set remote (force replace) ========================
# Remove any existing remote with the same name (ignore errors)
git remote remove $RemoteName 2>$null
$remoteUrl = "https://$($GitHubUser):$($PatToken)@github.com/$($GitHubUser)/$RepoName.git"
Log "Adding remote $RemoteName"
git remote add $RemoteName $remoteUrl

# ==== STEP 2 – ensure branch exists (reset to start) =============
# -B creates (or resets) the branch to the current HEAD
Log "Checking out branch $BranchName"
git checkout -B $BranchName

# ==== STEP 3 – file that will receive tiny changes ===============
$logFile = "commit-log.txt"
if (-not (Test-Path $logFile)) {
    Set-Content -Path $logFile -Value "# MockMate commit log`n"
}

# ==== STEP 4 – make 93 tiny commits ==============================
$commitCount = 93
for ($i = 1; $i -le $commitCount; $i++) {
    $line = "$(Get-Date -Format o) - commit #$i"
    Add-Content -Path $logFile -Value $line
    git add $logFile
    git commit -m "Commit $i - tiny log entry"
    Log "Created commit $i of $commitCount"
}

# ==== STEP 5 – push everything ====================================
Log "Pushing $commitCount commits to GitHub (force-push)…"
# Ensure any remaining project files are tracked before final push
git add .
if (git status --porcelain) {
    git commit -m "Add all project files"
}

git push $RemoteName $BranchName --force
Log "Push complete."

# ==== OPTIONAL – clean PAT from remote URL =======================
# After a successful push you may want to hide the token:
# git remote set-url $RemoteName "https://github.com/$GitHubUser/$RepoName.git"
