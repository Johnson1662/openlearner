$artifactTargets = @(
  ".next",
  ".pytest_cache",
  "__pycache__",
  "backend\__pycache__",
  "backend\api\__pycache__",
  "backend\agent\__pycache__",
  "backend\database\__pycache__",
  "backend\knowledge\__pycache__",
  "backend\services\__pycache__",
  "backend\tests\__pycache__",
  "backend\modules"
)

foreach ($relativePath in $artifactTargets) {
  $fullPath = Join-Path $PSScriptRoot "..\$relativePath"
  if (Test-Path $fullPath) {
    Remove-Item -LiteralPath $fullPath -Recurse -Force
    Write-Host "Removed: $relativePath"
  }
}

 $legacyEmptyDirs = @(
  "app",
  "components",
  "lib",
  "data",
  "types"
)

foreach ($relativePath in $legacyEmptyDirs) {
  $fullPath = Join-Path $PSScriptRoot "..\$relativePath"
  if ((Test-Path $fullPath) -and ((Get-ChildItem -LiteralPath $fullPath -Force | Measure-Object).Count -eq 0)) {
    Remove-Item -LiteralPath $fullPath -Recurse -Force
    Write-Host "Removed empty legacy dir: $relativePath"
  }
}

Write-Host "Artifact cleanup complete."
