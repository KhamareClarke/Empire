# Phase 3 — Multi-repo config

## 1. Create /empire/empire.config.json with all repo paths

**Done.** The config lives at `empire/empire.config.json` and lists all 8 repos (paths relative to empire root):

| id               | path              | name               |
|------------------|-------------------|--------------------|
| khamareclarke    | khamareclarke.com | KhamareClarke.com (sovereign) |
| omniwtms         | omniwtms          | Omni WTMS          |
| myapproved       | myapproved        | MyApproved         |
| adstarter        | adstarter         | AdStarter          |
| seoinforce       | seoinforce        | SEO Inforce        |
| identitymarketing| identitymarketing | Identity Marketing |
| leveragejournal  | leveragejournal   | Leverage Journal   |
| leverageacademy  | leverageacademy   | Leverage Academy   |

Also set: `sovereign`, `globalSkillsPath`, `sharedBridgePath`, `env`.

---

## 2. Register repos in orchestration engine

Repos are registered by being listed in `empire.config.json`. The orchestration engine (empire CLI) reads this file for the `status` command and any future commands that run per-repo.

No separate registration step — the config **is** the registry.

---

## 3. Verify tool status shows 8 active repos

From the empire root:

```bash
empire status
# or
tool status
```

Expected output:

- **Empire root:** path to your empire folder  
- **Repos: 8**  
- One line per repo with status **OK**  
- Message: **All repos accessible from /empire.**

If any repo shows **MISSING**, fix that repo’s path or junction under `/empire`.
