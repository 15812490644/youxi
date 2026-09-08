#!/usr/bin/env node
'use strict';

/**
 * check.js — 硬性约束机器校验
 *
 * 用法：  node check.js
 * 退出码：0 = 通过（可能带警告）   1 = 阻断
 *
 * 依据：RULES.md §8 / ADR-0015「硬性规定配机器校验，不靠 AI 自觉」
 * 本脚本不进游戏运行时、不算构建工具，因此不违反 ADR-0008 与 L0-2。
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const JS_DIR = path.join(ROOT, 'js');
const INDEX_HTML = path.join(ROOT, 'index.html');
const CONFIG_JS = path.join(JS_DIR, 'config.js');
const DOCS = path.join(ROOT, 'docs');

const errors = [];
const warnings = [];
let passed = 0;

const ok = (m) => { passed++; console.log('  \u2713 ' + m); };
const fail = (m) => { errors.push(m); console.log('  \u2717 ' + m); };
const warn = (m) => { warnings.push(m); console.log('  \u26a0 ' + m); };
const skip = (m) => console.log('  \u2013 ' + m + '  (跳过)');

const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch (e) { return null; } };

function listJs() {
  try { return fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js')); }
  catch (e) { return null; }
}

/** 剥离注释与字符串常量，避免把注释里的词当成代码 */
function stripNonCode(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

console.log('\ncheck.js — 《冒险家与伙伴》硬性约束校验\n' + '='.repeat(46));

const jsFiles = listJs();
const jsSources = {};
if (jsFiles) {
  jsFiles.forEach((f) => { jsSources[f] = read(path.join(JS_DIR, f)) || ''; });
}

// ── 1. 文件未被合并 ────────────────────────────────────────────
console.log('\n[1/9] 文件未被合并');
if (!jsFiles) {
  skip('js/ 目录不存在');
} else {
  const EXPECTED_MODULES = 15;
  if (jsFiles.length < EXPECTED_MODULES) {
    fail(`js/ 下只有 ${jsFiles.length} 个模块，规格要求 ${EXPECTED_MODULES} 个（L0-1 禁止合并模块）`);
  } else {
    ok(`模块数量 ${jsFiles.length} ≥ ${EXPECTED_MODULES}`);
  }
  let tooLong = null;
  jsFiles.forEach((f) => {
    const lines = (jsSources[f].match(/\n/g) || []).length + 1;
    if (lines > 600 && !tooLong) tooLong = `${f}（${lines} 行）`;
  });
  if (tooLong) fail(`单个文件超过 600 行：${tooLong}`);
  else ok('没有超过 600 行的文件');
}

// ── 2. 无 ES modules 语法 ──────────────────────────────────────
console.log('\n[2/9] 无 ES modules 语法（file:// 下会被 CORS 拦截）');
if (!jsFiles) skip('js/ 目录不存在');
else {
  let hit = null;
  jsFiles.forEach((f) => {
    const code = stripNonCode(jsSources[f]);
    if (!hit) {
      if (/^\s*import\s/m.test(code) || /[^\w.]import\s*[({'"\s]/.test(code)) hit = `${f}: 出现 import`;
      else if (/^\s*export\s/m.test(code)) hit = `${f}: 出现 export`;
    }
  });
  if (hit) fail(hit + '（ADR-0008：必须用全局 ADV + 普通 script 标签）');
  else ok('未出现 import / export');
}

// ── 3. 无外部请求 ──────────────────────────────────────────────
console.log('\n[3/9] 运行时零外部请求');
if (!jsFiles) skip('js/ 目录不存在');
else {
  let hit = null;
  jsFiles.forEach((f) => {
    const code = stripNonCode(jsSources[f]);
    const m = code.match(/https?:\/\//);
    if (m && !hit) hit = f;
  });
  const html = read(INDEX_HTML);
  const htmlHit = html ? /https?:\/\//.test(stripNonCode(html)) : false;
  if (hit || htmlHit) fail(`出现外部 URL：${hit || 'index.html'}（L0-9 禁止任何外部请求）`);
  else ok('js/ 与 index.html 中均无 http(s):// 引用');
}

// ── 4. 无命名禁区词 ────────────────────────────────────────────
console.log('\n[4/9] 无命名禁区词（GLOSSARY.md 第七节）');
const BANNED = ['health', 'life', 'blood', 'snake', 'player', 'hero', 'enemy', 'mob'];
if (!jsFiles) skip('js/ 目录不存在');
else {
  let hit = null;
  jsFiles.forEach((f) => {
    const code = stripNonCode(jsSources[f]);
    BANNED.forEach((w) => {
      if (!hit && new RegExp('\\b' + w + '\\b', 'i').test(code)) hit = `${f}: ${w}`;
    });
    if (!hit && /\bhp\b/.test(code)) hit = `${f}: hp（应为 baseHP）`;
  });
  if (hit) fail(hit + ' —— 命名漂移视为违规（L0-4）');
  else ok('未出现命名禁区词');
}

// ── 5. 无写死的魔法数字 ────────────────────────────────────────
console.log('\n[5/9] 无写死的魔法数字（参数必须集中在 config.js）');
const configSrc = read(CONFIG_JS);
if (!jsFiles || !configSrc) {
  skip('js/config.js 未就绪');
} else {
  const keys = [...configSrc.matchAll(/^\s*([A-Z][A-Z0-9_]{2,})\s*:/gm)].map((m) => m[1]);
  const uniq = [...new Set(keys)];
  let hit = null;
  jsFiles.filter((f) => f !== 'config.js').forEach((f) => {
    const code = stripNonCode(jsSources[f]);
    uniq.forEach((k) => {
      if (!hit && new RegExp('\\b' + k + '\\s*[:=]\\s*-?\\d').test(code)) hit = `${f}: ${k} 被写死`;
    });
  });
  if (hit) fail(hit + '（L0-8 参数必须集中在 config.js）');
  else ok(`检查了 ${uniq.length} 个 config 参数名，业务代码无写死`);
}

// ── 6. index.html 加载列表完整 ─────────────────────────────────
console.log('\n[6/9] index.html 加载列表完整（顺序即依赖顺序）');
const html = read(INDEX_HTML);
if (!html || !jsFiles) {
  skip('index.html 或 js/ 未就绪');
} else {
  const missing = jsFiles.filter((f) => !html.includes(`js/${f}`));
  if (missing.length) fail(`未出现在加载列表：${missing.join(', ')}（漏一个就全局报错）`);
  else ok(`js/ 下 ${jsFiles.length} 个模块全部在加载列表中`);
  if (!html.includes('vendor/three.min.js')) fail('index.html 未加载 vendor/three.min.js');
  else ok('已加载本地 three.js');
  if (/type\s*=\s*["']module["']/.test(html)) fail('出现 type="module"（file:// 下会白屏）');
  else ok('未使用 type="module"');
}

// ── 7. 全局命名空间干净 ────────────────────────────────────────
console.log('\n[7/9] 全局命名空间只有 window.ADV');
if (!jsFiles) skip('js/ 目录不存在');
else {
  let hit = null;
  jsFiles.forEach((f) => {
    const code = stripNonCode(jsSources[f]);
    [...code.matchAll(/(?:window|globalThis)\.([A-Za-z_$][\w$]*)\s*=/g)].forEach((m) => {
      if (m[1] !== 'ADV' && !hit) hit = `${f}: window.${m[1]}`;
    });
  });
  if (hit) fail(hit + ' —— 禁止往 window 直接挂其它变量');
  else ok('除 ADV 外没有给 window 赋值');
}

// ── 8. 本次改动已 commit ───────────────────────────────────────
console.log('\n[8/9] 改动已 commit（提交链是证据链）');
try {
  const out = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' }).trim();
  const dirty = out.split('\n').filter(Boolean).filter((l) => !/^\?\?\s+docs\//.test(l));
  if (dirty.length) fail(`有 ${dirty.length} 项未提交的改动（文档改动允许暂存）`);
  else ok('工作区干净');
} catch (e) {
  skip('不在 git 仓库中');
}

// ── 9. 总表与代码一致（只警告，不阻断）─────────────────────────
console.log('\n[9/9] 内容总表与代码一致（ADR-0016：只警告，不阻断自主新增权）');
const ENTITIES = ['dragon', 'phoenix', 'panda', 'fox', 'turtle', 'wolf',
  'grass', 'volcano', 'glacier', 'thorn',
  'slime', 'archer', 'ironGolem',
  'lavaTitan', 'frostKing', 'shadowLord', 'dash', 'guard', 'slash'];
const promptSrc = read(path.join(DOCS, 'PROMPT.md'));
if (!jsFiles || !promptSrc) {
  skip('docs/PROMPT.md 或 js/ 未就绪');
} else {
  const allJs = jsFiles.map((f) => jsSources[f]).join('\n');
  const inCode = ENTITIES.filter((e) => new RegExp(`['"\`]${e}['"\`]`).test(allJs));
  const tableStart = promptSrc.indexOf('### 9.2');
  const tableEnd = promptSrc.indexOf('### 9.4');
  const table = tableStart >= 0 ? promptSrc.slice(tableStart, tableEnd > 0 ? tableEnd : undefined) : '';
  const unregistered = inCode.filter((e) => !table.includes('`' + e + '`'));
  if (unregistered.length) {
    warn(`代码里有、总表里没有：${unregistered.join(', ')} —— 请登记进 §9.3（自主新增是允许的，但必须留痕）`);
  } else {
    ok(`代码中的 ${inCode.length} 个实体均已在总表登记`);
  }
}

// ── 汇总 ───────────────────────────────────────────────────────
console.log('\n' + '='.repeat(46));
if (errors.length) {
  console.log(`\n\u2717 阻断：${errors.length} 项未通过，${passed} 项通过`);
  console.log('\n必须修复后才能 commit：');
  errors.forEach((e) => console.log('  - ' + e));
  if (warnings.length) warnings.forEach((w) => console.log('  ! ' + w));
  console.log('');
  process.exit(1);
} else {
  console.log(`\n\u2713 通过：${passed} 项检查全部通过`);
  if (warnings.length) {
    console.log(`\n${warnings.length} 条警告（不阻断）：`);
    warnings.forEach((w) => console.log('  ! ' + w));
  }
  console.log('');
  process.exit(0);
}
