import * as vscode from 'vscode';
import { RemoteFile, RemoteFileService } from './services/remoteFileService';

export class FileItem extends vscode.TreeItem {
  constructor(
    public readonly file: RemoteFile,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(file.name, collapsibleState);
    this.tooltip = file.path || file.name;
    this.contextValue = file.type;

    if (file.type === 'file') {
      this.command = {
        command: 'remoteFileExplorer.openFile',
        title: 'Open File',
        arguments: [this],
      };
    }
  }
}

export class RemoteFileExplorerProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private remoteFileService: RemoteFileService) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: FileItem): Promise<FileItem[]> {
    if (!element) {
      // Root level
      const files = await this.remoteFileService.getFiles();
      return this.createTreeItems(files);
    } else if (element.file.type === 'directory' && element.file.children) {
      // Directory level
      return this.createTreeItems(element.file.children);
    }
    return [];
  }

  private createTreeItems(files: RemoteFile[]): FileItem[] {
    return files.map(file => {
      const collapsibleState = file.type === 'directory'
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None;
      return new FileItem(file, collapsibleState);
    });
  }

  async openFile(item: FileItem): Promise<void> {
    if (!item || item.file.type !== 'file') {
      return;
    }

    try {
      const content = await this.remoteFileService.previewFile(item.file);
      if (!content) {
        throw new Error('No content received');
      }

      const doc = await vscode.workspace.openTextDocument({
        language: this.getLanguageId(item.file.name),
        content: typeof content === 'string' ? content : JSON.stringify(content, null, 2),
      });

      await vscode.window.showTextDocument(doc, {
        preview: true,
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: true,
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async downloadFile(item: FileItem): Promise<void> {
    if (!item || item.file.type !== 'file') {
      return;
    }

    try {
      if (!vscode.workspace.workspaceFolders) {
        throw new Error('No workspace folder open');
      }

      const targetPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
      await this.remoteFileService.downloadFile(item.file, targetPath);
      vscode.window.showInformationMessage(`File ${item.file.name} downloaded successfully`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to download file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getLanguageId(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const languageMap: { [key: string]: string } = {
      ts: 'typescript',
      js: 'javascript',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      swift: 'swift',
      kt: 'kotlin',
      rb: 'ruby',
      php: 'php',
      html: 'html',
      htm: 'html',
      xml: 'xml',
      md: 'markdown',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      less: 'less',
      ini: 'ini',
      conf: 'ini',
      properties: 'properties',
      env: 'properties',
      sh: 'shellscript',
      bash: 'shellscript',
      bat: 'bat',
      ps1: 'powershell',
      sql: 'sql',
      txt: 'plaintext',
      log: 'plaintext',
    };

    return languageMap[ext] || 'plaintext';
  }
}
