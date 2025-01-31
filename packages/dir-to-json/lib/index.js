const fs = require('fs').promises;
const path = require('path');

class DirToJson {
    constructor(options = {}) {
        this.excludes = options.excludes || ['.git', 'node_modules'];
        this.includeContent = options.includeContent || false;
        this.maxContentSize = options.maxContentSize || 1024 * 1024; // 1MB
    }

    async processDirectory(dirPath) {
        const items = await fs.readdir(dirPath);
        const structure = [];

        for (const item of items) {
            // Skip excluded items
            if (this.excludes.includes(item) || item.startsWith('.')) {
                continue;
            }

            const fullPath = path.join(dirPath, item);
            try {
                const stats = await fs.stat(fullPath);
                const fileInfo = {
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
                        fileInfo.error = `Failed to read content: ${error.message}`;
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

    async convert(dirPath) {
        try {
            const absolutePath = path.resolve(dirPath);
            const stats = await fs.stat(absolutePath);
            
            if (!stats.isDirectory()) {
                throw new Error('Path is not a directory');
            }

            return await this.processDirectory(absolutePath);
        } catch (error) {
            throw new Error(`Failed to convert directory: ${error.message}`);
        }
    }
}

module.exports = DirToJson;
