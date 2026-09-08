#!/usr/bin/env bash
# 安装 skill/ 下的全部 skill 到当前 harness 的 skills 目录。
#
#   用法: bash scripts/install-skills.sh [目标目录] [--global]
#
#   目标目录的探测顺序（第一个命中者胜出）：
#     1. $1                      显式传入
#     2. $SKILLS_DIR             环境变量
#     3. 项目级（--global 时跳过）  .codebuddy/skills → .claude/skills → .cursor/skills
#     4. 全局                     ~/.codebuddy/skills → ~/.claude/skills → ~/.cursor/skills
#     5. 兜底                     .codebuddy/skills（自动创建）
#
# 幂等：已存在的同名 skill 会被覆盖为包内版本。想保留现有版本时设 KEEP=1。
# 装完跑 `node scripts/verify-setup.js` 校验。

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILL_SRC="$ROOT/skill"

GLOBAL=0
ARG=""
for a in "$@"; do
  case "$a" in
    --global) GLOBAL=1 ;;
    *) ARG="$a" ;;
  esac
done

detect_target() {
  [ -n "$ARG" ] && { echo "$ARG"; return; }
  [ -n "${SKILLS_DIR:-}" ] && { echo "$SKILLS_DIR"; return; }
  if [ "$GLOBAL" -eq 0 ]; then
    for d in ".codebuddy/skills" ".claude/skills" ".cursor/skills"; do
      [ -d "$d" ] && { echo "$d"; return; }
    done
  fi
  for d in "$HOME/.codebuddy/skills" "$HOME/.claude/skills" "$HOME/.cursor/skills"; do
    [ -d "$d" ] && { echo "$d"; return; }
  done
  echo ".codebuddy/skills"
}

TARGET="$(detect_target)"
mkdir -p "$TARGET"
TARGET="$(cd "$TARGET" && pwd)"

[ -d "$SKILL_SRC" ] || { echo "找不到 $SKILL_SRC —— 请在包根目录下运行本脚本"; exit 1; }

echo "源:   $SKILL_SRC"
echo "目标: $TARGET"
echo

installed=0
skipped=0

for group_dir in "$SKILL_SRC"/*/; do
  [ -d "$group_dir" ] || continue
  for src in "$group_dir"*/; do
    [ -d "$src" ] || continue
    name="$(basename "$src")"
    if [ ! -f "$src/SKILL.md" ]; then
      echo "  跳过 $name（无 SKILL.md）"
      continue
    fi
    if [ -d "$TARGET/$name" ] && [ -n "${KEEP:-}" ]; then
      echo "  保留 $name（KEEP=1，已存在）"
      skipped=$((skipped + 1))
      continue
    fi
    if [ -d "$TARGET/$name" ]; then rm -rf "$TARGET/$name"; fi
    cp -R "$src" "$TARGET/$name"
    echo "  安装 $name"
    installed=$((installed + 1))
  done
done

echo
echo "已安装 $installed 个 skill${KEEP:+，保留 $skipped 个}"
echo
echo "下一步：node scripts/verify-setup.js"
