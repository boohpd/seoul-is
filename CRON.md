# Seoul.is Cron Automation

## OpenClaw Cron (Recommended)

To run the article crawler + deploy daily at 9 PM KST (noon UTC), add this to your OpenClaw cron:

### Option A: Via OpenClaw settings UI
- Go to Settings → Cron Jobs → Add
- Schedule: `0 12 * * *` (noon UTC = 9 PM KST)
- Command: `bash "/Users/mattkim/Library/Application Support/Genspark Claw/users/8cad050e-8610-4643-99d2-2a12d8c58b66/workspace/seoul-is/scripts/deploy.sh"`

### Option B: macOS launchd (more reliable than cron on Mac)

Create `/Library/LaunchAgents/is.seoul.crawler.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>is.seoul.crawler</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/mattkim/Library/Application Support/Genspark Claw/users/8cad050e-8610-4643-99d2-2a12d8c58b66/workspace/seoul-is/scripts/deploy.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>21</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/seoul-is-deploy.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/seoul-is-deploy-err.log</string>
</dict>
</plist>
```

Load it with:
```bash
launchctl load ~/Library/LaunchAgents/is.seoul.crawler.plist
```

### Option C: macOS crontab (simplest)
```bash
crontab -e
# Add this line:
0 21 * * * bash "/Users/mattkim/Library/Application Support/Genspark Claw/users/8cad050e-8610-4643-99d2-2a12d8c58b66/workspace/seoul-is/scripts/deploy.sh" >> /tmp/seoul-is-deploy.log 2>&1
```

## Notes
- The script skips already-existing slugs, so running daily only adds NEW articles
- To add more topics, edit the TOPICS array in `scripts/crawl-articles.mjs`
- Logs are written to `/tmp/seoul-is-deploy.log`
