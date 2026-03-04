# Phase 2 — Verify global skills symlink in each repo
$empireRoot = if ($env:EMPIRE_ROOT) { $env:EMPIRE_ROOT } else { Join-Path $PSScriptRoot ".." }
$configPath = Join-Path $empireRoot "empire.config.json"
if (-not (Test-Path $configPath)) { Write-Error "empire.config.json not found"; exit 1 }
$config = Get-Content $configPath | ConvertFrom-Json
$globalSkills = if ($env:GLOBAL_SKILLS) { $env:GLOBAL_SKILLS } else { Join-Path $env:USERPROFILE ".khamare-clarke\global-skills" }

Write-Host "Global skills dir: $globalSkills"
Write-Host "Exists: $(Test-Path $globalSkills)"
Write-Host ""

foreach ($repo in $config.repos) {
  $skillsPath = Join-Path (Join-Path $empireRoot $repo.path) ".agents" | Join-Path -ChildPath "skills"
  $exists = Test-Path $skillsPath
  $count = 0
  if ($exists) { $count = (Get-ChildItem $skillsPath -Directory -ErrorAction SilentlyContinue | Measure-Object).Count }
  $status = if ($exists -and $count -gt 0) { "OK" } else { "MISSING" }
  $id = $repo.id.PadRight(18)
  Write-Host "  $id .agents/skills exists=$exists skills_count=$count  $status"
}

Write-Host ""
Write-Host "Symlink verified when each repo shows skills_count > 0."
