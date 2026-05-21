# DailyDeck

DailyDeck is a lightweight Windows clipboard companion. It keeps recent copied text locally, lets you favorite and name useful snippets, and provides a quick paste panel for fast search and reuse.

## Features

- Local clipboard history for text content.
- Favorite and pin important clipboard items.
- Rename saved items so websites, tokens, notes, and snippets are easier to search.
- Search by saved name, clipboard content, or content type.
- Quick Paste panel with `Ctrl + Shift + V`, then search and press `Enter` to copy the selected item.
- Optional AI Split powered by DeepSeek for extracting keywords, entities, tasks, and semantic segments from one clipboard item.

## Privacy

DailyDeck is local-first.

- Clipboard history and settings are stored on your machine in `%APPDATA%\DailyDeck\dailydeck.json`.
- DeepSeek API Key is optional and is saved only in the local app settings file.
- The repository does not need an API Key to build, test, or run.
- Do not commit real keys, tokens, or private clipboard exports.

## DeepSeek API Key

AI Split works only when a DeepSeek API Key is configured. The rest of the app works normally without it.

Open DailyDeck, find **AI Split 拆词配置**, then enter:

- API Key: your own DeepSeek key.
- Model ID: defaults to `deepseek-v4-flash`.

Click **保存配置**. Use **清空 Key** to remove the local key.

## Development

Install dependencies:

```powershell
npm.cmd install
```

Run tests:

```powershell
npm.cmd test
```

Run type checks:

```powershell
npm.cmd run typecheck
```

Build the app:

```powershell
npm.cmd run build
```

Package a Windows installer:

```powershell
npm.cmd run dist
```

## Windows Install

The generated installer is created under `installer/`. To install to a custom directory such as `D:\Programs\DailyDeck`, run the installer and choose that path, or use NSIS silent install syntax:

```powershell
Start-Process ".\installer\DailyDeck Setup 0.1.0.exe" -ArgumentList "/S", "/D=D:\Programs\DailyDeck" -Wait
```

## Tech Stack

- Electron
- React
- TypeScript
- Vite
- Vitest
