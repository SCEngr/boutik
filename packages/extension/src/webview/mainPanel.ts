import * as vscode from 'vscode';

export class MainPanel {
  public static currentPanel: MainPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, serverUrl: string | undefined) {
    this._panel = panel;
    this._panel.webview.html = this._getWebviewContent(serverUrl || '');
    this._setWebviewMessageListener(this._panel.webview);

    // Handle panel disposal
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  public static render(extensionUri: vscode.Uri) {
    const serverUrl = vscode.workspace.getConfiguration('boutik').get<string>('serverUrl');

    if (MainPanel.currentPanel) {
      // Check if panel is disposed
      try {
        MainPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        MainPanel.currentPanel._updateContent(serverUrl || '');
      } catch (error) {
        // If panel is disposed, create a new one
        MainPanel.currentPanel = undefined;
      }
    }
    
    if (!MainPanel.currentPanel) {
      const panel = vscode.window.createWebviewPanel(
        'boutikMain',
        'Boutik',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      MainPanel.currentPanel = new MainPanel(panel, serverUrl);
    }
  }

  private _updateContent(serverUrl: string) {
    this._panel.webview.html = this._getWebviewContent(serverUrl);
  }

  private _getWebviewContent(serverUrl: string) {
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            padding: 20px;
            color: var(--vscode-foreground);
            font-family: var(--vscode-font-family);
          }
          .container {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .input-group {
            display: flex;
            gap: 10px;
          }
          input {
            flex: 1;
            padding: 8px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
          }
          button {
            padding: 8px 16px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 2px;
            cursor: pointer;
          }
          button:hover {
            background: var(--vscode-button-hoverBackground);
          }
          .gear-button {
            position: absolute;
            top: 10px;
            right: 10px;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 5px;
          }
          .gear-icon {
            width: 16px;
            height: 16px;
            fill: var(--vscode-foreground);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <button class="gear-button" id="settingsButton">
            <svg class="gear-icon" viewBox="0 0 16 16">
              <path d="M9.1 4.4L8.6 2H7.4l-.5 2.4-.7.3-2-1.3-.9.8 1.3 2-.2.7-2.4.5v1.2l2.4.5.3.8-1.3 2 .8.8 2-1.3.8.3.4 2.3h1.2l.5-2.4.8-.3 2 1.3.8-.8-1.3-2 .3-.8 2.3-.4V7.4l-2.4-.5-.3-.8 1.3-2-.8-.8-2 1.3-.7-.2zM8 9.5A1.5 1.5 0 1 1 8 6.5a1.5 1.5 0 0 1 0 3z"/>
            </svg>
          </button>
          <h2>Connect to File Server</h2>
          <div class="input-group">
            <input type="text" id="serverUrl" placeholder="Enter server URL" value="${serverUrl}">
            <button id="connectButton">Connect</button>
          </div>
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          
          document.getElementById('connectButton').addEventListener('click', () => {
            const url = document.getElementById('serverUrl').value;
            vscode.postMessage({
              command: 'connect',
              url: url
            });
          });

          document.getElementById('settingsButton').addEventListener('click', () => {
            vscode.postMessage({
              command: 'openSettings'
            });
          });
        </script>
      </body>
    </html>`;
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'connect':
            try {
              new URL(message.url); // Validate URL
              await vscode.workspace.getConfiguration('boutik').update('serverUrl', message.url, true);
              vscode.commands.executeCommand('remoteFileExplorer.refresh');
              vscode.window.showInformationMessage('Connected to server successfully');
            } catch (error) {
              vscode.window.showErrorMessage('Invalid server URL');
            }
            break;
          case 'openSettings':
            vscode.commands.executeCommand('workbench.action.openSettings', 'boutik');
            break;
        }
      },
      undefined,
      this._disposables
    );
  }

  public dispose() {
    MainPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
