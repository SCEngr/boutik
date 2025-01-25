import * as vscode from 'vscode';
import { RemoteFile, RemoteFileService } from './services/remoteFileService';

export class RemoteFileExplorerProvider implements vscode.TreeDataProvider<FileItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> = new vscode.EventEmitter<FileItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;
    
    public readonly remoteFileService: RemoteFileService;

    constructor() {
        this.remoteFileService = new RemoteFileService();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FileItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: FileItem): Promise<FileItem[]> {
        try {
            let files: RemoteFile[];
            
            if (!element) {
                // Root level
                files = await this.remoteFileService.getFiles();
            } else {
                // Child level - use the children from the parent
                files = element.file.children || [];
            }

            return files.map(file => {
                const treeItem = new FileItem(
                    file.name,
                    file.type === 'directory' 
                        ? vscode.TreeItemCollapsibleState.Collapsed 
                        : vscode.TreeItemCollapsibleState.None,
                    file
                );

                // 只为文件设置点击命令，目录点击时自动展开/折叠
                if (file.type === 'file') {
                    treeItem.command = {
                        command: 'remoteFileExplorer.openFile',
                        title: 'Preview File',
                        arguments: [file]
                    };
                }

                return treeItem;
            });
        } catch (error) {
            vscode.window.showErrorMessage('Failed to load remote files');
            return [];
        }
    }
}

export class FileItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly file: RemoteFile
    ) {
        super(label, collapsibleState);
        
        // Set icon based on file type
        this.iconPath = this.file.type === 'directory' 
            ? new vscode.ThemeIcon('folder')
            : new vscode.ThemeIcon('file');

        // Set tooltip with additional information
        this.tooltip = `${this.label}\nLast Modified: ${new Date(this.file.lastModified).toLocaleString()}`;

        // Set contextValue for menus
        this.contextValue = this.file.type;
    }
}
