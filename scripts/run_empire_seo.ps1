# Empire OS — SEO runner (cron equivalent: 0 13 * * *)
$ErrorActionPreference = "Stop"
$EmpireRoot = if ($env:EMPIRE_ROOT) { $env:EMPIRE_ROOT } else { Join-Path $PSScriptRoot ".." }
$env:EMPIRE_ROOT = $EmpireRoot
Set-Location $EmpireRoot
if (Test-Path .env) { Get-Content .env | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process') } } }
Write-Host "[$(Get-Date -Format o)] Empire SEO run started"
& node bin/empire.js run seo --all
$ex = $LASTEXITCODE
if ($ex -ne 0) { & node scripts/push-report-cron.js "run_empire_seo failed" "Exit code $ex" 2>$null }
Write-Host "[$(Get-Date -Format o)] Empire SEO run finished (exit $ex)"
exit $ex
