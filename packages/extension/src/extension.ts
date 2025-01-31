import * as vscode from 'vscode';
import { RemoteFileExplorerProvider } from './remoteFileExplorerProvider';
import { RemoteFileService } from './services/remoteFileService';
import { MainPanel } from './webview/mainPanel';

export function activate(context: vscode.ExtensionContext) {
  const remoteFileService = new RemoteFileService();
  const remoteFileExplorerProvider = new RemoteFileExplorerProvider(remoteFileService);
  
  // Show main panel by default
  MainPanel.render(context.extensionUri);

  // Register views
  vscode.window.registerTreeDataProvider('remoteFileExplorerView', remoteFileExplorerProvider);

  // Register commands
  let disposable = vscode.commands.registerCommand('remoteFileExplorer.refresh', () => {
    remoteFileExplorerProvider.refresh();
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('remoteFileExplorer.openFile', async (fileItem) => {
    await remoteFileExplorerProvider.openFile(fileItem);
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('remoteFileExplorer.copyContent', async (fileItem) => {
    await remoteFileExplorerProvider.copyContent(fileItem);
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('remoteFileExplorer.downloadFile', async (fileItem) => {
    await remoteFileExplorerProvider.downloadFile(fileItem);
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('remoteFileExplorer.setServerUrl', async () => {
    MainPanel.render(context.extensionUri);
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {}
