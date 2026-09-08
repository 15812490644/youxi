# Domain Docs

Engineering skills 探索 codebase 时，应如何消费本项目的 domain documentation。

本配置由 `/setup-matt-pocock-skills` 产出，已写入 `AGENTS.md` 的 `## Agent skills` block；**25 个 skill 全部安装**，清单见 `docs/agents/skills-installed.md`。

## Before exploring, read these

本项目不采用 `CONTEXT.md` + `docs/adr/` 的默认布局，而是拆成了四份各司其职的文档（见 ADR-0014）。映射关系如下：

| 默认约定 | 本项目对应 |
|---|---|
| `CONTEXT.md`（glossary + domain language） | **`docs/GLOSSARY.md`** |
| `CONTEXT.md`（整体印象） | **`docs/PROMPT.md` §0**「一局游戏长什么样」 |
| `docs/adr/*.md` | **`docs/ADR.md`**（单文件，按 ADR-0001 ~ ADR-0018 顺序编号） |
| — | **`docs/RULES.md`** — 改动分级与强制动作，默认约定里没有对应物 |

- **先读 `docs/GLOSSARY.md`**，它定义了通用语言与代码标识符
- **再读 `docs/ADR.md`** 里你即将改动区域相关的条目；全部读完也不长
- **动手前读 `docs/RULES.md`**，它决定这次改动属于 L0 / L1 / L2

如果这些文件不存在，**静默继续**，不要标记缺失。

## Use the glossary's vocabulary

当输出命名某个 domain concept 时（issue title、ticket 描述、test name、代码标识符），使用 `docs/GLOSSARY.md` 中定义的 term。

命名禁区（`docs/GLOSSARY.md` 第七节）是硬约束，不是建议：`hp` / `health` / `life` → `baseHP`；`snake` / `player` / `hero` → `adventurer`；`enemy` / `mob` → `monster`；`stun` 与 `recoil` 不得互换。

如果你需要的概念还不在 glossary 里，这通常是信号：要么你在发明项目不用的语言（重新考虑），要么确实存在缺口（交给 `/domain-modeling`，并同步第九节效果类型枚举）。

## Flag ADR conflicts

如果输出与现有 ADR 矛盾，明确指出，而不是静默覆盖：

> _Contradicts ADR-0002 (一次做完全量功能) — but worth reopening because…_

ADR 里标注「已识别风险并接受」的条目（如 ADR-0010 的史莱姆威胁感、ADR-0018 的后期过安全）不要顺手「优化」掉——那是被显式接受过的代价。

## AI 自主新增

ADR-0016 赋予 AI 自主新增权（`to-spec` / `implement` 期间无需申请），对价是 L0-A ~ L0-E 五条红线与六件套。新增后**只更新 `docs/PROMPT.md` §9.3 内容总表**，不单独写报告。
