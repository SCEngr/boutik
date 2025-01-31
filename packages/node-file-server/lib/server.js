const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

class FileServer {
    constructor(options = {}) {
        this.port = options.port || 9989;
        this.rootDir = options.rootDir || process.cwd();
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    setupRoutes() {
        // Handle all paths
        this.app.get('*', async (req, res) => {
            try {
                const relativePath = req.path === '/' ? '' : req.path;
                const targetPath = path.join(this.rootDir, relativePath);
                
                if (!fs.existsSync(targetPath)) {
                    return res.status(404).json({ error: 'Path not found' });
                }

                const stats = await fs.promises.stat(targetPath);
                
                if (stats.isDirectory()) {
                    // If it's a directory, return its structure
                    const structure = await this.getFileStructure(targetPath, relativePath);
                    res.json(structure);
                } else {
                    // If it's a file, return its content and info
                    const fileInfo = await this.getFileInfo(targetPath, relativePath);
                    const content = await fs.promises.readFile(targetPath, 'utf-8');
                    res.json({
                        ...fileInfo,
                        content
                    });
                }
            } catch (error) {
                console.error('Error processing request:', error);
                res.status(500).json({ error: error.message });
            }
        });
    }

    async getFileInfo(filePath, relativePath) {
        const stats = await fs.promises.stat(filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        return {
            name: path.basename(filePath),
            type: stats.isDirectory() ? 'directory' : 'file',
            path: relativePath,
            url: relativePath,
            size: stats.size,
            lastModified: stats.mtime,
            created: stats.birthtime,
            extension: ext ? ext.slice(1) : null,
            mode: stats.mode,
            isSymbolicLink: stats.isSymbolicLink(),
            permissions: {
                readable: await this.isReadable(filePath),
                writable: await this.isWritable(filePath),
                executable: await this.isExecutable(filePath)
            }
        };
    }

    async getFileStructure(dirPath, relativePath = '') {
        const items = await fs.promises.readdir(dirPath);
        const structure = [];

        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const itemRelativePath = path.join(relativePath, item);

            // Skip hidden files and node_modules
            if (item.startsWith('.') || item === 'node_modules') {
                continue;
            }

            try {
                const fileInfo = await this.getFileInfo(fullPath, itemRelativePath);

                if (fileInfo.type === 'directory') {
                    const children = await this.getFileStructure(fullPath, itemRelativePath);
                    fileInfo.children = children;
                }

                structure.push(fileInfo);
            } catch (error) {
                console.error(`Error processing ${fullPath}:`, error);
                continue;
            }
        }

        return structure;
    }

    async isReadable(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.R_OK);
            return true;
        } catch {
            return false;
        }
    }

    async isWritable(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.W_OK);
            return true;
        } catch {
            return false;
        }
    }

    async isExecutable(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.X_OK);
            return true;
        } catch {
            return false;
        }
    }

    start() {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.port, () => {
                resolve(this.port);
            });
        });
    }

    stop() {
        if (this.server) {
            this.server.close();
        }
    }
}

module.exports = FileServer;
