# Installed Agent Skills

`skill/` 下的 **25 个 skill 全部必须安装**，一个都不能少。这份清单是 `scripts/verify-setup.js` 的校验基线：少装、装错目录、`SKILL.md` frontmatter 缺失，都会让它退出码非 0。

每个 skill 的触发条件写在它自己 `SKILL.md` 的 frontmatter 里，**此处不重述**——那是 single source of truth。这里的每一行只回答两件事：它装在哪，它在 flow 的哪一站。

## 路由

不知道该用哪个 skill 时，先问 **`/ask-matt`**。它是本仓库所有 skills 的路由器，不需要记住下面任何一行。

## engineering（18）

| Skill | 路径 | 在 flow 中的位置 |
|---|---|---|
| `ask-matt` | `skill/engineering/ask-matt/` | 路由器。不确定用哪个 skill 或 flow 时先问它 |
| `setup-matt-pocock-skills` | `skill/engineering/setup-matt-pocock-skills/` | 前置。首次运行 engineering flow 前配置 tracker / labels / docs 布局 |
| `grill-with-docs` | `skill/engineering/grill-with-docs/` | main flow 1。访谈打磨想法，产出 `docs/` 痕迹 |
| `to-spec` | `skill/engineering/to-spec/` | main flow 3。把 thread 收束成 spec |
| `to-tickets` | `skill/engineering/to-tickets/` | main flow 3。把 spec 拆成声明 blocking edges 的 tracer-bullet tickets |
| `implement` | `skill/engineering/implement/` | main flow 3。每个 ticket 一次，内部驱动 `tdd` |
| `tdd` | `skill/engineering/tdd/` | `implement` 内部。一次一个 red-green slice |
| `code-review` | `skill/engineering/code-review/` | `implement` 收尾。Standards + Spec 双轴 review |
| `triage` | `skill/engineering/triage/` | on-ramp。外部涌入的 bugs / requests 推进到 agent-ready |
| `diagnosing-bugs` | `skill/engineering/diagnosing-bugs/` | on-ramp。难缠 bug 的诊断循环 |
| `wayfinder` | `skill/engineering/wayfinder/` | on-ramp。一个 session 装不下的巨大模糊 effort |
| `improve-codebase-architecture` | `skill/engineering/improve-codebase-architecture/` | codebase health。找 deepening opportunities |
| `codebase-design` | `skill/engineering/codebase-design/` | vocabulary layer。深模块的 shape |
| `domain-modeling` | `skill/engineering/domain-modeling/` | vocabulary layer。domain language 与 ADR |
| `prototype` | `skill/engineering/prototype/` | main flow 2 的绕行。用 throwaway code 回答设计问题 |
| `research` | `skill/engineering/research/` | standalone。委托给 background agent 的调研 |
| `resolving-merge-conflicts` | `skill/engineering/resolving-merge-conflicts/` | standalone。按 intent 逐个 hunk 解决 |
| `wizard` | `skill/engineering/wizard/` | standalone。只有 human 能完成的步骤 |

## productivity（7）

| Skill | 路径 | 在 flow 中的位置 |
|---|---|---|
| `handoff` | `skill/productivity/handoff/` | phase boundary。写便携 markdown 交给新 harness / 新目录 / 同事 |
| `grilling` | `skill/productivity/grilling/` | 访谈 primitive。`grill-with-docs` 与 `grill-me` 共用 |
| `grill-me` | `skill/productivity/grill-me/` | standalone。不在 repo 里时的 stateless 访谈 |
| `to-questionnaire` | `skill/productivity/to-questionnaire/` | standalone。答案在别人脑子里时 |
| `wait-what` | `skill/productivity/wait-what/` | standalone。消息没落地时的纠正 |
| `teach` | `skill/productivity/teach/` | standalone。跨 session 学一个概念 |
| `writing-for-agents` | `skill/productivity/writing-for-agents/` | 编写本仓库任何 agent 文档时的 reference |

## 本项目的固定用法

| 场景 | 走哪条 |
|---|---|
| 第一次接手本包 | `setup-matt-pocock-skills`（已跑过，配置在 `docs/agents/`）→ `ask-matt` |
| 实现 `tickets/NN` | 一次 `implement`（内含 `tdd`），收尾 `code-review`，然后 `/clear` 再开下一个 |
| 命名拿不准 | `domain-modeling`，读 `docs/GLOSSARY.md` 第七节禁区 |
| 改 `docs/` 下任何一份 | `writing-for-agents` |
| 中途要换 harness / 换目录 / 交给同事 | `handoff` |
