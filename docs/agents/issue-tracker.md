# Issue tracker: Local Markdown

本项目的 spec 与 issues 作为 markdown 文件存放在 `.scratch/` 中。验收人不懂命令行、不使用 GitHub，因此不接 remote tracker。

## Conventions

- 每个 feature 一个目录：`.scratch/<feature-slug>/`
- Spec 是 `.scratch/<feature-slug>/spec.md`
- Implementation issues **每个 ticket 一个文件**，路径 `.scratch/<feature-slug>/issues/<NN>-<slug>.md`，从 `01` 开始编号。**绝不写成一个合并的 tickets 文件**
- 顶部附近用 `Status:` 行记录状态：`open` / `claimed` / `resolved`
- 顶部附近用 `Blocked by: NN, NN` 行声明 blocking edges。**每个被列出的 ticket 都 `resolved` 之后，本 ticket 才算 unblocked**
- Comments 与讨论追加到文件底部的 `## Comments` heading 下

## When a skill says "publish to the issue tracker"

在 `.scratch/<feature-slug>/` 下创建文件（必要时先建目录）。

## When a skill says "fetch the relevant ticket"

读取引用路径处的文件。

## 本项目的队列：`tickets/`

本包已经把 11 个 ticket 写好放在 `tickets/`，它就是 tracker 的 issues 目录。路径映射：

| 约定路径 | 本项目实际路径 |
|---|---|
| `.scratch/<feature-slug>/spec.md` | `spec.md`（包根） |
| `.scratch/<feature-slug>/issues/NN-<slug>.md` | `tickets/NN-<slug>.md` |

新开 feature 时按约定写到 `.scratch/<feature-slug>/issues/` 下；继续本包的工作时直接用 `tickets/`。

## Working the queue

`/to-tickets` 已安装，但本包的 tickets 已由它产出，直接消费即可（**这些 ticket 已经是 agent-ready，不要再拿去 `/triage`**）：

1. 扫描 `tickets/` 中 `Status: open`、`Blocked by:` 所列的 ticket 全部 `resolved` 的文件，按编号第一个胜出
2. 开工前把该文件设为 `Status: claimed`
3. 每个 ticket 在**独立的 context window** 里实现；ticket 之间清空上下文
4. 完成后把结果追加到 `## Answer`，设 `Status: resolved`

Ticket 必须自包含——它的 context 在完成后可以整体丢弃，只留下磁盘上的文件作为痕迹。

## Wayfinding operations

供 `/wayfinder` 使用（单 session 装不下的 effort）：

- **Map**：`.scratch/<effort>/map.md`——Notes / Decisions-so-far / Fog body
- **Child ticket**：`.scratch/<effort>/issues/NN-<slug>.md`，`Type:` 行记录 `research`/`prototype`/`grilling`/`task`
- **Blocking / Frontier / Claim / Resolve**：同上，`Resolve` 时额外向 `map.md` 的 Decisions-so-far 追加一条 context pointer
