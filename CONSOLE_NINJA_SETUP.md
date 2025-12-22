# Console Ninja Setup for Claude Code Access

Console Ninja will let Claude see your browser console logs automatically.

## Installation

1. **Install VS Code Extension:**
   - Open VS Code
   - Press `Cmd+Shift+X` to open Extensions
   - Search for "Console Ninja"
   - Click Install on "Console Ninja" by Wallaby.js

2. **Or install via command palette:**
   - Press `Cmd+Shift+P`
   - Type: "Extensions: Install Extensions"
   - Search "Console Ninja"

## Configuration

Console Ninja works automatically once installed. It will:
- Show inline console logs in your code
- Display runtime values
- Show errors and warnings
- Log network requests

## For Claude Code Access

Once installed, Console Ninja creates log files that Claude can read at:
```
~/.console-ninja/logs/
```

## Verify It's Working

1. Open your project in VS Code
2. Start your dev server: `npx wrangler pages dev dist`
3. Open your app in the browser
4. Look for Console Ninja output in VS Code's Output panel
5. Select "Console Ninja" from the dropdown

## Alternative: Use Chrome DevTools Protocol

If Console Ninja doesn't work, you can use CDP:
```bash
# Start Chrome with debugging enabled
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

Then Claude can connect to port 9222 to read console logs.
