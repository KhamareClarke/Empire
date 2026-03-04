# Empire OS — Weekly report (cron equivalent: Sunday 18:00)
$ErrorActionPreference = "Stop"
$EmpireRoot = if ($env:EMPIRE_ROOT) { $env:EMPIRE_ROOT } else { Join-Path $PSScriptRoot ".." }
$env:EMPIRE_ROOT = $EmpireRoot
Set-Location $EmpireRoot
if (Test-Path .env) { Get-Content .env | ForEach-Object { if ($_ -match '^([^#=]+)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process') } } }
Write-Host "[$(Get-Date -Format o)] Empire weekly report started"
& node bin/empire.js run weekly-report --all
$ex = $LASTEXITCODE
if ($ex -ne 0) { & node scripts/push-report-cron.js "run_empire_weekly_report failed" "Exit code $ex" 2>$null }
Write-Host "[$(Get-Date -Format o)] Empire weekly report finished (exit $ex)"
exit $ex
