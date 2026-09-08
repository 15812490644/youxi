# 04 · 受击结算：三级优先级 + baseHP / shield / stun / recoil

Status: open
Blocked by: 03

## 目标

把全项目**最容易写错的地方**单独做成一个 ticket。ADR-0003 点名它，GLOSSARY 第六节把顺序标为「不可调换」，RULES 把改它列为 L0-C 红线。单独做，是为了让它能被单独测。

## 涉及模块

`collision.js`（`resolve()` + 互伤）、`state.js`（`baseHP` / `armorLayer` / `shield` / `stun` / `recoil`）

## 验收（必须可观测）

1. **结算顺序 `shield → companion → baseHP` 不可调换**
2. 护盾是「临时一格血」而**不是无敌**：被 BOSS 撞（3 点）且无对应伙伴时，护盾吃 1 点、剩 2 点打在 `baseHP` 上
3. 护盾重复获得**不叠加**（永远一格），但重置 60 秒计时（`SHIELD_DURATION`）
4. 有对应伙伴时，剩余伤害**全部免除**（若来源是地形，额外摧毁该格）
5. `baseHP` 初始 3、上限 3，归 0 即结束
6. 两种 `stun` 时长分离且不得混用：
   - 撞自身队伍 → 3 秒（`STUN_DURATION`）
   - 踩危险地形（无对应伙伴）→ 1 秒（`TERRAIN_STUN_DURATION`）
7. `recoil` 是撞**怪物**后的 0.5 秒僵直，与 `stun` 是不同状态——命名禁区第七节明令不得互换
8. 护盾存续期间**不阻止** `stun` / `recoil` 触发（它只挡伤害，不挡失控）
9. 左上角 `baseHP` 与底部伙伴数是**两个独立数据源**，禁止共用同一个数字
10. 无头测试必须覆盖这条黄金回归：护盾 1 点 + 溢出打 `baseHP`

## 约束

- 改这个顺序属于 **L0-C 红线**，任何「优化」都必须先停下来申请
- `hp` / `health` / `life` 一律写作 `baseHP`（命名禁区）
- 伤害值、时长、点数全部读 `config.js`，不得写死

## Comments
