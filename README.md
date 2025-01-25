# Remote File Explorer VSCode Extension

A VSCode extension that allows you to browse, preview and download remote files.

## Features

- View remote files in a dedicated sidebar
- Preview files directly in VSCode
- Download files to your workspace
- Simple and intuitive interface

## Development Setup

1. Prerequisites
   - Node.js (v14 or higher)
   - VSCode
   - Git

2. Installation
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd vscode-remote-file-explorer

   # Install dependencies
   npm install
   ```

3. Development
   - Press F5 in VSCode to start debugging
   - This will open a new VSCode window with the extension loaded
   - Make changes to the code and press Ctrl+R (Cmd+R on macOS) in the debug window to reload

4. Debugging Tips
   - Use `console.log()` for basic debugging
   - Check the Debug Console in VSCode for logs
   - Use breakpoints by clicking on the left margin of the editor
   - Use the Debug view (Ctrl+Shift+D) to:
     - Step through code
     - Inspect variables
     - View call stack
     - Evaluate expressions

5. Testing Changes
   - The extension will automatically compile in watch mode
   - Changes will be reflected after reloading the debug window
   - Use the Command Palette (Ctrl+Shift+P) to test extension commands

6. Common Issues
   - If the extension is not showing up, check the Extensions view
   - If commands are not working, check the Developer Tools console (Help > Toggle Developer Tools)
   - Make sure all dependencies are installed correctly

## Building and Packaging

1. Build the extension:
   ```bash
   npm run compile
   ```

2. Package the extension:
   ```bash
   npm install -g vsce
   vsce package
   ```

This will create a .vsix file that can be installed in VSCode.

## Project Structure

- `src/extension.ts`: Main extension entry point
- `src/remoteFileExplorerProvider.ts`: Tree view provider for file explorer
- `src/services/remoteFileService.ts`: Service for handling remote file operations

## Configuration

Update the API endpoint in `src/services/remoteFileService.ts` to point to your remote file server:

```typescript
private apiUrl = 'https://your-api-endpoint.com/files';
```
