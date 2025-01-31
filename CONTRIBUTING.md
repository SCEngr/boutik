# Contributing to Boutik

## Technology Stack

- **Runtime Environment**: Node.js (v14+)
- **Package Manager**: Bun
- **Framework**: VSCode Extension API
- **Language**: TypeScript
- **Development Tools**:
  - VSCode for IDE
  - ESLint for code linting
  - TypeScript compiler
  - Bun for build and development
  - Wrangler for Cloudflare Workers development

## Project Structure

```
boutik/
├── packages/                      # Monorepo packages
│   ├── extension/                # Main VSCode extension package
│   │   ├── media/               # Media assets
│   │   │   └── boutik.png      # Extension icon
│   │   ├── src/                # Source code
│   │   │   ├── extension.ts    # Extension entry point
│   │   │   ├── remoteFileExplorerProvider.ts  # Tree view provider
│   │   │   ├── services/      # Service layer
│   │   │   │   └── remoteFileService.ts  # Remote file operations
│   │   │   └── webview/       # WebView related
│   │   │       └── mainPanel.ts  # Main panel implementation
│   │   ├── package.json       # Extension package config
│   │   └── tsconfig.json      # TypeScript config
│   │
│   ├── dir-to-json/           # Directory to JSON converter package
│   │   ├── bin/              # Binary executables
│   │   ├── lib/              # Compiled JavaScript
│   │   ├── src/              # TypeScript source
│   │   └── package.json      # Package config
│   │
│   ├── node-file-server/      # File server implementation
│   │   ├── bin/              # Binary executables
│   │   ├── lib/              # Compiled JavaScript
│   │   ├── test/             # Test files
│   │   └── package.json      # Package config
│   │
│   └── worker/               # Cloudflare Workers implementation
│       ├── src/              # Source code
│       │   ├── index.ts      # Entry point
│       │   ├── worker.ts     # Worker implementation
│       │   └── worker.js     # Compiled worker
│       ├── package.json      # Package config
│       └── wrangler.toml     # Cloudflare Workers config
│
├── hub/                       # Hub related resources
├── .vscode/                  # VSCode configuration
├── .github/                  # GitHub workflows and templates
├── tsconfig.json             # Root TypeScript configuration
├── package.json              # Root package configuration
└── bun.lockb                # Dependency lock file

## Development Commands

- `bun run build`: Build the extension
- `bun run build:extension`: Build only the extension package
- `bun run dev`: Start development mode
- `bun run dev:extension`: Start development mode for extension
