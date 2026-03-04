# Phase 1 — Install orchestration engine

Install **once** (globally on server or locally for dev).

## Install

From the empire root (e.g. `/empire` or `ALL PROJECTS/empire`):

```bash
cd /empire
npm install
npm link
```

- **`npm link`** makes the `empire` and `tool` commands available globally on this machine.
- On a server without global install: use `node bin/empire.js` or `npx empire-os` from the empire folder.

## Verify

```bash
tool --version
# or
empire --version
# → 1.0.0

tool help
# or
empire help
# → usage and commands
```

## Confirm access to all repos from /empire

```bash
empire status
# or
tool status
```

This checks that all 8 repos in `empire.config.json` exist under `/empire`. You should see 8 lines with `OK` and the message: **All repos accessible from /empire.**

If any show `MISSING`, fix the path or junction for that repo.
