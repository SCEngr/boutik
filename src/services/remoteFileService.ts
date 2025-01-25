import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import { URL } from "url";
import { FileItem } from '../remoteFileExplorerProvider';

export interface RemoteFile {
  name: string;
  type: "file" | "directory";
  path?: string;
  url?: string;
  size: number;
  lastModified: string;
  children?: RemoteFile[];
}

export class RemoteFileService {
  private apiUrl = "http://localhost:9988"; // Test server endpoint

  async getFiles(): Promise<RemoteFile[]> {
    try {
      const response = await this.makeRequest(this.apiUrl);
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to fetch files:", error);
      throw new Error("Failed to fetch remote files");
    }
  }

  async downloadFile(fileItem: FileItem | RemoteFile, targetPath: string): Promise<void> {
    try {
      const file = 'file' in fileItem ? fileItem.file : fileItem;
      
      if (!file || !file.type || !file.name) {
        throw new Error("Invalid file data");
      }

      if (file.type !== 'file') {
        throw new Error("Cannot download a directory");
      }

      if (!file.path && !file.url) {
        throw new Error("File path is missing");
      }

      const filePath = file.path || file.url;
      if (!filePath) {
        throw new Error("File path is missing");
      }

      const fileUrl = this.buildUrl(filePath);
      const response = await this.makeRequest(fileUrl);
      const data = JSON.parse(response);
      const content = data.content || response;
      
      // Check if content is empty or only contains whitespace
      if (!content || (typeof content === 'string' && content.trim() === '')) {
        throw new Error("File content is empty");
      }
      
      fs.writeFileSync(path.join(targetPath, file.name), content);
    } catch (error: unknown) {
      console.error("Failed to download file:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const fileName = ('file' in fileItem ? fileItem.file.name : fileItem.name) || 'file';
      throw new Error(`Failed to download ${fileName}: ${errorMessage}`);
    }
  }

  async previewFile(fileItem: FileItem | RemoteFile): Promise<string> {
    try {
      const file = 'file' in fileItem ? fileItem.file : fileItem;
      
      if (!file || !file.type || !file.name) {
        throw new Error("Invalid file data");
      }

      if (file.type !== 'file') {
        throw new Error("Cannot preview a directory");
      }

      if (!file.path && !file.url) {
        throw new Error("File path is missing");
      }

      const filePath = file.path || file.url;
      if (!filePath) {
        throw new Error("File path is missing");
      }

      const fileUrl = this.buildUrl(filePath);
      let response: string;
      try {
        response = await this.makeRequest(fileUrl);
      } catch (error) {
        throw new Error(`Failed to fetch file content: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Check if response is empty
      if (!response || response.trim() === '') {
        return '(Empty file)';
      }

      try {
        const data = JSON.parse(response);
        // If parsing succeeds and has content field, return content
        if (data && typeof data.content === "string") {
          // Return placeholder text if content is empty
          return data.content.trim() === '' ? '(Empty file)' : data.content;
        }
      } catch (e) {
        // If parsing fails, return the raw response as it might be the actual content
        return response;
      }

      // If we got here, we have JSON data but no content field, return the formatted JSON
      return response;
    } catch (error: unknown) {
      console.error("Failed to preview file:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const fileName = ('file' in fileItem ? fileItem.file.name : fileItem.name) || 'file';
      throw new Error(`Failed to preview ${fileName}: ${errorMessage}`);
    }
  }

  private buildUrl(urlPath?: string): string {
    if (!urlPath) {
      return this.apiUrl;
    }

    // 如果是完整的 URL，直接返回
    if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
      return urlPath;
    }

    // 确保路径以 / 开头
    const normalizedPath = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
    return `${this.apiUrl}${normalizedPath}`;
  }

  private makeRequest(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const parsedUrl = new URL(url);
        const requestModule = parsedUrl.protocol === "https:" ? https : http;

        requestModule
          .get(url, (res) => {
            if (res.statusCode !== 200) {
              reject(
                new Error(`Request failed with status code ${res.statusCode}`)
              );
              return;
            }

            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => resolve(data));
          })
          .on("error", reject);
      } catch (error) {
        reject(new Error(`Invalid URL: ${url}`));
      }
    });
  }
}
