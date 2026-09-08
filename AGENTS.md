# AGENTS.md

《冒险家与伙伴》—— 变种贪吃蛇 3D 版。纯前端静态站点，双击 `index.html` 即可运行，运行时零外部请求。

## 接手时先做两件事

1. `bash scripts/install-skills.sh` —— 把 `skill/` 下 **25 个 skill 全部**装进当前 harness
2. `node scripts/verify-setup.js` —— 退出码 0 才继续；非 0 就按它打印的修法补齐

不确定下一步该用哪个 skill 时，问 **`/ask-matt`**。它是本仓库所有 skills 的路由器，不需要记住任何一条 flow。

## 四份文档，按触发条件取用

| 触发条件 | 取哪份 |
|---|---|
| 要给任何东西命名、写标识符 | `docs/GLOSSARY.md` |
| 开始实现一个模块 | `docs/PROMPT.md` |
| 要改动既有规则或数值 | `docs/ADR.md` |
| 任何一次代码改动之前 | `docs/RULES.md` |

四份是分开的：`PROMPT.md` 只写是什么，`ADR.md` 只写为什么。这条分离是 ADR-0014 的刻意设计——约束力落在文件上，不依赖任何 harness、任何 session、任何插件。

**术语必须与 `GLOSSARY.md` 严格一致**（`baseHP` / `armorLayer` / `recoil` / `knockback` / `lavaTitan` ...）。写 `hp`、`health`、`snake`、`enemy` 视为违规。

## 三条焊死的线

正向目标只有一句：**往旁边加东西，别动已经在那儿的东西。**

- **L0-A** 已有实体的数值不许改。想调强度就新增一个替代品，或先申请
- **L0-C** 受击结算顺序（护盾 → 消耗伙伴 → 扣 `baseHP`）不可调换
- **L0-2** 不许引入构建工具。项目必须保持「双击即跑」

完整红线表（L0-1 ~ L0-10、L0-A ~ L0-E）见 `docs/RULES.md` §1。

## 实现循环

每个 ticket 一次 **`/implement`**（内部驱动 `/tdd`，收尾 `/code-review`），ticket 之间 **`/clear`**。ticket 顺序即依赖顺序，见 `tickets/`。

---

## Agent skills

### Issue tracker

local markdown。spec 与 issues 作为文件存放在 `.scratch/<feature-slug>/` 下；本项目的实现队列即 `tickets/`，每个 ticket 一个文件，带 `Status:` 与 `Blocked by:` 行。See `docs/agents/issue-tracker.md`.

### Triage labels

五个 canonical roles，写进 issue 文件顶部附近的 `Status:` 行：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`。See `docs/agents/triage-labels.md`.

### Domain docs

single-context。`CONTEXT.md` 的角色由 `docs/GLOSSARY.md` 承担（整体印象在 `docs/PROMPT.md` §0），ADR 不拆单文件、集中存放于 `docs/ADR.md`。See `docs/agents/domain.md`.

### Installed skills

`skill/` 下 25 个 skill 全部安装（18 engineering + 7 productivity），清单与各自在 flow 中的位置见 `docs/agents/skills-installed.md`——它也是 `scripts/verify-setup.js` 的校验基线。
