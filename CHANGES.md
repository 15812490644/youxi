# CHANGES.md — 本版相对上一版改了什么

按 `writing-for-agents` 的原则重做了一遍交接包，并补上 skill 安装流程。

## 修掉的 bug

| 问题 | 处理 |
|---|---|
| `START-HERE.md` 目录树写 `skills/`，实际目录是 `skill/` | 修正为 `skill/`，并补上 `scripts/` 与 `docs/agents/` 四份 |
| `AGENTS.md` 声明「未安装 `triage` / `to-tickets` / `tdd` / `code-review`」 | 全部改为已安装；`## Agent skills` 补齐 `### Triage labels` |
| `docs/agents/` 缺 `triage-labels.md` | 新增，`Status:` 行承载五个 canonical roles |
| `tickets/` 与 local-markdown tracker 约定的路径对不上 | 在 `issue-tracker.md` 里写明 `tickets/` 即 issues 队列及其映射 |

## 新增

| 文件 | 作用 |
|---|---|
| `scripts/install-skills.sh` | 一键安装 `skill/` 下全部 25 个 skill，幂等，自动探测 harness 的 skills 目录 |
| `scripts/verify-setup.js` | 校验安装完整性 + `docs/agents/` 齐全 + `AGENTS.md` block 在位，退出码 0 才继续 |
| `docs/agents/skills-installed.md` | 25 个 skill 的清单与各自在 flow 中的位置，也是校验基线 |
| `docs/agents/triage-labels.md` | 五个 canonical roles 如何落进 `Status:` 行 |
| `RUN-ONCE-NO-SKILLS.md` | 装不了 skill 时的退路版本（原 `RUN-ONCE.md` 的纸质指令版） |

## 改掉的立场

上一版写「skill 仅供参考，不装也能做」。这一版反过来：**25 个 skill 全部必须安装**，装不齐不许开工（§1 有完成判据，`verify-setup.js` 强制）。执行流程同步对齐 Matt Pocock 的 main flow——每 ticket 一次 `/implement`（内含 `/tdd`），`/code-review` 收尾，`/clear` 再开下一个。

## 按 writing-for-agents 做的修剪

- `AGENTS.md` 的必读表改为**触发条件前置**（命名 → `GLOSSARY.md`），删掉与 `RULES.md` 重复的红线细节，只留三条焊死的线 + 正向目标
- `RUN-ONCE.md` §5 红线表加了正向目标句；§6.2 / §6.3 的权威定义改为指向 `GLOSSARY.md`，正文只保留差异本身
- 每份新增文档都设了 single source of truth：skill 的 description 不复制进清单，只写「它在 flow 的哪一站」

技术内容（数值、规则、红线、ticket 顺序）**一字未动**。
