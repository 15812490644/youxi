# Triage Labels

`triage` 使用五个 canonical roles。本项目是 local markdown tracker，没有 label 系统，因此 **role 直接写进 issue 文件顶部附近的 `Status:` 行**——见 `issue-tracker.md` 的 Conventions。

| Role | 本项目写法 | Meaning |
| --- | --- | --- |
| `needs-triage` | `Status: needs-triage` | Maintainer needs to evaluate this issue |
| `needs-info` | `Status: needs-info` | Waiting on reporter for more information |
| `ready-for-agent` | `Status: ready-for-agent` | Fully specified, ready for an AFK agent |
| `ready-for-human` | `Status: ready-for-human` | Requires human implementation |
| `wontfix` | `Status: wontfix` | Will not be actioned |

当某个 skill 提到 role（例如 “apply the AFK-ready triage label”）时，写入此表左侧的 role 字符串到 `Status:` 行。

## 与 `tickets/` 现有状态的衔接

`tickets/` 下 11 个文件已经声明 `Status: open` / `Blocked by: NN`。两者不是同一套东西：

- `Status: open` —— 队列状态，表示还没被领走。等价于 `ready-for-agent`（这些 ticket 由 `/to-tickets` 产出，本身就是 agent-ready，**不要**再拿去 `/triage`）
- `Status: claimed` —— 已被某个 session 领走，正在实现
- `Status: resolved` —— 已实现并通过验收

开工前把 `open` 改成 **`claimed`**，完成时改成 **`resolved`**，并追加 `## Answer`。只有外部涌入的 bug report 或 feature request 才走 `/triage` 的五个 roles。
