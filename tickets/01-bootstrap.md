# 01 · Bootstrap：双击即跑的最小全链路（tracer bullet）

Status: open
Blocked by: —

## 目标

打通「双击 `index.html` → 一个方块冒险家在网格上被键盘操控 → 相机跟随」的最小全链路。

**这一条是整个项目的命门**：它同时验证 ADR-0008（three.js r128 UMD 在 `file://` 下能否加载——ES modules 会被 CORS 拦死，双击必白屏）与 ADR-0001 阶段一（运行时必须 60fps）。这条通不过，后面 14 个模块全是白写。

## 涉及模块

`vendor/three.min.js`、`index.html`、`config.js`、`state.js`、`grid.js`、`main.js`
配套：`check.js`（仓库根）、`test/`（无头测试入口）

## 验收（必须可观测，不接受「代码写完了」）

1. `file://` 双击打开能跑，控制台零报错，DevTools Network 面板**没有任何外部请求**
2. 方向键与 WASD 四向移动，**禁止 180° 直接反向**
3. 斜俯视相机跟随（`CAMERA_ANGLE: 55` / `CAMERA_DISTANCE: 18`），稳定 60fps
4. 主循环用固定步长累加器，逻辑步长 16.67ms；**逻辑更新不引用 `THREE`、不触碰 DOM**（这是 04 之后所有无头测试成立的前提）
5. `eventLog` 已埋点（ADR-0006 要求从第一版就埋，事后补的日志覆盖不到早期 bug）
6. `node check.js` 通过
7. `test/` 下的无头测试能跑通一条空场景——证明逻辑层确实可以脱离浏览器运行

## 约束

- 不得合并模块、不得引入构建工具、不得改写 git 历史（L0-1 / L0-2 / L0-3）
- 所有可调参数必须落在 `config.js`，含**新增的 `SEED`**（让地形与怪物生成可复现，测试才能稳定重放同一场景）
- 全局命名空间只有 `window.ADV`，禁止往 `window` 直接挂其它变量
- 测试文件放 `test/`，**不进 `js/`**——因此不参与 `index.html` 加载，不触发 `check.js` 第 6 项

## Comments
