# Empire OS — Create Windows scheduled tasks so data runs automatically and dashboard stays updated.
# Run once (PowerShell as Administrator recommended for Task Scheduler):
#   cd "C:\Users\FC\Desktop\ALL PROJECTS\empire"
#   .\scripts\schedule-empire-tasks.ps1
#
# Tasks created:
#   Empire-Leads       Daily 09:00
#   Empire-SEO         Daily 13:00
#   Empire-Health      Daily 18:00
#   Empire-WeeklyReport Sunday 18:00
#   Empire-Monitoring  Every 15 min

$EmpireRoot = if ($env:EMPIRE_ROOT) { $env:EMPIRE_ROOT } else { Split-Path $PSScriptRoot -Parent }
$Node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $Node) { $Node = "node" }

$actions = @(
  @{ Name = "Empire-Leads";       Script = "run_empire_leads.ps1";  Schedule = "Daily"; Time = "09:00" },
  @{ Name = "Empire-SEO";         Script = "run_empire_seo.ps1";    Schedule = "Daily"; Time = "13:00" },
  @{ Name = "Empire-Health";      Script = "run_empire_health.ps1"; Schedule = "Daily"; Time = "18:00" },
  @{ Name = "Empire-WeeklyReport"; Script = "run_empire_weekly_report.ps1"; Schedule = "Weekly"; Time = "18:00"; Day = "Sunday" },
  @{ Name = "Empire-Monitoring";  Script = "run_empire_monitoring.js"; Schedule = "Interval"; Minutes = 15 }
)

foreach ($a in $actions) {
  $taskName = $a.Name
  $exists = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  if ($exists) { Unregister-ScheduledTask -TaskName $taskName -Confirm:$false }

  if ($a.Script -match "\.ps1$") {
    $arg = "-NoProfile -ExecutionPolicy Bypass -File `"$EmpireRoot\scripts\$($a.Script)`""
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $arg -WorkingDirectory $EmpireRoot
  } else {
    $arg = "`"$EmpireRoot\scripts\$($a.Script)`""
    $action = New-ScheduledTaskAction -Execute $Node -Argument $arg -WorkingDirectory $EmpireRoot
  }

  $env:EMPIRE_ROOT = $EmpireRoot
  $trigger = switch ($a.Schedule) {
    "Daily"  { New-ScheduledTaskTrigger -Daily -At $a.Time }
    "Weekly" { New-ScheduledTaskTrigger -Weekly -DaysOfWeek $a.Day -At $a.Time }
    "Interval" { New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes $a.Minutes) -RepetitionDuration (New-TimeSpan -Days 9999) }
    default { New-ScheduledTaskTrigger -Daily -At "09:00" }
  }
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Empire OS automation" | Out-Null
  Write-Host "Created task: $taskName"
}

Write-Host ""
Write-Host "Done. Open Task Scheduler to see Empire-Leads, Empire-SEO, Empire-Health, Empire-WeeklyReport, Empire-Monitoring."
Write-Host "Dashboard will receive new data as these tasks run."
