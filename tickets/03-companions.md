# 03 · 伙伴系统：6 种伙伴 + 队伍跟随 + 尾部消耗 + 摧毁地形

Status: open
Blocked by: 02

## 目标

让「伙伴」这个核心概念成立：收集时加在队伍尾部，触发时从尾部消耗，且**触发即摧毁该格地形**（ADR-0018 把伙伴从「挡伤害的消耗品」重新定义为「开路的铲子」）。

## 涉及模块

`companions.js`（6 种定义、被动触发判定、尾部消耗）、`state.js`（`party` / `armorLayer`）、`models.js`（6 种造型）、`render3d.js`（跟随与触发表现）

## 验收（必须可观测）

1. 收集后加在队伍**尾部**，`armorLayer`（队伍长度）+1
2. 六种触发条件各自生效且**全部是被动的**，玩家永远不能主动释放：
   - `dragon` 进入 `volcano` → 安全通过 + 该格变 `grass`
   - `phoenix` 进入 `glacier` → 安全通过 + 该格变 `grass`（减速一起消除）
   - `fox` 进入 `thorn` → 安全通过 + 该格变 `grass`
   - `panda` 碰撞 `ironGolem` → 秒杀铁怪 + 获得 `shield`
   - `turtle` 受到 `archer` 远程攻击 → 抵挡该次 + 反杀该弓箭手
   - `wolf` 击杀怪物且 `baseHP < 3` → 消耗 1 只，`baseHP` +1
3. **从尾部消耗**——最后收集的最先被用掉，收集顺序即策略
4. 触发即离队，不可回收
5. 满血时 `wolf` 不触发也不消耗（ADR-0012）
6. 收集分：普通 10（`fox` `turtle` `wolf`）、稀有 ×2 = 20（`dragon` `phoenix` `panda`）
7. `eventLog` 记录 `companion_collect` / `companion_consume` / `terrain_destroy`
8. 无头测试能覆盖整条链：踩火山 → 队尾的龙被消耗 → 那一格变 `grass`

## 约束

- 伙伴一律被动、效果一次性、从尾部消耗、不占技能键（L0-E）
- 想做「点击释放」的东西 → 那是技能，不是伙伴（判据：玩家能不能主动放）
- 造型用基础几何体拼装，大眼睛高饱和，禁止 emoji（ADR-0013）
- 效果类型优先复用 `GLOSSARY.md` 第九节枚举（`DESTROY_TERRAIN` / `KILL_AND_SHIELD` / `COUNTER_KILL` / `HEAL_ON_KILL`）

## Comments
