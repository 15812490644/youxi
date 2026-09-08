# START-HERE.md — 这个包怎么用（给人读的）

一个《冒险家与伙伴》3D 网页游戏的**完整任务包**。拿着它，换任何一个支持 skills 的 AI 都能开工。

---

## 启动提示词（复制即用）

把整个包交给执行方，然后把下面这段原样发过去：

````text
你是执行方。本目录是《冒险家与伙伴》3D 网页游戏的完整任务包。

第一步 · 装环境（不许跳过，不许假装装好了）：
1. bash scripts/install-skills.sh     —— 安装 skill/ 下全部 25 个 skill
2. node scripts/verify-setup.js       —— 必须退出码 0
   非 0 就按它打印的修法补齐；补齐之前不要写任何游戏代码。

第二步 · 读 RUN-ONCE.md，按它把游戏做出来。

执行纪律（RUN-ONCE.md 里有完整版，这里只列最容易跑偏的四条）：
- 一个 ticket 一个 session：/implement（内部驱动 /tdd）→ /code-review → git commit → /clear → 下一个
- 01-bootstrap 是 tracer bullet，先打通 file:// 下 three.js 能加载，再往下做
- 拿不准下一步用哪个 skill 就问 /ask-matt，别自己猜
- ticket 的 Status: 开工前改 claimed，完成后改 resolved 并追加 ## Answer

完成判据（全部满足才算做完）：
- 双击 index.html 能玩，控制台无报错，无任何外部网络请求
- node check.js 9 项全绿
- tickets/ 下 11 个 ticket 的 Status: 全部 resolved
- 至少 3 次 git commit，message 写明改了什么、为什么

做不了的功能明说并给替代方案。严禁静默降级（L0-5）。
````

一轮跑不完时，下一轮发这段续跑提示词：

````text
继续。先读 docs/GLOSSARY.md 与 docs/RULES.md，然后从 tickets/ 里第一个 Status 不是 resolved
的编号继续，先读该 ticket 文件再动手。这一轮结束在模块边界上，不要停在半个模块中间。
````

**用网页版 AI（不能上传文件、不能跑脚本）时**：改用 `RUN-ONCE-NO-SKILLS.md`。把它的全文粘进去，再附上 `docs/PROMPT.md` 与 `docs/GLOSSARY.md`——这两份缺一不可。它把 skill 的约束力全部翻译成纸质指令，不需要装任何东西，但会失去 `/implement` 的 ticket 循环与 `/code-review`，质量上限更低，是退路不是首选。

---

## 包里有什么

```
adventurer-party/
├── START-HERE.md            ← 你正在看的这份（给人读）
├── RUN-ONCE.md              ← ★给 AI 的任务书，所有纪律都写在里面
├── RUN-ONCE-NO-SKILLS.md    ← 装不了 skill 时的退路版本
├── AGENTS.md                ← 常驻指针：四份文档何时取、三条焊死的线
│
├── scripts/                 ← ★开工前先跑这两个
│   ├── install-skills.sh        安装 skill/ 下全部 25 个 skill（幂等）
│   └── verify-setup.js          校验安装完整性，退出码 0 才继续
│
├── skill/                   ← ★25 个 skill 原文，全部要装（不是参考资料）
│   ├── engineering/             18 个：ask-matt / implement / tdd / to-tickets ...
│   └── productivity/            7 个：handoff / grilling / writing-for-agents ...
│
├── docs/                    ← ★四份核心文档，缺一份 AI 就会出错
│   ├── PROMPT.md                规则、数值、模块划分、验收清单（不写为什么）
│   ├── RULES.md                 改动分级、红线、自检清单（唯一契约）
│   ├── GLOSSARY.md              术语与代码标识符，含命名禁区
│   ├── ADR.md                   18 条决策的「为什么」
│   └── agents/                  engineering skills 的仓库配置（见下）
│
├── spec.md                  ← 90 条 user stories + 测试策略
├── tickets/                 ← 01~11 实现队列（每个带 Status / Blocked by）
│
├── check.js                 ← ★机器校验脚本，做完后 node check.js 必须 9 项全绿
└── vendor/
    └── three.min.js         ← three.js r128 UMD（590K，本地文件，运行时零外部请求）
```

### 关于 `skill/`

**必须全装，一个都不能少。** 这不是可选项：

- `RUN-ONCE.md` 的执行流程就是 Matt Pocock 的 main flow——`/to-tickets` → 每 ticket 一次 `/implement`（内含 `/tdd`）→ `/code-review` → `/clear`。缺任何一个 skill，这条链路就断在缺的那一环
- `ask-matt` 是路由器。执行方不确定下一步时问它，而不是自己猜
- 安装后 `docs/agents/skills-installed.md` 是 25 个 skill 的清单与各自在 flow 中的位置

### 关于 `docs/agents/`

`setup-matt-pocock-skills` 已经跑过，配置写死在这里，执行方不需要重跑：

| 文件 | 内容 |
|---|---|
| `docs/agents/issue-tracker.md` | local markdown tracker 约定（`.scratch/` 与 `tickets/` 的映射） |
| `docs/agents/triage-labels.md` | 五个 canonical roles 如何落进 `Status:` 行 |
| `docs/agents/domain.md` | 四份文档如何扮演 `CONTEXT.md` 与 `docs/adr/` 的角色 |
| `docs/agents/skills-installed.md` | 25 个 skill 的清单与 flow 位置（校验基线） |

---

## 执行方会走哪条路

```
scripts/install-skills.sh  →  scripts/verify-setup.js  →  读 RUN-ONCE.md
                                                              │
                     ┌────────────────────────────────────────┘
                     ▼
        tickets/01  ──► /implement（内含 /tdd）──► /code-review ──► git commit
                     ▲                                              │
                     └────────────────── /clear ◄─────────────────┘
                                                      下一个 ticket
```

`01-bootstrap` 是 **tracer bullet**：`file://` 下 three.js 加载不通，后面 14 个模块全是白写，所以它必须先打通。

**推荐：一个 ticket 一个 session，中途不换会话地连续做完。** 反过来要求 AI「一条消息吐完 6000 行」不建议——多数模型单次输出上限 8k~64k tokens，写不完时最常见的应对是**偷偷砍功能**，正好撞上 L0-5 静默降级，是本项目最严重的违约。

---

## 三件必须盯住的事

1. **做完必须跑 `node check.js`**，9 项全绿才算完。它校验命名禁区、写死的魔法数字、ES modules 混入、外部请求、加载列表完整性等——这些靠 AI 自觉守不住（ADR-0015）
2. **不许静默降级**。做不了的功能必须明说并给替代方案，严禁用"看起来像但功能缺失"的东西顶替
3. **不许改数值**。所有数值已在 `docs/PROMPT.md` §5 定死，改动会让已有的手感记录全部作废

---

## 验收

做完后对照 `RUN-ONCE.md` 第 9 节的完成判据逐条打勾。然后**双击 `index.html`**——它必须能直接玩，不需要起服务器。
