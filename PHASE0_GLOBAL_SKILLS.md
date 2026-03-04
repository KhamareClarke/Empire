# Phase 2 — Global Skills System

## 1. Create shared skills directory (once)

**Linux/macOS:**
```bash
mkdir -p ~/.khamare-clarke/global-skills
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Path "$env:USERPROFILE\.khamare-clarke\global-skills" -Force
```

On this machine: **Done.** `C:\Users\FC\.khamare-clarke\global-skills` exists and is populated with the 29 Corey agents (copied from one repo).

---

## 2. For each repo: .agents + link to global-skills

**Linux/macOS:**
```bash
cd /empire/<repo>
mkdir -p .agents
ln -sf ~/.khamare-clarke/global-skills .agents/skills
```

**Windows (PowerShell, from empire root):** Use a junction (no admin required):
```powershell
$globalSkills = "$env:USERPROFILE\.khamare-clarke\global-skills"
# For each repo: create .agents, then junction .agents\skills -> $globalSkills
New-Item -ItemType Directory -Path ".agents" -Force
New-Item -ItemType Junction -Path ".agents\skills" -Target $globalSkills -Force
```

On this machine: **Done.** All 8 repos under `empire/` have `.agents` and `.agents/skills` as a junction to `~/.khamare-clarke/global-skills`.

---

## 3. Verify symlink exists

**Linux/macOS:** `ls -la .agents/skills` → should show the link target.

**Windows:** From empire folder:
```powershell
.\scripts\verify-global-skills.ps1
```
Each repo should show `skills_count > 0` (e.g. 29 skill folders).

Or manually:
```powershell
Get-ChildItem "C:\Users\FC\Desktop\ALL PROJECTS\empire\omniwtms\.agents\skills" | Measure-Object
# Count should be 29 (or 22 top-level entries)
```
