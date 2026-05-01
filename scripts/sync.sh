#!/bin/bash
set -e
VAULT="/root/.openclaw/workspace/llm-wiki"
cd "$VAULT"

# 拉取本地可能的更新（如果配置了 remote）
if git remote get-url origin >/dev/null 2>&1; then
    git pull --rebase origin main 2>/dev/null || true
fi

# 添加所有变更
git add -A

# 只在有变更时提交
if ! git diff --cached --quiet; then
    git commit -m "wiki sync: $(date '+%Y-%m-%d %H:%M')"
    
    # 如果配置了 remote 就推送
    if git remote get-url origin >/dev/null 2>&1; then
        git push origin main
    fi
fi
