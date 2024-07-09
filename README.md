# Puppeteer Screenshot Script

This script takes screenshots of web pages using Puppeteer, with options for viewport size and full-page screenshots. It also hide cookie banners using PuppeteerBlocker.

## Installation

```bash
npm install
```

## Usage

```bash
npx ts-node src/take_screenshot.ts <url> [filename] [--width <width>] [--height <height>] [--fullPage]
```

## Parameters

- `<url>`: The URL of the web page to screenshot (required).
- `[filename]`: The name of the file to save the screenshot as (optional, default: `screenshot.jpg`).
- `--width <width>`: The width of the viewport (optional, default: `1920`).
- `--height <height>`: The height of the viewport (optional, default: `1080`).
- `--fullPage`: Take a full-page screenshot (optional, default: `false`).
