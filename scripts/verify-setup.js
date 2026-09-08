#!/usr/bin/env node
/**
 * 校验 setup 是否完成：skill 是否装全、docs/agents 是否齐、AGENTS.md 的 Agent skills block 是否在位。
 *
 *   用法: node scripts/verify-setup.js
 *   退出码 0 = 全部通过；1 = 有阻断项（warnings 不阻断）。
 *
 * 只报事实，不改任何文件。Skill 缺失时提示重跑 scripts/install-skills.sh。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILL_SRC = path.join(ROOT, 'skill');

const failures = [];
const warnings = [];
let passed = 0;

const fail = (msg, fix) => failures.push({ msg, fix });
const ok = () => { passed += 1; };

// ---- 1. skill 安装完整性 ----

function candidateRoots() {
  const roots = [];
  if (process.env.SKILLS_DIR) roots.push(process.env.SKILLS_DIR);
  roots.push(
    path.join(ROOT, '.codebuddy/skills'),
    path.join(ROOT, '.claude/skills'),
    path.join(ROOT, '.cursor/skills'),
    path.join(os.homedir(), '.codebuddy/skills'),
    path.join(os.homedir(), '.claude/skills'),
    path.join(os.homedir(), '.cursor/skills'),
  );
  return roots;
}

function readFrontmatterName(file) {
  try {
    const txt = fs.readFileSync(file, 'utf8');
    const m = txt.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!m) return null;
    const a = m[1].match(/^name:\s*(.+)$/m);
    return a ? a[1].trim().replace(/^["']|["']$/g, '') : null;
  } catch {
    return null;
  }
}

/** 收集包内基线：name -> { group, dir } */
function expectedSkills() {
  const out = new Map();
  if (!fs.existsSync(SKILL_SRC)) return out;
  for (const group of fs.readdirSync(SKILL_SRC)) {
    const groupDir = path.join(SKILL_SRC, group);
    if (!fs.statSync(groupDir).isDirectory()) continue;
    for (const name of fs.readdirSync(groupDir)) {
      const dir = path.join(groupDir, name);
      if (!fs.statSync(dir).isDirectory()) continue;
      out.set(name, { group, dir });
    }
  }
  return out;
}

function checkSkills() {
  const expected = expectedSkills();
  if (expected.size === 0) {
    fail('包内 skill/ 为空——这个包被破坏了', '重新解压原始 handoff 包');
    return;
  }

  const roots = candidateRoots().filter((r) => fs.existsSync(r));
  const found = new Map(); // name -> root

  for (const root of roots) {
    for (const name of fs.readdirSync(root)) {
      const dir = path.join(root, name);
      if (!fs.statSync(dir).isDirectory()) continue;
      const sk = path.join(dir, 'SKILL.md');
      if (!fs.existsSync(sk)) continue;
      const declared = readFrontmatterName(sk);
      if (declared && expected.has(declared) && !found.has(declared)) {
        found.set(declared, root);
      }
    }
  }

  const missing = [...expected.keys()].filter((n) => !found.has(n));
  if (missing.length === 0) {
    ok();
    console.log(`  [ok] skill 安装完整：${expected.size}/${expected.size}`);
    const used = new Set([...found.values()]);
    for (const r of used) console.log(`       位置: ${r}`);
  } else {
    fail(
      `skill 未装全：缺 ${missing.length}/${expected.size} 个 —— ${missing.join(', ')}`,
      `bash scripts/install-skills.sh${roots.length === 0 ? '（未探测到任何 skills 目录，脚本会创建 .codebuddy/skills）' : ''}`,
    );
  }

  // frontmatter 合法性（包内源文件自检）
  const badFm = [];
  for (const [name, { dir }] of expected) {
    const sk = path.join(dir, 'SKILL.md');
    if (!fs.existsSync(sk)) { badFm.push(`${name}（无 SKILL.md）`); continue; }
    const declared = readFrontmatterName(sk);
    if (!declared) badFm.push(`${name}（frontmatter 无 name）`);
    else if (declared !== name) badFm.push(`${name}（frontmatter name 为 ${declared}）`);
  }
  if (badFm.length > 0) {
    warnings.push(`包内有 ${badFm.length} 个 skill 的 frontmatter 与目录名不一致：${badFm.join(', ')}`);
  }
}

// ---- 2. docs/agents 配置三件套 ----

function checkAgentDocs() {
  const required = [
    ['docs/agents/issue-tracker.md', 'issue tracker 约定'],
    ['docs/agents/triage-labels.md', 'triage label 映射'],
    ['docs/agents/domain.md', 'domain docs 布局'],
    ['docs/agents/skills-installed.md', 'skill 安装基线'],
  ];
  for (const [rel, what] of required) {
    if (fs.existsSync(path.join(ROOT, rel))) ok();
    else fail(`缺 ${rel}（${what}）`, '重跑 /setup-matt-pocock-skills 或从原始包恢复');
  }
}

// ---- 3. AGENTS.md 的 Agent skills block ----

function checkAgentsBlock() {
  const p = path.join(ROOT, 'AGENTS.md');
  if (!fs.existsSync(p)) { fail('缺 AGENTS.md', '从原始包恢复'); return; }
  const txt = fs.readFileSync(p, 'utf8');
  if (!/^## Agent skills\s*$/m.test(txt)) {
    fail('AGENTS.md 缺 `## Agent skills` block', '重跑 /setup-matt-pocock-skills');
    return;
  }
  const block = txt.split(/^## Agent skills\s*$/m)[1] || '';
  for (const [heading, ref] of [
    ['### Issue tracker', 'docs/agents/issue-tracker.md'],
    ['### Triage labels', 'docs/agents/triage-labels.md'],
    ['### Domain docs', 'docs/agents/domain.md'],
  ]) {
    const hasHeading = block.includes(heading);
    if (hasHeading && block.includes(ref)) ok();
    else if (!hasHeading) fail(`Agent skills block 缺 ${heading}`, '重跑 /setup-matt-pocock-skills');
    else fail(`${heading} 未指向 ${ref}`, '补上 See 链接');
  }
}

// ---- 4. 项目资产 ----

function checkAssets() {
  for (const [rel, fix] of [
    ['docs/PROMPT.md', '从原始包恢复'],
    ['docs/GLOSSARY.md', '从原始包恢复'],
    ['docs/RULES.md', '从原始包恢复'],
    ['docs/ADR.md', '从原始包恢复'],
    ['check.js', '从原始包恢复'],
    ['vendor/three.min.js', '从原始包恢复 three.js r128 UMD'],
  ]) {
    if (fs.existsSync(path.join(ROOT, rel))) ok();
    else fail(`缺 ${rel}`, fix);
  }
}

// ---- main ----

console.log('verify-setup — 校验 handoff 包的安装完整性\n');

checkSkills();
checkAgentDocs();
checkAgentsBlock();
checkAssets();

console.log('');
if (warnings.length > 0) {
  for (const w of warnings) console.log(`  [warn] ${w}`);
  console.log('');
}

if (failures.length === 0) {
  console.log(`全部通过（${passed} 项）。可以开始读 RUN-ONCE.md。`);
  process.exit(0);
}

console.log(`未通过 ${failures.length} 项（已通过 ${passed} 项）：\n`);
for (const f of failures) console.log(`  [FAIL] ${f.msg}\n         修法: ${f.fix}`);
process.exit(1);
