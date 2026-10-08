#!/bin/bash
# Seoul.is Auto Deploy Script
# Run from MacBook via cron: generates articles, builds, and deploys to VPS

set -e

WORKDIR="/Users/mattkim/Library/Application Support/Genspark Claw/users/8cad050e-8610-4643-99d2-2a12d8c58b66/workspace/seoul-is"
VPS_HOST="root@76.13.183.93"
VPS_PASS="9PI/2PHo6)p.uT0b-X6k"
LOG="/tmp/seoul-is-deploy.log"

echo "$(date): Starting seoul.is deploy" >> "$LOG"

# 1. Generate new articles
cd "$WORKDIR"
node scripts/crawl-articles.mjs >> "$LOG" 2>&1

# 2. Build
node node_modules/.bin/astro build >> "$LOG" 2>&1

# 3. Package
tar -czf /tmp/seoul-dist.tar.gz -C "$WORKDIR/dist" .

# 4. Deploy to VPS
expect << EOF
spawn scp -o StrictHostKeyChecking=no /tmp/seoul-dist.tar.gz ${VPS_HOST}:/tmp/
expect "password:"
send "${VPS_PASS}\r"
expect eof
EOF

expect << EOF
spawn ssh -o StrictHostKeyChecking=no ${VPS_HOST}
expect "password:"
send "${VPS_PASS}\r"
expect "\$"
send "cd /opt/seoul-is/public && rm -rf * && tar --warning=no-unknown-keyword -xzf /tmp/seoul-dist.tar.gz && echo DEPLOY_OK\r"
expect "DEPLOY_OK"
send "exit\r"
EOF

echo "$(date): Deploy complete" >> "$LOG"
