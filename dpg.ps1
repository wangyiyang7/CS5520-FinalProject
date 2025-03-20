# Save your current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch"

# List of all branches to process
$branches = @(
  "main",
  "edit-delete-like-verify-share-post-functionalities",
  "create-new-post",
  "post-details-page",
  "public-content-for-guest-users",
  "weather-api",
  "notificationSetting",
  "profile"
)

# For each branch, checkout, remove the folder, commit and push
foreach ($branch in $branches) {
  Write-Host "Processing branch: $branch"
  
  # Fetch and checkout the branch
  git fetch origin $branch
  git checkout $branch
  
  # Check if playground folder exists
  if (Test-Path "playground") {
    # Check if playground is in .gitignore
    $gitignoreContent = Get-Content .gitignore
    $playgroundInGitignore = $gitignoreContent -match "playground"
    
    if ($playgroundInGitignore) {
      # Temporarily remove from gitignore
      $gitignoreContent = $gitignoreContent | Where-Object { $_ -notmatch "playground" }
      $gitignoreContent | Set-Content .gitignore
      Write-Host "Temporarily removed playground from .gitignore"
    }
    
    # Remove the folder
    Remove-Item -Recurse -Force playground
    
    # Commit the change
    git add .
    git commit -m "Remove playground folder from repository"
    
    # Add playground back to gitignore if it was there
    if ($playgroundInGitignore) {
      Add-Content .gitignore "playground"
      git add .gitignore
      git commit -m "Re-add playground to .gitignore"
    }
    
    # Push to remote
    git push origin $branch
    
    Write-Host "Removed playground folder from $branch"
  } else {
    Write-Host "No playground folder found in $branch"
  }
}

# Return to your original branch
git checkout $currentBranch
Write-Host "Returned to branch: $currentBranch"