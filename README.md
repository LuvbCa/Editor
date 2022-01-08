# Nathene Editor | NE

![Nathene Banner](./docs/images/banner.png)

---

## Name origin

- **N-** for Nyx:
  - dark theme
  - goddess of the night -> [Nyx in greek mythology](https://en.wikipedia.org/wiki/Nyx)
- **-athene** for Athena:
  - goddess of the wisdom, intelligence -> [Athena in greek mythology](https://en.wikipedia.org/wiki/Athena)
  - Athene is the german name of Athena -> [LuvbCa](https://github.com/LuvbCa) is german
- **Editor**: because its only a editor right now
  - implementation of Plugins in work

---

## Installation instructions

### Developing setup

> ⚠️: Only **developing** environment, no building environment set-up

- Step 1 - Installation of **dependencies**:

  - run `pnpm install` in top level directory

- Step 2 - run **Runtime**:

  1. `cd ./runtime`
  2. `node ./dist/index.js`
     - arguments:
       - `-sl` || `--startLocal`
         > starts all local server defined in `./runtime/config.json`
       - `-speci` || `--startSpecific` type1,type2,type3...
         > [type](./runtime/types.ts) from the `interface Server` <br> type of server must be local!

---

### Building setup

> **🚧UNDER CONSTRUCTION🚧**
