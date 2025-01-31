import { promises as fs } from 'fs';
import path from 'path';

export interface DirToJsonOptions {
  excludes?: string[];
  includeContent?: boolean;
  maxContentSize?: number;
}

export interface FileInfo {
  name: string;
  type: 'directory' | 'file';
  size: number;
  lastModified: string;
  children?: FileInfo[];
  content?: string;
  error?: string;
}

export class DirToJson {
  private excludes: string[];
  private includeContent: boolean;
  private maxContentSize: number;

  constructor(options: DirToJsonOptions = {}) {
    this.excludes = options.excludes || ['.git', 'node_modules'];
    this.includeContent = options.includeContent || false;
    this.maxContentSize = options.maxContentSize || 1024 * 1024; // 1MB
  }

  async processDirectory(dirPath: string): Promise<FileInfo[]> {
    const items = await fs.readdir(dirPath);
    const structure: FileInfo[] = [];

    for (const item of items) {
      // Skip excluded items
      if (this.excludes.includes(item) || item.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(dirPath, item);
      try {
        const stats = await fs.stat(fullPath);
        const fileInfo: FileInfo = {
          name: item,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          lastModified: stats.mtime.toISOString()
        };

        if (stats.isDirectory()) {
          fileInfo.children = await this.processDirectory(fullPath);
        } else if (this.includeContent && stats.size <= this.maxContentSize) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            fileInfo.content = content;
          } catch (error) {
            if (error instanceof Error) {
              fileInfo.error = `Failed to read content: ${error.message}`;
            }
          }
        }

        structure.push(fileInfo);
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
        continue;
      }
    }

    return structure;
  }

  async toJson(dirPath: string): Promise<FileInfo[]> {
    return this.processDirectory(dirPath);
  }
}
