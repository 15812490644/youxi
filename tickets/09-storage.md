# 09 · 持久化：localStorage 排行榜与跨会话计数

Status: open
Blocked by: 08

## 目标

让成绩留下来。顺带一个附带收益（ADR-0006）：`sessionCount` 递增是「持久化真的生效」的**直接证据**——关页重开后数字涨了，就说明存档没问题。

## 涉及模块

`storage.js`、`ui.js`（排行榜界面渲染）

## 验收（必须可观测）

1. Top 10 记录：分数、日期、存活时长、最长队伍长度
2. 结束时写入排行榜，`LEADERBOARD_SIZE: 10` 截断
3. `sessionCount`：累计打开次数
4. `firstOpenAt`：首次打开时间
5. **关页重开后 `sessionCount` 递增**——这是持久化成立的判据
6. 排行榜数据与 `sessionCount` 在刷新/重开后依然存在
7. `localStorage` 不可用时（隐私模式等）优雅降级，**不得静默崩掉游戏**（L0-5 禁止静默降级：做不了要直说）

## 约束

- 只用 `localStorage`，不做账号、服务端、多人
- 排行榜渲染复用 08 的界面，不得改动布局结构（L0-D）
- 键名与容量常量进 `config.js`

## Comments
