import * as vscode from "vscode";
import { RemoteFileExplorerProvider, FileItem } from "./remoteFileExplorerProvider";
import { RemoteFile } from "./services/remoteFileService";

export function activate(context: vscode.ExtensionContext) {
  const provider = new RemoteFileExplorerProvider();

  // Register the TreeDataProvider
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("remoteFileExplorerView", provider)
  );

  // Register refresh command
  context.subscriptions.push(
    vscode.commands.registerCommand("remoteFileExplorer.refresh", () => {
      provider.refresh();
    })
  );

  // Register file preview command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "remoteFileExplorer.openFile",
      async (item: RemoteFile) => {
        // 如果是目录，直接返回
        if (!item || item.type !== "file") {
          return;
        }

        try {
          const content = await provider.remoteFileService.previewFile(item);
          if (!content) {
            throw new Error("No content received");
          }

          // 根据文件扩展名确定语言模式
          const languageId = getLanguageIdFromFileName(item.name);

          // 创建新文档
          const doc = await vscode.workspace.openTextDocument({
            language: languageId,
            content:
              typeof content === "string"
                ? content
                : JSON.stringify(content, null, 2),
          });

          // 打开文档
          await vscode.window.showTextDocument(doc, {
            preview: true,
            viewColumn: vscode.ViewColumn.One,
            preserveFocus: true,
          });

          // 标记文档为预览模式
          vscode.commands.executeCommand("workbench.action.keepEditor");
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          vscode.window.showErrorMessage(
            `Failed to preview file: ${errorMessage}`
          );
        }
      }
    )
  );

  // Register file download command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "remoteFileExplorer.downloadFile",
      async (item: RemoteFile | FileItem) => {
        try {
          if (!vscode.workspace.workspaceFolders) {
            throw new Error("No workspace folder open");
          }

          const file = 'file' in item ? item.file : item;
          if (!file || file.type !== "file") {
            return;
          }

          const targetPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
          await provider.remoteFileService.downloadFile(item, targetPath);
          vscode.window.showInformationMessage(
            `File ${file.name} downloaded successfully`
          );
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const fileName = ('file' in item ? item.file.name : item.name) || 'file';
          vscode.window.showErrorMessage(
            `Failed to download file: ${fileName} - ${errorMessage}`
          );
        }
      }
    )
  );
}

export function deactivate() {}

// 添加获取语言ID的辅助函数
function getLanguageIdFromFileName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const languageMap: { [key: string]: string } = {
    // 编程语言
    ts: "typescript",
    js: "javascript",
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    go: "go",
    rs: "rust",
    swift: "swift",
    kt: "kotlin",
    rb: "ruby",
    php: "php",

    // 标记语言
    html: "html",
    htm: "html",
    xml: "xml",
    md: "markdown",
    json: "json",
    yaml: "yaml",
    yml: "yaml",

    // 样式表
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",

    // 配置文件
    ini: "ini",
    conf: "ini",
    properties: "properties",
    env: "properties",

    // 脚本
    sh: "shellscript",
    bash: "shellscript",
    bat: "bat",
    ps1: "powershell",

    // 其他
    sql: "sql",
    txt: "plaintext",
    log: "plaintext",
  };

  return languageMap[ext] || "plaintext";
}
